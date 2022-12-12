import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';

export default defineConfig({
  input: 'src/api.ts',

  output: {
    dir: 'dist',
    format: 'cjs',
    sourcemap: true,
  },

  plugins: [
    typescript(),
  ],
});
