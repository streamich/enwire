const printHelp = () => {
    // const B = '\u001B[1m'; // blue color
    const R = '\u001B[31m'; // red color
    const G = '\u001B[32m'; // green color
    const Y = '\u001B[33m'; // yellow color
    const M = '\u001B[35m'; // magenta color
    const C = '\u001B[36m'; // cyan color
    const A = '\u001B[90m'; // gray color
    const E = '\u001B[39m'; // end formatting
  
    console.log(`${C}${require('../package.json').name}${E}${A}@${require('../package.json').version}${E}
  
      ${require('../package.json').description}
  
  Installation:
      ${Y}npm i -g enwire${E}       Install using NPM.
      ${Y}npx enwire --version${E}  Use without installation.
  
  Usage:
      
      [${A}STDIN${E} |] ${C}enwire${E} [${G}options${E}] [-- ${M}<command>${E}]
      
      ${A}STDIN${E}                 ${C}enwire${E} can read input from standard input.
      ${G}options${E}               See supported options below.
      ${M}<command>${E}             Command to execute with computed env vars.
  
  Examples:
      ${A}cat .env${E} | ${C}enwire${E} -- ${M}node app.js${E}
      ${C}enwire${E} ${G}--import env.json${E} -- ${M}node app.js${E}
      ${A}cat package.json${E} | ${C}enwire${E} ${G}--no-process${E}
      ${C}enwire${E} ${G}--import package.json --no-process --format=env${E}
      ${A}echo '{\"hello\": \"world\"}'${E} | ${C}enwire${E} -- ${M}printenv hello${E}
      ${C}enwire${E} ${G}--eval${E} -- ${M}echo "Hello, \\\${USER}\\!"${E}
      ${A}cat package.json${E} | ${C}enwire${E} ${G}--eval${E} -- ${M}echo "\\\${name}@\\\${version}"${E}
      ${C}enwire${E} ${G}--eval -i .env${E} -- ${M}"CONN=sql://\\\${PGHOST}:\\\${PGPORT}/\\\${PGDATABASE}" printenv CONN${E}
      ${A}cat package.json${E} | ${C}enwire${E} ${G}--eval${E} -- ${M}echo "MAJOR: \\\${version.split('.')[0]}"${E}
      ${C}enwire${E} ${G}--prompt JWT${E} -- ${M}printenv JWT${E}
  
  Options:
      ${G}-d${E}, ${G}--delete${E}=${A}<var>${E}    Delete ${A}<var>${E} environment variable.
      ${G}-e${E}, ${G}--eval${E}            Evaluate ${M}<command>${E} arguments as JS template strings.
      ${G}-i${E}, ${G}--import${E}=${A}<file>${E}   Import extra ${Y}.json${E} or ${Y}.env${E} ${A}<file>${E} and merge into env vars.
      ${G}-p${E}, ${G}--prompt${E}=${A}<var>${E}    Prompt user to enter ${A}<var>${E} env var in console.
      ${G}-r${E}, ${G}--rewire${E}=${A}<var>${E}    From-to mapping of environment variable, e.g. ${G}--rewire${E} ${A}db:PGDATABASE${E}.
      ${G}--delete-rewired${E}      If specified, rewired environment variables will be deleted.
      ${G}--format${E}=${A}[json|env]${E}   By default exports in JSON format, ${G}--format${E} ${A}env${E} can be set${E}.
      ${G}--no-process${E}          Don't merge process env vars into output.
      ${G}--no-stdin${E}            Don't merge env vars from ${A}STDIN${E} into output.
      ${G}--pick${E}=${A}<var>${E}          If ${G}--no-process${E} is set, you can still "pick" process env vars.
      ${A}-h, --help${E}            Show this output.
      ${A}-v, --version${E}         Print version of ${C}enwire${E}.
  
  Documentation can be found at ${R}https://github.com/streamich/enwire${E}`);
};

module.exports = printHelp;
