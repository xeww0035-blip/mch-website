'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { navItems } from '@/data/nav';
import styles from './Navbar.module.css';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    const onResize = () => { if (window.innerWidth > 780) setMenuOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    document.body.classList.add('menu-is-open');
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
      document.body.classList.remove('menu-is-open');
    };
  }, [menuOpen]);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`} aria-label="主导航">
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>MCH <span>/ 2026</span></Link>
        <button type="button" className={styles.toggle} aria-label={menuOpen ? '关闭菜单' : '打开菜单'} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen((open) => !open)}>
          <span>{menuOpen ? 'Close' : 'Menu'}</span>
        </button>
        <ul id="primary-navigation" className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          {navItems.map((item) => <li key={item.href}><Link href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</Link></li>)}
        </ul>
        <span className={styles.lang}>CN</span>
      </div>
    </nav>
  );
}
