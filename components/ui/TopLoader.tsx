'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function TopLoader() {
  const pathname = usePathname()
  const [phase, setPhase] = useState<'idle' | 'loading' | 'done'>('idle')
  const [progress, setProgress] = useState(0)
  const prevPath = useRef(pathname)
  const started = useRef(false)
  const tickRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const doneRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest('a[href]') as HTMLAnchorElement | null
      if (!anchor || anchor.target === '_blank') return
      const href = anchor.getAttribute('href') ?? ''
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return
      try {
        const url = new URL(href, window.location.href)
        if (url.origin !== window.location.origin) return
        if (url.pathname === pathname) return
      } catch { return }

      started.current = true
      clearInterval(tickRef.current)
      clearTimeout(doneRef.current)
      setProgress(20)
      setPhase('loading')
      tickRef.current = setInterval(() => {
        setProgress(p => p < 85 ? p + (85 - p) * 0.08 : p)
      }, 250)
    }

    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
      clearInterval(tickRef.current)
    }
  }, [pathname])

  useEffect(() => {
    if (!started.current || pathname === prevPath.current) return
    prevPath.current = pathname
    started.current = false
    clearInterval(tickRef.current)
    setProgress(100)
    setPhase('done')
    doneRef.current = setTimeout(() => {
      setPhase('idle')
      setProgress(0)
    }, 450)
    return () => clearTimeout(doneRef.current)
  }, [pathname])

  if (phase === 'idle') return null

  return (
    <div
      className="pointer-events-none fixed top-0 left-0 z-[9999] h-[3px] bg-amber-400 shadow-[0_0_8px_#f0b429]"
      style={{
        width: `${progress}%`,
        transition: phase === 'done'
          ? 'width 0.15s ease, opacity 0.35s ease 0.1s'
          : 'width 0.3s ease',
        opacity: phase === 'done' ? 0 : 1,
      }}
    />
  )
}
