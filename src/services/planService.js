import { buildPlanUserPrompt, PLAN_SYSTEM_PROMPT } from './planPrompt';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-120b';

function readText(value, fallback) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function parsePlan(rawText, fallbackGoal) {
  const cleaned = rawText.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const data = JSON.parse(cleaned);

  if (data.refused === true) {
    throw new Error(readText(data.reason, 'This goal involves unsafe or illegal activity.'));
  }

  if (!Array.isArray(data.levels) || data.levels.length === 0) {
    throw new Error('Could not build a map for that goal. Try rephrasing it.');
  }

  const levels = data.levels.map((level = {}, i) => ({
    levelNumber: i + 1,
    title: readText(level.title, `Level ${i + 1}`),
    duration: readText(level.duration, `Stage ${i + 1}`),
    summary: readText(level.summary, 'Focus on steady progress before advancing.'),
  }));

  return {
    goal: readText(data.goal, fallbackGoal),
    totalDuration: readText(data.totalDuration, `${levels.length} Stages`),
    levels,
  };
}

function getHttpError(status, body) {
  if (status === 401) return 'Invalid Groq API key. Check VITE_GROQ_API_KEY in .env.';
  if (status === 429) return 'Too many requests. Wait a few seconds and try again.';
  if (status === 400) {
    if (body?.error?.failed_generation) {
      return `Unable to map this goal: ${body.error.failed_generation.trim()}`;
    }
    return 'This goal may involve restricted or illegal activity. Try a lawful goal instead.';
  }
  if (status >= 500) return 'Groq is temporarily unavailable. Try again shortly.';
  return 'Failed to generate your map. Please try again.';
}

export async function generatePlan(goal) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('Missing VITE_GROQ_API_KEY in your .env file.');
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
        { role: 'system', content: PLAN_SYSTEM_PROMPT },
        { role: 'user', content: buildPlanUserPrompt(goal) },
      ],
    }),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(getHttpError(res.status, body));
  }

  const content = body?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response from Groq. Please try again.');
  }

  return parsePlan(content, goal);
}
