'use strict';
var test = require('node:test');
var assert = require('node:assert');
var load = require('./load-core').load;
var P = load('palette.js'), C = load('colour.js'), G = load('geometry.js'), K = load('clock.js');

function pal(alt, rising) { return JSON.parse(JSON.stringify(P.paletteAt(alt, rising))); }

function behind(p, y0, y1) { // the sky bands a text between y0 and y1 really sits on
  return p.skyBands.filter(function (b, i) { return y0 < G.BANDS[i + 1] && y1 > G.BANDS[i]; });
}

var PAIRS = [ // [text colours, backgrounds] that really sit together
  [['inkSky', 'accentSky'], function (p) { return behind(p, K.CLOCK_INK_TOP, K.COUNTDOWN_Y + 32); }],
  [['panelInk', 'panelSoft'], function (p) { return [p.panel]; }],
  [['rowInk'], function (p) { return [p.rowFill]; }]
];

test('every text colour has at least 4.5:1 against its real background, altitude -90..90, rising and setting', function () {
  var worst = {};
  [true, false].forEach(function (rising) {
    for (var alt = -90; alt <= 90; alt += 0.5) {
      var p = pal(alt, rising);
      PAIRS.forEach(function (pair) {
        pair[0].forEach(function (key) {
          pair[1](p).forEach(function (bg) {
            var c = C.contrast(p[key], bg);
            worst[key] = Math.min(worst[key] || 99, c);
            assert.ok(c >= 4.5, key + ' ' + p[key] + ' on ' + bg + ' = ' + c.toFixed(2) + ' at ' + alt + (rising ? ' rising' : ' setting'));
          });
        });
      });
      assert.ok(C.contrast(p.railDot, p.panel) >= 3, 'rail dot on panel at ' + alt);
    }
  });
  console.log('# worst text contrast ' + JSON.stringify(worst));
});

test('deep night is very dark', function () {
  [true, false].forEach(function (rising) {
    var p = pal(-60, rising);
    p.skyBands.concat(p.land).forEach(function (c) { assert.ok(C.luminance(c) < 0.02, c); });
  });
});

test('the day is bright and the sky has seven flat bands', function () {
  var p = pal(60, true);
  assert.strictEqual(p.skyBands.length, 7);
  assert.ok(C.luminance(p.skyBands[6]) > 0.4);
});

test('sunrise and sunset palettes differ, and noon and midnight agree', function () {
  assert.notStrictEqual(pal(-2, true).skyBands[6], pal(-2, false).skyBands[6]);
  assert.strictEqual(JSON.stringify(pal(90, true)), JSON.stringify(pal(90, false)));
  assert.strictEqual(JSON.stringify(pal(-90, true)), JSON.stringify(pal(-90, false)));
});

test('colours change smoothly: one degree never moves the horizon colour far (the single ink flip at dawn and dusk is the largest step)', function () {
  [true, false].forEach(function (rising) {
    for (var alt = -90; alt < 90; alt += 1) {
      var d = C.distance(pal(alt, rising).skyBands[6], pal(alt + 1, rising).skyBands[6]);
      assert.ok(d < 0.2, 'jump ' + d.toFixed(3) + ' at ' + alt);
    }
  });
});

test('moon and stars only at night, and the palette is defined for odd input', function () {
  assert.strictEqual(pal(-40, true).stars, true);
  assert.strictEqual(pal(30, true).stars, false);
  assert.strictEqual(pal(30, true).moon, false);
  assert.strictEqual(pal(-40, false).moon, true);
  var p = pal(NaN, true);
  assert.strictEqual(p.skyBands.length, 7);
});

test('sky bands stay colourful from sunrise to sunset: no grey midpoints between blue and orange', function () {
  [true, false].forEach(function (rising) {
    for (var alt = -3; alt <= 90; alt += 1) {
      pal(alt, rising).skyBands.forEach(function (c, i) {
        assert.ok(C.chroma(c) >= 0.015, 'band ' + i + ' ' + c + ' chroma ' + C.chroma(c).toFixed(3) + ' at ' + alt + (rising ? ' rising' : ' setting'));
      });
    }
  });
});
