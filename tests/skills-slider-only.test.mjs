/* global document, getComputedStyle, innerWidth */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdir, writeFile } from 'node:fs/promises'
import process from 'node:process'
import { URL } from 'node:url'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || '/tmp/portfolio-illustration-tests/node_modules/playwright/index.mjs')
const dir = new URL('../qa/slider-only/', import.meta.url)
await mkdir(dir, { recursive: true })

for (const mobile of [false, true]) test(`slider is the sole rail control on ${mobile ? 'mobile' : 'desktop'}`, async () => {
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ viewport: { width: mobile ? 390 : 1440, height: mobile ? 844 : 1000 }, isMobile: mobile, hasTouch: mobile })
    const errors = []
    page.on('pageerror', e => errors.push(e.message))
    await page.goto(process.env.PORTFOLIO_TEST_URL || 'http://127.0.0.1:8000/')
    const slider = page.locator('#skills-ruler')
    await slider.scrollIntoViewIfNeeded()
    await page.waitForTimeout(600)
    const rails = page.locator('.skills-rail-viewport')
    const styles = await rails.evaluateAll(ns => ns.map(n => { const s=getComputedStyle(n); return { border:s.borderBottomWidth, overflow:s.overflowX, cursor:s.cursor } }))
    assert.ok(styles.every(s => s.border === '0px' && s.overflow === 'clip' && s.cursor !== 'grab'), JSON.stringify(styles))
    const positions = () => rails.evaluateAll(ns => ns.map(n => n.querySelector('.skills-rail-track').getBoundingClientRect().left - n.getBoundingClientRect().left))
    const selected = () => page.locator('.skill-note-heading strong').textContent()
    const initialSelection = await selected()
    const cdp = await page.context().newCDPSession(page)
    const gesture = async (start, points) => {
      if (mobile) {
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:start.x,y:start.y}]})
        for(const point of points) { await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[point]}); await page.waitForTimeout(20) }
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})
      } else {
        await page.mouse.move(start.x,start.y); await page.mouse.down()
        for(const point of points) await page.mouse.move(point.x,point.y,{steps:3})
        await page.mouse.up()
      }
    }
    const box=await slider.boundingBox()
    assert.ok(box.height >= 44)
    const x=value=>box.x+22+(box.width-44)*value/100
    const y=box.y+box.height/2
    const samples=[]
    for(const target of [10,90,50]) {
      const from=Number(await slider.inputValue())
      const points=Array.from({length:12},(_,i)=>({x:x(from+(target-from)*(i+1)/12),y}))
      await gesture({x:x(from),y},points)
      const value=Number(await slider.inputValue())
      assert.ok(Math.abs(value-target)<2,`slider ${value}, target ${target}`)
      const offsets=await positions()
      const ranges=await rails.evaluateAll(ns=>ns.map(n=>n.querySelector('.skills-rail-track').getBoundingClientRect().width-n.clientWidth))
      offsets.forEach((offset,i)=>assert.ok(Math.abs(offset+ranges[i]*(i===0?value:100-value)/100)<2,JSON.stringify({offsets,ranges,value})))
      assert.equal(await selected(),initialSelection,'slider must not select cards')
      samples.push({value,offsets})
    }
    const before=await positions()
    for(let i=0;i<2;i++) {
      const rail=rails.nth(i)
      await rail.scrollIntoViewIfNeeded()
      const r=await rail.boundingBox()
      await gesture({x:r.x+r.width*.65,y:r.y+45},Array.from({length:8},(_,n)=>({x:r.x+r.width*(.65-.3*(n+1)/8),y:r.y+45})))
      await page.mouse.move(r.x+r.width/2,r.y+45)
      await page.mouse.wheel(180,0)
      await page.waitForTimeout(150)
      assert.deepEqual(await positions(),before,'rail drag/swipe/wheel must not move cards')
      const buttons=rail.locator('button')
      const index=await buttons.evaluateAll(ns=>ns.findIndex(n=>{const b=n.getBoundingClientRect(),r=n.closest('.skills-rail-viewport').getBoundingClientRect();return b.left>=r.left&&b.right<=r.right}))
      assert.ok(index>=0)
      const button=buttons.nth(index)
      const name=await button.locator('.skill-row-card__name').textContent()
      if(mobile) await button.tap(); else await button.click()
      assert.equal(await selected(),name)
      assert.deepEqual(await positions(),before,'card selection must not move rows')
      assert.equal(await button.evaluate(n=>getComputedStyle(n).borderTopWidth),'1px')
      assert.equal(await button.locator('.skill-row-card__selection').evaluate(n=>getComputedStyle(n).borderTopWidth),'1px')
    }
    await slider.focus()
    await page.keyboard.press('Home')
    assert.equal(Number(await slider.inputValue()),0)
    await page.keyboard.press('End')
    assert.equal(Number(await slider.inputValue()),100)
    await page.keyboard.press('Home')
    await page.keyboard.press('ArrowRight')
    assert.ok(Number(await slider.inputValue())>0)
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
    await page.locator('#skills').scrollIntoViewIfNeeded()
    await page.screenshot({path:new URL(mobile?'mobile.png':'desktop.png',dir).pathname,fullPage:false})
    assert.deepEqual(errors,[])
    await writeFile(new URL(mobile?'mobile.json':'desktop.json',dir),JSON.stringify({styles,samples,errors,railGestures:'no movement',selection:'no movement',keyboard:'pass'},null,2))
  } finally { await browser.close() }
})
