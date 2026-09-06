import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const SPORTS_SCHEMA = {
  type: 'object',
  properties: {
    sport_type: { type: 'string' },
    garment_type: { type: 'string' },
    materials: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          advantages: { type: 'array', items: { type: 'string' } },
          disadvantages: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    summary: { type: 'string' },
    performance_score: { type: 'number' },
    breathability_score: { type: 'number' },
    comfort_score: { type: 'number' },
    durability_score: { type: 'number' },
    fit_score: { type: 'number' },
    recommended_sports: { type: 'array', items: { type: 'string' } },
    alternatives: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          reason: { type: 'string' },
        },
      },
    },
  },
};

const SPORTS_PROMPT = `You are an expert sports apparel analyst. Analyze the sports clothing item in this photo. Examine the garment — its fabric texture, weave, compression level, design features (mesh panels, zippers, padding, reflective elements, etc.), and visual characteristics — to identify what sport or athletic activity it is designed for and evaluate how well it would perform.

Provide:
- sport_type: the primary sport or activity this garment is designed for (e.g., "Running", "Yoga", "Weightlifting", "Cycling", "Basketball")
- garment_type: the type of garment (e.g., "running shoes", "compression shirt", "yoga pants", "sports bra", "track jacket")
- materials: array of materials you can identify, each with name, advantages (for athletic performance), and disadvantages (for athletic performance)
- summary: a concise overall assessment of how well this garment performs for its intended sport
- performance_score (1-10): overall athletic performance and quality
- breathability_score (1-10): ventilation, airflow, and moisture-wicking ability
- comfort_score (1-10): comfort during physical activity and movement
- durability_score (1-10): how well it holds up to repeated sports use and washing
- fit_score (1-10): support, flexibility, range of motion, and how well it stays in place
- recommended_sports: array of sports/activities this garment is well-suited for
- alternatives: array of better-performing alternatives, each with name and reason

Respond as JSON matching this schema.`;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { image_url } = body || {};
    if (!image_url) return Response.json({ error: 'image_url is required' }, { status: 400 });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: SPORTS_PROMPT,
      response_json_schema: SPORTS_SCHEMA,
      file_urls: [image_url],
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}