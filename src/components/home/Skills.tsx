import { Reveal } from '@/components/ui/Reveal';
import { skills } from '@/data/skills';
import styles from './Skills.module.css';

const viewBoxMap: Record<string, string> = {
  eye: '0 0 40 40',
  spiral: '0 0 40 40',
  key: '0 0 50 20',
  leaf: '0 0 40 50',
  fish: '0 0 60 30',
  star: '0 0 40 40',
};

export function Skills() {
  return (
    <section id="skills" className="section section-sun">
      <div className="section-header reveal">
        <svg className="section-symbol" width="32" height="40" viewBox="0 0 40 50">
          <use href="#sym-leaf" style={{ color: 'var(--ink)' }} />
        </svg>
        <span className="section-num">03</span>
        <h2 className="section-title">能力图鉴</h2>
        <p className="section-desc">不是软件清单，而是一条从模糊到可执行的链</p>
      </div>

      <div className={styles.grid}>
        {skills.map((skill) => (
          <Reveal key={skill.id} className={styles.card}>
            <div className={styles.icon}>
              <svg width="24" height="24" viewBox={viewBoxMap[skill.symbol]}>
                <use href={`#sym-${skill.symbol}`} style={{ color: 'var(--ink)' }} />
              </svg>
            </div>
            <h3>{skill.title}</h3>
            <p>{skill.description}</p>
            <div className={styles.tags}>
              {skill.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
