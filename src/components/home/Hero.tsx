'use client';

import dynamic from 'next/dynamic';

const AlpineHomeWorld = dynamic(
  () => import('@/components/world-test/WorldTestClient').then((module) => module.WorldTestClient),
  { ssr: false, loading: () => <section id="hero" aria-label="Loading alpine world" /> },
);

// The original isometric rover map has been replaced by the same Alpine
// landing scene used by /world-test. The walking mode remains opt-in.
export function Hero() {
  return <AlpineHomeWorld embedded />;
}
