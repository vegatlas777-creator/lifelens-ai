import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, Leaf, ArrowRight, Crown, Flame, Footprints, Activity as ActivityIcon, Zap, Sparkles, ChevronRight, Target, Utensils, Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTodayStr } from '@/lib/dateUtils';
import { getSubscriptionStatus } from '@/lib/subscription';

export default function Home() {
  const [todayCalories, setTodayCalories] = useState(0);
  const [todayBurned, setTodayBurned] = useState(0);
  const [todaySteps, setTodaySteps] = useState(0);
  const [activityBurned, setActivityBurned] = useState(0);
  const [activeMinutes, setActiveMinutes] = useState(0);
  const [profile, setProfile] = useState(null);
  const [subStatus, setSubStatus] = useState({ isPremium: false, loading: true });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const me = await base44.auth.me();
      setUser(me);
      const today = getTodayStr();

      const [foodEntries, workouts, metabo, activityLogs, sub] = await Promise.all([
        base44.entities.FoodEntry.filter({ entry_date: today }),
        base44.entities.WorkoutLog.filter({ completed_date: today }),
        base44.entities.MetabolicProfile.list('-created_date', 1),
        base44.entities.ActivityLog.filter({ log_date: today }),
        getSubscriptionStatus(),
      ]);

      setTodayCalories(foodEntries.reduce((s, e) => s + (e.calories || 0), 0));
      setTodayBurned(workouts.reduce((s, w) => s + (w.calories_burned || 0), 0));
      setTodaySteps(activityLogs.reduce((s, l) => s + (l.steps || 0), 0));
      setActivityBurned(activityLogs.reduce((s, l) => s + (l.calories_burned_activity || 0), 0));
      setActiveMinutes(activityLogs.reduce((s, l) => s + (l.active_minutes || 0), 0));
      if (metabo.length) setProfile(metabo[0]);
      setSubStatus(sub);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const targetCalories = profile?.target_calories || 2000;
  const stepGoal = profile?.daily_step_goal || 10000;
  const caloriesLeft = Math.max(targetCalories - todayCalories, 0);
  const totalBurned = todayBurned + activityBurned;
  const caloriePct = Math.min((todayCalories / targetCalories) * 100, 100);
  const stepPct = Math.min((todaySteps / stepGoal) * 100, 100);
  const activePct = Math.min((activeMinutes / 30) * 100, 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F6F1E8]">
        <div className="w-10 h-10 border-4 border-[#E5DDD1] border-t-[#C9962C] rounded-full animate-spin" />
      </div>
    );
  }

  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-[#F6F1E8] text-[#0A0A0A] pb-6">
      {/* Top bar */}
      <div className="px-5 pt-10 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 lg:hidden">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E0BF66] to-[#C9962C] flex items-center justify-center shadow-lg shadow-black/10">
            <Leaf size={20} className="text-white" />
          </div>
          <span className="text-base font-bold tracking-tight font-heading">3 in 1 Healthy Choice</span>
        </div>
        <div className="hidden lg:block">
          <h2 className="text-xl font-bold tracking-tight font-heading">Dashboard</h2>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="w-10 h-10 rounded-full bg-[#FFFDFC] shadow-sm shadow-black/5 border border-[#E5DDD1] flex items-center justify-center text-[#737373] hover:bg-[#FDF6E3] transition-colors">
            <Bell size={17} />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E0BF66] to-[#C9962C] flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-black/10">
            {firstName[0]?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Compact hero */}
      <div className="px-5 mt-1">
        <div className="relative rounded-3xl overflow-hidden border border-[#E0E0E0] shadow-lg shadow-black/10">
          <img
            src="https://media.base44.com/images/public/6a4d2399ef3bc08d1d9e1e75/dc948ce8e_generated_image.png"
            alt="Woman working out in gym"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(168, 132, 46, 0.20)' }} />
          <div className="relative p-5 min-h-[170px] flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#E0BF66] to-[#C9962C] text-xs font-semibold text-[#1F1A14]"
            >
              <Sparkles size={11} /> Your AI wellness companion
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="text-2xl font-bold tracking-tight mt-2 leading-tight text-white font-heading drop-shadow-lg"
            >
              {greeting}, {firstName}.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-sm text-white mt-0.5 font-medium drop-shadow-lg"
            >
              Let's make today count.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex items-center gap-2 mt-3">
              <Link
                to="/coach"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#B8902E] text-xs font-bold shadow-md hover:scale-[1.03] transition-transform"
              >
                Chat with AI Coach <ArrowRight size={14} />
              </Link>
              {!subStatus.isPremium && (
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#E0BF66] to-[#C9962C] border border-white/40 text-[#1F1A14] text-xs font-semibold"
                >
                  <Crown size={13} /> Premium
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Calorie progress summary */}
      <div className="px-5 mt-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl bg-[#FFFDFC] border border-[#E5DDD1] shadow-sm shadow-black/5 p-4"
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#FDF6E3]">
                <Target size={14} className="text-[#B8902E]" />
              </div>
              <p className="text-xs font-semibold text-[#404040]">Daily Calorie Goal</p>
            </div>
            <p className="text-xs font-medium text-[#737373]">
              <span className="text-[#0A0A0A] font-bold">{Math.round(todayCalories)}</span> / {targetCalories} kcal
            </p>
          </div>
          <div className="h-2.5 rounded-full bg-[#F6F1E8] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${caloriePct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${caloriePct >= 100 ? 'bg-gradient-to-r from-[#E0A800] to-[#C9962C]' : 'bg-gradient-to-r from-[#E0BF66] to-[#C9962C]'}`}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[11px] text-[#737373]">
              {caloriesLeft > 0 ? `${caloriesLeft} kcal remaining` : 'Goal reached — great job!'}
            </p>
            <Link to="/calories" className="text-[11px] font-semibold text-[#B8902E] hover:underline inline-flex items-center gap-0.5">
              Log food <ArrowRight size={10} />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Today's metrics — 2x2 */}
      <div className="px-5 mt-5">
        <SectionHeader title="Today's Progress" />
        <div className="grid grid-cols-2 gap-3 mt-3">
          <MetricCard image="https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600&q=80" icon={<Footprints size={18} className="text-[#B8902E]" />} label="Steps Today" value={todaySteps.toLocaleString()} sub={`goal ${stepGoal.toLocaleString()}`} progress={stepPct} />
          <MetricCard image="https://images.unsplash.com/photo-1575052814074-c05122e0a17a?w=600&q=80" icon={<Flame size={18} className="text-[#B8902E]" />} label="Calories Left" value={`${caloriesLeft}`} sub="kcal remaining" />
          <MetricCard image="https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=600&q=80" icon={<Zap size={18} className="text-[#B8902E]" />} label="Burned" value={`${totalBurned}`} sub="kcal today" />
          <MetricCard image="https://images.unsplash.com/photo-1665997960421-40f7ff374166?w=600&q=80" icon={<ActivityIcon size={18} className="text-[#B8902E]" />} label="Active Min" value={`${activeMinutes}`} sub="of 30 min goal" progress={activePct} />
        </div>
      </div>

      {/* Quick log shortcuts */}
      <div className="px-5 mt-4">
        <div className="flex gap-2.5">
          <QuickLog to="/calories" icon={Utensils} label="Log Meal" />
          <QuickLog to="/fitness" icon={Dumbbell} label="Log Workout" />
          <QuickLog to="/activity" icon={Footprints} label="Log Steps" />
        </div>
      </div>

      {/* Quick access — feature grid */}
      <div className="px-5 mt-5">
        <SectionHeader title="Explore" />
        <div className="grid grid-cols-2 gap-3 mt-3">
          <FeatureTile to="/calories" title="Calorie Counter" desc="Log meals by photo" image="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80" />
          <FeatureTile to="/clothing" title="Gear Analyzer" desc="Scan sports clothing" image="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&q=80" />
          <FeatureTile to="/fitness" title="Calorie Burn" desc="Activity estimates" image="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80" />
          <FeatureTile to="/activity" title="Activity Tracking" desc="Steps & distance" image="https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&q=80" />
          <FeatureTile to="/metabolic" title="Metabolic Calc" desc="BMR & TDEE goals" image="https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=400&q=80" />
          <FeatureTile to="/community" title="Community" desc="Connect & share" image="https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&q=80" />
        </div>
      </div>

      {/* Premium strip */}
      {!subStatus.isPremium && (
        <div className="px-5 mt-4">
          <Link to="/pricing" className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#E0BF66] to-[#C9962C] p-3.5 shadow-lg shadow-black/10 border border-[#B8871E]">
            <div className="p-2 rounded-xl bg-white/30 backdrop-blur"><Crown size={18} className="text-[#1F1A14]" /></div>
            <div className="flex-1">
              <p className="text-sm font-bold font-heading text-[#1F1A14]">Go Premium</p>
              <p className="text-[11px] text-[#4B4032]">Unlimited AI · 7-day free trial</p>
            </div>
            <ChevronRight size={18} className="text-[#1F1A14]" />
          </Link>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[#E0BF66] to-[#C9962C]" />
      <h2 className="text-base font-bold tracking-tight font-heading">{title}</h2>
    </div>
  );
}

function MetricCard({ image, icon, label, value, sub, progress }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl overflow-hidden h-36 shadow-sm shadow-black/10 border border-[#E5DDD1]"
    >
      <img src={image} alt="Woman exercising" className="absolute inset-0 w-full h-full object-cover opacity-20" />
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(255, 248, 220, 0.20)' }} />
      <div className="relative p-3.5 flex flex-col justify-between h-full">
        <div>
          <div className="w-9 h-9 rounded-xl bg-white/70 backdrop-blur-sm flex items-center justify-center mb-2.5 shadow-sm shadow-black/5">
            {icon}
          </div>
          <p className="text-2xl font-bold tracking-tight leading-none font-heading text-[#0A0A0A] drop-shadow-sm">{value}</p>
          <p className="text-xs text-[#404040] mt-1 font-semibold drop-shadow-sm">{label}</p>
          <p className="text-[10px] text-[#737373] mt-0.5 drop-shadow-sm">{sub}</p>
        </div>
        {progress !== undefined && (
          <div className="h-1.5 rounded-full bg-white/50 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-[#E0BF66] to-[#C9962C]"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function QuickLog({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#E0BF66] to-[#C9962C] border border-[#B8871E] shadow-sm shadow-black/10 py-3 hover:opacity-90 transition-opacity"
    >
      <div className="p-1.5 rounded-lg bg-white/30">
        <Icon size={14} className="text-[#1F1A14]" />
      </div>
      <span className="text-xs font-semibold text-[#1F1A14]">{label}</span>
    </Link>
  );
}

function FeatureTile({ to, title, desc, image }) {
  return (
    <Link to={to} className="group relative rounded-2xl overflow-hidden border border-[#E0E0E0] block h-32 shadow-sm shadow-black/5 hover:shadow-md hover:shadow-black/15 transition-shadow">
      <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-sm font-bold text-white font-heading leading-tight">{title}</p>
        <p className="text-[10px] text-white/80 mt-0.5">{desc}</p>
      </div>
    </Link>
  );
}