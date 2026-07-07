import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Calculator, Activity, Target, Loader2, TrendingDown, Minus, TrendingUp } from 'lucide-react';
import PageHeader, { Disclaimer } from '@/components/PageHeader';
import { activityLevels } from '@/lib/workoutData';

export default function MetabolicCalculator() {
  const [form, setForm] = useState({
    age: '',
    gender: 'male',
    height_cm: '',
    weight_kg: '',
    activity_level: 'moderate',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [existingProfile, setExistingProfile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const profiles = await base44.entities.MetabolicProfile.list('-created_date', 1);
      if (profiles.length) {
        const p = profiles[0];
        setExistingProfile(p);
        setForm({
          age: String(p.age),
          gender: p.gender,
          height_cm: String(p.height_cm),
          weight_kg: String(p.weight_kg),
          activity_level: p.activity_level,
        });
        setResult({ bmr: p.bmr, tdee: p.tdee, target_calories: p.target_calories, goal: p.goal });
      }
    } catch (e) { console.error(e); }
  }

  function calculate() {
    const { age, gender, height_cm, weight_kg, activity_level } = form;
    const a = parseFloat(age), h = parseFloat(height_cm), w = parseFloat(weight_kg);
    if (!a || !h || !w) return;

    // Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }

    const mult = activityLevels.find((l) => l.value === activity_level)?.multiplier || 1.55;
    const tdee = Math.round(bmr * mult);
    bmr = Math.round(bmr);

    setResult({
      bmr,
      tdee,
      loss: Math.round(tdee - 500),
      maintenance: tdee,
      gain: Math.round(tdee + 500),
      target_calories: tdee,
      goal: 'maintenance',
    });
  }

  async function save(goal) {
    setLoading(true);
    try {
      const a = parseFloat(form.age), h = parseFloat(form.height_cm), w = parseFloat(form.weight_kg);
      let bmr;
      if (form.gender === 'male') bmr = 10 * w + 6.25 * h - 5 * a + 5;
      else bmr = 10 * w + 6.25 * h - 5 * a - 161;
      const mult = activityLevels.find((l) => l.value === form.activity_level)?.multiplier || 1.55;
      const tdee = Math.round(bmr * mult);
      bmr = Math.round(bmr);
      const target = goal === 'loss' ? tdee - 500 : goal === 'gain' ? tdee + 500 : tdee;

      const payload = {
        age: a,
        gender: form.gender,
        height_cm: h,
        weight_kg: w,
        activity_level: form.activity_level,
        bmr,
        tdee,
        goal,
        target_calories: target,
      };

      if (existingProfile) {
        await base44.entities.MetabolicProfile.update(existingProfile.id, payload);
      } else {
        await base44.entities.MetabolicProfile.create(payload);
      }

      setResult({ bmr, tdee, loss: tdee - 500, maintenance: tdee, gain: tdee + 500, target_calories: target, goal });
      setExistingProfile({ ...existingProfile, ...payload });
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  return (
    <div className="pb-4">
      <PageHeader title="Metabolic Calculator" subtitle="BMR, TDEE & calorie targets" icon={Calculator} />

      <div className="px-5 mt-2">
        {/* Form */}
        <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Age">
              <input type="number" value={form.age} onChange={(e) => { setForm({ ...form, age: e.target.value }); }} placeholder="30" className={inputCls} />
            </Field>
            <Field label="Gender">
              <div className="flex gap-2">
                {['male', 'female'].map((g) => (
                  <button key={g} onClick={() => setForm({ ...form, gender: g })} className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-colors ${form.gender === g ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{g}</button>
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
              {activityLevels.map((l) => (
                <option key={l.value} value={l.value}>{l.label} — {l.desc}</option>
              ))}
            </select>
          </Field>
          <button onClick={calculate} className="w-full rounded-2xl bg-primary text-primary-foreground py-3 font-medium text-sm flex items-center justify-center gap-2">
            <Calculator size={16} /> Calculate
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4">
                <Activity size={20} className="opacity-80 mb-2" />
                <p className="text-xs opacity-80">BMR</p>
                <p className="text-2xl font-bold">{result.bmr}</p>
                <p className="text-[10px] opacity-70 mt-1">At rest</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground p-4">
                <Target size={20} className="opacity-80 mb-2" />
                <p className="text-xs opacity-80">TDEE</p>
                <p className="text-2xl font-bold">{result.tdee}</p>
                <p className="text-[10px] opacity-70 mt-1">Daily burn</p>
              </div>
            </div>

            {/* Goal targets */}
            <div className="rounded-2xl bg-card border border-border p-5">
              <p className="text-sm font-semibold mb-3">Calorie Targets by Goal</p>
              <div className="space-y-3">
                <GoalRow icon={TrendingDown} label="Weight Loss" calories={result.loss} active={result.goal === 'loss'} onClick={() => save('loss')} color="text-blue-500" saving={loading} />
                <GoalRow icon={Minus} label="Maintenance" calories={result.maintenance} active={result.goal === 'maintenance'} onClick={() => save('maintenance')} color="text-primary" saving={loading} />
                <GoalRow icon={TrendingUp} label="Weight Gain" calories={result.gain} active={result.goal === 'gain'} onClick={() => save('gain')} color="text-amber-500" saving={loading} />
              </div>
              <p className="text-xs text-muted-foreground mt-3">Tap a goal to set it as your daily target on the dashboard.</p>
            </div>

            {/* Education */}
            <div className="rounded-2xl bg-muted/50 border border-border p-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">BMR (Basal Metabolic Rate)</strong> is the energy your body needs at complete rest to maintain vital functions like breathing and cell production. <strong className="text-foreground">TDEE (Total Daily Energy Expenditure)</strong> multiplies BMR by your activity level to estimate total daily calorie burn. To lose weight, consume fewer calories than your TDEE; to gain weight, consume more. A deficit/surplus of ~500 kcal/day typically results in ~0.5 kg change per week.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6">
          <Disclaimer text="⚠️ BMR and TDEE are estimates based on the Mifflin-St Jeor equation. Individual results vary. Not medical advice — consult a professional for personalized guidance." />
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl bg-muted border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary";

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

function GoalRow({ icon: Icon, label, calories, active, onClick, color, saving }) {
  return (
    <button onClick={onClick} disabled={saving} className={`w-full flex items-center gap-3 rounded-xl p-3 transition-colors ${active ? 'bg-primary/10 border border-primary/30' : 'border border-border'}`}>
      <Icon size={18} className={color} />
      <span className="text-sm font-medium flex-1 text-left">{label}</span>
      <span className="font-bold">{calories} kcal</span>
      {saving && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
    </button>
  );
}