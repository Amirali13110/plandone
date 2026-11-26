import { buildPlanSystemPrompt, buildPlanUserPrompt } from '../../src/services/planPrompt.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-120b';

export const config = {
  path: '/api/plan',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const apiKey = (process.env.GROQ_API_KEY || '').trim();
  if (!apiKey) {
    return Response.json({ code: 'MISSING_KEY' }, { status: 500 });
  }

  let goal = '';
  let lang = 'en';
  try {
    const body = await req.json();
    goal = typeof body?.goal === 'string' ? body.goal.trim() : '';
    lang = body?.lang === 'fa' ? 'fa' : 'en';
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!goal) {
    return Response.json({ error: 'Goal is required' }, { status: 400 });
  }

  const groqRes = await fetch(GROQ_URL, {
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

  const groqBody = await groqRes.json().catch(() => null);
  if (!groqRes.ok) {
    return Response.json(
      { error: groqBody?.error ?? null },
      { status: groqRes.status },
    );
  }

  const content = groqBody?.choices?.[0]?.message?.content ?? '';
  return Response.json({ content }, { status: 200 });
}
