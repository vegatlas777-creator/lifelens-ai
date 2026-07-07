import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, Leaf, ArrowRight, Crown, Flame, Footprints, Activity as ActivityIcon, Droplets, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-[#FDDDBD] border-t-[#FF9F43] rounded-full animate-spin" />
      </div>
    );
  }

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-[#FDFBF8] pb-4">
      {/* Header */}
      <div className="px-5 pt-12 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FDDDBD] flex items-center justify-center">
            <Leaf size={18} className="text-[#E8821E]" />
          </div>
          <span className="text-lg font-bold text-[#1A1A1A]">3 in 1 Healthy Choice</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-white border border-[#FDDDBD] flex items-center justify-center text-[#666]">
            <Bell size={17} />
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FFD5A8] to-[#FF9F43] flex items-center justify-center text-white text-sm font-bold">
            {firstName[0]?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="px-5 mt-2">
        <h1 className="text-2xl font-bold text-[#1A1A1A] leading-tight">
          Good morning, {firstName}! <br /> You've got this! ✨
        </h1>
        <p className="text-sm text-[#666] mt-2">Your AI coach is here to support your healthy journey.</p>
        <Link
          to="/coach"
          className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 rounded-full bg-[#FFD5A8] text-[#1A1A1A] text-sm font-semibold"
        >
          Chat with AI Coach <ArrowRight size={16} />
        </Link>
      </div>

      {/* Metrics Bar */}
      <div className="px-5 mt-5 grid grid-cols-3 gap-3">
        <MetricItem
          icon={<Footprints size={16} className="text-[#FB923C]" />}
          label="Steps"
          value={todaySteps.toLocaleString()}
          sub="/ 10,000"
        />
        <MetricItem
          icon={<Flame size={16} className="text-[#FB923C]" />}
          label="Calories Left"
          value={`${caloriesLeft}`}
          sub="kcal"
        />
        <MetricItem
          icon={<Zap size={16} className="text-[#FB923C]" />}
          label="Streak"
          value="7"
          sub="days"
        />
      </div>

      {/* Weekly AI Usage */}
      <div className="px-5 mt-5">
        <h2 className="text-base font-bold text-[#1A1A1A] mb-3">Weekly AI Usage</h2>
        <div className="space-y-2">
          <UsageBanner usage={material} label="Material Checks Remaining" icon={Leaf} />
          <UsageBanner usage={calorie} label="Calorie Analyses Remaining" icon={Flame} />
        </div>
      </div>

      {/* Feature Grid */}
      <div className="px-5 mt-5 grid grid-cols-2 gap-3">
        <FeatureCard
          to="/calories"
          title="AI Calorie Counter"
          desc="Upload a photo or describe your meal and get instant calorie insights."
          image="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80"
        />
        <FeatureCard
          to="/clothing"
          title="Clothing Material Analyzer"
          desc="Upload clothing label or fabric photo and get AI insights."
          image="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&q=80"
        />
        <FeatureCard
          to="/fitness"
          title="Activity Calorie Burn"
          desc="AI-personalized calorie estimates for 13 activities and YouTube fitness videos."
          image="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&q=80"
        />
        <FeatureCard
          to="/metabolic"
          title="AI Metabolic Rate Calculator"
          desc="Enter your details and get your BMR, TDEE and calorie goals."
          image="https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=500&q=80"
        />
        <FeatureCard
          to="/coach"
          title="AI Coach Always With You"
          desc="Get personal advice, motivation and support from your AI coach."
          image="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&q=80"
        />
        <FeatureCard
          to="/community"
          title="Community & Support"
          desc="Join discussions, share progress, and connect with others on the same journey."
          image="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&q=80"
        />
      </div>

      {/* Today's Progress */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[#1A1A1A]">Today's Progress</h2>
          <Link to="/activity" className="text-xs font-medium text-[#666]">View all</Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ProgressCard
            icon={<Flame size={14} className="text-[#FB923C]" />}
            label="Calories Eaten"
            value={`${todayCalories.toLocaleString()}`}
            unit="kcal"
            data={weeklyData.map(d => ({ v: d.calories }))}
            color="#FB923C"
          />
          <ProgressCard
            icon={<ActivityIcon size={14} className="text-[#4ADE80]" />}
            label="Calories Burned"
            value={`${totalBurned}`}
            unit="kcal"
            data={weeklyData.map((d, i) => ({ v: totalBurned * (0.6 + i * 0.06) }))}
            color="#4ADE80"
          />
          <ProgressCard
            icon={<Droplets size={14} className="text-[#38BDF8]" />}
            label="Water"
            value={waterLiters}
            unit="L"
            data={[1.2, 1.5, 1.3, 1.8, 1.6, 1.9, 2.0].map(v => ({ v }))}
            color="#38BDF8"
          />
          <ProgressCard
            icon={<Zap size={14} className="text-[#A78BFA]" />}
            label="Active Minutes"
            value={`${activeMinutes}`}
            unit="min"
            data={[20, 35, 28, 40, 32, 45, 50].map(v => ({ v }))}
            color="#A78BFA"
          />
        </div>
      </div>

      {/* Premium Card */}
      {!subStatus.isPremium && (
        <div className="px-5 mt-6">
          <div className="relative overflow-hidden rounded-3xl">
            <img
              src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&q=80"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/85 via-[#1A1A1A]/70 to-transparent" />
            <div className="relative p-5 text-white">
              <p className="text-lg font-bold flex items-center gap-1.5">Go Premium 👑</p>
              <p className="text-xs opacity-90 mt-1 max-w-[200px]">Unlock personalized plans, advanced insights and exclusive workouts.</p>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 rounded-full bg-[#FFD5A8] text-[#1A1A1A] text-sm font-semibold"
              >
                Try 7 Days Free <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="px-5 mt-5">
        <p className="text-[11px] text-[#999] text-center leading-relaxed">
          ⚠️ Calorie and nutrition estimates are approximations and not medical advice.
        </p>
      </div>
    </div>
  );
}

function MetricItem({ icon, label, value, sub }) {
  return (
    <div className="rounded-2xl bg-white p-3 text-center border border-[#F5EFE6]">
      <div className="flex items-center justify-center gap-1 mb-1">
        {icon}
        <span className="text-[10px] text-[#666] font-medium">{label}</span>
      </div>
      <p className="text-lg font-bold text-[#1A1A1A] leading-tight">{value}</p>
      <p className="text-[10px] text-[#999]">{sub}</p>
    </div>
  );
}

function FeatureCard({ to, title, desc, image }) {
  return (
    <Link to={to} className="rounded-3xl bg-white overflow-hidden border border-[#F5EFE6] block group">
      <div className="relative h-32 overflow-hidden">
        <div className="absolute inset-0 bg-[#FDDDBD]" />
        <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="p-3">
        <p className="text-sm font-bold text-[#1A1A1A] leading-tight">{title}</p>
        <p className="text-[11px] text-[#666] mt-1 leading-snug">{desc}</p>
      </div>
    </Link>
  );
}

function ProgressCard({ icon, label, value, unit, data, color }) {
  return (
    <div className="rounded-2xl bg-white p-3 border border-[#F5EFE6]">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] text-[#666] font-medium">{label}</span>
      </div>
      <p className="text-lg font-bold text-[#1A1A1A] leading-tight">{value} <span className="text-[10px] font-normal text-[#999]">{unit}</span></p>
      <div className="h-8 mt-1 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}