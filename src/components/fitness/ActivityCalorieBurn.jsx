import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Footprints, Activity, Bike, Mountain, Waves, Music, PersonStanding, Dumbbell, Leaf, Loader2, Calculator, ArrowRight, Clock } from 'lucide-react';

const activities = [
  { name: 'Walking', icon: Footprints, color: 'text-blue-500', bg: 'bg-blue-50' },
  { name: 'Running', icon: Activity, color: 'text-rose-500', bg: 'bg-rose-50' },
  { name: 'Cycling', icon: Bike, color: 'text-cyan-500', bg: 'bg-cyan-50' },
  { name: 'Hiking', icon: Mountain, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { name: 'Swimming', icon: Waves, color: 'text-sky-500', bg: 'bg-sky-50' },
  { name: 'Dancing', icon: Music, color: 'text-purple-500', bg: 'bg-purple-50' },
  { name: 'Hip Hop', icon: Music, color: 'text-fuchsia-500', bg: 'bg-fuchsia-50' },
  { name: 'Latin Dance', icon: Music, color: 'text-orange-500', bg: 'bg-orange-50' },
  { name: 'Street Dance', icon: Music, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { name: 'Ballet', icon: PersonStanding, color: 'text-pink-500', bg: 'bg-pink-50' },
  { name: 'Aerobic Dance', icon: Music, color: 'text-teal-500', bg: 'bg-teal-50' },
  { name: 'Strength Training', icon: Dumbbell, color: 'text-amber-600', bg: 'bg-amber-50' },
  { name: 'Yoga', icon: Leaf, color: 'text-green-500', bg: 'bg-green-50' },
];

const intensityLevels = [
  { value: 'light', label: 'Light', desc: 'Casual, relaxed pace' },
  { value: 'moderate', label: 'Moderate', desc: 'Steady, breathing harder' },
  { value: 'vigorous', label: 'Vigorous', desc: 'Fast-paced, sweating' },
  { value: 'high', label: 'High Intensity', desc: 'Maximum effort' },
];

const inputCls = "w-full rounded-xl bg-[#FDF6EE] border border-[#F5EFE6] px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF9F43] text-[#1A1A1A]";

export default function ActivityCalorieBurn() {
  const [form, setForm] = useState({ age: '', weight: '', height: '', gender: 'male', intensity: 'moderate' });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const activityMap = Object.fromEntries(activities.map((a) => [a.name, a]));

  async function calculate() {
    const { age, weight, height, gender, intensity } = form;
    if (!age || !weight || !height) {
      setError('Please fill in all fields to get personalized estimates.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an exercise science expert. Based on the user's profile, estimate calories burned for each activity at 10, 30, and 60 minutes.

User Profile:
- Age: ${age} years
- Weight: ${weight} kg
- Height: ${height} cm
- Gender: ${gender}
- Intensity level: ${intensity}

Activities to estimate: ${activities.map((a) => a.name).join(', ')}

For each activity, calculate calories burned at 10 minutes, 30 minutes, and 60 minutes. Use MET (Metabolic Equivalent of Task) values adjusted for the user's body weight, age, gender, and selected intensity level. The formula is: calories = MET × weight(kg) × duration(hours). Adjust the MET value based on the intensity level selected.

Round all values to whole numbers. Respond as JSON.`,
        response_json_schema: {
          type: 'object',
          properties: {
            activities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  calories_10: { type: 'number' },
                  calories_30: { type: 'number' },
                  calories_60: { type: 'number' },
                },
              },
            },
          },
        },
      });
      setResults(result.activities);
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
      <div className="rounded-3xl bg-white border border-[#F5EFE6] p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-[#666] mb-1.5 block">Age</label>
            <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="30" className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-medium text-[#666] mb-1.5 block">Gender</label>
            <div className="flex gap-2">
              {['male', 'female'].map((g) => (
                <button key={g} onClick={() => setForm({ ...form, gender: g })} className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-colors ${form.gender === g ? 'bg-[#FF9F43] text-white' : 'bg-[#FDF6EE] text-[#666]'}`}>{g}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-[#666] mb-1.5 block">Weight (kg)</label>
            <input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="70" className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-medium text-[#666] mb-1.5 block">Height (cm)</label>
            <input type="number" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} placeholder="175" className={inputCls} />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-[#666] mb-1.5 block">Activity Intensity</label>
          <div className="grid grid-cols-2 gap-2">
            {intensityLevels.map((lvl) => (
              <button
                key={lvl.value}
                onClick={() => setForm({ ...form, intensity: lvl.value })}
                className={`rounded-xl p-2.5 text-left transition-colors ${form.intensity === lvl.value ? 'bg-[#FF9F43] text-white' : 'bg-[#FDF6EE] text-[#666]'}`}
              >
                <p className="text-sm font-medium">{lvl.label}</p>
                <p className={`text-[10px] ${form.intensity === lvl.value ? 'text-white/80' : 'text-[#999]'}`}>{lvl.desc}</p>
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={calculate}
          disabled={loading}
          className="w-full rounded-full bg-[#FFD5A8] text-[#1A1A1A] py-3 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-[#FFC58A] transition-colors"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Generating Estimates...</> : <><Calculator size={16} /> Calculate Calorie Burn <ArrowRight size={16} /></>}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center gap-3 mt-6 py-8">
          <Loader2 size={32} className="text-[#FF9F43] animate-spin" />
          <p className="text-sm text-[#666]">AI is calculating personalized estimates...</p>
        </div>
      )}

      {results && !loading && (
        <div className="mt-5">
          <div className="mb-3 px-1">
            <p className="text-sm font-semibold text-[#1A1A1A]">Your Calorie Burn Estimates</p>
            <p className="text-xs text-[#666]">{form.age} yrs · {form.gender} · {form.weight} kg · {form.height} cm · {intensityLevels.find((l) => l.value === form.intensity)?.label} intensity</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {results.map((r, i) => {
              const meta = activityMap[r.name] || activities[i % activities.length];
              const Icon = meta.icon;
              return (
                <div key={i} className="rounded-2xl bg-white border border-[#F5EFE6] p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-xl ${meta.bg}`}>
                      <Icon size={18} className={meta.color} />
                    </div>
                    <p className="font-semibold text-sm text-[#1A1A1A]">{r.name}</p>
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
          <div className="mt-5 rounded-2xl bg-[#FDDDBD]/40 border border-[#FDDDBD] p-4">
            <p className="text-xs text-[#666] leading-relaxed">
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
    <div className={`rounded-xl p-2.5 text-center ${highlighted ? 'bg-[#FFD5A8]/40' : 'bg-[#FDF6EE]'}`}>
      <div className="flex items-center justify-center gap-1 mb-1">
        <Clock size={10} className="text-[#999]" />
        <p className="text-[10px] text-[#666]">{minutes}</p>
      </div>
      <p className="text-lg font-bold text-[#1A1A1A]">{calories}</p>
      <p className="text-[9px] text-[#999]">kcal</p>
    </div>
  );
}