#!/usr/bin/env node
'use strict';
// Renders the cel-shaded stills for comparison: the four approved frames (dawn, noon, sunset, night, with their
// mock clock and card), a 2x2 sheet and family zooms, plus any colour-script stop by name as a bare land layer
// over its sky. Usage: node tools/art/cel/render.js [outdir] [stop ...]
// (default outdir: $PROJECT_DATA/screens-cel/v3, PROJECT_DATA ~/ash-data). Needs rsvg-convert and python3 with
// PIL; Poppins comes from app/ash/fonts through a fontconfig written under the output directory. Exits 1 when
// any card text reads under 4.5:1.
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
const { buildStill, buildLand } = require('./scene');
const { MOMENTS, STOPS } = require('./moments');
const { lightAt } = require('./light');

const fontsDir = path.resolve(__dirname, '../../../app/ash/fonts');
const NAMES = Object.keys(MOMENTS);

function writeFontConfig(outDir) {
  const file = path.join(outDir, 'fonts.conf');
  fs.mkdirSync(path.join(outDir, 'fc-cache'), { recursive: true });
  fs.writeFileSync(file, '<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig>' +
    `<include ignore_missing="yes">/etc/fonts/fonts.conf</include><dir>${fontsDir}</dir><cachedir>${path.join(outDir, 'fc-cache')}</cachedir></fontconfig>\n`);
  return file;
}

const SHEET_PY = `
import sys
from PIL import Image
out = sys.argv[1]
ims = [Image.open('%s/%s.png' % (out, n)).convert('RGB') for n in ['dawn', 'noon', 'sunset', 'night']]
sheet = Image.new('RGB', (2048, 1200))
for i, im in enumerate(ims): sheet.paste(im, ((i % 2) * 1024, (i // 2) * 600))
sheet.save(out + '/sheet.png')
zoom = Image.new('RGB', (1024, 520))
for i, im in enumerate(ims): zoom.paste(im.crop((256, 340, 768, 600)), ((i % 2) * 512, (i // 2) * 260))
zoom.save(out + '/zoom.png')
`;

function toPng(svg, outDir, name, env) {
  const svgPath = path.join(outDir, name + '.svg');
  fs.writeFileSync(svgPath, svg);
  cp.execFileSync('rsvg-convert', [svgPath, '-o', path.join(outDir, name + '.png')], { env });
}

// Renders everything into outDir; returns the number of card colours under 4.5:1.
function render(outDir, stops) {
  fs.mkdirSync(outDir, { recursive: true });
  const env = Object.assign({}, process.env, { FONTCONFIG_FILE: writeFontConfig(outDir) });
  let low = 0;
  for (const name of NAMES) {
    const { svg, report } = buildStill(name);
    toPng(svg, outDir, name, env);
    for (const r of report) {
      const ok = r.ratio >= 4.5;
      if (!ok) low++;
      console.log(`${name.padEnd(7)} ${r.what.padEnd(16)} ${r.fg} on ${r.bg}  ${r.ratio.toFixed(2)}:1 ${ok ? 'ok' : 'LOW'}`);
    }
  }
  cp.execFileSync('python3', ['-c', SHEET_PY, outDir], { stdio: 'inherit' });
  for (const want of stops || []) {
    const st = STOPS.find(s => s[0] === want);
    if (!st) throw new Error(`unknown stop "${want}", expected one of ${STOPS.map(s => s[0]).join(', ')}`);
    toPng(buildLand(st[1], lightAt(st[3], st[2])).svg, outDir, 'stop-' + want, env);
  }
  console.log('wrote', NAMES.map(n => n + '.png').concat(['sheet.png', 'zoom.png'], (stops || []).map(s => 'stop-' + s + '.png')).join(' '), 'to', outDir);
  return low;
}

if (require.main === module) {
  const dataDir = process.env.PROJECT_DATA || path.join(os.homedir(), 'ash-data');
  const low = render(path.resolve(process.argv[2] || path.join(dataDir, 'screens-cel', 'v3')), process.argv.slice(3));
  if (low) { console.error(`${low} card text colour(s) under 4.5:1`); process.exit(1); }
}

module.exports = { render };
