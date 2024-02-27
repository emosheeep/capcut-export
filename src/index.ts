#!/usr/bin/env node
import 'zx/globals';
import { createCommand } from 'commander';
import updateNotifier from 'update-notifier';
import nodeCleanup from 'node-cleanup';
import { description, version, name } from '../package.json';

const startAt = Date.now();
nodeCleanup((exitCode) =>
  console.log(
    exitCode
      ? `${chalk.red.bold('error')} Command failed with exit code ${exitCode}.`
      : `✨ Done in ${((Date.now() - startAt) / 1000).toFixed(2)}s.`,
  ),
);

const program = createCommand('ccexp');

program
  .version(version)
  .description(description)
  .showHelpAfterError('(add --help for additional information)')
  .hook('preAction', () =>
    updateNotifier({ pkg: { name, version } }).notify({
      isGlobal: true,
    }),
  );

program
  .argument(
    '[file]',
    'CapCut/Jianying draft info file.',
    '/Users/emosheep/Movies/JianyingPro/User Data/Projects/com.lveditor.draft/麦理浩径破边州/draft_info.json',
  )
  .option('--offset [number]', '')
  .action((file, options) =>
    import('./export').then((v) => v.default(file, options)),
  );

program.parse();
