/* الصوت: تسجيل المعلّمة إذا موجود (audio-manifest.js)، وإلا قراءة آلية. المؤثرات مولّدة بالمتصفح. */
(function (DF) {
  'use strict';

  var enabled = true;
  var ctx = null;
  var synth = window.speechSynthesis || null;
  var voice = null;
  var queue = [];
  var current = null;   // { stop: fn }
  var gen = 0;
  var listeners = [];

  /* ---------- مؤثرات ---------- */
  function ac() {
    if (!ctx) {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      try { ctx = new C(); } catch (e) { return null; }
    }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) { /* تجاهل */ } }
    return ctx;
  }

  function tone(freq, at, dur, type, vol, slideTo) {
    var c = ctx, t0 = c.currentTime + at;
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }

  var SFX = {
    tap: function () { tone(720, 0, 0.07, 'sine', 0.12); },
    blocked: function () { tone(240, 0, 0.09, 'triangle', 0.12); },
    correct: function () {
      tone(523, 0, 0.12, 'triangle', 0.22); tone(659, 0.09, 0.12, 'triangle', 0.22); tone(784, 0.18, 0.22, 'triangle', 0.24);
    },
    wrong: function () { tone(260, 0, 0.28, 'sawtooth', 0.09, 110); tone(180, 0.02, 0.3, 'sine', 0.2, 90); },
    star: function () { tone(988, 0, 0.1, 'sine', 0.2); tone(1319, 0.08, 0.25, 'sine', 0.2); },
    win: function () {
      [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.12, 0.2, 'triangle', 0.22); });
      tone(1047, 0.5, 0.5, 'sine', 0.18);
    },
    unlock: function () {
      [784, 988, 1175, 1568].forEach(function (f, i) { tone(f, i * 0.08, 0.18, 'sine', 0.18); });
    }
  };

  function sfx(name) {
    if (!enabled || !SFX[name] || !ac()) return;
    try { SFX[name](); } catch (e) { /* تجاهل */ }
  }

  /* ---------- كلام ---------- */
  function pickVoice() {
    if (!synth) return;
    var vs = [];
    try { vs = synth.getVoices() || []; } catch (e) { /* تجاهل */ }
    var ar = vs.filter(function (v) { return /^ar/i.test(v.lang); });
    voice = ar.filter(function (v) { return /SA/i.test(v.lang); })[0] || ar[0] || null;
  }
  if (synth) {
    pickVoice();
    try { synth.addEventListener('voiceschanged', pickVoice); } catch (e) { /* تجاهل */ }
  }

  function notify() {
    var speaking = !!current || queue.length > 0;
    listeners.forEach(function (fn) { fn(speaking); });
  }

  /* عبارة = { id, text, say, parts }.
     الأولوية: ملف باسم id، ثم ملفات parts بالتتابع، ثم القراءة الآلية للنص المشكول say. */
  function resolve(p) {
    var files = DF.AUDIO_FILES || {};
    if (p.id && files[p.id]) return [{ src: files[p.id] }];
    if (p.parts && p.parts.length && p.parts.every(function (id) { return files[id]; })) {
      return p.parts.map(function (id) { return { src: files[id] }; });
    }
    return [{ text: p.say || p.text || '' }];
  }

  function pump() {
    if (current || !queue.length) { notify(); return; }
    var item = queue.shift();
    var my = gen, finished = false, timer = null;
    function fin() {
      if (finished) return;
      finished = true;
      if (timer) clearTimeout(timer);
      if (my !== gen) return;
      current = null;
      pump();
    }
    if (item.src) {
      var a = new Audio(item.src);
      current = { stop: function () { try { a.pause(); } catch (e) { /* تجاهل */ } } };
      a.onended = fin; a.onerror = fin;
      var pr = a.play();
      if (pr && pr.catch) pr.catch(fin);
    } else if (synth && item.text) {
      var u = new SpeechSynthesisUtterance(item.text);
      u.lang = (voice && voice.lang) || 'ar-SA';
      if (voice) u.voice = voice;
      u.rate = 0.85; u.pitch = 1.1;
      u.onend = fin; u.onerror = fin;
      current = { stop: function () { try { synth.cancel(); } catch (e) { /* تجاهل */ } } };
      timer = setTimeout(fin, 1500 + item.text.length * 120);   // بعض المتصفحات ما بتبعت onend
      try { synth.speak(u); } catch (e) { fin(); }
    } else {
      current = null;
      setTimeout(function () { if (my === gen) pump(); }, 0);
      return;
    }
    notify();
  }

  function stop() {
    gen++;
    queue.length = 0;
    if (current) { current.stop(); current = null; }
    else if (synth) { try { synth.cancel(); } catch (e) { /* تجاهل */ } }
    notify();
  }

  function say(p, opts) {
    if (!enabled || !p) return;
    var interrupt = opts && opts.interrupt;
    if (interrupt) stop();
    resolve(p).forEach(function (it) { queue.push(it); });
    if (interrupt) setTimeout(pump, 70);   // كروم بيضيّع الكلام إذا إجا فوراً بعد الإلغاء
    else pump();
  }

  /* لازم أول لمسة من الطفل حتى يسمح المتصفح بالصوت */
  var unlocked = false;
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    ac();
    if (synth) {
      try {
        var u = new SpeechSynthesisUtterance(' ');
        u.volume = 0; u.lang = 'ar-SA';
        synth.speak(u);
      } catch (e) { /* تجاهل */ }
    }
  }

  DF.audio = {
    sfx: sfx, say: say, stop: stop, unlock: unlock,
    setEnabled: function (on) { enabled = !!on; if (!enabled) stop(); },
    isEnabled: function () { return enabled; },
    onSpeaking: function (fn) { listeners.push(fn); }
  };
})(window.DF);
