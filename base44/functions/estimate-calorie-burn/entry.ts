import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const ACTIVITIES = ['Walking', 'Running', 'Cycling', 'Hiking', 'Swimming', 'Dancing', 'Hip Hop', 'Latin Dance', 'Street Dance', 'Ballet', 'Aerobic Dance', 'Strength Training', 'Yoga'];

const SCHEMA = {
  type: 'object',
  properties: {
    activities: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          calories_10: { type: 'number' },
          calories_30: { type: 'number' },
          calories_60: { type: 'number' },
        },
      },
    },
  },
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { age, weight, height, gender, intensity } = body || {};
    if (!age || !weight || !height) return Response.json({ error: 'Missing profile fields' }, { status: 400 });

    const prompt = `You are an exercise science expert. Based on the user's profile, estimate calories burned for each activity at 10, 30, and 60 minutes.

User Profile:
- Age: ${age} years
- Weight: ${weight} kg
- Height: ${height} cm
- Gender: ${gender}
- Intensity level: ${intensity}

Activities to estimate: ${ACTIVITIES.join(', ')}

For each activity, calculate calories burned at 10 minutes, 30 minutes, and 60 minutes. Use MET (Metabolic Equivalent of Task) values adjusted for the user's body weight, age, gender, and selected intensity level. The formula is: calories = MET × weight(kg) × duration(hours). Adjust the MET value based on the intensity level selected.

Round all values to whole numbers. Respond as JSON.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: SCHEMA,
    });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}