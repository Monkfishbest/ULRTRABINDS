'use client'

import Link from 'next/link'
import { useState } from 'react'
import styles from './css/FunStuffMenu.module.css'

export function FunStuffMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls="fun-stuff-panel"
        onClick={() => setOpen((current) => !current)}
      >
        Fun stuff
      </button>

      {open ? (
        <div className={styles.panel} id="fun-stuff-panel">
          <Link className={styles.link} href="/trainer">
            ULTRABINDS
          </Link>
          <Link className={styles.link} href="/sleeper-hit-photography">
            Sleeper Hit Photography
          </Link>
        </div>
      ) : null}
    </div>
  )
}
