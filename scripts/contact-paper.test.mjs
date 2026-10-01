import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('contact paper motion preserves links and separates lift from rotation', () => {
  const source = readFileSync(new URL('../src/components/ContactPaper.jsx', import.meta.url), 'utf8')
  assert.match(source, /closest\('a'\)/)
  assert.match(source, /prefers-reduced-motion/)
  assert.match(source, /pointerType === 'mouse'/)
  assert.match(source, /translate:/)
  assert.doesNotMatch(source, /opacity|visibility|preventDefault\(\).*click/)
})
