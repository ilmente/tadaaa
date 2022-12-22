import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import analyze from 'rollup-plugin-analyzer';
import { sizeme } from 'rollup-plugin-sizeme';

export default defineConfig({
  input: 'src/api.ts',

  output: {
    dir: 'dist',
    format: 'cjs',
    sourcemap: true,
  },

  plugins: [
    typescript(),
    analyze({ summaryOnly: true }),
    sizeme(),
  ],
});
