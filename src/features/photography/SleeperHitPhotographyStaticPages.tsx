import type { LoadedGallerySection } from './SleeperHitPhotographyDrive.server'
import { SleeperHitPhotographyHomeClient } from './SleeperHitPhotographyHomeClient'
import styles from './css/SleeperHitPhotography.module.css'

export function SleeperHitPhotographyHome({
  covers,
}: Readonly<{
  covers: LoadedGallerySection[]
}>) {
  return <SleeperHitPhotographyHomeClient covers={covers} />
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
