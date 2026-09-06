import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, Leaf, ArrowRight, Crown, Flame, Footprints, Activity as ActivityIcon, Zap, Sparkles, ChevronRight } from 'lucide-react';
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
  const caloriesLeft = Math.max(targetCalories - todayCalories, 0);
  const totalBurned = todayBurned + activityBurned;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFF0F5]">
        <div className="w-10 h-10 border-4 border-pink-200 border-t-[#FF149C] rounded-full animate-spin" />
      </div>
    );
  }

  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-[#FFF0F5] text-[#4A0E2E] pb-6">
      {/* Top bar */}
      <div className="px-5 pt-10 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 lg:hidden">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF69B4] to-[#FF149C] flex items-center justify-center shadow-lg shadow-pink-300/60">
            <Leaf size={20} className="text-white" />
          </div>
          <span className="text-base font-bold tracking-tight font-heading">3 in 1 Healthy Choice</span>
        </div>
        <div className="hidden lg:block">
          <h2 className="text-xl font-bold tracking-tight font-heading">Dashboard</h2>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="w-10 h-10 rounded-full bg-white shadow-sm shadow-pink-200/70 border border-[#FFC0D6] flex items-center justify-center text-[#B0407A] hover:bg-[#FFD9E6] transition-colors">
            <Bell size={17} />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF69B4] to-[#FF149C] flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-pink-300/60">
            {firstName[0]?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Compact hero */}
      <div className="px-5 mt-1">
        <div className="relative rounded-3xl overflow-hidden border border-[#FFC0D6] shadow-lg shadow-pink-300/40">
          <img
            src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80"
            alt="Woman stretching"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF149C]/90 via-[#FF149C]/65 to-[#E91E63]/55" />
          <div className="relative p-5 min-h-[170px] flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/25 backdrop-blur-md text-xs font-semibold text-white"
            >
              <Sparkles size={11} /> Your AI wellness companion
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="text-2xl font-bold tracking-tight mt-2 leading-tight text-white font-heading"
            >
              {greeting}, {firstName}.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-sm text-white/90 mt-0.5 font-medium"
            >
              Let's make today count.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex items-center gap-2 mt-3"
            >
              <Link
                to="/coach"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#E91E63] text-xs font-bold shadow-md hover:scale-[1.03] transition-transform"
              >
                Chat with AI Coach <ArrowRight size={14} />
              </Link>
              {!subStatus.isPremium && (
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white text-xs font-semibold"
                >
                  <Crown size={13} /> Premium
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Today's metrics — 2x2 */}
      <div className="px-5 mt-4 grid grid-cols-2 gap-3">
        <MetricCard icon={<Footprints size={18} className="text-[#E91E63]" />} label="Steps Today" value={todaySteps.toLocaleString()} sub="goal 10,000" />
        <MetricCard icon={<Flame size={18} className="text-[#FF149C]" />} label="Calories Left" value={`${caloriesLeft}`} sub="kcal remaining" />
        <MetricCard icon={<Zap size={18} className="text-[#C2185B]" />} label="Burned" value={`${totalBurned}`} sub="kcal today" />
        <MetricCard icon={<ActivityIcon size={18} className="text-[#FF69B4]" />} label="Active Min" value={`${activeMinutes}`} sub="minutes" />
      </div>

      {/* Quick access — feature grid */}
      <div className="px-5 mt-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[#FF69B4] to-[#FF149C]" />
          <h2 className="text-base font-bold tracking-tight font-heading">Explore</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
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
          <Link to="/pricing" className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#FF149C] to-[#E91E63] p-3.5 text-white shadow-lg shadow-pink-300/50">
            <div className="p-2 rounded-xl bg-white/25 backdrop-blur"><Crown size={18} /></div>
            <div className="flex-1">
              <p className="text-sm font-bold font-heading">Go Premium</p>
              <p className="text-[11px] opacity-90">Unlimited AI · 7-day free trial</p>
            </div>
            <ChevronRight size={18} />
          </Link>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon, label, value, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl bg-white border border-[#FFC0D6] p-3.5 shadow-sm shadow-pink-200/60"
    >
      <div className="w-9 h-9 rounded-xl bg-[#FFD9E6] flex items-center justify-center mb-2.5">
        {icon}
      </div>
      <p className="text-2xl font-bold tracking-tight leading-none font-heading">{value}</p>
      <p className="text-xs text-[#B0407A] mt-1 font-semibold">{label}</p>
      <p className="text-[10px] text-[#D67A9E] mt-0.5">{sub}</p>
    </motion.div>
  );
}

function FeatureTile({ to, title, desc, image }) {
  return (
    <Link to={to} className="group relative rounded-2xl overflow-hidden border border-[#FFC0D6] block h-32 shadow-sm shadow-pink-200/60 hover:shadow-md hover:shadow-pink-300/60 transition-shadow">
      <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#4A0E2E]/85 via-[#E91E63]/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-sm font-bold text-white font-heading leading-tight">{title}</p>
        <p className="text-[10px] text-white/80 mt-0.5">{desc}</p>
      </div>
    </Link>
  );
}