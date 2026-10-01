import { useEffect, useRef } from 'react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { FlexibleCable } from './components/FlexibleCable'
import { ContactPaper } from './components/ContactPaper'
import { Navbar } from './components/Navbar'
import { ProjectFeature } from './components/ProjectFeature'
import { SkillShowcase } from './components/SkillShowcase'
import { WorkbenchIllustration } from './components/WorkbenchIllustration'
import { useRevealOnce } from './hooks/useRevealOnce'
import { contactLinks, githubUrl, projects } from './data/portfolio'

function HeroWorkbench({ revealRef, isRevealed }) {
  const motionRef = useRef(null)
  const frameRef = useRef(0)

  useEffect(() => () => cancelAnimationFrame(frameRef.current), [])

  const setTilt = (tiltX, tiltY) => {
    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => {
      const node = motionRef.current
      if (!node) return
      node.style.setProperty('--hero-tilt-x', `${tiltX.toFixed(2)}deg`)
      node.style.setProperty('--hero-tilt-y', `${tiltY.toFixed(2)}deg`)
    })
  }

  const handlePointerMove = (event) => {
    if (event.pointerType !== 'mouse' || window.innerWidth < 680) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - .5
    const y = (event.clientY - bounds.top) / bounds.height - .5
    setTilt(-y * 4, x * 4)
  }

  const resetTilt = () => setTilt(0, 0)

  return (
    <figure ref={revealRef} className={`hero__illustration${isRevealed ? ' hero__illustration--entered' : ''}`} onPointerMove={handlePointerMove} onPointerLeave={resetTilt} onPointerCancel={resetTilt}>
      <div ref={motionRef} className="hero__illustration-motion"><WorkbenchIllustration /><figcaption>NETWORKS / SYSTEMS / DEVELOPMENT</figcaption></div>
    </figure>
  )
}

function App() {
  const [heroIllustrationRef, heroIllustrationRevealed] = useRevealOnce({ threshold: 0.1 })
  const [contactNoteRef, contactNoteRevealed] = useRevealOnce({ threshold: 0.18 })

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar />
      <main id="main-content">
        <section className="hero section-frame" id="home" aria-labelledby="hero-title">
          <div className="hero__copy">
            <p className="hero-introduction">Hello, I’m</p>
            <h1 id="hero-title">Michio<span className="hero-period">.</span></h1>
            <p className="hero-statement">I like knowing<br />what makes it <em>work.</em></p>
            <p className="hero-description">Networking, Linux, Android kernel, mobile apps and web systems.</p>
            <a className="button button--primary hero-project-link" href="#projects">Take a look at my projects <ArrowRight size={18} /></a>
          </div>
          <HeroWorkbench revealRef={heroIllustrationRef} isRevealed={heroIllustrationRevealed} />
          <div className="hero-footnote"><span>Michio / CeiiAslii</span><span>A few things from my workbench</span><a href="#projects" aria-label="Scroll to projects">↓</a></div>
        </section>
        <section className="projects section-frame section-block" id="projects" aria-labelledby="projects-heading">
          <header className="section-intro"><div><p className="section-index">01 / Selected work</p><h2 className="section-heading" id="projects-heading">Made to be <em>used.</em></h2></div><p>Mobile apps, kernel source, and web systems.<br />The code is there to look through.</p></header>
          <div className="projects-list">{projects.map((project, index) => <ProjectFeature key={project.name} project={project} reverse={index % 2 === 1} />)}</div>
        </section>
        <section className="skills section-frame section-block" id="skills" aria-labelledby="skills-heading">
          <div className="skills__intro"><div><p className="section-index">02 / The toolkit</p><h2 className="section-heading" id="skills-heading">Tools on<br />the <em>desk.</em></h2></div><p>A place for the tools I use.<br />Pick one to read the notes.</p></div>
          <SkillShowcase />
        </section>
        <section className="about section-frame section-block" id="about" aria-labelledby="about-heading">
          <div className="about__heading"><p className="section-index">03 / A little about me</p><h2 className="section-heading" id="about-heading">Curiosity goes<br /><em>all the way down.</em></h2><FlexibleCable /></div>
          <div className="about__content"><p>I’m Michio, also known as CeiiAslii. I work with networks, Linux, Android customization, and the applications that run on top of them.</p><p>Some projects start at the interface. Others start with a kernel. I like being able to follow the connections between the two.</p><a className="text-link" href={githubUrl} target="_blank" rel="noreferrer">Find my code on GitHub <ArrowUpRight size={17} /></a></div>
        </section>
        <section className="contact section-frame section-block" id="contact" aria-labelledby="contact-heading">
          <div><p className="section-index">04 / Keep in touch</p><h2 className="contact-heading" id="contact-heading">Got something<br />in <em>mind?</em></h2><a className="contact-cta" href={contactLinks.email}>Write me an email <ArrowUpRight size={22} /></a></div>
          <div ref={contactNoteRef} className={`contact-note-reveal${contactNoteRevealed ? ' is-entered' : ''}`}><ContactPaper entered={contactNoteRevealed}><span className="note-fold" aria-hidden="true" /><p className="contact-note__title">You can find me here.</p><div className="contact-links"><a href={githubUrl} target="_blank" rel="noreferrer"><span>GitHub</span><span>CeiiAslii</span><ArrowUpRight size={16} /></a><a href={contactLinks.telegram} target="_blank" rel="noreferrer"><span>Telegram</span><span>@naniicikiwir</span><ArrowUpRight size={16} /></a><a href={contactLinks.email}><span>Email</span><span>ceiingap@gmail.com</span><ArrowUpRight size={16} /></a></div></ContactPaper></div>
        </section>
      </main>
      <footer className="site-footer section-frame"><span>© 2026 Michio / CeiiAslii</span><a href="#home">Back to the workbench ↑</a></footer>
    </div>
  )
}
export default App
