# Cli Template 
This is a modern Command-Line-Tool template repository base on Node.js. You can quickly set up your cli apps with this project.

## Quick Start

```shell
# development
pnpm install
pnpm watch
pnpm ln -g # link your command globally so that you can debug easier.

# execute your global-linked command.
command-name -h

# publish your package to npm.
pnpm changeset
pnpm versions
# manually trigger publish action(.github/workflows/publish.yml).
```

## Attention

Please read the documentations of these useful tools before developing, which avoids making repetitive wheels and helps you building your cli apps.

- [zx](https://github.com/google/zx) - Execute shell command conveniently in Node.js workflow.
- [commander](https://github.com/tj/commander.js) - Node.js command-line interfaces.
- [tsup](https://github.com/egoist/tsup) - A simple and fast builder based on esbuild.
- [changesets](https://github.com/changesets/changesets) - A way to manage your versioning and changelogs.
- and so do the other tools you'll develop with, please read the docs by yourself.

Here are some [command-line-apps](https://github.com/sindresorhus/awesome-nodejs?tab=readme-ov-file#command-line-apps) and [command-line-utilities](https://github.com/sindresorhus/awesome-nodejs?tab=readme-ov-file#command-line-utilities) you probably use, which are really wonderful.


## Contribution

PR welcome if you have any constructive suggestions. Please polish your code and  describe you commit msg concisely and detailedly.