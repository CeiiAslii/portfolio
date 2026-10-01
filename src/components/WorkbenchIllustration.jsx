import { useEffect, useRef, useState } from 'react'
import './illustration-interactions.css'

export function WorkbenchIllustration() {
  const [signalRun, setSignalRun] = useState(0)
  const replaySignal = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setSignalRun(value => value + 1)
  }

  return (
    <svg className="workbench" viewBox="0 0 620 560" fill="none" role="group" aria-labelledby="workbench-title workbench-desc">
      <title id="workbench-title">A little closer to the hardware</title>
      <desc id="workbench-desc">An illustrated workbench with a computer, a network router and an Android phone connected by an orange cable. A Linux penguin sits on the monitor.</desc>
      <defs>
        <pattern id="desk-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(28)"><path d="M0 0V8" stroke="#242b27" strokeWidth="1" opacity=".16" /></pattern>
      </defs>
      <path d="M74 388C52 311 79 185 156 121 227 61 336 57 423 117 506 174 557 291 529 391Z" fill="#e5e8d9" />
      <g stroke="#242b27" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m47 402 373-31 158 69-382 39Z" fill="#eadfca" />
        <path d="m47 402 149 77 382-39v16l-382 40L47 420Z" fill="#f9f4e8" />
        <path d="m47 402 149 77v17L47 420Z" fill="url(#desk-hatch)" />
        <path d="m86 438 1 75m19-65 1 70m413-49-1 41m20-43-1 49" />
        <path d="m236 353-3 39 61 21 60-6-64-23 1-33" fill="#eadfca" />
        <path d="m151 166 229-14q11-1 13 11l14 176q1 10-10 11l-231 20q-10 1-11-11l-15-179q-1-12 11-14Z" fill="#242b27" />
        <path d="m139 160 229-14q11-1 12 11l14 176q1 10-10 11l-231 20q-10 1-11-11l-15-179q-1-12 12-14Z" fill="#f9f4e8" />
        <path d="m144 176 220-14 12 150-220 19Z" fill="#d9dec9" />
        <path d="m153 335 222-18" />
        <circle cx="268" cy="339" r="4" fill="#ba4927" />
        <path d="m162 193 54-4m-51 14 34-3" strokeWidth="2" />
        <path d="m240 231-22 21 24 17m49-40 23 17-20 21m-29-44-10 52" strokeWidth="5" />
        <path d="m335 185 8 0m-7 8 8-1" />
        <path d="m168 289 53-4m-52 12 86-7" strokeWidth="2" />
        <path d="m176 412 138-12 59 29-140 15Z" fill="#f9f4e8" />
        <path d="m176 412 1 8 57 32 139-15v-8m-140 15 1 8" />
        <path d="m191 413 123-10m-112 17 125-11m-111 18 123-12m-125-6 27 18m-10-19 26 18m-9-20 27 19m-9-20 26 18m-9-19 26 17m-84 13 57-6" strokeWidth="1.5" />
        <path d="M397 412c-14-8-27-9-35-4-7 5-2 13 13 18 18 6 33-7 22-14Z" fill="#f9f4e8" />
        <path d="m377 408 9 5" />
        <path d="M389 400c48-50 50-57 22-67-23-8-1-40 23-45" stroke="#ba4927" strokeWidth="4" />
        <path d="m427 244 76 14 3 110-77-17Z" fill="#242b27" />
        <path d="m421 240 75 14 3 109-77-17Z" fill="#f9f4e8" />
        <path d="m430 257 56 11 2 71-57-12Z" fill="#e8b798" />
        <path d="m447 254 15 3" />
        <circle cx="459" cy="343" r="3" />
        <path d="m444 292 3-3m18 6 3-3m-29 6 33 7-1 17-31-7Z" fill="#f9f4e8" />
        <path d="m446 291-4-6m23 10 5-5" />
        <path d="m83 365 62-6 39 21-65 8Z" fill="#d9dec9" />
        <path d="m83 365 1 22 35 19 65-8v-18l-65 8Z" fill="#f9f4e8" />
        <path d="m119 388 0 18m8-12 6-1m6-1 6-1m6-1 6-1m6-1 6-1M99 364l-4-54m51 50-1-56" />
        <path d="M117 411c-27 15-56 22-42 41 14 20 44 14 46 36s-25 25-44 24" stroke="#ba4927" strokeWidth="4" />
        <path d="m70 505 9-1 1 15-9 1Z" fill="#ba4927" />
        <path d="M256 146c-10-17-8-43 1-57 5-9 18-10 25-2 13 15 17 42 10 57" fill="#242b27" />
        <path d="M258 142c-6-12-3-33 8-35 13-1 21 22 17 34" fill="#f9f4e8" />
        <ellipse cx="266" cy="99" rx="4" ry="6" fill="#f9f4e8" stroke="none" />
        <ellipse cx="277" cy="99" rx="4" ry="6" fill="#f9f4e8" stroke="none" />
        <path d="m266 107 7 5 8-7" fill="#ba4927" />
        <path d="m253 141 16 4-17 7-9-4Zm29 0 15 1 7 7-23 1Z" fill="#ba4927" />
        <path d="m436 405 48-5 30 15-50 6Z" fill="#ba4927" />
        <path d="m436 405 1 7 28 15 49-6v-6m-49 6v6" fill="#f9f4e8" />
        <path d="m448 405 30-3" />
      </g>
      <g fill="#242b27" fontFamily="'DM Sans', sans-serif" fontSize="14">
        <text x="406" y="119" transform="rotate(6 406 119)">a little closer</text>
        <text x="420" y="139" transform="rotate(6 420 139)">to the hardware.</text>
        <text x="22" y="278" transform="rotate(-7 22 278)">stay connected</text>
      </g>
      <g stroke="#242b27" strokeWidth="1.5" strokeLinecap="round">
        <path d="M452 155q-4 36-48 52m2-8-2 8 9-1M62 290q-2 25 22 35m-7-1 7 1-2-7" />
        <path d="m178 112-6-13m16 9 2-14m-22 27-13-4" />
      </g>
      <g className="router-wifi" role="button" tabIndex="0" aria-label="Replay router Wi-Fi signal"
        onPointerEnter={event => { if (event.pointerType === 'mouse') replaySignal() }}
        onClick={replaySignal}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            replaySignal()
          }
        }}>
        <rect className="router-wifi__target" x="74" y="282" width="116" height="130" rx="6" />
        <g key={signalRun} className={signalRun ? 'router-wifi__signal router-wifi__signal--active' : 'router-wifi__signal'}
          stroke="#ba4927" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <path className="router-wifi__arc" d="M111 323q8-8 16 0" />
          <path className="router-wifi__arc" d="M104 315q15-15 30 0" />
          <path className="router-wifi__arc" d="M97 307q22-22 44 0" />
        </g>
      </g>
    </svg>
  )
}

export function KernelIllustration() {
  const frameRef = useRef(0)
  const rootRef = useRef(null)
  const [run, setRun] = useState(0)

  const replay = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => setRun((value) => value + 1))
  }

  useEffect(() => {
    const node = rootRef.current
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      replay()
      observer.disconnect()
    }, { threshold: 0.35 })
    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frameRef.current)
    }
  }, [])

  return (
    <div ref={rootRef} className="kernel-illustration" role="button" tabIndex="0" aria-label="Replay the MT6781 illustration" onClick={replay} onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        replay()
      }
    }}>
      <svg key={run} className="kernel-drawing kernel-drawing--animate" viewBox="0 0 440 280" fill="none" role="img" aria-label="MT6781 under the hood illustration">
        <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m101 151 121-77 124 74-122 83Z" fill="#d9dec9" />
          <path d="m101 151 1 16 122 83 122-86v-16l-122 83Z" fill="#f9f4e8" />
          <g className="kernel-drawing__chip">
            <path d="m155 142 65-41 73 42-69 46Z" fill="#242b27" />
            <path d="m157 127 64-42 74 42-71 48Z" fill="#f9f4e8" />
            <path d="m157 127-2 15m140-15-2 16m-69 32v14" />
          </g>
          <g className="kernel-drawing__pins">
            {[0, 1, 2, 3, 4, 5].map((i) => <g className="kernel-drawing__pin" key={i}><path d={`M${113 + i * 16} ${161 + i * 11} l-16 12v9 M${127 + i * 17} ${135 - i * 11} l-19-12 M${249 + i * 16} ${221 - i * 11} l19 12v9 M${253 + i * 16} ${93 + i * 10} l19-12`} /></g>)}
          </g>
          <g className="kernel-drawing__traces" stroke="#ba4927" strokeWidth="2.5">
            <path pathLength="1" d="M25 226H63L122 190" />
            <path pathLength="1" d="M420 218H371L325 188" />
            <path pathLength="1" d="M49 83H94L145 114" />
          </g>
          <circle cx="25" cy="226" r="4" fill="#ba4927" /><circle cx="420" cy="218" r="4" fill="#ba4927" />
        </g>
        <text className="kernel-drawing__label" x="183" y="129" fill="currentColor" fontFamily="'DM Sans', sans-serif" fontSize="15" transform="rotate(-2 183 129)">MT6781</text>
        <text x="43" y="69" fill="currentColor" fontFamily="'DM Sans', sans-serif" fontSize="13">under the hood</text>
      </svg>
    </div>
  )
}
