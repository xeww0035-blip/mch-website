'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { navItems } from '@/data/nav';
import styles from './Navbar.module.css';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav id="navbar" className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <svg width="28" height="28" viewBox="0 0 40 40">
            <use href="#sym-star" style={{ color: 'var(--sun)' }} />
          </svg>
          <span>马晨皓</span>
        </Link>

        <button
          className={styles.toggle}
          aria-label="菜单"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
          <span />
        </button>

        <ul className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={item.isCta ? styles.cta : ''}
                onClick={() => setMenuOpen(false)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox={
                    item.symbol === 'fish' ? '0 0 60 30'
                    : item.symbol === 'leaf' || item.symbol === 'tree' ? '0 0 40 50'
                    : item.symbol === 'key' ? '0 0 50 20'
                    : '0 0 40 40'
                  }
                >
                  <use href={`#sym-${item.symbol}`} style={{ color: item.symbolColor }} />
                </svg>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
