#!/bin/sh
# Extracted as a script because dynamic context injection (! backtick) rejects multi-statement shell as multiple operations.
#
# Always exits 0. A non-zero exit aborts skill activation, which would hide the very message the operator needs.
set -u

# playwright-cli-version holds the version every command and flag in SKILL.md was written against.
# Any other version still runs, so a mismatch only warns — it is a lead for debugging, not a blocker.
# How to bump the version is in ../README.md.
version_file="$(dirname "$0")/../playwright-cli-version"
package=@playwright/cli

if ! expected_version=$(tr -d '[:space:]' < "$version_file"); then
  echo "Could not read the documented playwright-cli version from $version_file. Proceed, but tell the user the version check did not run."
  exit 0
fi

# Each branch prints the full instruction, so SKILL.md never restates the outcomes.
if ! command -v playwright-cli >/dev/null 2>&1; then
  echo "playwright-cli NOT FOUND on PATH. No command in this skill works without it. Stop, and ask the user to install it: pnpm add -g $package@$expected_version"
  exit 0
fi

# NO_UPDATE_NOTIFIER を渡すのは、update notifier の banner が stderr に出て actual_version に混ざり、installed と expected が同値でも比較が必ず失敗するため。
# 2>&1 は残す。異常終了時の message を mismatch の文言に載せる fallback がこの取得の役目で、抑止するのは既知で無害な banner だけにする。
# assignment はこの command にしか効かないので、skill の利用者は通常の playwright-cli 実行で notifier をそのまま受け取れる。
actual_version=$(NO_UPDATE_NOTIFIER=1 playwright-cli -v 2>&1)

if [ "$actual_version" = "$expected_version" ]; then
  echo "playwright-cli $actual_version matches the version this skill documents. Proceed."
else
  echo "playwright-cli VERSION MISMATCH: installed $actual_version, this skill documents $expected_version. Proceed, but tell the user the version differs, and suspect the mismatch first when a documented command or flag misbehaves. To align: pnpm add -g $package@$expected_version"
fi
