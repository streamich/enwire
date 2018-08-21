const getStdin = require('get-stdin');
const minimist = require('minimist');
const {spawn} = require('child-process-promise');

const parseStdIn = (raw) => {
  try {
    return JSON.parse(raw.trim());
  } catch (error) {
    return raw;
  }
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
    const pos = rule.indexOf(':');
    if (pos === -1) {
      throw new TypeError(`Invalid --rewire rule "${rule}".`);
    }
    const from = rule.substr(0, pos).trim();
    const to = rule.substr(pos + 1).trim();
    mapping[from] = to;
  }
  return mapping;
};

const getConfigAndParams = async (cliArgs, processEnv, cwd) => {
  const config = {
    name: 'ENWIRE',
    mapping: {},
    env: {},
    shell: true,
    cwd,
  };
  const stdInRaw = await getStdin();
  const json = parseStdIn(stdInRaw);
  const params = minimist(cliArgs);

  // Include all current process env vars.
  if (!params['exclude-process']) {
    Object.assign(config.env, processEnv);
  }

  // Include variables from STDIN.
  config.name = params.name || params.n || config.name;
  if (json) {
    if (typeof json === 'object') {
      Object.assign(config.env, json);
    } else {
      config.env[config.name] = json;
    }
  }

  // Read mapping from CLI command.
  const {rewire, r} = params;
  const mapping = rewireRulesToMapping([...normalizeRewireRules(rewire), ...normalizeRewireRules(r)]);
  Object.assign(config.mapping, mapping);

  // Apply mapping.
  Object.entries(config.mapping).forEach(([from, to]) => {
    if (typeof config.env[from] !== 'undefined') {
      config.env[to] = config.env[from];
    }
  });

  // Delete rewired env vars.
  if (params['delete-rewired']) {
    Object.keys(config.mapping).forEach(from => {
      delete config.env[from];
    });
  }

  return [config, params];
};

const main = async (cliArgs, env, cwd) => {
  const [config, params] = await getConfigAndParams(cliArgs, env, cwd);

  if (!params._.length) {
    console.log(JSON.stringify(config.env, null, 4));
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
