import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { githubUrl, navLinks } from '../data/portfolio'

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const profileRegionRef = useRef(null)
  const avatarButtonRef = useRef(null)

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
    const closeMenuOnEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', closeMenuOnEscape)
    return () => window.removeEventListener('keydown', closeMenuOnEscape)
  }, [])

  useEffect(() => {
    if (!profileOpen) return undefined

    const closeOutside = (event) => {
      if (!profileRegionRef.current?.contains(event.target)) setProfileOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return
      setProfileOpen(false)
      avatarButtonRef.current?.focus()
    }

    document.addEventListener('pointerdown', closeOutside)
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [profileOpen])

  const toggleProfile = () => {
    setMenuOpen(false)
    setProfileOpen((open) => !open)
  }

  const toggleMenu = () => {
    setProfileOpen(false)
    setMenuOpen((open) => !open)
  }

  const closeProfile = () => setProfileOpen(false)

  return (
    <header className={`site-nav ${scrolled ? 'site-nav--scrolled' : ''}`}>
      <nav className="site-nav__inner" aria-label="Primary navigation">
        <div className="profile-popover" ref={profileRegionRef}>
          <button
            ref={avatarButtonRef}
            className="brand"
            type="button"
            aria-label={`${profileOpen ? 'Tutup' : 'Buka'} kartu profil Michio CeiiAslii`}
            aria-expanded={profileOpen}
            aria-controls="navbar-profile-card"
            onClick={toggleProfile}
          >
            <span className="brand__avatar">
              <img src="/kr0npr1nz.jpg" alt="" width="36" height="36" />
            </span>
          </button>
          <section
            id="navbar-profile-card"
            className={`profile-card${profileOpen ? ' is-open' : ''}`}
            aria-labelledby="navbar-profile-name"
            aria-hidden={!profileOpen}
          >
            <div className="profile-card__identity">
              <img className="profile-card__avatar" src="/kr0npr1nz.jpg" alt="Michio CeiiAslii" width="58" height="58" />
              <div>
                <p className="profile-card__label">Profile note</p>
                <h2 id="navbar-profile-name">Michio CeiiAslii</h2>
              </div>
            </div>
            <p className="profile-card__description">Networks, Linux, Android customization, and the applications that run on top of them.</p>
            <div className="profile-card__links">
              <a href="#about" tabIndex={profileOpen ? 0 : -1} onClick={closeProfile}>About</a>
              <a href="#home" tabIndex={profileOpen ? 0 : -1} onClick={closeProfile}>Kembali ke atas</a>
            </div>
          </section>
        </div>
        <div className="site-nav__links">
          {navLinks.map(({ label, href }) => <a key={href} href={href} className={activeSection === href ? 'is-active' : ''}>{label}</a>)}
        </div>
        <a className="nav-github" href={githubUrl} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14} /></a>
        <button className="menu-button" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={toggleMenu}>
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
