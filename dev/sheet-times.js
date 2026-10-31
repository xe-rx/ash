'use strict';
// Prints the shot list (JSON) for the contact sheet: 8 moments on 21 June and 21 December.
// usage: node sheet-times.js CONFIG.json OUTDIR   (dev tooling; reuses the test helpers)
var fs = require('fs');
var path = require('path');
var load = require('../tests/core/load-core').load;
var H = require('../tests/core/helpers');
var Scene = load('scene.js');
var cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
var out = process.argv[3];
var shots = [];
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
