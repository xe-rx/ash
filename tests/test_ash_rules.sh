#!/usr/bin/env bash
# Tests for scripts/check-ash-rules.sh (+ dev/coord_check.py) and scripts/run-offline.sh.
# Each check is proven by planting a violation in a throwaway git repo that holds copies.
# shellcheck source=tests/lib.sh
# shellcheck disable=SC1091
source "$(dirname "$0")/lib.sh"

setup_repo() {
  mk_tmp_var R; git -C "$R" init -q; require_isolated "$R"
  mkdir -p "$R/scripts" "$R/dev" "$R/app" "$R/config" "$R/tests"
  cp "$REPO_ROOT/scripts/check-ash-rules.sh" "$R/scripts/"
  cp "$REPO_ROOT/dev/coord_check.py" "$R/dev/"
  cp "$REPO_ROOT/.gitignore" "$R/.gitignore"
  echo '{}' > "$R/config/ash.example.json"
  echo 'Item {}' > "$R/app/View.qml"
  git -C "$R" add -A
}
# plant PATH CONTENT: write and `git add -f` (force: planted files may be gitignored)
plant() { mkdir -p "$(dirname "$R/$1")"; printf '%s\n' "$2" > "$R/$1"; git -C "$R" add -f "$1"; }
rules() { run bash -c 'cd "$0" && scripts/check-ash-rules.sh' "$R"; }

t_clean() { setup_repo; rules; assert_rc 0; assert_contains "$OUT" "ash-rules: ok"; }

# (a) network APIs: one planted line per pattern, each must fire on its own
net_case() { # label line
  setup_repo; plant app/x.js "$2"; rules; assert_rc 1; assert_contains "$OUT" "app/x.js:1:"; assert_contains "$OUT" "[network/dynamic code: $1]"; }
t_xhr()   { net_case XMLHttpRequest 'var r = new XMLHttpRequest();'; }
t_ws()    { net_case WebSocket 'var s = new WebSocket("x");'; }
t_fetch() { net_case fetch 'fetch(u).then(f)'; }
t_http()  { net_case url 'var u = "http://example.org/x";'; }
t_https() { net_case url '// see https://example.org'; }
t_open()  { net_case openUrlExternally 'Qt.openUrlExternally(u)'; }
t_nam()   { net_case NetworkAccessManager 'QNetworkAccessManager m'; }
t_webkit(){ net_case QtWebKit 'import QtWebKit 3.0'; }
t_eval()  { net_case eval 'eval("1+1")'; }
t_newfn() { net_case new-Function 'var f = new Function("return 1")'; }
t_qco()   { net_case dyn-code 'Qt.createQmlObject(src, parent)'; }
t_qinc()  { net_case dyn-code 'Qt.include("x.js")'; }
t_ccomp() { net_case dyn-code 'var c = Qt.createComponent(u)'; }
t_fnc()   { net_case dyn-code 'var f = Function("return 1")'; }
t_wscr()  { net_case dyn-code 'WorkerScript { source: "w.js" }'; }
t_es()    { net_case dyn-code 'var e = new EventSource(u)'; }
t_beacon(){ net_case dyn-code 'navigator.sendBeacon(u, d)'; }
t_nodenet() { net_case node-net "const h = require('http');"; }
t_qml_file() { setup_repo; plant app/Y.qml $'Item {\n  Loader { source: "https://x.test/a.qml" }\n}'; rules; assert_rc 1; assert_contains "$OUT" "app/Y.qml:2:"; }
t_no_false_positive() { setup_repo
  plant app/ok.js $'var prefetch = 1; // prefetched\nfunction retrieval() {}\nvar medieval = 2; obj.fetch2 = 3;'
  rules; assert_rc 0; }
t_outside_app_ok() { setup_repo; plant docs/n.md 'see https://example.org'; plant tests/t.js 'fetch(x)'; rules; assert_rc 0; }
t_allowlist() { setup_repo; plant app/v.js '// https://ok.example'
  sed -i "s#^ALLOW=(#ALLOW=(\n  'app/v\\\\.js|url|test reason'#" "$R/scripts/check-ash-rules.sh"
  rules; assert_rc 0; plant app/w.js '// https://bad.example'; rules; assert_rc 1; assert_contains "$OUT" "app/w.js"; }

# (b) configs
t_cfg_real()   { setup_repo; plant config/ash.json '{}'; rules; assert_rc 1; assert_contains "$OUT" "config/ash.json"; }
t_cfg_other()  { setup_repo; plant config/other.json '{}'; rules; assert_rc 1; assert_contains "$OUT" "config/other.json: only config/ash.example.json"; }
t_cfg_root()   { setup_repo; plant ash.json '{}'; rules; assert_rc 1; assert_contains "$OUT" "ash.json: real Ash config"; }
t_cfg_local()  { setup_repo; plant deploy/home.local.json '{}'; rules; assert_rc 1; assert_contains "$OUT" "home.local.json"; }
t_cfg_other_json_elsewhere_ok() { setup_repo; plant package.json '{}'; plant .claude/settings.json '{}'; rules; assert_rc 0; }
t_ignore_missing() { setup_repo; : > "$R/.gitignore"; rules; assert_rc 1; assert_contains "$OUT" ".gitignore does not ignore config/ash.json"; }
t_ignore_example() { setup_repo; echo 'config/ash.example.json' >> "$R/.gitignore"; rules; assert_rc 1; assert_contains "$OUT" "must not ignore"; }
t_real_gitignore() { # the repo's own .gitignore really ignores real configs and not the example
  cd "$REPO_ROOT" || return
  git check-ignore -q config/ash.json || _fail "config/ash.json not ignored"
  git check-ignore -q node_modules/x || _fail "node_modules not ignored"
  git check-ignore -q screenshots/a.png || _fail "screenshots not ignored"
  ! git check-ignore -q config/ash.example.json || _fail "example is ignored"; }

# (c) coordinates
coord_case() { setup_repo; plant "$1" "$2"; rules; assert_rc "$3"; }
t_coord_js()     { coord_case app/c.js 'var home = { lat: 51.44, lon: 5.47 };' 1; assert_contains "$OUT" "app/c.js:1: coordinate pair 51.44,5.47"; }
t_coord_json()   { coord_case config/c.json $'{\n "latitude": 52.37,\n "longitude": 4.89\n}' 1; assert_contains "$OUT" "coordinate pair 52.37,4.89"; }
t_coord_test()   { coord_case tests/c.test.js 'const homeLat = 48.85; const homeLon = 2.35;' 1; assert_contains "$OUT" "coordinate pair 48.85,2.35"; }
t_coord_eq()     { coord_case app/c.py 'LAT = 40.71; LNG = -74.00' 1; assert_contains "$OUT" "coordinate pair 40.71,-74.0"; }
t_coord_lone()   { coord_case app/c.js 'var o = {"lat": 51.99};' 1; assert_contains "$OUT" "latitude 51.99"; }
t_pub_utrecht()  { coord_case config/ash.example.json '{ "lat": 52.09, "lon": 5.12 }' 0; }
t_pub_both()     { setup_repo; plant tests/p.js $'[{lat: 50.85, lon: 5.69}, {latitude: 53.22, longitude: 6.57}]'; rules; assert_rc 0; }
t_pub_mixed()    { coord_case app/m.js 'x = { lat: 52.09, lon: 6.57 }' 1; }
t_no_named_keys() { coord_case app/astro.js $'var obliquity = 23.4393; var JD = 2451545.0;\nvar table = [52.09, 51.44];\nvar colon = 1.5; var flat = 2.5;' 0; }
t_whole_degrees() { coord_case tests/w.js 'x = { lat: 0, lon: 0 }; y = { lat: 90, lon: 180 }' 0; }

# dynamic: scripts/run-offline.sh really cuts the network (skipped where userns is unavailable)
t_offline() {
  if ! unshare -rn true 2>/dev/null; then
    [[ ${REQUIRE_QT:-} == 1 ]] && { _fail "unshare -rn unavailable but REQUIRE_QT=1"; return 0; }
    echo "    skip: unshare -rn unavailable here"; return 0
  fi
  run "$REPO_ROOT/scripts/run-offline.sh" python3 -c '
import socket,sys
try: socket.create_connection(("93.184.216.34", 80), timeout=3)
except OSError as e: print("blocked", e.errno); sys.exit(0)
sys.exit(7)'
  assert_rc 0; assert_contains "$OUT" "blocked"; }
t_offline_args() { run "$REPO_ROOT/scripts/run-offline.sh"; assert_rc 2; }

t "rules: clean repo passes" t_clean
t "net: XMLHttpRequest" t_xhr
t "net: WebSocket" t_ws
t "net: fetch(" t_fetch
t "net: http:// URL" t_http
t "net: https:// URL even in a comment" t_https
t "net: Qt.openUrlExternally" t_open
t "net: NetworkAccessManager" t_nam
t "net: QtWebKit" t_webkit
t "net: eval(" t_eval
t "net: new Function" t_newfn
t "net: Qt.createQmlObject" t_qco
t "net: Qt.include" t_qinc
t "net: createComponent" t_ccomp
t "net: Function(" t_fnc
t "net: WorkerScript" t_wscr
t "net: EventSource" t_es
t "net: sendBeacon" t_beacon
t "net: node http require" t_nodenet
t "net: URL in a .qml file" t_qml_file
t "net: prefetch/medieval/fetch2 are not hits" t_no_false_positive
t "net: only app/ is scanned" t_outside_app_ok
t "net: allowlist entry silences exactly that file and label" t_allowlist
t "config: tracked config/ash.json fails" t_cfg_real
t "config: other JSON in config/ fails" t_cfg_other
t "config: ash.json anywhere fails" t_cfg_root
t "config: *.local.json fails" t_cfg_local
t "config: package.json / .claude JSON allowed" t_cfg_other_json_elsewhere_ok
t "config: missing gitignore rule fails" t_ignore_missing
t "config: ignoring the example fails" t_ignore_example
t "config: repo .gitignore covers config, node_modules, screenshots" t_real_gitignore
t "coords: lat/lon object in app/ fails" t_coord_js
t "coords: JSON latitude/longitude on separate lines fails" t_coord_json
t "coords: camelCase keys in tests/ fail" t_coord_test
t "coords: UPPER constants and negative values fail" t_coord_eq
t "coords: lone latitude fails" t_coord_lone
t "coords: Utrecht allowed" t_pub_utrecht
t "coords: Maastricht and Groningen allowed" t_pub_both
t "coords: mixing two public places fails" t_pub_mixed
t "coords: astronomy constants, tables, colon/flat not hits" t_no_named_keys
t "coords: whole-degree values are not flagged" t_whole_degrees
t "offline: run-offline.sh blocks network access" t_offline
t "offline: run-offline.sh needs a command" t_offline_args
summary
