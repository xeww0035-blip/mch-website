import { Reveal } from '@/components/ui/Reveal';
import { works } from '@/data/works';
import styles from './Works.module.css';

const viewBoxMap: Record<string, string> = {
  eye: '0 0 40 40',
  fish: '0 0 60 30',
  leaf: '0 0 40 50',
  key: '0 0 50 20',
};

export function Works() {
  return (
    <section id="works" className="section section-flame">
      <div className="section-header reveal">
        <svg className="section-symbol" width="32" height="16" viewBox="0 0 60 30">
          <use href="#sym-fish" style={{ color: 'var(--ink)' }} />
        </svg>
        <span className="section-num">02</span>
        <h2 className="section-title">玩具柜</h2>
        <p className="section-desc">从"做界面"走向"搭系统"</p>
      </div>

      <div className={styles.grid}>
        {works.map((work) => (
          <Reveal key={work.id} as="a" className={styles.card}>
            <div className={`${styles.symbol} ${styles[`symbol-${work.symbolColor}`]}`}>
              <svg viewBox={viewBoxMap[work.symbol]}>
                <use href={`#sym-${work.symbol}`} style={{ color: 'var(--ink)' }} />
              </svg>
            </div>
            <h3>{work.title}</h3>
            <p>{work.description}</p>
            <span className={`${styles.tag} ${work.tagType === 'wip' ? styles.tagWip : ''}`}>
              {work.tag}
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
