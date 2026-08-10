import { Hero } from '@/components/home/Hero';
import { About } from '@/components/home/About';
import { Works } from '@/components/home/Works';
import { Skills } from '@/components/home/Skills';
import { Journal } from '@/components/home/Journal';
import { Contact } from '@/components/home/Contact';

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Works />
      <Skills />
      <Journal />
      <Contact />
    </>
  );
}
