'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { LoadedGallerySection } from './SleeperHitPhotographyDrive.server'
import styles from './css/SleeperHitPhotography.module.css'

const coverTimeoutMs = 10000

function CoverCard({ loadedSection }: Readonly<{ loadedSection: LoadedGallerySection }>) {
  const photo = loadedSection.photos[0]
  const [isLoading, setIsLoading] = useState(Boolean(photo))
  const href = `/sleeper-hit-photography/${loadedSection.section.id}`

  useEffect(() => {
    if (!photo) {
      return
    }

    const timeout = window.setTimeout(() => setIsLoading(false), coverTimeoutMs)

    return () => window.clearTimeout(timeout)
  }, [photo])

  return (
    <Link className={styles.coverCard} href={href}>
      {photo ? (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(max-width: 900px) 100vw, 34vw"
          className={styles.coverImage}
          style={{ display: isLoading ? 'none' : 'block' }}
          onLoad={() => setIsLoading(false)}
          unoptimized
        />
      ) : null}
      {isLoading ? (
        <span className={styles.coverLoading}>
          <span className={styles.coverSpinner} aria-hidden="true" />
          <span className={styles.coverLoadingText}>
            waiting for Casper's lovely images to load, please wait two ticks
          </span>
        </span>
      ) : null}
      <span className={styles.coverLabel}>{loadedSection.section.title}</span>
    </Link>
  )
}

export function SleeperHitPhotographyHomeClient({
  covers,
}: Readonly<{
  covers: LoadedGallerySection[]
}>) {
  const hasFallback = covers.some((loadedSection) => loadedSection.source === 'fallback')

  return (
    <section className={styles.homeSection}>
      <h2 className={styles.homeTitle}>Sleeper Hit Photography</h2>
      {hasFallback ? (
        <p className={styles.fallbackNote}>
          Woups! there was a problem connecting to the server that holds the images! this isn't
          Caspers fault but his friend who built him this website, here are some cats looking
          disappointed at instead of Caspers beautiful photographs
        </p>
      ) : null}
      <div className={styles.coverGrid}>
        {covers.map((loadedSection) => (
          <CoverCard key={loadedSection.section.id} loadedSection={loadedSection} />
        ))}
      </div>

      <div className={styles.homeCopy}>
        <p>
          About: Love me wife, love me football, love me england, love me pie, simple as.
        </p>
        <p>
          Contact: <a href="mailto:k.bleidelis@gmail.com">k.bleidelis@gmail.com</a>
        </p>
      </div>
    </section>
  )
}
