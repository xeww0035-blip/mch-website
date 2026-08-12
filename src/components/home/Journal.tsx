import { Reveal } from '@/components/ui/Reveal';
import { articles } from '@/data/articles';
import styles from './Journal.module.css';

export function Journal() {
  return (
    <section id="journal" className="section">
      <div className="section-header">
        <span className="section-num">03 / THINKING</span>
        <h2 className="section-title">Thinking<span>.</span></h2>
        <p className="section-desc">Notes from building products, studying systems and staying honest about what worked.</p>
      </div>
      <div className={styles.list}>
        {articles.map((article, index) => <Reveal key={article.id} as="a" className={styles.item} delay={index * 60}><span className={styles.index}>{String(index + 1).padStart(2, '0')}</span><div className={styles.content}><span className={styles.date}>{article.date}</span><h3>{article.title}</h3><p>{article.excerpt}</p></div><span className={styles.arrow} aria-hidden="true">↗</span></Reveal>)}
      </div>
    </section>
  );
}
