'use strict';
// Composition. buildLand(stop, L): the baked layer of one colour-script stop, with alpha and no sky (mesas, dunes,
// ground, rug, family, lantern). buildStill(name): one of the four approved frames, sky and mock UI included.
const { createDoc, painter } = require('./paint');
const { W, H, MOMENTS, artMoment } = require('./moments');
const { sky } = require('./sky');
const { mesas, dunes } = require('./land');
const { foreground, lantern } = require('./ground');
const { family } = require('./people');
const { ui } = require('./ui');

const wrap = (doc, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
  `<defs>${doc.defs.join('')}</defs>${body}</svg>`;

function landBody(doc, m) {
  const P = painter(m);
  return mesas(doc, m) + dunes(doc, P, m) + foreground(doc, P, m) + family(doc, P, m) + lantern(doc, P, m);
}

function buildLand(stop, L) {
  const doc = createDoc(), m = artMoment(stop, L);
  return { svg: wrap(doc, landBody(doc, m)) };
}

function buildStill(name) {
  const m = MOMENTS[name];
  if (!m) throw new Error(`unknown still "${name}", expected one of ${Object.keys(MOMENTS).join(', ')}`);
  const doc = createDoc(), top = ui(m);
  return { svg: wrap(doc, sky(doc, m) + landBody(doc, m) + top.svg), report: top.report };
}

module.exports = { buildLand, buildStill };
