import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { profile, weights, weeklyData, todayStats, streak, reportType } = body || {};

    const latestWeight = weights?.[0]?.weight_kg;
    const firstWeight = weights?.[weights?.length - 1]?.weight_kg;
    const weightChange = latestWeight && firstWeight ? (latestWeight - firstWeight).toFixed(1) : 0;
    const weekSteps = (weeklyData || []).reduce((s, d) => s + (d.steps || 0), 0);
    const weekBurned = (weeklyData || []).reduce((s, d) => s + (d.burned || 0), 0);
    const stepGoalsMet = (weeklyData || []).filter((d) => d.steps >= (profile?.daily_step_goal || 10000)).length;
    const isMonthly = reportType === 'monthly';

    const prompt = `You are a premium fitness coach generating a ${isMonthly ? 'monthly' : 'weekly'} progress report. Here is the user's data:

Profile: ${profile ? `${profile.gender}, ${profile.age} yrs, ${profile.height_cm}cm, current weight ${profile.weight_kg}kg, goal: ${profile.goal}, target weight: ${profile.target_weight || 'not set'}kg` : 'No profile set'}
Weight history: ${weights?.length || 0} entries. Latest: ${latestWeight || 'N/A'}kg, Starting: ${firstWeight || 'N/A'}kg. Change: ${weightChange}kg
This week: ${weekSteps.toLocaleString()} total steps, ${weekBurned} calories burned, ${stepGoalsMet}/7 days step goal met, ${streak}-day streak
Today: ${todayStats?.consumed || 0} kcal consumed, ${todayStats?.burned || 0} kcal burned, ${todayStats?.steps || 0} steps, ${todayStats?.workouts || 0} workouts

Generate an encouraging ${isMonthly ? 'monthly' : 'weekly'} progress report. Include:
1. A summary of their progress (weight change, activity, consistency)
2. Specific achievements and milestones
3. Personalized recommendations for next ${isMonthly ? 'month' : 'week'}
4. Motivational message
${isMonthly ? "Include a comparison with previous trends if possible. Mention average daily calorie intake changes if notable." : ""}
Keep it under ${isMonthly ? '200' : '150'} words. Use specific numbers. Be warm and encouraging.`;

    const report = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
    return Response.json({ report });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}