'use strict';
// The baked art follows the colour script: tools/art/cel/moments.js loads script.js (no copy), every name landAt
// can return has a land PNG in app/ash/assets/land and there are no other files.
var test = require('node:test');
var assert = require('node:assert');
var fs = require('fs');
var path = require('path');
var load = require('./load-core').load;
var S = load('script.js'), Table = load('table.js'), P = load('palette.js');
var ROOT = path.join(__dirname, '..', '..');
var M = require(path.join(ROOT, 'tools', 'art', 'cel', 'moments.js'));
var UI = require(path.join(ROOT, 'tools', 'art', 'cel', 'ui.js'));

test('the live card and the land margins use the stills\' numbers: table.js CARD and rows as ui.js, palette SAND as LOC.sand', function () {
  var c = Table.CARD, u = UI.CARD;
  assert.deepStrictEqual([c.x, c.y, c.w, c.h, c.r], [u.x, u.y, u.w, u.h, u.rx]);
  assert.deepStrictEqual([Table.ROW_BASE, Table.ROW_STEP, Table.NAME_X, Table.TIME_RIGHT, Table.DATE_BASE], [128, 52, 760, 963, 72]);
  assert.deepStrictEqual([Table.PILL.x, Table.PILL.dy, Table.PILL.w, Table.PILL.h, Table.PILL.r], [744, -33, 236, 46, 12]);
  assert.strictEqual(JSON.stringify(P.SAND), JSON.stringify([M.LOC.sand[0], M.LOC.sand[3]]));
});

test('the art bake uses exactly the colour script stops (same objects, no hand copy), with their altitudes', function () {
  assert.strictEqual(M.STOPS.length, 14);
  M.STOPS.forEach(function (st) {
    assert.strictEqual(JSON.stringify(st[1]), JSON.stringify(S.MOMENTS[st[0]]), st[0]);
    var list = st[2] ? S.RISING : S.SETTING, names = st[2] ? S.RISING_NAMES : S.SETTING_NAMES;
    assert.strictEqual(st[3], list[names.lastIndexOf(st[0])][0], st[0] + ' altitude'); // day sits at 40 and 90 setting
  });
});

test('every name landAt can return has a land file, and there are no extra files', function () {
  var names = {};
  [true, false].forEach(function (rising) {
    for (var alt = -90; alt <= 90; alt += 0.25) { var l = S.landAt(alt, rising); names[l.a] = 1; names[l.b] = 1; }
  });
  var want = Object.keys(names).sort(), have = fs.readdirSync(path.join(ROOT, 'app', 'ash', 'assets', 'land')).sort();
  assert.deepStrictEqual(have, want.map(function (n) { return n + '.png'; }));
  assert.deepStrictEqual(M.STOPS.map(function (st) { return st[0]; }).sort(), want);
});
