#!/usr/bin/env bash
# Runs a command in a fresh, empty network namespace (only a down loopback): any network
# call fails. Uses an unprivileged user namespace (`unshare -rn`), so no root is needed.
# Usage: scripts/run-offline.sh CMD [args...]   Exit 125 if user namespaces are unavailable.
set -euo pipefail
(($#)) || { echo "usage: run-offline.sh CMD [args...]" >&2; exit 2; }
if ! unshare -rn true 2>/dev/null; then
  echo "run-offline: cannot create a network namespace here (unshare -rn failed)" >&2
  exit 125
fi
exec unshare -rn "$@"
