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

  if (loading) return <div className="flex justify-center py-8"><Loader2 size={28} className="text-[#FF149C] animate-spin" /></div>;
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
        <div className="rounded-2xl bg-gradient-to-br from-[#FF69B4] to-[#FF149C] p-4 text-white shadow-md shadow-pink-300/50">
          <div className="flex items-center gap-1.5 mb-1"><Zap size={16} /><span className="text-xs font-medium opacity-90">Current Streak</span></div>
          <p className="text-2xl font-bold font-heading">{streak} <span className="text-xs font-normal opacity-90">days</span></p>
        </div>
        <div className="rounded-2xl bg-white border border-[#FFC0D6] shadow-sm shadow-pink-200/60 p-4">
          <div className="flex items-center gap-1.5 mb-1"><Target size={16} className="text-[#FF149C]" /><span className="text-xs font-medium text-[#B0407A]">Goal Completion</span></div>
          <p className="text-2xl font-bold text-[#4A0E2E] font-heading">{overallPct}<span className="text-xs font-normal text-[#D67A9E]">%</span></p>
        </div>
      </div>

      {/* Today's Goals */}
      <div className="rounded-3xl bg-white border border-[#FFC0D6] shadow-sm shadow-pink-200/60 p-5">
        <h3 className="text-sm font-bold text-[#4A0E2E] mb-3 font-heading">Today's Goals</h3>
        <div className="space-y-3">
          <GoalBar icon={Footprints} label="Steps" value={todayStats.steps.toLocaleString()} goal={stepGoal.toLocaleString()} pct={stepGoalPct} color="#FF149C" />
          <GoalBar icon={Flame} label="Calories Eaten" value={`${todayStats.consumed}`} goal={`${calorieGoal}`} pct={calorieGoalPct} color="#E91E63" />
          <GoalBar icon={Dumbbell} label="Weekly Activity" value={`${totalWeeklyMinutes} min`} goal={`${weeklyGoal} min`} pct={weeklyGoalPct} color="#C2185B" />
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard icon={Footprints} label="Week Steps" value={weeklyData.reduce((s, d) => s + d.steps, 0).toLocaleString()} color="text-[#FF149C]" />
        <SummaryCard icon={Flame} label="Week Burned" value={weeklyData.reduce((s, d) => s + d.burned, 0)} color="text-[#E91E63]" />
        <SummaryCard icon={Award} label="Goal Days" value={`${stepGoalsMet}/7`} color="text-[#FF69B4]" />
      </div>

      {/* Weight Progress Chart */}
      {weightChartData.length > 1 && (
        <div className="rounded-3xl bg-white border border-[#FFC0D6] shadow-sm shadow-pink-200/60 p-5">
          <h3 className="text-sm font-bold text-[#4A0E2E] mb-3 flex items-center gap-2 font-heading"><TrendingUp size={15} className="text-[#FF149C]" /> Weight Progress</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFC0D6" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#D67A9E' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 9, fill: '#D67A9E' }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #FFC0D6', fontSize: 12 }} />
                <Line type="monotone" dataKey="weight" stroke="#FF149C" strokeWidth={2.5} dot={{ r: 3, fill: '#FF149C' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Calories Chart */}
      <div className="rounded-3xl bg-white border border-[#FFC0D6] shadow-sm shadow-pink-200/60 p-5">
        <h3 className="text-sm font-bold text-[#4A0E2E] mb-3 flex items-center gap-2 font-heading"><Flame size={15} className="text-[#FF149C]" /> Calories: Consumed vs Burned</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#FFC0D6" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#D67A9E' }} />
              <YAxis tick={{ fontSize: 9, fill: '#D67A9E' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #FFC0D6', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="consumed" fill="#FF149C" radius={[4, 4, 0, 0]} />
              <Bar dataKey="burned" fill="#FF69B4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Steps Chart */}
      <div className="rounded-3xl bg-white border border-[#FFC0D6] shadow-sm shadow-pink-200/60 p-5">
        <h3 className="text-sm font-bold text-[#4A0E2E] mb-3 flex items-center gap-2 font-heading"><Footprints size={15} className="text-[#FF149C]" /> Daily Steps (7 days)</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#FFC0D6" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#D67A9E' }} />
              <YAxis tick={{ fontSize: 9, fill: '#D67A9E' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #FFC0D6', fontSize: 12 }} />
              <Bar dataKey="steps" fill="#FF69B4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Reports */}
      <div className="rounded-3xl bg-white border border-[#FFC0D6] shadow-sm shadow-pink-200/60 p-5">
        <h3 className="text-sm font-bold text-[#4A0E2E] mb-3 flex items-center gap-2 font-heading"><Sparkles size={15} className="text-[#FF149C]" /> AI Progress Reports</h3>
        {aiReport ? (
          <div>
            <div className="rounded-2xl bg-[#FFD9E6] border border-[#FFC0D6] p-4 mb-3">
              <p className="text-[10px] font-semibold text-[#FF149C] uppercase mb-1">{reportType === 'monthly' ? 'Monthly' : 'Weekly'} Report</p>
              <p className="text-sm text-[#4A0E2E] whitespace-pre-wrap leading-relaxed">{aiReport}</p>
            </div>
            <button onClick={() => { setAiReport(null); }} className="w-full rounded-full border border-[#FFC0D6] text-[#B0407A] py-2.5 font-medium text-xs">Generate Another Report</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => generateReport('weekly')} disabled={reportLoading} className="rounded-full bg-gradient-to-r from-[#FF69B4] to-[#FF149C] text-white py-3 font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-pink-300/50">
              {reportLoading && reportType === 'weekly' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Weekly Report
            </button>
            <button onClick={() => generateReport('monthly')} disabled={reportLoading} className="rounded-full bg-[#C2185B] text-white py-3 font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-50">
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
          <span className="text-xs text-[#B0407A] font-medium">{label}</span>
        </div>
        <span className="text-xs text-[#D67A9E]">{value} / {goal}</span>
      </div>
      <div className="w-full h-2 rounded-full bg-[#FFD9E6] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl bg-white border border-[#FFC0D6] shadow-sm shadow-pink-200/60 p-3 text-center">
      <Icon size={16} className={`${color} mx-auto mb-1`} />
      <p className="text-sm font-bold text-[#4A0E2E]">{value}</p>
      <p className="text-[9px] text-[#B0407A]">{label}</p>
    </div>
  );
}