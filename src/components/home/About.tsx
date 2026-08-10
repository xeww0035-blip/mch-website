import { Reveal } from '@/components/ui/Reveal';
import { profile } from '@/data/profile';
import styles from './About.module.css';

const symbolColors: Record<string, string> = {
  eye: 'var(--aqua)',
  star: 'var(--sun)',
  spiral: 'var(--flame)',
  fish: 'var(--ocean)',
  leaf: 'var(--leaf)',
};

export function About() {
  return (
    <section id="about" className="section section-forest">
      <div className="texture-overlay" style={{ color: 'rgba(244,236,216,0.08)' }} aria-hidden="true">
        <svg width="100%" height="100%">
          <rect width="100%" height="100%" fill="url(#dot-sparse)" />
        </svg>
      </div>

      <div className="section-header reveal">
        <svg className="section-symbol" width="32" height="32" viewBox="0 0 40 40">
          <use href="#sym-eye" style={{ color: '#FFD23F' }} />
        </svg>
        <span className="section-num">01</span>
        <h2 className="section-title">角色档案</h2>
        <p className="section-desc">这不叫关于我，这叫角色档案</p>
      </div>

      <Reveal className={styles.avatar}>
        <div className={styles.avatarCard}>
          <div className={styles.portrait}>
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M60 100 Q40 60 80 40 Q120 25 140 60 Q160 90 145 130 Q130 170 100 175 Q70 170 60 140 Q50 120 60 100 Z"
                fill="#5BBA47"
                stroke="#1A1B3A"
                strokeWidth="5"
                strokeLinejoin="round"
              />
              <ellipse cx="85" cy="90" rx="16" ry="12" fill="#F4ECD8" stroke="#1A1B3A" strokeWidth="4" />
              <circle cx="88" cy="93" r="7" fill="#1A1B3A" />
              <ellipse cx="120" cy="90" rx="16" ry="12" fill="#F4ECD8" stroke="#1A1B3A" strokeWidth="4" />
              <circle cx="123" cy="93" r="7" fill="#1A1B3A" />
              <path d="M85 120 Q100 130 120 120" stroke="#1A1B3A" strokeWidth="4" fill="none" strokeLinecap="round" />
              <circle cx="75" cy="110" r="2" fill="#1A1B3A" />
              <circle cx="130" cy="110" r="2" fill="#1A1B3A" />
            </svg>
          </div>
          <div className={styles.info}>
            {[
              { label: 'NAME', value: profile.name },
              { label: 'ROLE', value: profile.role },
              { label: 'POWER', value: profile.power },
              { label: 'SCHOOL', value: profile.school },
              { label: 'PERSONALITY', value: `★ ${profile.personality}` },
              { label: 'MISSION', value: profile.mission },
            ].map((row) => (
              <div key={row.label} className={styles.row}>
                <span className={styles.label}>{row.label}</span>
                <span className={styles.value}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.story}>
          <p className={styles.lead}>
            我不是把 AI 当成<span className="hl hl-sun">替我完成作品</span>的工具，
            <br />
            而是把它当成<span className="hl hl-brick">实现杠杆</span>。
          </p>
          {profile.aboutParagraphs.map((p, i) => (
            <p key={i} className={styles.text}>
              {i === 2 ? (
                <>
                  与此同时，我一直在写一个叫"<span className="hl hl-sun">见己</span>"的长期项目：{p.replace('与此同时，我一直在写一个叫"见己"的长期项目：', '')}
                </>
              ) : (
                p
              )}
            </p>
          ))}
          <div className={styles.tags}>
            {profile.tags.map((tag, i) => {
              const sym = ['eye', 'star', 'spiral', 'fish', 'leaf'][i];
              const viewBox = sym === 'fish' ? '0 0 60 30' : sym === 'leaf' ? '0 0 40 50' : '0 0 40 40';
              return (
                <span key={tag} className="chip">
                  <svg width="14" height="14" viewBox={viewBox}>
                    <use href={`#sym-${sym}`} style={{ color: '#1A1B3A' }} />
                  </svg>
                  {tag}
                </span>
              );
            })}
          </div>
        </div>
      </Reveal>

      <Reveal className={styles.beliefs}>
        {profile.beliefs.map((belief) => (
          <div key={belief.num} className={`${styles.beliefCard} ${styles[`belief-${belief.color}`]}`}>
            <span className={styles.beliefNum}>{belief.num}</span>
            <p>{belief.text}</p>
            <svg className={styles.tentacle} width="20" height="40" viewBox="0 0 30 60">
              <use href="#sym-tentacle" style={{ color: '#1A1B3A' }} />
            </svg>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
