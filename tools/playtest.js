#!/usr/bin/env node
/* فحص آلي: بيلعب مرحلة كاملة بثلاث مقاسات وبيطبع النتيجة نص.
   node tools/playtest.js [--world 1] [--stage 1] [--placement] [--shots <مجلد>]
   --placement: بيفحص اختبار تحديد المستوى (نجاح بغلطة وحدة، ثم رسوب بغلطتين)
   بيحتاج playwright (منصّب بالجلسات السحابية). */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
function arg(name, def) { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : def; }
const WORLD = +arg('world', 1), STAGE = +arg('stage', 1), SHOTS = arg('shots', null);
const PLACEMENT = args.includes('--placement');
const SIZES = [[390, 780, 'phone'], [1024, 768, 'tablet'], [740, 360, 'landscape']];
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.svg': 'image/svg+xml' };

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});

async function play(browser, port, W, H, tag) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push(e.message));
  page.on('requestfailed', r => errs.push('فشل تحميل ' + r.url()));
  const shot = async n => { if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, tag + '-' + n + '.png') }); } };
  const fail = m => { throw new Error(m); };

  await page.goto('http://127.0.0.1:' + port + '/index.html');
  await page.waitForTimeout(400);
  await shot('1-home');
  if (PLACEMENT && WORLD > 1) {
    await page.evaluate(w => { for (let i = 1; i < w; i++) DF.store.setPassed(i); DF.ui.startTest(DF.worldById(w)); }, WORLD);
  } else if (PLACEMENT) {
    await page.click('#btn-play');
    await page.click('[data-act="placement-yes"]');
  } else if (STAGE === 1 && WORLD === 1) {
    await page.click('#btn-play');
    await page.click('[data-act="placement-no"]');
    await page.click('[data-world="' + WORLD + '"]');
    await page.click('[data-stage="0"]');
    await shot('2-intro');
    await page.click('#btn-start');
  } else {
    await page.evaluate(([w, s]) => DF.ui.startStage(DF.worldById(w), s - 1), [WORLD, STAGE]);
  }
  await page.evaluate(() => { DF.ui.runner.speed = 9; });   // تسريع الفحص فقط

  const state = () => page.evaluate(() => {
    const r = DF.ui.runner;
    return { state: r.state, n: r.gates.length, correct: r.gates.findIndex(g => g.correct), disabled: r.gates.filter(g => g.disabled).length };
  });
  const waitFor = async want => {
    for (let i = 0; i < 250; i++) { const s = await state(); if (s.state === want && s.n) return s; await page.waitForTimeout(40); }
    fail('ما وصلت لحالة ' + want);
  };

  const total = await page.evaluate(() => DF.ui.game.qs.length);
  for (let q = 0; q < total; q++) {
    let s = await waitFor('wait');
    if (s.correct < 0) fail('سؤال ' + (q + 1) + ' بدون جواب صحيح');
    if (q === 0) await shot('3-game');
    if (q === 1) {
      await page.evaluate(l => DF.ui.runner.choose(l), (s.correct + 1) % 3);
      await page.waitForTimeout(300);
      s = await waitFor('wait');
      if (s.disabled !== 1) fail('البوابة الغلط ما تسكّرت');
      await shot('4-wrong');
    }
    await page.evaluate(l => DF.ui.runner.choose(l), s.correct);
    await page.waitForTimeout(250);
  }
  await page.waitForSelector('#screen-result:not([hidden])', { timeout: 8000 }).catch(() => fail('شاشة النتيجة ما ظهرت'));
  await page.waitForTimeout(1500);
  await shot('5-result');
  if (PLACEMENT) {
    const st = await page.evaluate(() => JSON.parse(localStorage.getItem('darfarah.arabic.v1') || '{}'));
    if (!st.passed || !st.passed['w' + WORLD]) fail('النجاح بالاختبار ما انحفظ');
    if (Object.keys(st.stages || {}).length) fail('الاختبار عطى نجوم والمفروض بدون نجوم');
    await page.click('#btn-next');
    // بعد النجاح الزر بيودّي للعالم التالي إذا جاهز: نرجع لمراحل العالم المفحوص
    await page.click('#screen-stages .back');
    if (await page.locator('[data-world="' + (WORLD + 1) + '"][disabled]').count() && await page.evaluate(w => !!(DF.worldById(w + 1) || {}).ready, WORLD)) fail('العالم التالي ما انفتح بعد النجاح');
    await page.click('[data-world="' + WORLD + '"]');
    const locked = await page.locator('#stage-list .stage[disabled]').count();
    if (locked) fail('ضل في ' + locked + ' مراحل مقفولة بعد النجاح');
    // رسوب: غلطتين
    await page.evaluate(w => { DF.store.reset(); DF.ui.startTest(DF.worldById(w)); DF.ui.runner.speed = 9; }, WORLD);
    for (let k = 0; k < 2; k++) {
      const s = await waitFor('wait');
      const wrongLane = [0, 1, 2].filter(l => l !== s.correct)[k];
      await page.evaluate(l => DF.ui.runner.choose(l), wrongLane);
      await page.waitForTimeout(400);
    }
    await page.waitForSelector('#screen-result:not([hidden])', { timeout: 8000 }).catch(() => fail('شاشة الرسوب ما ظهرت'));
    const st2 = await page.evaluate(() => DF.store.state.passed);
    if (st2 && st2['w' + WORLD]) fail('انحسب نجاح مع غلطتين');
    await shot('6-test-fail');
    if (errs.length) fail('أخطاء بالمتصفح: ' + errs.slice(0, 3).join(' | '));
    await ctx.close();
    return;
  }
  const id = 'w' + WORLD + 's' + STAGE;
  const saved = await page.evaluate(k => JSON.parse(localStorage.getItem('darfarah.arabic.v1') || '{}').stages[k], id).catch(() => null);
  if (!saved || saved.stars !== 2) fail('التقدّم ما انحفظ صح: ' + JSON.stringify(saved));
  if (errs.length) fail('أخطاء بالمتصفح: ' + errs.slice(0, 3).join(' | '));
  await ctx.close();
}

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const browser = await chromium.launch();
  let bad = 0;
  for (const [W, H, tag] of SIZES) {
    try { await play(browser, port, W, H, tag); console.log('PASS', tag, W + 'x' + H); }
    catch (e) { bad++; console.log('FAIL', tag, W + 'x' + H, '-', e.message.split('\n')[0]); }
  }
  await browser.close();
  server.close();
  console.log(bad ? 'FAIL' : 'PASS', 'w' + WORLD + 's' + STAGE, '(الصوت ما بينفحص آلياً)');
  process.exit(bad ? 1 : 0);
})();
