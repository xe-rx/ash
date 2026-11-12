'use strict';
// The colour script (core/script.js), cel edition: 14 stops in the cel palette, four of them pinned to the PO-approved
// stills (dawn = rise-7, noon = day, sunset = set0, night), every field present on every stop and interpolated
// smoothly by altitude. The stills' values come from tools/art/cel at PR 0014 (merged 1e4128f).
var test = require('node:test');
var assert = require('node:assert');
var load = require('./load-core').load;
var S = load('script.js'), C = load('colour.js');

var FIELDS = ['top', 'mid', 'hor', 'key', 'amb', 'sunlight', 'tint', 'lit', 'shade', 'glow', 'ink', 'inkShadow',
  'card', 'cardInk', 'accent', 'kDune', 'kMesa', 'kRug', 'hBand', 'haze', 'lamp', 'dim'];
var COLOURS = ['top', 'mid', 'hor', 'key', 'amb', 'sunlight', 'glow', 'ink', 'inkShadow', 'card', 'cardInk', 'accent'];

// The approved stills, as the fields the painter and the card read
var STILLS = {
  'rise-7': { top: '#26335f', mid: '#6a5a8a', hor: '#f0a890', key: '#f6c4ae', amb: '#5a3f86', sunlight: '#ffd9b8', tint: 0.3, lit: 0.22,
    shade: 0.4, glow: '#ffd0a8', ink: '#fff7ee', inkShadow: '#3a3a6a', card: '#fae4d4', cardInk: '#2a2440', accent: '#d9745e',
    kDune: 26, kMesa: 18, kRug: 10, hBand: 5, haze: 0.16, lamp: 0 },
  day: { top: '#2a78b4', mid: '#5aa6d2', hor: '#bfe4e4', key: '#fff1cc', amb: '#8a7ea8', sunlight: '#fff8e0', tint: 0.12, lit: 0.3,
    shade: 0.3, glow: '#fff4d6', ink: '#ffffff', inkShadow: '#1f5a8c', card: '#fcf1dd', cardInk: '#1f2a3a', accent: '#e9a23b',
    kDune: 10, kMesa: 8, kRug: 5, hBand: 4, haze: 0.12, lamp: 0 },
  set0: { top: '#3e3474', mid: '#a24e6e', hor: '#f6a15a', key: '#ff9e64', amb: '#5a2856', sunlight: '#ffc27a', tint: 0.34, lit: 0.3,
    shade: 0.5, glow: '#ffd27a', ink: '#fff4e6', inkShadow: '#5a2856', card: '#fcd8be', cardInk: '#2e1a2a', accent: '#e8653f',
    kDune: 26, kMesa: 18, kRug: 10, hBand: 5, haze: 0.16, lamp: 0 },
  night: { top: '#0b1230', mid: '#18244e', hor: '#2e3f74', key: '#22307a', amb: '#090c2e', sunlight: '#9fb4ff', tint: 0.78, lit: 0.18,
    shade: 0.5, ink: '#eef1ff', inkShadow: '#050817', card: '#1d2856', cardInk: '#e8ecff', accent: '#e9a23b',
    kDune: 16, kMesa: 12, kRug: 7, hBand: 4, haze: 0.16, lamp: 1 }
};

test('every stop carries every field, colours as hex and amounts as finite numbers', function () {
  Object.keys(S.MOMENTS).forEach(function (name) {
    var m = S.MOMENTS[name];
    assert.deepStrictEqual(Object.keys(m).sort(), FIELDS.slice().sort(), name);
    FIELDS.forEach(function (k) {
      if (COLOURS.indexOf(k) >= 0) { assert.ok(/^#[0-9a-f]{6}$/.test(m[k]), name + '.' + k + ' ' + m[k]); }
      else { assert.ok(typeof m[k] === 'number' && isFinite(m[k]), name + '.' + k); }
    });
  });
  assert.strictEqual(Object.keys(S.MOMENTS).length, 14);
});

test('the four approved stills are pinned to their stops: rise-7, day, set0 and night', function () {
  Object.keys(STILLS).forEach(function (name) {
    Object.keys(STILLS[name]).forEach(function (k) { assert.strictEqual(S.MOMENTS[name][k], STILLS[name][k], name + '.' + k); });
  });
});

test('the stop altitudes and the rising/setting asymmetry are unchanged', function () {
  assert.strictEqual(JSON.stringify(S.RISING.map(function (s) { return s[0]; })), JSON.stringify([-90, -20, -12, -7, -1, 4, 18, 90]));
  assert.strictEqual(JSON.stringify(S.SETTING.map(function (s) { return s[0]; })), JSON.stringify([-90, -20, -10, -4, 0, 6, 18, 40, 90]));
  assert.notStrictEqual(S.momentAt(-2, true).hor, S.momentAt(-2, false).hor);
});

test('every field moves smoothly with altitude: no colour steps over 0.03 OKLab and no amount over 0.02 of its range per 0.1 degree', function () {
  [true, false].forEach(function (rising) {
    var prev = S.momentAt(-30, rising);
    for (var alt = -29.9; alt <= 90; alt += 0.1) {
      var m = S.momentAt(alt, rising);
      FIELDS.forEach(function (k) {
        if (COLOURS.indexOf(k) >= 0) { assert.ok(C.distance(prev[k], m[k]) <= 0.03, k + ' jumps at ' + alt.toFixed(1)); }
        else { assert.ok(Math.abs(m[k] - prev[k]) <= 0.02 * Math.max(1, Math.abs(m[k])), k + ' jumps at ' + alt.toFixed(1)); }
      });
      prev = m;
    }
  });
});

test('one hue per moment: the dawn stop is violet/peach, the night stop indigo, the day sky blue, the sunset orange/plum', function () {
  function hue(hex) { var l = C.toLab(hex), h = Math.atan2(l[2], l[1]) * 180 / Math.PI; return h < 0 ? h + 360 : h; }
  assert.ok(hue(S.MOMENTS.night.key) > 250 && hue(S.MOMENTS.night.key) < 300, 'night key ' + hue(S.MOMENTS.night.key));
  assert.ok(hue(S.MOMENTS.set0.key) > 30 && hue(S.MOMENTS.set0.key) < 70, 'sunset key ' + hue(S.MOMENTS.set0.key));
  assert.ok(hue(S.MOMENTS['rise-7'].amb) > 280 && hue(S.MOMENTS['rise-7'].amb) < 320, 'dawn ambient ' + hue(S.MOMENTS['rise-7'].amb));
  assert.ok(hue(S.MOMENTS.day.mid) > 220 && hue(S.MOMENTS.day.mid) < 260, 'day sky ' + hue(S.MOMENTS.day.mid));
  assert.ok(S.MOMENTS.night.lamp === 1 && S.MOMENTS['rise-20'].lamp > 0 && S.MOMENTS['rise-1'].lamp === 0, 'the lantern burns at night only');
});

// The fix pass of 2026-11-12: the land goes into moonlight before the sky does (June 23:10 is -7.5 and must read
// as night on the ground). Setting: cool shade by -6, the night land by -10, the lantern half lit at -4 and lit from
// -10; the sky keeps its afterglow at -12 and is the night sky by -20. Rising, below the pinned dawn: the night land
// by -12 (the lantern as bright as the smoothness guard allows against the dawn's unlit one).
var LAND = ['key', 'amb', 'sunlight', 'tint', 'lit', 'shade', 'kDune', 'kMesa', 'kRug', 'hBand'];
function landIsNight(m, where) {
  LAND.forEach(function (k) {
    if (typeof m[k] === 'number') { assert.ok(Math.abs(m[k] - S.NIGHT[k]) <= 0.02 * Math.max(1, S.NIGHT[k]), k + ' ' + m[k] + ' is not the night\'s ' + S.NIGHT[k] + ' at ' + where); }
    else { assert.ok(C.distance(m[k], S.NIGHT[k]) <= 0.02, k + ' ' + m[k] + ' is not the night\'s ' + S.NIGHT[k] + ' at ' + where); }
  });
}
test('the land goes into moonlight early: cool shade by -6 setting, the night land by -10 (by -12 rising), the lantern lit, the sky keeping its afterglow until -12', function () {
  function hue(hex) { var l = C.toLab(hex), h = Math.atan2(l[2], l[1]) * 180 / Math.PI; return h < 0 ? h + 360 : h; }
  var dusk = S.momentAt(-6, false);
  assert.ok(hue(dusk.key) > 250 && hue(dusk.key) < 320 && C.toLab(dusk.key)[0] < 0.5 && dusk.tint >= 0.6, 'at -6 setting the key is a cool shade: ' + dusk.key + ' tint ' + dusk.tint);
  assert.ok(dusk.lit <= 0.15, 'no sunlit bands at -6: lit ' + dusk.lit);
  assert.ok(S.momentAt(-4, false).lamp >= 0.5, 'lantern at -4: ' + S.momentAt(-4, false).lamp);
  for (var alt = -10; alt >= -90; alt -= 1) {
    landIsNight(S.momentAt(alt, false), alt + ' setting');
    assert.strictEqual(S.momentAt(alt, false).lamp, 1, 'lantern lit at ' + alt + ' setting');
    if (alt <= -12) { landIsNight(S.momentAt(alt, true), alt + ' rising'); }
  }
  assert.ok(S.momentAt(-12, true).lamp >= 0.6, 'lantern at -12 rising: ' + S.momentAt(-12, true).lamp);
  var glow = S.momentAt(-12, false).hor, h = hue(glow);
  assert.ok((h >= 300 || h <= 60) && C.chroma(glow) >= 0.05, 'afterglow horizon at -12 setting: ' + glow + ' hue ' + h.toFixed(0));
  assert.ok(C.distance(S.momentAt(-20, false).hor, S.NIGHT.hor) <= 0.06 && C.distance(S.momentAt(-20, true).hor, S.NIGHT.hor) <= 0.06, 'the night sky by -20');
  assert.ok(C.distance(S.momentAt(-7.5, false).key, S.NIGHT.key) <= 0.12, 'June 23:10 (-7.5 setting) is lit like the night: key ' + S.momentAt(-7.5, false).key);
});
