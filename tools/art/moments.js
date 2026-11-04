'use strict';
// Colour script moment table, copied from app/ash/core/script.js (branch frontend-engineer/sadu-redesign), the source of truth.
// Field order of m(): top, mid, hor, farTwo, farOne, duneFar, duneMid, duneNear, sun, shade, sink, tint, lit, dim.
// Re-copy this table if script.js changes; only the data (m, NIGHT, DAY, RISING, SETTING) is used here.
function m(top, mid, hor, farTwo, farOne, duneFar, duneMid, duneNear, sun, shade, sink, tint, lit, dim) {
  return { top: top, mid: mid, hor: hor, farTwo: farTwo, farOne: farOne, duneFar: duneFar, duneMid: duneMid, duneNear: duneNear,
    sun: sun, shade: shade, sink: sink, tint: tint, lit: lit, dim: dim };
}

// Night is its own weave: indigo sky, aubergine-black land, the table dimmed (dim 0.45).
const NIGHT = m("#05071a", "#0b1030", "#141a44", "#10163c", "#0f1233", "#160d26", "#110a1f", "#0b0614", "#6a6f8c", "#262d52", 0.68, "#8a90c0", 0, 0.45);
const DAY = m("#1a2f78", "#2e52a4", "#f4b552", "#eaa65e", "#dc8c4a", "#c9702f", "#a9522a", "#6e2a1e", "#ffd980", "#5a2a3a", 0, "#ffe8b0", 0.04, 0);

// ascending altitude (degrees): [altitude, moment]
const RISING = [
  [-90, NIGHT],
  [-20, m("#070a24", "#0e1438", "#1b2250", "#151b48", "#171540", "#1d1233", "#170d29", "#100a1c", "#8a8fb0", "#262d58", 0.66, "#8a90c0", 0, 0.4)],
  // first light: indigo, a thread of madder on the horizon
  [-12, m("#0e1650", "#232c78", "#5a3a84", "#44407c", "#3a3068", "#3a2460", "#2c1c4a", "#1e1236", "#c08ab0", "#2c3460", 0.6, "#7a86c0", 0.04, 0.25)],
  // dawn: indigo over a madder horizon, the land still in blue-violet shade
  [-7, m("#1c2c7a", "#40347e", "#b04a52", "#9a4e78", "#7c3a68", "#622c58", "#4a2248", "#341832", "#f08a4a", "#3a2a68", 0.5, "#e08a70", 0.1, 0.1)],
  // sunrise: low saffron light, madder land
  [-1, m("#233b8a", "#5a3a80", "#f0963f", "#dc7a52", "#bf5a42", "#a24233", "#822f2c", "#5a2024", "#f6a845", "#5a2f58", 0.3, "#f6a060", 0.16, 0)],
  [4, m("#1f3a8c", "#38509e", "#f2a84a", "#e8985a", "#d47c46", "#b8603a", "#963f2c", "#66261e", "#fbc860", "#563050", 0.12, "#f8c070", 0.12, 0)],
  [18, m("#1a2f7c", "#2e52a4", "#f4b050", "#eaa45e", "#dc8c4a", "#c8702f", "#a8522a", "#6e2a1e", "#ffd47a", "#5a2a3a", 0.02, "#ffe4a8", 0.06, 0)],
  [90, DAY]
];
const SETTING = [
  [-90, NIGHT],
  [-20, m("#070824", "#100e38", "#201a50", "#181648", "#18123c", "#1f1034", "#190d2a", "#110a1e", "#8a8fb0", "#2a2850", 0.66, "#8a90c0", 0, 0.4)],
  // dusk: indigo over a plum-madder horizon
  [-10, m("#10185a", "#2c2478", "#6a2f6a", "#52306e", "#442462", "#3a1c52", "#2b1544", "#1e0e32", "#d06a7c", "#3c3158", 0.58, "#a0607a", 0.05, 0.25)],
  // after sunset: the afterglow, madder against indigo
  [-4, m("#1e2a70", "#4a2a72", "#b8383c", "#9c3a68", "#842c5c", "#6a2250", "#561c46", "#3e1436", "#e8774c", "#7a4452", 0.45, "#d88070", 0.12, 0.08)],
  // sunset (the sadu sketch): indigo over a violet band, a red-orange horizon, land in madder shade
  [0, m("#26285a", "#5b3466", "#e0693a", "#c8503c", "#a8383a", "#8a2c36", "#6e2230", "#4e1822", "#ee8049", "#4a2040", 0.3, "#f09060", 0.18, 0)],
  // golden hour: saffron light, madder land
  [6, m("#1d3484", "#40449a", "#f2a346", "#e6905a", "#d27648", "#b65c38", "#963e2c", "#68261e", "#f4b85c", "#5a2c50", 0.12, "#f8c070", 0.2, 0)],
  [18, m("#1a2f7c", "#2e52a4", "#f3ae4e", "#e9a15c", "#db8a48", "#c66e2e", "#a6502a", "#6c2a1e", "#ffd47a", "#5a2a3a", 0.03, "#ffe4a8", 0.12, 0)],
  [40, DAY],
  [90, DAY]
];


// Baked stops: [file name, moment, rising?]
const STOPS = [['night', NIGHT, false], ['day', DAY, false]];
RISING.forEach(e => { if (e[0] > -90 && e[0] < 90) STOPS.push(['rise' + e[0], e[1], true]); });
SETTING.forEach(e => { if (e[0] > -90 && e[0] < 40) STOPS.push(['set' + e[0], e[1], false]); });
module.exports = { STOPS, RISING, SETTING, NIGHT, DAY };
