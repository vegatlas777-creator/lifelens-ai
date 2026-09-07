import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Footprints, Activity, Bike, Mountain, Waves, Music, PersonStanding, Dumbbell, Leaf, Loader2, Calculator, ArrowRight, Clock } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const activities = [
  { name: 'Walking', icon: Footprints, color: 'text-[#FF149C]', bg: 'bg-[#FFD9E6]' },
  { name: 'Running', icon: Activity, color: 'text-[#E91E63]', bg: 'bg-[#FFE5F0]' },
  { name: 'Cycling', icon: Bike, color: 'text-[#FF149C]', bg: 'bg-[#FFD9E6]' },
  { name: 'Hiking', icon: Mountain, color: 'text-[#E91E63]', bg: 'bg-[#FFE5F0]' },
  { name: 'Swimming', icon: Waves, color: 'text-[#FF149C]', bg: 'bg-[#FFD9E6]' },
  { name: 'Dancing', icon: Music, color: 'text-[#E91E63]', bg: 'bg-[#FFE5F0]' },
  { name: 'Hip Hop', icon: Music, color: 'text-[#FF149C]', bg: 'bg-[#FFD9E6]' },
  { name: 'Latin Dance', icon: Music, color: 'text-[#E91E63]', bg: 'bg-[#FFE5F0]' },
  { name: 'Street Dance', icon: Music, color: 'text-[#FF149C]', bg: 'bg-[#FFD9E6]' },
  { name: 'Ballet', icon: PersonStanding, color: 'text-[#E91E63]', bg: 'bg-[#FFE5F0]' },
  { name: 'Aerobic Dance', icon: Music, color: 'text-[#FF149C]', bg: 'bg-[#FFD9E6]' },
  { name: 'Strength Training', icon: Dumbbell, color: 'text-[#E91E63]', bg: 'bg-[#FFE5F0]' },
  { name: 'Yoga', icon: Leaf, color: 'text-[#FF149C]', bg: 'bg-[#FFD9E6]' },
];

const intensityLevels = [
  { value: 'light', label: 'Light', desc: 'Casual, relaxed pace' },
  { value: 'moderate', label: 'Moderate', desc: 'Steady, breathing harder' },
  { value: 'vigorous', label: 'Vigorous', desc: 'Fast-paced, sweating' },
  { value: 'high', label: 'High Intensity', desc: 'Maximum effort' },
];

const inputCls = "w-full rounded-xl bg-[#FFF0F5] border border-[#FFC0D6] px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF149C] text-[#4A0E2E]";

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
      <div className="rounded-3xl bg-white border border-[#FFC0D6] shadow-sm shadow-pink-200/60 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-[#B0407A] mb-1.5 block">Age</label>
            <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="30" className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-medium text-[#B0407A] mb-1.5 block">Gender</label>
            <div className="flex gap-2">
              {['male', 'female'].map((g) => (
                <button key={g} onClick={() => setForm({ ...form, gender: g })} className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-colors ${form.gender === g ? 'bg-[#E91E63] text-white' : 'bg-[#FFD9E6] text-[#B0407A]'}`}>{g}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-[#B0407A] mb-1.5 block">Weight (kg)</label>
            <input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="70" className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-medium text-[#B0407A] mb-1.5 block">Height (cm)</label>
            <input type="number" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} placeholder="175" className={inputCls} />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-[#B0407A] mb-1.5 block">Activity Intensity</label>
          <div className="grid grid-cols-2 gap-2">
            {intensityLevels.map((lvl) => (
              <button
                key={lvl.value}
                onClick={() => setForm({ ...form, intensity: lvl.value })}
                className={`rounded-xl p-2.5 text-left transition-colors ${form.intensity === lvl.value ? 'bg-[#E91E63] text-white' : 'bg-[#FFF0F5] border border-[#FFC0D6] text-[#B0407A]'}`}
              >
                <p className="text-sm font-medium">{lvl.label}</p>
                <p className={`text-[10px] ${form.intensity === lvl.value ? 'text-white/80' : 'text-[#D67A9E]'}`}>{lvl.desc}</p>
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={calculate}
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-r from-[#FF69B4] to-[#FF149C] text-white py-3 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-pink-300/50"
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
          <Loader2 size={32} className="text-[#FF149C] animate-spin" />
          <p className="text-sm text-[#B0407A]">AI is calculating personalized estimates...</p>
        </div>
      )}

      {results && !loading && (
        <div className="mt-5">
          <div className="mb-3 px-1">
            <p className="text-sm font-semibold text-[#4A0E2E]">Your Calorie Burn Estimates</p>
            <p className="text-xs text-[#B0407A]">{form.age} yrs · {form.gender} · {form.weight} kg · {form.height} cm · {intensityLevels.find((l) => l.value === form.intensity)?.label} intensity</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {results.map((r, i) => {
              const meta = activityMap[r.name] || activities[i % activities.length];
              const Icon = meta.icon;
              return (
                <div key={i} className="rounded-2xl bg-white border border-[#FFC0D6] shadow-sm shadow-pink-200/60 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-xl ${meta.bg}`}>
                      <Icon size={18} className={meta.color} />
                    </div>
                    <p className="font-semibold text-sm text-[#4A0E2E]">{r.name}</p>
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
          <div className="mt-5 rounded-2xl bg-[#FFD9E6] border border-[#FFC0D6] p-4">
            <p className="text-xs text-[#B0407A] leading-relaxed">
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
    <div className={`rounded-xl p-2.5 text-center ${highlighted ? 'bg-[#FF69B4]/30' : 'bg-[#FFF0F5]'}`}>
      <div className="flex items-center justify-center gap-1 mb-1">
        <Clock size={10} className="text-[#D67A9E]" />
        <p className="text-[10px] text-[#B0407A]">{minutes}</p>
      </div>
      <p className="text-lg font-bold text-[#4A0E2E]">{calories}</p>
      <p className="text-[9px] text-[#D67A9E]">kcal</p>
    </div>
  );
}