'use strict';
// Compares Qt's QML-engine results (stdin, from qt_parity.py) with Node's for tests/qt/cases.json.
var fs = require('fs');
var path = require('path');
var Scene = require('../core/load-core').load('scene.js');
var cases = JSON.parse(fs.readFileSync(path.join(__dirname, 'cases.json'), 'utf8'));
var qt = JSON.parse(fs.readFileSync(0, 'utf8'));

function same(a, b, where) {
  if (typeof a === 'number' && typeof b === 'number') {
    if (Math.abs(a - b) > 1e-9) { throw new Error(where + ': ' + a + ' vs ' + b); }
  } else if (a && b && typeof a === 'object') {
    var ka = Object.keys(a).sort();
    if (JSON.stringify(ka) !== JSON.stringify(Object.keys(b).sort())) { throw new Error(where + ': keys differ'); }
    ka.forEach(function (k) { same(a[k], b[k], where + '.' + k); });
  } else if (a !== b) { throw new Error(where + ': ' + a + ' vs ' + b); }
}

cases.forEach(function (c, i) {
  var node = JSON.parse(JSON.stringify(Scene.sceneAt(c.nowMs, function () { return c.offsetMin; },
    { lat: c.lat, lon: c.lon, hijriOffsetDays: 0 })));
  if (!node.ok) { throw new Error('case ' + i + ' not ok in node'); }
  same(node, qt.results[i], 'case' + i);
});
console.log('Qt ' + qt.qt + ' and Node agree on ' + cases.length + ' scenes');
