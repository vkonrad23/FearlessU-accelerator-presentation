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
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [captionChoice, setCaptionChoice] = useState<Locale | 'off' | null>(null);
  const captionLanguage = captionChoice ?? locale;
  const applyCaptions = useCallback(() => {
    if (!video.current) return;
    for (const track of Array.from(video.current.textTracks)) {
      track.mode = track.language === captionLanguage ? 'showing' : 'disabled';
    }
  }, [captionLanguage]);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const syncCaptions = () => {
      const showing = Array.from(element.textTracks).find((track) => track.mode === 'showing');
      const selected = showing?.language === 'en' || showing?.language === 'uk' ? showing.language : 'off';
      if (selected !== captionLanguage) setCaptionChoice(selected);
    };
    applyCaptions();
    element.textTracks.addEventListener('addtrack', applyCaptions);
    element.textTracks.addEventListener('change', syncCaptions);
    return () => {
      element.textTracks.removeEventListener('addtrack', applyCaptions);
      element.textTracks.removeEventListener('change', syncCaptions);
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
        <a href="#contact" className="text-link">{t('Help shape the next stage')} <ArrowRight size={17} aria-hidden="true" /></a>
      </div>
    </section>
  );
}
