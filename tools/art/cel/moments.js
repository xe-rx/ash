'use strict';
// The four still moments: sky, hue grading, light direction and band widths, sun or moon, card colours.
// L points from the scene toward the light (x right, y down). k = shade offset, h = highlight offset, in px.
const { unit } = require('./paint');

const W = 1024, H = 600;

// Local colours, what things are before light.
const LOC = {
  sand: ['#efc28a', '#e7ad74', '#dc9862', '#d08a56'],
  rug: '#a8322a', rugEdge: '#efe0c4', rugMid: '#2c3a6a', rugGold: '#e9a23b', lantern: '#c98a3a',
};

const ROWS = [['Fajr', '04:12'], ['Dhuhr', '13:31'], ['Asr', '17:46'], ['Maghrib', '21:58'], ['Isha', '23:41']];
const PAPER = '#fbf1e4';

const MOMENTS = {
  dawn: {
    clock: '04:31', next: ['Dhuhr', 'in 9 h 00 min'], row: 1,
    skyTop: '#26335f', skyMid: '#6a5a8a', skyLow: '#f0a890', key: '#f6c4ae', amb: '#5a3f86', sunlight: '#ffd9b8',
    tint: 0.30, lit: 0.22, shade: 0.40,
    L: unit([-1, -0.18]), k: { dune: 26, mesa: 18, fig: 0.06, rug: 10, lamp: 0 }, h: { dune: 5, mesa: 4, fig: 2.5, rug: 3 },
    mesa: { base: 0.16, lit: 0.05, shade: 0.32 },
    sun: { x: 70, y: 425, r: 0, glow: '#ffd0a8' },
    ink: '#fff7ee', inkShadow: '#3a3a6a', paper: PAPER, cardTint: 0.3, cardInk: '#2a2440', accent: '#d9745e',
  },
  noon: {
    clock: '13:50', next: ['Asr', 'in 3 h 56 min'], row: 2,
    skyTop: '#2a78b4', skyMid: '#5aa6d2', skyLow: '#bfe4e4', key: '#fff1cc', amb: '#8a7ea8', sunlight: '#fff8e0',
    tint: 0.12, lit: 0.30, shade: 0.30,
    L: unit([-0.3, -1]), k: { dune: 10, mesa: 8, fig: 0.06, rug: 5, lamp: 0 }, h: { dune: 4, mesa: 3, fig: 2, rug: 2 },
    mesa: { base: 0.12, lit: 0.04, shade: 0.22 },
    sun: { x: 590, y: 88, r: 32, glow: '#fff4d6' },
    ink: '#ffffff', inkShadow: '#1f5a8c', paper: PAPER, cardTint: 0.3, cardInk: '#1f2a3a', accent: '#e9a23b',
  },
  sunset: {
    clock: '21:40', next: ['Maghrib', 'in 18 min'], row: 3,
    skyTop: '#3e3474', skyMid: '#a24e6e', skyLow: '#f6a15a', key: '#ff9e64', amb: '#5a2856', sunlight: '#ffc27a',
    tint: 0.34, lit: 0.30, shade: 0.50,
    L: unit([1, -0.18]), k: { dune: 26, mesa: 18, fig: 0.06, rug: 10, lamp: 0 }, h: { dune: 5, mesa: 4, fig: 2.5, rug: 3 },
    mesa: { base: 0.16, lit: 0.05, shade: 0.32 },
    sun: { x: 645, y: 365, r: 40, glow: '#ffd27a' },
    ink: '#fff4e6', inkShadow: '#5a2856', paper: PAPER, cardTint: 0.3, cardInk: '#2e1a2a', accent: '#e8653f',
  },
  night: {
    clock: '23:10', next: ['Isha', 'in 31 min'], row: 4,
    skyTop: '#0b1230', skyMid: '#18244e', skyLow: '#2e3f74', key: '#22307a', amb: '#090c2e', sunlight: '#9fb4ff',
    tint: 0.78, lit: 0.18, shade: 0.5,
    L: unit([0.3, -1]), k: { dune: 16, mesa: 12, fig: 0.06, rug: 7, lamp: 5 }, h: { dune: 4, mesa: 3, fig: 2.5, rug: 2 },
    mesa: { base: 0.16, lit: 0.05, shade: 0.32 },
    moon: { x: 560, y: 112 }, lamp: { x: 516, y: 594 },
    ink: '#eef1ff', inkShadow: '#050817', paper: '#1b2446', cardTint: 0.3, cardInk: '#e8ecff', accent: '#e9a23b',
  },
};

module.exports = { W, H, LOC, ROWS, MOMENTS };
