import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const CLOTHING_SCHEMA = {
  type: 'object',
  properties: {
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
    eco_friendly: { type: 'boolean' },
    sustainability_score: { type: 'number' },
    comfort_score: { type: 'number' },
    durability_score: { type: 'number' },
    health_score: { type: 'number' },
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

const CLOTHING_PROMPT = `You are an expert textile and sustainability analyst. Analyze the clothing item in this photo. Examine the garment itself — its fabric texture, weave pattern, sheen, drape, weight, and visual characteristics — to identify the material composition. Do NOT rely on care labels; identify the fabric by visually analyzing the garment. For EACH material you identify, provide: name, advantages (array of strings), disadvantages (array of strings). Then provide an overall summary, a boolean eco_friendly, scores 1-10 for sustainability, comfort, durability, and health_impact, and suggest better alternatives (array of objects with name and reason). Respond as JSON matching this schema.`;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { image_url } = body || {};
    if (!image_url) return Response.json({ error: 'image_url is required' }, { status: 400 });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: CLOTHING_PROMPT,
      response_json_schema: CLOTHING_SCHEMA,
      file_urls: [image_url],
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}