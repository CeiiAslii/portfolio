import { useEffect, useRef } from 'react'

export function Reveal({ children, className = '', delay = 0, immediate = false }) {
  const elementRef = useRef(null)
  useEffect(() => {
    const node = elementRef.current
    if (!node) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.classList.add('is-visible')
        observer.unobserve(node)
      }
    }, { threshold: 0.12 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return <div ref={elementRef} className={`reveal-on-scroll ${immediate ? 'is-visible' : ''} ${className}`} style={{ '--reveal-delay': `${delay}ms` }}>{children}</div>
}
