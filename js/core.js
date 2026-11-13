/* الأساس: مساحة الأسماء وأدوات صغيرة */
window.DF = window.DF || {};
(function (DF) {
  'use strict';

  DF.config = {
    arabicDigits: false,     // false = 123، true = ١٢٣
    questionsPerStage: 10,
    testQuestions: 12,       // أسئلة اختبار تحديد المستوى
    testMaxMistakes: 1,      // الغلطات المسموحة فيه
    starsPerPoint: 4         // كل ٤ نجوم = نقطة مدرسية
  };

  var AR = '٠١٢٣٤٥٦٧٨٩';

  DF.util = {
    clamp: function (v, a, b) { return v < a ? a : v > b ? b : v; },
    lerp: function (a, b, t) { return a + (b - a) * t; },
    shuffle: function (arr) {
      var a = arr.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    },
    pick: function (arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    sample: function (arr, n) { return DF.util.shuffle(arr).slice(0, n); },
    num: function (n) {
      var s = String(n);
      if (!DF.config.arabicDigits) return s;
      return s.replace(/\d/g, function (d) { return AR[+d]; });
    },
    esc: function (s) {
      return String(s).replace(/[&<>"]/g, function (ch) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch];
      });
    }
  };
})(window.DF);
