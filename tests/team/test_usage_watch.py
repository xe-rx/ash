"""Tests for scripts/team/usage-watch.py (synthetic JSONL transcripts under tmp_path)."""
import importlib.util
import json
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
SCRIPT = ROOT / "scripts/team/usage-watch.py"
spec = importlib.util.spec_from_file_location("usage_watch", SCRIPT)
uw = importlib.util.module_from_spec(spec)
spec.loader.exec_module(uw)


def rec(rid, inp=100, cache_read=0, cache_create=0, out=10, type_="assistant"):
    return json.dumps({"type": type_, "requestId": rid, "message": {"usage": {
        "input_tokens": inp, "cache_read_input_tokens": cache_read,
        "cache_creation_input_tokens": cache_create, "output_tokens": out}}})


def write(path, recs):
    path.write_text("\n".join(recs) + "\n", encoding="utf-8")


def test_parse_counts_unique_request_ids():
    lines = [rec("a"), rec("a"), rec("b", inp=1, cache_read=2, cache_create=3, out=5)]
    assert uw.parse_stats(lines) == (2, 6, 15)


def test_parse_skips_junk_and_non_assistant():
    lines = ["not json", "[]", rec("u", type_="user"), json.dumps({"type": "assistant", "requestId": "x"}), rec("a")]
    assert uw.parse_stats(lines)[0] == 1


def test_level_and_decide_first_alert_then_silent():
    alert, e, act = uw.decide(None, 30, 0, 30, 1000)
    assert (alert, e["level"], act) == ("turns", 1, "active")
    alert, e, act = uw.decide(e, 30, 0, 30, 1000)
    assert (alert, act) == (None, "quiet")


def test_context_reason():
    alert, _, _ = uw.decide(None, 5, 2000, 30, 1000)
    assert alert == "context"


def test_resume_after_quiet_is_watched_and_realerts_only_on_higher_level():
    _, e, _ = uw.decide(None, 30, 0, 30, 10**9)
    _, e, act = uw.decide(e, 30, 0, 30, 10**9)
    assert act == "quiet"
    alert, e, act = uw.decide(e, 35, 0, 30, 10**9)  # resumed, same level: tracked but silent
    assert (alert, act) == (None, "active")
    alert, e, _ = uw.decide(e, 60, 0, 30, 10**9)  # higher threshold: alert again
    assert alert == "turns" and e["level"] == 2


def test_legacy_list_state_migrates_to_level_one():
    st = uw.migrate_state(["abc"])
    assert st == {"abc": {"level": 1, "turns": 0}}
    alert, _, _ = uw.decide(st["abc"], 31, 0, 30, 10**9)
    assert alert is None


def test_check_all_missing_transcript_is_zero():
    w, s, st = uw.check_all({"z": "dev"}, {}, {}, 30, 1000)
    assert w == [] and "turns=0" in s[0] and st["z"]["level"] == 0


def run_cli(tmp_path, *extra):
    return subprocess.run(
        [sys.executable, str(SCRIPT), "--dir", str(tmp_path), "--agent", "a1=dev",
         "--state", str(tmp_path / "st.json"), "--interval", "1", "--duration", "0",
         "--turn-warn", "3", *extra],
        capture_output=True, text=True, timeout=30)


def test_cli_alerts_once_persists_and_realerts_after_resume(tmp_path):
    f = tmp_path / "agent-a1.jsonl"
    write(f, [rec("1"), rec("2")])
    r = run_cli(tmp_path)
    assert "WRAPUP" not in r.stdout and "STATUS dev id=a1 turns=2" in r.stdout
    write(f, [rec(str(i)) for i in range(3)])
    r = run_cli(tmp_path)
    assert "WRAPUP dev id=a1 reason=turns turns=3" in r.stdout
    r = run_cli(tmp_path)  # same state: no repeat
    assert "WRAPUP" not in r.stdout and "quiet" in r.stdout
    write(f, [rec(str(i)) for i in range(4)])  # resumes below next level
    assert "WRAPUP" not in run_cli(tmp_path).stdout
    write(f, [rec(str(i)) for i in range(6)])
    assert "WRAPUP dev id=a1 reason=turns turns=6" in run_cli(tmp_path).stdout


def test_zero_thresholds_do_not_divide_by_zero():
    assert uw.decide(None, 5, 2000, 0, 1000)[0] == "context"
    assert uw.decide(None, 40, 5, 30, 0)[0] == "turns"
    assert uw.decide(None, 40, 5, 0, 0)[0] is None


def test_save_state_is_atomic(tmp_path, monkeypatch):
    target = tmp_path / "st.json"
    uw.save_state(str(target), {"a": {"level": 1, "turns": 2}})
    replaced = []
    real = uw.os.replace
    monkeypatch.setattr(uw.os, "replace", lambda s, d: (replaced.append((s, d)), real(s, d)))
    uw.save_state(str(target), {"b": {"level": 2, "turns": 3}})
    assert replaced and replaced[0][1] == str(target) and replaced[0][0] != str(target)
    assert json.loads(target.read_text()) == {"b": {"level": 2, "turns": 3}}
    assert [p.name for p in tmp_path.iterdir()] == ["st.json"]


def test_find_dir_picks_the_newest_subagents_dir_holding_the_agent(tmp_path):
    old = tmp_path / "proj-a" / "s1" / "subagents"
    new = tmp_path / "proj-b" / "s2" / "subagents"
    for d in (old, new):
        d.mkdir(parents=True)
        (d / "agent-abc.jsonl").write_text("")
    import os
    os.utime(old / "agent-abc.jsonl", (1, 1))
    assert uw.find_dir(str(tmp_path), ["abc"]) == str(new)
    assert uw.find_dir(str(tmp_path), ["nope"]) is None


def test_finished_agents_are_reported_idle_and_never_alerted():
    agents = {"a": "builder"}
    wrapups, statuses, _ = uw.check_all(agents, {"a": (90, 10, 0)}, {}, 30, 150_000, idle={"a"})
    assert wrapups == []
    assert "idle" in statuses[0]
