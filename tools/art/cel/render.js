#!/usr/bin/env node
'use strict';
// Renders the cel-shaded stills for PO approval: dawn, noon, sunset, night PNGs, a 2x2 sheet and family zooms.
// Usage: node tools/art/cel/render.js [outdir]   (default: $PROJECT_DATA/screens-cel/v3, PROJECT_DATA ~/ash-data)
// Needs rsvg-convert and python3 with PIL; Poppins comes from app/ash/fonts through a fontconfig written to
// $PROJECT_DATA. Exits 1 when any card text reads under 4.5:1.
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
const { buildScene } = require('./scene');
const { MOMENTS } = require('./moments');

const dataDir = process.env.PROJECT_DATA || path.join(os.homedir(), 'ash-data');
const outDir = path.resolve(process.argv[2] || path.join(dataDir, 'screens-cel', 'v3'));
const fontsDir = path.resolve(__dirname, '../../../app/ash/fonts');
const NAMES = Object.keys(MOMENTS);

function writeFontConfig() {
  const dir = path.join(dataDir, 'screens-cel'), file = path.join(dir, 'fonts.conf');
  fs.mkdirSync(path.join(dir, 'fc-cache'), { recursive: true });
  fs.writeFileSync(file, '<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig>' +
    `<include ignore_missing="yes">/etc/fonts/fonts.conf</include><dir>${fontsDir}</dir><cachedir>${path.join(dir, 'fc-cache')}</cachedir></fontconfig>\n`);
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

function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const fontConfig = writeFontConfig(), env = Object.assign({}, process.env, { FONTCONFIG_FILE: fontConfig });
  let low = 0;
  for (const name of NAMES) {
    const { svg, report } = buildScene(name), svgPath = path.join(outDir, name + '.svg'), png = path.join(outDir, name + '.png');
    fs.writeFileSync(svgPath, svg);
    cp.execFileSync('rsvg-convert', [svgPath, '-o', png], { env });
    for (const r of report) {
      const ok = r.ratio >= 4.5;
      if (!ok) low++;
      console.log(`${name.padEnd(7)} ${r.what.padEnd(16)} ${r.fg} on ${r.bg}  ${r.ratio.toFixed(2)}:1 ${ok ? 'ok' : 'LOW'}`);
    }
  }
  cp.execFileSync('python3', ['-c', SHEET_PY, outDir], { stdio: 'inherit' });
  console.log('wrote', NAMES.map(n => n + '.png').concat(['sheet.png', 'zoom.png']).join(' '), 'to', outDir);
  if (low) { console.error(`${low} card text colour(s) under 4.5:1`); process.exit(1); }
}

main();
