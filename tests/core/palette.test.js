'use strict';
var test = require('node:test');
var assert = require('node:assert');
var load = require('./load-core').load;
var P = load('palette.js'), C = load('colour.js'), G = load('geometry.js'), K = load('clock.js'), Grad = load('skygrad.js');

function pal(alt, rising) { return JSON.parse(JSON.stringify(P.paletteAt(alt, rising))); }

function behind(p, y0, y1) { // the sky colour a text between y0 and y1 really sits on: the gradient, every 4 px
  var out = [];
  for (var y = y0; y <= y1; y += 4) { out.push(Grad.skyColorAt(p.skyStops, y)); }
  return out;
}

var PAIRS = [ // [text colours, backgrounds] that really sit together
  [['inkSky'], function (p) { return behind(p, K.CLOCK_INK_TOP, K.COUNTDOWN_Y + K.COUNTDOWN_H); }],
  [['ink', 'inkFaded'], function (p) { return [p.ground]; }],
  [['rowInk'], function (p) { return [p.rowFill]; }],
  [['tagInk'], function (p) { return [p.tagFill]; }]
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
    p.skyStops.concat(p.land).forEach(function (c) { assert.ok(C.luminance(c) < 0.02, c); });
  });
});

test('the day horizon is bright and the sky has nine gradient stops', function () {
  var p = pal(60, true);
  assert.strictEqual(p.skyStops.length, 9);
  assert.ok(C.luminance(p.skyStops[8]) > 0.4);
});

test('sunrise and sunset palettes differ, and noon and midnight agree', function () {
  assert.notStrictEqual(pal(-2, true).skyStops[8], pal(-2, false).skyStops[8]);
  assert.strictEqual(JSON.stringify(pal(90, true)), JSON.stringify(pal(90, false)));
  assert.strictEqual(JSON.stringify(pal(-90, true)), JSON.stringify(pal(-90, false)));
});

test('colours change smoothly: one degree never moves the horizon colour far (the single ink flip at dawn and dusk is the largest step)', function () {
  [true, false].forEach(function (rising) {
    for (var alt = -90; alt < 90; alt += 1) {
      var d = C.distance(pal(alt, rising).skyStops[8], pal(alt + 1, rising).skyStops[8]);
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
  assert.strictEqual(p.skyStops.length, 9);
});

test('sky bands stay colourful from sunrise to sunset: no grey midpoints between blue and orange (the pale neutral day haze is intended, chroma >= 0.005)', function () {
  [true, false].forEach(function (rising) {
    for (var alt = -3; alt <= 90; alt += 1) {
      pal(alt, rising).skyStops.forEach(function (c, i) {
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
    p.skyStops.forEach(function (b, i) {
      var k = hueChroma(b);
      assert.ok(!(k.c >= 0.015 && k.h > 100 && k.h < 200), 'band ' + i + ' ' + b + ' hue ' + k.h.toFixed(0) + ' chroma ' + k.c.toFixed(3) + ' at ' + alt);
    });
  });
});

test('the sky gets lighter from the top band to the horizon at every altitude, steps stay soft', function () {
  var worst = 0, sum = 0, n = 0;
  eachAlt(-90, 90, 0.5, function (p, alt) {
    for (var i = 1; i < p.skyStops.length; i++) {
      assert.ok(C.toLab(p.skyStops[i])[0] >= C.toLab(p.skyStops[i - 1])[0] - 0.004, 'band ' + i + ' darker than the one above at ' + alt);
      var d = C.distance(p.skyStops[i - 1], p.skyStops[i]);
      worst = Math.max(worst, d); sum += d; n++;
    }
  });
  // saturated dyes: the stops of a gradient, not soft poster bands
  assert.ok(sum / n <= 0.06, 'mean step ' + (sum / n).toFixed(3));
  assert.ok(worst <= 0.45, 'largest step ' + worst.toFixed(3));
});

test('the table is a dimmed weave at night: cream stays readable, the ground is darker, the pattern dims', function () {
  var day = pal(60, true), night = pal(-60, true);
  assert.strictEqual(night.ground, day.ground); // the ground is baked into the lattice art: one colour
  assert.ok(C.luminance(night.ink) < C.luminance(day.ink));
  assert.strictEqual(day.weaveDim, 0);
  assert.ok(night.weaveDim > 0.3);
  assert.ok(C.contrast(night.ink, night.ground) >= 7, 'night ink ' + C.contrast(night.ink, night.ground).toFixed(2));
});

test('red means now only: the next row is madder, the faded (passed) ink is clearly quieter than the ink but still readable', function () {
  var worst = 99;
  eachAlt(-90, 90, 1, function (p, alt) {
    assert.ok(C.contrast(p.inkFaded, p.ground) >= 4.5, 'faded ' + alt);
    assert.ok(C.contrast(p.ink, p.ground) / C.contrast(p.inkFaded, p.ground) >= 1.2, 'faded not quieter at ' + alt);
    assert.ok(C.contrast(p.rowFill, p.ground) >= 1.4, 'now row does not stand out of the ground at ' + alt);
    worst = Math.min(worst, C.contrast(p.inkFaded, p.ground));
  });
  console.log('# lowest faded-ink contrast ' + worst.toFixed(2));
  var m = hueChroma(pal(60, true).rowFill);
  assert.ok(m.h < 45 || m.h > 340, 'row fill is not a red: hue ' + m.h.toFixed(0));
});

test('the sun disc is never pale in the middle: the core is only a slight lift of the disc colour', function () {
  eachAlt(-4, 90, 1, function (p, alt) {
    assert.ok(C.distance(p.sun, p.sunCore) < 0.05, 'core ' + p.sunCore + ' vs disc ' + p.sun + ' at ' + alt);
  });
});

test('no band moves more than 0.02 OKLab in a 0.05 degree step, any of the nine, rising and setting ', function () {
  var worst = 0, at = '';
  [true, false].forEach(function (rising) {
    var prev = pal(-30, rising);
    for (var alt = -29.95; alt <= 60; alt += 0.05) {
      var p = pal(alt, rising);
      for (var i = 0; i < 9; i++) {
        var d = C.distance(prev.skyStops[i], p.skyStops[i]);
        if (d > worst) { worst = d; at = 'band ' + i + ' at ' + alt.toFixed(2) + (rising ? ' rising' : ' setting'); }
      }
      prev = p;
    }
  });
  console.log('# largest band step per 0.05 deg ' + worst.toFixed(4) + ' (' + at + ')');
  assert.ok(worst <= 0.02, 'sky pops: ' + worst.toFixed(3) + ' ' + at);
});

test('cream ink is the same hue all day and has 4.5:1 on the whole sky behind the clock and countdown (every 4 px), altitude -90..90', function () {
  var worst = 99;
  [true, false].forEach(function (rising) {
    for (var alt = -90; alt <= 90; alt += 0.25) {
      var p = pal(alt, rising);
      behind(p, K.CLOCK_INK_TOP, K.COUNTDOWN_Y + K.COUNTDOWN_H).forEach(function (b) { worst = Math.min(worst, C.contrast(p.inkSky, b)); });
    }
  });
  console.log('# worst clock ink contrast on the sky ' + worst.toFixed(2));
  assert.ok(worst >= 4.5);
});

test('night factor: 1 in deep night, 0 by day, 0..1 and continuous in between (it cross-fades the night tent and lattice)', function () {
  [true, false].forEach(function (rising) {
    assert.strictEqual(pal(-90, rising).night, 1);
    assert.strictEqual(pal(30, rising).night, 0);
    var prev = pal(-90, rising).night;
    for (var alt = -89.5; alt <= 40; alt += 0.5) {
      var n = pal(alt, rising).night;
      assert.ok(n >= 0 && n <= 1 && Math.abs(n - prev) < 0.1, 'night ' + n + ' at ' + alt);
      assert.ok(n <= prev + 1e-9, 'night factor grows as the sun climbs at ' + alt);
      prev = n;
    }
  });
});
