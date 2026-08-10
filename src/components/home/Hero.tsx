'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Reveal } from '@/components/ui/Reveal';
import { profile } from '@/data/profile';
import styles from './Hero.module.css';

export function Hero() {
  const creatureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const onMove = (e: MouseEvent) => {
      const pupils = creatureRef.current?.querySelectorAll<SVGCircleElement>('.pupil');
      if (!pupils) return;
      pupils.forEach((pupil) => {
        const cx = parseFloat(pupil.dataset.cx || '0');
        const cy = parseFloat(pupil.dataset.cy || '0');
        const dx = (e.clientX / window.innerWidth - 0.5) * 8;
        const dy = (e.clientY / window.innerHeight - 0.5) * 6;
        pupil.setAttribute('cx', String(cx + dx));
        pupil.setAttribute('cy', String(cy + dy));
      });
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.spaceDots}>
          <span className={`${styles.sd} ${styles.sd1}`} />
          <span className={`${styles.sd} ${styles.sd2}`} />
          <span className={`${styles.sd} ${styles.sd3}`} />
          <span className={`${styles.sd} ${styles.sd4}`} />
          <span className={`${styles.sd} ${styles.sd5}`} />
          <span className={`${styles.sd} ${styles.sd6}`} />
          <span className={`${styles.sd} ${styles.sd7}`} />
          <span className={`${styles.sd} ${styles.sd8}`} />
        </div>
      </div>

      <div className={styles.creature} ref={creatureRef} aria-hidden="true">
        <svg viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M150 200 Q100 120 180 80 Q260 50 320 100 Q380 140 360 220 Q340 300 260 320 Q180 330 150 280 Q120 240 150 200 Z"
            fill="#FFD23F"
            stroke="#1A1B3A"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          {[
            [200, 120], [240, 100], [290, 120], [310, 180],
            [200, 250], [280, 270], [230, 200],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="3" fill="#1A1B3A" />
          ))}
          <ellipse cx="210" cy="170" rx="28" ry="22" fill="#F4ECD8" stroke="#1A1B3A" strokeWidth="4" />
          <circle className="pupil" data-cx="215" data-cy="175" cx="215" cy="175" r="12" fill="#1A1B3A" />
          <circle cx="219" cy="170" r="3" fill="#F4ECD8" />
          <ellipse cx="290" cy="170" rx="28" ry="22" fill="#F4ECD8" stroke="#1A1B3A" strokeWidth="4" />
          <circle className="pupil" data-cx="295" data-cy="175" cx="295" cy="175" r="12" fill="#1A1B3A" />
          <circle cx="299" cy="170" r="3" fill="#F4ECD8" />
          <path d="M200 230 Q250 250 300 230" stroke="#1A1B3A" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M360 220 Q390 200 420 210 Q440 215 450 200" stroke="#1A1B3A" strokeWidth="5" fill="none" strokeLinecap="round" />
          <circle cx="450" cy="200" r="8" fill="#3DA9C9" stroke="#1A1B3A" strokeWidth="3" />
          <path d="M150 200 Q120 180 100 190 Q80 195 70 180" stroke="#1A1B3A" strokeWidth="5" fill="none" strokeLinecap="round" />
          <circle cx="70" cy="180" r="8" fill="#F26B83" stroke="#1A1B3A" strokeWidth="3" />
          <path d="M250 60 Q240 30 230 15" stroke="#1A1B3A" strokeWidth="5" fill="none" strokeLinecap="round" />
          <circle cx="230" cy="15" r="10" fill="#3DA9C9" stroke="#1A1B3A" strokeWidth="4" />
          <path d="M280 55 Q290 25 300 10" stroke="#1A1B3A" strokeWidth="5" fill="none" strokeLinecap="round" />
          <circle cx="300" cy="10" r="10" fill="#D62828" stroke="#1A1B3A" strokeWidth="4" />
          {[170, 190, 210, 230, 250, 270, 290, 310, 330].map((x, i) => (
            <circle key={i} cx={x} cy={310 + Math.abs(i - 4) * 4} r="3" fill="#1A1B3A" />
          ))}
        </svg>
      </div>

      <div className={styles.symbols} aria-hidden="true">
        <svg className={`${styles.floatSym} ${styles.fs1}`} width="24" height="24" viewBox="0 0 40 40"><use href="#sym-star" style={{ color: '#FFD23F' }} /></svg>
        <svg className={`${styles.floatSym} ${styles.fs2}`} width="20" height="20" viewBox="0 0 20 20"><use href="#sym-dot" style={{ color: '#3DA9C9' }} /></svg>
        <svg className={`${styles.floatSym} ${styles.fs3}`} width="24" height="24" viewBox="0 0 40 40"><use href="#sym-star" style={{ color: '#F26B83' }} /></svg>
        <svg className={`${styles.floatSym} ${styles.fs4}`} width="40" height="20" viewBox="0 0 60 30"><use href="#sym-fish" style={{ color: '#3DA9C9' }} /></svg>
        <svg className={`${styles.floatSym} ${styles.fs5}`} width="20" height="25" viewBox="0 0 40 50"><use href="#sym-leaf" style={{ color: '#5BBA47' }} /></svg>
        <svg className={`${styles.floatSym} ${styles.fs6}`} width="20" height="20" viewBox="0 0 40 40"><use href="#sym-spiral" style={{ color: '#FFD23F' }} /></svg>
      </div>

      <div className={styles.content}>
        <Reveal className={styles.tag}>
          <svg width="16" height="16" viewBox="0 0 40 40"><use href="#sym-eye" style={{ color: '#FFD23F' }} /></svg>
          <span>{profile.tagline}</span>
        </Reveal>
        <Reveal as="h1" className={styles.title} delay={100}>
          <span className={styles.titleLine}>你好,</span>
          <span className={styles.titleLine}>
            我是<span className={styles.titleToy}>{profile.name}</span>
          </span>
        </Reveal>
        <Reveal className={styles.subtitle} delay={200}>
          用设计理解人，<br />
          用系统整理复杂度，<br />
          用 AI 把想法更快推向<span className="marker marker-yellow">真实世界</span>。
        </Reveal>
        <Reveal className={styles.cta} delay={300}>
          <Link href="/#works" className="btn btn-primary">
            <svg width="20" height="20" viewBox="0 0 60 30"><use href="#sym-fish" style={{ color: '#1A1B3A' }} /></svg>
            看看作品
          </Link>
          <Link href="/#about" className="btn btn-ghost">
            <svg width="16" height="16" viewBox="0 0 40 40"><use href="#sym-eye" style={{ color: '#1A1B3A' }} /></svg>
            了解我
          </Link>
        </Reveal>
      </div>

      <div className={styles.divider} aria-hidden="true">
        <svg width="100%" height="12" viewBox="0 0 1200 12" preserveAspectRatio="none">
          <use href="#sym-bead-row" style={{ color: '#1A1B3A' }} />
        </svg>
      </div>
    </section>
  );
}
