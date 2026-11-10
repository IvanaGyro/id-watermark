import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4321'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: process.env,
});
preview.stdout.on('data', (c) => process.stdout.write('[preview] ' + c));
preview.stderr.on('data', (c) => process.stderr.write('[preview] ' + c));
let browser;

try {
  let ready = false;
  for (let i = 0; i < 80; i++) {
    await new Promise((r) => setTimeout(r, 250));
    if (preview.exitCode !== null) throw new Error('Preview server exited early');
    try { const r = await fetch('http://127.0.0.1:4321/id-watermark/'); if(r.ok) { ready = true; break; } } catch {}
  }
  assert(ready, 'Astro preview did not become available');
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, acceptDownloads: true });
  const errors = [];
  page.on('pageerror', e => { errors.push(e.message); console.error('[PAGE ERROR]', e.stack ?? e); });
  page.on('console', msg => { if (msg.type()==='error') console.error('[CONSOLE]',msg.text()); });
  page.on('requestfailed', req => console.error('[FAILED REQUEST]',req.url(),req.failure()?.errorText));
  page.on('response', resp => { if (resp.status() >= 400) console.error('[HTTP]',resp.status(),resp.url()); });
  await page.goto('http://127.0.0.1:4321/id-watermark/', {waitUntil:'networkidle'});
  await page.waitForTimeout(1500);
  const status = await page.evaluate(() => {
    const canvas = document.querySelector('#iw-canvas');
    const badge = document.querySelector('#iw-badge');
    const stage = document.querySelector('#iw-stage');
    const rect = canvas?.getBoundingClientRect();
    return { html: canvas?.tagName, canvasSize: [canvas?.width, canvas?.height], rect: rect && {width:rect.width,height:rect.height}, stageWidth:stage?.clientWidth, badgeWidth:badge?.getBoundingClientRect().width, scripts:[...document.scripts].map(s=>s.src || 'inline'), ready: document.readyState, output:document.querySelector('#iw-size-out')?.textContent };
  });
  console.log('[SMOKE INITIAL]', JSON.stringify(status));
  assert.equal(errors.length,0,'Javascript exceptions during page initialization');
  assert.equal(status.html,'CANVAS','Preview should be canvas');
  assert(status.canvasSize[0]>=500 && status.canvasSize[1]>=300,'Placeholder must be rendered (not 1x1)');
  assert(status.rect.width > 240 && status.rect.height > 130,'Visible mobile preview should not be collapsed');
  assert(status.badgeWidth > 100,'Sample badge must not be a vertical strip');

  const dataURL = await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = 40;c.height=30;
    const ctx=c.getContext('2d');ctx.fillStyle='#fcfcfc';ctx.fillRect(0,0,40,30);
    ctx.fillStyle='#333';ctx.fillRect(4,4,12,20);
    return c.toDataURL('image/png');
  });
  await page.locator('#iw-file').setInputFiles({name:'dummy.png',mimeType:'image/png',buffer:Buffer.from(dataURL.split(',')[1],'base64')});
  await page.waitForFunction(() => document.querySelector('#iw-download')?.disabled === false, {timeout: 10000});
  await page.locator('#iw-org').fill('Test Bank');
  const formats=['jpeg','png'];
  for(const format of formats) {
    await page.locator(`input[name="iw-format"][value="${format}"]`).check({force:true});
    if(format==='png') {
      assert.equal(await page.locator('#iw-png-level-field').isVisible(),true,'PNG must show lossless level');
      assert.equal(await page.locator('#iw-quality-field').isVisible(),false,'PNG must hide lossy quality');
    } else {
      assert.equal(await page.locator('#iw-quality-field').isVisible(),true,'JPG/AVIF quality must be visible');
    }
    console.log('[SMOKE START EXPORT]',format);
    const done = page.waitForEvent('download',{timeout:30000});
    await page.locator('#iw-download').click();
    const download=await done;
    const ext={jpeg:'.jpg',png:'.png',avif:'.avif'}[format];
    assert(download.suggestedFilename().endsWith(ext), `Wrong ${format} extension: ${download.suggestedFilename()}`);
    const readable=await download.createReadStream();
    let size=0;for await(const chunk of readable)size+=chunk.length;
    assert(size>20,`Empty ${format} output`);
    console.log('[SMOKE EXPORT]',format,download.suggestedFilename(),size);
  }
  assert.equal(errors.length,0,'Javascript errors after export');
  console.log('[SMOKE] PASS mobile preview, JPG, PNG');
} catch (error) {
  console.error('[SMOKE FAILED]',error);
  process.exitCode = 1;
} finally {
  await browser?.close();
  preview.kill('SIGTERM');
  preview.stdout.destroy();
  preview.stderr.destroy();
  process.exit(process.exitCode ?? 0);
}
