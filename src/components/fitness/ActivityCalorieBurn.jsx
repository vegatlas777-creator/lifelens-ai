import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Footprints, Activity, Bike, Mountain, Waves, Music, PersonStanding, Dumbbell, Leaf, Loader2, Calculator, ArrowRight, Clock } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const activities = [
  { name: 'Walking', icon: Footprints, color: 'text-blue-500', bg: 'bg-blue-50' },
  { name: 'Running', icon: Activity, color: 'text-rose-500', bg: 'bg-rose-50' },
  { name: 'Cycling', icon: Bike, color: 'text-cyan-500', bg: 'bg-cyan-50' },
  { name: 'Hiking', icon: Mountain, color: 'text-teal-500', bg: 'bg-teal-50' },
  { name: 'Swimming', icon: Waves, color: 'text-sky-500', bg: 'bg-sky-50' },
  { name: 'Dancing', icon: Music, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { name: 'Hip Hop', icon: Music, color: 'text-violet-500', bg: 'bg-violet-50' },
  { name: 'Latin Dance', icon: Music, color: 'text-fuchsia-500', bg: 'bg-fuchsia-50' },
  { name: 'Street Dance', icon: Music, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { name: 'Ballet', icon: PersonStanding, color: 'text-pink-500', bg: 'bg-pink-50' },
  { name: 'Aerobic Dance', icon: Music, color: 'text-teal-500', bg: 'bg-teal-50' },
  { name: 'Strength Training', icon: Dumbbell, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'Yoga', icon: Leaf, color: 'text-cyan-500', bg: 'bg-cyan-50' },
];

const intensityLevels = [
  { value: 'light', label: 'Light', desc: 'Casual, relaxed pace' },
  { value: 'moderate', label: 'Moderate', desc: 'Steady, breathing harder' },
  { value: 'vigorous', label: 'Vigorous', desc: 'Fast-paced, sweating' },
  { value: 'high', label: 'High Intensity', desc: 'Maximum effort' },
];

const inputCls = "w-full rounded-xl bg-[#0A1628] border border-[#1E293B] px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB] text-[#FFFFFF]";

export default function ActivityCalorieBurn() {
  const [form, setForm] = useState({ age: '', weight: '', height: '', gender: 'male', intensity: 'moderate' });
  const { guard } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const activityMap = Object.fromEntries(activities.map((a) => [a.name, a]));

  async function calculate() {
    const { age, weight, height, gender, intensity } = form;
    if (!guard()) return;
    if (!age || !weight || !height) {
      setError('Please fill in all fields to get personalized estimates.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const response = await base44.functions.invoke('estimate-calorie-burn', { age, weight, height, gender, intensity });
      setResults(response.data.activities);
    } catch (e) {
      setError('Could not generate estimates. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-5">
      {/* Profile Form */}
      <div className="rounded-3xl bg-white/5 border border-[#1E293B] p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-[#C7D2FE] mb-1.5 block">Age</label>
            <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="30" className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-medium text-[#C7D2FE] mb-1.5 block">Gender</label>
            <div className="flex gap-2">
              {['male', 'female'].map((g) => (
                <button key={g} onClick={() => setForm({ ...form, gender: g })} className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-colors ${form.gender === g ? 'bg-[#2563EB] text-white' : 'bg-[#0A1628] text-[#C7D2FE]'}`}>{g}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-[#C7D2FE] mb-1.5 block">Weight (kg)</label>
            <input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="70" className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-medium text-[#C7D2FE] mb-1.5 block">Height (cm)</label>
            <input type="number" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} placeholder="175" className={inputCls} />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-[#C7D2FE] mb-1.5 block">Activity Intensity</label>
          <div className="grid grid-cols-2 gap-2">
            {intensityLevels.map((lvl) => (
              <button
                key={lvl.value}
                onClick={() => setForm({ ...form, intensity: lvl.value })}
                className={`rounded-xl p-2.5 text-left transition-colors ${form.intensity === lvl.value ? 'bg-[#2563EB] text-white' : 'bg-[#0A1628] text-[#C7D2FE]'}`}
              >
                <p className="text-sm font-medium">{lvl.label}</p>
                <p className={`text-[10px] ${form.intensity === lvl.value ? 'text-white/80' : 'text-[#94A3B8]'}`}>{lvl.desc}</p>
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={calculate}
          disabled={loading}
          className="w-full rounded-full bg-[#3B82F6] text-[#FFFFFF] py-3 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-[#93C5FD] transition-colors"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Generating Estimates...</> : <><Calculator size={16} /> Calculate Calorie Burn <ArrowRight size={16} /></>}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl bg-red-500/10 border border-red-500/30 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center gap-3 mt-6 py-8">
          <Loader2 size={32} className="text-[#2563EB] animate-spin" />
          <p className="text-sm text-[#C7D2FE]">AI is calculating personalized estimates...</p>
        </div>
      )}

      {results && !loading && (
        <div className="mt-5">
          <div className="mb-3 px-1">
            <p className="text-sm font-semibold text-[#FFFFFF]">Your Calorie Burn Estimates</p>
            <p className="text-xs text-[#C7D2FE]">{form.age} yrs · {form.gender} · {form.weight} kg · {form.height} cm · {intensityLevels.find((l) => l.value === form.intensity)?.label} intensity</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {results.map((r, i) => {
              const meta = activityMap[r.name] || activities[i % activities.length];
              const Icon = meta.icon;
              return (
                <div key={i} className="rounded-2xl bg-white/5 border border-[#1E293B] p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-xl ${meta.bg}`}>
                      <Icon size={18} className={meta.color} />
                    </div>
                    <p className="font-semibold text-sm text-[#FFFFFF]">{r.name}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <CalorieStat minutes="10 min" calories={r.calories_10} />
                    <CalorieStat minutes="30 min" calories={r.calories_30} highlighted />
                    <CalorieStat minutes="60 min" calories={r.calories_60} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 rounded-2xl bg-[#2563EB]/10 border border-[#2563EB]/20 p-4">
            <p className="text-xs text-[#C7D2FE] leading-relaxed">
              ⚠️ Calorie burn estimates vary depending on intensity, fitness level, body weight, and individual metabolism. These are approximations and not medical advice.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function CalorieStat({ minutes, calories, highlighted }) {
  return (
    <div className={`rounded-xl p-2.5 text-center ${highlighted ? 'bg-[#3B82F6]/40' : 'bg-[#0A1628]'}`}>
      <div className="flex items-center justify-center gap-1 mb-1">
        <Clock size={10} className="text-[#94A3B8]" />
        <p className="text-[10px] text-[#C7D2FE]">{minutes}</p>
      </div>
      <p className="text-lg font-bold text-[#FFFFFF]">{calories}</p>
      <p className="text-[9px] text-[#94A3B8]">kcal</p>
    </div>
  );
}