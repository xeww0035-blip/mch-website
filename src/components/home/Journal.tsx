import { Reveal } from '@/components/ui/Reveal';
import { articles } from '@/data/articles';
import styles from './Journal.module.css';

const viewBoxMap: Record<string, string> = {
  star: '0 0 40 40',
  eye: '0 0 40 40',
  moon: '0 0 40 40',
};

export function Journal() {
  return (
    <section id="journal" className="section section-paper">
      <div className="section-divider" aria-hidden="true">
        <svg width="100%" height="20" viewBox="0 0 1200 20" preserveAspectRatio="none">
          <path
            d="M0 10 Q100 0 200 10 T400 10 T600 10 T800 10 T1000 10 T1200 10"
            stroke="var(--ink)"
            strokeWidth="4"
            fill="none"
          />
        </svg>
      </div>

      <div className="section-header reveal">
        <svg className="section-symbol" width="32" height="32" viewBox="0 0 40 40">
          <use href="#sym-spiral" style={{ color: 'var(--ink)' }} />
        </svg>
        <span className="section-num">04</span>
        <h2 className="section-title">故事书</h2>
        <p className="section-desc">想清楚了才写下来的</p>
      </div>

      <div className={styles.list}>
        {articles.map((article) => (
          <Reveal key={article.id} as="a" className={styles.item}>
            <span className={styles.symbol}>
              <svg width="20" height="20" viewBox={viewBoxMap[article.symbol]}>
                <use href={`#sym-${article.symbol}`} style={{ color: article.symbolColor }} />
              </svg>
            </span>
            <div className={styles.content}>
              <span className={styles.date}>{article.date}</span>
              <h3>{article.title}</h3>
              <p>{article.excerpt}</p>
            </div>
            <span className={styles.arrow}>&rarr;</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
