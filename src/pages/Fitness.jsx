import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Flame, Check, Play, X, Loader2, ArrowRight } from 'lucide-react';
import { workoutLibrary, categories, calculateCaloriesBurned } from '@/lib/workoutData';
import { getTodayStr } from '@/lib/dateUtils';

const categoryImages = {
  'Hip Hop Dance': 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&q=80',
  'Latin Dance': 'https://images.unsplash.com/photo-1504609878373-06d740f60d8b?w=500&q=80',
  'Street Dance': 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=500&q=80',
  'Ballet Barre': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&q=80',
  'Aerobic Dance': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&q=80',
  'Beginner Cardio': 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=500&q=80',
};

export default function Fitness() {
  const [activeCategory, setActiveCategory] = useState('Hip Hop Dance');
  const [weight, setWeight] = useState(70);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [todayBurned, setTodayBurned] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

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
    <div className="min-h-screen bg-[#FDFBF8] pb-4">
      <div className="px-5 pt-12 pb-3">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Fitness</h1>
        <p className="text-sm text-[#666]">10-minute dance & cardio workouts</p>
      </div>

      <div className="px-5 mt-2">
        {/* Burned today */}
        <div className="relative overflow-hidden rounded-3xl">
          <img src="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/80 to-[#1A1A1A]/30" />
          <div className="relative p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80 font-medium">Calories Burned Today</p>
                <p className="text-4xl font-bold mt-1">{todayBurned}</p>
              </div>
              <Flame size={40} className="opacity-80" />
            </div>
            <p className="text-xs opacity-70 mt-2">{completedIds.size} workout{completedIds.size !== 1 ? 's' : ''} completed today</p>
          </div>
        </div>

        {/* Weight input */}
        <div className="mt-4 rounded-2xl bg-white border border-[#F5EFE6] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#1A1A1A]">Your Weight</p>
              <p className="text-xs text-[#666]">For calorie burn estimation</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 70)}
                className="w-16 text-right rounded-lg bg-[#FDF6EE] border border-[#F5EFE6] px-2 py-1.5 font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#FF9F43]"
              />
              <span className="text-sm text-[#666]">kg</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-[#FF9F43] text-white' : 'bg-white border border-[#F5EFE6] text-[#666]'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Workouts */}
        <div className="mt-4 grid grid-cols-1 gap-3">
          {filtered.map((w) => {
            const burned = calculateCaloriesBurned(w.met, weight, w.duration);
            const done = completedIds.has(w.id);
            return (
              <div key={w.id} className={`rounded-3xl overflow-hidden border transition-colors ${done ? 'border-[#FF9F43]/30 bg-[#FDDDBD]/30' : 'border-[#F5EFE6] bg-white'}`}>
                <div className="relative h-28">
                  <img src={categoryImages[w.category]} alt={w.name} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white text-sm">{w.name}</p>
                      <p className="text-xs text-white/80">{w.duration} min · ~{burned} kcal</p>
                    </div>
                    <button
                      onClick={() => setSelectedWorkout(w)}
                      className="px-4 py-2 rounded-full bg-[#FFD5A8] text-[#1A1A1A] text-xs font-semibold flex items-center gap-1"
                    >
                      {done ? <><Check size={14} /> Again</> : <><Play size={14} /> Start</>}
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-[#666]">{w.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <p className="text-[11px] text-[#999] text-center leading-relaxed">
            ⚠️ Calories burned are estimates based on MET values and body weight. Not medical advice.
          </p>
        </div>
      </div>

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
    <div className="fixed inset-0 z-[100] bg-[#FDFBF8] flex flex-col">
      <div className="flex items-center justify-between px-5 pt-14 pb-3 border-b border-[#F5EFE6]">
        <div>
          <p className="text-xs text-[#666]">{workout.category}</p>
          <h2 className="text-lg font-bold text-[#1A1A1A]">{workout.name}</h2>
        </div>
        <button onClick={onClose} className="p-2 rounded-full bg-[#FDDDBD]"><X size={20} className="text-[#E8821E]" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        <div className="aspect-video rounded-3xl overflow-hidden bg-black">
          <video
            src={workout.videoUrl}
            className="w-full h-full object-cover"
            controls
            autoPlay
            loop
            playsInline
          />
        </div>
        <p className="text-sm text-[#666] mt-4">{workout.description}</p>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-2xl bg-white border border-[#F5EFE6] p-3 text-center">
            <p className="text-xs text-[#666]">Duration</p>
            <p className="text-xl font-bold text-[#1A1A1A]">{workout.duration} min</p>
          </div>
          <div className="rounded-2xl bg-white border border-[#F5EFE6] p-3 text-center">
            <p className="text-xs text-[#666]">Est. Calories</p>
            <p className="text-xl font-bold text-[#FF9F43]">{burned}</p>
          </div>
        </div>
      </div>
      <div className="p-5 border-t border-[#F5EFE6]">
        <button
          onClick={onComplete}
          disabled={saving}
          className="w-full rounded-full bg-[#FFD5A8] text-[#1A1A1A] py-3.5 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
          {done ? 'Log Another Session' : 'Mark as Completed'}
        </button>
      </div>
    </div>
  );
}