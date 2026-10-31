#!/usr/bin/env bash
# PreToolUse(Bash): hard-block destructive commands. Exit 2 blocks the call; stderr is shown to Claude.
# Patterns are deliberately narrow so legitimate commands (e.g. `rm -rf build/`) still work.
# This is a safety net against common accidents, not a sandbox: `bash -c`, `eval`, and
# `rm -rf "$DIR"/*` with a possibly-empty variable are out of scope.
# It fails closed: missing jq or unparseable input blocks (exit 2).

block() {
  echo "Blocked by .claude/hooks/guard-bash.sh: $1. Ask the user to run it manually if it is really intended." >&2
  exit 2
}

command -v jq >/dev/null 2>&1 || block "jq is not installed, so the command cannot be inspected"
input=$(cat)
jq -e . >/dev/null 2>&1 <<<"$input" || block "hook input is empty or not valid JSON"
cmd=$(jq -r '.tool_input.command // empty' <<<"$input") || block "could not read tool_input.command"

# Quoted commit messages (-m "...") are prose, not commands: drop them before text matching.
textcmd=$cmd
if grep -qE 'git[[:space:]].*commit' <<<"$cmd"; then
  textcmd=$(sed -E "s/(-m|--message)[= ]*(\"[^\"]*\"|'[^']*')//g" <<<"$cmd")
fi

# Token-based checks per command segment (split on ; & | and newlines), so flag order,
# `--`, quoting, wrappers, and git global options do not matter. Globbing is off so a bare * stays literal.
set -f
# shellcheck disable=SC2016  # literal $HOME in the pattern is intentional
DANGEROUS_PATH='^(/|~|\$HOME|\$\{HOME\}|\.\.?|\*)/?\*?$'
WRAPPERS=' sudo command env time nohup exec '

check_rm() { # args: tokens after `rm`
  local rec=0 frc=0 dd=0 t
  for t in "$@"; do
    t=${t//[\"\']/}
    if ((dd == 0)) && [[ $t == -- ]]; then dd=1; continue; fi
    if ((dd == 0)) && [[ $t == -* ]]; then
      [[ $t == --recursive || $t =~ ^-[a-zA-Z]*[rR] ]] && rec=1
      [[ $t == --force || $t =~ ^-[a-zA-Z]*f ]] && frc=1
    fi
  done
  ((rec && frc)) || return 0
  dd=0
  for t in "$@"; do
    t=${t//[\"\']/}
    if ((dd == 0)) && [[ $t == -- ]]; then dd=1; continue; fi
    ((dd == 0)) && [[ $t == -* ]] && continue
    [[ $t =~ $DANGEROUS_PATH ]] && block "rm -rf on a root, home, parent, current, or wildcard path"
  done
  return 0
}

check_git() { # args: tokens after `git`
  local i=0 t sub
  local -a a=("$@")
  while ((i < ${#a[@]})); do # skip git's global options to find the subcommand
    t=${a[i]}
    case $t in
      --git-dir|--git-dir=*|--work-tree|--work-tree=*) block "git $t redirects the repository (GIT_DIR class)" ;;
      -C|-c|--namespace|--super-prefix|--config-env) i=$((i + 2)) ;;
      -*) i=$((i + 1)) ;;
      *) break ;;
    esac
  done
  sub=${a[i]:-}
  a=("${a[@]:i+1}")
  case $sub in
    push)
      for t in "${a[@]}"; do
        [[ $t == --force || $t =~ ^-[a-zA-Z]*f || $t == +* ]] && block "git force push (-f, --force, or +refspec)"
      done ;;
    clean)
      local dry=0 frc=0
      for t in "${a[@]}"; do
        [[ $t == --dry-run || $t =~ ^-[a-zA-Z]*n ]] && dry=1
        [[ $t == --force || $t =~ ^-[a-zA-Z]*f ]] && frc=1
      done
      ((frc && !dry)) && block "git clean -f" ;;
    reset)
      for t in "${a[@]}"; do [[ $t == --hard ]] && block "git reset --hard"; done ;;
  esac
  case $sub in
    commit|push|merge)
      for t in "${a[@]}"; do [[ $t == --no-verify ]] && block "skipping git hooks with --no-verify"; done ;;
  esac
  return 0
}

while IFS= read -r seg; do
  read -ra w <<<"$seg"
  # strip wrappers, VAR=val words, and options of the wrapper (env -i, sudo -E)
  wrapped=0
  while [[ ${#w[@]} -gt 0 ]]; do
    base=${w[0]#\\}; base=${base##*/}
    if [[ $WRAPPERS == *" $base "* ]]; then wrapped=1; w=("${w[@]:1}")
    elif [[ ${w[0]} =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then w=("${w[@]:1}")
    elif ((wrapped)) && [[ ${w[0]} == -* ]]; then w=("${w[@]:1}")
    else break; fi
  done
  [[ ${#w[@]} -gt 0 ]] || continue
  cmdname=${w[0]#\\}; cmdname=${cmdname##*/}
  if [[ $cmdname == xargs ]]; then # find the command xargs will run
    for i in "${!w[@]}"; do
      b=${w[i]##*/}
      if [[ $b == rm || $b == git ]]; then cmdname=$b; w=("${w[@]:i}"); break; fi
    done
  fi
  case $cmdname in
    rm) check_rm "${w[@]:1}" ;;
    git) check_git "${w[@]:1}" ;;
  esac
done <<<"${cmd//[;&|]/$'\n'}"
set +f
# overriding git's repository location can aim writes at a real repo (incident 2026-10-14)
grep -qE '(^|[;&|[:space:]])(export[[:space:]]+)?GIT_(DIR|WORK_TREE)=' <<<"$textcmd" && block "setting GIT_DIR/GIT_WORK_TREE"
grep -qiE '\b(drop[[:space:]]+(table|database|schema)|truncate[[:space:]]+table)\b' <<<"$textcmd" && block "destructive SQL"
grep -qE '\b(mkfs(\.[a-z0-9]+)?|dd[[:space:]].*of=/dev/)' <<<"$cmd" && block "disk-level write"
exit 0
