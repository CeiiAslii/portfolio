/* global process, window, document, getComputedStyle, innerWidth */
import assert from 'node:assert/strict'
import { test } from 'node:test'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')

const url = process.env.PORTFOLIO_TEST_URL || 'http://localhost:5177'

async function withPage(options, check) {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage(options)
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(url)
    await check(page)
    assert.deepEqual(errors, [])
  } finally {
    await browser.close()
  }
}

test('router has three idle arcs and replays once on hover, click and keyboard', async () => {
  await withPage({ viewport: { width: 1440, height: 1000 } }, async page => {
    const router = page.getByRole('button', { name: 'Replay router Wi-Fi signal' })
    assert.equal(await router.count(), 1, 'router must be an accessible control')
    assert.equal(await router.locator('.router-wifi__arc').count(), 3)
    assert.equal(await router.evaluate(node => node.getAnimations({ subtree: true }).length), 0)
    assert.equal(await router.locator('.router-wifi__arc').first().evaluate(node => getComputedStyle(node).opacity), '0')
    await router.hover()
    assert.equal(await router.evaluate(node => node.getAnimations({ subtree: true }).length), 3)
    await page.waitForTimeout(1200)
    assert.equal(await router.locator('.router-wifi__arc').first().evaluate(node => getComputedStyle(node).opacity), '0')
    assert.equal(await router.evaluate(node => node.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length), 0)
    for (const action of ['click', 'Enter', 'Space']) {
      if (action === 'click') await router.click()
      else { await router.focus(); await page.keyboard.press(action) }
      await page.waitForTimeout(40)
      assert.equal(await router.evaluate(node => node.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length), 3)
    }
  })
})

test('mobile taps replay both drawings with 44px targets and native scroll', async () => {
  await withPage({ viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true }, async page => {
    const router = page.getByRole('button', { name: 'Replay router Wi-Fi signal' })
    await router.scrollIntoViewIfNeeded()
    const box = await router.boundingBox()
    assert.ok(box.width >= 44 && box.height >= 44, JSON.stringify(box))
    await router.tap()
    assert.equal(await router.evaluate(node => node.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length), 3)
    assert.equal(await router.evaluate(node => getComputedStyle(node).touchAction), 'manipulation')
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    const kernel = page.getByRole('button', { name: 'Replay the MT6781 illustration' })
    await kernel.scrollIntoViewIfNeeded()
    await page.waitForTimeout(1400)
    await page.evaluate(() => { window.previousKernel = document.querySelector('.kernel-drawing') })
    await kernel.tap()
    await page.waitForTimeout(40)
    assert.equal(await page.evaluate(() => window.previousKernel !== document.querySelector('.kernel-drawing')), true)
  })
})

test('reduced motion leaves router and kernel static on activation', async () => {
  await withPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' }, async page => {
    for (const name of ['Replay router Wi-Fi signal', 'Replay the MT6781 illustration']) {
      const control = page.getByRole('button', { name })
      await control.click()
      await control.focus()
      await page.keyboard.press('Enter')
      assert.equal(await control.evaluate(node => node.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length), 0)
    }
  })
})

test('desktop click restarts the complete kernel sequence, including rapid clicks', async () => {
  await withPage({ viewport: { width: 1440, height: 1000 } }, async page => {
    const kernel = page.getByRole('button', { name: 'Replay the MT6781 illustration' })
    await kernel.scrollIntoViewIfNeeded()
    await page.waitForTimeout(1500)
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => { window.previousKernel = document.querySelector('.kernel-drawing') })
      await kernel.click()
      await page.waitForTimeout(40)
      assert.equal(await page.evaluate(() => window.previousKernel !== document.querySelector('.kernel-drawing')), true, 'click must restart drawing')
      assert.equal(await kernel.locator('.kernel-drawing__traces path, .kernel-drawing__pin, .kernel-drawing__chip').evaluateAll(nodes => nodes.every(node => node.getAnimations().length > 0)), true)
    }
    for (const key of ['Enter', 'Space']) {
      await page.evaluate(() => { window.previousKernel = document.querySelector('.kernel-drawing') })
      await kernel.focus()
      await page.keyboard.press(key)
      await page.waitForTimeout(40)
      assert.equal(await page.evaluate(() => window.previousKernel !== document.querySelector('.kernel-drawing')), true)
    }
  })
})
