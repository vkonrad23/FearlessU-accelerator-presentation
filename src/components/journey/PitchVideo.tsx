'use client';

import { ArrowRight, Download, Play } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { pitchMedia } from '@/data/partnerContent';
import { pitchCues } from '@/data/pitchTranscript';
import { captionTimestamp } from '@/lib/pitch-captions';
import { useLanguage, type Locale } from '@/i18n/LanguageProvider';
import styles from './PitchVideo.module.css';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function PitchVideo() {
  const { locale, t } = useLanguage();
  const video = useRef<HTMLVideoElement>(null);
  const walkthroughVideo = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [captionChoice, setCaptionChoice] = useState<Locale | 'off' | null>(null);
  const captionLanguage = captionChoice ?? locale;
  const applyCaptions = useCallback(() => {
    for (const element of [video.current, walkthroughVideo.current]) {
      if (!element) continue;
      for (const track of Array.from(element.textTracks)) {
        track.mode = track.language === captionLanguage ? 'showing' : 'disabled';
      }
    }
  }, [captionLanguage]);

  useEffect(() => {
    const elements = [video.current, walkthroughVideo.current].filter((element): element is HTMLVideoElement => element !== null);
    if (elements.length === 0) return;
    const syncCaptions = (element: HTMLVideoElement) => () => {
      const showing = Array.from(element.textTracks).find((track) => track.mode === 'showing');
      const selected = showing?.language === 'en' || showing?.language === 'uk' ? showing.language : 'off';
      if (selected !== captionLanguage) setCaptionChoice(selected);
    };
    applyCaptions();
    const listeners = elements.map((element) => ({ element, sync: syncCaptions(element) }));
    for (const { element, sync } of listeners) {
      element.textTracks.addEventListener('addtrack', applyCaptions);
      element.textTracks.addEventListener('change', sync);
    }
    return () => {
      for (const { element, sync } of listeners) {
        element.textTracks.removeEventListener('addtrack', applyCaptions);
        element.textTracks.removeEventListener('change', sync);
      }
    };
  }, [applyCaptions, captionLanguage]);

  const play = () => {
    const element = video.current;
    if (!element) return;
    setFailed(false);
    element.focus({ preventScroll: true });
    void element.play().catch(() => setFailed(true));
  };

  return (
    <section id="pitch" className={styles.section} aria-labelledby="pitch-title">
      <div className={`page-width ${styles.inner}`}>
        <header className={styles.header}>
          <div>
            <p className="eyebrow">{t('The founder pitch')} <span className={styles.duration}>1:01</span></p>
            <h2 id="pitch-title">{t('The idea,')}<br /><em>{t('in one minute.')}</em></h2>
          </div>
          <div>
            <p id="pitch-description">{t('Meet the person behind FearlessU and hear the motivation for its long-term direction. The recording shows an earlier interface and presents an early product vision.')}</p>
            <p className={styles.audioNote}>{t('English audio. English and Ukrainian subtitles. Playback starts only when you choose to play.')}</p>
          </div>
        </header>

        <aside id="pitch-context" className={styles.context}>
          <h3>{t('A vision pitch, not evidence of available treatment')}</h3>
          <p>{t('The recording describes intended AI and therapeutic goals. Today’s demo uses local rules, not live AI, and does not provide trauma or PTSD treatment. The reference to “proven” CBT does not validate FearlessU or any new exercise.')}</p>
          <a href="#development-status">{t('See what is built and what remains research')} <ArrowRight size={15} aria-hidden="true" /></a>
        </aside>

        <div className={styles.player}>
          <video
            ref={video}
            id="founder-pitch-video"
            width={1280}
            height={720}
            controls
            playsInline
            preload="none"
            poster={`${basePath}${pitchMedia.poster}`}
            aria-labelledby="pitch-title"
            aria-describedby="pitch-description pitch-context"
            tabIndex={0}
            onPlay={() => setStarted(true)}
            onLoadedMetadata={applyCaptions}
            onError={() => setFailed(true)}
          >
            <source src={`${basePath}${pitchMedia.video}`} type="video/mp4" />
            <track kind="captions" srcLang="en" label="English" src={`${basePath}${pitchMedia.captions.en}`} default={locale === 'en'} />
            <track kind="subtitles" srcLang="uk" label="Українська" src={`${basePath}${pitchMedia.captions.uk}`} default={locale === 'uk'} />
            {t('Your browser does not support inline video. Use the download link or read the transcript below.')}
          </video>
          {!started && (
            <button type="button" className={styles.play} onClick={play} aria-controls="founder-pitch-video">
              <span className={styles.playIcon}><Play size={28} fill="currentColor" aria-hidden="true" /></span>
              <span>{t('Play the founder pitch')}<small>1:01 · {t('English audio')}</small></span>
            </button>
          )}
        </div>
        {failed && <p role="alert" className={styles.error}>{t('The video could not start. Try the player controls, download the video, or read the transcript below.')}</p>}

        <div className={styles.controls}>
          <div className={styles.captionChoice}>
            <label htmlFor="pitch-captions">{t('Subtitles')}</label>
            <select id="pitch-captions" value={captionLanguage} onChange={(event) => setCaptionChoice(event.target.value as Locale | 'off')}>
              <option value="en" lang="en">English</option>
              <option value="uk" lang="uk">Українська</option>
              <option value="off">{t('Off')}</option>
            </select>
          </div>
          <a href={`${basePath}${pitchMedia.video}`} download><Download size={15} aria-hidden="true" />{t('Download video')} <span>(MP4, 3.7 MB)</span></a>
        </div>

        <details className={styles.transcript}>
          <summary>{t('Read the transcript')}</summary>
          <p className={styles.transcriptNote}>{t('Captions and transcript are lightly edited for readability. They describe the recording, not current capabilities or validated benefits. CBT refers to cognitive behavioral therapy; the researcher referenced is Aaron Beck.')}</p>
          {pitchCues.map((cue) => (
            <p key={cue.start} className={styles.cue}>
              <span className={styles.timestamp} aria-hidden="true">{captionTimestamp(cue.start).slice(3, 8)}</span>
              <span>{cue[locale]}</span>
            </p>
          ))}
        </details>
        <section className={styles.walkthrough} aria-labelledby="walkthrough-title">
          <div className={styles.walkthroughHeader}>
            <div>
              <p className="eyebrow">{t('Current interface · screen recording')} <span className={styles.duration}>0:12</span></p>
              <h3 id="walkthrough-title">{t('A short look at the working demo.')}</h3>
            </div>
            <p id="walkthrough-description">{t('This silent screen recording shows the local demo flow: choose an everyday goal, review an optional example, mark a simulated result, and see a possible next choice. Subtitles describe the interface; there is no voiceover.')}</p>
          </div>
          <div className={styles.walkthroughPlayer}>
            <video
              ref={walkthroughVideo}
              width={1280}
              height={720}
              controls
              playsInline
              preload="none"
              poster={`${basePath}${pitchMedia.walkthrough.poster}`}
              aria-labelledby="walkthrough-title"
              aria-describedby="walkthrough-description"
              onLoadedMetadata={applyCaptions}
            >
              <source src={`${basePath}${pitchMedia.walkthrough.video}`} type="video/mp4" />
              <track kind="subtitles" srcLang="en" label="English guidance" src={`${basePath}${pitchMedia.walkthrough.captions.en}`} default={locale === 'en'} />
              <track kind="subtitles" srcLang="uk" label="Український опис" src={`${basePath}${pitchMedia.walkthrough.captions.uk}`} default={locale === 'uk'} />
              {t('Your browser does not support inline video. Use the download link or read the description above.')}
            </video>
          </div>
          <div className={styles.walkthroughControls}>
            <p>{t('12-second silent capture. The prototype inputs stay in the page session and are not sent to a live AI model.')}</p>
            <a href={`${basePath}${pitchMedia.walkthrough.video}`} download><Download size={15} aria-hidden="true" />{t('Download screen recording')} <span>(MP4, 475 KiB)</span></a>
          </div>
        </section>
        <a href="#contact" className="text-link">{t('Help shape the next stage')} <ArrowRight size={17} aria-hidden="true" /></a>
      </div>
    </section>
  );
}
