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
  [['cardInk', 'cardInkFaded'], function (p) { return [p.card]; }],
  [['accentInk'], function (p) { return [p.accent]; }]
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

test('night is dark: every sky stop under luminance 0.1 from -90 to -30 (moonlit indigo, as the night still: horizon under 0.06 at -90), the card dark with light ink', function () {
  eachAlt(-90, -30, 1, function (p, alt) {
    p.skyStops.forEach(function (c) { assert.ok(C.luminance(c) < 0.1, c + ' at ' + alt); });
    assert.ok(C.luminance(p.card) < 0.05 && C.luminance(p.cardInk) > 0.7, 'night card ' + p.card + ' ink ' + p.cardInk + ' at ' + alt);
  });
  [true, false].forEach(function (rising) { assert.ok(C.luminance(pal(-90, rising).skyStops[8]) < 0.06); });
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

test('sky stops stay colourful from sunrise to sunset: no grey midpoints between blue and orange (the pale neutral day haze is intended, chroma >= 0.005)', function () {
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

test('no sky band reads green by day: no band with OKLab hue 105..185 and chroma >= 0.015, altitude 8..90 (the approved noon horizon is cyan, 196)', function () {
  eachAlt(8, 90, 0.5, function (p, alt) {
    p.skyStops.forEach(function (b, i) {
      var k = hueChroma(b);
      assert.ok(!(k.c >= 0.015 && k.h > 105 && k.h < 185), 'band ' + i + ' ' + b + ' hue ' + k.h.toFixed(0) + ' chroma ' + k.c.toFixed(3) + ' at ' + alt);
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

test('the card follows the light: light with dark ink by day, dark with light ink at night, exactly one ink flip per side', function () {
  var day = pal(60, true), night = pal(-60, true);
  assert.ok(C.luminance(day.card) > 0.7 && C.luminance(day.cardInk) < 0.1, 'day card ' + day.card + ' ink ' + day.cardInk);
  assert.ok(C.luminance(night.card) < 0.05 && C.luminance(night.cardInk) > 0.7, 'night card ' + night.card + ' ink ' + night.cardInk);
  [true, false].forEach(function (rising) {
    var flips = 0, prev = null;
    for (var alt = -90; alt <= 90; alt += 0.5) {
      var light = C.luminance(pal(alt, rising).cardInk) > 0.5;
      if (prev !== null && light !== prev) { flips++; }
      prev = light;
    }
    assert.strictEqual(flips, 1, (rising ? 'rising' : 'setting') + ' ink flips ' + flips + ' times');
  });
});

test('passed rows are quieter than the ink but readable; the pill is a warm accent its ink reads on', function () {
  var worst = 99;
  eachAlt(-90, 90, 1, function (p, alt) {
    var ink = C.contrast(p.cardInk, p.card), faded = C.contrast(p.cardInkFaded, p.card);
    assert.ok(faded >= 4.5, 'faded ' + alt);
    if (ink >= 6) { assert.ok(ink / faded >= 1.15, 'faded not quieter at ' + alt + ': ' + ink.toFixed(2) + ' vs ' + faded.toFixed(2)); }
    worst = Math.min(worst, faded);
    var m = hueChroma(p.accent);
    assert.ok(m.h >= 20 && m.h <= 90 && m.c >= 0.08, 'accent not warm at ' + alt + ': ' + p.accent + ' hue ' + m.h.toFixed(0));
    assert.ok(C.contrast(p.accentInk, p.accent) >= 4.5, 'pill ink at ' + alt);
  });
  console.log('# lowest faded-ink contrast ' + worst.toFixed(2));
});

test('the sun core is a lighter version of the disc: higher luminance, the same hue', function () {
  eachAlt(-4, 90, 1, function (p, alt) {
    assert.ok(C.luminance(p.sunCore) > C.luminance(p.sun), 'core not lighter at ' + alt);
    if (C.chroma(p.sun) >= 0.03) {
      assert.ok(Math.abs(hueChroma(p.sunCore).h - hueChroma(p.sun).h) < 8, 'core ' + p.sunCore + ' drifts from disc ' + p.sun + ' at ' + alt);
    }
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

test('night factor: 1 in deep night, 0 by day, 0..1 and continuous in between (the script\'s dim, normalised)', function () {
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

test('the rings are warm (the sun\'s colour) only where they cannot reach the clock or the countdown: near the arc\'s ends the inner three, never the outermost; over the text the luminance-neutral tints; smooth along the arc', function () {
  var Look = load('sunlook.js'), horizon = JSON.parse(JSON.stringify(Look.sunLook(0).haloR)), p = pal(0, true), q = pal(-6, false);
  assert.ok(K.clockBox('00:00').w / 2 <= P.TEXT_HALF_W && K.countdownBox('Maghrib in 23 h 59 min').w / 2 <= P.TEXT_HALF_W, 'TEXT_HALF_W covers the widest texts');
  [G.arcPoint(0).x, G.arcPoint(1).x].forEach(function (endX) {
    var w = JSON.parse(JSON.stringify(P.ringWarmth(endX, horizon)));
    assert.ok(w[0] === 1 && w[1] === 1 && w[2] > 0.5 && w[3] === 0, 'warmth at the arc end x ' + endX + ': ' + JSON.stringify(w));
    assert.strictEqual(P.ringColour(q, 1, w[1]), q.sun, 'the second ring is the sun\'s colour at the arc end');
    assert.strictEqual(P.ringColour(q, 3, w[3]), q.glow, 'the outermost ring stays the neutral tint');
  });
  var top = JSON.parse(JSON.stringify(P.ringWarmth(G.arcPoint(0.5).x, horizon)));
  assert.strictEqual(JSON.stringify(top), '[0,0,0,0]', 'no warmth over the clock');
  assert.strictEqual(P.ringColour(p, 2, 0), p.glow); assert.strictEqual(P.ringColour(p, 1, 0), p.halo); assert.strictEqual(P.ringColour(p, 0, 0), p.sun);
  var prev = JSON.parse(JSON.stringify(P.ringWarmth(G.arcPoint(0).x, horizon)));
  for (var x = G.arcPoint(0).x + 2; x <= G.arcPoint(1).x; x += 2) {
    var w = JSON.parse(JSON.stringify(P.ringWarmth(x, horizon)));
    for (var k = 0; k < 4; k++) {
      assert.ok(Math.abs(w[k] - prev[k]) <= 0.1, 'ring ' + k + ' warmth jumps at x ' + x);
      if (w[k] > 0) { assert.ok(Math.abs(x - K.CLOCK_CX) - horizon[k] >= P.TEXT_HALF_W, 'ring ' + k + ' warm while over the text at x ' + x); }
    }
    prev = w;
  }
  var c = P.ringColour(q, 2, 0.5);
  assert.ok(C.distance(c, q.glow) > 0.01 && C.distance(c, q.sun) > 0.01, 'half warmth is a mix');
});
