import { Reveal } from '@/components/ui/Reveal';
import { contactCards, socials } from '@/data/socials';
import styles from './Contact.module.css';

export function Contact() {
  return (
    <section id="contact" className="section">
      <div className="section-header"><span className="section-num">06 / CONTACT</span><h2 className="section-title">Let&apos;s talk<span>.</span></h2><p className="section-desc">Open to selected collaborations, technical exchange and research conversations.</p></div>
      <div className={styles.contactList}>
        {contactCards.map((card, index) => <Reveal as="article" className={styles.contactRow} key={card.id}><span>{String(index + 1).padStart(2, '0')}</span><strong>{card.title}</strong><p>{card.description}</p><em>{card.note}</em><b aria-hidden="true">↗</b></Reveal>)}
      </div>
      <Reveal className={styles.socialsBlock}>
        <span className={styles.socialsLabel}>Elsewhere / Find me</span>
        <div className={styles.socialsList}>{socials.map((social) => <a key={social.id} className={styles.socialRow} href={social.href} {...(social.external ? { target: '_blank', rel: 'noopener' } : {})}><span>{social.idx}</span><strong>{social.platform}</strong><em>{social.handle}</em><b aria-hidden="true">↗</b></a>)}</div>
      </Reveal>
    </section>
  );
}
