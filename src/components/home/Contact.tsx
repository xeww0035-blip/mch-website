import { Reveal } from '@/components/ui/Reveal';
import { contactCards, socials } from '@/data/socials';
import styles from './Contact.module.css';

const symbolViewBox: Record<string, string> = {
  fish: '0 0 60 30',
  star: '0 0 40 40',
  key: '0 0 50 20',
};

export function Contact() {
  return (
    <section id="contact" className="section section-pink">
      <div className="section-header reveal">
        <svg className="section-symbol" width="32" height="16" viewBox="0 0 50 20">
          <use href="#sym-key" style={{ color: 'var(--ink)' }} />
        </svg>
        <span className="section-num">05</span>
        <h2 className="section-title">秘密通道</h2>
        <p className="section-desc">聊什么都可以，怎么开始都行</p>
      </div>

      <div className={styles.grid}>
        {contactCards.map((card) => (
          <Reveal
            key={card.id}
            className={`${styles.card} ${card.featured ? styles.featured : ''}`}
          >
            {card.featured && (
              <span className={styles.badge}>
                <svg width="12" height="12" viewBox="0 0 40 40">
                  <use href="#sym-star" style={{ color: 'var(--ink)' }} />
                </svg>
                推荐
              </span>
            )}
            <div className={styles.icon}>
              <svg width="28" height="28" viewBox={symbolViewBox[card.symbol]}>
                <use href={`#sym-${card.symbol}`} style={{ color: 'var(--ink)' }} />
              </svg>
            </div>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
            <span className={styles.note}>{card.note}</span>
          </Reveal>
        ))}
      </div>

      <Reveal className={styles.socialsBlock}>
        <div className={styles.socialsLabel}>
          <svg width="20" height="10" viewBox="0 0 60 30">
            <use href="#sym-fish" style={{ color: 'var(--ink)' }} />
          </svg>
          <span>Elsewhere · 在别处找到我</span>
        </div>
        <div className={styles.socialsList}>
          {socials.map((social) => (
            <a
              key={social.id}
              className={`${styles.socialRow} ${styles[social.bgClass]}`}
              href={social.href}
              {...(social.external ? { target: '_blank', rel: 'noopener' } : {})}
            >
              <span className={styles.socialIco} aria-hidden="true">
                {social.iconType === 'xhs' && (
                  <svg width="22" height="22" viewBox="0 0 24 24">
                    <text x="12" y="17" textAnchor="middle" fontSize="14" fontWeight="700" fill="currentColor">
                      红
                    </text>
                  </svg>
                )}
                {social.iconType === 'douyin' && (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.2 3.2c.4 2.7 2 4.3 4.6 4.7v3.2a10 10 0 0 1-4.5-1.4v6.1a6.1 6.1 0 1 1-5.4-6.1v3.3a2.9 2.9 0 1 0 2.2 2.8V3.2h3.1Z" />
                  </svg>
                )}
                {social.iconType === 'mail' && (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  >
                    <rect x="2.5" y="5" width="19" height="14" rx="2" />
                    <path d="m3 6.5 9 6.5 9-6.5" />
                  </svg>
                )}
              </span>
              <span className={styles.socialIdx}>{social.idx}</span>
              <span className={styles.socialName}>{social.platform}</span>
              <span className={styles.socialVal}>{social.handle}</span>
              <span className={styles.socialArr} aria-hidden="true">
                &rarr;
              </span>
            </a>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
