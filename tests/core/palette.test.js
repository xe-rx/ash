'use strict';
var test = require('node:test');
var assert = require('node:assert');
var load = require('./load-core').load;
var P = load('palette.js');

function pal(alt, rising) { return JSON.parse(JSON.stringify(P.paletteAt(alt, rising))); }

test('every text colour has at least 4.5:1 against its real background, altitude -90..90, rising and setting', function () {
  var worst = 99;
  [true, false].forEach(function (rising) {
    for (var alt = -90; alt <= 90; alt += 0.5) {
      var p = pal(alt, rising);
      var sets = [[['inkSky', 'accentSky', 'softSky'], p.skyBands], [['inkLand', 'accentLand', 'softLand'], p.land]];
      sets.forEach(function (s) {
        s[0].forEach(function (key) {
          s[1].forEach(function (bg) {
            var c = P.contrast(p[key], bg);
            worst = Math.min(worst, c);
            assert.ok(c >= 4.5, key + ' ' + p[key] + ' on ' + bg + ' = ' + c.toFixed(2) + ' at ' + alt + (rising ? ' rising' : ' setting'));
          });
        });
      });
    }
  });
  console.log('# worst text contrast ' + worst.toFixed(2));
});

test('deep night is very dark', function () {
  [true, false].forEach(function (rising) {
    var p = pal(-60, rising);
    p.skyBands.concat(p.land).forEach(function (c) { assert.ok(P.luminance(c) < 0.02, c); });
  });
});

test('the day is bright and the sky has five flat bands', function () {
  var p = pal(60, true);
  assert.strictEqual(p.skyBands.length, 5);
  assert.ok(P.luminance(p.skyBands[4]) > 0.4);
});

test('sunrise and sunset palettes differ, and noon and midnight agree', function () {
  assert.notStrictEqual(pal(-2, true).skyBands[4], pal(-2, false).skyBands[4]);
  assert.strictEqual(JSON.stringify(pal(90, true)), JSON.stringify(pal(90, false)));
  assert.strictEqual(JSON.stringify(pal(-90, true)), JSON.stringify(pal(-90, false)));
});

test('colours change smoothly: one degree never moves the horizon colour far', function () {
  [true, false].forEach(function (rising) {
    for (var alt = -90; alt < 90; alt += 1) {
      var d = P.distance(pal(alt, rising).skyBands[4], pal(alt + 1, rising).skyBands[4]);
      assert.ok(d < 0.06, 'jump ' + d.toFixed(3) + ' at ' + alt);
    }
  });
});

test('moon and stars only at night, and the palette is defined for odd input', function () {
  assert.strictEqual(pal(-40, true).stars, true);
  assert.strictEqual(pal(30, true).stars, false);
  assert.strictEqual(pal(30, true).moon, false);
  assert.strictEqual(pal(-40, false).moon, true);
  var p = pal(NaN, true);
  assert.strictEqual(p.skyBands.length, 5);
});
