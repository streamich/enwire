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
  result="$(cat .foo.env | node cli.js --pick foo -- printenv foo)"
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
  result="$(cat .foo.env | node cli.js -r foo -- printenv foo)"
  [ "$result" == "bar" ]
}

@test "Supports --format=env" {
  result="$(cat .foo.env | node cli.js -r foo --format env --no-process)"
  [ "$result" == "foo=\"bar\"" ]
}

@test "Can --import files" {
  result="$(node cli.js --import package.json -- printenv name)"
  [ "$result" == "enwire" ]
}

@test "Can use -i shorthand for imports" {
  result="$(node cli.js -i package.json -- printenv name)"
  [ "$result" == "enwire" ]
}

@test "Can import .env file" {
  result="$(node cli.js -i .foo.env -- printenv foo)"
  [ "$result" == "bar" ]
}

@test "Can merge imports into process env vars" {
  result="$(cat package.json | node cli.js -i .foo.env -- printenv foo)"
  [ "$result" == "bar" ]
  result="$(cat package.json | node cli.js -i .foo.env -- printenv name)"
  [ "$result" == "enwire" ]
}

@test "Can import multiple files" {
  result="$(node cli.js -i .foo.env -i package.json -- printenv foo)"
  [ "$result" == "bar" ]
  result="$(node cli.js -i .foo.env -i package.json -- printenv name)"
  [ "$result" == "enwire" ]
}

@test "Can interchange -i and --import" {
  result="$(node cli.js -i .foo.env --import package.json -- printenv foo)"
  [ "$result" == "bar" ]
  result="$(node cli.js -i .foo.env --import package.json -- printenv name)"
  [ "$result" == "enwire" ]
}

@test "Can chain commands" {
  result="$(
    node cli.js -i .foo.env -- \
    node cli.js -i package.json -- \
    printenv foo
  )"
  [ "$result" == "bar" ]
  result="$(
    node cli.js -i .foo.env -- \
    node cli.js -i package.json -- \
    printenv name
  )"
  [ "$result" == "enwire" ]
}
