'use strict';
// Loads a core .js file the way QML does: `.pragma library` and `.import "x.js" as X`
// lines are consumed here, each file runs in its own vm context, and the module's
// top-level functions and vars become the properties of the returned object.
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var CORE_DIR = path.join(__dirname, '..', '..', 'app', 'ash', 'core');
var cache = {};

function load(name) {
  if (cache[name]) { return cache[name]; }
  var src = fs.readFileSync(path.join(CORE_DIR, name), 'utf8');
  var sandbox = {};
  var body = src.split('\n').filter(function (line) {
    var imp = /^\.import\s+"([^"]+)"\s+as\s+(\w+)\s*$/.exec(line);
    if (imp) { sandbox[imp[2]] = load(imp[1]); return false; }
    return !/^\.pragma\b/.test(line);
  }).join('\n');
  vm.createContext(sandbox);
  vm.runInContext(body, sandbox, { filename: name });
  cache[name] = sandbox;
  return sandbox;
}

module.exports = { load: load, CORE_DIR: CORE_DIR };
