import { TRANSLATIONS } from '../utils/i18n';

function readText(value, fallback) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function parsePlan(rawText, fallbackGoal, t) {
  const cleaned = rawText.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const data = JSON.parse(cleaned);

  if (data.refused === true) {
    throw new Error(readText(data.reason, t.errors.refusedFallback));
  }

  if (!Array.isArray(data.levels) || data.levels.length === 0) {
    throw new Error(t.errors.noLevels);
  }

  const levels = data.levels.map((level = {}, i) => ({
    levelNumber: i + 1,
    title: readText(level.title, t.fallbacks.level(i + 1)),
    duration: readText(level.duration, t.fallbacks.stage(i + 1)),
    summary: readText(level.summary, t.fallbacks.summary),
  }));

  return {
    goal: readText(data.goal, fallbackGoal),
    totalDuration: readText(data.totalDuration, t.fallbacks.stages(levels.length)),
    levels,
  };
}

function getHttpError(status, body, t) {
  if (body?.code === 'MISSING_KEY') return t.errors.missingKey;
  if (status === 401) return t.errors.invalidKey;
  if (status === 429) return t.errors.rateLimit;
  if (status === 400) {
    if (body?.error?.failed_generation) {
      return `${t.errors.unablePrefix} ${body.error.failed_generation.trim()}`;
    }
    return t.errors.restricted;
  }
  if (status >= 500) return t.errors.serverDown;
  return t.errors.generic;
}

export async function generatePlan(goal, lang = 'en') {
  const t = TRANSLATIONS[lang] ?? TRANSLATIONS.en;

  const res = await fetch('/api/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal, lang }),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(getHttpError(res.status, body, t));
  }

  if (!body?.content) {
    throw new Error(t.errors.emptyResponse);
  }

  return parsePlan(body.content, goal, t);
}
