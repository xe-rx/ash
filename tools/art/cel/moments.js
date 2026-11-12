'use strict';
// The moments the cel art paints come from app/ash/core/script.js (the colour script, the source of truth), loaded
// with the same loader the tests use so the baked layers can never drift from the script. STOPS lists the 14 baked
// layers (the landAt names); artMoment() adapts a script stop plus a light direction to what the painters read;
// STILLS are the four PO-approved frames (PR 0014) with their mock clock and card, pinned to their stops.
const { load } = require('../../../tests/core/load-core');
const { lightAt } = require('./light');
const Script = load('script.js');

const W = 1024, H = 600;

// Local colours, what things are before light (the moment grades them).
const LOC = {
  sand: ['#efc28a', '#e7ad74', '#dc9862', '#d08a56'],
  rug: '#a8322a', rugEdge: '#efe0c4', rugMid: '#2c3a6a', rugGold: '#e9a23b', lantern: '#c98a3a',
};
const LAMP = { x: 516, y: 594 };          // the lantern between the children, on the rug's near edge
const FIG_SHADE = 0.06;                   // figure shade offset as a fraction of the figure's height (capped in people.js)

// Baked stops: [file name, moment, rising?, altitude]; the file name is the landAt name.
const STOPS = [['night', Script.NIGHT, false, -90], ['day', Script.DAY, false, 90]];
Script.RISING_NAMES.slice(1, 7).forEach((n, i) => STOPS.push([n, Script.RISING[i + 1][1], true, Script.RISING[i + 1][0]]));
Script.SETTING_NAMES.slice(1, 7).forEach((n, i) => STOPS.push([n, Script.SETTING[i + 1][1], false, Script.SETTING[i + 1][0]]));

// What the painters read, from a script stop and the light: the stop's own fields, plus L, the band offsets
// (highlight bands scale with hBand; mesa haze amounts with haze) and the lantern (null when it is out).
function artMoment(stop, L) {
  const h = stop.hBand;
  return Object.assign({}, stop, {
    L,
    skyTop: stop.top, skyMid: stop.mid, skyLow: stop.hor,
    k: { dune: stop.kDune, mesa: stop.kMesa, rug: stop.kRug, fig: FIG_SHADE, lamp: 5 * stop.lamp },
    h: { dune: h, mesa: 0.8 * h, rug: 0.6 * h, fig: 0.5 * h },
    mesa: { base: stop.haze, lit: 0.3 * stop.haze, shade: 2 * stop.haze },
    lamp: stop.lamp > 0 ? { x: LAMP.x, y: LAMP.y, on: stop.lamp } : null,
  });
}

const ROWS = [['Fajr', '04:12'], ['Dhuhr', '13:31'], ['Asr', '17:46'], ['Maghrib', '21:58'], ['Isha', '23:41']];
// The four approved stills: stop, rising?, altitude for the light, and the mock UI and sun/moon of the frame.
const STILLS = {
  dawn: { stop: 'rise-7', rising: true, alt: -7, clock: '04:31', next: ['Dhuhr', 'in 9 h 00 min'], row: 1, sun: { x: 70, y: 425, r: 0 } },
  noon: { stop: 'day', rising: true, alt: 90, clock: '13:50', next: ['Asr', 'in 3 h 56 min'], row: 2, sun: { x: 590, y: 88, r: 32 } },
  sunset: { stop: 'set0', rising: false, alt: 0, clock: '21:40', next: ['Maghrib', 'in 18 min'], row: 3, sun: { x: 645, y: 365, r: 40 } },
  night: { stop: 'night', rising: false, alt: -90, clock: '23:10', next: ['Isha', 'in 31 min'], row: 4, moon: { x: 560, y: 112 } },
};
const MOMENTS = {};
Object.keys(STILLS).forEach(name => {
  const s = STILLS[name], m = artMoment(Script.MOMENTS[s.stop], lightAt(s.alt, s.rising));
  MOMENTS[name] = Object.assign(m, { clock: s.clock, next: s.next, row: s.row, sun: s.sun ? Object.assign({ glow: m.glow }, s.sun) : null, moon: s.moon || null });
});

module.exports = { W, H, LOC, ROWS, STOPS, STILLS, MOMENTS, artMoment, Script };
