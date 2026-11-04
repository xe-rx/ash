#!/usr/bin/env node
'use strict';
// Bakes the app art assets (deterministic): one landscape layer per colour-script stop, plus the static tent and lattice.
// Usage: node tools/art/bake.js [assetsDir] [workDir]   (defaults: app/ash/assets, ~/ash-data/proto-baked/bake)
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
const S = require('./svg'), L = require('./layout'), { P } = require('./palette');
const { landscape } = require('./landscape'), { family } = require('./family'), { tentFrame } = require('./tent');
const A = require('./panelA'), { STOPS } = require('./moments');

const assets = path.resolve(process.argv[2] || path.join(__dirname, '../../app/ash/assets'));
const work = process.argv[3] || path.join(os.homedir(), 'ash-data', 'proto-baked', 'bake');
fs.mkdirSync(path.join(assets, 'land'), { recursive: true }); fs.mkdirSync(work, { recursive: true });

function render(name, build, dest) {
  const ctx = S.mkCtx(), svg = S.document(ctx, build(ctx), L.W, L.H);
  const svgPath = path.join(work, name + '.svg'), raw = path.join(work, name + '.raw.png');
  fs.writeFileSync(svgPath, svg);
  cp.execFileSync('rsvg-convert', ['-w', L.W, '-h', L.H, '-o', raw, svgPath]);
  cp.execFileSync('python3', [path.join(__dirname, 'quantize.py'), raw, dest]);
  return fs.statSync(dest).size;
}
let total = 0;
const report = [];
for (const [name, m, rising] of STOPS) {
  P.apply(m, rising, L);
  const n = render('land-' + name, ctx => landscape(ctx) + '\n' + family(ctx), path.join(assets, 'land', name + '.png'));
  report.push([name, n]); total += n;
}
for (const [name, fn] of [['tent', ctx => tentFrame(ctx, L.PANEL_X)], ['lattice', A.panelA]]) {
  const n = render(name, fn, path.join(assets, name + '.png')); report.push([name, n]); total += n;
}
report.forEach(r => console.log(String(r[1]).padStart(8), r[0]));
console.log(String(total).padStart(8), 'TOTAL');
