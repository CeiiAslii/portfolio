/* global document, getComputedStyle, innerWidth, HTMLInputElement, Event */
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from '/tmp/portfolio-illustration-tests/node_modules/playwright/index.mjs'
import { skillGroups } from '../src/data/portfolio.js'
const dir = new URL('../qa/tools-grouping/', import.meta.url)
await mkdir(dir, { recursive: true })
const browser = await chromium.launch({ headless: true })
const report = []
const luminance = rgb => rgb.slice(0,3).map(v => { const c=v/255; return c<=.04045?c/12.92:((c+.055)/1.055)**2.4 }).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0)
try {
 for (const mobile of [false,true]) {
  const page = await browser.newPage({viewport:{width:mobile?390:1440,height:mobile?844:1000},isMobile:mobile,hasTouch:mobile})
  const errors=[];page.on('pageerror',e=>errors.push(e.message))
  await page.goto('http://127.0.0.1:8000/?qa=tools-grouping')
  await page.locator('#skills').scrollIntoViewIfNeeded()
  for (const group of skillGroups) for (const item of group.items) {
   const button=page.getByRole('button',{name:new RegExp(`^${item.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}`)})
   const value = await button.evaluate(n => {
    const rail = n.closest('.skills-rail-viewport'), track = n.closest('.skills-rail-track')
    const max = track.offsetWidth - rail.clientWidth
    const left = n.getBoundingClientRect().left - track.getBoundingClientRect().left
    const progress = max > 0 ? Math.max(0, Math.min(100, (left + n.offsetWidth / 2 - rail.clientWidth / 2) / max * 100)) : 0
    return rail.closest('section').getAttribute('aria-label') === 'Development' ? progress : 100 - progress
   })
   await page.locator('#skills-ruler').evaluate((n, value) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(n, String(value))
    n.dispatchEvent(new Event('input', { bubbles: true }))
   }, value)
   await page.waitForTimeout(50)
   await button.scrollIntoViewIfNeeded()
   if(mobile) await button.tap(); else await button.click()
   await page.waitForTimeout(200)
   assert.equal(await page.locator('.skill-note-heading strong').textContent(),item.name)
   assert.equal(await page.locator('.skill-note-footer span').first().textContent(),group.title)
   assert.equal(await page.locator('.skill-note-footer span').last().textContent(),item.category)
   const colors=await button.locator('svg').evaluate(n=>{let s=getComputedStyle(n);return {fg:s.color,bg:s.backgroundColor==='rgba(0, 0, 0, 0)'?getComputedStyle(n.closest('button')).backgroundColor:s.backgroundColor}})
   const a=luminance(colors.fg.match(/[\d.]+/g).map(Number)),b=luminance(colors.bg.match(/[\d.]+/g).map(Number))
   const contrast=(Math.max(a,b)+.05)/(Math.min(a,b)+.05)
   assert.ok(contrast>=3,`${item.name}: ${contrast}`)
   report.push({mobile,name:item.name,group:group.title,label:item.category,...colors,contrast})
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)
  await page.locator('#skills').scrollIntoViewIfNeeded()
  await page.screenshot({path:new URL(mobile?'mobile.png':'desktop.png',dir).pathname})
  assert.deepEqual(errors,[])
  await page.close()
 }
 await writeFile(new URL('results.json',dir),JSON.stringify(report,null,2))
 console.log(`PASS: ${report.length} desktop/mobile card selections, labels, icon contrast, no overflow or page errors.`)
}finally{await browser.close()}
