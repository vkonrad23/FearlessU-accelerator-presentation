import { pitchCues } from '../data/pitchTranscript.ts';

export function captionTimestamp(seconds: number) {
  const milliseconds = Math.round(seconds * 1000);
  const hours = Math.floor(milliseconds / 3600000);
  const minutes = Math.floor(milliseconds / 60000) % 60;
  const wholeSeconds = Math.floor(milliseconds / 1000) % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(wholeSeconds).padStart(2, '0')}.${String(milliseconds % 1000).padStart(3, '0')}`;
}

export function pitchWebVtt(locale: 'en' | 'uk') {
  return `WEBVTT\n\n${pitchCues.map((cue, index) => `${index + 1}\n${captionTimestamp(cue.start)} --> ${captionTimestamp(cue.end)}\n${cue[locale]}`).join('\n\n')}\n`;
}
