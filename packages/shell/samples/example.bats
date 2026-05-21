#!/usr/bin/env bats
# BATS (Bash Automated Testing System) example



@test "addition using expr" {
result=$(expr 2 + 2)
[ "$result" -eq 4 ]
}

@test "addition using ((...))" {
result=$((2 + 2))
[ "$result" -eq 4 ]
}

@test "using test with integers" {
[ 10 -gt 5 ] && echo "10 > 5"
}

# Setup runs before each test
setup(){
export TEST_TEMP=$(mktemp -d)
echo "test content" > "$TEST_TEMP/test.txt"
}

# Teardown runs after each test
teardown(){
rm -rf "$TEST_TEMP"
}

@test "file existence test" {
[ -f "$TEST_TEMP/test.txt" ]
}

@test "file content verification" {
content=$(cat "$TEST_TEMP/test.txt")
[ "$content" = "test content" ]
}

@test "function with assertion" {
run my_function arg1 arg2
[ "$status" -eq 0 ]
[ "${lines[0]}" = "Expected output" ]
}

@test "stderr capture" {
run command_that_fails
[ "$status" -ne 0 ]
[[ "$output" =~ "error message" ]]
}

@test "skip conditional tests" {
if [ ! -x "$(command -v optional_tool)" ];then
skip "optional_tool not installed"
fi

run optional_tool --version
[ "$status" -eq 0 ]
}