import { useState } from 'react';
import { ForestMap } from './components/ForestMap';
import { LevelCard } from './components/LevelCard';
import { MapIcon, TopBar } from './components/TopBar';
import { generatePlan } from './services/planService';

const QUICK_IDEAS = ['Start bodybuilding', 'Become a programmer', 'Learn guitar'];

export default function App() {
  const [plan, setPlan] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isFinished = plan !== null && activeIndex >= plan.levels.length;
  const activeLevel = plan && !isFinished ? (plan.levels[activeIndex] ?? null) : null;

  async function handleSubmitGoal(goal) {
    setIsLoading(true);
    setError(null);
    try {
      const nextPlan = await generatePlan(goal);
      setPlan(nextPlan);
      setActiveIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan.');
    } finally {
      setIsLoading(false);
    }
  }

  function handlePrev() {
    setActiveIndex((i) => Math.max(0, i - 1));
  }

  function handleNext() {
    if (!plan) return;
    setActiveIndex((i) => (i >= plan.levels.length ? 0 : i + 1));
  }

  return (
    <div className="forest-app">
      <TopBar
        totalDuration={plan?.totalDuration}
        isLoading={isLoading}
        onSubmitGoal={handleSubmitGoal}
      />

      {error && <p className="forest-error" role="alert">{error}</p>}

      {isLoading && (
        <div className="forest-loading" role="status" aria-live="polite">
          <span className="loading-dot" aria-hidden="true" />
          Charting your custom forest map…
        </div>
      )}

      {plan ? (
        <>
          <main className={isLoading ? 'is-loading' : ''}>
            <ForestMap
              plan={plan}
              activeIndex={activeIndex}
              onSelectIndex={setActiveIndex}
            />
          </main>

          <LevelCard
            level={activeLevel}
            goal={plan.goal}
            totalDuration={plan.totalDuration}
            index={activeIndex}
            total={plan.levels.length}
            isFinished={isFinished}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </>
      ) : (
        <section className="empty-forest" aria-label="Get started">
          <div className="empty-icon" aria-hidden="true">
            <MapIcon size={32} />
          </div>
          <h1 className="empty-title">Visualize any plan as a forest map</h1>
          <p className="empty-desc">
            Type your goal above—or try one of these—to generate a live step-by-step route.
          </p>
          <div className="empty-ideas">
            {QUICK_IDEAS.map((idea) => (
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
