import { Reveal } from '@/components/ui/Reveal';
import { skills } from '@/data/skills';
import styles from './Skills.module.css';

export function Skills() {
  return (
    <section id="skills" className="section">
      <div className="section-header">
        <span className="section-num">05 / CAPABILITIES</span>
        <h2 className="section-title">Capabilities<span>.</span></h2>
        <p className="section-desc">A working set of methods for moving from ambiguous questions to systems that can ship.</p>
      </div>
      <div className={styles.grid}>
        {skills.map((skill, index) => <Reveal as="article" className={styles.item} key={skill.id} delay={index * 50}><span className={styles.index}>{String(index + 1).padStart(2, '0')}</span><div><h3>{skill.title}</h3><p>{skill.description}</p><div className={styles.tags}>{skill.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div></Reveal>)}
      </div>
    </section>
  );
}
