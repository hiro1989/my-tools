#!/usr/bin/env bats
load '../../scripts/__tests__/bats_helpers'

SCRIPT="${BATS_TEST_DIRNAME}/require-pnpm.sh"

# Runs the hook with the input that Claude Code passes for a Bash tool call.
run_hook() {
  run --separate-stderr bash -c 'jq -cn --arg c "$1" "{tool_name: \"Bash\", tool_input: {command: \$c}}" | "$2"' _ "$1" "$SCRIPT"
}

assert_blocked() {
  assert_failure 2
  assert_stderr --partial 'Use pnpm instead'
}

@test "blocks a package manager at the start of the command" {
  for command in 'npm install' 'npx tsc' 'yarn add foo' 'yarnpkg' 'bun run dev' 'bunx foo' 'pnpx foo'; do
    run_hook "$command"
    assert_blocked
  done
}

@test "blocks a package manager after a command separator" {
  for command in 'cd frontend && npm test' 'true; npx foo' 'false || yarn' 'echo x | npx foo'; do
    run_hook "$command"
    assert_blocked
  done
}

@test "blocks a package manager inside a subshell or command substitution" {
  for command in '(npm test)' 'echo $(npx foo)' 'echo `npx foo`'; do
    run_hook "$command"
    assert_blocked
  done
}

@test "blocks a package manager behind sudo, env, or variable assignments" {
  for command in 'sudo npm install -g foo' 'env npx foo' 'NODE_ENV=test npx vitest' 'A=1 B=2 npm test' 'env FOO=1 npm test'; do
    run_hook "$command"
    assert_blocked
  done
}

@test "blocks a package manager on a later line" {
  run_hook $'cd frontend\nnpm test'
  assert_blocked
}

@test "allows pnpm" {
  for command in 'pnpm install' 'pnpm exec tsc' 'pnpm dlx foo' 'cd frontend && pnpm test'; do
    run_hook "$command"
    assert_success
  done
}

@test "allows a package manager name as an argument" {
  for command in 'grep npm package.json' 'git commit -m "use npm"' 'rg -n "npx " docs'; do
    run_hook "$command"
    assert_success
  done
}

@test "allows a command whose name only starts with a package manager name" {
  for command in 'npm-check' 'bunyan' 'yarn-deduplicate'; do
    run_hook "$command"
    assert_success
  done
}
