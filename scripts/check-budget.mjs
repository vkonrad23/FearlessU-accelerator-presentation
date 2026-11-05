import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';
import { sceneConfig } from '../src/config/scene.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const output = join(root, 'out');

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => entry.isDirectory()
    ? walk(join(directory, entry.name)) : [join(directory, entry.name)]));
  return files.flat();
}

async function main() {
  const html = await readFile(join(output, 'index.html'), 'utf8');
  const paths = new Set();
  for (const match of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"]+\.js(?:\?[^"]*)?)"[^>]*>/g)) {
    const pathname = new URL(match[1], 'http://localhost').pathname;
    const start = pathname.indexOf('/_next/');
    if (start < 0) throw new Error(`Unexpected non-local script: ${pathname}`);
    paths.add(decodeURIComponent(pathname.slice(start + 1)));
  }
  if (!paths.size) throw new Error('No initial JavaScript found. Run npm run build first.');
  const initialFiles = await Promise.all([...paths].map(async (path) => {
    const bytes = await readFile(join(output, path));
    return { path, bytes: bytes.length, gzipBytes: gzipSync(bytes).length };
  }));
  const inlineScripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter((match) => !/\bsrc\s*=/.test(match[1]))
    .map((match) => match[2]).join('\n');
  const inlineGzipBytes = gzipSync(inlineScripts).length;
  const initialGzipBytes = initialFiles.reduce((sum, file) => sum + file.gzipBytes, inlineGzipBytes);
  const deferredFiles = await Promise.all((await walk(join(output, '_next', 'static', 'chunks')))
    .filter((path) => path.endsWith('.js') && !paths.has(relative(output, path).replaceAll('\\', '/')))
    .map(async (path) => ({ path: relative(output, path).replaceAll('\\', '/'), gzipBytes: gzipSync(await readFile(path)).length })));
  const models = (await walk(join(root, 'public', 'models'))).filter((path) => path.endsWith('.glb'));
  for (const model of models) {
    if ((await stat(model)).size > sceneConfig.models.maxBytes) throw new Error(`Model exceeds its byte budget: ${relative(root, model)}`);
  }
  const report = {
    definition: 'Initial HTML-linked/preloaded scripts (including nomodule polyfills) plus inline bootstrap JavaScript. All emitted lazy chunks are reported separately, not silently counted as zero.',
    limitBytes: sceneConfig.budgets.initialJsGzipBytes,
    initialGzipBytes,
    inlineGzipBytes,
    initialFiles,
    deferredEmittedGzipBytes: deferredFiles.reduce((sum, file) => sum + file.gzipBytes, 0),
    deferredFiles: deferredFiles.sort((a, b) => b.gzipBytes - a.gzipBytes),
    modelCount: models.length,
    passed: initialGzipBytes < sceneConfig.budgets.initialJsGzipBytes,
  };
  await mkdir(join(root, 'artifacts'), { recursive: true });
  await writeFile(join(root, 'artifacts', 'bundle-budget.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Initial JavaScript: ${(initialGzipBytes / 1000).toFixed(1)} kB gzip / ${sceneConfig.budgets.initialJsGzipBytes / 1000} kB budget`);
  console.log(`Emitted lazy chunks: ${(report.deferredEmittedGzipBytes / 1000).toFixed(1)} kB gzip (graphics, scroll controller, optional models, preview)`);
  console.log(`Optional models checked: ${models.length}. Report: artifacts/bundle-budget.json`);
  if (!report.passed) process.exitCode = 1;
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
