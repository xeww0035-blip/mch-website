import type { Metadata } from 'next';
import { WorldTestClient } from '@/components/world-test/WorldTestClient';

export const metadata: Metadata = {
  title: 'Alpine World Test · MCH',
  description: 'Cinematic Alpine landscape experiment for the MCH world.',
};

export default function WorldTestPage() {
  return <WorldTestClient />;
}
