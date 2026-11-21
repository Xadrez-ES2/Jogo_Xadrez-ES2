import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const output = process.env.ENGINE_OUTPUT
  ? path.resolve(process.env.ENGINE_OUTPUT)
  : path.join(root, 'coverage', 'engine');

export default defineConfig({
  root,
  cacheDir: path.join(output, 'vite-cache'),
  test: {
    environment: 'node',
    include: ['src/tests/engine/**/*.test.{ts,tsx}'],
    reporters: ['default', 'json'],
    outputFile: path.join(output, 'results.json'),
    fsModuleCachePath: path.join(output, 'module-cache'),
    coverage: {
      provider: 'v8',
      include: [
        'src/engine/moves/legalMoves.ts',
        'src/engine/game/applyMove.ts',
        'src/engine/status/gameStatus.ts',
      ],
      thresholds: { lines: 100, perFile: true },
      reporter: ['text', 'json', 'json-summary', 'html'],
      reportsDirectory: path.join(output, 'coverage'),
    },
  },
});
