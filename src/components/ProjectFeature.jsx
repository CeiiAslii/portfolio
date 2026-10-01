import { useState } from 'react'
import { ArrowUpRight, ChevronDown, X } from 'lucide-react'
import { ProjectVisual } from './ProjectVisuals'

export function ProjectFeature({ project, reverse = false }) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  return (
    <article className={`project-feature ${reverse ? 'project-feature--reverse' : ''}`}>
      <div className="project-feature__visual"><ProjectVisual project={project} /></div>
      <div className="project-feature__copy">
        <div className="project-meta"><span>PROJECT / {project.number}</span><span>{project.category}</span>{project.version && <span>{project.version}</span>}</div>
        <h3>{project.name}</h3>
        {project.subtitle && <p className="project-subtitle">{project.subtitle}</p>}
        <p className="project-description">{project.description}</p>
        <div className="tech-list" aria-label="Technologies used">{project.tech.map((tech) => <span key={tech}>{tech}</span>)}</div>
        <div className="project-actions">
          <a className="button button--primary" href={project.url} target="_blank" rel="noreferrer">{project.actionLabel} <ArrowUpRight size={15} /></a>
          {project.secondaryUrl && <a className="button button--ghost" href={project.secondaryUrl} target="_blank" rel="noreferrer">{project.secondaryLabel} <ArrowUpRight size={15} /></a>}
          <button className="button button--ghost project-details-toggle" type="button" aria-expanded={detailsOpen} onClick={() => setDetailsOpen((value) => !value)}>Details <ChevronDown className={detailsOpen ? 'is-rotated' : ''} size={15} /></button>
        </div>
        {detailsOpen && <div className="project-details" aria-label={`${project.name} details`}>
          <div className="project-details__header"><span>PROJECT NOTES</span><button type="button" onClick={() => setDetailsOpen(false)} aria-label="Close project details"><X size={15} /></button></div>
          <ul>{project.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
        </div>}
      </div>
    </article>
  )
}
