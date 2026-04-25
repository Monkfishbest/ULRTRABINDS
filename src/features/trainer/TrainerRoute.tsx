'use client'

import Link from 'next/link'
import { useSyncExternalStore } from 'react'
import { TrainerApp } from './TrainerApp'
import styles from './css/TrainerRoute.module.css'

function subscribe(): () => void {
  return () => undefined
}

function getClientSnapshot(): true {
  return true
}

function getServerSnapshot(): false {
  return false
}

export function TrainerRoute() {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)

  return (
    <main className={styles.page}>
      <div className={styles.chrome}>
        <Link className={styles.backLink} href="/">
          Back to site
        </Link>
      </div>

      {mounted ? (
        <TrainerApp />
      ) : (
        <div className={styles.loadingCard}>
          <p>Loading trainer...</p>
        </div>
      )}
    </main>
  )
}
