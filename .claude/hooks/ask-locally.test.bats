#!/usr/bin/env bats
load '../../scripts/__tests__/bats_helpers'

SCRIPT="${BATS_TEST_DIRNAME}/ask-locally.sh"

# Runs the hook with the input that Claude Code passes for a Bash tool call.
# $2 is the value of CLAUDE_CODE_REMOTE, and an empty value leaves it unset.
run_hook() {
  run --separate-stderr bash -c '
    if [ -n "$3" ]; then export CLAUDE_CODE_REMOTE="$3"; else unset CLAUDE_CODE_REMOTE; fi
    jq -cn --arg c "$1" "{tool_name: \"Bash\", tool_input: {command: \$c}}" | "$2"
  ' _ "$1" "$SCRIPT" "${2:-}"
}

assert_asked() {
  assert_success
  assert_equal "$(jq -r '.hookSpecificOutput.permissionDecision' <<<"$output")" ask
}

assert_not_asked() {
  assert_success
  assert_output ''
}

@test "asks for a listed command at the start of the command" {
  for command in 'curl https://example.com' 'wget https://example.com' 'curl'; do
    run_hook "$command"
    assert_asked
  done
}

@test "asks for a listed command after a command separator" {
  for command in 'cd /tmp && curl -O x' 'true; wget x' 'false || curl x' 'echo x | curl -d @- x'; do
    run_hook "$command"
    assert_asked
  done
}

@test "asks for a listed command inside a subshell or command substitution" {
  for command in '(curl x)' 'echo $(curl x)' 'echo `wget -qO- x`'; do
    run_hook "$command"
    assert_asked
  done
}

@test "asks for a listed command behind a wrapper, a path, a backslash, or variable assignments" {
  for command in 'sudo curl x' 'env curl x' 'command curl x' 'xargs curl' 'nohup wget x' 'HTTPS_PROXY=p curl x' '/usr/bin/curl x' '\curl x'; do
    run_hook "$command"
    assert_asked
  done
}

@test "asks for a listed command on a later line" {
  run_hook $'cd /tmp\ncurl x'
  assert_asked
}

@test "does not ask for a listed command name as an argument" {
  for command in 'grep curl README.md' 'git commit -m "fix curl"' 'which wget'; do
    run_hook "$command"
    assert_not_asked
  done
}

@test "does not ask for a command whose name only contains a listed command name" {
  for command in 'curlie x' 'wget2 x' 'mycurl x'; do
    run_hook "$command"
    assert_not_asked
  done
}

@test "does not ask in a cloud session" {
  run_hook 'curl https://example.com' true
  assert_not_asked
}

@test "asks when CLAUDE_CODE_REMOTE is set to a value other than true" {
  run_hook 'curl https://example.com' false
  assert_asked
}
