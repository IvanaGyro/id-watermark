import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium, firefox } from 'playwright';

const preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4321'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: process.env,
});
preview.stdout.on('data', (c) => process.stdout.write('[preview] ' + c));
preview.stderr.on('data', (c) => process.stderr.write('[preview] ' + c));
let browser;

async function readDownload(download) {
  const chunks = [];
  for await (const chunk of await download.createReadStream()) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function inspectZip(bytes) {
  let p = 0;
  const files = [];
  while (p + 4 <= bytes.length && bytes.readUInt32LE(p) === 0x04034b50) {
    const method = bytes.readUInt16LE(p+8);
    const dataSize = bytes.readUInt32LE(p+18);
    const nameLength = bytes.readUInt16LE(p+26);
    const extraLength = bytes.readUInt16LE(p+28);
    const filename = bytes.toString('utf8', p+30, p+30+nameLength);
    const start = p + 30 + nameLength + extraLength;
    const contents = bytes.subarray(start, start+dataSize);
    assert.equal(method, 0, 'ZIP must use STORE without extra compression');
    assert.equal(contents.length, dataSize, 'ZIP entry data was truncated');
    assert(dataSize > 20, 'ZIP contains an empty file');
    files.push({filename, contents});
    p = start + dataSize;
  }
  assert.equal(bytes.readUInt32LE(p), 0x02014b50, 'ZIP central directory missing');
  return files;
}

async function setRange(page, selector, value) {
  await page.locator(selector).evaluate((element, next) => {
    element.value = String(next);
    element.dispatchEvent(new Event('input', {bubbles:true}));
  }, value);
}

try {
  let ready = false;
  for (let i = 0; i < 80; i++) {
    await new Promise((r) => setTimeout(r, 250));
    if (preview.exitCode !== null) throw new Error('Preview server exited early');
    try { const r = await fetch('http://127.0.0.1:4321/id-watermark/'); if(r.ok) { ready = true; break; } } catch {}
  }
  assert(ready, 'Astro preview did not become available');
  browser = await (process.env.SMOKE_BROWSER === 'firefox' ? firefox : chromium).launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, acceptDownloads: true });
  const errors = [];
  page.on('pageerror', e => { errors.push(e.message); console.error('[PAGE ERROR]', e.stack ?? e); });
  page.on('console', msg => { if (msg.type()==='error') console.error('[CONSOLE]',msg.text()); });
  page.on('requestfailed', req => console.error('[FAILED REQUEST]',req.url(),req.failure()?.errorText));
  page.on('response', resp => { if (resp.status() >= 400) console.error('[HTTP]',resp.status(),resp.url()); });
  const imageSide = Number(process.env.SMOKE_IMAGE_SIDE ?? 40);
  assert(Number.isInteger(imageSide) && imageSide >= 20 && imageSide <= 3000);
  await page.goto(`http://127.0.0.1:4321/id-watermark/?size=${imageSide}`, {waitUntil:'networkidle'});
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

  // Upstream UI regression coverage: all range sliders, presets, masking, storage, and exports.
  const labels = [
    ['#iw-size', '#iw-size-out', 6.5, '6.5%'],
    ['#iw-angle', '#iw-angle-out', -15, '-15°'],
    ['#iw-spacing', '#iw-spacing-out', 2.3, '2.3×'],
    ['#iw-opacity', '#iw-opacity-out', 67, '67%'],
    ['#iw-quality', '#iw-quality-out', 71, '71'],
    ['#iw-png-level', '#iw-png-level-out', 5, '5'],
  ];
  for (const [input, output, value, expected] of labels) {
    await setRange(page, input, value);
    assert.equal((await page.locator(output).textContent())?.trim(), expected, `Live range label broken: ${input}`);
    console.log('[SMOKE SLIDER]', input, expected);
  }
  await page.locator('#iw-org').fill('Test Bank');
  await page.locator('#iw-purpose').fill('verification');
  await page.locator('input[name="iw-template"][value="custom"]').check({force:true});
  assert(await page.locator('#iw-custom-field').isVisible(), 'Custom text field should appear');
  await page.locator('#iw-custom').fill('FOR TESTING ONLY');
  await page.locator('input[name="iw-template"][value="apply"]').check({force:true});
  assert(await page.locator('#iw-fields').isVisible(), 'Preset fields should reappear');
  await page.locator('#iw-outline').check();
  await page.locator('input[name="iw-color"][value="#1d4ed8"]').check({force:true});
  await page.locator('#iw-date-on').uncheck();
  assert(await page.locator('#iw-date').isDisabled(), 'Date selection should disable with checkbox');
  await page.locator('#iw-date-on').check();
  await page.locator('#iw-reset').click();
  assert.equal((await page.locator('#iw-size-out').textContent())?.trim(), '4.5%', 'Reset style must restore defaults');
  await setRange(page, '#iw-quality', 72);
  await page.reload({waitUntil:'networkidle'});
  assert.equal(await page.locator('#iw-org').inputValue(), 'Test Bank', 'Saved form values must survive reload');
  assert.equal(await page.locator('#iw-quality').inputValue(), '72', 'Saved JPG quality must survive reload');
  assert.equal(await page.locator('#iw-png-level').inputValue(), '5', 'Saved PNG compression must survive reload');
  const dataURL = await page.evaluate(() => {
    const c = document.createElement('canvas');
    const side = Number(new URL(location.href).searchParams.get('size') ?? '40');
    c.width = side; c.height = Math.round(side*0.75);
    const ctx=c.getContext('2d');ctx.fillStyle='#fcfcfc';ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle='#333';ctx.fillRect(4,4,c.width/3,c.height*.6);
    return c.toDataURL('image/png');
  });
  const rawImage = Buffer.from(dataURL.split(',')[1],'base64');
  await page.locator('#iw-file').setInputFiles([
    {name:'dummy.png',mimeType:'image/png',buffer:rawImage},
    {name:'dummy-second.png',mimeType:'image/png',buffer:rawImage},
  ]);
  await page.waitForFunction(() => document.querySelector('#iw-download')?.disabled === false, {timeout: 10000});
  assert(await page.locator('#iw-zip').isVisible(), 'ZIP button should appear for two images');
  assert(await page.locator('#iw-all').isVisible(), 'Download all individually button should appear');

  await page.locator('input[name="iw-mask"][value="black"]').check({force:true});
  const rect = await page.locator('#iw-canvas').boundingBox();
  assert(rect, 'Canvas preview is missing');
  await page.mouse.move(rect.x + rect.width * .2, rect.y + rect.height * .2);
  await page.mouse.down();
  await page.mouse.move(rect.x + rect.width * .45, rect.y + rect.height * .45, {steps:5});
  await page.mouse.up();
  assert(await page.locator('#iw-undo').isEnabled(), 'Mask gesture must enable Undo');
  await page.locator('#iw-undo').click();
  assert(await page.locator('#iw-undo').isDisabled(), 'Undo should remove mask');
  await page.locator('input[name="iw-mask"][value="off"]').check({force:true});

  const formats=(process.env.SMOKE_FORMATS ?? 'jpeg,png').split(',');
  for(const format of formats) {
    await page.locator(`input[name="iw-format"][value="${format}"]`).check({force:true});
    if(format==='png') {
      assert.equal(await page.locator('#iw-png-level-field').isVisible(),true,'PNG must show lossless level');
      assert.equal(await page.locator('#iw-quality-field').isVisible(),false,'PNG must hide lossy quality');
    } else {
      assert.equal(await page.locator('#iw-quality-field').isVisible(),true,'JPG/AVIF quality must be visible');
    }
    console.log('[SMOKE START EXPORT]',format);
    const exportTimeout = imageSide >= 512 && format === 'avif' ? 240000 : 30000;
    const done = page.waitForEvent('download',{timeout:exportTimeout});
    await page.locator('#iw-download').click();
    const download=await done;
    const ext={jpeg:'.jpg',png:'.png',avif:'.avif'}[format];
    assert(download.suggestedFilename().endsWith(ext), `Wrong ${format} extension: ${download.suggestedFilename()}`);
    const bytes = await readDownload(download);
    assert(bytes.length > 20, `Empty ${format} output`);
    if (format === 'jpeg') assert.equal(bytes.subarray(0,2).toString('hex'), 'ffd8');
    if (format === 'png') assert.equal(bytes.subarray(0,8).toString('hex'), '89504e470d0a1a0a');
    if (format === 'avif') assert(bytes.toString('latin1',4,12).includes('ftyp'), 'Expected AVIF ISO-BMFF magic');
    console.log('[SMOKE EXPORT]',format,download.suggestedFilename(),bytes.length);

    // Batch ZIP was not previously tested and could crash on Firefox with AVIF.
    const zipPromise = page.waitForEvent('download', {timeout: exportTimeout * 2});
    await page.locator('#iw-zip').click();
    const zipDownload = await zipPromise;
    assert.equal(zipDownload.suggestedFilename(), 'id-watermark.zip');
    const zipBytes = await readDownload(zipDownload);
    const zipEntries = inspectZip(zipBytes);
    assert.equal(zipEntries.length,2, `Expected exactly 2 ${format} photos in ZIP`);
    for(const entry of zipEntries) {
      assert(entry.filename.endsWith(ext), `Wrong ZIP file extension: ${entry.filename}`);
      if(format==='avif') assert(entry.contents.toString('latin1',4,12).includes('ftyp'), 'AVIF inside ZIP has wrong magic');
    }
    console.log('[SMOKE ZIP]',format,zipBytes.length,zipEntries.map(x=>x.filename));
  }
  // Test the third upstream delivery option (individual files), no ZIP packaging.
  await page.locator('input[name="iw-format"][value="jpeg"]').check({force:true});
  const separate = [];
  const onDownload = (d) => separate.push(d);
  page.on('download', onDownload);
  await page.locator('#iw-all').click();
  for(let attempt=0; attempt<40 && separate.length < 2;attempt++) await page.waitForTimeout(100);
  page.off('download',onDownload);
  assert.equal(separate.length,2,'Download individually should start two downloads');
  console.log('[SMOKE ALL]',separate.map(d=>d.suggestedFilename()));
  assert.equal(errors.length,0,'Javascript errors after export');
  console.log('[SMOKE] PASS mobile preview and exports:', formats.join(', '));
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
