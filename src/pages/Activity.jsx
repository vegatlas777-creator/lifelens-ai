import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Activity as ActivityIcon, Footprints, MapPin, Timer, Flame, Watch, Smartphone, TrendingUp, Target } from 'lucide-react';
import PageHeader, { Disclaimer } from '@/components/PageHeader';
import { getTodayStr, getLast7Days } from '@/lib/dateUtils';

const STEP_GOAL = 10000;

export default function Activity() {
  const [todayLog, setTodayLog] = useState(null);
  const [weeklySteps, setWeeklySteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState({ apple: false, google: false, phone: true });

  useEffect(() => {
    loadData();
    // Simulate step counter for phone
    const stepTimer = setInterval(() => {
      simulateSteps();
    }, 10000);
    return () => clearInterval(stepTimer);
  }, []);

  async function loadData() {
    try {
      const today = getTodayStr();
      let logs = await base44.entities.ActivityLog.filter({ log_date: today });
      
      if (logs.length === 0) {
        // Create initial log for today
        const created = await base44.entities.ActivityLog.create({
          log_date: today,
          steps: 0,
          walking_distance_km: 0,
          running_distance_km: 0,
          active_minutes: 0,
          calories_burned_activity: 0,
        });
        setTodayLog(created);
      } else {
        setTodayLog(logs[0]);
      }

      // Weekly steps
      const days = getLast7Days();
      const weekly = await Promise.all(
        days.map(async (d) => {
          const dayLogs = await base44.entities.ActivityLog.filter({ log_date: d.date });
          const steps = dayLogs.reduce((s, l) => s + (l.steps || 0), 0);
          return { ...d, steps };
        })
      );
      setWeeklySteps(weekly);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function simulateSteps() {
    if (!todayLog) return;
    const newSteps = (todayLog.steps || 0) + Math.floor(Math.random() * 50) + 10;
    const walkKm = +(newSteps * 0.0007).toFixed(2);
    const activeMin = Math.floor(newSteps / 100);
    const burned = Math.round(newSteps * 0.04);
    
    const updated = await base44.entities.ActivityLog.update(todayLog.id, {
      steps: newSteps,
      walking_distance_km: walkKm,
      active_minutes: activeMin,
      calories_burned_activity: burned,
    });
    setTodayLog(updated);
  }

  async function connectService(service) {
    setConnected({ ...connected, [service]: !connected[service] });
  }

  async function addActivity(type, minutes) {
    if (!todayLog) return;
    let updates = { ...todayLog };
    if (type === 'walking') {
      const steps = minutes * 110;
      updates.steps = (todayLog.steps || 0) + steps;
      updates.walking_distance_km = +(updates.steps * 0.0007).toFixed(2);
      updates.active_minutes = (todayLog.active_minutes || 0) + minutes;
      updates.calories_burned_activity = (todayLog.calories_burned_activity || 0) + Math.round(steps * 0.04);
    } else if (type === 'running') {
      const km = minutes * 0.16;
      updates.running_distance_km = +(todayLog.running_distance_km || 0) + km;
      updates.active_minutes = (todayLog.active_minutes || 0) + minutes;
      updates.calories_burned_activity = (todayLog.calories_burned_activity || 0) + Math.round(minutes * 10);
    }
    const updated = await base44.entities.ActivityLog.update(todayLog.id, updates);
    setTodayLog(updated);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const steps = todayLog?.steps || 0;
  const stepProgress = Math.min((steps / STEP_GOAL) * 100, 100);
  const avgSteps = weeklySteps.length ? Math.round(weeklySteps.reduce((s, d) => s + d.steps, 0) / weeklySteps.length) : 0;
  const stepsBelowAvg = avgSteps - steps;

  return (
    <div className="pb-4">
      <PageHeader title="Activity Tracking" subtitle="Steps, distance & active minutes" icon={ActivityIcon} />

      <div className="px-5 mt-2">
        {/* Connections */}
        <div className="rounded-2xl bg-card border border-border p-4 mb-4">
          <p className="text-xs font-medium text-muted-foreground mb-3">CONNECTED DEVICES</p>
          <div className="space-y-2">
            <ConnectRow icon={Watch} name="Apple Health" connected={connected.apple} onToggle={() => connectService('apple')} />
            <ConnectRow icon={Smartphone} name="Google Health Connect" connected={connected.google} onToggle={() => connectService('google')} />
            <ConnectRow icon={Footprints} name="Phone Step Counter" connected={connected.phone} onToggle={() => connectService('phone')} />
          </div>
        </div>

        {/* Steps ring */}
        <div className="rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80 font-medium">Today's Steps</p>
              <p className="text-4xl font-bold mt-1">{steps.toLocaleString()}</p>
              <p className="text-xs opacity-70 mt-1">of {STEP_GOAL.toLocaleString()} goal</p>
            </div>
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="opacity-20" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - stepProgress / 100)}`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Footprints size={28} />
              </div>
            </div>
          </div>
          {stepsBelowAvg > 0 && (
            <div className="mt-4 pt-4 border-t border-white/20 rounded-2xl">
              <p className="text-xs opacity-90">📊 You are {stepsBelowAvg.toLocaleString()} steps below your average daily target.</p>
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <StatBox icon={MapPin} value={`${(todayLog?.walking_distance_km || 0).toFixed(2)}`} label="Walked (km)" color="text-blue-500" />
          <StatBox icon={MapPin} value={`${(todayLog?.running_distance_km || 0).toFixed(2)}`} label="Run (km)" color="text-rose-500" />
          <StatBox icon={Timer} value={todayLog?.active_minutes || 0} label="Active min" color="text-amber-500" />
          <StatBox icon={Flame} value={todayLog?.calories_burned_activity || 0} label="Burned" color="text-orange-500" />
        </div>

        {/* Quick log */}
        <div className="mt-5">
          <h3 className="text-sm font-semibold mb-3">Quick Log Activity</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => addActivity('walking', 20)} className="rounded-2xl bg-card border border-border p-4 hover:border-primary/40 transition-colors">
              <Footprints size={20} className="text-blue-500 mb-1" />
              <p className="text-sm font-semibold">20-min Walk</p>
              <p className="text-xs text-muted-foreground">~{Math.round(20 * 110 * 0.04)} kcal</p>
            </button>
            <button onClick={() => addActivity('running', 20)} className="rounded-2xl bg-card border border-border p-4 hover:border-primary/40 transition-colors">
              <ActivityIcon size={20} className="text-rose-500 mb-1" />
              <p className="text-sm font-semibold">20-min Run</p>
              <p className="text-xs text-muted-foreground">~200 kcal</p>
            </button>
          </div>
        </div>

        {/* Weekly chart */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" /> Weekly Steps
          </h3>
          <div className="rounded-2xl bg-card border border-border p-4">
            <div className="flex items-end justify-between gap-2 h-32">
              {weeklySteps.map((d) => {
                const maxSteps = Math.max(...weeklySteps.map((w) => w.steps), STEP_GOAL, 1);
                const heightPct = (d.steps / maxSteps) * 100;
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
            <div className="mt-3 pt-3 border-t border-border flex justify-between text-xs">
              <span className="text-muted-foreground">Daily avg: <strong className="text-foreground">{avgSteps.toLocaleString()}</strong></span>
              <span className="text-muted-foreground">Goal: <strong className="text-foreground">{STEP_GOAL.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>

        {/* AI recommendation */}
        <div className="mt-5 rounded-2xl bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-300/50 dark:border-amber-800/30 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-600">
              <Target size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold">AI Recommendation</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stepsBelowAvg > 0
                  ? `A 20-minute walk today could burn approximately ${Math.round(20 * 110 * 0.04)} calories and add ~2,200 steps to close your gap.`
                  : `Great job! You've exceeded your daily average. Keep up the momentum! 💪`}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Disclaimer text="⚠️ Activity and calorie estimates are approximations based on step count and standard MET values. Not medical advice." />
        </div>
      </div>
    </div>
  );
}

function ConnectRow({ icon: Icon, name, connected, onToggle }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-muted"><Icon size={18} /></div>
        <span className="text-sm font-medium">{name}</span>
      </div>
      <button onClick={onToggle} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${connected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
        {connected ? 'Connected' : 'Connect'}
      </button>
    </div>
  );
}

function StatBox({ icon: Icon, value, label, color }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-3 text-center">
      <Icon size={18} className={`${color} mx-auto mb-1`} />
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}