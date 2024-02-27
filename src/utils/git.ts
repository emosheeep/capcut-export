export interface ExecOptions {
  cwd?: string;
  verbose?: boolean;
}

export async function isWorkingDirectoryClean(options: ExecOptions = {}) {
  return within(async () => {
    $.verbose = false;
    Object.assign($, options);
    const { stdout } = await $`git status -s`;
    return !stdout;
  });
}

export async function ensureWorkingDirectoryClean() {
  if (!(await isWorkingDirectoryClean({ verbose: true }))) {
    await question(
      '\n' +
        chalk.cyan('→') +
        ' Working directory is not clean, press enter to continue ↩︎. ',
    );
  }
}

export async function getRepoRoot(options?: ExecOptions) {
  return within(async () => {
    $.verbose = false;
    Object.assign($, options);
    const { stdout } = await $`git rev-parse --show-toplevel`;
    return stdout.trim();
  });
}
