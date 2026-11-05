import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { sceneConfig } from '../src/config/scene.ts';

const file = process.argv[2] ? resolve(process.argv[2]) : fileURLToPath(new URL('../artifacts/lighthouse-desktop.json', import.meta.url));
const report = JSON.parse(await readFile(file, 'utf8'));
if (report.runtimeError) throw new Error(report.runtimeError.message);
const scores = Object.fromEntries(Object.entries(report.categories).map(([key, value]) => [key, Math.round(value.score * 100)]));
const metrics = Object.fromEntries(['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index'].map((key) => [key, report.audits[key].numericValue]));
console.log(JSON.stringify({ scores, metrics, environment: report.environment }, null, 2));
if (scores.performance < sceneConfig.budgets.lighthouseDesktop || metrics['cumulative-layout-shift'] !== 0) {
  console.log('Main-thread work:', report.audits['mainthread-work-breakdown']?.details?.items);
  console.log('Longest tasks:', report.audits['long-tasks']?.details?.items?.slice(0, 8));
  process.exitCode = 1;
}
