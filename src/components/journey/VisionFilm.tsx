'use client';

import { ArrowDownToLine, Play } from 'lucide-react';
import { useRef, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';
import styles from './VisionFilm.module.css';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const videoPath = `${basePath}/media/fearlessu-life-beyond-fear.mp4`;
const posterPath = `${basePath}/media/fearlessu-life-beyond-fear-poster.webp`;

export function VisionFilm() {
  const { t } = useLanguage();
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);

  const play = () => {
    setFailed(false);
    void video.current?.play().catch(() => setFailed(true));
  };

  return (
    <section id="vision-film" className={styles.section} aria-labelledby="vision-film-title">
      <div className={`page-width ${styles.inner}`}>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}><span aria-hidden="true" />{t('CINEMATIC VISION')} <span className={styles.duration}>00:10</span></p>
            <h2 id="vision-film-title">{t('A world')}<br /><em>{t('beyond fear.')}</em></h2>
          </div>
          <div className={styles.copy}>
            <p>{t('A short cinematic vision of the possibility FearlessU hopes to explore through careful, evidence-informed research.')}</p>
            <p className={styles.note}>{t('Concept film only · Not a product demo, treatment, or evidence of clinical benefit.')}</p>
          </div>
        </header>

        <div className={styles.frame}>
          <video
            ref={video}
            id="fearlessu-vision-film"
            width={1280}
            height={720}
            controls
            playsInline
            preload="none"
            poster={posterPath}
            aria-labelledby="vision-film-title"
            aria-describedby="vision-film-description"
            onPlay={() => setStarted(true)}
            onError={() => setFailed(true)}
          >
            <source src={videoPath} type="video/mp4" />
            {t('Your browser does not support inline video. Download the concept film instead.')}
          </video>
          {!started && (
            <button type="button" className={styles.play} onClick={play} aria-label={t('Play the concept film')} aria-controls="fearlessu-vision-film">
              <span className={styles.playIcon}><Play size={25} fill="currentColor" aria-hidden="true" /></span>
              <span className={styles.playLabel}>{t('Play film')} <small>00:10</small></span>
            </button>
          )}
        </div>

        <div className={styles.footer}>
          <p id="vision-film-description">{t('Ten-second cinematic concept film. Playback begins only when you choose to play.')}</p>
          <a href={videoPath} download><ArrowDownToLine size={15} aria-hidden="true" />{t('Download the concept film')} <span>MP4 · 720p</span></a>
        </div>
        {failed && <p role="alert" className={styles.error}>{t('The film could not start. Try the player controls or download the MP4.')}</p>}
      </div>
    </section>
  );
}
