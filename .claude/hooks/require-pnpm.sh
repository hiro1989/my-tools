#!/usr/bin/env bash
# PreToolUse hook for Bash that blocks package managers other than pnpm, because this repository manages its dependencies and lockfile with pnpm only.
#
# It matches a package manager only in command position: at a line start or after `;`, `&`, `|`, `(`, or a backtick, optionally behind `sudo`, `env`, or variable assignments.
# A package manager name that appears as an argument, such as `grep npm` or `git commit -m "use npm"`, is allowed, so that a false hit does not block unrelated commands.
set -euo pipefail

command=$(jq -r '.tool_input.command')

if grep -qE '(^|[;&|(`])[[:space:]]*((sudo|env)[[:space:]]+|[A-Za-z_][A-Za-z0-9_]*=[^[:space:]]*[[:space:]]+)*(npm|npx|yarn|yarnpkg|bun|bunx|pnpx)([[:space:]]|[;&|)]|$)' <<<"$command"; then
  echo 'Use pnpm instead of other package managers. e.g. pnpm install, pnpm test, pnpm exec, pnpm dlx.' >&2
  exit 2
fi
