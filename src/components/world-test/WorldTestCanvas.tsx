'use client';

import { Suspense, useEffect, useLayoutEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { FallbackWorld } from './WorldFallbackScene';
import { preloadWorldModel, WorldForegroundInstances, WorldHeroTreeInstances, WorldModelAsset, WorldModelErrorBoundary, WorldVegetationInstances } from './WorldModelLoader';
import { WorldWalkControls } from './WorldWalkControls';

type Quality = 'high' | 'low';

type Props = {
  assetPaths: string[];
  hasCore: boolean;
  hasWorldCore: boolean;
  hasCabin: boolean;
  hasWorldTest: boolean;
  quality: Quality;
  reducedMotion: boolean;
  exploring: boolean;
  overviewResetKey: number;
  readyModels: string[];
  onModelReady: (path: string) => void;
};

function AdaptiveWorldCamera({ exploring }: { exploring: boolean }) {
  const { camera, size } = useThree();

  useLayoutEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const aspect = size.width / Math.max(size.height, 1);
    const overviewFov = aspect < 0.8 ? 56 : aspect < 1.2 ? 47 : aspect > 2 ? 42 : 39;
    const walkFov = aspect < 0.8 ? 50 : aspect < 1.2 ? 42 : aspect > 2 ? 39 : 36;
    camera.fov = exploring ? walkFov : overviewFov;
    camera.updateProjectionMatrix();
  }, [camera, exploring, size.height, size.width]);

  return null;
}

function OverviewCameraReset({ exploring, resetKey }: { exploring: boolean; resetKey: number }) {
  const { camera } = useThree();

  useLayoutEffect(() => {
    if (exploring || !(camera instanceof THREE.PerspectiveCamera)) return;
    camera.position.set(0, 5.2, 30.5);
    camera.lookAt(0, 4.9, 3);
    camera.updateMatrixWorld();
  }, [camera, exploring, resetKey]);

  return null;
}

export default function WorldTestCanvas({ assetPaths, hasCore, hasWorldCore, hasCabin, hasWorldTest, quality, reducedMotion, exploring, overviewResetKey, readyModels, onModelReady }: Props) {
  const hasVegetation = readyModels.some((path) => path.endsWith('/vegetation-prototypes.glb') || path.endsWith('/hero-trees.glb') || path.endsWith('/foreground-prototypes.glb'));
  const hasForeground = readyModels.some((path) => path.endsWith('/foreground-prototypes.glb'));
  useEffect(() => {
    assetPaths.forEach(preloadWorldModel);
  }, [assetPaths]);
  return (
    <Canvas
      shadows={quality === 'high'}
      dpr={quality === 'high' ? [1, 1.5] : [0.75, 1.1]}
      frameloop={reducedMotion ? 'demand' : 'always'}
      camera={{ position: [0, 5.2, 30.5], fov: 39, near: 0.1, far: 140 }}
      gl={{ antialias: quality === 'high', powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <AdaptiveWorldCamera exploring={exploring} />
      <OverviewCameraReset exploring={exploring} resetKey={overviewResetKey} />
      <color attach="background" args={['#07142f']} />
      <fog attach="fog" args={['#07142f', 24, 76]} />
      <ambientLight intensity={0.35} color="#b6d2dc" />
      <directionalLight
        castShadow={quality === 'high'}
        color="#b8d9ec"
        intensity={2.3}
        position={[-14, 24, 12]}
        shadow-mapSize-width={quality === 'high' ? 1024 : 512}
        shadow-mapSize-height={quality === 'high' ? 1024 : 512}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <hemisphereLight args={['#9abaca', '#122026', 0.75]} />
      <FallbackWorld
        quality={quality}
        reducedMotion={reducedMotion}
        showTerrain={!hasCore}
        showBase={!hasWorldCore && !hasWorldTest}
        showCabin={!hasCabin && !hasWorldTest}
        showVegetation={!hasVegetation && !hasWorldTest}
        showRocks={!hasForeground && !hasWorldTest}
      />
      {assetPaths.map((path) => (
        <WorldModelErrorBoundary key={path}>
          <Suspense fallback={null}>
            {path.endsWith('/foreground-prototypes.glb')
              ? <WorldForegroundInstances path={path} quality={quality} onReady={onModelReady} />
              : path.endsWith('/hero-trees.glb')
              ? <WorldHeroTreeInstances path={path} quality={quality} onReady={onModelReady} />
              : path.endsWith('/vegetation-prototypes.glb')
              ? <WorldVegetationInstances path={path} count={quality === 'high' ? 32 : 16} onReady={onModelReady} />
              : <WorldModelAsset path={path} onReady={onModelReady} />}
          </Suspense>
        </WorldModelErrorBoundary>
      ))}
      {exploring ? (
        <WorldWalkControls reducedMotion={reducedMotion} />
      ) : (
        <OrbitControls
          key={overviewResetKey}
          makeDefault
          enablePan={false}
          minDistance={26}
          maxDistance={36}
          minPolarAngle={Math.PI * 0.4}
          maxPolarAngle={Math.PI * 0.495}
          minAzimuthAngle={-Math.PI * 0.08}
          maxAzimuthAngle={Math.PI * 0.08}
          target={[0, 4.9, 3]}
          rotateSpeed={0.72}
          enableDamping={!reducedMotion}
          dampingFactor={0.06}
        />
      )}
    </Canvas>
  );
}
