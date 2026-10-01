import { useEffect, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { githubUrl, navLinks } from '../data/portfolio'

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const [avatarPulse, setAvatarPulse] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const sections = navLinks.map(({ href }) => document.querySelector(href)).filter(Boolean)
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting)
      if (visible.length) setActiveSection(`#${visible.at(-1).target.id}`)
    }, { rootMargin: '-35% 0px -55%', threshold: 0 })
    sections.forEach((section) => observer.observe(section))
    return () => {
      window.removeEventListener('scroll', onScroll)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  return (
    <header className={`site-nav ${scrolled ? 'site-nav--scrolled' : ''}`}>
      <nav className="site-nav__inner" aria-label="Primary navigation">
        <a className="brand" href="#home" aria-label="Michio CeiiAslii, kembali ke beranda" onClick={() => setAvatarPulse((pulse) => pulse + 1)}>
          <span key={avatarPulse} className={`brand__avatar ${avatarPulse ? 'brand__avatar--pulse' : ''}`}>
            <img src="/kr0npr1nz.jpg" alt="" width="36" height="36" />
          </span>
        </a>
        <div className="site-nav__links">
          {navLinks.map(({ label, href }) => <a key={href} href={href} className={activeSection === href ? 'is-active' : ''}>{label}</a>)}
        </div>
        <a className="nav-github" href={githubUrl} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14} /></a>
        <button className="menu-button" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={19} /> : <Menu size={19} />}<span>{menuOpen ? 'Close' : 'Menu'}</span>
        </button>
      </nav>
      <div id="mobile-navigation" className={`mobile-nav ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        {navLinks.map(({ label, href }, index) => <a key={href} href={href} onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}><span>0{index + 1}</span>{label}</a>)}
        <a href={githubUrl} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}><span><ArrowUpRight size={13} /></span>GitHub</a>
      </div>
    </header>
  )
}
