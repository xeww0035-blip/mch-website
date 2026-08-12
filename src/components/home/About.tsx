import { Reveal } from '@/components/ui/Reveal';
import { profile } from '@/data/profile';
import styles from './About.module.css';

export function About() {
  const facts = [
    ['Name', profile.name],
    ['Role', profile.role],
    ['Field', 'AI / Product / Systems'],
    ['Education', profile.school],
    ['Focus', profile.power],
    ['Based', 'Dalian / China'],
  ];

  return (
    <section id="about" className="section">
      <div className="section-header">
        <span className="section-num">04 / PROFILE</span>
        <h2 className="section-title">About<span>.</span></h2>
      </div>

      <div className={styles.profileGrid}>
        <div className={styles.sideLabel}>MA CHENHAO<br />PRODUCT DESIGN<br />AI PRODUCT<br />SYSTEM THINKING</div>
        <div className={styles.statement}>
          <Reveal as="p" className={styles.lead}>I don&apos;t use AI to replace my work.<br /><em>I use it as leverage.</em></Reveal>
          <Reveal className={styles.body} delay={100}>
            {profile.aboutParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </Reveal>
        </div>
        <Reveal className={styles.facts} delay={160}>
          {facts.map(([label, value]) => <div className={styles.fact} key={label}><span>{label}</span><strong>{value}</strong></div>)}
        </Reveal>
      </div>

      <div className={styles.method}>
        <span className={styles.methodLabel}>METHOD / BELIEFS</span>
        {profile.beliefs.map((belief) => <Reveal as="article" className={styles.methodRow} key={belief.num}><span>{belief.num}</span><p>{belief.text}</p></Reveal>)}
      </div>
    </section>
  );
}
