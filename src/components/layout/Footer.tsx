import Link from 'next/link';
import { footerLinks } from '@/data/nav';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}><span>MCH / 2026</span><span>AI-Native Product Builder</span></div>
        <p className={styles.statement}>Make it useful.<br /><em>Make it precise.</em></p>
        <div className={styles.bottom}><div className={styles.links}>{footerLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</div><p>© 2026 Ma Chenhao</p></div>
      </div>
    </footer>
  );
}
