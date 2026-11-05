import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([
    '.next/**', 'out/**', 'dist/**', 'node_modules/**', 'artifacts/**',
    'FearlessU_Presentation_Website/**', 'next-env.d.ts',
    'src/App.tsx', 'src/main.tsx', 'src/styles/**', 'src/hooks/**',
    'src/components/*.tsx',
  ]),
]);
