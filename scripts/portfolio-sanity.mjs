import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
import { projects, navLinks, contactLinks } from '../src/data/portfolio.js'

const root = new URL('../', import.meta.url)
const [app, illustration, visuals, css, revealHook] = await Promise.all([
  readFile(new URL('src/App.jsx', root), 'utf8'),
  readFile(new URL('src/components/WorkbenchIllustration.jsx', root), 'utf8'),
  readFile(new URL('src/components/ProjectVisuals.jsx', root), 'utf8'),
  readFile(new URL('src/index.css', root), 'utf8'),
  readFile(new URL('src/hooks/useRevealOnce.js', root), 'utf8'),
])
assert.doesNotMatch(app, /TKJ|student|school|HeroTerminal|reveal-on-scroll/i)
assert.doesNotMatch(app + illustration, /—/)
assert.match(app, /NETWORKS \/ SYSTEMS \/ DEVELOPMENT/)
assert.match(app, /Networking, Linux, Android kernel, mobile apps and web systems\./)
assert.match(app, /WorkbenchIllustration/)
assert.match(illustration, /className="workbench"[^>]*role="group" aria-labelledby="workbench-title workbench-desc"/)
assert.match(illustration, /className="router-wifi" role="button" tabIndex="0" aria-label="Replay router Wi-Fi signal"/)
assert.doesNotMatch(illustration, /workbench__wifi|workbench__screen|workbench__code/)
assert.doesNotMatch(css, /workbench-screen-on|workbench-code-in|workbench-wifi-pulse/)
assert.match(app, /HeroWorkbench/)
assert.match(app, /event\.pointerType !== 'mouse'/)
assert.match(css, /hero__illustration--entered/)
assert.match(css, /hero-workbench-enter \.6s/)
assert.match(css, /--hero-tilt-x/)
assert.match(css, /hero__illustration-motion/)
assert.match(visuals, /onLoad=/)
assert.match(visuals, /onError=/)
assert.match(css, /prefers-reduced-motion/)
assert.match(css, /:focus-visible/)
assert.match(revealHook, /IntersectionObserver/)
assert.doesNotMatch(illustration, /workbench--boot/)
assert.doesNotMatch(illustration, /workbench__wifi/)
assert.match(visuals, /useRevealOnce/)
assert.match(app, /contact-note-reveal/)
assert.match(css, /project-visual--entered/)
assert.match(css, /contact-note-reveal\.is-entered/)
assert.match(css, /hero-workbench-enter/)
assert.doesNotMatch(css, /\.contact-links a \{[^}]*opacity:/)
assert.doesNotMatch(css, /contact-link-in/)
assert.match(css, /contact-note-lift \.45s/)
for (const link of navLinks) assert.ok(app.includes(`id="${link.href.slice(1)}"`), `${link.label} target exists`)
assert.deepEqual(projects.map((p) => p.name), ['Micro-Core v5.4', 'Realme 8i Custom Kernel', 'PKL Management System'])
for (const project of projects) {
  assert.equal(new URL(project.url).hostname, 'github.com')
  if (project.image) await access(new URL(`public${project.image}`, root))
}
assert.equal(contactLinks.email, 'mailto:ceiingap@gmail.com')
assert.equal(contactLinks.telegram, 'https://t.me/naniicikiwir')
console.log('PASS: illustrative direction, identity, navigation targets, original projects, asset existence, contacts, image states and accessibility hooks.')
