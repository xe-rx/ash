'use strict';
// The sky gradient: nine stops on the still's curve (tools/art/cel/sky.js: top at y 0, mid at y 300, horizon at
// y 432, flat below), mixed linearly in sRGB (what Rectangle's Gradient does). The stops behind the clock and
// the countdown are held dark for the ink; the stops below run on into the dune line without a seam.
var test = require('node:test');
var assert = require('node:assert');
var path = require('path');
var load = require('./load-core').load;
var Grad = load('skygrad.js'), P = load('palette.js'), C = load('colour.js'), G = load('geometry.js'), K = load('clock.js'), S = load('script.js');
var still = require(path.join(__dirname, '..', '..', 'tools', 'art', 'cel', 'sky.js'));
function pal(alt, rising) { return JSON.parse(JSON.stringify(P.paletteAt(alt, rising))); }
function rgb(hex) { return JSON.parse(JSON.stringify(C.hexToRgb(hex))); }
function stopY(i) { return Grad.SKY_TOP + Grad.STOPS[i] * Grad.SKY_H; }

test('the stops sit where the still\'s gradient bends: 0..6 every 50 px from y 0 to the middle colour at y 300, stop 7 just below the countdown, the horizon colour at y 432 (0.72 H)', function () {
  var s = JSON.parse(JSON.stringify(Grad.STOPS));
  assert.strictEqual(s.length, 9);
  for (var i = 0; i < 9; i++) {
    assert.ok(stopY(i) >= 0 && stopY(i) <= 0.72 * G.H + 0.5, 'stop ' + i + ' at ' + stopY(i));
    if (i) { assert.ok(s[i] > s[i - 1]); }
    if (i < 7) { assert.ok(Math.abs(stopY(i) - i * G.H / 12) < 0.5, 'stop ' + i + ' at ' + stopY(i) + ', the still has it at ' + i * G.H / 12); }
  }
  assert.ok(stopY(7) >= K.COUNTDOWN_Y + K.COUNTDOWN_H && stopY(7) <= 345, 'stop 7 at ' + stopY(7) + ': just below the countdown');
  assert.ok(Math.abs(stopY(8) - 0.72 * G.H) < 0.5, 'stop 8 at ' + stopY(8));
});

test('the gradient has exactly the stop colour at every stop, and the end stops beyond', function () {
  var p = pal(20, true);
  for (var i = 0; i < 9; i++) { assert.strictEqual(Grad.skyColorAt(p.skyStops, stopY(i)), p.skyStops[i]); }
  assert.strictEqual(Grad.skyColorAt(p.skyStops, -16), p.skyStops[0]);
  assert.strictEqual(Grad.skyColorAt(p.skyStops, 432), p.skyStops[8]);
  assert.strictEqual(Grad.skyColorAt(p.skyStops, 616), p.skyStops[8]);
});

test('wherever the still\'s sky already carries the clock ink at 5.6:1 (both stops around a row), the app\'s row is the still\'s row (tools/art/cel/sky.js skyAt) within 2 units; every row of the night sky is', function () {
  var worst = 0, rows = 0;
  [true, false].forEach(function (rising) {
    for (var alt = -90; alt <= 90; alt += 2.5) {
      var m = S.momentAt(alt, rising), p = pal(alt, rising), mm = { skyTop: m.top, skyMid: m.mid, skyLow: m.hor };
      for (var i = 1; i < 9; i++) {
        var held = C.contrast(m.ink, still.skyAt(mm, stopY(i - 1))) < P.TEXT_CONTRAST || (i < 8 && C.contrast(m.ink, still.skyAt(mm, stopY(i))) < P.TEXT_CONTRAST);
        if (alt === -90) { assert.ok(!held, 'the night sky is held dark around stop ' + i); }
        if (held) { continue; }
        for (var y = Math.ceil(stopY(i - 1)); y <= stopY(i); y += 1) {
          var a = rgb(Grad.skyColorAt(p.skyStops, y)), b = rgb(still.skyAt(mm, y));
          for (var k = 0; k < 3; k++) { worst = Math.max(worst, Math.abs(a[k] - b[k])); }
          rows++;
        }
      }
    }
  });
  console.log('# ' + rows + ' undarkened rows compared with the still, off by at most ' + worst + ' units');
  assert.ok(rows > 20000 && worst <= 2, 'the app\'s sky is ' + worst + ' units from the still\'s over ' + rows + ' rows');
});

test('by day the sky keeps blending down to y 432 and only then runs flat at the horizon colour: no band of it above the dune line (y 368..424)', function () {
  [true, false].forEach(function (rising) {
    [60, 20, 5, 0, -4].forEach(function (alt) {
      var p = pal(alt, rising), hor = S.momentAt(alt, rising).hor;
      assert.strictEqual(Grad.skyColorAt(p.skyStops, 432), hor, 'y 432 is the horizon colour at ' + alt);
      assert.strictEqual(Grad.skyColorAt(p.skyStops, 500), hor, 'y 500 is the horizon colour at ' + alt);
      var prev = C.distance(Grad.skyColorAt(p.skyStops, 345), hor);
      for (var y = 350; y <= 425; y += 5) {
        var d = C.distance(Grad.skyColorAt(p.skyStops, y), hor);
        assert.ok(d < prev && d > 0.0005, 'the sky stops moving toward the horizon colour at y ' + y + ', alt ' + alt + (rising ? ' rising' : ' setting'));
        prev = d;
      }
    });
  });
});

test('text keeps 4.5:1 on the gradient wherever it lies (every 3 px behind the clock and the countdown, every altitude, rising and setting)', function () {
  var worst = 99;
  [true, false].forEach(function (rising) {
    for (var alt = -90; alt <= 90; alt += 0.5) {
      var p = pal(alt, rising);
      for (var y = K.CLOCK_INK_TOP; y <= K.COUNTDOWN_Y + K.COUNTDOWN_H; y += 3) {
        var bg = Grad.skyColorAt(p.skyStops, y);
        var c = C.contrast(p.inkSky, bg);
        worst = Math.min(worst, c);
        assert.ok(c >= 4.5, 'contrast ' + c.toFixed(2) + ' at y ' + y + ', alt ' + alt + (rising ? ' rising' : ' setting'));
      }
    }
  });
  console.log('# worst text contrast on the gradient ' + worst.toFixed(2));
});

test('the gradient never steps: neighbouring pixel rows differ by less than 0.02 in OKLab over the whole sky rectangle (the steepest part is the run from the held-dark text sky to the horizon colour)', function () {
  var worst = 0;
  [true, false].forEach(function (rising) {
    for (var alt = -90; alt <= 90; alt += 3) {
      var p = pal(alt, rising);
      for (var y = -16; y < 616; y++) { worst = Math.max(worst, C.distance(Grad.skyColorAt(p.skyStops, y), Grad.skyColorAt(p.skyStops, y + 1))); }
    }
  });
  console.log('# largest step between pixel rows ' + worst.toFixed(4));
  assert.ok(worst < 0.02, 'step ' + worst.toFixed(4));
});

test('the moon\'s cut-out (a three-stop gradient over the cut disc, Sky.qml) matches the sky and rings behind it within 1 unit at every row, whenever the moon shows', function () {
  var M = JSON.parse(JSON.stringify(Grad.MOON)), worst = 0;
  function lerp(a, b, t) { return C.rgbToHex([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]); }
  [true, false].forEach(function (rising) {
    for (var alt = -8; alt >= -90; alt -= 2) {
      var p = pal(alt, rising);
      var c0 = rgb(Grad.moonCutAt(p.skyStops, M.cutY - M.cutR, p.moonAlpha)), c1 = rgb(Grad.moonCutAt(p.skyStops, M.cutY, p.moonAlpha)), c2 = rgb(Grad.moonCutAt(p.skyStops, M.cutY + M.cutR, p.moonAlpha));
      for (var y = M.cutY - M.cutR; y <= M.cutY + M.cutR; y++) {
        var t = (y - (M.cutY - M.cutR)) / (2 * M.cutR);
        var drawn = rgb(t <= 0.5 ? lerp(c0, c1, t * 2) : lerp(c1, c2, (t - 0.5) * 2)), real = rgb(Grad.moonCutAt(p.skyStops, y, p.moonAlpha));
        for (var k = 0; k < 3; k++) { worst = Math.max(worst, Math.abs(drawn[k] - real[k])); }
      }
    }
  });
  console.log('# moon cut-out off the sky by at most ' + worst + ' units');
  assert.ok(worst <= 1, 'cut-out off by ' + worst);
});
