#!/usr/bin/env node
'use strict';
// Bakes the app's land layers (deterministic): one PNG with alpha per colour-script stop, from tools/art/cel
// (mesas, dunes, ground, rug, family, lantern; the sky, sun, clock and card are live QML). The light direction
// of each stop follows its altitude (tools/art/cel/light.js). Build needs rsvg-convert and python3 with PIL
// (build-time only, not shipped). Usage: node tools/art/bake.js [assetsDir] [workDir]
// (defaults: app/ash/assets, $PROJECT_DATA/bake with PROJECT_DATA ~/ash-data)
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
const { STOPS } = require('./cel/moments');
const { lightAt } = require('./cel/light');
const { buildLand } = require('./cel/scene');

const W = 1024, H = 600;
const dataDir = process.env.PROJECT_DATA || path.join(os.homedir(), 'ash-data');
const assets = path.resolve(process.argv[2] || path.join(__dirname, '../../app/ash/assets'));
const work = path.resolve(process.argv[3] || path.join(dataDir, 'bake'));
fs.mkdirSync(path.join(assets, 'land'), { recursive: true }); fs.mkdirSync(work, { recursive: true });

function bake(name, svg, dest) {
  const svgPath = path.join(work, name + '.svg'), raw = path.join(work, name + '.raw.png');
  fs.writeFileSync(svgPath, svg);
  cp.execFileSync('rsvg-convert', ['-w', String(W), '-h', String(H), '-o', raw, svgPath]);
  cp.execFileSync('python3', [path.join(__dirname, 'quantize.py'), raw, dest]);
  return fs.statSync(dest).size;
}

let total = 0;
for (const [name, stop, rising, alt] of STOPS) {
  const n = bake('land-' + name, buildLand(stop, lightAt(alt, rising)).svg, path.join(assets, 'land', name + '.png'));
  console.log(String(n).padStart(8), name, `(alt ${alt}, ${rising ? 'rising' : 'setting'})`);
  total += n;
}
console.log(String(total).padStart(8), 'TOTAL');
