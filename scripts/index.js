'use strict';

const path = require('path');
const { execSync } = require('child_process');
const inquirer = require('inquirer');

const ROOT = path.join(__dirname, '..');

function bunRun(file) {
  execSync(`bun ${path.join(__dirname, 'script_list', file)}`, {
    stdio: 'inherit',
    cwd: ROOT,
  });
}

// ─── Register scripts here ────────────────────────────────────────────────────
const SCRIPTS = [
  {
    name: 'Kill Port            —  find & kill a process by port number',
    value: () => require('./script_list/port-killer')(),
  },
  {
    name: 'Project Setup        —  install deps, build packages, generate clients',
    value: () => bunRun('setup.ts'),
  },
  {
    name: 'Generate API Exports —  regenerate ui-clients/index.ts from API endpoints',
    value: () => bunRun('generate-api-exports.js'),
  },
  // Add new scripts below this line:
  // { name: 'My Script  —  description', value: () => require('./script_list/my-script')() },
];
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n  BusinessPro — Dev Scripts\n');

  const { run } = await inquirer.prompt([
    {
      type: 'list',
      name: 'run',
      message: 'Select a script to run:',
      choices: SCRIPTS,
      pageSize: 15,
    },
  ]);

  console.log('');
  await run();
}

main().catch(err => {
  console.error('\n  Error:', err.message);
  process.exit(1);
});
