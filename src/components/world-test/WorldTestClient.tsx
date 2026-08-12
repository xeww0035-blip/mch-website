'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import styles from './WorldTest.module.css';

const WorldTestCanvas = dynamic(() => import('./WorldTestCanvas'), {
  ssr: false,
  loading: () => <div className={styles.canvasLoading}>PREPARING LANDSCAPE / 00%</div>,
});

const MODEL_FILES = [
  '/models/world-core.glb',
  '/models/mountain.glb',
  '/models/cabin.glb',
  '/models/hero-trees.glb',
  '/models/foreground-prototypes.glb',
] as const;

const PUBLIC_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

function modelUrl(path: string) {
  return `${PUBLIC_BASE_PATH}${path}`;
}

export function WorldTestClient({ embedded = false }: { embedded?: boolean }) {
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [activeModels, setActiveModels] = useState<string[]>([]);
  const [inventoryReady, setInventoryReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [effectsOff, setEffectsOff] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const [exploring, setExploring] = useState(false);
  const [overviewResetKey, setOverviewResetKey] = useState(0);

  useEffect(() => {
    document.body.classList.add(embedded ? 'alpine-home-mode' : 'world-test-mode');
    return () => document.body.classList.remove('world-test-mode', 'alpine-home-mode', 'world-test-exploring');
  }, [embedded]);

  useEffect(() => {
    document.body.classList.toggle('world-test-exploring', exploring);
  }, [exploring]);

  useEffect(() => {
    const resetOverview = () => {
      if (!exploring) setOverviewResetKey((key) => key + 1);
    };
    window.addEventListener('mch:gesture-open-palm', resetOverview);
    return () => window.removeEventListener('mch:gesture-open-palm', resetOverview);
  }, [exploring]);

  useEffect(() => {
    const hasSplitWorld = availableModels.some((path) => path.endsWith('/world-core.glb') || path.endsWith('/mountain.glb'));
    const deployableModels = availableModels.filter((path) => !hasSplitWorld || !path.endsWith('/world-test.glb'));
    const primary = deployableModels.filter((path) => path.endsWith('/world-core.glb') || path.endsWith('/mountain.glb'));
    const wholeScene = deployableModels.filter((path) => path.endsWith('/world-test.glb'));
    setActiveModels(primary.length ? primary : wholeScene);
    const cabinTimer = window.setTimeout(() => setActiveModels((current) => [...new Set([...current, ...deployableModels.filter((path) => path.endsWith('/cabin.glb'))])]), 500);
    const heroTreesTimer = window.setTimeout(() => setActiveModels((current) => [...new Set([...current, ...deployableModels.filter((path) => path.endsWith('/hero-trees.glb'))])]), 900);
    const foregroundTimer = window.setTimeout(() => setActiveModels((current) => [...new Set([...current, ...deployableModels.filter((path) => path.endsWith('/foreground-prototypes.glb'))])]), 1200);
    return () => {
      window.clearTimeout(cabinTimer);
      window.clearTimeout(heroTreesTimer);
      window.clearTimeout(foregroundTimer);
    };
  }, [availableModels]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    const canvas = document.createElement('canvas');
    setUnsupported(!canvas.getContext('webgl2') && !canvas.getContext('webgl'));
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all(MODEL_FILES.map(async (path) => {
      try {
        let response = await fetch(modelUrl(path), { method: 'HEAD', cache: 'no-store' });
        // Next dev's static file handler may not implement HEAD even though
        // the same asset is available through GET (GitHub Pages does both).
        if (!response.ok) response = await fetch(modelUrl(path), { method: 'GET', cache: 'force-cache' });
        response.body?.cancel();
        return response.ok ? path : null;
      } catch {
        return null;
      }
    })).then((results) => {
      if (cancelled) return;
      setAvailableModels(results.filter((path) => path !== null) as string[]);
      setInventoryReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  const hasCore = activeModels.some((path) => path.endsWith('/world-core.glb') || path.endsWith('/mountain.glb') || path.endsWith('/world-test.glb'));
  const hasWorldCore = activeModels.some((path) => path.endsWith('/world-core.glb') || path.endsWith('/world-test.glb'));
  const hasWorldTest = activeModels.some((path) => path.endsWith('/world-test.glb'));
  const hasCabin = activeModels.some((path) => path.endsWith('/cabin.glb'));
  const isLowPower = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return navigator.hardwareConcurrency <= 4 || navigator.maxTouchPoints > 0;
  }, []);
  const quality = effectsOff || reducedMotion || isLowPower ? 'low' : 'high';
  const world = (
    <div className={styles.page} data-exploring={exploring}>
      <div className={styles.canvasFrame}>
        {unsupported ? (
          <div className={styles.fallbackMessage}>
            <span>WEBGL UNAVAILABLE</span>
            <strong>Alpine world requires a WebGL-capable browser.</strong>
            <small>The rest of the MCH site remains available through the navigation.</small>
          </div>
        ) : (
          <WorldTestCanvas
            assetPaths={activeModels}
            hasCore={hasCore}
            hasWorldCore={hasWorldCore}
            hasCabin={hasCabin}
            hasWorldTest={hasWorldTest}
            quality={quality}
            reducedMotion={reducedMotion}
            exploring={exploring}
            overviewResetKey={overviewResetKey}
          />
        )}
        <div className={styles.topRail}>
          {embedded ? <span>MCH / 2026</span> : <a href="/" className={styles.backLink}>← MCH / 2026</a>}
          <span>WORLD TEST / ALPINE EDITORIAL</span>
          <span>01 — 04</span>
        </div>
        <div className={styles.loadingOverlay} data-ready={inventoryReady}>
          <span>{inventoryReady ? (availableModels.length ? 'GLB ENHANCEMENT READY' : '3D ASSETS PENDING') : 'SCANNING ASSETS'}</span>
          <i>{availableModels.length ? `${availableModels.length} OPTIONAL FILE${availableModels.length === 1 ? '' : 'S'}` : 'PROCEDURAL FALLBACK ACTIVE'}</i>
        </div>
        <div className={styles.titleBlock}>
          <small>CINEMATIC NATURE / 2026</small>
          <h1>Alpine<br /><em>interval</em></h1>
          <p>A quiet world between the last light and the first snow.</p>
        </div>
        <div className={styles.controls}>
          <button type="button" onClick={() => setEffectsOff((value) => !value)} aria-pressed={effectsOff}>
            {effectsOff ? 'ENABLE EFFECTS' : 'REDUCE EFFECTS'}
          </button>
          <span>{quality.toUpperCase()} / {reducedMotion ? 'REDUCED MOTION' : 'REALTIME'}</span>
        </div>
        <div className={styles.exploreControl}>
          <button type="button" data-mouse-only onClick={() => setExploring((value) => !value)} aria-pressed={exploring}>
            {exploring ? 'EXIT WALK / 退出' : 'ENTER WORLD / 漫游'}
          </button>
          <span>{exploring ? 'WASD MOVE · HOLD FIST FORWARD · POINT + PINCH STEP · PINCH MOVE LOOK' : 'NO VEHICLE · WALK THE SNOW'}</span>
        </div>
        {exploring && <div className={styles.walkReticle} aria-hidden="true" />}
      </div>
    </div>
  );

  return embedded ? <section id="hero" aria-label="Alpine world introduction">{world}</section> : <main>{world}</main>;
}
