// منع تعديل الخطوط والشعار الأصلي.
let d = '';
process.stdin.on('data', c => (d += c)).on('end', () => {
  let f = '';
  try { f = (JSON.parse(d).tool_input || {}).file_path || ''; } catch (e) { return; }
  f = f.replace(/\\/g, '/');
  if (/\/assets\/fonts\//.test(f) || /\/assets\/img\/logo-dar-alfarah\.jpg$/.test(f)) {
    process.stderr.write('ملف أصلي محمي (خط أو شعار): ' + f + '. لا تعدّله.');
    process.exit(2);
  }
});
