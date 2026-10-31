#!/usr/bin/env bash
# scripts/test.sh must fail, not skip, when the Node dependencies are missing.
# shellcheck source=tests/lib.sh
# shellcheck disable=SC1091
source "$(dirname "$0")/lib.sh"

setup_repo() {
  mk_tmp_var R; mkdir -p "$R/scripts" "$R/tests"
  cp "$REPO_ROOT/scripts/test.sh" "$R/scripts/"
  printf '%s\n' '#!/usr/bin/env bash' 'echo "  ok - x"; echo "RESULT passed=1 failed=0"' > "$R/tests/test_x.sh"
}
t_no_package_json() { setup_repo; run bash "$R/scripts/test.sh"; assert_rc 0; assert_contains "$OUT" "OK: all 1 test files passed"; }
t_missing_modules() { setup_repo; echo '{}' > "$R/package.json"; run bash "$R/scripts/test.sh"
  assert_rc 1; assert_contains "$ERR" "node_modules missing"; assert_not_contains "$OUT" "OK:"; }
t_with_modules()    { setup_repo; echo '{}' > "$R/package.json"; mkdir "$R/node_modules"; run bash "$R/scripts/test.sh"; assert_rc 0; }

t "runner: no package.json, runs shell suites only" t_no_package_json
t "runner: package.json without node_modules fails loudly" t_missing_modules
t "runner: package.json with node_modules proceeds" t_with_modules
summary
