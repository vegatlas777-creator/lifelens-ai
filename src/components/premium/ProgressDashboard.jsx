import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Flame, Footprints, Dumbbell, Target, Sparkles, TrendingUp, Award, ArrowRight } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { getTodayStr, getLast7Days, formatDate, getLast30Days } from '@/lib/dateUtils';

export default function ProgressDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiReport, setAiReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const today = getTodayStr();
      const last7 = getLast7Days();
      const last30 = getLast30Days();
      const [profile, weights, foodToday, workoutsToday, activityToday] = await Promise.all([
        base44.entities.MetabolicProfile.list('-created_date', 1),
        base44.entities.WeightEntry.list('-entry_date', 30),
        base44.entities.FoodEntry.filter({ entry_date: today }),
        base44.entities.WorkoutLog.filter({ completed_date: today }),
        base44.entities.ActivityLog.filter({ log_date: today }),
      ]);
      const weeklyData = await Promise.all(last7.map(async (d) => {
        const [food, workouts, activity] = await Promise.all([
          base44.entities.FoodEntry.filter({ entry_date: d.date }),
          base44.entities.WorkoutLog.filter({ completed_date: d.date }),
          base44.entities.ActivityLog.filter({ log_date: d.date }),
        ]);
        return {
          date: d.label,
          fullDate: d.date,
          consumed: food.reduce((s, e) => s + (e.calories || 0), 0),
          burned: workouts.reduce((s, w) => s + (w.calories_burned || 0), 0) + activity.reduce((s, l) => s + (l.calories_burned_activity || 0), 0),
          steps: activity.reduce((s, l) => s + (l.steps || 0), 0),
          workouts: workouts.length,
        };
      }));
      setData({ profile: profile[0], weights, todayStats: { consumed: foodToday.reduce((s, e) => s + (e.calories || 0), 0), burned: workoutsToday.reduce((s, w) => s + (w.calories_burned || 0), 0) + activityToday.reduce((s, l) => s + (l.calories_burned_activity || 0), 0), steps: activityToday.reduce((s, l) => s + (l.steps || 0), 0), workouts: workoutsToday.length }, weeklyData });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function generateReport() {
    setReportLoading(true);
    try {
      const { profile, weights, weeklyData, todayStats } = data;
      const latestWeight = weights[0]?.weight_kg;
      const firstWeight = weights[weights.length - 1]?.weight_kg;
      const weekSteps = weeklyData.reduce((s, d) => s + d.steps, 0);
      const weekBurned = weeklyData.reduce((s, d) => s + d.burned, 0);
      const stepGoalsMet = weeklyData.filter((d) => d.steps >= (profile?.daily_step_goal || 10000)).length;
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a premium fitness coach generating a progress report. Here is the user's data:

Profile: ${profile ? `${profile.gender}, ${profile.age} yrs, ${profile.height_cm}cm, current weight ${profile.weight_kg}kg, goal: ${profile.goal}, target weight: ${profile.target_weight || 'not set'}kg` : 'No profile set'}
Weight history: ${weights.length} entries. Latest: ${latestWeight}kg, Starting: ${firstWeight}kg. Change: ${latestWeight && firstWeight ? (latestWeight - firstWeight).toFixed(1) : 0}kg
This week: ${weekSteps.toLocaleString()} total steps, ${weekBurned} calories burned, ${stepGoalsMet}/7 days step goal met
Today: ${todayStats.consumed} kcal consumed, ${todayStats.burned} kcal burned, ${todayStats.steps} steps, ${todayStats.workouts} workouts

Generate an encouraging weekly progress report. Include:
1. A summary of their progress (weight change, activity, consistency)
2. Specific achievements and milestones
3. Personalized recommendations for next week
4. Motivational message
Keep it under 150 words. Use specific numbers. Be warm and encouraging.`,
      });
      setAiReport(response);
    } catch (e) { console.error(e); }
    setReportLoading(false);
  }

  if (loading) return <div className="flex justify-center py-8"><Loader2 size={28} className="text-[#FF9F43] animate-spin" /></div>;
  if (!data) return null;

  const { profile, weights, weeklyData, todayStats } = data;
  const stepGoal = profile?.daily_step_goal || 10000;
  const calorieGoal = profile?.daily_calorie_goal || profile?.target_calories || 2000;
  const weeklyGoal = profile?.weekly_activity_goal || 150;
  const totalWeeklyMinutes = weeklyData.reduce((s, d) => s + d.workouts * 10, 0);
  const stepGoalPct = Math.min((todayStats.steps / stepGoal) * 100, 100);
  const calorieGoalPct = Math.min((todayStats.consumed / calorieGoal) * 100, 100);
  const weeklyGoalPct = Math.min((totalWeeklyMinutes / weeklyGoal) * 100, 100);
  const stepGoalsMet = weeklyData.filter((d) => d.steps >= stepGoal).length;

  return (
    <div className="px-5 space-y-4">
      {/* Today's Goals */}
      <div className="rounded-3xl bg-white border border-[#F5EFE6] p-5">
        <h3 className="text-sm font-bold text-[#1A1A1A] mb-3">Today's Goals</h3>
        <div className="space-y-3">
          <GoalBar icon={Footprints} label="Steps" value={todayStats.steps.toLocaleString()} goal={stepGoal.toLocaleString()} pct={stepGoalPct} color="#FB923C" />
          <GoalBar icon={Flame} label="Calories Eaten" value={`${todayStats.consumed}`} goal={`${calorieGoal}`} pct={calorieGoalPct} color="#F87171" />
          <GoalBar icon={Dumbbell} label="Weekly Activity" value={`${totalWeeklyMinutes} min`} goal={`${weeklyGoal} min`} pct={weeklyGoalPct} color="#A78BFA" />
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard icon={Footprints} label="Week Steps" value={weeklyData.reduce((s, d) => s + d.steps, 0).toLocaleString()} color="text-orange-500" />
        <SummaryCard icon={Flame} label="Week Burned" value={weeklyData.reduce((s, d) => s + d.burned, 0)} color="text-rose-500" />
        <SummaryCard icon={Award} label="Goal Days" value={`${stepGoalsMet}/7`} color="text-emerald-500" />
      </div>

      {/* Calories Chart */}
      <div className="rounded-3xl bg-white border border-[#F5EFE6] p-5">
        <h3 className="text-sm font-bold text-[#1A1A1A] mb-3 flex items-center gap-2"><Flame size={15} className="text-[#FF9F43]" /> Calories: Consumed vs Burned</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5EFE6" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#999' }} />
              <YAxis tick={{ fontSize: 9, fill: '#999' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F5EFE6', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="consumed" fill="#FB923C" radius={[4, 4, 0, 0]} />
              <Bar dataKey="burned" fill="#4ADE80" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Steps Chart */}
      <div className="rounded-3xl bg-white border border-[#F5EFE6] p-5">
        <h3 className="text-sm font-bold text-[#1A1A1A] mb-3 flex items-center gap-2"><Footprints size={15} className="text-[#FF9F43]" /> Daily Steps (7 days)</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5EFE6" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#999' }} />
              <YAxis tick={{ fontSize: 9, fill: '#999' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F5EFE6', fontSize: 12 }} />
              <Bar dataKey="steps" fill="#38BDF8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Report */}
      <div className="rounded-3xl bg-white border border-[#F5EFE6] p-5">
        <h3 className="text-sm font-bold text-[#1A1A1A] mb-3 flex items-center gap-2"><Sparkles size={15} className="text-[#FF9F43]" /> AI Progress Report</h3>
        {aiReport ? (
          <div className="rounded-2xl bg-[#FDDDBD]/30 border border-[#FDDDBD] p-4">
            <p className="text-sm text-[#1A1A1A] whitespace-pre-wrap leading-relaxed">{aiReport}</p>
          </div>
        ) : (
          <button onClick={generateReport} disabled={reportLoading} className="w-full rounded-full bg-[#FFD5A8] text-[#1A1A1A] py-3 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {reportLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Generate Weekly Report
          </button>
        )}
      </div>
    </div>
  );
}

function GoalBar({ icon: Icon, label, value, goal, pct, color }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <Icon size={13} style={{ color }} />
          <span className="text-xs text-[#666] font-medium">{label}</span>
        </div>
        <span className="text-xs text-[#999]">{value} / {goal}</span>
      </div>
      <div className="w-full h-2 rounded-full bg-[#F5EFE6] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl bg-white border border-[#F5EFE6] p-3 text-center">
      <Icon size={16} className={`${color} mx-auto mb-1`} />
      <p className="text-sm font-bold text-[#1A1A1A]">{value}</p>
      <p className="text-[9px] text-[#666]">{label}</p>
    </div>
  );
}