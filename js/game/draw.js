/* رسم الشخصية من الخلف + أدوات رسم. مساحة التصميم: الطول ~١٠٠ وحدة، القدمان عند الصفر. */
(function (DF) {
  'use strict';

  function ell(c, x, y, rx, ry, rot) {
    c.beginPath();
    c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot || 0, 0, Math.PI * 2);
    c.fill();
  }

  function rr(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  function tri(c, x1, y1, x2, y2, x3, y3) {
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineTo(x3, y3); c.closePath(); c.fill();
  }

  function star(c, x, y, r, rot) {
    c.beginPath();
    for (var i = 0; i < 10; i++) {
      var a = (rot || 0) + i * Math.PI / 5 - Math.PI / 2, rad = i % 2 ? r * 0.45 : r;
      c[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rad, y + Math.sin(a) * rad);
    }
    c.closePath(); c.fill();
  }

  /* a = { t, phase, running, hit(0..1), hop(بوحدات التصميم) } */
  function drawCharacter(c, px, py, s, def, a) {
    var u = s * 0.9 / 100, col = def.colors;
    var run = a.running, ph = a.phase;
    var bob = run ? Math.abs(Math.sin(ph)) * 5 : Math.sin(a.t * 3) * 1.5 + 1.5;
    var hop = a.hop || 0;
    var sway = run ? Math.sin(ph) : Math.sin(a.t * 2) * 0.4;

    c.save();
    c.translate(px, py);
    c.scale(u, u);

    c.fillStyle = 'rgba(40,60,30,.22)';
    ell(c, 0, 3, 30 - hop * 0.12, 8 - hop * 0.03);

    c.translate(0, -hop);
    if (a.hit > 0) {
      c.rotate(Math.sin(a.t * 28) * 0.22 * a.hit);
      c.scale(1 + 0.12 * a.hit, 1 - 0.12 * a.hit);
    }

    // القدمان
    var l1 = run ? Math.max(0, Math.sin(ph)) * 10 : 0;
    var l2 = run ? Math.max(0, -Math.sin(ph)) * 10 : 0;
    c.fillStyle = col.dark;
    ell(c, -12, -5 - l1, 10, 7);
    ell(c, 12, -5 - l2, 10, 7);

    c.translate(0, -bob);

    // الجسم
    c.fillStyle = col.body;
    ell(c, 0, -32, 24, 26);

    // الذيل
    if (def.tail === 'cat') {
      c.strokeStyle = col.dark; c.lineWidth = 8; c.lineCap = 'round';
      c.beginPath(); c.moveTo(4, -16);
      c.quadraticCurveTo(36 + sway * 4, -18, 30 + sway * 6, -48);
      c.stroke();
    } else if (def.tail === 'puff') {
      c.fillStyle = '#ffffff'; ell(c, 0, -16, 9, 9);
    } else if (def.tail === 'nub') {
      c.fillStyle = col.dark; ell(c, 0, -14, 7, 6);
    } else if (def.tail === 'fox') {
      c.fillStyle = col.body; ell(c, 24 + sway * 3, -28, 11, 23, 0.55 + sway * 0.08);
      c.fillStyle = col.tip || '#fff'; ell(c, 34 + sway * 4, -44, 6, 9, 0.55);
    } else if (def.tail === 'lion') {
      c.strokeStyle = col.body; c.lineWidth = 6; c.lineCap = 'round';
      c.beginPath(); c.moveTo(4, -14);
      c.quadraticCurveTo(34 + sway * 4, -14, 32 + sway * 6, -40);
      c.stroke();
      c.fillStyle = col.mane; ell(c, 32 + sway * 6, -44, 7, 8);
    }

    // الذراعان
    var sw = run ? Math.sin(ph) * 7 : 0;
    c.fillStyle = col.body;
    ell(c, -26, -38 + sw, 7, 11, 0.25);
    ell(c, 26, -38 - sw, 7, 11, -0.25);

    // الحقيبة المدرسية
    c.fillStyle = col.pack;
    rr(c, -17, -53, 34, 35, 9); c.fill();
    c.fillStyle = col.packDark;
    rr(c, -17, -53, 34, 12, 8); c.fill();
    rr(c, -10, -34, 20, 11, 4); c.fill();
    c.fillStyle = 'rgba(255,255,255,.85)';
    ell(c, 0, -41, 2.6, 2.6);

    // الرأس
    c.save();
    c.translate(0, -56);
    c.rotate(sway * 0.04);
    var hc = col.head || col.body;
    if (def.mane) {
      c.fillStyle = col.mane;
      for (var i = 0; i < 12; i++) {
        var an = i * Math.PI / 6;
        ell(c, Math.cos(an) * 24, -16 + Math.sin(an) * 24, 11, 11);
      }
    }
    if (def.ears === 'cat') {
      c.fillStyle = hc;
      tri(c, -24, -26, -6, -38, -21, -54);
      tri(c, 24, -26, 6, -38, 21, -54);
    } else if (def.ears === 'fox') {
      c.fillStyle = hc;
      tri(c, -25, -24, -5, -38, -22, -60);
      tri(c, 25, -24, 5, -38, 22, -60);
      c.fillStyle = '#3a2a20';
      tri(c, -23.5, -44, -15, -48, -22, -60);
      tri(c, 23.5, -44, 15, -48, 22, -60);
    } else if (def.ears === 'rabbit') {
      c.fillStyle = hc;
      ell(c, -10, -56, 7, 22, -0.14 + sway * 0.05);
      ell(c, 10, -56, 7, 22, 0.14 + sway * 0.05);
    } else {
      c.fillStyle = col.head ? col.dark : (def.mane ? col.body : col.dark);
      ell(c, -19, -36, 10, 10);
      ell(c, 19, -36, 10, 10);
    }
    c.fillStyle = hc;
    ell(c, 0, -16, 25, 25);
    if (def.ears === 'cat') {
      c.strokeStyle = col.dark; c.lineWidth = 4; c.lineCap = 'round';
      c.beginPath();
      c.moveTo(-9, -37); c.lineTo(-7, -29);
      c.moveTo(0, -40); c.lineTo(0, -31);
      c.moveTo(9, -37); c.lineTo(7, -29);
      c.stroke();
    }
    c.restore();

    c.restore();
  }

  DF.draw = { ell: ell, rr: rr, tri: tri, star: star, character: drawCharacter };
})(window.DF);
