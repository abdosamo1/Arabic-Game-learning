/* التقدّم محفوظ على الجهاز. لاحقاً: مزامنة مع منصة الجامع عبر state.events */
(function (DF) {
  'use strict';
  var KEY = 'darfarah.arabic.v1';

  function fresh() {
    return {
      v: 1,
      stages: {},        // { w1s1: { stars: 2, best: 1, plays: 3 } }
      character: 'cat',
      sound: true,
      events: []         // نجوم جديدة لم تُرسل للمنصة بعد: { stage, stars, at }
    };
  }

  var state = fresh();

  function load() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (raw) {
        var d = JSON.parse(raw);
        if (d && d.v === 1) {
          state = fresh();
          for (var k in d) state[k] = d[k];
        }
      }
    } catch (e) { /* بدون تخزين: اللعبة تشتغل والتقدّم بالذاكرة فقط */ }
    return state;
  }

  function save() {
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* تجاهل */ }
  }

  function stageStars(id) { return (state.stages[id] && state.stages[id].stars) || 0; }

  function totalStars() {
    var n = 0;
    for (var k in state.stages) n += state.stages[k].stars || 0;
    return n;
  }

  function points(stars) {
    return Math.floor((stars == null ? totalStars() : stars) / DF.config.starsPerPoint);
  }

  /* كل نجمة تنحسب مرة وحدة: نحفظ أعلى عدد نجوم للمرحلة فقط */
  function setStageResult(id, stars, mistakes) {
    var before = totalStars();
    var s = state.stages[id] || { stars: 0, best: null, plays: 0 };
    var gained = Math.max(0, stars - s.stars);
    s.stars = Math.max(s.stars, stars);
    s.best = s.best == null ? mistakes : Math.min(s.best, mistakes);
    s.plays += 1;
    state.stages[id] = s;
    if (gained > 0) state.events.push({ stage: id, stars: gained, at: Date.now() });
    var after = before + gained;
    var unlocked = (DF.CHARACTERS || []).filter(function (c) {
      return c.need > before && c.need <= after;
    });
    save();
    return {
      gained: gained,
      total: after,
      unlocked: unlocked,
      newPoints: points(after) - points(before)
    };
  }

  function reset() { state = fresh(); save(); }

  DF.store = {
    load: load, save: save, reset: reset,
    get state() { return state; },
    stageStars: stageStars, totalStars: totalStars, points: points,
    setStageResult: setStageResult
  };
})(window.DF);
