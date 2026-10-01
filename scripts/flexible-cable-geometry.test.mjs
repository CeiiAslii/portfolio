import assert from 'node:assert/strict'
import test from 'node:test'
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
} from '../src/utils/flexibleCableGeometry.js'

const FRAME = 1 / 60

function maximumDeviationFromEndpointLine(points) {
  const start = points[0]
  const end = points.at(-1)
  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.hypot(dx, dy)
  return Math.max(...points.slice(1, -1).map((point) => (
    Math.abs(dy * point.x - dx * point.y + end.x * start.y - end.y * start.x) / length
  )))
}

function runTrajectory(framesPerLeg) {
  let simulation = createCableSimulation(REST_POSITION)
  const left = { x: REST_POSITION.x - 85, y: REST_POSITION.y + 10 }
  const waypoints = [TAUT_POSITION, left, { x: REST_POSITION.x + 18, y: REST_POSITION.y - 8 }, left]
  let start = REST_POSITION

  for (const target of waypoints) {
    for (let frame = 1; frame <= framesPerLeg; frame += 1) {
      const progress = frame / framesPerLeg
      const endpoint = {
        x: start.x + (target.x - start.x) * progress,
        y: start.y + (target.y - start.y) * progress,
      }
      simulation = stepCableSimulation(simulation, endpoint, FRAME)
    }
    start = target
  }

  return simulation
}

function segmentsIntersect(firstStart, firstEnd, secondStart, secondEnd) {
  const cross = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
  const sideOne = cross(firstStart, firstEnd, secondStart)
  const sideTwo = cross(firstStart, firstEnd, secondEnd)
  const sideThree = cross(secondStart, secondEnd, firstStart)
  const sideFour = cross(secondStart, secondEnd, firstEnd)
  return sideOne * sideTwo < 0 && sideThree * sideFour < 0
}

function hasSelfIntersection(points) {
  for (let first = 0; first < points.length - 1; first += 1) {
    for (let second = first + 2; second < points.length - 1; second += 1) {
      if (segmentsIntersect(points[first], points[first + 1], points[second], points[second + 1])) return true
    }
  }
  return false
}

test('particle cable keeps its fixed anchor and follows the plug exactly', () => {
  let simulation = createCableSimulation(REST_POSITION)
  const endpoint = { x: REST_POSITION.x - 70, y: REST_POSITION.y + 24 }

  for (let frame = 0; frame < 45; frame += 1) {
    simulation = stepCableSimulation(simulation, endpoint, FRAME)
    assert.deepEqual(simulation.points[0], simulation.anchor)
    assert.deepEqual(simulation.points.at(-1), endpoint)
  }
})

test('a held pointer can reverse from the right limit to a distant left position', () => {
  const offset = { x: 24, y: -3 }
  const right = getDraggedPlugPosition({ x: 470, y: 67 }, offset)
  const middle = getDraggedPlugPosition({ x: 360, y: 67 }, offset)
  const left = getDraggedPlugPosition({ x: 190, y: 67 }, offset)
  const reversed = getDraggedPlugPosition({ x: 330, y: 67 }, offset)

  assert.equal(right.x, LIMITS.maxX)
  assert.ok(middle.x < right.x)
  assert.equal(left.x, LIMITS.minX)
  assert.ok(LIMITS.minX <= 220)
  assert.ok(reversed.x > left.x)
})

test('pulling right progressively makes the particle cable nearly taut', () => {
  let simulation = createCableSimulation(REST_POSITION)
  const restingDeviation = maximumDeviationFromEndpointLine(simulation.points)

  for (let frame = 1; frame <= 70; frame += 1) {
    const progress = frame / 70
    simulation = stepCableSimulation(simulation, {
      x: REST_POSITION.x + (TAUT_POSITION.x - REST_POSITION.x) * progress,
      y: REST_POSITION.y,
    }, FRAME)
  }

  assert.ok(maximumDeviationFromEndpointLine(simulation.points) < restingDeviation * 0.3)
})

test('different drag rhythms produce different smooth cable shapes', () => {
  const fast = runTrajectory(10)
  const slow = runTrajectory(55)
  const difference = fast.points.slice(1, -1).reduce((sum, point, index) => {
    const other = slow.points[index + 1]
    return sum + Math.hypot(point.x - other.x, point.y - other.y)
  }, 0) / (fast.points.length - 2)

  const path = toSmoothCablePath(fast.points)
  assert.ok(difference > 4)
  assert.match(path, /^M .+ Q /)
  assert.equal(path.match(/ Q /g)?.length, fast.points.length - 2)
  assert.ok(Number.isFinite(getPlugAngleFromPoints(fast.points)))
})

test('the anchored end absorbs returning waves without forming a hook', () => {
  let simulation = createCableSimulation(REST_POSITION)
  let maximumAnchorAngle = 0

  for (let cycle = 0; cycle < 5; cycle += 1) {
    for (const target of [TAUT_POSITION, { x: LIMITS.minX, y: REST_POSITION.y }]) {
      for (let frame = 0; frame < 12; frame += 1) {
        const endpoint = simulation.points.at(-1)
        simulation = stepCableSimulation(simulation, {
          x: endpoint.x + (target.x - endpoint.x) / (12 - frame),
          y: REST_POSITION.y,
        }, FRAME)
        const first = simulation.points[0]
        const second = simulation.points[1]
        const angle = Math.abs(Math.atan2(second.y - first.y, second.x - first.x) * 180 / Math.PI)
        maximumAnchorAngle = Math.max(maximumAnchorAngle, angle)
      }
    }
  }

  for (let frame = 0; frame < 360; frame += 1) {
    simulation = stepCableSimulation(simulation, REST_POSITION, FRAME)
  }

  assert.ok(maximumAnchorAngle <= 30)
  assert.ok(getCableMotion(simulation) < 0.025)
})

test('deep left reversals add slack without folding the cable into a knot', () => {
  let simulation = createCableSimulation(REST_POSITION)
  let maximumNearAnchorTurn = 0
  const waypoints = [TAUT_POSITION, { x: LIMITS.minX, y: REST_POSITION.y }, TAUT_POSITION, { x: LIMITS.minX, y: REST_POSITION.y }]

  for (const target of waypoints) {
    const start = simulation.points.at(-1)
    for (let frame = 1; frame <= 4; frame += 1) {
      const progress = frame / 4
      simulation = stepCableSimulation(simulation, {
        x: start.x + (target.x - start.x) * progress,
        y: REST_POSITION.y,
      }, FRAME)
      for (let index = 1; index < 4; index += 1) {
        const previous = simulation.points[index - 1]
        const point = simulation.points[index]
        const next = simulation.points[index + 1]
        const incoming = { x: point.x - previous.x, y: point.y - previous.y }
        const outgoing = { x: next.x - point.x, y: next.y - point.y }
        const cosine = (incoming.x * outgoing.x + incoming.y * outgoing.y)
          / (Math.hypot(incoming.x, incoming.y) * Math.hypot(outgoing.x, outgoing.y))
        maximumNearAnchorTurn = Math.max(maximumNearAnchorTurn, Math.acos(Math.max(-1, Math.min(1, cosine))) * 180 / Math.PI)
      }
    }
  }
  for (let frame = 0; frame < 12; frame += 1) {
    simulation = stepCableSimulation(simulation, waypoints.at(-1), FRAME)
  }

  assert.equal(hasSelfIntersection(simulation.points), false)
  assert.ok(maximumNearAnchorTurn <= 45.01)
})

test('fast reversals cannot fold the cable backward into the plug', () => {
  let simulation = createCableSimulation(REST_POSITION)
  const left = { x: LIMITS.minX, y: REST_POSITION.y + 14 }
  const waypoints = [TAUT_POSITION, left, TAUT_POSITION, left, TAUT_POSITION, left]

  for (const target of waypoints) {
    const start = simulation.points.at(-1)
    for (let frame = 1; frame <= 4; frame += 1) {
      const progress = frame / 4
      simulation = stepCableSimulation(simulation, {
        x: start.x + (target.x - start.x) * progress,
        y: start.y + (target.y - start.y) * progress,
      }, FRAME)
      assert.deepEqual(simulation.points.at(-1), simulation.endpoint)
      assert.equal(hasSelfIntersection(simulation.points), false)
      assert.ok(simulation.points.every((point, index) => index === 0 || point.x > simulation.points[index - 1].x))
      assert.ok(simulation.points.every((point) => point.y >= 6 && point.y <= 134))
    }
  }

  const plugAngle = Math.abs(getPlugAngleFromPoints(simulation.points))
  const longestSegment = Math.max(...simulation.points.slice(1).map((point, index) => {
    const previous = simulation.points[index]
    return Math.hypot(point.x - previous.x, point.y - previous.y)
  }))
  assert.ok(plugAngle <= 60)
  assert.ok(simulation.points.every((point, index) => index === 0 || point.x > simulation.points[index - 1].x))
  assert.ok(simulation.points.every((point) => point.y >= 6 && point.y <= 134))
  assert.ok(longestSegment <= simulation.segmentLength * 1.35)
})

test('a sleeping cable still follows a sub-threshold endpoint movement exactly', () => {
  let simulation = createCableSimulation(REST_POSITION)
  for (let frame = 0; frame < 120 && !simulation.sleeping; frame += 1) {
    simulation = stepCableSimulation(simulation, REST_POSITION, FRAME)
  }
  assert.equal(simulation.sleeping, true)

  const endpoint = { x: REST_POSITION.x + 0.005, y: REST_POSITION.y }
  simulation = stepCableSimulation(simulation, endpoint, FRAME)

  assert.deepEqual(simulation.endpoint, endpoint)
  assert.deepEqual(simulation.points.at(-1), endpoint)
  assert.deepEqual(simulation.previousPoints.at(-1), endpoint)

  let cumulativeEndpoint = endpoint
  for (let frame = 0; frame < 8000; frame += 1) {
    cumulativeEndpoint = { x: cumulativeEndpoint.x - 0.005, y: cumulativeEndpoint.y }
    simulation = stepCableSimulation(simulation, cumulativeEndpoint, FRAME)
  }

  const longestSegment = Math.max(...simulation.points.slice(1).map((point, index) => {
    const previous = simulation.points[index]
    return Math.hypot(point.x - previous.x, point.y - previous.y)
  }))
  assert.deepEqual(simulation.endpoint, cumulativeEndpoint)
  assert.deepEqual(simulation.points.at(-1), cumulativeEndpoint)
  assert.deepEqual(simulation.previousPoints.at(-1), cumulativeEndpoint)
  assert.ok(simulation.points.every((point, index) => index === 0 || point.x > simulation.points[index - 1].x))
  assert.ok(longestSegment <= simulation.segmentLength * 1.35)
})

test('fast reversals advance continuously instead of snapping interior cable points', () => {
  let simulation = createCableSimulation(REST_POSITION)
  let endpoint = { ...REST_POSITION }
  let previousPoints = simulation.points
  let maximumPointJump = 0
  const targets = [
    TAUT_POSITION,
    { x: LIMITS.minX, y: REST_POSITION.y + 28 },
    TAUT_POSITION,
    { x: LIMITS.minX, y: REST_POSITION.y - 24 },
    TAUT_POSITION,
  ]

  for (const target of targets) {
    for (let frame = 1; frame <= 6; frame += 1) {
      const progress = frame / 6
      endpoint = {
        x: endpoint.x + (target.x - endpoint.x) * progress,
        y: endpoint.y + (target.y - endpoint.y) * progress,
      }
      simulation = stepCableSimulation(simulation, endpoint, 1 / 20)
      const interiorJump = Math.max(...simulation.points.slice(1, -1).map((point, index) => (
        Math.hypot(point.x - previousPoints[index + 1].x, point.y - previousPoints[index + 1].y)
      )))
      maximumPointJump = Math.max(maximumPointJump, interiorJump)
      previousPoints = simulation.points
    }
  }

  assert.ok(maximumPointJump < 60, `interior point jumped ${maximumPointJump.toFixed(2)} units`)
})

test('settled cable keeps its retained slack as a continuous curve', () => {
  let simulation = createCableSimulation(REST_POSITION)
  let endpoint = { ...REST_POSITION }

  for (const target of [TAUT_POSITION, { x: LIMITS.minX, y: REST_POSITION.y + 8 }, TAUT_POSITION, { x: LIMITS.minX, y: REST_POSITION.y + 8 }]) {
    for (let frame = 1; frame <= 8; frame += 1) {
      const progress = frame / 8
      endpoint = {
        x: endpoint.x + (target.x - endpoint.x) * progress,
        y: endpoint.y + (target.y - endpoint.y) * progress,
      }
      simulation = stepCableSimulation(simulation, endpoint, FRAME)
    }
  }

  for (let frame = 0; frame < 480; frame += 1) simulation = stepCableSimulation(simulation, REST_POSITION, FRAME)

  let maximumTurn = 0
  for (let index = 1; index < simulation.points.length - 1; index += 1) {
    const previous = simulation.points[index - 1]
    const point = simulation.points[index]
    const next = simulation.points[index + 1]
    const first = { x: point.x - previous.x, y: point.y - previous.y }
    const second = { x: next.x - point.x, y: next.y - point.y }
    const cosine = (first.x * second.x + first.y * second.y)
      / (Math.hypot(first.x, first.y) * Math.hypot(second.x, second.y))
    maximumTurn = Math.max(maximumTurn, Math.acos(Math.max(-1, Math.min(1, cosine))) * 180 / Math.PI)
  }

  assert.ok(maximumTurn < 30, `settled cable still has a ${maximumTurn.toFixed(2)}° kink`)
})

test('release spring settles after one or two small oscillations', () => {
  let position = { ...TAUT_POSITION }
  let velocity = { x: 90, y: 0 }
  let crossings = 0
  let previousSide = Math.sign(position.x - REST_POSITION.x)

  for (let frame = 0; frame < 240; frame += 1) {
    const next = stepPlugSpring(position, velocity, REST_POSITION, FRAME, RELEASE_SPRING)
    position = next.position
    velocity = next.velocity
    const side = Math.sign(position.x - REST_POSITION.x)
    if (side && side !== previousSide) crossings += 1
    if (side) previousSide = side
  }

  assert.ok(crossings >= 1 && crossings <= 2)
  assert.ok(Math.abs(position.x - REST_POSITION.x) < 0.2)
  assert.ok(Math.abs(velocity.x) < 0.5)
})
