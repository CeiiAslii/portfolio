import { useLayoutEffect, useRef, useState } from 'react'
import { Bot, Code2 } from 'lucide-react'
import { RiOpenaiFill } from 'react-icons/ri'
import { SiAnthropic, SiCss, SiFlutter, SiGithub, SiHtml5, SiJavascript, SiLaravel, SiMariadb, SiPhp, SiPython, SiReact, SiTailwindcss, SiTelegram, SiVite } from 'react-icons/si'
import { skillGroups } from '../data/portfolio'

const devIcons = { html: SiHtml5, css: SiCss, javascript: SiJavascript, smartphone: SiFlutter, terminal: SiPython, braces: SiPhp, blocks: SiLaravel }
const brandIcons = { React: SiReact, Vite: SiVite, 'Tailwind CSS': SiTailwindcss, ChatGPT: RiOpenaiFill, Claude: SiAnthropic, 'Hermes Agent': Bot, MariaDB: SiMariadb, Telegram: SiTelegram, GitHub: SiGithub }

function SkillIcon({ skill, size = 27 }) {
  const Icon = brandIcons[skill.name] ?? devIcons[skill.icon] ?? Code2
  return <Icon className={`skill-row-card__icon skill-row-card__icon--${skill.name.toLowerCase().replaceAll(' ', '-')}`} size={size} aria-hidden="true" />
}

function Rail({ group, onSelect, selected, progress }) {
  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  const [extent, setExtent] = useState(0)
  const offset = extent * progress / 100

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    const measure = () => setExtent(Math.max(0, track.offsetWidth - viewport.clientWidth))
    measure()
    const resize = new ResizeObserver(measure)
    resize.observe(viewport)
    resize.observe(track)
    return () => resize.disconnect()
  }, [])

  useLayoutEffect(() => {
    const viewport = viewportRef.current.getBoundingClientRect()
    for (const button of trackRef.current.querySelectorAll('button')) {
      const bounds = button.getBoundingClientRect()
      button.tabIndex = bounds.left >= viewport.left && bounds.right <= viewport.right ? 0 : -1
    }
  }, [offset])

  const tools = group.title === 'Tools & Platforms'
  return <section className="skills-rail-block" aria-label={group.title}>
    <div className="skills-rail-label"><h3>{group.title}</h3><span>{tools ? 'Alongside the code' : 'For building things'}</span></div>
    <div className="skills-rail-viewport" ref={viewportRef}>
      <div className="skills-rail-track" ref={trackRef} style={{ transform: `translate3d(${-offset}px, 0, 0)` }}>{group.items.map((skill) => <button className={`skill-row-card ${selected.name === skill.name ? 'is-selected' : ''}`} type="button" key={skill.name} onClick={() => onSelect(skill)} aria-pressed={selected.name === skill.name}><SkillIcon skill={skill} /><span className="skill-row-card__name">{skill.name}</span><span className="skill-row-card__selection" aria-hidden="true">{selected.name === skill.name ? 'Selected' : 'View note'}</span></button>)}</div>
    </div>
  </section>
}

export function SkillShowcase() {
  const [selected, setSelected] = useState(skillGroups[0].items[3])
  const [position, setPosition] = useState(50)
  const selectedGroup = skillGroups.find(group => group.items.includes(selected))
  return <div className="skills-motion-stage skills-selector" aria-label="Interactive skills rails">
    <div className="skills-shelves">
      <Rail group={skillGroups[0]} selected={selected} onSelect={setSelected} progress={position} />
      <div className="skills-ruler">
        <label htmlFor="skills-ruler">Slide to move both rows</label>
        <div className="skills-ruler__track"><input id="skills-ruler" type="range" min="0" max="100" step="0.1" value={position} onChange={(event) => setPosition(Number(event.target.value))} aria-describedby="skills-ruler-hint" /></div>
        <p id="skills-ruler-hint">Bottom follows your hand. Top moves the other way.</p>
      </div>
      <Rail group={skillGroups[1]} selected={selected} onSelect={setSelected} progress={100 - position} />
    </div>
    <aside className="skill-inspector" aria-label="Selected tool notes" aria-live="polite" aria-atomic="true">
      <span className="skill-note-label">From the toolkit</span>
      <div className="skill-note-heading"><SkillIcon skill={selected} size={38} /><strong>{selected.name}</strong></div>
      <p>{selected.description}</p>
      <div className="skill-note-footer"><span>{selectedGroup.title}</span><span>{selected.category}</span></div>
    </aside>
    <div className="skills-controls"><p>Click a tool to read its note.</p></div>
  </div>
}
