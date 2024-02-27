import { defineConfig } from 'tsup';

export default defineConfig({
  format: 'esm',
  clean: true,
  entry: ['src/index.ts'],
});
