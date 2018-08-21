# enwire

Tool for *"re-wiring"* environment variables.


## Usage

Print all env vars.

```shell
npx enwire
```

Print selected env vars.

```shell
npx enwire --no-process -r HOME
# {
#     "HOME": "..."
# }
```

Rewire env vars.

```shell
npx enwire --rewire AWS_PROFILE_PROD:AWS_PROFILE -- yarn deploy
```

Pass string as an env var.

```shell
echo 'Hello' | npx enwire -- printenv ENWIRE
# Hello
```

Set custom name for string variable.

```shell
echo 'Hello' | npx enwire --name WORLD -- printenv WORLD
# Hello
```

Rewire environment variables.

```shell
db=Test npx enwire --rewire db:PGDATABASE -- printenv PGDATABASE
# Test
```

Populate environment variables from JSON.

```shell
echo '{"db": "Test"}' | npx enwire --rewire db:PGDATABASE -- printenv PGDATABASE
# Test
```

Print project name.

```shell
cat package.json | npx rewire --pick name --no-process
# {"name": "enwire"}
```

Rewire nested keys from JSON.

```shell
cat package.json | npx rewire -r scripts.test:TEST_CMD -- printenv TEST_CMD
# ./test.sh
```


## Options

- `--rewire`, `-r` &mdash; from-to mapping of environment variable, e.g. `--rewire db:PGDATABASE`.
- `--delete-rewired` &mdash; if specified, rewired environment variables will be deleted.
- `--delete`, `-d` &mdash; environment variable to delete.
- `--pick` &mdash; specifies which keys to pick from JSON object provided through STDIN.
- `--no-process` &mdash; if specified, process environment variables will not be included.
- `--no-merge` &mdash; don't merge JSON from STDIN into `process.env`.
