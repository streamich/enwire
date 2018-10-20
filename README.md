# enwire

Tool for *"re-wiring"* environment variables.

- Supports `.json` format
- Supports `.env` format


## Installation

```shell
npm install --global enwire
```

or use `enwire` without installation:

```shell
npx enwire
npx enwire --no-process -r HOME
cat package.json | npx enwire --pick name --no-process
cat .env | npx enwire --pick foo --no-process
```


## *[`dotenv`](https://www.npmjs.com/package/dotenv)-like* Usage

Create a `.env` file with your env vars.

```
FOO=bar
```

Run your app with your env vars.

```shell
cat .env | enwire node app.js
```


## Usage

Print all env vars.

```shell
enwire
```

Print selected env vars.

```shell
enwire --no-process --rewire HOME
# {"HOME": "..."}
```

Export in env var format.

```shell
enwire --no-process --rewire HOME --format env
# HOME="..."
```

Rewire env vars.

```shell
enwire --no-process --rewire HOME:TROLOLO
# {"TROLOLO": "..."}
```

Pass string as an env var.

```shell
echo Hello | enwire --raw --no-process
# {"ENWIRE": "Hello"}
```

Set custom name for string variable.

```shell
echo Hello | enwire --raw --no-process --name HELLO
# {"HELLO": "Hello"}
```

Populate env vars from JSON.

```shell
echo '{"db": "Test"}' | enwire --no-process
# {"db": "Test"}
```

Rewire JSON env vars.

```shell
echo '{"db": "Test"}' | enwire --no-process --rewire db:PGDATABASE --delete db
# {"PGDATABASE": "Test"}
```

Print project name.

```shell
cat package.json | enwire --no-process --pick name
# {"name": "enwire"}
```

Rewire nested keys from JSON.

```shell
cat package.json | enwire --no-process --no-merge --rewire scripts.test:TEST_CMD
# {"TEST_CMD": "./test.sh"}
```

Pass project name to `printenv NAME` script.

```shell
cat package.json | enwire --rewire name:NAME -- printenv NAME
# enwire
```

Pass env vars to `yarn deploy` script.

```shell
enwire --rewire AWS_PROFILE_PROD:AWS_PROFILE -- yarn deploy
```

Rewire environment variables.

```shell
db=Test enwire --rewire db:PGDATABASE -- printenv PGDATABASE
# Test
```

Evaluate arguments as JavaScript template strings.

```shell
HELLO=Hello enwire --eval -- echo "\${HELLO}, \${USER + '\!'}"
# Hello, user!
```

Prompt user to enter env var in console.

```shell
enwire --prompt TEST -- printenv TEST
```


## Options

[`npx enwire --help`](https://github.com/streamich/enwire/wiki/enwire)


- `--delete`, `-d` &mdash; environment variable to delete.
- `--eval`, `-e` &mdash; evaluate CLI argumens as JS template strings.
- `--import`, `-i` &mdash; import and merge extra `.json` and `.env` files into process env
- `--prompt`, `-p` &mdash; prompt user to input variable in console if not set.
- `--rewire`, `-r` &mdash; from-to mapping of environment variable, e.g. `--rewire db:PGDATABASE`.
- `--delete-rewired` &mdash; if specified, rewired environment variables will be deleted.
- `--format` &mdash; by default exports in JSON format, `--format=env` can be set to export in env var format.
- `--no-process` &mdash; if specified, process environment variables will not be included.
- `--no-merge` &mdash; don't merge JSON from STDIN into `process.env`.
- `--pick` &mdash; specifies which keys to pick from JSON object provided through STDIN.
- `--help`, `-h` &mdash; show usage info.
- `--version`, `-v` &mdash; show `enwire` version.
