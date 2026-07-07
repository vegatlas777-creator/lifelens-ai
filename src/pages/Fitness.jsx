import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dumbbell, Flame, Check, Play, X, Loader2 } from 'lucide-react';
import PageHeader, { Disclaimer } from '@/components/PageHeader';
import { workoutLibrary, categories, calculateCaloriesBurned } from '@/lib/workoutData';
import { getTodayStr } from '@/lib/dateUtils';

export default function Fitness() {
  const [activeCategory, setActiveCategory] = useState('Hip Hop Dance');
  const [weight, setWeight] = useState(70);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [todayBurned, setTodayBurned] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const today = getTodayStr();
      const logs = await base44.entities.WorkoutLog.filter({ completed_date: today });
      setCompletedIds(new Set(logs.map((l) => l.workout_id)));
      setTodayBurned(logs.reduce((s, l) => s + (l.calories_burned || 0), 0));
    } catch (e) { console.error(e); }
  }

  async function markComplete(workout) {
    setSaving(true);
    try {
      const burned = calculateCaloriesBurned(workout.met, weight, workout.duration);
      await base44.entities.WorkoutLog.create({
        workout_id: workout.id,
        workout_name: workout.name,
        category: workout.category,
        duration_minutes: workout.duration,
        calories_burned: burned,
        completed_date: getTodayStr(),
      });
      setCompletedIds(new Set([...completedIds, workout.id]));
      setTodayBurned(todayBurned + burned);
      setSelectedWorkout(null);
    } catch (e) { console.error(e); }
    setSaving(false);
  }

  const filtered = workoutLibrary.filter((w) => w.category === activeCategory);

  return (
    <div className="pb-4">
      <PageHeader title="Fitness" subtitle="10-minute dance & cardio workouts" icon={Dumbbell} />

      <div className="px-5 mt-2">
        {/* Burned today */}
        <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 text-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80 font-medium">Calories Burned Today</p>
              <p className="text-4xl font-bold mt-1">{todayBurned}</p>
            </div>
            <Flame size={40} className="opacity-80" />
          </div>
          <p className="text-xs opacity-70 mt-2">{completedIds.size} workout{completedIds.size !== 1 ? 's' : ''} completed today</p>
        </div>

        {/* Weight input */}
        <div className="mt-4 rounded-2xl bg-card border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Your Weight</p>
              <p className="text-xs text-muted-foreground">For calorie burn estimation</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 70)}
                className="w-16 text-right rounded-lg bg-muted border border-border px-2 py-1.5 font-semibold focus:outline-none focus:border-primary"
              />
              <span className="text-sm text-muted-foreground">kg</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2 -mx-5 px-5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Workouts */}
        <div className="mt-4 space-y-3">
          {filtered.map((w) => {
            const burned = calculateCaloriesBurned(w.met, weight, w.duration);
            const done = completedIds.has(w.id);
            return (
              <div key={w.id} className={`rounded-2xl bg-card border p-4 flex items-center gap-3 transition-colors ${done ? 'border-primary/30 bg-primary/5' : 'border-border'}`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${w.color} flex items-center justify-center flex-shrink-0`}>
                  {done ? <Check size={20} className="text-white" /> : <Play size={18} className="text-white ml-0.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{w.name}</p>
                  <p className="text-xs text-muted-foreground">{w.duration} min · ~{burned} kcal</p>
                </div>
                <button
                  onClick={() => setSelectedWorkout(w)}
                  className="px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium"
                >
                  {done ? 'Again' : 'Start'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <Disclaimer text="⚠️ Calories burned are estimates based on MET values and body weight. Actual burn varies. Not medical advice." />
        </div>
      </div>

      {/* Workout Player Modal */}
      {selectedWorkout && (
        <WorkoutModal
          workout={selectedWorkout}
          weight={weight}
          onClose={() => setSelectedWorkout(null)}
          onComplete={() => markComplete(selectedWorkout)}
          done={completedIds.has(selectedWorkout.id)}
          saving={saving}
        />
      )}
    </div>
  );
}

function WorkoutModal({ workout, weight, onClose, onComplete, done, saving }) {
  const burned = calculateCaloriesBurned(workout.met, weight, workout.duration);
  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      <div className="flex items-center justify-between px-5 pt-14 pb-3 border-b border-border">
        <div>
          <p className="text-xs text-muted-foreground">{workout.category}</p>
          <h2 className="text-lg font-bold">{workout.name}</h2>
        </div>
        <button onClick={onClose} className="p-2 rounded-full bg-muted"><X size={20} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        <div className="aspect-video rounded-2xl overflow-hidden bg-black">
          <iframe
            src={workout.videoUrl}
            title={workout.name}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <p className="text-sm text-muted-foreground mt-4">{workout.description}</p>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-xl bg-card border border-border p-3 text-center">
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="text-xl font-bold">{workout.duration} min</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-3 text-center">
            <p className="text-xs text-muted-foreground">Est. Calories</p>
            <p className="text-xl font-bold text-primary">{burned}</p>
          </div>
        </div>
      </div>
      <div className="p-5 border-t border-border">
        <button
          onClick={onComplete}
          disabled={saving}
          className="w-full rounded-2xl bg-primary text-primary-foreground py-3.5 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
          {done ? 'Log Another Session' : 'Mark as Completed'}
        </button>
      </div>
    </div>
  );
}