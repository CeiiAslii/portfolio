import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { SiReact, SiVite, SiTailwindcss } from 'react-icons/si'
import { createServer } from 'vite'
import { skillGroups } from '../src/data/portfolio.js'

test('verified frontend tools appear once with their brand marks in the existing rails', async () => {

  const allSkills = skillGroups.flatMap(group => group.items)
  const additions = [['React', SiReact], ['Vite', SiVite], ['Tailwind CSS', SiTailwindcss]]

  for (const [name] of additions) {
    const group = skillGroups.find(group => group.title === (name === 'Vite' ? 'Tools & Platforms' : 'Development'))
    assert.equal(group.items.filter(skill => skill.name === name).length, 1, `${name} belongs in its functional group`)
    assert.equal(allSkills.filter(skill => skill.name === name).length, 1, `${name} is not duplicated`)
    const skill = group.items.find(skill => skill.name === name)
    assert.ok(skill.category && skill.description && skill.icon, `${name} has an inspectable note`)
  }
  for (const name of ['HTML', 'CSS', 'JavaScript']) {
    assert.equal(allSkills.filter(skill => skill.name === name).length, 1, `${name} remains unique`)
  }
  assert.ok(!allSkills.some(skill => /typescript/i.test(skill.name)))

  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  try {
    const { SkillShowcase } = await server.ssrLoadModule('/src/components/SkillShowcase.jsx')
    const markup = renderToStaticMarkup(createElement(SkillShowcase))
    for (const [name, Icon] of additions) {
      const card = markup.match(new RegExp(`<button[^>]*>(?:(?!</button>)[\\s\\S])*?<span class="skill-row-card__name">${name}</span>(?:(?!</button>)[\\s\\S])*?</button>`))?.[0]
      assert.ok(card, `${name} renders as a selectable rail button`)
      assert.match(card, /type="button"/)
      assert.match(card, /aria-pressed="false"/)
      assert.match(card, /aria-hidden="true"/)
      const expectedPaths = [...renderToStaticMarkup(createElement(Icon)).matchAll(/ d="([^"]+)"/g)]
      assert.ok(expectedPaths.length > 0)
      for (const [, path] of expectedPaths) assert.ok(card.includes(`d="${path}"`), `${name} uses its brand mark instead of the fallback`)
    }
    assert.match(markup, /id="skills-ruler" type="range"/)
    assert.match(markup, /aria-label="Selected tool notes" aria-live="polite"/)
  } finally {
    await server.close()
  }
})
