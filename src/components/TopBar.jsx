import { useState } from 'react';

export function MapIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}

export function TopBar({ lang, t, totalDuration, isLoading, onChangeLang, onSubmitGoal }) {
  const [goalText, setGoalText] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = goalText.trim();
    if (!trimmed || isLoading) return;
    onSubmitGoal(trimmed);
    setGoalText('');
  }

  return (
    <header className="top-hud">
      <div className="hud-row">
        <div className="hud-brand">
          <span className="brand-leaf" aria-hidden="true">
            <MapIcon />
          </span>
          <div>
            <span className="brand-name">Plandone</span>
            <span className="brand-tag">{t.brandTag}</span>
          </div>
        </div>

        <form className="quest-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="quest-input"
            placeholder={t.placeholder}
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            disabled={isLoading}
            aria-label={t.inputLabel}
          />
          <button type="submit" className="quest-btn" disabled={isLoading}>
            {isLoading ? t.mapping : t.visualize}
          </button>
        </form>

        <div className="hud-end">
          {totalDuration && <span className="hud-duration">{totalDuration}</span>}

          <div className="lang-toggle" role="group" aria-label="Language">
            <button
              type="button"
              className={`lang-btn ${lang === 'en' ? 'is-active' : ''}`}
              onClick={() => onChangeLang('en')}
              disabled={isLoading}
            >
              EN
            </button>
            <button
              type="button"
              className={`lang-btn ${lang === 'fa' ? 'is-active' : ''}`}
              onClick={() => onChangeLang('fa')}
              disabled={isLoading}
            >
              فا
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
