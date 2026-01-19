'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

export function LenisProvider() {
  useEffect(() => {
    const lenis = new Lenis({
      prevent: (node) => {
        // Allow scrolling on elements with overflow-y auto or scroll
        return node.classList.contains('overflow-y-auto') || 
               node.classList.contains('overflow-y-scroll') ||
               node.getAttribute('data-lenis-prevent') === 'true'
      },
      smoothWheel: true,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  return null
}
