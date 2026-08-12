'use client';

import { Component, type ReactNode, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const PUBLIC_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

function resolvedPath(path: string) {
  return `${PUBLIC_BASE_PATH}${path}`;
}

export function preloadWorldModel(path: string) {
  useGLTF.preload(resolvedPath(path));
}

function getSceneObject(scene: THREE.Object3D, name: string) {
  return scene.getObjectByName(name) ?? scene.getObjectByName(name.replace(/[^a-zA-Z0-9_]/g, ''));
}

function frameRearMountains(scene: THREE.Object3D) {
  const leftMountain = getSceneObject(scene, 'Landscape.001');
  const rightMountain = getSceneObject(scene, 'Landscape.002');
  if (!leftMountain || !rightMountain) return;

  // Preserve the Blender-authored rotation, scale, and mesh detail. Only move the
  // two secondary peaks into the open side zones around the lake and tree group.
  leftMountain.position.x = -13.5;
  leftMountain.position.z = 0;
  rightMountain.position.x = 18.5;
  rightMountain.position.z = 0;
  scene.updateMatrixWorld(true);

  // The continuous snow base sits at y=2.35. Sink both broad mountain feet into
  // that exact world plane so neither peak floats and their bases remain level.
  const worldGroundY = 2.35;
  [leftMountain, rightMountain].forEach((mountain) => {
    const bounds = new THREE.Box3().setFromObject(mountain);
    mountain.position.y += worldGroundY - bounds.min.y;
    mountain.updateMatrixWorld(true);
  });
  scene.updateMatrixWorld(true);
}

export function WorldModelAsset({ path }: { path: string }) {
  const gltf = useGLTF(resolvedPath(path));
  const scene = useMemo(() => {
    const clonedScene = gltf.scene.clone(true);
    if (path.endsWith('/mountain.glb')) frameRearMountains(clonedScene);
    return clonedScene;
  }, [gltf.scene, path]);
  useEffect(() => {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const isTerrain = path.endsWith('/world-core.glb') || path.endsWith('/mountain.glb');
        const sourceMaterials = Array.isArray(object.material) ? object.material : [object.material];
        const materials = sourceMaterials.map((material) => material.clone());
        object.material = Array.isArray(object.material) ? materials : materials[0];
        object.castShadow = !isTerrain;
        object.receiveShadow = true;
        if (path.endsWith('/world-core.glb')) {
          materials.forEach((material) => {
            if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhysicalMaterial) {
              const name = material.name.toLowerCase();
              if (name.includes('ocean')) {
                material.side = THREE.FrontSide;
                material.color.set('#173e61');
                material.map = null;
                material.roughness = 0.24;
                material.metalness = 0.16;
              } else {
                material.side = THREE.FrontSide;
                material.color.set('#c1cdd2');
                material.map = null;
                material.normalMap = null;
                material.bumpMap = null;
                material.aoMap = null;
                material.emissiveMap = null;
                material.emissive.set('#000000');
                material.vertexColors = false;
                material.roughness = 0.92;
                material.metalness = 0;
              }
            }
            material.needsUpdate = true;
          });
        }
      }
    });
  }, [path, scene]);
  return (
    <group>
      <primitive object={scene} dispose={null} />
      {path.endsWith('/cabin.glb') && (
        <pointLight color="#ef9d52" intensity={2.4} distance={9} position={[-2.3, 4.2, 23.2]} />
      )}
    </group>
  );
}

function seeded(index: number, salt: number) {
  const value = Math.sin(index * 79.31 + salt * 19.17) * 43758.5453;
  return value - Math.floor(value);
}

type PrototypePart = {
  geometry: THREE.BufferGeometry;
  material: THREE.Material | THREE.Material[];
  relativeMatrix: THREE.Matrix4;
};

function VegetationPart({ part, count }: { part: PrototypePart; count: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const instance = new THREE.Matrix4();
    const rotation = new THREE.Matrix4();
    const scaleMatrix = new THREE.Matrix4();
    const translation = new THREE.Matrix4();
    const finalMatrix = new THREE.Matrix4();
    for (let index = 0; index < count; index += 1) {
      const side = index % 2 === 0 ? -1 : 1;
      const x = side * (6 + seeded(index, 2) * 10);
      const z = -13 + seeded(index, 3) * 27;
      const scale = 0.62 + seeded(index, 4) * 0.78;
      translation.makeTranslation(x, 0, z);
      rotation.makeRotationY(seeded(index, 5) * Math.PI * 2);
      scaleMatrix.makeScale(scale, scale, scale);
      instance.copy(translation).multiply(rotation).multiply(scaleMatrix);
      finalMatrix.copy(instance).multiply(part.relativeMatrix);
      ref.current.setMatrixAt(index, finalMatrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [count, part]);
  return <instancedMesh ref={ref} args={[part.geometry, part.material, count]} castShadow={false} receiveShadow={false} />;
}

export function WorldVegetationInstances({ path, count }: { path: string; count: number }) {
  const gltf = useGLTF(resolvedPath(path));
  const parts = useMemo(() => {
    gltf.scene.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(gltf.scene);
    const center = bounds.getCenter(new THREE.Vector3());
    const normalize = new THREE.Matrix4().makeTranslation(-center.x, -bounds.min.y, -center.z);
    const result: PrototypePart[] = [];
    gltf.scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      result.push({
        geometry: object.geometry,
        material: object.material,
        relativeMatrix: normalize.clone().multiply(object.matrixWorld),
      });
    });
    return result;
  }, [gltf.scene]);
  return <group>{parts.map((part, index) => <VegetationPart key={index} part={part} count={count} />)}</group>;
}

type ForegroundTransform = {
  prototype: string;
  position: [number, number, number];
  quaternion: [number, number, number, number];
  scale: [number, number, number];
};

type ForegroundData = {
  version: number;
  instances: ForegroundTransform[];
};

type NamedPrototypePart = PrototypePart & {
  prototype: string;
};

function ForegroundPart({ part, transforms }: { part: NamedPrototypePart; transforms: ForegroundTransform[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const instance = new THREE.Matrix4();
    const finalMatrix = new THREE.Matrix4();
    transforms.forEach((transform, index) => {
      position.fromArray(transform.position);
      quaternion.fromArray(transform.quaternion);
      scale.fromArray(transform.scale);
      instance.compose(position, quaternion, scale);
      finalMatrix.copy(instance).multiply(part.relativeMatrix);
      ref.current?.setMatrixAt(index, finalMatrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [part, transforms]);
  return <instancedMesh ref={ref} args={[part.geometry, part.material, transforms.length]} castShadow={false} receiveShadow frustumCulled={false} />;
}

function WorldPlacedInstances({ path, dataPath, quality }: { path: string; dataPath: string; quality: 'high' | 'low' }) {
  const gltf = useGLTF(resolvedPath(path));
  const rawData = useLoader(THREE.FileLoader, resolvedPath(dataPath)) as string;
  const data = useMemo(() => JSON.parse(rawData) as ForegroundData, [rawData]);
  const transformsByPrototype = useMemo(() => {
    const grouped = new Map<string, ForegroundTransform[]>();
    data.instances.forEach((transform, index) => {
      if (quality === 'low' && index % 2 !== 0) return;
      const current = grouped.get(transform.prototype) ?? [];
      current.push(transform);
      grouped.set(transform.prototype, current);
    });
    return grouped;
  }, [data, quality]);
  const parts = useMemo(() => {
    gltf.scene.updateMatrixWorld(true);
    const result: NamedPrototypePart[] = [];
    transformsByPrototype.forEach((_transforms, prototype) => {
      const normalizedName = prototype.replace(/[^a-zA-Z0-9_]/g, '');
      const root = gltf.scene.getObjectByName(prototype) ?? gltf.scene.getObjectByName(normalizedName);
      if (!root) return;
      root.updateMatrixWorld(true);
      const inverseRoot = root.matrixWorld.clone().invert();
      root.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const geometry = object.geometry.clone();
        geometry.morphAttributes = {};
        result.push({
          prototype,
          geometry,
          material: object.material,
          relativeMatrix: inverseRoot.clone().multiply(object.matrixWorld),
        });
      });
    });
    return result;
  }, [gltf.scene, transformsByPrototype]);
  return (
    <group>
      {parts.map((part, index) => (
        <ForegroundPart key={`${part.prototype}-${index}`} part={part} transforms={transformsByPrototype.get(part.prototype) ?? []} />
      ))}
    </group>
  );
}

export function WorldForegroundInstances({ path, quality }: { path: string; quality: 'high' | 'low' }) {
  return <WorldPlacedInstances path={path} dataPath="/models/foreground-instances.json" quality={quality} />;
}

export function WorldHeroTreeInstances({ path, quality }: { path: string; quality: 'high' | 'low' }) {
  return <WorldPlacedInstances path={path} dataPath="/models/hero-tree-instances.json" quality={quality} />;
}

type BoundaryProps = { children: ReactNode };
type BoundaryState = { failed: boolean };

export class WorldModelErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('[WorldTest] Optional GLB failed to load', error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
