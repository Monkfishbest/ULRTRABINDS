import Image from 'next/image'
import { siteContent } from '../../content/siteContent'
import { FunStuffMenu } from './FunStuffMenu'
import styles from './css/HomePage.module.css'

export function HomePage() {
  return (
    <main className={styles.page}>
      <div className={styles.backdrop} />

      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logoSlot} aria-label={siteContent.logoAlt}>
            {siteContent.logoSrc ? (
              <Image
                src={siteContent.logoSrc}
                alt={siteContent.logoAlt}
                fill
                sizes="4.4rem"
                className={styles.logoImage}
              />
            ) : (
              <span>Logo</span>
            )}
          </div>

          <div className={styles.brandCopy}>
            <p>{siteContent.heroEyebrow}</p>
            <strong>{siteContent.companyName}</strong>
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroPanel}>
          <h1>{siteContent.heroTitle}</h1>
          <p className={styles.heroBody}>{siteContent.heroBody}</p>

          <div className={styles.heroActions}>
            <a className={styles.primaryLink} href="#contact">
              Get in touch
            </a>
          </div>
        </div>
      </section>

      <section className={styles.section} id="about">
        <div className={styles.sectionHeader}>
          <p className={styles.kicker}>About</p>
          <h2>{siteContent.aboutTitle}</h2>
        </div>

        <div className={styles.aboutPanel}>
          <p>{siteContent.aboutBody}</p>
        </div>
      </section>

      <footer className={styles.footer} id="contact">
        <div className={styles.sectionHeader}>
          <p className={styles.kicker}>Contact</p>
          <h2>Start a conversation.</h2>
        </div>

        <div className={styles.contactGrid}>
          {siteContent.contactLinks.map((link) => (
            <a className={styles.contactCard} href={link.href} key={link.label}>
              <span>{link.label}</span>
              <strong>{link.value}</strong>
            </a>
          ))}
        </div>

        <div className={styles.footerBar}>
          <p>
            {siteContent.legalLine ??
              'One-person limited company site placeholder. Replace with final legal/company line when ready.'}
          </p>
          <FunStuffMenu />
        </div>
      </footer>
    </main>
  )
}
