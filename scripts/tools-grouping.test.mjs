import assert from 'node:assert/strict'
import { test } from 'node:test'
import { skillGroups } from '../src/data/portfolio.js'

test('tools are grouped by purpose with unique names and explicit labels', () => {
  const [development, tools] = skillGroups
  for (const name of ['HTML', 'CSS', 'JavaScript', 'React', 'Flutter', 'Python', 'PHP', 'Laravel', 'Tailwind CSS']) assert.ok(development.items.some(item => item.name === name), name)
  for (const name of ['Vite', 'ChatGPT', 'Claude', 'Hermes Agent', 'MariaDB', 'Telegram', 'GitHub']) assert.ok(tools.items.some(item => item.name === name), name)
  const items = skillGroups.flatMap(group => group.items)
  assert.equal(new Set(items.map(item => item.name)).size, items.length)
  assert.equal(items.find(item => item.name === 'Telegram').category, 'Communication')
  assert.equal(items.find(item => item.name === 'GitHub').category, 'Code & Collaboration')
  assert.ok(items.every(item => item.category !== 'Development'))
  assert.ok(!items.some(item => ['TypeScript', 'VS Code'].includes(item.name)))
})
