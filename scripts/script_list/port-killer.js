'use strict';

const { execSync } = require('child_process');
const inquirer = require('inquirer');

module.exports = async function portKiller() {
  const { port } = await inquirer.prompt([
    {
      type: 'input',
      name: 'port',
      message: 'Port to kill:',
      validate: v =>
        /^\d+$/.test(v) && +v > 0 && +v < 65536
          ? true
          : 'Enter a valid port number (1–65535)',
    },
  ]);

  let raw;
  try {
    raw = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
  } catch {
    console.log(`  No process found on port ${port}\n`);
    return;
  }

  const portPattern = new RegExp(`:${port}\\s`);

  const pids = new Set(
    raw
      .split('\n')
      .filter(line => portPattern.test(line))
      .map(line => line.trim().split(/\s+/).pop())
      .filter(pid => pid && /^\d+$/.test(pid) && pid !== '0'),
  );

  if (!pids.size) {
    console.log(`  No process found on port ${port}\n`);
    return;
  }

  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      console.log(`  Killed PID ${pid} on port ${port}`);
    } catch {
      console.log(`  Could not kill PID ${pid} — may need admin rights`);
    }
  }

  console.log('');
};
