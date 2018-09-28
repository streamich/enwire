#!/usr/bin/env bats

@test "Passes through environment variables" {
  result="$(echo 'Hello' | node cli.js --raw -- printenv ENWIRE)"
  [ "$result" == "Hello" ]
}

@test "Testing --name param" {
  result="$(echo 'Hello' | node cli.js --name WORLD --raw -- printenv WORLD)"
  [ "$result" == "Hello" ]
}

@test "Can pick from .env file" {
  result="$(cat .env | node cli.js --pick foo -- printenv foo)"
  [ "$result" == "bar" ]
}

@test "Reads JSON from STDIN" {
  result="$(echo '{"foo": "bar"}' | node cli.js -- printenv foo)"
  [ "$result" == "bar" ]
}

@test "Can --rewire variables" {
  result="$(echo '{"foo": "bar"}' | node cli.js --rewire foo:LOL -- printenv LOL)"
  [ "$result" == "bar" ]
}

@test "Can exract keys from .json file" {
  result="$(cat package.json | node cli.js -- printenv name)"
  [ "$result" == "enwire" ]
}

@test "Can evaluate arguments" {
  result="$(HELLO=Hello WORLD=World node cli.js --eval -- echo "\${HELLO}")"
  [ "$result" == "Hello" ]
}

@test "Can extract nested paths from JSON" {
  result="$(cat package.json | node cli.js -r scripts.test:TEST -- printenv TEST)"
  [ "$result" == "bats test.bats" ]
}

@test "Supports .env files" {
  result="$(cat .env | node cli.js -r foo -- printenv foo)"
  [ "$result" == "bar" ]
}
