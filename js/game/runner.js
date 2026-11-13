/* محرّك اللعب: ثلاث مسارات وبوابات، الكاميرا خلف الشخصية.
   الصح بيعبر، الغلط بيخبط وبيرجع لورا والبوابة بتتسكّر.
   الأحداث: choose, blocked, correct, wrong, passed */
(function (DF) {
  'use strict';
  var U = DF.util, D = DF.draw;

  var ZC = 3.2;        // بُعد الشخصية عن الكاميرا
  var ZSTOP = 4.7;     // وين بتوقف البوابات وتنتظر
  var ZFAR = 12;     // وين بتظهر
  var ZRET = 6.8;      // لوين بترجع بعد الخبطة
  var CAMH = 1.9;      // ارتفاع الكاميرا
  var ROAD = 1.62;     // نصف عرض الطريق
  var GW = 0.92, GH = 2.05;
  var CARD_W = 0.74, CARD_H = 0.88, CARD_Y = 1.15;
  var SEG = 1.6, LOOP = 20;

  var LANES = [
    { frame: '#3f86cf', dark: '#2f69a6', door: '#a9d1f5' },
    { frame: '#f0a431', dark: '#c98120', door: '#fbdfa6' },
    { frame: '#9a66cc', dark: '#774aa6', door: '#dcc6f2' }
  ];
  var CONFETTI = ['#f6b93b', '#e56b5d', '#3f86cf', '#9a66cc', '#7fb069', '#ffffff'];
  var EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  var LETTER_FONT = '"Thmanyah","Noto Naskh Arabic","Geeza Pro",Tahoma,sans-serif';

  var SCENERY = [
    { x: -2.4, s: 1, type: 'tree' }, { x: 1.95, s: 2.5, type: 'flower', hue: 0 },
    { x: 2.6, s: 4, type: 'bush' }, { x: -1.95, s: 6, type: 'flower', hue: 1 },
    { x: 3.5, s: 7, type: 'tree' }, { x: -3.0, s: 9, type: 'bush' },
    { x: 2.3, s: 11, type: 'tree' }, { x: -2.0, s: 12.5, type: 'flower', hue: 2 },
    { x: -3.8, s: 14, type: 'tree' }, { x: 2.0, s: 15.5, type: 'flower', hue: 1 },
    { x: -2.5, s: 17, type: 'bush' }, { x: 3.0, s: 18.5, type: 'bush' }
  ];
  var FLOWERS = ['#e56b8a', '#f6b93b', '#ffffff'];

  function Runner(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.handlers = {};
    this.character = DF.CHARACTERS[0];
    this.speed = 2.1;
    this.wait = true;
    this.hint = false;
    this.hudBottom = 150;
    this.W = 0; this.H = 0; this.dpr = 1;
    this.raf = 0; this.last = 0; this.paused = false;
    this.reset();
    this._bind();
    var self = this;
    this._frame = function (now) { self._tick(now); };
  }

  var P = Runner.prototype;

  P.on = function (ev, fn) { this.handlers[ev] = fn; };
  P.emit = function (ev, a) { if (this.handlers[ev]) this.handlers[ev](a); };

  P.reset = function () {
    this.state = 'idle';
    this.t = 0; this.dist = 0;
    this.gateZ = ZFAR; this.gates = [];
    this.lane = 1; this.charX = 0; this.camX = 0;
    this.chosen = null; this.dashV = 0;
    this.particles = [];
    this.shake = 0; this.hitT = 0; this.hopT = 0;
    this.waitT = 0; this.bumpT = 0; this.bumpFrom = 0;
    this.phase = 0; this.vNow = 0; this.finishT = 0;
  };

  P.configure = function (o) {
    if (o.character) this.character = o.character;
    if (o.speed) this.speed = o.speed;
    if (o.wait != null) this.wait = o.wait;
    this.hint = !!o.hint;
    if (o.hudBottom != null) this.hudBottom = o.hudBottom;
  };

  /* ---------- القياسات ---------- */
  P.resize = function () {
    var r = this.canvas.getBoundingClientRect();
    if (r.width < 10 || r.height < 10) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = r.width; this.H = r.height; this.dpr = dpr;
    this.canvas.width = Math.round(r.width * dpr);
    this.canvas.height = Math.round(r.height * dpr);
    var hz0 = Math.max(this.H * 0.32, this.hudBottom + 44);
    this.F = Math.min(this.W * 0.293 * ZSTOP, (this.H - hz0) / 0.68);
    this.hz = Math.max(hz0, this.H - this.F * 0.68 - this.H * 0.2);
    this._buildBackground();
    for (var i = 0; i < this.gates.length; i++) this.gates[i].card = this._makeCard(this.gates[i].opt);
    if (!this.raf) this.render();
  };

  P._buildBackground = function () {
    var W = this.W, hz = Math.ceil(this.hz), dpr = this.dpr;
    var b = document.createElement('canvas');
    b.width = Math.round(W * dpr); b.height = Math.round(hz * dpr);
    var c = b.getContext('2d');
    c.scale(dpr, dpr);
    var g = c.createLinearGradient(0, 0, 0, hz);
    g.addColorStop(0, '#8ed0f1'); g.addColorStop(1, '#e3f5fb');
    c.fillStyle = g; c.fillRect(0, 0, W, hz);

    var sx = W * 0.14, sy = hz * 0.7, sr = Math.max(18, Math.min(W, hz) * 0.09);
    var sg = c.createRadialGradient(sx, sy, sr * 0.4, sx, sy, sr * 2.6);
    sg.addColorStop(0, 'rgba(255,240,170,.9)'); sg.addColorStop(1, 'rgba(255,240,170,0)');
    c.fillStyle = sg; c.fillRect(sx - sr * 3, sy - sr * 3, sr * 6, sr * 6);
    c.fillStyle = '#ffd95e'; D.ell(c, sx, sy, sr, sr);

    c.fillStyle = 'rgba(255,255,255,.9)';
    [[0.7, 0.62, 1], [0.36, 0.5, 0.75], [0.92, 0.8, 0.6]].forEach(function (cl) {
      var x = W * cl[0], y = hz * cl[1], r = Math.max(10, hz * 0.06) * cl[2];
      D.ell(c, x, y, r * 1.5, r * 0.8); D.ell(c, x - r * 1.1, y + r * 0.2, r, r * 0.6); D.ell(c, x + r * 1.2, y + r * 0.25, r * 1.1, r * 0.6);
    });

    function hills(color, amp, base, f1, f2, p) {
      c.fillStyle = color; c.beginPath(); c.moveTo(0, hz);
      for (var x = 0; x <= W; x += 6) {
        var y = hz - base - amp * (0.5 + 0.5 * Math.sin(x * f1 + p)) - amp * 0.4 * Math.sin(x * f2 + p * 2);
        c.lineTo(x, y);
      }
      c.lineTo(W, hz); c.closePath(); c.fill();
    }
    var k = Math.max(0.7, Math.min(1.6, W / 400));
    hills('#b5dcc0', hz * 0.11, hz * 0.03, 0.011 / k, 0.027 / k, 1.2);
    hills('#93cc8f', hz * 0.06, hz * 0.005, 0.017 / k, 0.041 / k, 4.0);
    this.bg = b;
  };

  /* بطاقة الخيار (حرف أو صورة) بترسم مرة وحدة، وبعدين بتتكبّر وبتتصغّر كصورة */
  P._makeCard = function (opt) {
    var px = Math.max(96, Math.min(512, Math.ceil(CARD_W * this.F / ZSTOP * this.dpr * 1.5)));
    var w = px, h = Math.round(px * CARD_H / CARD_W);
    var cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    var c = cv.getContext('2d');
    c.fillStyle = '#fffdf6';
    D.rr(c, 2, 2, w - 4, h - 4, w * 0.16); c.fill();
    c.strokeStyle = 'rgba(60,70,50,.16)'; c.lineWidth = Math.max(2, w * 0.02);
    D.rr(c, 2, 2, w - 4, h - 4, w * 0.16); c.stroke();

    var img = opt.kind === 'pic' && opt.img ? this._image(opt.img) : null;
    if (img && img.ok) {
      var m = w * 0.12, bw = w - 2 * m, bh = h - 2 * m;
      var sc = Math.min(bw / img.el.naturalWidth, bh / img.el.naturalHeight);
      var iw = img.el.naturalWidth * sc, ih = img.el.naturalHeight * sc;
      c.drawImage(img.el, (w - iw) / 2, (h - ih) / 2, iw, ih);
      return cv;
    }
    var text = opt.kind === 'pic' ? opt.emoji : opt.text;
    var size = opt.kind === 'pic' ? w * 0.6 : w * 0.72;
    c.font = (opt.kind === 'pic' ? '' : '500 ') + size + 'px ' + (opt.kind === 'pic' ? EMOJI_FONT : LETTER_FONT);
    c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    c.fillStyle = '#2c3a26';
    var mt = c.measureText(text);
    var asc = mt.actualBoundingBoxAscent, desc = mt.actualBoundingBoxDescent;
    var bx = (mt.actualBoundingBoxRight - mt.actualBoundingBoxLeft) / 2;
    if (!isFinite(asc) || !isFinite(desc)) { asc = size * 0.7; desc = size * 0.2; bx = 0; }
    c.fillText(text, w / 2 - (isFinite(bx) ? bx : 0), h / 2 + (asc - desc) / 2);
    return cv;
  };

  P._image = function (src) {
    this._imgs = this._imgs || {};
    var rec = this._imgs[src], self = this;
    if (!rec) {
      rec = this._imgs[src] = { el: new Image(), ok: false };
      rec.el.onload = function () {
        rec.ok = true;
        self.gates.forEach(function (g) { if (g.opt.img === src) g.card = self._makeCard(g.opt); });
      };
      rec.el.src = src;
    }
    return rec;
  };

  /* ---------- التحكّم ---------- */
  P.ask = function (options, correct) {
    var self = this;
    this.gates = options.map(function (o, i) {
      return { opt: o, correct: i === correct, disabled: false, open: 0, shake: 0, card: self._makeCard(o) };
    });
    this.gateZ = ZFAR;
    this.chosen = null;
    this.waitT = 0;
    this.state = 'approach';
  };

  P.choose = function (l) {
    if (this.paused) return;
    if (this.state !== 'approach' && this.state !== 'wait') return;
    l = U.clamp(l, 0, 2);
    var g = this.gates[l];
    if (!g) return;
    if (g.disabled) { g.shake = 0.6; this.emit('blocked', l); return; }
    this.lane = l; this.chosen = l;
    this.dashV = 3;
    this.state = 'dash';
    this.emit('choose', l);
  };

  P.finish = function () { this.state = 'finish'; this.finishT = 0; this.gates = []; };

  P._bind = function () {
    var self = this, cv = this.canvas, down = null;
    cv.addEventListener('pointerdown', function (e) {
      down = { x: e.clientX, y: e.clientY };
    });
    cv.addEventListener('pointerup', function (e) {
      if (!down) return;
      var dx = e.clientX - down.x, dy = e.clientY - down.y;
      down = null;
      if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy)) {
        self.choose(self.lane + (dx > 0 ? 1 : -1));
      } else {
        var r = cv.getBoundingClientRect();
        var lane = Math.round((e.clientX - r.left - self.W / 2) / (self.F / ZSTOP) + self.camX) + 1;
        self.choose(lane);
      }
    });
    cv.addEventListener('pointercancel', function () { down = null; });
    this._key = function (e) {
      if (!self.raf || self.paused) return;
      if (e.key === 'ArrowLeft') self.choose(self.lane - 1);
      else if (e.key === 'ArrowRight') self.choose(self.lane + 1);
      else if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'Enter') self.choose(self.lane);
      else if (e.key === '1' || e.key === '2' || e.key === '3') self.choose(+e.key - 1);
    };
    window.addEventListener('keydown', this._key);
  };

  P.start = function () {
    this.paused = false;
    if (this.raf) return;
    this.last = 0;
    this.raf = requestAnimationFrame(this._frame);
  };
  P.stop = function () {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  };
  P.pause = function () { this.paused = true; };
  P.resume = function () { this.paused = false; this.last = 0; };

  P._tick = function (now) {
    this.raf = requestAnimationFrame(this._frame);
    var dt = this.last ? (now - this.last) / 1000 : 0.016;
    this.last = now;
    if (this.paused) return;
    this.update(Math.min(dt, 0.05));
    this.render();
  };

  /* ---------- المنطق ---------- */
  P.update = function (dt) {
    this.t += dt;
    var v = 0, g;
    switch (this.state) {
      case 'approach':
        v = this.speed;
        this.gateZ -= v * dt;
        if (this.gateZ <= ZSTOP) {
          this.gateZ = ZSTOP;
          if (this.wait) { this.state = 'wait'; this.waitT = 0; v = 0; }
          else this.choose(this.lane);
        }
        break;
      case 'wait':
        this.waitT += dt;
        break;
      case 'dash':
        g = this.gates[this.chosen];
        this.dashV = Math.min(this.dashV + 16 * dt, 8);
        v = Math.abs(this.charX - (this.lane - 1)) < 0.3 ? this.dashV : 1.0;
        this.gateZ -= v * dt;
        if (g.correct && this.gateZ < ZC + 1.5) g.open = Math.min(1, g.open + dt * 6);
        if (this.gateZ <= ZC + 0.32) {
          if (g.correct) {
            this.state = 'pass';
            this.hopT = 0.5;
            this._burst(this.W / 2 + (this.charX - this.camX) * this.F / ZC, this.hz + (CAMH - 0.5) * this.F / ZC, 26);
            this.emit('correct', this.chosen);
          } else {
            this.state = 'bump';
            this.bumpT = 0; this.bumpFrom = this.gateZ;
            g.disabled = true; g.shake = 1;
            this.hitT = 0.8; this.shake = 0.35;
            this.emit('wrong', this.chosen);
          }
        }
        break;
      case 'pass':
        g = this.gates[this.chosen];
        if (g) g.open = Math.min(1, g.open + dt * 6);
        v = 6.5;
        this.gateZ -= v * dt;
        if (this.gateZ < 0.5) {
          this.gates = []; this.chosen = null;
          this.state = 'run';
          this.emit('passed');
        }
        break;
      case 'bump':
        this.bumpT += dt;
        var k = Math.min(1, this.bumpT / 0.6), e = 1 - (1 - k) * (1 - k);
        var z = this.bumpFrom + (ZRET - this.bumpFrom) * e;
        v = -(z - this.gateZ) / dt;
        this.gateZ = z;
        if (k >= 1) { this.state = 'approach'; this.chosen = null; v = 0; }
        break;
      case 'run':
        v = this.speed;
        break;
      case 'finish':
        v = this.speed * 1.6;
        this.finishT += dt;
        if (Math.random() < dt * 30) {
          this._spawn(Math.random() * this.W, -10, (Math.random() - 0.5) * 60, 120 + Math.random() * 120, 2.4);
        }
        break;
    }
    this.dist += v * dt;
    this.vNow = v;
    if (v > 0.1) this.phase += dt * (6 + v * 1.5);

    var target = this.lane - 1, d = target - this.charX, step = 7 * dt;
    this.charX += Math.abs(d) <= step ? d : (d > 0 ? step : -step);
    this.camX = this.charX * 0.2;

    if (this.hitT > 0) this.hitT = Math.max(0, this.hitT - dt);
    if (this.hopT > 0) this.hopT = Math.max(0, this.hopT - dt);
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt);
    for (var i = 0; i < this.gates.length; i++) {
      if (this.gates[i].shake > 0) this.gates[i].shake = Math.max(0, this.gates[i].shake - dt * 1.6);
    }
    for (var j = this.particles.length - 1; j >= 0; j--) {
      var p = this.particles[j];
      p.life -= dt;
      if (p.life <= 0) { this.particles.splice(j, 1); continue; }
      p.vy += 520 * dt * p.grav;
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.spin * dt;
    }
  };

  P._spawn = function (x, y, vx, vy, life) {
    this.particles.push({
      x: x, y: y, vx: vx, vy: vy, life: life, max: life, grav: 0.35,
      size: 6 + Math.random() * 7, rot: Math.random() * 6, spin: (Math.random() - 0.5) * 8,
      color: U.pick(CONFETTI), star: Math.random() < 0.5
    });
  };

  P._burst = function (x, y, n) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, sp = 120 + Math.random() * 260;
      this.particles.push({
        x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 160, life: 0.7 + Math.random() * 0.5, max: 1.2, grav: 1,
        size: 6 + Math.random() * 8, rot: Math.random() * 6, spin: (Math.random() - 0.5) * 10,
        color: U.pick(CONFETTI), star: Math.random() < 0.6
      });
    }
  };

  /* ---------- الرسم ---------- */
  P.render = function () {
    var c = this.ctx, W = this.W, H = this.H, F = this.F, hz = this.hz, dpr = this.dpr;
    if (!W || !this.bg) return;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, W, H);
    c.save();
    if (this.shake > 0) {
      c.translate(Math.sin(this.t * 70) * 7 * this.shake, Math.cos(this.t * 55) * 5 * this.shake);
    }

    c.drawImage(this.bg, 0, 0, W, Math.ceil(hz));
    this._ground();
    this._scenery();

    var behind = this.gates.length && this.gateZ > ZC;
    if (behind) this._gates();
    this._character();
    if (this.gates.length && !behind) this._gates();
    if (this.hint && this.state === 'wait' && this.waitT > 2.5) this._hand();

    for (var i = 0; i < this.particles.length; i++) {
      var p = this.particles[i];
      c.globalAlpha = Math.min(1, p.life / (p.max * 0.4));
      c.fillStyle = p.color;
      if (p.star) D.star(c, p.x, p.y, p.size, p.rot);
      else { c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66); c.restore(); }
    }
    c.globalAlpha = 1;
    c.restore();
  };

  P._ground = function () {
    var c = this.ctx, W = this.W, H = this.H, F = this.F, hz = this.hz, cam = this.camX;
    c.fillStyle = '#8fd072'; c.fillRect(0, hz, W, H - hz + 12);
    var zNear = CAMH * F / (H - hz + 40);
    var k0 = Math.floor((this.dist + zNear) / SEG);
    function quad(x1, x2, zA, zB, yA, yB) {
      var sA = F / zA, sB = F / zB, cx = W / 2;
      c.beginPath();
      c.moveTo(cx + (x1 - cam) * sB, yB); c.lineTo(cx + (x2 - cam) * sB, yB);
      c.lineTo(cx + (x2 - cam) * sA, yA); c.lineTo(cx + (x1 - cam) * sA, yA);
      c.closePath(); c.fill();
    }
    for (var k = k0 + 60; k >= k0; k--) {
      var zA = Math.max(k * SEG - this.dist, zNear), zB = (k + 1) * SEG - this.dist;
      if (zB <= zA) continue;
      var yA = hz + CAMH * F / zA, yB = hz + CAMH * F / zB;
      var odd = k & 1;
      c.fillStyle = odd ? '#8fd072' : '#84c867';
      c.fillRect(0, yB - 0.5, W, yA - yB + 1);
      c.fillStyle = '#d6bb80';
      quad(-ROAD - 0.1, ROAD + 0.1, zA, zB, yA + 0.5, yB - 0.5);
      c.fillStyle = odd ? '#f4e4b9' : '#eedaa6';
      quad(-ROAD, ROAD, zA, zB, yA + 0.5, yB - 0.5);
      if (odd) {
        c.fillStyle = 'rgba(255,255,255,.75)';
        var zm = zA + (zB - zA) * 0.55, ym = hz + CAMH * F / zm;
        quad(-0.53, -0.47, zA, zm, yA, ym);
        quad(0.47, 0.53, zA, zm, yA, ym);
      }
    }
    var fog = c.createLinearGradient(0, hz, 0, hz + Math.max(40, (H - hz) * 0.16));
    fog.addColorStop(0, 'rgba(227,245,251,.85)'); fog.addColorStop(1, 'rgba(227,245,251,0)');
    c.fillStyle = fog; c.fillRect(0, hz, W, Math.max(40, (H - hz) * 0.16));
  };

  P._scenery = function () {
    var c = this.ctx, W = this.W, F = this.F, hz = this.hz, cam = this.camX;
    var n0 = Math.floor(this.dist / LOOP), list = [];
    for (var n = n0 - 1; n <= n0 + 2; n++) {
      for (var i = 0; i < SCENERY.length; i++) {
        var z = n * LOOP + SCENERY[i].s - this.dist;
        if (z > 0.9 && z < 46) list.push({ o: SCENERY[i], z: z });
      }
    }
    list.sort(function (a, b) { return b.z - a.z; });
    for (var j = 0; j < list.length; j++) {
      var o = list[j].o, s = F / list[j].z;
      var x = W / 2 + (o.x - cam) * s, y = hz + CAMH * s;
      if (x < -1.2 * s || x > W + 1.2 * s) continue;
      c.globalAlpha = U.clamp((46 - list[j].z) / 10, 0, 1);
      if (o.type === 'tree') {
        c.fillStyle = '#8a5a35'; c.fillRect(x - 0.09 * s, y - 0.75 * s, 0.18 * s, 0.75 * s);
        c.fillStyle = '#4f9a4a'; D.ell(c, x - 0.3 * s, y - 0.85 * s, 0.34 * s, 0.32 * s); D.ell(c, x + 0.3 * s, y - 0.85 * s, 0.34 * s, 0.32 * s);
        c.fillStyle = '#62b257'; D.ell(c, x, y - 1.15 * s, 0.46 * s, 0.44 * s);
      } else if (o.type === 'bush') {
        c.fillStyle = '#4f9a4a'; D.ell(c, x - 0.24 * s, y - 0.16 * s, 0.24 * s, 0.2 * s); D.ell(c, x + 0.26 * s, y - 0.15 * s, 0.24 * s, 0.19 * s);
        c.fillStyle = '#62b257'; D.ell(c, x, y - 0.24 * s, 0.3 * s, 0.26 * s);
      } else {
        c.fillStyle = '#3f8a45'; c.fillRect(x - 0.012 * s, y - 0.22 * s, 0.024 * s, 0.22 * s);
        c.fillStyle = FLOWERS[o.hue];
        for (var a = 0; a < 5; a++) D.ell(c, x + Math.cos(a * 1.257) * 0.06 * s, y - 0.24 * s + Math.sin(a * 1.257) * 0.06 * s, 0.045 * s, 0.045 * s);
        c.fillStyle = '#f6b93b'; D.ell(c, x, y - 0.24 * s, 0.035 * s, 0.035 * s);
      }
    }
    c.globalAlpha = 1;
  };

  P._gates = function () {
    var c = this.ctx, W = this.W, F = this.F, hz = this.hz, z = this.gateZ;
    if (z < 0.5) return;
    var s = F / z, gy = hz + CAMH * s, cx0 = W / 2 - this.camX * s;
    var alpha = U.clamp((z - 0.5) / 0.6, 0, 1) * U.clamp((ZFAR + 0.6 - z) / 1.2, 0, 1);
    c.save();
    c.globalAlpha = alpha;

    // سياج بين البوابات وعلى الجانبين
    var hh = 0.52 * s;
    c.fillStyle = '#4f9a4a';
    c.fillRect(-20, gy - hh, cx0 - 1.44 * s + 20, hh);
    c.fillRect(cx0 + 1.44 * s, gy - hh, W - (cx0 + 1.44 * s) + 20, hh);
    c.fillRect(cx0 - 0.56 * s, gy - hh, 0.12 * s, hh);
    c.fillRect(cx0 + 0.44 * s, gy - hh, 0.12 * s, hh);
    c.fillStyle = '#62b257';
    c.fillRect(-20, gy - hh, cx0 - 1.44 * s + 20, hh * 0.22);
    c.fillRect(cx0 + 1.44 * s, gy - hh, W - (cx0 + 1.44 * s) + 20, hh * 0.22);

    for (var i = 0; i < this.gates.length; i++) {
      var g = this.gates[i], col = LANES[i];
      var cx = cx0 + (i - 1) * s;
      if (g.shake > 0) cx += Math.sin(this.t * 60) * g.shake * 0.05 * s;
      var w = GW * s, h = GH * s, x0 = cx - w / 2, y0 = gy - h;
      var pw = 0.085 * s, bh = 0.13 * s;
      var ox = x0 + pw, oy = y0 + bh, ow = w - 2 * pw, oh = h - bh;

      if (g.open < 1) {
        c.save();
        c.beginPath(); c.rect(ox, oy, ow, oh); c.clip();
        var dy = -g.open * oh;
        c.fillStyle = g.disabled ? '#c9c2b4' : col.door;
        c.fillRect(ox, oy + dy, ow, oh);
        c.fillStyle = 'rgba(0,0,0,.10)';
        c.fillRect(ox, oy + dy, ow, 0.05 * s);
        var cw = CARD_W * s, ch = CARD_H * s, cyy = gy - CARD_Y * s + dy;
        if (g.card) {
          c.globalAlpha = alpha * (g.disabled ? 0.45 : 1);
          c.drawImage(g.card, cx - cw / 2, cyy - ch / 2, cw, ch);
          c.globalAlpha = alpha;
        }
        if (g.disabled) {
          c.strokeStyle = '#e0503f'; c.lineWidth = 0.09 * s; c.lineCap = 'round';
          var xr = 0.22 * s;
          c.beginPath();
          c.moveTo(cx - xr, cyy - xr); c.lineTo(cx + xr, cyy + xr);
          c.moveTo(cx + xr, cyy - xr); c.lineTo(cx - xr, cyy + xr);
          c.stroke();
        }
        c.restore();
      }

      // الإطار
      var r = 0.16 * s;
      c.fillStyle = col.frame;
      c.beginPath();
      c.moveTo(x0, gy); c.lineTo(x0, y0 + r); c.arcTo(x0, y0, x0 + r, y0, r);
      c.lineTo(x0 + w - r, y0); c.arcTo(x0 + w, y0, x0 + w, y0 + r, r); c.lineTo(x0 + w, gy);
      c.lineTo(ox + ow, gy); c.lineTo(ox + ow, oy); c.lineTo(ox, oy); c.lineTo(ox, gy);
      c.closePath(); c.fill();
      c.fillStyle = col.dark;
      c.fillRect(x0, gy - 0.07 * s, pw, 0.07 * s);
      c.fillRect(x0 + w - pw, gy - 0.07 * s, pw, 0.07 * s);
      c.fillStyle = 'rgba(255,255,255,.28)';
      c.fillRect(x0 + pw * 0.2, y0 + r, pw * 0.25, h - r - 0.1 * s);

      if (this.chosen === i && this.state === 'dash') {
        c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 0.04 * s;
        c.strokeRect(ox, oy, ow, oh);
      }
    }
    c.restore();
  };

  P._character = function () {
    var s = this.F / ZC;
    var px = this.W / 2 + (this.charX - this.camX) * s;
    var py = this.hz + CAMH * s;
    var hop = this.hopT > 0 ? Math.sin(Math.PI * (1 - this.hopT / 0.5)) * 30 : 0;
    if (this.state === 'finish') hop = Math.abs(Math.sin(this.finishT * 7)) * 22;
    D.character(this.ctx, px, py, s, this.character, {
      t: this.t, phase: this.phase, running: this.vNow > 0.1,
      hit: this.hitT > 0 ? this.hitT / 0.8 : 0, hop: hop
    });
  };

  P._hand = function () {
    var c = this.ctx, s = this.F / ZSTOP;
    var x = this.W / 2 + Math.sin(this.t * 1.4) * s, y = this.hz + (CAMH - 0.2) * s + Math.abs(Math.sin(this.t * 5)) * 8;
    c.font = Math.round(0.42 * s) + 'px ' + EMOJI_FONT;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('👆', x, y);
  };

  DF.Runner = Runner;
})(window.DF);
