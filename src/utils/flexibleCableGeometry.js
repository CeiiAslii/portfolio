export const VIEWBOX = { width: 480, height: 140 }
export const REST_POSITION = { x: 380, y: 64 }
export const TAUT_POSITION = { x: 422, y: 64 }
export const LIMITS = { minX: 220, maxX: 422, minY: 20, maxY: 120 }
export const RELEASE_SPRING = { stiffness: 125, damping: 16.5 }

const ANCHOR = { x: 4, y: 68 }
const PARTICLE_COUNT = 14
const CONSTRAINT_ITERATIONS = 9
const INERTIA = 0.94
const BEND_RELAXATION = 0.035
const ANCHOR_MAX_ANGLE = Math.PI / 12
const PLUG_MAX_ANGLE = Math.PI / 3
const MIN_HORIZONTAL_GAP = 2
const ANCHOR_DAMPING = [0.5, 0.68, 0.84]
const SLEEP_MOTION = 0.45

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum)
}

function targetSegmentLength(endpoint) {
  const chordLength = Math.hypot(endpoint.x - ANCHOR.x, endpoint.y - ANCHOR.y)
  const pullProgress = clamp((endpoint.x - REST_POSITION.x) / (LIMITS.maxX - REST_POSITION.x), 0, 1)
  const returnProgress = clamp((REST_POSITION.x - endpoint.x) / (REST_POSITION.x - LIMITS.minX), 0, 1)
  const projectedSlack = 3 + (1 - pullProgress) * 30 + returnProgress * 30
  return (chordLength + projectedSlack) / (PARTICLE_COUNT - 1)
}

function pinEndpoints(points, endpoint) {
  points[0] = { ...ANCHOR }
  points[points.length - 1] = { ...endpoint }
}

function stabilizeAnchorZone(points, segmentLength) {
  const firstFreePoint = points[1]
  const firstAngle = clamp(
    Math.atan2(firstFreePoint.y - ANCHOR.y, firstFreePoint.x - ANCHOR.x),
    -ANCHOR_MAX_ANGLE,
    ANCHOR_MAX_ANGLE,
  )
  points[1] = {
    x: ANCHOR.x + Math.cos(firstAngle) * segmentLength,
    y: ANCHOR.y + Math.sin(firstAngle) * segmentLength,
  }

  let incomingAngle = firstAngle
  for (let index = 1; index < 4; index += 1) {
    const point = points[index]
    const next = points[index + 1]
    const distance = Math.hypot(next.x - point.x, next.y - point.y)
    const rawAngle = Math.atan2(next.y - point.y, next.x - point.x)
    const turn = Math.atan2(Math.sin(rawAngle - incomingAngle), Math.cos(rawAngle - incomingAngle))
    const maximumAngle = (15 + index * 10) * Math.PI / 180
    const angle = clamp(incomingAngle + clamp(turn, -25 * Math.PI / 180, 25 * Math.PI / 180), -maximumAngle, maximumAngle)
    points[index + 1] = {
      x: point.x + Math.cos(angle) * distance,
      y: point.y + Math.sin(angle) * distance,
    }
    incomingAngle = angle
  }
}

function stabilizePlugZone(points, segmentLength) {
  let outgoingAngle = 0
  for (let index = points.length - 2; index >= points.length - 6; index -= 1) {
    const point = points[index]
    const next = points[index + 1]
    const rawAngle = Math.atan2(next.y - point.y, next.x - point.x)
    const turn = Math.atan2(Math.sin(rawAngle - outgoingAngle), Math.cos(rawAngle - outgoingAngle))
    const maximumAngle = Math.min(
      PLUG_MAX_ANGLE + (points.length - 2 - index) * Math.PI / 18,
      Math.PI * 4 / 9,
    )
    const angle = clamp(outgoingAngle + clamp(turn, -Math.PI / 6, Math.PI / 6), -maximumAngle, maximumAngle)
    points[index] = {
      x: next.x - Math.cos(angle) * segmentLength,
      y: next.y - Math.sin(angle) * segmentLength,
    }
    outgoingAngle = angle
  }
}

function preventCableFolds(points, endpoint, segmentLength) {
  const lastIndex = points.length - 1
  const horizontalAllowance = segmentLength * 0.9
  for (let index = 1; index < lastIndex; index += 1) {
    const progress = index / lastIndex
    const idealX = ANCHOR.x + (endpoint.x - ANCHOR.x) * progress
    const minimumX = Math.max(points[index - 1].x + MIN_HORIZONTAL_GAP, idealX - horizontalAllowance)
    const maximumX = Math.min(
      endpoint.x - (lastIndex - index) * MIN_HORIZONTAL_GAP,
      idealX + horizontalAllowance,
    )
    points[index].x = clamp(points[index].x, minimumX, maximumX)
    points[index].y = clamp(points[index].y, 6, VIEWBOX.height - 6)
  }

  for (let iteration = 0; iteration < 2; iteration += 1) {
    const relaxed = points.map((point) => ({ ...point }))
    for (let index = 1; index < lastIndex; index += 1) {
      const midpointY = (points[index - 1].y + points[index + 1].y) * 0.5
      relaxed[index].y = clamp(points[index].y + (midpointY - points[index].y) * 0.35, 6, VIEWBOX.height - 6)
    }
    for (let index = 1; index < lastIndex; index += 1) points[index] = relaxed[index]
  }

  pinEndpoints(points, endpoint)
}

function relaxSharpTurns(points, endpoint) {
  const lastIndex = points.length - 1
  for (let iteration = 0; iteration < 3; iteration += 1) {
    const relaxed = points.map((point) => ({ ...point }))
    for (let index = 2; index < lastIndex - 1; index += 1) {
      const previous = points[index - 1]
      const point = points[index]
      const next = points[index + 1]
      const firstLength = Math.hypot(point.x - previous.x, point.y - previous.y)
      const secondLength = Math.hypot(next.x - point.x, next.y - point.y)
      const cosine = ((point.x - previous.x) * (next.x - point.x) + (point.y - previous.y) * (next.y - point.y))
        / (firstLength * secondLength || 1)
      const turn = Math.acos(clamp(cosine, -1, 1))
      if (turn < Math.PI / 7) continue
      const midpointX = (previous.x + next.x) * 0.5
      const midpointY = (previous.y + next.y) * 0.5
      const blend = clamp((turn - Math.PI / 7) / (Math.PI / 2) * 0.4, 0.06, 0.28)
      relaxed[index] = {
        x: point.x + (midpointX - point.x) * blend,
        y: point.y + (midpointY - point.y) * blend,
      }
    }
    for (let index = 2; index < lastIndex - 1; index += 1) points[index] = relaxed[index]
    pinEndpoints(points, endpoint)
  }
}

function solveConstraints(points, endpoint, segmentLength, iterations = CONSTRAINT_ITERATIONS) {
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    pinEndpoints(points, endpoint)

    for (let index = 0; index < points.length - 1; index += 1) {
      const first = points[index]
      const second = points[index + 1]
      const deltaX = second.x - first.x
      const deltaY = second.y - first.y
      const distance = Math.hypot(deltaX, deltaY) || 0.0001
      const correction = (distance - segmentLength) / distance

      if (index === 0) {
        second.x -= deltaX * correction
        second.y -= deltaY * correction
      } else if (index + 1 === points.length - 1) {
        first.x += deltaX * correction
        first.y += deltaY * correction
      } else {
        first.x += deltaX * correction * 0.5
        first.y += deltaY * correction * 0.5
        second.x -= deltaX * correction * 0.5
        second.y -= deltaY * correction * 0.5
      }
    }

    const relaxed = points.map((point) => ({ ...point }))
    for (let index = 1; index < points.length - 1; index += 1) {
      const midpointX = (points[index - 1].x + points[index + 1].x) * 0.5
      const midpointY = (points[index - 1].y + points[index + 1].y) * 0.5
      const relaxation = [0, 0.18, 0.13, 0.08][index] ?? BEND_RELAXATION
      relaxed[index].x += (midpointX - points[index].x) * relaxation
      relaxed[index].y += (midpointY - points[index].y) * relaxation
    }
    for (let index = 1; index < points.length - 1; index += 1) points[index] = relaxed[index]
  }

  pinEndpoints(points, endpoint)
  stabilizeAnchorZone(points, segmentLength)
  stabilizePlugZone(points, segmentLength)
  preventCableFolds(points, endpoint, segmentLength)
  relaxSharpTurns(points, endpoint)
  return points
}

export function createCableSimulation(endpoint = REST_POSITION) {
  const points = Array.from({ length: PARTICLE_COUNT }, (_, index) => {
    const progress = index / (PARTICLE_COUNT - 1)
    const lineX = ANCHOR.x + (endpoint.x - ANCHOR.x) * progress
    const lineY = ANCHOR.y + (endpoint.y - ANCHOR.y) * progress
    const initialBend = Math.sin(Math.PI * progress) * 14 - Math.sin(Math.PI * 2 * progress) * 24
    return { x: lineX, y: lineY + initialBend }
  })
  const segmentLength = targetSegmentLength(endpoint)
  solveConstraints(points, endpoint, segmentLength, 28)

  return {
    anchor: { ...ANCHOR },
    endpoint: { ...endpoint },
    segmentLength,
    points,
    previousPoints: points.map((point) => ({ ...point })),
    sleeping: false,
  }
}

function stepCableFrame(simulation, endpoint, deltaTime) {
  const endpointMovement = Math.hypot(
    endpoint.x - simulation.endpoint.x,
    endpoint.y - simulation.endpoint.y,
  )
  if (simulation.sleeping && endpointMovement === 0) return simulation

  const frameScale = clamp(deltaTime * 60, 0.5, 2)
  const damping = Math.pow(INERTIA, frameScale)
  const lengthResponse = 1 - Math.exp(-18 * clamp(deltaTime, 1 / 120, 1 / 30))
  const segmentLength = simulation.segmentLength
    + (targetSegmentLength(endpoint) - simulation.segmentLength) * lengthResponse
  const points = simulation.points.map((point) => ({ ...point }))
  const previousPoints = simulation.previousPoints.map((point) => ({ ...point }))

  for (let index = 1; index < points.length - 1; index += 1) {
    const point = points[index]
    const previous = previousPoints[index]
    const boundaryDamping = index <= ANCHOR_DAMPING.length
      ? Math.pow(ANCHOR_DAMPING[index - 1], frameScale)
      : 1
    const velocityX = (point.x - previous.x) * damping * boundaryDamping
    const velocityY = (point.y - previous.y) * damping * boundaryDamping
    previousPoints[index] = { ...point }
    point.x = clamp(point.x + velocityX * frameScale, ANCHOR.x, VIEWBOX.width - 4)
    point.y = clamp(point.y + velocityY * frameScale, 6, VIEWBOX.height - 6)
  }

  solveConstraints(points, endpoint, segmentLength)
  previousPoints[0] = { ...ANCHOR }
  previousPoints[1] = {
    x: points[1].x - (points[1].x - previousPoints[1].x) * 0.35,
    y: points[1].y - (points[1].y - previousPoints[1].y) * 0.35,
  }
  previousPoints[previousPoints.length - 1] = { ...endpoint }

  const nextSimulation = {
    ...simulation,
    endpoint: { ...endpoint },
    segmentLength,
    points,
    previousPoints,
    sleeping: false,
  }
  if (endpointMovement < 0.02 && getCableMotion(nextSimulation) < SLEEP_MOTION) {
    nextSimulation.previousPoints = points.map((point) => ({ ...point }))
    nextSimulation.sleeping = true
  }
  return nextSimulation
}

export function stepCableSimulation(simulation, endpoint, deltaTime) {
  const duration = clamp(deltaTime, 1 / 120, 1 / 20)
  const stepCount = Math.ceil(duration / (1 / 240))
  const start = simulation.endpoint
  let nextSimulation = simulation

  for (let step = 1; step <= stepCount; step += 1) {
    const progress = step / stepCount
    nextSimulation = stepCableFrame(nextSimulation, {
      x: start.x + (endpoint.x - start.x) * progress,
      y: start.y + (endpoint.y - start.y) * progress,
    }, duration / stepCount)
  }

  return nextSimulation
}

export function getDraggedPlugPosition(pointerPosition, dragOffset) {
  return {
    x: clamp(pointerPosition.x - dragOffset.x, LIMITS.minX, LIMITS.maxX),
    y: clamp(pointerPosition.y - dragOffset.y, LIMITS.minY, LIMITS.maxY),
  }
}

export function getCableMotion(simulation) {
  return simulation.points.slice(1, -1).reduce((maximum, point, index) => {
    const previous = simulation.previousPoints[index + 1]
    return Math.max(maximum, Math.hypot(point.x - previous.x, point.y - previous.y))
  }, 0)
}

export function stepPlugSpring(position, velocity, target, deltaTime, spring) {
  const delta = clamp(deltaTime, 1 / 120, 1 / 30)
  const acceleration = {
    x: (target.x - position.x) * spring.stiffness - velocity.x * spring.damping,
    y: (target.y - position.y) * spring.stiffness - velocity.y * spring.damping,
  }
  const nextVelocity = {
    x: velocity.x + acceleration.x * delta,
    y: velocity.y + acceleration.y * delta,
  }
  const nextPosition = {
    x: position.x + nextVelocity.x * delta,
    y: position.y + nextVelocity.y * delta,
  }
  const remainingDistance = Math.hypot(target.x - nextPosition.x, target.y - nextPosition.y)
  const speed = Math.hypot(nextVelocity.x, nextVelocity.y)

  if (remainingDistance < 0.08 && speed < 0.5) {
    return { position: { ...target }, velocity: { x: 0, y: 0 } }
  }

  return { position: nextPosition, velocity: nextVelocity }
}

export function toSmoothCablePath(points) {
  const path = points.slice(1, -2).reduce((currentPath, point, index) => {
    const next = points[index + 2]
    const midpoint = {
      x: (point.x + next.x) * 0.5,
      y: (point.y + next.y) * 0.5,
    }
    return `${currentPath} Q ${point.x.toFixed(2)} ${point.y.toFixed(2)}, ${midpoint.x.toFixed(2)} ${midpoint.y.toFixed(2)}`
  }, `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`)
  const control = points.at(-2)
  const endpoint = points.at(-1)
  return `${path} Q ${control.x.toFixed(2)} ${control.y.toFixed(2)}, ${endpoint.x.toFixed(2)} ${endpoint.y.toFixed(2)}`
}

export function getPlugAngleFromPoints(points) {
  const endpoint = points.at(-1)
  const previous = points.at(-2)
  return Math.atan2(endpoint.y - previous.y, endpoint.x - previous.x) * 180 / Math.PI
}
