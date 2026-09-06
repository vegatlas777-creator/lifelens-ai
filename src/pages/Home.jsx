import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, Leaf, ArrowRight, Crown, Flame, Footprints, Activity as ActivityIcon, Droplets, Zap, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { getTodayStr, getLast7Days } from '@/lib/dateUtils';
import { getSubscriptionStatus } from '@/lib/subscription';
import { useUsage } from '@/hooks/useUsage';
import UsageBanner from '@/components/UsageBanner';

export default function Home() {
  const [todayCalories, setTodayCalories] = useState(0);
  const [todayBurned, setTodayBurned] = useState(0);
  const [todaySteps, setTodaySteps] = useState(0);
  const [activityBurned, setActivityBurned] = useState(0);
  const [activeMinutes, setActiveMinutes] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [profile, setProfile] = useState(null);
  const [subStatus, setSubStatus] = useState({ isPremium: false, loading: true });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { material, calorie } = useUsage();

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

      const days = getLast7Days();
      const weekly = await Promise.all(
        days.map(async (d) => {
          const entries = await base44.entities.FoodEntry.filter({ entry_date: d.date });
          return { ...d, calories: entries.reduce((s, e) => s + (e.calories || 0), 0) };
        })
      );
      setWeeklyData(weekly);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const targetCalories = profile?.target_calories || 2000;
  const caloriesLeft = Math.max(targetCalories - todayCalories, 0);
  const totalBurned = todayBurned + activityBurned;
  const waterLiters = Math.min((todayCalories / 2000) * 2 + 0.4, 3).toFixed(1);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FDF2F2]">
        <div className="w-10 h-10 border-4 border-rose-300/40 border-t-[#C87883] rounded-full animate-spin" />
      </div>
    );
  }

  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-[#FDF2F2] text-[#2D1E1E] pb-10">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-rose-300/30 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-pink-200/40 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-rose-100/50 blur-[120px]" />
      </div>

      {/* Top bar */}
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-10 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 lg:hidden">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E89AA4] to-[#C87883] flex items-center justify-center shadow-lg shadow-rose-300/50">
            <Leaf size={20} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight font-heading">3 in 1 Healthy Choice</span>
        </div>
        <div className="hidden lg:block">
          <h2 className="text-xl font-bold tracking-tight font-heading">Dashboard</h2>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="w-10 h-10 rounded-full bg-white shadow-sm shadow-rose-200/60 border border-[#F0D5D5] flex items-center justify-center text-[#8A6A6A] hover:bg-[#F9E8E8] transition-colors">
            <Bell size={17} />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E89AA4] to-[#C87883] flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-rose-300/50">
            {firstName[0]?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 mt-4">
        <div className="relative rounded-[2rem] overflow-hidden border border-[#F0D5D5] shadow-xl shadow-rose-200/50">
          <img
            src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1600&q=80"
            alt="Woman stretching in a sunlit room"
            className="absolute inset-0 w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#FDF2F2]/85 via-[#FDF2F2]/45 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FDF2F2]/70 via-transparent to-transparent" />

          <div className="relative p-7 sm:p-10 lg:p-14 min-h-[340px] sm:min-h-[400px] flex flex-col justify-between">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-[#F0D5D5] text-xs font-semibold text-[#A85A66]"
              >
                <Sparkles size={12} className="text-[#C87883]" />
                <span>Your AI wellness companion</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mt-4 leading-[1.1] font-heading"
              >
                {greeting}, {firstName}.<br />
                <span className="bg-gradient-to-r from-[#C87883] via-[#A85A66] to-[#8A4F5A] bg-clip-text text-transparent">Let's make today count.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-sm sm:text-base text-[#5A3F3F] mt-3 max-w-md font-medium"
              >
                AI-powered nutrition, fitness, and sustainability insights — all in one premium experience.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3 mt-6"
            >
              <Link
                to="/coach"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#E89AA4] to-[#C87883] text-white text-sm font-semibold shadow-lg shadow-rose-300/50 hover:shadow-rose-300/70 hover:scale-[1.03] transition-all"
              >
                Chat with AI Coach <ArrowRight size={16} />
              </Link>
              {!subStatus.isPremium && (
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/80 backdrop-blur-md border border-[#F0D5D5] text-[#A85A66] text-sm font-semibold hover:bg-white transition-colors"
                >
                  <Crown size={16} className="text-[#C87883]" /> Go Premium
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard icon={<Footprints size={18} className="text-[#C87883]" />} label="Steps Today" value={todaySteps.toLocaleString()} sub="goal 10,000" />
        <MetricCard icon={<Flame size={18} className="text-[#A85A66]" />} label="Calories Left" value={`${caloriesLeft}`} sub="kcal remaining" />
        <MetricCard icon={<Zap size={18} className="text-[#8A4F5A]" />} label="Burned" value={`${totalBurned}`} sub="kcal today" />
        <MetricCard icon={<ActivityIcon size={18} className="text-[#D98C9C]" />} label="Active Min" value={`${activeMinutes}`} sub="minutes" />
      </div>

      {/* Weekly AI Usage */}
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 mt-6">
        <SectionTitle title="Weekly AI Usage" />
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <UsageBanner usage={material} label="Material Checks Remaining" icon={Leaf} />
          <UsageBanner usage={calorie} label="Calorie Analyses Remaining" icon={Flame} />
        </div>
      </div>

      {/* Feature Grid */}
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 mt-8">
        <SectionTitle title="Explore Features" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <FeatureCard to="/calories" title="AI Calorie Counter" desc="Upload a photo or describe your meal and get instant calorie insights." image="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80" delay={0} />
          <FeatureCard to="/clothing" title="Sports Gear Analyzer" desc="Scan sports clothing and get AI performance ratings for your activity." image="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80" delay={0.05} />
          <FeatureCard to="/fitness" title="Activity Calorie Burn" desc="AI-personalized calorie estimates for 13 activities and videos." image="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&q=80" delay={0.1} />
          <FeatureCard to="/activity" title="Activity Tracking" desc="Track steps, distance, and active minutes throughout your day." image="https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&q=80" delay={0.15} />
          <FeatureCard to="/metabolic" title="Metabolic Calculator" desc="Enter your details and get your BMR, TDEE and calorie goals." image="https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=600&q=80" delay={0.2} />
          <FeatureCard to="/coach" title="AI Health Coach" desc="Personal advice, motivation and support from your AI coach." image="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80" delay={0.25} />
        </div>
      </div>

      {/* Today's Progress */}
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 mt-8">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle title="Today's Progress" inline />
          <Link to="/activity" className="text-xs font-medium text-[#A85A66] hover:text-[#C87883] transition-colors">View all →</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <ProgressCard icon={<Flame size={14} className="text-[#C87883]" />} label="Calories Eaten" value={`${todayCalories.toLocaleString()}`} unit="kcal" data={weeklyData.map(d => ({ v: d.calories }))} color="#C87883" />
          <ProgressCard icon={<ActivityIcon size={14} className="text-[#D98C9C]" />} label="Calories Burned" value={`${totalBurned}`} unit="kcal" data={weeklyData.map((d, i) => ({ v: totalBurned * (0.6 + i * 0.06) }))} color="#D98C9C" />
          <ProgressCard icon={<Droplets size={14} className="text-[#E89AA4]" />} label="Water" value={waterLiters} unit="L" data={[1.2, 1.5, 1.3, 1.8, 1.6, 1.9, 2.0].map(v => ({ v }))} color="#E89AA4" />
          <ProgressCard icon={<Zap size={14} className="text-[#A85A66]" />} label="Active Minutes" value={`${activeMinutes}`} unit="min" data={[20, 35, 28, 40, 32, 45, 50].map(v => ({ v }))} color="#A85A66" />
        </div>
      </div>

      {/* Premium upsell */}
      {!subStatus.isPremium && (
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 mt-8">
          <div className="relative rounded-[2rem] overflow-hidden border border-[#F0D5D5] shadow-xl shadow-rose-200/50">
            <img src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1600&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#FDF2F2]/90 via-[#FDF2F2]/60 to-[#FDF2F2]/30" />
            <div className="relative p-7 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div>
                <p className="text-xl sm:text-2xl font-bold flex items-center gap-2 font-heading">Unlock Premium <Crown size={20} className="text-[#C87883]" /></p>
                <p className="text-sm text-[#5A3F3F] mt-2 max-w-md font-medium">Unlimited AI analyses, personalized plans, advanced analytics, and priority coaching.</p>
              </div>
              <Link to="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#E89AA4] to-[#C87883] text-white text-sm font-semibold shadow-lg shadow-rose-300/50 hover:scale-[1.03] transition-transform whitespace-nowrap">
                Try 7 Days Free <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 mt-8">
        <p className="text-[11px] text-[#B59A9A] text-center leading-relaxed">
          ⚠️ Calorie and nutrition estimates are approximations and not medical advice.
        </p>
      </div>
    </div>
  );
}

function SectionTitle({ title, inline }) {
  return (
    <div className={`flex items-center gap-2 ${inline ? '' : 'mb-4'}`}>
      <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[#E89AA4] to-[#C87883]" />
      <h2 className="text-base sm:text-lg font-bold tracking-tight font-heading">{title}</h2>
    </div>
  );
}

function MetricCard({ icon, label, value, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl bg-white border border-[#F0D5D5] p-4 overflow-hidden shadow-sm shadow-rose-200/40 hover:shadow-md hover:shadow-rose-200/60 transition-shadow"
    >
      <div className="relative">
        <div className="w-9 h-9 rounded-xl bg-[#F9E8E8] border border-[#F0D5D5] flex items-center justify-center mb-3">
          {icon}
        </div>
        <p className="text-2xl font-bold tracking-tight leading-none font-heading">{value}</p>
        <p className="text-xs text-[#8A6A6A] mt-1.5 font-semibold">{label}</p>
        <p className="text-[10px] text-[#B59A9A] mt-0.5">{sub}</p>
      </div>
    </motion.div>
  );
}

function FeatureCard({ to, title, desc, image, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -6 }}
    >
      <Link to={to} className="group relative rounded-3xl overflow-hidden border border-[#F0D5D5] block h-full shadow-sm shadow-rose-200/50 hover:shadow-lg hover:shadow-rose-200/70 transition-shadow">
        <div className="relative h-44 sm:h-52 overflow-hidden">
          <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FDF2F2] via-[#FDF2F2]/40 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-base font-bold tracking-tight font-heading text-[#2D1E1E]">{title}</p>
          <p className="text-xs text-[#5A3F3F] mt-1 leading-snug">{desc}</p>
          <div className="flex items-center gap-1 mt-3 text-[#C87883] text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            Open <ArrowRight size={12} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function ProgressCard({ icon, label, value, unit, data, color }) {
  return (
    <div className="rounded-2xl bg-white border border-[#F0D5D5] p-4 shadow-sm shadow-rose-200/40">
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon}
        <span className="text-xs text-[#8A6A6A] font-semibold">{label}</span>
      </div>
      <p className="text-xl font-bold tracking-tight leading-none font-heading">{value} <span className="text-[10px] font-normal text-[#B59A9A]">{unit}</span></p>
      <div className="h-10 mt-2 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}