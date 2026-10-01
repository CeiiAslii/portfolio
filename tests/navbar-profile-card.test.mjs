/* global process, document, innerWidth, getComputedStyle */
import assert from 'node:assert/strict'
import { test } from 'node:test'

const playwright = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const { chromium } = playwright.default || playwright
const url = process.env.PORTFOLIO_TEST_URL || 'http://localhost:5177'

async function withPage(options, check) {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage(options)
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text())
    })
    await page.goto(url)
    await check(page)
    assert.deepEqual(errors, [])
  } finally {
    await browser.close()
  }
}

test('avatar button toggles the complete profile card and ARIA state', async () => {
  await withPage({ viewport: { width: 1440, height: 1000 } }, async page => {
    const avatar = page.locator('.brand')
    const card = page.locator('#navbar-profile-card')

    assert.equal(await avatar.getAttribute('aria-label'), 'Buka kartu profil Michio')
    assert.equal(await page.getByRole('button', { name: 'Buka kartu profil Michio' }).count(), 1)
    assert.equal(await avatar.getAttribute('aria-controls'), 'navbar-profile-card')
    assert.equal(await avatar.getAttribute('aria-expanded'), 'false')
    assert.equal(await card.getAttribute('aria-hidden'), 'true')

    await avatar.click()
    assert.equal(await avatar.getAttribute('aria-label'), 'Tutup kartu profil Michio')
    assert.equal(await avatar.getAttribute('aria-expanded'), 'true')
    assert.equal(await card.getAttribute('aria-hidden'), 'false')
    await card.getByRole('heading', { name: 'Michio', exact: true }).waitFor()
    assert.match(await card.getByText('Networks, Linux, Android').textContent(), /applications/)
    assert.equal(await card.getByRole('img', { name: 'Michio' }).getAttribute('src'), '/kr0npr1nz.jpg')
    assert.equal(await card.getByRole('link', { name: 'About' }).getAttribute('href'), '#about')
    assert.equal(await card.getByRole('link', { name: 'Back to top' }).getAttribute('href'), '#home')

    await avatar.click()
    assert.equal(await avatar.getAttribute('aria-expanded'), 'false')
    assert.equal(await card.getAttribute('aria-hidden'), 'true')

    for (const key of ['Enter', 'Space']) {
      await avatar.focus()
      await page.keyboard.press(key)
      assert.equal(await avatar.getAttribute('aria-expanded'), 'true')
      await page.keyboard.press(key)
      assert.equal(await avatar.getAttribute('aria-expanded'), 'false')
    }

    await avatar.click()
    await card.getByRole('link', { name: 'Back to top' }).click()
    assert.equal(await avatar.getAttribute('aria-expanded'), 'false')
    assert.match(page.url(), /#home$/)
  })
})

test('open and close use finite transform and opacity transitions', async () => {
  await withPage({ viewport: { width: 1440, height: 1000 } }, async page => {
    const avatar = page.locator('.brand')
    const card = page.locator('#navbar-profile-card')

    await avatar.click()
    await page.waitForTimeout(20)
    assert.ok(await card.evaluate(node => node.getAnimations().filter(animation => animation.playState === 'running').length >= 2))
    await page.waitForTimeout(240)
    assert.equal(await card.evaluate(node => getComputedStyle(node).opacity), '1')
    assert.equal(await card.evaluate(node => getComputedStyle(node).transform), 'matrix(1, 0, 0, 1, 0, 0)')

    await avatar.click()
    await page.waitForTimeout(20)
    assert.ok(await card.evaluate(node => node.getAnimations().filter(animation => animation.playState === 'running').length >= 2))
    assert.equal(await card.evaluate(node => getComputedStyle(node).visibility), 'visible')
    await page.waitForTimeout(240)
    assert.equal(await card.evaluate(node => getComputedStyle(node).visibility), 'hidden')
  })
})

test('outside press and Escape close the card, with Escape restoring focus', async () => {
  await withPage({ viewport: { width: 1440, height: 1000 } }, async page => {
    const avatar = page.locator('.brand')

    await avatar.click()
    await page.locator('.hero__copy').click({ position: { x: 8, y: 220 } })
    assert.equal(await avatar.getAttribute('aria-expanded'), 'false')

    await avatar.click()
    await page.keyboard.press('Escape')
    assert.equal(await avatar.getAttribute('aria-expanded'), 'false')
    assert.equal(await avatar.evaluate(node => document.activeElement === node), true)
  })
})

test('touch layout stays in the viewport and reduced motion is static', async () => {
  await withPage({ viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' }, async page => {
    const avatar = page.locator('.brand')
    const avatarBox = await avatar.boundingBox()
    assert.ok(avatarBox.width >= 44 && avatarBox.height >= 44, JSON.stringify(avatarBox))

    await avatar.tap()
    const card = page.locator('#navbar-profile-card')
    const cardBox = await card.boundingBox()
    assert.ok(cardBox.x >= 0 && cardBox.x + cardBox.width <= 320, JSON.stringify(cardBox))
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    assert.equal(await card.evaluate(node => getComputedStyle(node).transitionDuration), '0s')
    assert.equal(await card.evaluate(node => getComputedStyle(node).transform), 'none')
    assert.equal(await card.evaluate(node => node.getAnimations({ subtree: true }).length), 0)

    await page.touchscreen.tap(310, 350)
    assert.equal(await avatar.getAttribute('aria-expanded'), 'false')
    await avatar.tap()
    await card.getByRole('link', { name: 'About' }).tap()
    assert.equal(await avatar.getAttribute('aria-expanded'), 'false')
    assert.match(page.url(), /#about$/)
  })
})
