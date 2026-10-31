'use strict';
// Prints the shot list (JSON), reusing the test helpers (dev tooling).
// usage: node sheet-times.js CONFIG.json OUTDIR [sheet|sunrise|sunset]
//   sheet (default): 8 moments on 21 June and 21 December
//   sunrise, sunset: a strip of 10 frames around that moment on 21 March
var fs = require('fs');
var path = require('path');
var load = require('../tests/core/load-core').load;
var H = require('../tests/core/helpers');
var Scene = load('scene.js');
var cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
var out = process.argv[3];
var mode = process.argv[4] || 'sheet';
var shots = [];
if (mode === 'sunrise' || mode === 'sunset') { // a strip across one sunrise or sunset, 21 March
  var day = Scene.sceneAt(H.ams(2026, 3, 21, 12, 0), H.amsterdamOffset, cfg);
  var base = mode === 'sunrise' ? day.sunrise.ms : day.sunset.ms;
  [-60, -40, -25, -10, 0, 10, 25, 45, 70, 100].forEach(function (off) {
    var ms = Math.floor(base / 60000) * 60000 + off * 60000;
    shots.push({ ms: ms, path: path.join(out, mode + '-' + (off < 0 ? 'm' : 'p') + Math.abs(off) + '.png'), label: mode + ' ' + (off > 0 ? '+' : '') + off + ' min' });
  });
  process.stdout.write(JSON.stringify(shots));
  process.exit(0);
}
[[6, 'june'], [12, 'dec']].forEach(function (m) {
  var noon = Scene.sceneAt(H.ams(2026, m[0], 21, 12, 0), H.amsterdamOffset, cfg);
  var P = noon.prayers, r = noon.sunrise.ms;
  var moments = [['1-fajr', P[0].ms], ['2-sunrise', r], ['3-morning', (r + P[1].ms) / 2], ['4-dhuhr', P[1].ms],
    ['5-asr', P[2].ms], ['6-maghrib', P[3].ms], ['7-isha', P[4].ms], ['8-midnight', H.ams(2026, m[0], 22, 0, 0)]];
  moments.forEach(function (mo) {
    shots.push({ ms: Math.floor(mo[1] / 60000) * 60000 + 60000, path: path.join(out, m[1] + '-' + mo[0] + '.png'), label: m[1] + ' ' + mo[0].slice(2) });
  });
});
process.stdout.write(JSON.stringify(shots));
