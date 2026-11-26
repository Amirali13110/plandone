export function LevelCard({
  t,
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
      <section className="bottom-card bottom-card--congrats" aria-label={t.goalReached}>
        <div key="congrats" className="bottom-card-content">
          <div className="congrats-head">
            <span className="congrats-trophy" aria-hidden="true">★</span>
            <div>
              <span className="bottom-level-badge bottom-level-badge--congrats">
                {t.goalReached} · {totalDuration}
              </span>
              <h2 className="bottom-card-title congrats-title">{t.congratsTitle}</h2>
            </div>
          </div>
          <p className="bottom-card-desc">{t.congratsDesc(total, goal)}</p>
        </div>

        <div className="bottom-card-actions">
          <button type="button" className="nav-btn nav-btn--ghost" onClick={onPrev}>
            {t.back}
          </button>
          <button type="button" className="nav-btn nav-btn--gold" onClick={onNext}>
            {t.restart}
          </button>
        </div>
      </section>
    );
  }

  if (!level) return null;

  return (
    <section className="bottom-card" aria-label={t.levelOf(level.levelNumber, total)}>
      <div key={`${goal}-${level.levelNumber}`} className="bottom-card-content">
        <div className="bottom-card-meta">
          <span className="bottom-level-badge">
            {t.levelOf(level.levelNumber, total)}
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
          {t.back}
        </button>
        <button type="button" className="nav-btn nav-btn--primary" onClick={onNext}>
          {index === total - 1 ? t.finish : t.next}
        </button>
      </div>
    </section>
  );
}
