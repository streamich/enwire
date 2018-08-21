# enwire

Tool for *"re-wiring"* environment variables.


## Usage

Pass string as environment variable.

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
```


## Options

- `--rewire`, `-r` &mdash; from-to mapping of environment variable, e.g. `--rewire db:PGDATABASE`.
- `--delete-rewired` &mdash; if specified, rewired environment variables will be deleted.
- `--delete`, `-d` &mdash; environment variable to delete.
- `--pick` &mdash; specifies which keys to pick from JSON object provided through STDIN.
- `--no-process` &mdash; if specified, process environment variables will not be included.
- `--no-merge` &mdash; don't merge JSON from STDIN into `process.env`.
