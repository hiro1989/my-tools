#!/usr/bin/env bash
# PreToolUse hook for Bash that asks the user before a listed command runs on a local machine, and leaves the call to the normal permission flow in a cloud session.
# It is the local-only counterpart of `permissions.ask` in .claude/settings.json.
#
# An `ask` rule in .claude/settings.json cannot do this, for these reasons:
#
# - The cloud session reads permission rules only from .claude/settings.json, so a rule there applies to local and cloud alike.
# - An `ask` rule outranks every `allow` rule and every hook `allow`, so no other file or hook can lift it in the cloud session.
#
# List a command here only when the cloud environment already contains its risk, so that a prompt there adds no protection and only trains the user to approve without reading.
# In the cloud session, the auto mode classifier decides instead.
#
# Rewriting .claude/settings.json in the cloud session was rejected: it leaves a tracked file modified, which a `git commit -a` picks up and a pull from the remote conflicts with.
#
# It matches a command name only in command position: at a line start or after `;`, `&`, `|`, `(`, or a backtick, optionally behind a path, a backslash, a wrapper such as `sudo` or `xargs`, or variable assignments.
# A name that appears as an argument, such as `grep curl` or `git commit -m "fix curl"`, does not ask, so that unrelated commands do not prompt.
# A form it misses, such as `bash -c 'curl ...'`, still goes through the permission flow, and in auto mode through the classifier.
set -euo pipefail

# CLAUDE_CODE_REMOTE is true only in a cloud session VM.
[[ "${CLAUDE_CODE_REMOTE:-}" == "true" ]] && exit 0

# Extended regex alternation of the command names to ask for.
#
# - curl, wget: a local machine has unrestricted egress, so a download or an upload can reach any host.
#   The cloud environment restricts egress to an allowlist.
asked_commands='curl|wget'

command=$(jq -r '.tool_input.command')

if grep -qE "(^|[;&|(\`])[[:space:]]*((sudo|env|command|exec|xargs|nohup|time)[[:space:]]+|[A-Za-z_][A-Za-z0-9_]*=[^[:space:]]*[[:space:]]+)*\\\\?([^[:space:];&|()\`]*/)?(${asked_commands})([[:space:]]|[;&|)\`]|\$)" <<<"$command"; then
  jq -n '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "ask", permissionDecisionReason: "This command needs the user'\''s confirmation on a local machine. See .claude/hooks/ask-locally.sh for why."}}'
fi
exit 0
