'use strict';
// The colour script moments for the art bake, loaded from app/ash/core/script.js (the source of truth) with the
// same loader the tests use, so the baked PNGs can never drift from the script. Names come from the script too
// (RISING_NAMES, SETTING_NAMES), the same names landAt returns and the files in app/ash/assets/land.
const { load } = require('../../tests/core/load-core');
const Script = load('script.js');
const { RISING, SETTING, NIGHT, DAY } = Script;
// Baked stops: [file name, moment, rising?] (the file name is the landAt name)
const STOPS = [['night', NIGHT, false], ['day', DAY, false]];
Script.RISING_NAMES.slice(1, 7).forEach((n, i) => STOPS.push([n, RISING[i + 1][1], true]));
Script.SETTING_NAMES.slice(1, 7).forEach((n, i) => STOPS.push([n, SETTING[i + 1][1], false]));
module.exports = { STOPS, RISING, SETTING, NIGHT, DAY };
