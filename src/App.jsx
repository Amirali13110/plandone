import { useEffect, useState } from 'react';
import { ForestMap } from './components/ForestMap';
import { LevelCard } from './components/LevelCard';
import { MapIcon, TopBar } from './components/TopBar';
import { generatePlan } from './services/planService';
import { TRANSLATIONS } from './utils/i18n';

export default function App() {
  const [lang, setLang] = useState('en');
  const [plan, setPlan] = useState(null);
  const [lastGoal, setLastGoal] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const t = TRANSLATIONS[lang];
  const isFinished = plan !== null && activeIndex >= plan.levels.length;
  const activeLevel = plan && !isFinished ? (plan.levels[activeIndex] ?? null) : null;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = t.dir;
  }, [lang, t.dir]);

  async function handleSubmitGoal(goal) {
    setLastGoal(goal);
    setIsLoading(true);
    setError(null);
    try {
      const nextPlan = await generatePlan(goal, lang);
      setPlan(nextPlan);
      setActiveIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.generic);
    } finally {
      setIsLoading(false);
    }
  }

  function handleChangeLang(nextLang) {
    setLang(nextLang);
    setError(null);
  }

  function handlePrev() {
    setActiveIndex((i) => Math.max(0, i - 1));
  }

  function handleNext() {
    if (!plan) return;
    setActiveIndex((i) => (i >= plan.levels.length ? 0 : i + 1));
  }

  return (
    <div className={`forest-app ${plan ? 'forest-app--map' : ''}`}>
      <TopBar
        lang={lang}
        t={t}
        totalDuration={plan?.totalDuration}
        isLoading={isLoading}
        onChangeLang={handleChangeLang}
        onSubmitGoal={handleSubmitGoal}
      />

      {error && <p className="forest-error" role="alert">{error}</p>}

      {isLoading && (
        <div className="forest-loading" role="status" aria-live="polite">
          <span className="loading-dot" aria-hidden="true" />
          {t.loading}
        </div>
      )}

      {plan ? (
        <>
          <main className={`map-viewport ${isLoading ? 'is-loading' : ''}`}>
            <ForestMap
              plan={plan}
              t={t}
              activeIndex={activeIndex}
              onSelectIndex={setActiveIndex}
            />
          </main>

          <LevelCard
            t={t}
            level={activeLevel}
            goal={plan.goal}
            totalDuration={plan.totalDuration}
            index={activeIndex}
            total={plan.levels.length}
            isFinished={isFinished}
            isLoading={isLoading}
            onPrev={handlePrev}
            onNext={handleNext}
            onPlanAgain={() => handleSubmitGoal(lastGoal || plan.goal)}
          />
        </>
      ) : (
        <section className="empty-forest" aria-label={t.emptyTitle}>
          <div className="empty-icon" aria-hidden="true">
            <MapIcon size={32} />
          </div>
          <h1 className="empty-title">{t.emptyTitle}</h1>
          <p className="empty-desc">{t.emptyDesc}</p>
          <div className="empty-ideas">
            {t.quickIdeas.map((idea) => (
              <button
                key={idea}
                type="button"
                className="preset-pill"
                disabled={isLoading}
                onClick={() => handleSubmitGoal(idea)}
              >
                {idea}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
