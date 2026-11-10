import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
import { founder } from '../src/data/businessContent.ts';
import { developmentStatus, founderContact, investorModels, pitchMedia, supportPriorities, technicalEvidence, validationPlan } from '../src/data/partnerContent.ts';
import { pitchCues } from '../src/data/pitchTranscript.ts';
import { uk } from '../src/i18n/uk.ts';
import { captionTimestamp, pitchWebVtt } from '../src/lib/pitch-captions.ts';

const translated = (text: string) => {
  assert.ok(uk[text]?.trim(), `Missing Ukrainian translation: ${text}`);
};

test('partner, evidence, and founder copy has complete Ukrainian translations', () => {
  developmentStatus.forEach(({ title, label, items, boundary }) => [title, label, ...items, boundary].forEach(translated));
  investorModels.forEach(({ name, model, question }) => [name, model, question].forEach(translated));
  validationPlan.forEach(({ title, method, decision }) => [title, method, decision].forEach(translated));
  supportPriorities.forEach(({ title, detail }) => [title, detail].forEach(translated));
  technicalEvidence.forEach(({ title, detail, link }) => [title, detail, link].forEach(translated));
  Object.values(founder).forEach(translated);
});

test('new and updated interface labels never fall back to English in Ukrainian', () => {
  const components = ['Partnerships', 'AIArchitecture', 'HeroProductPreview', 'PreviewButton', 'Founder', 'PitchVideo', 'SiteFooter', 'Navigation', 'Hero', 'FinalCTA', 'JourneyPreview'];
  for (const name of components) {
    const path = new URL(`../src/components/journey/${name}.tsx`, import.meta.url);
    const source = ts.createSourceFile(path.pathname, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 't') {
        const argument = node.arguments[0];
        if (argument && ts.isStringLiteral(argument)) translated(argument.text);
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
});

test('built, planned, and research capabilities have distinct explicit limits', () => {
  assert.deepEqual(developmentStatus.map(({ id }) => id), ['built', 'planned', 'research']);
  assert.match(developmentStatus[0].boundary, /No live AI/);
  assert.match(developmentStatus[1].label, /Not available yet/);
  assert.match(developmentStatus[1].boundary, /need validation/);
  assert.match(developmentStatus[2].label, /separate, long-term/);
  assert.match(developmentStatus[2].boundary, /No trauma processing or PTSD treatment/);
  assert.match(developmentStatus[2].boundary, /not validated therapies/);
  assert.match(validationPlan[3].method, /approvals before recruitment/);
});

test('contact links use only the founder-approved public addresses', () => {
  assert.equal(founderContact.email, 'vladkonrad11@gmail.com');
  assert.equal(founderContact.linkedin, 'https://www.linkedin.com/in/vladyslav-konrad');
  assert.equal(new URL(founderContact.linkedin).protocol, 'https:');
  assert.ok(!Object.values(founderContact).some((value) => value.includes('.example')));
});

test('the supplied pitch and founder portrait are small local assets', () => {
  const video = new URL(`../public${pitchMedia.video}`, import.meta.url);
  const bytes = readFileSync(video);
  assert.equal(bytes.toString('ascii', 4, 8), 'ftyp');
  assert.ok(bytes.length < 5_000_000);
  assert.ok(pitchMedia.durationSeconds >= 60 && pitchMedia.durationSeconds <= 90);
  for (const path of [pitchMedia.poster, '/media/vladyslav-konrad.jpg']) {
    const asset = new URL(`../public${path}`, import.meta.url);
    assert.ok(statSync(asset).size < 250_000);
    const image = readFileSync(asset);
    if (path.endsWith('.jpg')) {
      assert.deepEqual(image.subarray(0, 3), Buffer.from([0xff, 0xd8, 0xff]));
    } else {
      assert.equal(image.toString('ascii', 8, 12), 'WEBP');
    }
  }
});

test('both caption tracks cover the speech with ordered readable cues', () => {
  assert.ok(pitchCues.length >= 10);
  let previousEnd = 0;
  for (const cue of pitchCues) {
    assert.ok(cue.start >= previousEnd && cue.end > cue.start);
    assert.ok(cue.end <= pitchMedia.durationSeconds);
    for (const locale of ['en', 'uk'] as const) {
      assert.ok(cue[locale].length > 0 && !cue[locale].includes('-->'));
      assert.ok(cue[locale].split('\n').length <= 2);
      assert.ok(cue[locale].length / (cue.end - cue.start) < 25, `Caption too fast: ${cue[locale]}`);
    }
    previousEnd = cue.end;
  }
  assert.ok(pitchCues[0].start < 2 && previousEnd > 58);
});

test('exported WebVTT stays in sync with the bilingual transcript', () => {
  assert.equal(captionTimestamp(1.04), '00:00:01.040');
  assert.equal(captionTimestamp(61.233), '00:01:01.233');
  for (const locale of ['en', 'uk'] as const) {
    const file = new URL(`../public${pitchMedia.captions[locale]}`, import.meta.url);
    assert.equal(readFileSync(file, 'utf8').replace(/\r\n/g, '\n'), pitchWebVtt(locale), 'Run npm run captions after editing the transcript.');
  }
});

test('the current silent prototype walkthrough ships with valid local bilingual subtitles', () => {
  const videoPath = new URL(`../public${pitchMedia.walkthrough.video}`, import.meta.url);
  const video = readFileSync(videoPath);
  assert.equal(video.toString('ascii', 4, 8), 'ftyp');
  assert.ok(video.length < 800_000);
  assert.ok(pitchMedia.walkthrough.durationSeconds > 10 && pitchMedia.walkthrough.durationSeconds < 15);

  const posterPath = new URL(`../public${pitchMedia.walkthrough.poster}`, import.meta.url);
  const poster = readFileSync(posterPath);
  assert.ok(statSync(posterPath).size < 250_000);
  assert.equal(poster.toString('ascii', 8, 12), 'WEBP');

  for (const locale of ['en', 'uk'] as const) {
    const path = new URL(`../public${pitchMedia.walkthrough.captions[locale]}`, import.meta.url);
    const text = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
    assert.match(text, /^WEBVTT\n/);
    const cues = text.split('\n').filter((line) => line.includes(' --> '));
    assert.equal(cues.length, 5);
    let previousEnd = 0;
    for (const cue of cues) {
      const [start, end] = cue.split(' --> ').map((stamp) => stamp.split(':').reduce((sum, part) => sum * 60 + Number(part), 0));
      assert.ok(start >= previousEnd && end > start);
      previousEnd = end;
    }
    assert.equal(previousEnd, pitchMedia.walkthrough.durationSeconds);
  }
});
