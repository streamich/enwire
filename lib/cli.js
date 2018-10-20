const getStdin = require('get-stdin');
const minimist = require('minimist');
const {spawn} = require('child-process-promise');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const parseInput = (raw) => {
  try {
    return JSON.parse(raw.trim());
  } catch (error) {
    try {
      return dotenv.parse(Buffer.from(raw));
    } catch (error) {
      return raw;
    }
  }
};

const importFile = (file) => {
  const filename = path.resolve(file);
  const data = fs.readFileSync(filename, 'utf8');
  const json = parseInput(data);
  return json && (typeof json === 'object') ? json : {};
};

const normalizeRewireRules = (rewire) =>
  rewire instanceof Array
    ? rewire
    : rewire
      ? [rewire]
      : [];

const rewireRulesToMapping = (rules) => {
  const mapping = {};
  for (const rule of rules) {
    const pos = rule.lastIndexOf(':');
    let from, to;
    if (pos === -1) {
      from = to = rule;
    } else {
      from = rule.substr(0, pos).trim();
      to = rule.substr(pos + 1).trim();
    }
    mapping[from] = to;
  }
  return mapping;
};

const getValue = (obj, path) => {
  // If it looks like JSON string, treat it like JSON string.
  if ((path[0] === '"') && (path[path.length - 1] === '"')) {
    try {
      path = JSON.parse(path);
    } catch (error) {}
  } else {
    path = path.split('.');
  }
  if (!Array.isArray(path)) {
    path = [path];
  }
  try {
    for (const step of path) obj = obj[step];
    return obj;
  } catch (error) {
    return '';
  }
};

const evalArgs = (args, env) => args.map(arg =>
  eval('(function ({' + Object.keys(env).join(',') + '}) { return `' + arg + '`; })')(env)
);

const serializeEnv = (obj) => {
  return Object.keys(obj).map(key => `${key}=${JSON.stringify(obj[key])}`).join('\n');
};

const getConfigAndParams = async (cliArgs, processEnv, cwd) => {
  const config = {
    name: 'ENWIRE',
    mapping: {},
    env: {},
    shell: true,
    cwd,
  };
  const params = minimist(cliArgs);
  const stdInRaw = await getStdin();
  let json = params.raw ? stdInRaw : parseInput(stdInRaw);

  if (!json || (json && (typeof json === 'object'))) {
    const imports = []
      .concat(params.import instanceof Array ? params.import : [params.import])
      .concat(params.i instanceof Array ? params.i : [params.i])
      .filter(Boolean);
    if (imports.length) {
      if (!json) json = {};
      for (const file of imports) {
        Object.assign(json, importFile(file));
      }
    }
  }

  // Include all current process env vars.
  if (params.process !== false) { // Don't include process env vars with --no-process
    Object.assign(config.env, processEnv);
  }

  // Include variables from STDIN.
  config.name = params.name || params.n || config.name;
  if (json) {
    if (typeof json === 'object') {
      if (params.merge !== false) { // User can opt-out of merging with --no-merge
        if (params.pick) {
          const pick = params.pick instanceof Array ? params.pick : [params.pick];
          const picked = {};
          for (const key of pick)
          if (json.hasOwnProperty(key)) picked[key] = json[key];
          json = picked;
        }
        Object.entries(json).forEach(([key, value]) => {
          if (typeof value !== 'object') config.env[key] = value;
        });
      }
    } else {
      config.env[config.name] = json;
    }
  }

  // Read mapping from CLI command.
  const {rewire, r} = params;
  const mapping = rewireRulesToMapping([...normalizeRewireRules(rewire), ...normalizeRewireRules(r)]);
  Object.assign(config.mapping, mapping);

  // Apply mapping.
  const merged = {...processEnv, ...config.env, ...(typeof json === 'object' ? json : {})};
  Object.entries(config.mapping).forEach(([from, to]) => {
    config.env[to] = getValue(merged, from);
  });

  // Prompt user to enter env vars interactively.
  const {prompt, p} = params;
  if (prompt || p) {
    const varsToPrompt = [
      ...(prompt
        ? (prompt instanceof Array ? prompt : [prompt])
        : []
      ),
      ...(p
        ? (p instanceof Array ? p : [p])
        : []
      ),
    ];
    if (varsToPrompt.length) {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      for (const varToPrompt of varsToPrompt) {
        if (typeof config.env[varToPrompt] === 'undefined') {
          config.env[varToPrompt]  = await new Promise(resolve => {
            rl.question(varToPrompt + ' = ', (answer) => {
              resolve(answer);
            });
          });
        }
      }
      rl.close();
    }
  }

  // Delete rewired env vars.
  if (params['delete-rewired']) {
    Object.keys(config.mapping).forEach(from => {
      delete config.env[from];
    });
  }

  // Delete some vars explicitly.
  const varsToDelete = [
    ...(Array.isArray(params.delete) ? params.delete : (params.delete ? [params.delete] : [])),
    ...(Array.isArray(params.d) ? params.d : (params.d ? [params.d] : [])),
  ];
  for (const name of varsToDelete) delete config.env[name];

  // Evaluate arguments.
  if (params.eval || params.e) {
    params._ = evalArgs(params._, merged);
  }

  return [config, params];
};

const printHelp = () => {
  const B = '\u001B[1m'; // red color
  const R = '\u001B[31m'; // red color
  const G = '\u001B[32m'; // green color
  const Y = '\u001B[33m'; // yellow color
  const M = '\u001B[35m'; // magenta color
  const C = '\u001B[36m'; // cyan color
  const A = '\u001B[90m'; // gray color
  const E = '\u001B[39m'; // end formatting

  console.log(`${C}${require('../package.json').name}${E}@${Y}${require('../package.json').version}${E}

Usage:
    [${A}STDIN${E} |] ${C}enwire${E} [${G}options${E}] [-- ${M}<command>${E}]

    ${A}STDIN${E}         ${C}enwire${E} can read input from standard input.
    ${G}options${E}       See supported options below.
    ${M}<command>${E}     If specified, enwire will execute command with computed env vars.

Examples:
    ${A}cat .env${E} | ${C}enwire${E} -- ${M}node app.js${E}
    ${C}enwire${E} ${G}--import env.json${E} -- ${M}node app.js${E}
    ${A}cat package.json${E} | ${C}enwire${E} ${G}--no-process${E}
    ${A}cat package.json${E} | ${C}enwire${E} ${G}--no-process --format=env${E}
    ${A}echo "{\"hello\": \"world\"}"${E} | ${C}enwire${E} -- ${M}printenv hello${E}

Options:
    ${G}-d${E}, ${G}--delete${E}=${A}<var>${E}    Delete ${A}<var>${E} environment variable.
    ${G}-e${E}, ${G}--eval${E}            Evaluate CLI argumens as JS template strings.
    ${G}-i${E}, ${G}--import${E}=${A}<file>${E}   Import extra .json or .env ${A}<file>${E} and merge into env vars.
    ${G}-p${E}, ${G}--prompt${E}=${A}<var>${E}    Prompt user to enter ${A}<var>${E} env var in console.
    ${G}-r${E}, ${G}--rewire${E}=${A}<var>${E}    From-to mapping of environment variable, e.g. ${G}--rewire${E} ${A}db:PGDATABASE${E}.
    ${G}--delete-rewired${E}      If specified, rewired environment variables will be deleted.
    ${G}--format${E}=${A}[json|env]${E}   By default exports in JSON format, ${G}--format${E} ${A}env${E} can be set${E}.
    ${G}--no-process${E}          If specified, process environment variables will not be included.
    ${G}--no-merge${E}            Don't merge JSON from STDIN into process env.
    ${G}--pick${E}=${A}<var>${E}          If ${G}--no-process${E} or ${G}--no-merge${E} are set, you can still "pick" env vars.            
    ${A}-h, --help${E}            Show this output.
    ${A}-v, --version${E}         Print version of enwire.

Documentation can be found at ${R}https://github.com/streamich/enwire${E}`);
};

const main = async (cliArgs, env, cwd) => {
  const [config, params] = await getConfigAndParams(cliArgs, env, cwd);

  if (params.help || params.h) {
    return printHelp();
  }

  if (params.version || params.v) {
    return console.log(require('../package.json').version);
  }

  if (!params._.length) {
    console.log(
      params.format === 'env'
        ? serializeEnv(config.env)
        : JSON.stringify(config.env, null, 4)
    );
    return;
  }

  const [command, ...args] = params._;
  try {
    await spawn(command, args, {
      cwd: config.cwd,
      env: config.env,
      stdio: [0, 1, 2],
      shell: config.shell,
    });
  } catch (error) {
    process.exit(error.code);
  }
};

main(process.argv.slice(2), process.env, process.cwd()).catch(console.error);
