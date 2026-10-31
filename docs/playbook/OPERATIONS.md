# Operations runbook

How the team runs things that outlive a single command: long jobs, demos for the PO, background agents, and session restarts.

## Long-running jobs (builds, downloads, data runs)
A job started as a child of the session dies when the session ends, the terminal closes, or the host sleeps (on WSL, a sleeping Windows host pauses the whole VM).

1. Write the job as a script that is **idempotent and resumable**: finished steps are skipped, downloads resume from `.part` files, outputs are written to a temp name and then moved into place, and a final `done.json` marks success. Take a lock with `flock`.
2. Start it detached, with the log and PID outside the repo:
   ```bash
   setsid nohup scripts/<job>.sh >> "$PROJECT_DATA/<job>.log" 2>&1 < /dev/null &
   ```
   Then find the real PID (`ps -eo pid,args | awk '$2=="bash" && $3=="scripts/<job>.sh"{print $1}'`) and write it to `$PROJECT_DATA/<job>.pid`.
3. Record it on the board: what runs, its PID file, its log, how to restart it, and what "done" looks like.
4. On every session start, check it: `ps -p "$(cat "$PROJECT_DATA/<job>.pid")"` plus the last log lines. Never report a job as running without that check.
5. Ask the PO to stop the host from sleeping during overnight jobs.
6. Stop a job by its PID only. Never use `pkill -f` or `pgrep -f`: the pattern also matches your own shell.

## Third-party services
- Identify as `<project>-<tool>/<version>`, never with personal data.
- Pace requests, for example at least 1-2 s between metadata requests. Retry 429 and 5xx with back-off, honouring `Retry-After` (capped, for example at 10 minutes). Retry network errors on long runs. Fail fast on other 4xx.
- Record each service's terms, rate limits and attribution in an ADR or the brief.

## Showing the product to the PO
1. Build the release artifact and run it the way users will get it (for example a production preview server, a static server, or the deployed URL), not the dev server.
2. Check it end to end yourself first. For a web UI, use a headless browser (`webapp-testing` skill) with screenshots of the views the PO will look at, including boundaries and empty states, and zero console errors or failed requests. For a CLI or API, run the documented commands on real input.
3. For a server that should outlive the session, start it detached as above and record its PID.
4. Give the link, what to try, and what is known to be incomplete. Ask for a hard refresh after a fix (Ctrl+Shift+R), because caches and offline stores keep old assets.
5. Web: browser APIs such as geolocation and camera need HTTPS or `localhost`. Testing on a phone needs a tunnel or a LAN setup. A public tunnel puts the app on the internet, so ask the PO first.

## Background agents
- The usage monitor (`usage-monitor` agent, `scripts/team/usage-watch.py`) runs only while builders do. Stop it when the round ends.
- A background agent's notification is not a user message. Never treat an agent's report as the PO's approval.
- An agent that reports a permission denial cannot hand the action to you: surface it to the PO.

## Session restarts and compaction
- `SessionStart` hook output gives the board, the tech-lead handoff and the worktrees. Read them before acting.
- Check every background job and server listed on the board. Restart what died (resumable jobs make this safe).
- Before your own context runs low: update `BOARD.md` and `docs/team/handoffs/tech-lead.md`, and commit them.
