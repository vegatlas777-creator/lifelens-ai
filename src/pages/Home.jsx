import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Flame, Dumbbell, Apple, TrendingUp, Sparkles, ChevronRight, Crown, Footprints, Activity as ActivityIcon, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTodayStr, getLast7Days } from '@/lib/dateUtils';
import { getSubscriptionStatus } from '@/lib/subscription';

export default function Home() {
  const [todayCalories, setTodayCalories] = useState(0);
  const [todayProtein, setTodayProtein] = useState(0);
  const [todayCarbs, setTodayCarbs] = useState(0);
  const [todayFats, setTodayFats] = useState(0);
  const [todayFiber, setTodayFiber] = useState(0);
  const [todayBurned, setTodayBurned] = useState(0);
  const [todaySteps, setTodaySteps] = useState(0);
  const [activityBurned, setActivityBurned] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [profile, setProfile] = useState(null);
  const [subStatus, setSubStatus] = useState({ isPremium: false, loading: true });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const me = await base44.auth.me();
      setUser(me);
      const today = getTodayStr();

      const [foodEntries, workouts, metabo, activityLogs, sub] = await Promise.all([
        base44.entities.FoodEntry.filter({ entry_date: today }),
        base44.entities.WorkoutLog.filter({ completed_date: today }),
        base44.entities.MetabolicProfile.list('-created_date', 1),
        base44.entities.ActivityLog.filter({ log_date: today }),
        getSubscriptionStatus(),
      ]);

      setTodayCalories(foodEntries.reduce((s, e) => s + (e.calories || 0), 0));
      setTodayProtein(foodEntries.reduce((s, e) => s + (e.protein || 0), 0));
      setTodayCarbs(foodEntries.reduce((s, e) => s + (e.carbs || 0), 0));
      setTodayFats(foodEntries.reduce((s, e) => s + (e.fats || 0), 0));
      setTodayFiber(foodEntries.reduce((s, e) => s + (e.fiber || 0), 0));
      setTodayBurned(workouts.reduce((s, w) => s + (w.calories_burned || 0), 0));
      setTodaySteps(activityLogs.reduce((s, l) => s + (l.steps || 0), 0));
      setActivityBurned(activityLogs.reduce((s, l) => s + (l.calories_burned_activity || 0), 0));
      if (metabo.length) setProfile(metabo[0]);
      setSubStatus(sub);

      const days = getLast7Days();
      const weekly = await Promise.all(
        days.map(async (d) => {
          const entries = await base44.entities.FoodEntry.filter({ entry_date: d.date });
          return { ...d, calories: entries.reduce((s, e) => s + (e.calories || 0), 0) };
        })
      );
      setWeeklyData(weekly);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const targetCalories = profile?.target_calories || 2000;
  const calorieProgress = Math.min((todayCalories / targetCalories) * 100, 100);
  const totalBurned = todayBurned + activityBurned;
  const netCalories = todayCalories - totalBurned;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="pb-4">
      {/* Header with branding */}
      <div className="px-5 pt-12 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-primary tracking-wide uppercase">3 in 1 Healthy Choice</p>
            <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          {!subStatus.isPremium && (
            <Link to="/pricing" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold shadow-md">
              <Crown size={14} /> Go Premium
            </Link>
          )}
        </div>
        <h1 className="text-2xl font-bold tracking-tight font-heading mt-2">
          Hello, {firstName} 👋
        </h1>
      </div>

      {/* Calorie Ring */}
      <div className="px-5 mt-3">
        <div className="rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 text-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 font-medium">Today's Calories</p>
              <p className="text-4xl font-bold tracking-tight mt-1">{todayCalories}</p>
              <p className="text-xs opacity-80 mt-1">of {targetCalories} target</p>
            </div>
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="opacity-20" />
                <circle
                  cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - calorieProgress / 100)}`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Flame size={28} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-xs opacity-80">Burned</p>
              <p className="font-semibold">{totalBurned} kcal</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <p className="text-xs opacity-80">Net</p>
              <p className="font-semibold">{netCalories} kcal</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <p className="text-xs opacity-80">Steps</p>
              <p className="font-semibold">{todaySteps.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Macros */}
      <div className="px-5 mt-4 grid grid-cols-4 gap-2">
        {[
          { label: 'Protein', value: todayProtein, color: 'bg-blue-500' },
          { label: 'Carbs', value: todayCarbs, color: 'bg-amber-500' },
          { label: 'Fats', value: todayFats, color: 'bg-rose-500' },
          { label: 'Fiber', value: todayFiber, color: 'bg-emerald-500' },
        ].map((m) => (
          <div key={m.label} className="rounded-2xl bg-card border border-border p-3 text-center">
            <div className={`w-2 h-2 rounded-full ${m.color} mx-auto mb-1.5`} />
            <p className="text-lg font-bold">{Math.round(m.value)}</p>
            <p className="text-[10px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      {/* AI Personalized Recommendation */}
      <div className="px-5 mt-4">
        <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-900/30 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-600 flex-shrink-0">
              <Target size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold">Today's AI Tip</p>
              <p className="text-xs text-muted-foreground mt-1">
                {todaySteps < 5000
                  ? `A 20-minute walk today could burn approximately ${Math.round(20 * 110 * 0.04)} calories. You're at ${todaySteps.toLocaleString()} steps — let's get moving! 🚶`
                  : todayCalories > targetCalories
                  ? `You're ${todayCalories - targetCalories} kcal over target. A 10-minute dance session could burn ~80 calories to balance it out! 💃`
                  : `Great progress! You're on track with your daily goals. Keep the momentum going! 🔥`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" /> Weekly Trend
          </h2>
        </div>
        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="flex items-end justify-between gap-2 h-32">
            {weeklyData.map((d) => {
              const maxCal = Math.max(...weeklyData.map((w) => w.calories), targetCalories, 1);
              const heightPct = (d.calories / maxCal) * 100;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex items-end justify-center h-full">
                    <div className="w-6 rounded-t-lg bg-gradient-to-t from-orange-500 to-amber-400 transition-all duration-500" style={{ height: `${Math.max(heightPct, 4)}%` }} />
                  </div>
                  <span className="text-[9px] text-muted-foreground">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 mt-5">
        <h2 className="text-base font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickAction to="/calories" icon={Apple} label="Log Meal" desc="Track food" />
          <QuickAction to="/fitness" icon={Dumbbell} label="Workout" desc="Burn calories" />
          <QuickAction to="/activity" icon={Footprints} label="Activity" desc="Steps & distance" />
          <QuickAction to="/coach" icon={Sparkles} label="AI Coach" desc="Ask anything" />
        </div>
      </div>

      {/* Premium upsell */}
      {!subStatus.isPremium && (
        <div className="px-5 mt-5">
          <Link to="/pricing" className="block rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-5 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur">
                <Crown size={24} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-base">Unlock Premium</p>
                <p className="text-xs opacity-90">Personalized plans, daily AI coaching & advanced insights. 7-day free trial.</p>
              </div>
              <ChevronRight size={20} />
            </div>
          </Link>
        </div>
      )}

      <div className="px-5 mt-5">
        <p className="text-[11px] text-muted-foreground/80 text-center leading-relaxed">
          ⚠️ Calorie and nutrition estimates are approximations and not medical advice. Consult a healthcare professional for personalized guidance.
        </p>
      </div>
    </div>
  );
}

function QuickAction({ to, icon: Icon, label, desc }) {
  return (
    <Link to={to} className="rounded-2xl bg-card border border-border p-4 flex flex-col gap-2 hover:border-primary/40 transition-colors group">
      <div className="p-2 rounded-xl bg-primary/10 text-primary w-fit">
        <Icon size={18} />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">{label}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
        <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </Link>
  );
}