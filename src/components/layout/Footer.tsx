import { footerLinks } from '@/data/nav';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.beadRow} aria-hidden="true">
        <svg width="100%" height="12" viewBox="0 0 1200 12" preserveAspectRatio="none">
          <use href="#sym-bead-row" style={{ color: 'var(--sun)' }} />
        </svg>
      </div>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <svg width="24" height="24" viewBox="0 0 40 40">
            <use href="#sym-star" style={{ color: 'var(--sun)' }} />
          </svg>
          <span>马晨皓</span>
          <span className={styles.tag}>· AI-Native Product Builder</span>
        </div>
        <p className={styles.text}>
          Make it playful, not messy ◆ 让页面像一个可以玩的世界，但让信息像一套成熟产品一样清楚
        </p>
        <div className={styles.links}>
          {footerLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
        <p className={styles.copy}>© 2026 马晨皓 · Made with 粗线条 &amp; 精密秩序</p>
      </div>
    </footer>
  );
}
