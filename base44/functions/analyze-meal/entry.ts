import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const NUTRITION_SCHEMA = {
  type: 'object',
  properties: {
    description: { type: 'string' },
    calories: { type: 'number' },
    protein: { type: 'number' },
    carbs: { type: 'number' },
    fats: { type: 'number' },
    fiber: { type: 'number' },
  },
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { image_url, description } = body || {};

    if (!image_url && !description) {
      return Response.json({ error: 'Either image_url or description is required' }, { status: 400 });
    }

    const prompt = image_url
      ? `You are a nutrition AI. Analyze the food in this image. Estimate calories, protein (g), carbs (g), fats (g), and fiber (g). Provide a short description of the food. Respond as JSON.`
      : `You are a nutrition AI. The user described their meal as: "${description}". Estimate calories, protein (g), carbs (g), fats (g), and fiber (g). Provide a short description. Respond as JSON.`;

    const llmArgs = { prompt, response_json_schema: NUTRITION_SCHEMA };
    if (image_url) llmArgs.file_urls = [image_url];

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM(llmArgs);

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}