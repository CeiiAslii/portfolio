import { useEffect, useRef, useState } from 'react'
import {
  createCableSimulation,
  getCableMotion,
  getDraggedPlugPosition,
  getPlugAngleFromPoints,
  LIMITS,
  RELEASE_SPRING,
  REST_POSITION,
  stepCableSimulation,
  stepPlugSpring,
  TAUT_POSITION,
  toSmoothCablePath,
  VIEWBOX,
} from '../utils/flexibleCableGeometry'

const keyboardReleaseKeys = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' '])

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum)
}

function constrainPlug(position) {
  return {
    x: clamp(position.x, LIMITS.minX, LIMITS.maxX),
    y: clamp(position.y, LIMITS.minY, LIMITS.maxY),
  }
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function FlexibleCable() {
  const svgRef = useRef(null)
  const plugPositionRef = useRef(REST_POSITION)
  const plugVelocityRef = useRef({ x: 0, y: 0 })
  const cableRef = useRef(createCableSimulation(REST_POSITION))
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const activePointerIdRef = useRef(null)
  const draggingRef = useRef(false)
  const keyboardActiveRef = useRef(false)
  const animationFrameRef = useRef(0)
  const lastFrameRef = useRef(0)
  const lastPointerRef = useRef({ position: REST_POSITION, time: 0 })
  const [renderState, setRenderState] = useState({
    plug: REST_POSITION,
    points: cableRef.current.points,
  })
  const [isDragging, setIsDragging] = useState(false)

  const commitFrame = () => {
    setRenderState({
      plug: { ...plugPositionRef.current },
      points: cableRef.current.points,
    })
  }

  const stopAnimation = () => {
    cancelAnimationFrame(animationFrameRef.current)
    animationFrameRef.current = 0
    lastFrameRef.current = 0
  }

  const resetImmediately = (position = REST_POSITION) => {
    stopAnimation()
    const constrained = constrainPlug(position)
    plugPositionRef.current = constrained
    plugVelocityRef.current = { x: 0, y: 0 }
    cableRef.current = createCableSimulation(constrained)
    commitFrame()
  }

  const animate = (timestamp) => {
    animationFrameRef.current = 0
    if (prefersReducedMotion()) {
      resetImmediately(draggingRef.current ? plugPositionRef.current : REST_POSITION)
      return
    }

    const deltaTime = lastFrameRef.current ? (timestamp - lastFrameRef.current) / 1000 : 1 / 60
    lastFrameRef.current = timestamp

    if (draggingRef.current || keyboardActiveRef.current) {
      if (timestamp - lastPointerRef.current.time > 32) {
        const decay = Math.exp(-10 * Math.min(deltaTime, 1 / 30))
        plugVelocityRef.current = {
          x: plugVelocityRef.current.x * decay,
          y: plugVelocityRef.current.y * decay,
        }
      }
    } else {
      const spring = stepPlugSpring(
        plugPositionRef.current,
        plugVelocityRef.current,
        REST_POSITION,
        deltaTime,
        RELEASE_SPRING,
      )
      plugPositionRef.current = constrainPlug(spring.position)
      plugVelocityRef.current = spring.velocity
    }

    cableRef.current = stepCableSimulation(cableRef.current, plugPositionRef.current, deltaTime)
    commitFrame()

    const plugDistance = Math.hypot(
      plugPositionRef.current.x - REST_POSITION.x,
      plugPositionRef.current.y - REST_POSITION.y,
    )
    const plugSpeed = Math.hypot(plugVelocityRef.current.x, plugVelocityRef.current.y)
    const cableSpeed = getCableMotion(cableRef.current)
    const interactionActive = draggingRef.current || keyboardActiveRef.current

    if (!interactionActive && plugDistance < 0.08 && plugSpeed < 0.5 && cableSpeed < 0.025) {
      plugPositionRef.current = REST_POSITION
      plugVelocityRef.current = { x: 0, y: 0 }
      lastFrameRef.current = 0
      commitFrame()
      return
    }

    animationFrameRef.current = requestAnimationFrame(animate)
  }

  const ensureAnimation = () => {
    if (!animationFrameRef.current) animationFrameRef.current = requestAnimationFrame(animate)
  }

  const pointFromPointer = (event) => {
    const bounds = svgRef.current.getBoundingClientRect()
    return {
      x: (event.clientX - bounds.left) * VIEWBOX.width / bounds.width,
      y: (event.clientY - bounds.top) * VIEWBOX.height / bounds.height,
    }
  }

  const movePlugDirectly = (position, timestamp) => {
    const nextPosition = constrainPlug(position)
    const previousSample = lastPointerRef.current
    const elapsed = clamp((timestamp - previousSample.time) / 1000, 1 / 120, 1 / 20)
    const measuredVelocity = {
      x: (nextPosition.x - previousSample.position.x) / elapsed,
      y: (nextPosition.y - previousSample.position.y) / elapsed,
    }
    plugVelocityRef.current = {
      x: plugVelocityRef.current.x * 0.28 + measuredVelocity.x * 0.72,
      y: plugVelocityRef.current.y * 0.28 + measuredVelocity.y * 0.72,
    }
    plugPositionRef.current = nextPosition
    lastPointerRef.current = { position: nextPosition, time: timestamp }

    if (prefersReducedMotion()) {
      cableRef.current = createCableSimulation(nextPosition)
    } else {
      cableRef.current = stepCableSimulation(cableRef.current, nextPosition, elapsed)
    }
    commitFrame()
    ensureAnimation()
  }

  const returnHome = () => {
    draggingRef.current = false
    keyboardActiveRef.current = false
    setIsDragging(false)
    if (prefersReducedMotion()) {
      resetImmediately()
      return
    }
    ensureAnimation()
  }

  const startDrag = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if (activePointerIdRef.current !== null) return
    const pointer = pointFromPointer(event)
    dragOffsetRef.current = {
      x: pointer.x - plugPositionRef.current.x,
      y: pointer.y - plugPositionRef.current.y,
    }
    draggingRef.current = true
    activePointerIdRef.current = event.pointerId
    setIsDragging(true)
    plugVelocityRef.current = { x: 0, y: 0 }
    lastPointerRef.current = { position: plugPositionRef.current, time: event.timeStamp }
    event.currentTarget.setPointerCapture(event.pointerId)
    event.preventDefault()
    ensureAnimation()
  }

  const dragPlug = (event) => {
    if (!draggingRef.current || event.pointerId !== activePointerIdRef.current) return
    const pointer = pointFromPointer(event)
    movePlugDirectly(getDraggedPlugPosition(pointer, dragOffsetRef.current), event.timeStamp)
  }

  const releasePlug = (event) => {
    if (!draggingRef.current || event.pointerId !== activePointerIdRef.current) return
    activePointerIdRef.current = null
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    returnHome()
  }

  const handleKeyDown = (event) => {
    const distance = event.shiftKey ? 18 : 9
    const directions = {
      ArrowLeft: { x: -distance, y: 0 },
      ArrowRight: { x: distance, y: 0 },
      ArrowUp: { x: 0, y: -distance },
      ArrowDown: { x: 0, y: distance },
    }

    if (directions[event.key]) {
      event.preventDefault()
      keyboardActiveRef.current = true
      const movement = directions[event.key]
      movePlugDirectly({
        x: plugPositionRef.current.x + movement.x,
        y: plugPositionRef.current.y + movement.y,
      }, event.timeStamp)
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      keyboardActiveRef.current = true
      movePlugDirectly(TAUT_POSITION, event.timeStamp)
      return
    }
    if (event.key === 'Home') {
      event.preventDefault()
      resetImmediately()
    }
  }

  const handleKeyUp = (event) => {
    if (keyboardReleaseKeys.has(event.key)) returnHome()
  }

  useEffect(() => () => stopAnimation(), [])

  const cablePath = toSmoothCablePath(renderState.points)
  const plugAngle = getPlugAngleFromPoints(renderState.points)

  return (
    <div className={`about-cable${isDragging ? ' is-dragging' : ''}`}>
      <svg ref={svgRef} viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`} fill="none" role="img" aria-labelledby="about-cable-title about-cable-description">
        <title id="about-cable-title">Flexible illustrated cable</title>
        <desc id="about-cable-description">The cable is a chain of flexible segments that follows pointer or keyboard input, then returns with a damped spring.</desc>
        <path className="about-cable__wire-shadow" d={cablePath} />
        <path className="about-cable__wire" d={cablePath} />
        <g
          className="about-cable__plug"
          transform={`translate(${renderState.plug.x} ${renderState.plug.y}) rotate(${plugAngle})`}
          role="button"
          tabIndex="0"
          aria-label="Pull the cable left or right. Use arrow keys to move it, Enter to tug it, and Home to reset it."
          onPointerDown={startDrag}
          onPointerMove={dragPlug}
          onPointerUp={releasePlug}
          onPointerCancel={releasePlug}
          onLostPointerCapture={(event) => {
            if (event.target === event.currentTarget) releasePlug(event)
          }}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onBlur={returnHome}
        >
          <rect className="about-cable__plug-focus" x="-10" y="-31" width="62" height="62" rx="4" />
          <rect className="about-cable__plug-hit" x="-18" y="-38" width="76" height="76" rx="4" />
          <g className="about-cable__plug-body">
            <path d="M0 -12h29v24H0zm29 5h11V7H29" />
            <path d="M7 -7V7m7-14V7m7-14V7" />
          </g>
        </g>
      </svg>
      <span className="about-cable__hint" aria-hidden="true">pull the plug</span>
    </div>
  )
}
