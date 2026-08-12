import { Reveal } from '@/components/ui/Reveal';
import { works } from '@/data/works';
import styles from './Works.module.css';

export function Works() {
  return (
    <section id="works" className="section">
      <div className="section-header">
        <span className="section-num">02 / SELECTED WORK</span>
        <h2 className="section-title">Selected work<span>.</span></h2>
        <p className="section-desc">Product design, AI systems and the work of turning complex operations into something people can use.</p>
      </div>

      <div className={styles.list}>
        {works.map((work, index) => (
          <Reveal key={work.id} as="article" className={styles.item} delay={index * 60}>
            <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
            <div className={styles.body}>
              <div className={styles.titleRow}>
                <h3>{work.title}</h3>
                <span className={styles.arrow} aria-hidden="true">↗</span>
              </div>
              <p>{work.description}</p>
              <span className={styles.meta}>{work.tag} <span>/</span> 2026</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
