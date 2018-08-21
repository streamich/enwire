#!/bin/bash

echo "Passes through environment variables"
if [ $(echo 'Hello' | node lib/cli.js -- printenv ENWIRE) != "Hello" ]; then
  exit 1
fi

echo "Testing --name param"
if [ $(echo 'Hello' | node lib/cli.js --name WORLD -- printenv WORLD) != "Hello" ]; then
  exit 1
fi

echo "Reads JSON from STDIN"
if [ $(echo '{"foo": "bar"}' | node lib/cli.js -- printenv foo) != "bar" ]; then
  exit 1
fi

echo "Can --rewire variables"
if [ $(echo '{"foo": "bar"}' | node lib/cli.js --rewire foo:LOL -- printenv LOL) != "bar" ]; then
  exit 1
fi
