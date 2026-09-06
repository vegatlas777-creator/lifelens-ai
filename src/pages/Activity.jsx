import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Activity as ActivityIcon, Footprints, MapPin, Timer, Flame, Watch, Smartphone, TrendingUp, Target, ArrowRight } from 'lucide-react';
import { getTodayStr, getLast7Days } from '@/lib/dateUtils';

const STEP_GOAL = 10000;

export default function Activity() {
  const [todayLog, setTodayLog] = useState(null);
  const [weeklySteps, setWeeklySteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState({ apple: false, google: false, phone: true });

  useEffect(() => {
    loadData();
    const stepTimer = setInterval(() => { simulateSteps(); }, 10000);
    return () => clearInterval(stepTimer);
  }, []);

  async function loadData() {
    try {
      const today = getTodayStr();
      let logs = await base44.entities.ActivityLog.filter({ log_date: today });
      if (logs.length === 0) {
        const created = await base44.entities.ActivityLog.create({
          log_date: today, steps: 0, walking_distance_km: 0, running_distance_km: 0, active_minutes: 0, calories_burned_activity: 0,
        });
        setTodayLog(created);
      } else {
        setTodayLog(logs[0]);
      }
      const days = getLast7Days();
      const weekly = await Promise.all(
        days.map(async (d) => {
          const dayLogs = await base44.entities.ActivityLog.filter({ log_date: d.date });
          const steps = dayLogs.reduce((s, l) => s + (l.steps || 0), 0);
          return { ...d, steps };
        })
      );
      setWeeklySteps(weekly);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function simulateSteps() {
    if (!todayLog) return;
    const newSteps = (todayLog.steps || 0) + Math.floor(Math.random() * 50) + 10;
    const walkKm = +(newSteps * 0.0007).toFixed(2);
    const activeMin = Math.floor(newSteps / 100);
    const burned = Math.round(newSteps * 0.04);
    const updated = await base44.entities.ActivityLog.update(todayLog.id, {
      steps: newSteps, walking_distance_km: walkKm, active_minutes: activeMin, calories_burned_activity: burned,
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
      <div className="flex items-center justify-center min-h-screen bg-[#F0F9FF]">
        <div className="w-8 h-8 border-4 border-[#E0F2FE] border-t-[#2563EB] rounded-full animate-spin" />
      </div>
    );
  }

  const steps = todayLog?.steps || 0;
  const stepProgress = Math.min((steps / STEP_GOAL) * 100, 100);
  const avgSteps = weeklySteps.length ? Math.round(weeklySteps.reduce((s, d) => s + d.steps, 0) / weeklySteps.length) : 0;
  const stepsBelowAvg = avgSteps - steps;

  return (
    <div className="min-h-screen bg-[#F0F9FF] pb-4">
      <div className="px-5 pt-12 pb-3">
        <h1 className="text-2xl font-bold text-[#0F172A]">Activity Tracking</h1>
        <p className="text-sm text-[#64748B]">Steps, distance & active minutes</p>
      </div>

      <div className="px-5 mt-2">
        {/* Connections */}
        <div className="rounded-2xl bg-white border border-[#DBEAFE] p-4 mb-4">
          <p className="text-xs font-medium text-[#64748B] mb-3">CONNECTED DEVICES</p>
          <div className="space-y-2">
            <ConnectRow icon={Watch} name="Apple Health" connected={connected.apple} onToggle={() => connectService('apple')} />
            <ConnectRow icon={Smartphone} name="Google Health Connect" connected={connected.google} onToggle={() => connectService('google')} />
            <ConnectRow icon={Footprints} name="Phone Step Counter" connected={connected.phone} onToggle={() => connectService('phone')} />
          </div>
        </div>

        {/* Steps ring */}
        <div className="relative overflow-hidden rounded-3xl">
          <img src="https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/85 to-[#0F172A]/40" />
          <div className="relative p-6 text-white">
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
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-xs opacity-90">📊 You are {stepsBelowAvg.toLocaleString()} steps below your daily average.</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <StatBox icon={MapPin} value={`${(todayLog?.walking_distance_km || 0).toFixed(2)}`} label="Walked (km)" color="text-blue-500" />
          <StatBox icon={MapPin} value={`${(todayLog?.running_distance_km || 0).toFixed(2)}`} label="Run (km)" color="text-rose-500" />
          <StatBox icon={Timer} value={todayLog?.active_minutes || 0} label="Active min" color="text-blue-500" />
          <StatBox icon={Flame} value={todayLog?.calories_burned_activity || 0} label="Burned" color="text-blue-500" />
        </div>

        {/* Quick log */}
        <div className="mt-5">
          <h3 className="text-sm font-semibold mb-3 text-[#0F172A]">Quick Log Activity</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => addActivity('walking', 20)} className="rounded-2xl bg-white border border-[#DBEAFE] p-4 hover:border-[#2563EB] transition-colors text-left">
              <Footprints size={20} className="text-blue-500 mb-1" />
              <p className="text-sm font-semibold text-[#0F172A]">20-min Walk</p>
              <p className="text-xs text-[#64748B]">~{Math.round(20 * 110 * 0.04)} kcal</p>
            </button>
            <button onClick={() => addActivity('running', 20)} className="rounded-2xl bg-white border border-[#DBEAFE] p-4 hover:border-[#2563EB] transition-colors text-left">
              <ActivityIcon size={20} className="text-rose-500 mb-1" />
              <p className="text-sm font-semibold text-[#0F172A]">20-min Run</p>
              <p className="text-xs text-[#64748B]">~200 kcal</p>
            </button>
          </div>
        </div>

        {/* Weekly chart */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-[#0F172A]">
            <TrendingUp size={16} className="text-[#2563EB]" /> Weekly Steps
          </h3>
          <div className="rounded-2xl bg-white border border-[#DBEAFE] p-4">
            <div className="flex items-end justify-between gap-2 h-32">
              {weeklySteps.map((d) => {
                const maxSteps = Math.max(...weeklySteps.map((w) => w.steps), STEP_GOAL, 1);
                const heightPct = (d.steps / maxSteps) * 100;
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full flex items-end justify-center h-full">
                      <div className="w-6 rounded-t-lg bg-gradient-to-t from-[#2563EB] to-[#BFDBFE] transition-all duration-500" style={{ height: `${Math.max(heightPct, 4)}%` }} />
                    </div>
                    <span className="text-[9px] text-[#64748B]">{d.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-[#DBEAFE] flex justify-between text-xs">
              <span className="text-[#64748B]">Daily avg: <strong className="text-[#0F172A]">{avgSteps.toLocaleString()}</strong></span>
              <span className="text-[#64748B]">Goal: <strong className="text-[#0F172A]">{STEP_GOAL.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>

        {/* AI recommendation */}
        <div className="mt-5 rounded-2xl bg-[#E0F2FE]/40 border border-[#E0F2FE] p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#2563EB]/20 text-[#2563EB]">
              <Target size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">AI Recommendation</p>
              <p className="text-xs text-[#64748B] mt-1">
                {stepsBelowAvg > 0
                  ? `A 20-minute walk today could burn approximately ${Math.round(20 * 110 * 0.04)} calories and add ~2,200 steps to close your gap.`
                  : `Great job! You've exceeded your daily average. Keep up the momentum! 💪`}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-[11px] text-[#94A3B8] text-center leading-relaxed">
            ⚠️ Activity and calorie estimates are approximations. Not medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}

function ConnectRow({ icon: Icon, name, connected, onToggle }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-[#E0F2FE]"><Icon size={18} className="text-[#1D4ED8]" /></div>
        <span className="text-sm font-medium text-[#0F172A]">{name}</span>
      </div>
      <button onClick={onToggle} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${connected ? 'bg-[#2563EB] text-white' : 'bg-[#EFF6FF] text-[#64748B]'}`}>
        {connected ? 'Connected' : 'Connect'}
      </button>
    </div>
  );
}

function StatBox({ icon: Icon, value, label, color }) {
  return (
    <div className="rounded-2xl bg-white border border-[#DBEAFE] p-3 text-center">
      <Icon size={18} className={`${color} mx-auto mb-1`} />
      <p className="text-lg font-bold text-[#0F172A]">{value}</p>
      <p className="text-[10px] text-[#64748B]">{label}</p>
    </div>
  );
}