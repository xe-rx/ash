'use strict';
// The baked art follows the colour script: tools/art/moments.js loads script.js (no copy), every name landAt can
// return has a landscape PNG in app/ash/assets/land and there are no other files; the table layout and the
// art layout agree; text keeps its contrast on the baked night lattice field.
var test = require('node:test');
var assert = require('node:assert');
var fs = require('fs');
var path = require('path');
var load = require('./load-core').load;
var S = load('script.js'), T = load('table.js'), P = load('palette.js'), C = load('colour.js');
var ROOT = path.join(__dirname, '..', '..');
var M = require(path.join(ROOT, 'tools', 'art', 'moments.js')), L = require(path.join(ROOT, 'tools', 'art', 'layout.js'));

test('the art bake uses exactly the colour script moments (same objects, no hand copy)', function () {
  assert.strictEqual(M.NIGHT.top, S.NIGHT.top);
  assert.strictEqual(JSON.stringify(M.RISING), JSON.stringify(S.RISING));
  assert.strictEqual(JSON.stringify(M.SETTING), JSON.stringify(S.SETTING));
  M.STOPS.forEach(function (st) { assert.strictEqual(JSON.stringify(st[1]), JSON.stringify(S.MOMENTS[st[0]]), st[0]); });
});

test('every name landAt can return has a landscape file, and there are no extra files', function () {
  var names = {};
  [true, false].forEach(function (rising) {
    for (var alt = -90; alt <= 90; alt += 0.25) { var l = S.landAt(alt, rising); names[l.a] = 1; names[l.b] = 1; }
  });
  var want = Object.keys(names).sort(), have = fs.readdirSync(path.join(ROOT, 'app', 'ash', 'assets', 'land')).sort();
  assert.deepStrictEqual(have, want.map(function (n) { return n + '.png'; }));
  assert.deepStrictEqual(M.STOPS.map(function (st) { return st[0]; }).sort(), want);
});

test('table.js rows and header sit where the art layout puts them', function () {
  assert.strictEqual(T.QATA.x, L.PANEL_X);
  assert.strictEqual(T.DATE_Y, L.HDR.y); assert.strictEqual(T.DATE_H, L.HDR.h);
  assert.strictEqual(T.ROWS_Y, L.ROWS.y); assert.strictEqual(T.ROW_H, L.ROWS.h);
  assert.strictEqual(5, L.ROWS.n);
});

test('ink, faded ink and row ink read on the baked night lattice field (24,26,51) at every night altitude', function () {
  var field = C.rgbToHex([24 / 255, 26 / 255, 51 / 255]);
  [true, false].forEach(function (rising) {
    for (var alt = -90; alt <= -7; alt += 0.5) {
      var p = P.paletteAt(alt, rising);
      if (p.night < 0.5) { continue; } // the night lattice is more than half faded in
      ['ink', 'inkFaded'].forEach(function (k) { assert.ok(C.contrast(p[k], field) >= 4.5, k + ' ' + C.contrast(p[k], field).toFixed(2) + ' at ' + alt); });
    }
  });
});
