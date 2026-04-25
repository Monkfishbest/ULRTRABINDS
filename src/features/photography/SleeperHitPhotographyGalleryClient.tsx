'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import type { GalleryPhoto, GallerySection } from './SleeperHitPhotographyData'
import styles from './css/SleeperHitPhotography.module.css'

export function SleeperHitPhotographyGalleryClient({
  photos,
  section,
  source,
}: Readonly<{
  photos: GalleryPhoto[]
  section: GallerySection
  source: 'drive' | 'fallback'
}>) {
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null)

  const selectedPhoto = useMemo(
    () => photos.find((photo) => photo.id === selectedPhotoId) ?? null,
    [photos, selectedPhotoId],
  )

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <p className={styles.sectionIndex}>{section.title}</p>
        <p className={styles.sectionIntro}>{section.intro}</p>
        <p className={styles.sourceNote}>
          {source === 'drive'
            ? 'Live from Google Drive.'
            : 'Showing fallback placeholders until the Google Drive folder is connected.'}
        </p>
      </div>

      <div className={styles.galleryShell}>
        <div className={styles.gallery}>
          {photos.map((photo) => (
            <figure className={styles.figure} key={photo.id}>
              <button
                type="button"
                className={styles.photoButton}
                onClick={() => setSelectedPhotoId(photo.id)}
              >
                <div className={styles.imageFrame}>
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 900px) 100vw, 50vw"
                    className={styles.image}
                  />
                </div>
              </button>
              <figcaption className={styles.caption}>{photo.caption}</figcaption>
            </figure>
          ))}
        </div>

        {selectedPhoto ? (
          <aside className={styles.detailPanel} aria-label={`${selectedPhoto.caption} detail panel`}>
            <div className={styles.detailImageFrame}>
              <Image
                src={selectedPhoto.src}
                alt={selectedPhoto.alt}
                fill
                sizes="(max-width: 900px) 100vw, 30vw"
                className={styles.image}
              />
            </div>

            <div className={styles.detailCopy}>
              <p className={styles.sectionIndex}>Selected image</p>
              <h3 className={styles.detailHeading}>{selectedPhoto.caption}</h3>
              <p className={styles.aboutCopy}>{selectedPhoto.description}</p>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setSelectedPhotoId(null)}
              >
                Close panel
              </button>
            </div>
          </aside>
        ) : (
          <aside className={styles.detailPanelEmpty}>
            <p className={styles.aboutCopy}>
              Click an image to open the panel view. This is the bit that can mirror the
              image-and-abstract rhythm you liked from the reference site.
            </p>
          </aside>
        )}
      </div>
    </section>
  )
}
