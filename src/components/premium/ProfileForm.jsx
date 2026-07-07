import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Save, User } from 'lucide-react';
import { activityLevels } from '@/lib/workoutData';

const inputCls = "w-full rounded-xl bg-[#FDF6EE] border border-[#F5EFE6] px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF9F43] text-[#1A1A1A]";
const goalOptions = [
  { value: 'loss', label: 'Weight Loss' },
  { value: 'maintenance', label: 'Weight Maintenance' },
  { value: 'gain', label: 'Weight Gain' },
  { value: 'general_fitness', label: 'General Fitness' },
];

export default function ProfileForm() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ age: '', gender: 'male', height_cm: '', weight_kg: '', target_weight: '', activity_level: 'moderate', goal: 'maintenance', daily_step_goal: 10000, daily_calorie_goal: '', weekly_activity_goal: 150 });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const profiles = await base44.entities.MetabolicProfile.list('-created_date', 1);
      if (profiles.length) {
        const p = profiles[0];
        setProfile(p);
        setForm({ age: String(p.age || ''), gender: p.gender || 'male', height_cm: String(p.height_cm || ''), weight_kg: String(p.weight_kg || ''), target_weight: String(p.target_weight || ''), activity_level: p.activity_level || 'moderate', goal: p.goal || 'maintenance', daily_step_goal: p.daily_step_goal || 10000, daily_calorie_goal: String(p.daily_calorie_goal || ''), weekly_activity_goal: p.weekly_activity_goal || 150 });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const payload = { age: parseFloat(form.age), gender: form.gender, height_cm: parseFloat(form.height_cm), weight_kg: parseFloat(form.weight_kg), target_weight: form.target_weight ? parseFloat(form.target_weight) : null, activity_level: form.activity_level, goal: form.goal, daily_step_goal: parseInt(form.daily_step_goal) || 10000, daily_calorie_goal: form.daily_calorie_goal ? parseInt(form.daily_calorie_goal) : null, weekly_activity_goal: parseInt(form.weekly_activity_goal) || 150 };
      let bmr = form.gender === 'male' ? 10 * payload.weight_kg + 6.25 * payload.height_cm - 5 * payload.age + 5 : 10 * payload.weight_kg + 6.25 * payload.height_cm - 5 * payload.age - 161;
      const mult = activityLevels.find((l) => l.value === form.activity_level)?.multiplier || 1.55;
      payload.bmr = Math.round(bmr);
      payload.tdee = Math.round(bmr * mult);
      if (profile) await base44.entities.MetabolicProfile.update(profile.id, payload);
      else await base44.entities.MetabolicProfile.create(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) { console.error(e); }
    setSaving(false);
  }

  if (loading) return <div className="flex justify-center py-8"><Loader2 size={28} className="text-[#FF9F43] animate-spin" /></div>;

  return (
    <div className="px-5 space-y-4">
      <div className="rounded-3xl bg-white border border-[#F5EFE6] p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <User size={18} className="text-[#FF9F43]" />
          <h2 className="text-base font-bold text-[#1A1A1A]">Personal Information</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Age"><input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="30" className={inputCls} /></Field>
          <Field label="Gender">
            <div className="flex gap-2">
              {['male', 'female'].map((g) => (
                <button key={g} onClick={() => setForm({ ...form, gender: g })} className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize ${form.gender === g ? 'bg-[#FF9F43] text-white' : 'bg-[#FDF6EE] text-[#666]'}`}>{g}</button>
              ))}
            </div>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Height (cm)"><input type="number" value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: e.target.value })} placeholder="175" className={inputCls} /></Field>
          <Field label="Current Weight (kg)"><input type="number" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} placeholder="70" className={inputCls} /></Field>
        </div>
        <Field label="Target Weight (kg)"><input type="number" value={form.target_weight} onChange={(e) => setForm({ ...form, target_weight: e.target.value })} placeholder="65" className={inputCls} /></Field>
        <Field label="Activity Level">
          <select value={form.activity_level} onChange={(e) => setForm({ ...form, activity_level: e.target.value })} className={inputCls}>
            {activityLevels.map((l) => (<option key={l.value} value={l.value}>{l.label} — {l.desc}</option>))}
          </select>
        </Field>
        <Field label="Fitness Goal">
          <select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} className={inputCls}>
            {goalOptions.map((g) => (<option key={g.value} value={g.value}>{g.label}</option>))}
          </select>
        </Field>
      </div>
      <div className="rounded-3xl bg-white border border-[#F5EFE6] p-5 space-y-4">
        <h2 className="text-base font-bold text-[#1A1A1A]">Daily Goals</h2>
        <div className="grid grid-cols-1 gap-3">
          <Field label="Daily Step Goal"><input type="number" value={form.daily_step_goal} onChange={(e) => setForm({ ...form, daily_step_goal: e.target.value })} className={inputCls} /></Field>
          <Field label="Daily Calorie Goal (kcal)"><input type="number" value={form.daily_calorie_goal} onChange={(e) => setForm({ ...form, daily_calorie_goal: e.target.value })} placeholder="Auto-calculated if empty" className={inputCls} /></Field>
          <Field label="Weekly Activity Goal (minutes)"><input type="number" value={form.weekly_activity_goal} onChange={(e) => setForm({ ...form, weekly_activity_goal: e.target.value })} className={inputCls} /></Field>
        </div>
      </div>
      <button onClick={save} disabled={saving} className="w-full rounded-full bg-[#FFD5A8] text-[#1A1A1A] py-3.5 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {saved ? 'Profile Saved!' : 'Save Profile'}
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (<div><label className="text-xs font-medium text-[#666] mb-1.5 block">{label}</label>{children}</div>);
}