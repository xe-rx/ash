.pragma library
// Validates the parsed ash.json at the boundary (ADR 0003). Error texts name the key to fix
// but never echo the configured values.

function isNumber(v) { return typeof v === "number" && isFinite(v); }

// At most 2 decimals: coordinates are deliberately coarse (about 1 km).
function hasAtMostTwoDecimals(v) {
  return Math.abs(v * 100 - Math.round(v * 100)) < 1e-6;
}

function badCoordinate(v, limit) {
  return !isNumber(v) || v < -limit || v > limit || !hasAtMostTwoDecimals(v);
}

// { ok: true, lat, lon, hijriOffsetDays } or { ok: false, error }.
function validate(cfg) {
  if (cfg === null || typeof cfg !== "object" || cfg instanceof Array) {
    return { ok: false, error: "Config is missing or not an object. Check ash.json." };
  }
  if (badCoordinate(cfg.lat, 90)) {
    return { ok: false, error: "Config lat must be a number from -90 to 90 with at most 2 decimals. Check ash.json." };
  }
  if (badCoordinate(cfg.lon, 180)) {
    return { ok: false, error: "Config lon must be a number from -180 to 180 with at most 2 decimals. Check ash.json." };
  }
  var offset = cfg.hijriOffsetDays === undefined ? 0 : cfg.hijriOffsetDays;
  if (offset !== -1 && offset !== 0 && offset !== 1) {
    return { ok: false, error: "Config hijriOffsetDays must be -1, 0 or 1. Check ash.json." };
  }
  return { ok: true, lat: cfg.lat, lon: cfg.lon, hijriOffsetDays: offset };
}
