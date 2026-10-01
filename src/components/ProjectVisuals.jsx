import { useEffect, useRef, useState } from 'react'
import { KernelIllustration } from './WorkbenchIllustration'
import { useRevealOnce } from '../hooks/useRevealOnce'

function ProjectScreenshot({ project }) {
  const [status, setStatus] = useState('loading')
  return (
    <div className={`project-screenshot project-screenshot--${project.visual}`}>
      {status !== 'ready' && <p className="image-status" role="status">{status === 'error' ? 'Preview unavailable. You can still view the project source.' : 'Loading project preview…'}</p>}
      <img src={project.image} alt={project.imageAlt} loading="lazy" hidden={status === 'error'} onLoad={() => setStatus('ready')} onError={() => setStatus('error')} />
    </div>
  )
}

function PointerTilt({ children, visual }) {
  const regionRef = useRef(null)
  const animationFrameRef = useRef(0)

  useEffect(() => () => cancelAnimationFrame(animationFrameRef.current), [])

  const updateTilt = (event) => {
    const isTouch = event.pointerType === 'touch'
    if ((!isTouch && event.pointerType !== 'mouse') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const region = regionRef.current
    const bounds = event.currentTarget.getBoundingClientRect()
    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5
    const strength = isTouch ? 0.72 : 1
    cancelAnimationFrame(animationFrameRef.current)
    animationFrameRef.current = requestAnimationFrame(() => {
      region.style.setProperty('--pointer-tilt-x', `${(-vertical * 4.4 * strength).toFixed(2)}deg`)
      region.style.setProperty('--pointer-tilt-y', `${(horizontal * 6 * strength).toFixed(2)}deg`)
      region.style.setProperty('--pointer-scale', isTouch ? '0.985' : '1')
    })
  }

  const resetTilt = () => {
    cancelAnimationFrame(animationFrameRef.current)
    const region = regionRef.current
    region.style.setProperty('--pointer-tilt-x', '0deg')
    region.style.setProperty('--pointer-tilt-y', '0deg')
    region.style.setProperty('--pointer-scale', '1')
  }

  return <div ref={regionRef} className={`project-motion-region project-motion-region--${visual}`}><div className="project-motion-frame">{children}</div><div className="project-motion-sensor" aria-hidden="true" onPointerDown={updateTilt} onPointerMove={updateTilt} onPointerUp={resetTilt} onPointerLeave={resetTilt} onPointerCancel={resetTilt} /></div>
}

export function ProjectVisual({ project }) {
  const [visualRef, isEntered] = useRevealOnce({ threshold: 0.2 })
  const entranceClass = isEntered ? ' project-visual--entered' : ''

  if (project.visual === 'kernel') {
    return <figure ref={visualRef} className={`project-visual kernel-visual${entranceClass}`}><div className="visual-meta"><span>Inside the device</span><span>02</span></div><KernelIllustration /><dl className="kernel-info">{project.systemInfo.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><figcaption>Kernel source, illustrated. Not a live diagnostic.</figcaption></figure>
  }
  return <figure ref={visualRef} className={`project-visual ${project.visual}-visual${entranceClass}`}><div className="visual-meta"><span>{project.visual === 'mobile' ? 'On the small screen' : 'In the browser'}</span><span>{project.number}</span></div><PointerTilt visual={project.visual}><ProjectScreenshot project={project} /></PointerTilt><figcaption>{project.visual === 'mobile' ? 'Micro-Core / Android' : 'PKL Management System / Dashboard'}</figcaption></figure>
}
