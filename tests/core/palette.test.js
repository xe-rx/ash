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

test('the day is bright and the sky has nine flat bands', function () {
  var p = pal(60, true);
  assert.strictEqual(p.skyBands.length, 9);
  assert.ok(C.luminance(p.skyBands[8]) > 0.4);
});

test('sunrise and sunset palettes differ, and noon and midnight agree', function () {
  assert.notStrictEqual(pal(-2, true).skyBands[8], pal(-2, false).skyBands[8]);
  assert.strictEqual(JSON.stringify(pal(90, true)), JSON.stringify(pal(90, false)));
  assert.strictEqual(JSON.stringify(pal(-90, true)), JSON.stringify(pal(-90, false)));
});

test('colours change smoothly: one degree never moves the horizon colour far (the single ink flip at dawn and dusk is the largest step)', function () {
  [true, false].forEach(function (rising) {
    for (var alt = -90; alt < 90; alt += 1) {
      var d = C.distance(pal(alt, rising).skyBands[8], pal(alt + 1, rising).skyBands[8]);
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
  assert.strictEqual(p.skyBands.length, 9);
});

test('sky bands stay colourful from sunrise to sunset: no grey midpoints between blue and orange (the pale neutral day haze is intended, chroma >= 0.005)', function () {
  [true, false].forEach(function (rising) {
    for (var alt = -3; alt <= 90; alt += 1) {
      pal(alt, rising).skyBands.forEach(function (c, i) {
        assert.ok(C.chroma(c) >= 0.005, 'band ' + i + ' ' + c + ' chroma ' + C.chroma(c).toFixed(3) + ' at ' + alt + (rising ? ' rising' : ' setting'));
      });
    }
  });
});

function eachAlt(from, to, step, fn) {
  [true, false].forEach(function (rising) { for (var alt = from; alt <= to; alt += step) { fn(pal(alt, rising), alt, rising); } });
}
function hueChroma(hex) { // OKLab hue in degrees 0..360 and chroma
  var l = C.toLab(hex), h = Math.atan2(l[2], l[1]) * 180 / Math.PI;
  return { h: h < 0 ? h + 360 : h, c: Math.hypot(l[1], l[2]) };
}

test('no sky band reads green by day: no band with OKLab hue 100..200 and chroma >= 0.015, altitude 8..90', function () {
  eachAlt(8, 90, 0.5, function (p, alt) {
    p.skyBands.forEach(function (b, i) {
      var k = hueChroma(b);
      assert.ok(!(k.c >= 0.015 && k.h > 100 && k.h < 200), 'band ' + i + ' ' + b + ' hue ' + k.h.toFixed(0) + ' chroma ' + k.c.toFixed(3) + ' at ' + alt);
    });
  });
});

test('the sky gets lighter from the top band to the horizon at every altitude, steps stay soft', function () {
  var worst = 0, sum = 0, n = 0;
  eachAlt(-90, 90, 0.5, function (p, alt) {
    for (var i = 1; i < p.skyBands.length; i++) {
      assert.ok(C.toLab(p.skyBands[i])[0] >= C.toLab(p.skyBands[i - 1])[0] - 0.004, 'band ' + i + ' darker than the one above at ' + alt);
      var d = C.distance(p.skyBands[i - 1], p.skyBands[i]);
      worst = Math.max(worst, d); sum += d; n++;
    }
  });
  // the first version (7 bands) had a mean step of 0.044 and a largest of 0.141: halved here
  assert.ok(sum / n <= 0.025, 'mean step ' + (sum / n).toFixed(3));
  assert.ok(worst <= 0.075, 'largest step ' + worst.toFixed(3));
});

test('the panel is never a desaturated grey: chroma >= 0.02 at every altitude', function () {
  var lo = 1;
  eachAlt(-90, 90, 0.25, function (p, alt, rising) {
    var c = C.chroma(p.panel); lo = Math.min(lo, c);
    assert.ok(c >= 0.02, 'panel ' + p.panel + ' chroma ' + c.toFixed(3) + ' at ' + alt + (rising ? ' rising' : ' setting'));
  });
  console.log('# lowest panel chroma ' + lo.toFixed(3));
});

test('the panel changes continuously and the row fill and rail dot stay visible across the crossing', function () {
  var worstStep = 0, minFill = 9, minRing = 99;
  [true, false].forEach(function (rising) {
    var prev = null;
    for (var alt = -30; alt <= 30; alt += 0.25) {
      var p = pal(alt, rising);
      if (prev) { worstStep = Math.max(worstStep, C.distance(prev.panel, p.panel)); }
      minFill = Math.min(minFill, C.distance(p.rowFill, p.panel));
      minRing = Math.min(minRing, C.contrast(p.railRing, p.panel));
      assert.ok(C.distance(p.rowFill, p.panel) >= 0.09, 'row fill ' + p.rowFill + ' on ' + p.panel + ' at ' + alt);
      assert.ok(C.contrast(p.railRing, p.panel) >= 4.5, 'rail ring at ' + alt);
      prev = p;
    }
  });
  console.log('# panel step per 0.25 deg max ' + worstStep.toFixed(3) + ', min fill distance ' + minFill.toFixed(3) + ', min ring contrast ' + minRing.toFixed(2));
  assert.ok(worstStep < 0.12, 'panel jump ' + worstStep.toFixed(3));
});

test('the sun disc is never pale in the middle: the core is only a slight lift of the disc colour', function () {
  eachAlt(-4, 90, 1, function (p, alt) {
    assert.ok(C.distance(p.sun, p.sunCore) < 0.05, 'core ' + p.sunCore + ' vs disc ' + p.sun + ' at ' + alt);
  });
});

test('family: the mother keeps her distance from the dunes at night, and nobody goes grey at dusk', function () {
  var lowest = 9;
  eachAlt(-90, -12, 3, function (p, alt) {
    var d = Math.min(C.distance(p.mother, p.duneMid), C.distance(p.mother, p.duneNear));
    lowest = Math.min(lowest, d);
    assert.ok(d >= 0.06, 'mother ' + p.mother + ' vs dunes ' + p.duneMid + '/' + p.duneNear + ' = ' + d.toFixed(3) + ' at ' + alt);
  });
  console.log('# mother to dune distance at night, lowest ' + lowest.toFixed(3));
  var dusk = pal(-3, false); // Maghrib light: the father keeps a warm tone
  var lab = C.toLab(dusk.father);
  assert.ok(lab[1] > 0 && lab[2] > 0.01, 'father ' + dusk.father + ' is not warm at dusk');
});

test('no band moves more than 0.02 OKLab in a 0.05 degree step, any of the nine, rising and setting (only the ink may flip)', function () {
  var worst = 0, at = '';
  [true, false].forEach(function (rising) {
    var prev = pal(-30, rising);
    for (var alt = -29.95; alt <= 60; alt += 0.05) {
      var p = pal(alt, rising);
      for (var i = 0; i < 9; i++) {
        var d = C.distance(prev.skyBands[i], p.skyBands[i]);
        if (d > worst) { worst = d; at = 'band ' + i + ' at ' + alt.toFixed(2) + (rising ? ' rising' : ' setting'); }
      }
      prev = p;
    }
  });
  console.log('# largest band step per 0.05 deg ' + worst.toFixed(4) + ' (' + at + ')');
  assert.ok(worst <= 0.02, 'sky pops: ' + worst.toFixed(3) + ' ' + at);
});

test('the ink flips once on each side and has 4.5:1 on both sides of the flip', function () {
  [true, false].forEach(function (rising) {
    var flips = 0, prev = null;
    for (var alt = -30; alt <= 60; alt += 0.05) {
      var p = pal(alt, rising);
      if (prev && prev.inkSky !== p.inkSky && Math.abs(C.luminance(prev.inkSky) - C.luminance(p.inkSky)) > 0.4) { flips++; }
      p.skyBands.slice(4, 8).forEach(function (b) { assert.ok(C.contrast(p.inkSky, b) >= 4.5 && C.contrast(p.accentSky, b) >= 4.5, 'text on ' + b + ' at ' + alt.toFixed(2)); });
      prev = p;
    }
    assert.strictEqual(flips, 1, 'ink flips ' + flips + ' times ' + (rising ? 'rising' : 'setting'));
  });
});
