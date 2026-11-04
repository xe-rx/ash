#!/usr/bin/env node
'use strict';
// PROTOTYPE / DEV ONLY (not part of the app bake; use tools/art/bake.js). Bakes the Ash prototype scenes: SVG (geometric primitives only) -> PNG via rsvg-convert, with Poppins found
// through a temporary FONTCONFIG_FILE (nothing installed globally). Usage: node tools/art/build.js [outdir]
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
const S = require('./svg'), L = require('./layout');
const { sky } = require('./sky'), { landscape } = require('./landscape'), { family } = require('./family');
const A = require('./panelA'), B = require('./panelB'), { text, report } = require('./text');

const out = process.argv[2] || path.join(os.homedir(), 'ash-data', 'proto-baked');
fs.mkdirSync(out, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ash-art-'));
const fontDir = path.resolve(__dirname, '../../app/ash/fonts');
fs.writeFileSync(path.join(tmp, 'fonts.conf'), `<?xml version="1.0"?><fontconfig><dir>${fontDir}</dir><cachedir>${tmp}/cache</cachedir></fontconfig>`);
const env = Object.assign({}, process.env, { FONTCONFIG_FILE: path.join(tmp, 'fonts.conf') });

const sizes = [];
function emit(name, build, bg) {
  const ctx = S.mkCtx(), body = build(ctx), svg = S.document(ctx, body, L.W, L.H, bg);
  fs.writeFileSync(path.join(out, name + '.svg'), svg);
  cp.execFileSync('rsvg-convert', ['-w', L.W, '-h', L.H, '-o', path.join(out, name + '.png'), path.join(out, name + '.svg')], { env });
  sizes.push([name + '.png', fs.statSync(path.join(out, name + '.png')).size]);
}
for (const [id, P] of [['A-mashrabiya', A], ['B-tent', B]]) {
  const panel = id[0] === 'A' ? A.panelA : B.panelB, b = P.bounds();
  const art = ctx => landscape(ctx) + '\n' + family(ctx);
  emit(id, ctx => sky(ctx) + '\n' + art(ctx) + '\n' + panel(ctx) + '\n' + text(b.x0, b.x1));
  emit(id + '-layer-sky', sky);                                   // live: sky, stars, sun, halo
  emit(id + '-layer-landscape', art);                              // baked, alpha: dunes, haze, rug, family
  emit(id + '-layer-panel', panel);                                // baked, alpha: panel art without text
  emit(id + '-layer-text', ctx => text(b.x0, b.x1));               // live: clock, tag, rows
}
// Scene C: tent framing (B) with the mashrabiya lattice (A) as the right panel; the opening wash is its own layer.
{
  const { tentFrame } = require('./tent'), bb = A.bounds(), art = ctx => landscape(ctx) + '\n' + family(ctx);
  const tent = ctx => tentFrame(ctx, L.PANEL_X);
  emit('C-tent-lattice', ctx => sky(ctx) + '\n' + art(ctx) + '\n' + tent(ctx) + '\n' + A.panelA(ctx) + '\n' + A.washA(ctx) + '\n' + text(bb.x0, bb.x1));
  emit('C-tent-lattice-layer-sky', sky); emit('C-tent-lattice-layer-landscape', art); emit('C-tent-lattice-layer-tent', tent);
  emit('C-tent-lattice-layer-lattice', A.panelA); emit('C-tent-lattice-layer-wash', A.washA); emit('C-tent-lattice-layer-text', ctx => text(bb.x0, bb.x1));
}
console.log('contrast', JSON.stringify(report(), (k, v) => typeof v === 'number' ? Math.round(v * 100) / 100 : v));
sizes.forEach(s => console.log(String(s[1]).padStart(8), s[0]));
fs.rmSync(tmp, { recursive: true, force: true });
