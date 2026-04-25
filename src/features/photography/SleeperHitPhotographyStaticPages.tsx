import styles from './css/SleeperHitPhotography.module.css'

export function SleeperHitPhotographyHome() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <p className={styles.sectionIndex}>Home</p>
        <h2 className={styles.pageHeading}>Sleeper Hit Photography</h2>
        <p className={styles.sectionIntro}>
          This is the landing page for the gallery. The sidebar stays put, and each collection now
          lives on its own route so the whole thing feels more like a proper little photography
          site instead of one long scroller.
        </p>
      </div>
    </section>
  )
}

export function SleeperHitPhotographyAbout() {
  return (
    <section className={styles.aboutSection}>
      <p className={styles.sectionIndex}>About</p>
      <p className={styles.aboutCopy}>
        This is a placeholder build for now, set up so you can swap in real galleries later
        without rebuilding the whole layout. The broad idea is a clean side menu, roomy image
        presentation, and simple category browsing, but now with separate routes for each section.
      </p>
    </section>
  )
}
