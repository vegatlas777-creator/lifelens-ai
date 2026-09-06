import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Flame, Footprints, Dumbbell, Target, Sparkles, TrendingUp, Award, Zap } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { getTodayStr, getLast7Days, formatDate } from '@/lib/dateUtils';

export default function ProgressDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiReport, setAiReport] = useState(null);
  const [reportType, setReportType] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const today = getTodayStr();
      const last7 = getLast7Days();
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
          active: activity.reduce((s, l) => s + (l.active_minutes || 0), 0),
        };
      }));
      const streak = weeklyData.reduce((acc, d) => d.steps > 0 ? acc + 1 : 0, 0);
      setData({ profile: profile[0], weights, todayStats: { consumed: foodToday.reduce((s, e) => s + (e.calories || 0), 0), burned: workoutsToday.reduce((s, w) => s + (w.calories_burned || 0), 0) + activityToday.reduce((s, l) => s + (l.calories_burned_activity || 0), 0), steps: activityToday.reduce((s, l) => s + (l.steps || 0), 0), workouts: workoutsToday.length }, weeklyData, streak });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function generateReport(type) {
    setReportLoading(true);
    setReportType(type);
    try {
      const { profile, weights, weeklyData, todayStats, streak } = data;
      const response = await base44.functions.invoke('generate-progress-report', {
        profile, weights, weeklyData, todayStats, streak, reportType: type,
      });
      setAiReport(response.data.report);
    } catch (e) { console.error(e); }
    setReportLoading(false);
  }

  if (loading) return <div className="flex justify-center py-8"><Loader2 size={28} className="text-[#C87883] animate-spin" /></div>;
  if (!data) return null;

  const { profile, weights, weeklyData, todayStats, streak } = data;
  const stepGoal = profile?.daily_step_goal || 10000;
  const calorieGoal = profile?.daily_calorie_goal || profile?.target_calories || 2000;
  const weeklyGoal = profile?.weekly_activity_goal || 150;
  const totalWeeklyMinutes = weeklyData.reduce((s, d) => s + (d.active || d.workouts * 10), 0);
  const stepGoalPct = Math.min((todayStats.steps / stepGoal) * 100, 100);
  const calorieGoalPct = Math.min((todayStats.consumed / calorieGoal) * 100, 100);
  const weeklyGoalPct = Math.min((totalWeeklyMinutes / weeklyGoal) * 100, 100);
  const stepGoalsMet = weeklyData.filter((d) => d.steps >= stepGoal).length;
  const overallPct = Math.round((stepGoalPct + calorieGoalPct + weeklyGoalPct) / 3);
  const weightChartData = [...weights].reverse().map((e) => ({ date: formatDate(e.entry_date), weight: e.weight_kg }));

  return (
    <div className="px-5 space-y-4">
      {/* Streak + Overall completion */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-[#E89AA4] to-[#C87883] p-4 text-white shadow-md shadow-rose-300/50">
          <div className="flex items-center gap-1.5 mb-1"><Zap size={16} /><span className="text-xs font-medium opacity-90">Current Streak</span></div>
          <p className="text-2xl font-bold font-heading">{streak} <span className="text-xs font-normal opacity-90">days</span></p>
        </div>
        <div className="rounded-2xl bg-white border border-[#F0D5D5] shadow-sm shadow-rose-200/50 p-4">
          <div className="flex items-center gap-1.5 mb-1"><Target size={16} className="text-[#C87883]" /><span className="text-xs font-medium text-[#8A6A6A]">Goal Completion</span></div>
          <p className="text-2xl font-bold text-[#2D1E1E] font-heading">{overallPct}<span className="text-xs font-normal text-[#B59A9A]">%</span></p>
        </div>
      </div>

      {/* Today's Goals */}
      <div className="rounded-3xl bg-white border border-[#F0D5D5] shadow-sm shadow-rose-200/50 p-5">
        <h3 className="text-sm font-bold text-[#2D1E1E] mb-3 font-heading">Today's Goals</h3>
        <div className="space-y-3">
          <GoalBar icon={Footprints} label="Steps" value={todayStats.steps.toLocaleString()} goal={stepGoal.toLocaleString()} pct={stepGoalPct} color="#C87883" />
          <GoalBar icon={Flame} label="Calories Eaten" value={`${todayStats.consumed}`} goal={`${calorieGoal}`} pct={calorieGoalPct} color="#E8697C" />
          <GoalBar icon={Dumbbell} label="Weekly Activity" value={`${totalWeeklyMinutes} min`} goal={`${weeklyGoal} min`} pct={weeklyGoalPct} color="#A85A66" />
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard icon={Footprints} label="Week Steps" value={weeklyData.reduce((s, d) => s + d.steps, 0).toLocaleString()} color="text-[#C87883]" />
        <SummaryCard icon={Flame} label="Week Burned" value={weeklyData.reduce((s, d) => s + d.burned, 0)} color="text-[#A85A66]" />
        <SummaryCard icon={Award} label="Goal Days" value={`${stepGoalsMet}/7`} color="text-[#D98C9C]" />
      </div>

      {/* Weight Progress Chart */}
      {weightChartData.length > 1 && (
        <div className="rounded-3xl bg-white border border-[#F0D5D5] shadow-sm shadow-rose-200/50 p-5">
          <h3 className="text-sm font-bold text-[#2D1E1E] mb-3 flex items-center gap-2 font-heading"><TrendingUp size={15} className="text-[#C87883]" /> Weight Progress</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0D5D5" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#B59A9A' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 9, fill: '#B59A9A' }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F0D5D5', fontSize: 12 }} />
                <Line type="monotone" dataKey="weight" stroke="#C87883" strokeWidth={2.5} dot={{ r: 3, fill: '#C87883' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Calories Chart */}
      <div className="rounded-3xl bg-white border border-[#F0D5D5] shadow-sm shadow-rose-200/50 p-5">
        <h3 className="text-sm font-bold text-[#2D1E1E] mb-3 flex items-center gap-2 font-heading"><Flame size={15} className="text-[#C87883]" /> Calories: Consumed vs Burned</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0D5D5" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#B59A9A' }} />
              <YAxis tick={{ fontSize: 9, fill: '#B59A9A' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F0D5D5', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="consumed" fill="#C87883" radius={[4, 4, 0, 0]} />
              <Bar dataKey="burned" fill="#E89AA4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Steps Chart */}
      <div className="rounded-3xl bg-white border border-[#F0D5D5] shadow-sm shadow-rose-200/50 p-5">
        <h3 className="text-sm font-bold text-[#2D1E1E] mb-3 flex items-center gap-2 font-heading"><Footprints size={15} className="text-[#C87883]" /> Daily Steps (7 days)</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0D5D5" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#B59A9A' }} />
              <YAxis tick={{ fontSize: 9, fill: '#B59A9A' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F0D5D5', fontSize: 12 }} />
              <Bar dataKey="steps" fill="#E89AA4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Reports */}
      <div className="rounded-3xl bg-white border border-[#F0D5D5] shadow-sm shadow-rose-200/50 p-5">
        <h3 className="text-sm font-bold text-[#2D1E1E] mb-3 flex items-center gap-2 font-heading"><Sparkles size={15} className="text-[#C87883]" /> AI Progress Reports</h3>
        {aiReport ? (
          <div>
            <div className="rounded-2xl bg-[#F9E8E8] border border-[#F0D5D5] p-4 mb-3">
              <p className="text-[10px] font-semibold text-[#C87883] uppercase mb-1">{reportType === 'monthly' ? 'Monthly' : 'Weekly'} Report</p>
              <p className="text-sm text-[#2D1E1E] whitespace-pre-wrap leading-relaxed">{aiReport}</p>
            </div>
            <button onClick={() => { setAiReport(null); }} className="w-full rounded-full border border-[#F0D5D5] text-[#8A6A6A] py-2.5 font-medium text-xs">Generate Another Report</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => generateReport('weekly')} disabled={reportLoading} className="rounded-full bg-gradient-to-r from-[#E89AA4] to-[#C87883] text-white py-3 font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-rose-300/50">
              {reportLoading && reportType === 'weekly' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Weekly Report
            </button>
            <button onClick={() => generateReport('monthly')} disabled={reportLoading} className="rounded-full bg-[#A85A66] text-white py-3 font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-50">
              {reportLoading && reportType === 'monthly' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Monthly Report
            </button>
          </div>
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
          <span className="text-xs text-[#8A6A6A] font-medium">{label}</span>
        </div>
        <span className="text-xs text-[#B59A9A]">{value} / {goal}</span>
      </div>
      <div className="w-full h-2 rounded-full bg-[#F5E0E0] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl bg-white border border-[#F0D5D5] shadow-sm shadow-rose-200/50 p-3 text-center">
      <Icon size={16} className={`${color} mx-auto mb-1`} />
      <p className="text-sm font-bold text-[#2D1E1E]">{value}</p>
      <p className="text-[9px] text-[#8A6A6A]">{label}</p>
    </div>
  );
}