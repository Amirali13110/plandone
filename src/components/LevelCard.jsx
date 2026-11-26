export function LevelCard({
  level,
  goal,
  totalDuration,
  index,
  total,
  isFinished,
  onPrev,
  onNext,
}) {
  if (isFinished) {
    return (
      <section className="bottom-card bottom-card--congrats" aria-label="Goal completed">
        <div key="congrats" className="bottom-card-content">
          <div className="congrats-head">
            <span className="congrats-trophy" aria-hidden="true">★</span>
            <div>
              <span className="bottom-level-badge bottom-level-badge--congrats">
                Goal Reached · {totalDuration}
              </span>
              <h2 className="bottom-card-title congrats-title">Congratulations!</h2>
            </div>
          </div>
          <p className="bottom-card-desc">
            You&apos;ve completed all {total} levels of your <strong>{goal}</strong> map.
          </p>
        </div>

        <div className="bottom-card-actions">
          <button type="button" className="nav-btn nav-btn--ghost" onClick={onPrev}>
            ← Back
          </button>
          <button type="button" className="nav-btn nav-btn--gold" onClick={onNext}>
            Start Over ↺
          </button>
        </div>
      </section>
    );
  }

  if (!level) return null;

  return (
    <section className="bottom-card" aria-label={`Level ${level.levelNumber} overview`}>
      <div key={`${goal}-${level.levelNumber}`} className="bottom-card-content">
        <div className="bottom-card-meta">
          <span className="bottom-level-badge">
            Level {level.levelNumber} of {total}
          </span>
          <span className="bottom-duration">{level.duration}</span>
        </div>
        <h2 className="bottom-card-title">{level.title}</h2>
        <p className="bottom-card-desc">{level.summary}</p>
      </div>

      <div className="bottom-card-actions">
        <button
          type="button"
          className="nav-btn nav-btn--ghost"
          onClick={onPrev}
          disabled={index === 0}
        >
          ← Back
        </button>
        <button type="button" className="nav-btn nav-btn--primary" onClick={onNext}>
          {index === total - 1 ? 'Finish Goal ★' : 'Next Level →'}
        </button>
      </div>
    </section>
  );
}
