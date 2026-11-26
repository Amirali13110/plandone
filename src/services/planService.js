import { TRANSLATIONS } from '../utils/i18n';
import { buildPlanSystemPrompt, buildPlanUserPrompt } from './planPrompt';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-120b';

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
  const apiKey = import.meta.env.VITE_GROQ_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(t.errors.missingKey);
  }

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildPlanSystemPrompt(lang) },
        { role: 'user', content: buildPlanUserPrompt(goal, lang) },
      ],
    }),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(getHttpError(res.status, body, t));
  }

  const content = body?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(t.errors.emptyResponse);
  }

  return parsePlan(content, goal, t);
}
