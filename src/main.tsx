import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/motion.css';
import './styles/navigation-motion.css';
import './styles/hero-motion.css';
import './styles/hero-card.css';
import './styles/hero-scene.css';
import './styles/presentation.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>,
);
