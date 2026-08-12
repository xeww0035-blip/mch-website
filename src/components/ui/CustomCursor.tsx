'use client';

import { useEffect, useRef } from 'react';
import styles from './CustomCursor.module.css';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return;
    const cursor = cursorRef.current;
    const label = labelRef.current;
    if (!cursor || !label) return;
    const onMove = (event: PointerEvent) => {
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      cursor.classList.add(styles.visible);
    };
    const onOver = (event: PointerEvent) => {
      const target = (event.target as HTMLElement).closest('a, button');
      label.textContent = target?.getAttribute('data-cursor') || (target?.getAttribute('href')?.startsWith('http') ? 'OPEN' : 'VIEW');
      cursor.classList.toggle(styles.active, Boolean(target));
    };
    const onLeave = () => cursor.classList.remove(styles.visible);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerover', onOver); document.documentElement.removeEventListener('mouseleave', onLeave); };
  }, []);

  return <div ref={cursorRef} className={styles.cursor} aria-hidden="true"><span ref={labelRef}>VIEW</span></div>;
}
