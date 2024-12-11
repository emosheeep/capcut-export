#!/usr/bin/env node
import 'zx/globals';
import { createCommand } from 'commander';
import updateNotifier from 'update-notifier';
import { description, name, version } from '../package.json';
import { exportVideos } from './export';

const program = createCommand('ccexp');

program
  .version(version)
  .description(description)
  .showHelpAfterError('(add --help for additional information)')
  .hook('preAction', () =>
    updateNotifier({ pkg: { name, version } }).notify({
      isGlobal: true,
    }))
  .argument('<file>', 'CapCut/Jianying draft info json file.')
  .argument('[output]', 'The output directory, default is cwd.')
  .option(
    '-p,--concurrent <number>',
    `The number of tasks processed in parallel, the default is number of CPU.`,
    `${os.cpus().length}`,
  )
  .option(
    '--offset <number>',
    'Expand the video clips\' time range to both sides for about specific seconds, default is 2s.',
    '2',
  )
  .option('--verbose', 'To be verbose.', false)
  .action((file, output, options) =>
    exportVideos(file, output, {
      ...options,
      concurrent: +options.concurrent,
      offset: +options.offset,
    }),
  );

program.parse();
