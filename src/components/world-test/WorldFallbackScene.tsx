'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type Quality = 'high' | 'low';

function seeded(index: number, salt = 1) {
  const value = Math.sin(index * 91.71 + salt * 17.37) * 43758.5453;
  return value - Math.floor(value);
}

function PineForest({ quality }: { quality: Quality }) {
  const count = quality === 'high' ? 190 : 86;
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const crownRef = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const trunk = trunkRef.current;
    const crown = crownRef.current;
    if (!trunk || !crown) return;
    const matrix = new THREE.Matrix4();
    for (let index = 0; index < count; index += 1) {
      const side = index % 2 === 0 ? -1 : 1;
      const x = side * (5.5 + seeded(index, 3) * 9.2);
      const z = -14 + seeded(index, 4) * 28;
      const scale = 0.55 + seeded(index, 5) * 0.9;
      const y = -0.1 + seeded(index, 6) * 0.12;
      matrix.makeScale(scale, scale, scale);
      matrix.setPosition(x, y + 0.7 * scale, z);
      trunk.setMatrixAt(index, matrix);
      matrix.makeScale(scale, scale, scale);
      matrix.setPosition(x, y + 2.25 * scale, z);
      crown.setMatrixAt(index, matrix);
    }
    trunk.instanceMatrix.needsUpdate = true;
    crown.instanceMatrix.needsUpdate = true;
  }, [count]);
  return (
    <group>
      <instancedMesh ref={trunkRef} args={[undefined, undefined, count]} castShadow receiveShadow>
        <cylinderGeometry args={[0.09, 0.14, 1.5, 6]} />
        <meshStandardMaterial color="#443e3c" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={crownRef} args={[undefined, undefined, count]} castShadow receiveShadow>
        <coneGeometry args={[0.82, 3.2, 24]} />
        <meshStandardMaterial color="#2e5758" roughness={0.92} />
      </instancedMesh>
    </group>
  );
}

function SmoothMountain({ position, scale, color }: { position: [number, number, number]; scale: [number, number, number]; color: string }) {
  const geometry = useMemo(() => new THREE.LatheGeometry([
    new THREE.Vector2(0, 0),
    new THREE.Vector2(4.8, 0.55),
    new THREE.Vector2(7.7, 2.4),
    new THREE.Vector2(8.5, 4.9),
    new THREE.Vector2(6.2, 7.4),
    new THREE.Vector2(4.2, 9.7),
    new THREE.Vector2(2.4, 11.5),
    new THREE.Vector2(0.8, 12.9),
    new THREE.Vector2(0, 13.4),
  ], 96), []);
  return <mesh geometry={geometry} position={position} scale={scale} castShadow><meshStandardMaterial color={color} roughness={0.95} /></mesh>;
}

function MountainRange() {
  return (
    <group>
      <SmoothMountain position={[-13, 0, -18]} scale={[1.22, 1.35, 1.22]} color="#78929c" />
      <SmoothMountain position={[3, 0, -22]} scale={[1.42, 1.2, 1.42]} color="#6d8792" />
      <SmoothMountain position={[18, 0, -20]} scale={[1.05, 1.02, 1.05]} color="#5e7b87" />
      <SmoothMountain position={[-13, 9.6, -18]} scale={[0.65, 0.48, 0.65]} color="#e8eff0" />
      <SmoothMountain position={[3, 8.9, -22]} scale={[0.68, 0.44, 0.68]} color="#eef3f1" />
    </group>
  );
}

function LakeEffect({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current || reducedMotion) return;
    ref.current.position.y = 0.06 + Math.sin(clock.elapsedTime * 0.35) * 0.008;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[1, 0.06, 1]} receiveShadow>
      <circleGeometry args={[11.2, 96]} />
      <meshPhysicalMaterial color="#315e69" roughness={0.3} metalness={0.08} clearcoat={0.62} clearcoatRoughness={0.2} transparent opacity={0.92} />
    </mesh>
  );
}

function Cabin() {
  return (
    <group position={[-2.2, 0, 1.4]} rotation={[0, -0.24, 0]}>
      <mesh position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[4.6, 2.2, 3.2]} />
        <meshStandardMaterial color="#654c3e" roughness={0.88} />
      </mesh>
      <mesh position={[0, 2.55, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[3.35, 1.15, 4]} />
        <meshStandardMaterial color="#24343a" roughness={0.75} />
      </mesh>
      <mesh position={[0.01, 1.2, -1.64]}>
        <boxGeometry args={[1.1, 0.92, 0.06]} />
        <meshStandardMaterial color="#f5ba62" emissive="#a14c1e" emissiveIntensity={0.65} />
      </mesh>
      <mesh position={[-1.2, 1.2, -1.64]}>
        <boxGeometry args={[0.7, 0.92, 0.06]} />
        <meshStandardMaterial color="#f5ba62" emissive="#a14c1e" emissiveIntensity={0.65} />
      </mesh>
      <pointLight color="#e89448" intensity={3.2} distance={8} position={[0, 1.2, -2]} />
    </group>
  );
}

function ForegroundRocks({ quality }: { quality: Quality }) {
  const transforms = useMemo(() => [
    [-15, 10, 0.7], [-12, 6, 0.38], [-9.5, 13, 0.3], [-16, 4.5, 0.42],
    [9.5, 13, 0.28], [11.5, 7, 0.48], [14.5, 11, 0.62], [15.5, 5.5, 0.34],
  ] as const, []);
  const count = quality === 'high' ? transforms.length : 4;
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const matrix = new THREE.Matrix4();
    for (let index = 0; index < count; index += 1) {
      const [x, z, scale] = transforms[index];
      matrix.compose(new THREE.Vector3(x, scale * 0.45, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, seeded(index, 14) * 2, 0)), new THREE.Vector3(scale * 1.4, scale, scale));
      ref.current.setMatrixAt(index, matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [count, transforms]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} castShadow>
      <icosahedronGeometry args={[1, 2]} />
      <meshStandardMaterial color="#53656a" roughness={0.97} />
    </instancedMesh>
  );
}

function SnowEffect({ quality, reducedMotion }: { quality: Quality; reducedMotion: boolean }) {
  const count = quality === 'high' ? 2800 : 900;
  const points = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = (seeded(index, 20) - 0.5) * 42;
      positions[index * 3 + 1] = seeded(index, 21) * 20;
      positions[index * 3 + 2] = (seeded(index, 22) - 0.5) * 36;
    }
    return positions;
  }, [count]);
  const ref = useRef<THREE.Points>(null);
  useFrame(({ clock }, delta) => {
    if (!ref.current || reducedMotion) return;
    const attribute = ref.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let index = 0; index < count; index += 1) {
      const yIndex = index * 3 + 1;
      attribute.array[yIndex] = (attribute.array[yIndex] as number) - delta * (0.55 + seeded(index, 23) * 0.45);
      attribute.array[index * 3] = (points[index * 3] as number) + Math.sin(clock.elapsedTime * 0.35 + index) * 0.35;
      if ((attribute.array[yIndex] as number) < 0) attribute.array[yIndex] = 20;
    }
    attribute.needsUpdate = true;
  });
  return <points ref={ref} frustumCulled={false}><bufferGeometry><bufferAttribute attach="attributes-position" args={[points, 3]} /></bufferGeometry><pointsMaterial color="#ffffff" size={quality === 'high' ? 0.12 : 0.085} transparent opacity={0.9} depthWrite={false} /></points>;
}

function AuroraEffect({ quality, reducedMotion }: { quality: Quality; reducedMotion: boolean }) {
  const ref = useRef<THREE.ShaderMaterial>(null);
  useFrame(({ clock }) => {
    if (ref.current && !reducedMotion) ref.current.uniforms.uTime.value = clock.elapsedTime;
  });
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uOpacity: { value: quality === 'high' ? 0.5 : 0.28 } }), [quality]);
  return (
    <mesh position={[0, 15, -26]} rotation={[0, 0, 0.015]}>
      <planeGeometry args={[48, 22, quality === 'high' ? 64 : 20, 1]} />
      <shaderMaterial ref={ref} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} uniforms={uniforms} vertexShader={'varying vec2 vUv; uniform float uTime; void main(){ vUv=uv; vec3 p=position; p.x += sin(p.y*.32+uTime*.12)*.42; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0); }'} fragmentShader={'varying vec2 vUv; uniform float uOpacity; void main(){ float vertical=smoothstep(.02,.12,vUv.y)*(1.-smoothstep(.94,1.,vUv.y)); float horizontal=smoothstep(.0,.12,vUv.x)*(1.-smoothstep(.88,1.,vUv.x)); float bend=sin(vUv.y*8.)*2.; float fine=pow(.5+.5*sin(vUv.x*108.+bend),11.); float medium=pow(.5+.5*sin(vUv.x*41.+bend*.7),4.); float veil=.5+.5*sin(vUv.x*12.+1.7); float hang=.18+.82*smoothstep(.1,.72,vUv.y); vec3 color=mix(vec3(.08,.82,.95),vec3(.43,.3,1.),vUv.x); gl_FragColor=vec4(color,vertical*horizontal*(.1+.36*fine+.38*medium+.16*veil)*hang*uOpacity); }'} />
    </mesh>
  );
}

function CinematicSnowForeground() {
  const geometry = useMemo(() => {
    const result = new THREE.PlaneGeometry(44, 19, 52, 22);
    const positions = result.getAttribute('position') as THREE.BufferAttribute;
    for (let index = 0; index < positions.count; index += 1) {
      const x = positions.getX(index);
      const y = positions.getY(index);
      const height = Math.sin(x * 0.24) * 0.13 + Math.cos(y * 0.31) * 0.18 + Math.sin((x + y) * 0.12) * 0.1;
      positions.setZ(index, height);
    }
    positions.needsUpdate = true;
    result.computeVertexNormals();
    return result;
  }, []);
  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, 3.04, 31]} receiveShadow>
      <meshStandardMaterial color="#bccbd1" roughness={0.96} />
    </mesh>
  );
}

function ContinuousSnowBase() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 2.35, 0]} receiveShadow>
      <planeGeometry args={[96, 96, 1, 1]} />
      <meshStandardMaterial color="#bccbd1" roughness={1} />
    </mesh>
  );
}

export function FallbackWorld({ quality, reducedMotion, showTerrain, showBase, showCabin, showVegetation, showRocks }: { quality: Quality; reducedMotion: boolean; showTerrain: boolean; showBase: boolean; showCabin: boolean; showVegetation: boolean; showRocks: boolean }) {
  return (
    <group>
      {showTerrain && <MountainRange />}
      {showBase && <LakeEffect reducedMotion={reducedMotion} />}
      {!showBase && <><ContinuousSnowBase /><CinematicSnowForeground /></>}
      {showCabin && <Cabin />}
      {showVegetation && <PineForest quality={quality} />}
      {showRocks && <ForegroundRocks quality={quality} />}
      {!reducedMotion && <AuroraEffect quality={quality} reducedMotion={reducedMotion} />}
      <SnowEffect quality={quality} reducedMotion={reducedMotion} />
      {showBase && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, -2]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#c4cfcc" roughness={1} />
      </mesh>}
    </group>
  );
}
