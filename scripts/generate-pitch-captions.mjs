import { mkdir, writeFile } from 'node:fs/promises';
import { pitchWebVtt } from '../src/lib/pitch-captions.ts';

const directory = new URL('../public/media/', import.meta.url);
await mkdir(directory, { recursive: true });
for (const locale of ['en', 'uk']) {
  await writeFile(new URL(`fearlessu-pitch.${locale}.vtt`, directory), pitchWebVtt(locale), 'utf8');
}
console.log('Generated English and Ukrainian pitch captions from the shared transcript.');
