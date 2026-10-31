#!/usr/bin/env python3
"""Watch subagent transcripts and emit WRAPUP events when a builder nears its budget.

Usage: usage-watch.py --agent <id>=<role> [...] [--dir <subagents dir>] [--turn-warn 30]
       [--ctx-warn 150000] [--idle-after 900] [--interval 60] [--duration 540] [--state FILE]

--dir defaults to the newest ~/.claude/projects/*/*/subagents directory holding a watched agent's
transcript (sessions started outside the repo store transcripts under another project key).
An agent whose transcript has not changed for --idle-after seconds is reported idle and never alerted
(it has finished; waking a finished agent to "wrap up" wastes a turn).

Per agent, turns = unique requestId of assistant messages; context = tokens of the last call.
Level = max(turns // turn_warn, context // ctx_warn). A WRAPUP line is printed when an agent's
level exceeds the level it was last alerted at (so once per threshold crossed). Agents are never
dropped: one that goes quiet and later resumes is still watched, and re-alerts only on a higher level.
Prints WRAPUP and returns at once so the caller can act; STATUS lines on the final pass only.
"""
import argparse
import json
import os
import tempfile
import time


# ---- pure core -------------------------------------------------------------------------------

def parse_stats(lines):
    """(turns, context_tokens_of_last_call, total_output_tokens) from transcript JSONL lines."""
    seen, ctx, out = set(), 0, 0
    for line in lines:
        try:
            rec = json.loads(line)
        except ValueError:
            continue
        if not isinstance(rec, dict) or rec.get("type") != "assistant":
            continue
        rid = rec.get("requestId")
        msg = rec.get("message")
        usage = msg.get("usage") if isinstance(msg, dict) else None
        if not usage or rid in seen:
            continue
        seen.add(rid)
        ctx = sum(usage.get(k, 0) or 0 for k in
                  ("input_tokens", "cache_read_input_tokens", "cache_creation_input_tokens"))
        out += usage.get("output_tokens", 0) or 0
    return len(seen), ctx, out


def level_for(turns, ctx, turn_warn, ctx_warn):
    """Highest threshold multiple crossed: 0 = under budget, 1 = first warning, 2 = double, ..."""
    return max(turns // turn_warn if turn_warn > 0 else 0, ctx // ctx_warn if ctx_warn > 0 else 0)


def reason_for(turns, ctx, turn_warn, ctx_warn):
    t = turns // turn_warn if turn_warn > 0 else 0
    c = ctx // ctx_warn if ctx_warn > 0 else 0
    return "turns" if t >= c else "context"


def decide(entry, turns, ctx, turn_warn, ctx_warn):
    """Return (alert_reason_or_None, new_entry, activity). entry: {"level": int, "turns": int}."""
    prev = entry or {"level": 0, "turns": 0}
    level = level_for(turns, ctx, turn_warn, ctx_warn)
    activity = "active" if turns > prev["turns"] else "quiet"
    alert = None
    if level > prev["level"]:
        alert = reason_for(turns, ctx, turn_warn, ctx_warn)
    new = {"level": max(level, prev["level"]), "turns": max(turns, prev["turns"])}
    return alert, new, activity


def migrate_state(raw):
    """Old state was a list of alerted ids (level 1); new state is {id: {level, turns}}."""
    if isinstance(raw, list):
        return {str(i): {"level": 1, "turns": 0} for i in raw}
    if isinstance(raw, dict):
        return {k: v for k, v in raw.items()
                if isinstance(v, dict) and isinstance(v.get("level"), int) and isinstance(v.get("turns"), int)}
    return {}


def check_all(agents, stats_by_id, state, turn_warn, ctx_warn, idle=frozenset()):
    """agents {id: role}, stats_by_id {id: (turns, ctx, out)}, idle {id} -> (wrapups, statuses, new_state)."""
    state, wrapups, statuses = dict(state), [], []
    for aid, role in agents.items():
        turns, ctx, _ = stats_by_id.get(aid, (0, 0, 0))
        alert, state[aid], activity = decide(state.get(aid), turns, ctx, turn_warn, ctx_warn)
        if aid in idle:
            alert, activity = None, "idle"
        statuses.append(f"STATUS {role} id={aid} turns={turns} context={ctx} {activity}")
        if alert:
            wrapups.append(f"WRAPUP {role} id={aid} reason={alert} turns={turns} context={ctx}")
    return wrapups, statuses, state


# ---- I/O edges -------------------------------------------------------------------------------

def read_stats(path):
    try:
        with open(path, encoding="utf-8") as fh:
            return parse_stats(fh)
    except FileNotFoundError:
        return (0, 0, 0)


def load_state(path):
    try:
        with open(path, encoding="utf-8") as fh:
            return migrate_state(json.load(fh))
    except (OSError, ValueError):
        return {}


def save_state(path, state):
    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(os.path.abspath(path)), prefix=".usage-watch.")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            json.dump(state, fh, sort_keys=True)
        os.replace(tmp, path)
    except BaseException:
        if os.path.exists(tmp):
            os.unlink(tmp)
        raise


def find_dir(root, ids):
    """Newest <root>/*/*/subagents dir containing agent-<id>.jsonl for any watched id, else None."""
    best, best_mtime = None, -1.0
    for project in _listdir(root):
        for session in _listdir(os.path.join(root, project)):
            d = os.path.join(root, project, session, "subagents")
            for aid in ids:
                path = os.path.join(d, f"agent-{aid}.jsonl")
                if os.path.isfile(path) and os.path.getmtime(path) > best_mtime:
                    best, best_mtime = d, os.path.getmtime(path)
    return best


def _listdir(path):
    try:
        return os.listdir(path)
    except OSError:
        return []


def idle_ids(directory, ids, idle_after, now):
    """Agents whose transcript exists and has not changed for idle_after seconds."""
    out = set()
    for aid in ids:
        path = os.path.join(directory, f"agent-{aid}.jsonl")
        if idle_after > 0 and os.path.isfile(path) and now - os.path.getmtime(path) >= idle_after:
            out.add(aid)
    return out


def parse_agents(items):
    return dict(x.split("=", 1) for x in items)


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--dir", help="default: auto-detected under ~/.claude/projects")
    ap.add_argument("--agent", action="append", default=[], help="id=role")
    ap.add_argument("--turn-warn", type=int, default=30)
    ap.add_argument("--ctx-warn", type=int, default=150_000)
    ap.add_argument("--idle-after", type=int, default=900)
    ap.add_argument("--interval", type=int, default=60)
    ap.add_argument("--duration", type=int, default=540)
    ap.add_argument("--state", default=os.path.join(tempfile.gettempdir(), "usage-watch.state.json"))
    a = ap.parse_args(argv)
    agents = parse_agents(a.agent)
    directory = a.dir or find_dir(os.path.expanduser("~/.claude/projects"), list(agents))
    if not directory:
        print("ERROR no transcript found for the watched agents; pass --dir", flush=True)
        return 2
    state = load_state(a.state)
    end = time.time() + a.duration
    while True:
        stats = {aid: read_stats(os.path.join(directory, f"agent-{aid}.jsonl")) for aid in agents}
        idle = idle_ids(directory, agents, a.idle_after, time.time())
        wrapups, statuses, state = check_all(agents, stats, state, a.turn_warn, a.ctx_warn, idle)
        if wrapups:
            save_state(a.state, state)
        final = time.time() + a.interval > end
        for line in wrapups + (statuses if final else []):
            print(line, flush=True)
        if wrapups or final:
            save_state(a.state, state)
            return 0
        time.sleep(a.interval)


if __name__ == "__main__":
    raise SystemExit(main())
