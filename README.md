# enwire

Tool for *"re-wiring"* environment variables.


## Usage

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
