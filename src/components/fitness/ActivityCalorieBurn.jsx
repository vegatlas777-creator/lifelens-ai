import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Footprints, Activity, Bike, Mountain, Waves, Music, PersonStanding, Dumbbell, Leaf, Loader2, Calculator, ArrowRight, Clock } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const activities = [
  { name: 'Walking', icon: Footprints, color: 'text-[#0A0A0A]', bg: 'bg-[#EBEBEB]' },
  { name: 'Running', icon: Activity, color: 'text-[#404040]', bg: 'bg-[#EBEBEB]' },
  { name: 'Cycling', icon: Bike, color: 'text-[#0A0A0A]', bg: 'bg-[#EBEBEB]' },
  { name: 'Hiking', icon: Mountain, color: 'text-[#404040]', bg: 'bg-[#EBEBEB]' },
  { name: 'Swimming', icon: Waves, color: 'text-[#0A0A0A]', bg: 'bg-[#EBEBEB]' },
  { name: 'Dancing', icon: Music, color: 'text-[#404040]', bg: 'bg-[#EBEBEB]' },
  { name: 'Hip Hop', icon: Music, color: 'text-[#0A0A0A]', bg: 'bg-[#EBEBEB]' },
  { name: 'Latin Dance', icon: Music, color: 'text-[#404040]', bg: 'bg-[#EBEBEB]' },
  { name: 'Street Dance', icon: Music, color: 'text-[#0A0A0A]', bg: 'bg-[#EBEBEB]' },
  { name: 'Ballet', icon: PersonStanding, color: 'text-[#404040]', bg: 'bg-[#EBEBEB]' },
  { name: 'Aerobic Dance', icon: Music, color: 'text-[#0A0A0A]', bg: 'bg-[#EBEBEB]' },
  { name: 'Strength Training', icon: Dumbbell, color: 'text-[#404040]', bg: 'bg-[#EBEBEB]' },
  { name: 'Yoga', icon: Leaf, color: 'text-[#0A0A0A]', bg: 'bg-[#EBEBEB]' },
];

const intensityLevels = [
  { value: 'light', label: 'Light', desc: 'Casual, relaxed pace' },
  { value: 'moderate', label: 'Moderate', desc: 'Steady, breathing harder' },
  { value: 'vigorous', label: 'Vigorous', desc: 'Fast-paced, sweating' },
  { value: 'high', label: 'High Intensity', desc: 'Maximum effort' },
];

const inputCls = "w-full rounded-xl bg-[#F2F2F2] border border-[#E0E0E0] px-3 py-2.5 text-sm focus:outline-none focus:border-[#0A0A0A] text-[#0A0A0A]";

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
      <div className="rounded-3xl bg-white border border-[#E0E0E0] shadow-sm shadow-black/5 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-[#737373] mb-1.5 block">Age</label>
            <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="30" className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-medium text-[#737373] mb-1.5 block">Gender</label>
            <div className="flex gap-2">
              {['male', 'female'].map((g) => (
                <button key={g} onClick={() => setForm({ ...form, gender: g })} className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-colors ${form.gender === g ? 'bg-[#404040] text-white' : 'bg-[#EBEBEB] text-[#737373]'}`}>{g}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-[#737373] mb-1.5 block">Weight (kg)</label>
            <input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="70" className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-medium text-[#737373] mb-1.5 block">Height (cm)</label>
            <input type="number" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} placeholder="175" className={inputCls} />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-[#737373] mb-1.5 block">Activity Intensity</label>
          <div className="grid grid-cols-2 gap-2">
            {intensityLevels.map((lvl) => (
              <button
                key={lvl.value}
                onClick={() => setForm({ ...form, intensity: lvl.value })}
                className={`rounded-xl p-2.5 text-left transition-colors ${form.intensity === lvl.value ? 'bg-[#404040] text-white' : 'bg-[#F2F2F2] border border-[#E0E0E0] text-[#737373]'}`}
              >
                <p className="text-sm font-medium">{lvl.label}</p>
                <p className={`text-[10px] ${form.intensity === lvl.value ? 'text-white/80' : 'text-[#A3A3A3]'}`}>{lvl.desc}</p>
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={calculate}
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-r from-[#171717] to-[#0A0A0A] text-white py-3 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-black/10"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Generating Estimates...</> : <><Calculator size={16} /> Calculate Calorie Burn <ArrowRight size={16} /></>}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center gap-3 mt-6 py-8">
          <Loader2 size={32} className="text-[#0A0A0A] animate-spin" />
          <p className="text-sm text-[#737373]">AI is calculating personalized estimates...</p>
        </div>
      )}

      {results && !loading && (
        <div className="mt-5">
          <div className="mb-3 px-1">
            <p className="text-sm font-semibold text-[#0A0A0A]">Your Calorie Burn Estimates</p>
            <p className="text-xs text-[#737373]">{form.age} yrs · {form.gender} · {form.weight} kg · {form.height} cm · {intensityLevels.find((l) => l.value === form.intensity)?.label} intensity</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {results.map((r, i) => {
              const meta = activityMap[r.name] || activities[i % activities.length];
              const Icon = meta.icon;
              return (
                <div key={i} className="rounded-2xl bg-white border border-[#E0E0E0] shadow-sm shadow-black/5 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-xl ${meta.bg}`}>
                      <Icon size={18} className={meta.color} />
                    </div>
                    <p className="font-semibold text-sm text-[#0A0A0A]">{r.name}</p>
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
          <div className="mt-5 rounded-2xl bg-[#EBEBEB] border border-[#E0E0E0] p-4">
            <p className="text-xs text-[#737373] leading-relaxed">
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
    <div className={`rounded-xl p-2.5 text-center ${highlighted ? 'bg-[#171717]/30' : 'bg-[#F2F2F2]'}`}>
      <div className="flex items-center justify-center gap-1 mb-1">
        <Clock size={10} className="text-[#A3A3A3]" />
        <p className="text-[10px] text-[#737373]">{minutes}</p>
      </div>
      <p className="text-lg font-bold text-[#0A0A0A]">{calories}</p>
      <p className="text-[9px] text-[#A3A3A3]">kcal</p>
    </div>
  );
}