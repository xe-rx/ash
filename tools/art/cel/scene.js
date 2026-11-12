'use strict';
// One still: composes sky, mesas, dunes, foreground, family, lantern and UI into an SVG document.
const { createDoc, painter } = require('./paint');
const { W, H, MOMENTS } = require('./moments');
const { sky } = require('./sky');
const { mesas, dunes } = require('./land');
const { foreground, lantern } = require('./ground');
const { family } = require('./people');
const { ui } = require('./ui');

function buildScene(name) {
  const m = MOMENTS[name];
  if (!m) throw new Error(`unknown moment "${name}", expected one of ${Object.keys(MOMENTS).join(', ')}`);
  const doc = createDoc(), P = painter(m), top = ui(m);
  const body = sky(doc, m) + mesas(doc, m) + dunes(doc, P, m) + foreground(doc, P, m) + family(doc, P, m) + lantern(doc, P, m) + top.svg;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<defs>${doc.defs.join('')}</defs>${body}</svg>`;
  return { svg, report: top.report };
}

module.exports = { buildScene };
