// بعد كل تعديل: فحص صياغة ملف JS. غلطة وحدة بتوقّف اللعبة كلها.
let d = '';
process.stdin.on('data', c => (d += c)).on('end', () => {
  let f = '';
  try { f = (JSON.parse(d).tool_input || {}).file_path || ''; } catch (e) { return; }
  if (!f.endsWith('.js')) return;
  try {
    require('child_process').execFileSync(process.execPath, ['--check', f], { stdio: ['ignore', 'ignore', 'pipe'] });
  } catch (e) {
    process.stderr.write('خطأ صياغة في ' + f + ':\n' + String(e.stderr || e.message));
    process.exit(2);
  }
});
