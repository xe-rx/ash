'use strict';
const { figure } = require('./figures');
const { rug } = require('./rug');

function family(ctx) {
  const figs = [
    { kind: 'father', x: 290, y: 556, h: 134, robe: '#dcc294' },
    { kind: 'mother', x: 524, y: 556, h: 124, robe: '#34408e', hijab: '#4a3a90' },
    { kind: 'boy', x: 366, y: 566, h: 84, robe: '#3a58b8' },
    { kind: 'girl', x: 446, y: 568, h: 90, robe: '#f0a53a' },
  ];
  return rug(ctx) + '\n' + figs.map(f => figure(ctx, f)).join('\n');
}
module.exports = { family };
