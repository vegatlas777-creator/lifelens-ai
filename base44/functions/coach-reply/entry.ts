import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const SYSTEM_CONTEXT = `You are the AI Health Coach for "3 in 1 Healthy Choice", a supportive wellness coach and motivator. Your role:
- Encourage healthy habits and celebrate milestones (e.g., hitting step goals, logging meals consistently, completing workouts)
- Track user progress and suggest realistic, achievable fitness goals
- Help users stay consistent with gentle accountability and positive reinforcement
- Answer nutrition questions, explain calorie/BMR/TDEE calculations
- Recommend activities based on user goals — walking, running, cycling, hiking, swimming, dancing, hip hop, latin dance, street dance, ballet, aerobic dance, strength training, yoga — with estimated calorie burns
- Example: "A 30-minute brisk walk may burn approximately 150 calories." or "A 45-minute cycling session may burn approximately 400 calories." or "A 30-minute Hip Hop dance class may burn approximately 250 calories."
- Suggest realistic daily activity goals and motivate the user to stay active
- Compare current progress with previous results and provide encouraging feedback (e.g., "You have lost 2.3 kg since starting your journey." or "You completed your step goal 5 days this week.")
- Provide personalized recommendations based on the user's profile, goals, and progress data
- Use the user's profile information for personalized calorie targets, daily activity recommendations, walking/running goals, calorie burn estimates, and weight management guidance
- Be warm, energetic, and motivational — like a supportive fitness friend
Keep responses under 200 words unless the user asks for detail. Use emojis occasionally to feel encouraging. Always remind that advice is educational and not a substitute for professional medical guidance.`;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { message, history, today } = body || {};
    if (!message) return Response.json({ error: 'message is required' }, { status: 400 });

    const todayStr = today || new Date().toISOString().slice(0, 10);

    const [foodEntries, workouts, activityLogs, profiles, weightEntries] = await Promise.all([
      base44.entities.FoodEntry.filter({ entry_date: todayStr }),
      base44.entities.WorkoutLog.filter({ completed_date: todayStr }),
      base44.entities.ActivityLog.filter({ log_date: todayStr }),
      base44.entities.MetabolicProfile.list('-created_date', 1),
      base44.entities.WeightEntry.list('-entry_date', 10),
    ]);

    const todayCalories = foodEntries.reduce((s, e) => s + (e.calories || 0), 0);
    const todaySteps = activityLogs.reduce((s, l) => s + (l.steps || 0), 0);
    const todayBurned = workouts.reduce((s, w) => s + (w.calories_burned || 0), 0);
    const profile = profiles[0];
    const latestWeight = weightEntries[0]?.weight_kg;
    const firstWeight = weightEntries[weightEntries.length - 1]?.weight_kg;
    const weightChange = latestWeight && firstWeight ? +(latestWeight - firstWeight).toFixed(1) : null;

    const userContext = `User's profile: ${profile ? `${profile.gender}, ${profile.age} yrs, ${profile.height_cm}cm, current weight ${profile.weight_kg}kg, target weight ${profile.target_weight || 'not set'}kg, goal: ${profile.goal}, daily step goal: ${profile.daily_step_goal || 10000}, daily calorie goal: ${profile.daily_calorie_goal || profile.target_calories || 2000}, weekly activity goal: ${profile.weekly_activity_goal || 150} min` : 'No profile set'}.

Weight progress: ${weightEntries.length} entries. Latest: ${latestWeight || 'N/A'}kg, Starting: ${firstWeight || 'N/A'}kg, Total change: ${weightChange !== null ? `${weightChange > 0 ? '+' : ''}${weightChange}kg` : 'N/A'}.

Today's progress: ${todayCalories} calories consumed (target: ${profile?.daily_calorie_goal || profile?.target_calories || 2000}), ${todaySteps} steps (goal: ${profile?.daily_step_goal || 10000}), ${todayBurned} calories burned from workouts, ${workouts.length} workouts completed.

Compare current progress with previous results and provide encouraging feedback with specific numbers.`;

    const historyText = (history || []).map((m) => `${m.role}: ${m.content}`).join('\n');

    const reply = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `${SYSTEM_CONTEXT}\n\n${userContext}\n\nConversation so far:\n${historyText}\n\nUser: ${message}\n\nAssistant:`,
    });

    return Response.json({ reply });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}