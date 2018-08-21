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
echo 'Hello' | npx enwire -- printenv ENWIRE
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


## Options

- `--rewire`, `-r` &mdash; from-to mapping of environment variable, e.g. `--rewire db:PGDATABASE`.
- `--delete-rewired` &mdash; if specified, rewired environment variables will be deleted.
- `--delete`, `-d` &mdash; environment variable to delete.
- `--exclude-process` &mdash; if specified, process environment variables will not be included.
