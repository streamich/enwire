const getStdin = require('get-stdin');
const minimist = require('minimist');
const {spawn} = require('child-process-promise');
const dotenv = require('dotenv');

const parseStdIn = (raw) => {
  try {
    return JSON.parse(raw.trim());
  } catch (error) {
    try {
      const buf = Buffer.from(raw);
      const config = dotenv.parse(buf);

      return config;
    } catch (error) {
      return raw;
    }
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

const getConfigAndParams = async (cliArgs, processEnv, cwd) => {
  const config = {
    name: 'ENWIRE',
    mapping: {},
    env: {},
    shell: true,
    cwd,
  };
  const stdInRaw = await getStdin();
  let json = parseStdIn(stdInRaw);
  const params = minimist(cliArgs);

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
          const pick = params.pick instanceof Array
          ? params.pick
          : [params.pick];
          const picked = {};
          for (const key of pick)
          if (Object.hasOwnProperty(key)) picked[key] = json[key];
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
