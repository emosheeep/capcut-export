#!/usr/bin/env node
import 'zx/globals';
import { createCommand } from 'commander';
import updateNotifier from 'update-notifier';
import nodeCleanup from 'node-cleanup';
import { description, version, name } from '../package.json';

const ensureWorkingDirectoryClean = () =>
  import('@/utils/git').then((v) => v.ensureWorkingDirectoryClean());

const startAt = Date.now();
nodeCleanup((exitCode) =>
  console.log(
    exitCode
      ? `${chalk.red.bold('error')} Command failed with exit code ${exitCode}.`
      : `✨ Done in ${((Date.now() - startAt) / 1000).toFixed(2)}s.`,
  ),
);

// Command setup
const program = createCommand('your-command-name');

program
  .version(version)
  .description(description)
  .showHelpAfterError('(add --help for additional information)')
  .hook('preAction', () =>
    updateNotifier({ pkg: { name, version } }).notify({
      isGlobal: true,
    }),
  );

/**
 * Command register
 * @see https://github.com/tj/commander.js
 */
program
  .command('test')
  .description('Test command.')
  .option('--verbose', 'To be verbose.')
  // Maybe you want to check something, try to use hooks.
  .hook('preAction', () => ensureWorkingDirectoryClean())
  // Use dynamic import to speed up the startup process.
  .action((options) =>
    import('./commands/test').then((v) => v.default(options)),
  );

program.parse();
