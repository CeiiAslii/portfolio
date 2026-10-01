import { useEffect, useRef, useState } from 'react'

export function useRevealOnce({ threshold = 0.18 } = {}) {
  const elementRef = useRef(null)
  const [isRevealed, setIsRevealed] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      setIsRevealed(true)
      return undefined
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setIsRevealed(true)
      observer.disconnect()
    }, { threshold })

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold])

  return [elementRef, isRevealed]
}
