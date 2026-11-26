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

export function TopBar({ totalDuration, isLoading, onSubmitGoal }) {
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
            <span className="brand-tag">Visual Plan Map</span>
          </div>
        </div>

        <form className="quest-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="quest-input"
            placeholder="What plan do you want to visualize? (e.g. Start bodybuilding)"
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            disabled={isLoading}
            aria-label="Enter your plan"
          />
          <button type="submit" className="quest-btn" disabled={isLoading}>
            {isLoading ? 'Mapping…' : 'Visualize'}
          </button>
        </form>

        {totalDuration && <span className="hud-duration">{totalDuration}</span>}
      </div>
    </header>
  );
}
