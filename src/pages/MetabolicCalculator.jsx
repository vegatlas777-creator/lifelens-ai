import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Calculator, Activity, Target, Loader2, TrendingDown, Minus, TrendingUp, ArrowRight } from 'lucide-react';
import { activityLevels } from '@/lib/workoutData';

export default function MetabolicCalculator() {
  const [form, setForm] = useState({ age: '', gender: 'male', height_cm: '', weight_kg: '', activity_level: 'moderate' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [existingProfile, setExistingProfile] = useState(null);

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    try {
      const profiles = await base44.entities.MetabolicProfile.list('-created_date', 1);
      if (profiles.length) {
        const p = profiles[0];
        setExistingProfile(p);
        setForm({ age: String(p.age), gender: p.gender, height_cm: String(p.height_cm), weight_kg: String(p.weight_kg), activity_level: p.activity_level });
        setResult({ bmr: p.bmr, tdee: p.tdee, target_calories: p.target_calories, goal: p.goal });
      }
    } catch (e) { console.error(e); }
  }

  function calculate() {
    const { age, gender, height_cm, weight_kg, activity_level } = form;
    const a = parseFloat(age), h = parseFloat(height_cm), w = parseFloat(weight_kg);
    if (!a || !h || !w) return;
    let bmr = gender === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
    const mult = activityLevels.find((l) => l.value === activity_level)?.multiplier || 1.55;
    const tdee = Math.round(bmr * mult);
    bmr = Math.round(bmr);
    setResult({ bmr, tdee, loss: Math.round(tdee - 500), maintenance: tdee, gain: Math.round(tdee + 500), target_calories: tdee, goal: 'maintenance' });
  }

  async function save(goal) {
    setLoading(true);
    try {
      const a = parseFloat(form.age), h = parseFloat(form.height_cm), w = parseFloat(form.weight_kg);
      let bmr = form.gender === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
      const mult = activityLevels.find((l) => l.value === form.activity_level)?.multiplier || 1.55;
      const tdee = Math.round(bmr * mult);
      bmr = Math.round(bmr);
      const target = goal === 'loss' ? tdee - 500 : goal === 'gain' ? tdee + 500 : tdee;
      const payload = { age: a, gender: form.gender, height_cm: h, weight_kg: w, activity_level: form.activity_level, bmr, tdee, goal, target_calories: target };
      if (existingProfile) await base44.entities.MetabolicProfile.update(existingProfile.id, payload);
      else await base44.entities.MetabolicProfile.create(payload);
      setResult({ bmr, tdee, loss: tdee - 500, maintenance: tdee, gain: tdee + 500, target_calories: target, goal });
      setExistingProfile({ ...existingProfile, ...payload });
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#FDFBF8] pb-4">
      <div className="px-5 pt-12 pb-3">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Metabolic Calculator</h1>
        <p className="text-sm text-[#666]">BMR, TDEE & calorie targets</p>
      </div>

      <div className="px-5 mt-2">
        {/* Form */}
        <div className="rounded-3xl bg-white border border-[#F5EFE6] p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Age">
              <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="30" className={inputCls} />
            </Field>
            <Field label="Gender">
              <div className="flex gap-2">
                {['male', 'female'].map((g) => (
                  <button key={g} onClick={() => setForm({ ...form, gender: g })} className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-colors ${form.gender === g ? 'bg-[#FF9F43] text-white' : 'bg-[#FDF6EE] text-[#666]'}`}>{g}</button>
                ))}
              </div>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Height (cm)">
              <input type="number" value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: e.target.value })} placeholder="175" className={inputCls} />
            </Field>
            <Field label="Weight (kg)">
              <input type="number" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} placeholder="70" className={inputCls} />
            </Field>
          </div>
          <Field label="Activity Level">
            <select value={form.activity_level} onChange={(e) => setForm({ ...form, activity_level: e.target.value })} className={inputCls}>
              {activityLevels.map((l) => (<option key={l.value} value={l.value}>{l.label} — {l.desc}</option>))}
            </select>
          </Field>
          <button onClick={calculate} className="w-full rounded-full bg-[#FFD5A8] text-[#1A1A1A] py-3 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#FFC58A] transition-colors">
            <Calculator size={16} /> Calculate <ArrowRight size={16} />
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative overflow-hidden rounded-3xl">
                <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/85 to-indigo-700/85" />
                <div className="relative p-4 text-white">
                  <Activity size={20} className="opacity-80 mb-2" />
                  <p className="text-xs opacity-80">BMR</p>
                  <p className="text-2xl font-bold">{result.bmr}</p>
                  <p className="text-[10px] opacity-70 mt-1">At rest</p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-3xl">
                <img src="https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=400&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF9F43]/90 to-[#E8821E]/90" />
                <div className="relative p-4 text-white">
                  <Target size={20} className="opacity-80 mb-2" />
                  <p className="text-xs opacity-80">TDEE</p>
                  <p className="text-2xl font-bold">{result.tdee}</p>
                  <p className="text-[10px] opacity-70 mt-1">Daily burn</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-[#F5EFE6] p-5">
              <p className="text-sm font-semibold mb-3 text-[#1A1A1A]">Calorie Targets by Goal</p>
              <div className="space-y-3">
                <GoalRow icon={TrendingDown} label="Weight Loss" calories={result.loss} active={result.goal === 'loss'} onClick={() => save('loss')} color="text-blue-500" saving={loading} />
                <GoalRow icon={Minus} label="Maintenance" calories={result.maintenance} active={result.goal === 'maintenance'} onClick={() => save('maintenance')} color="text-[#FF9F43]" saving={loading} />
                <GoalRow icon={TrendingUp} label="Weight Gain" calories={result.gain} active={result.goal === 'gain'} onClick={() => save('gain')} color="text-amber-500" saving={loading} />
              </div>
              <p className="text-xs text-[#666] mt-3">Tap a goal to set it as your daily target on the dashboard.</p>
            </div>

            <div className="rounded-2xl bg-[#FDDDBD]/40 border border-[#FDDDBD] p-4">
              <p className="text-xs text-[#666] leading-relaxed">
                <strong className="text-[#1A1A1A]">BMR</strong> is the energy your body needs at complete rest. <strong className="text-[#1A1A1A]">TDEE</strong> multiplies BMR by your activity level to estimate total daily calorie burn. A deficit/surplus of ~500 kcal/day typically results in ~0.5 kg change per week.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6">
          <p className="text-[11px] text-[#999] text-center leading-relaxed">
            ⚠️ BMR and TDEE are estimates based on the Mifflin-St Jeor equation. Not medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl bg-[#FDF6EE] border border-[#F5EFE6] px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF9F43] text-[#1A1A1A]";

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-[#666] mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

function GoalRow({ icon: Icon, label, calories, active, onClick, color, saving }) {
  return (
    <button onClick={onClick} disabled={saving} className={`w-full flex items-center gap-3 rounded-2xl p-3 transition-colors ${active ? 'bg-[#FDDDBD]/40 border border-[#FF9F43]/30' : 'border border-[#F5EFE6]'}`}>
      <Icon size={18} className={color} />
      <span className="text-sm font-medium flex-1 text-left text-[#1A1A1A]">{label}</span>
      <span className="font-bold text-[#1A1A1A]">{calories} kcal</span>
      {saving && <Loader2 size={14} className="animate-spin text-[#666]" />}
    </button>
  );
}