import { useEffect, useRef } from 'react'

export function ContactPaper({ entered, children }) {
  const paperRef = useRef(null)
  const animations = useRef([])

  const play = (lift = true) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    animations.current.forEach((animation) => animation.cancel())
    const paper = paperRef.current
    const fold = paper.querySelector('.note-fold')
    const timing = { duration: 520, easing: 'ease-in-out' }
    animations.current = [fold.animate([
      { transform: 'perspective(100px) rotateX(0deg) rotateY(0deg)' },
      { transform: 'perspective(100px) rotateX(-24deg) rotateY(20deg)', offset: .42 },
      { transform: 'perspective(100px) rotateX(0deg) rotateY(0deg)' },
    ], timing)]
    if (lift) animations.current.push(paper.animate([
      { translate: '0 0', boxShadow: '0 0 0 rgba(36,43,39,0)' },
      { translate: '0 -2px', boxShadow: '0 4px 8px rgba(36,43,39,.08)', offset: .42 },
      { translate: '0 0', boxShadow: '0 0 0 rgba(36,43,39,0)' },
    ], timing))
  }

  useEffect(() => {
    if (entered) play(false)
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const stop = () => animations.current.forEach((animation) => animation.cancel())
    media.addEventListener('change', stop)
    return () => {
      stop()
      media.removeEventListener('change', stop)
    }
  }, [entered])

  return <div ref={paperRef} className="contact-note" role="group" tabIndex={0} aria-label="Contact card. Press Enter to lift the paper."
    onPointerEnter={(event) => { if (event.pointerType === 'mouse') play() }}
    onClick={(event) => { if (!event.target.closest('a')) play() }}
    onKeyDown={(event) => {
      if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault()
        play()
      }
    }}>{children}</div>
}
