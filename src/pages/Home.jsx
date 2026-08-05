import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  ArrowRight,
  Bell,
  BrainCircuit,
  Crown,
  Droplets,
  Flame,
  Footprints,
  HeartPulse,
  Leaf,
  MessageCircle,
  ScanLine,
  Shirt,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { getLast7Days, getTodayStr } from '@/lib/dateUtils';
import { getSubscriptionStatus } from '@/lib/subscription';
import { useUsage } from '@/hooks/useUsage';

const FEATURE_CARDS = [
  {
    to: '/calories',
    eyebrow: 'AI FOOD ANALYSIS',
    title: 'Scan your next meal',
    description: 'Photo, voice, or text — get calories and macros in seconds.',
    icon: ScanLine,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&q=86',
    gradient: 'from-[#ff7a45] via-[#ff9d63] to-[#ffc58f]',
  },
  {
    to: '/clothing',
    eyebrow: 'MATERIAL CHECK',
    title: 'Know what you wear',
    description: 'Identify fabrics and get practical care and sustainability insights.',
    icon: Shirt,
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&q=86',
    gradient: 'from-[#6947d6] via-[#8a6de7] to-[#bfaeff]',
  },
  {
    to: '/fitness',
    eyebrow: 'MOVE & BURN',
    title: 'Choose today’s activity',
    description: 'Estimate calorie burn and discover guided workouts that suit you.',
    icon: HeartPulse,
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&q=86',
    gradient: 'from-[#176d5b] via-[#2c947d] to-[#7bd3b0]',
  },
];

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

      setTodayCalories(foodEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0));
      setTodayBurned(workouts.reduce((sum, workout) => sum + (workout.calories_burned || 0), 0));
      setTodaySteps(activityLogs.reduce((sum, log) => sum + (log.steps || 0), 0));
      setActivityBurned(activityLogs.reduce((sum, log) => sum + (log.calories_burned_activity || 0), 0));
      setActiveMinutes(activityLogs.reduce((sum, log) => sum + (log.active_minutes || 0), 0));
      if (metabo.length) setProfile(metabo[0]);
      setSubStatus(sub);

      const weekly = await Promise.all(
        getLast7Days().map(async (day) => {
          const entries = await base44.entities.FoodEntry.filter({ entry_date: day.date });
          return { ...day, calories: entries.reduce((sum, entry) => sum + (entry.calories || 0), 0) };
        }),
      );
      setWeeklyData(weekly);
    } catch (error) {
      console.error('Unable to load the home dashboard', error);
    } finally {
      setLoading(false);
    }
  }

  const firstName = user?.full_name?.split(' ')[0] || 'Veg';
  const targetCalories = profile?.target_calories || 2000;
  const caloriesLeft = Math.max(targetCalories - todayCalories, 0);
  const totalBurned = todayBurned + activityBurned;
  const calorieProgress = Math.min(Math.round((todayCalories / targetCalories) * 100), 100);
  const stepProgress = Math.min(Math.round((todaySteps / 10000) * 100), 100);
  const waterLiters = Math.min((todayCalories / 2000) * 2 + 0.4, 3).toFixed(1);

  const weekAverage = useMemo(() => {
    if (!weeklyData.length) return 0;
    return Math.round(weeklyData.reduce((sum, day) => sum + day.calories, 0) / weeklyData.length);
  }, [weeklyData]);

  if (loading) {
    return <PremiumHomeSkeleton />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f4ef] pb-10 text-[#171a17]">
      <div className="relative overflow-hidden bg-[#10241f] px-5 pb-8 pt-11 text-white sm:px-7">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#ff9c62]/20 blur-3xl" />
        <div className="absolute -bottom-28 -left-14 h-72 w-72 rounded-full bg-[#6dd7b0]/15 blur-3xl" />
        <div className="relative mx-auto max-w-xl">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-white/10 shadow-[0_10px_30px_rgba(0,0,0,.18)] backdrop-blur-xl">
                <Leaf size={21} className="text-[#a7f1d2]" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">3 in 1</p>
                <p className="text-[17px] font-bold tracking-[-0.02em]">Healthy Choice</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Notifications"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/10 text-white/80 backdrop-blur-xl transition hover:bg-white/15"
              >
                <Bell size={18} />
              </button>
              <Link
                to="/profile"
                aria-label="Open profile"
                className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#ffb37e] to-[#ff7043] text-sm font-extrabold shadow-lg shadow-black/20"
              >
                {firstName[0]?.toUpperCase()}
              </Link>
            </div>
          </header>

          <div className="mt-9 grid items-end gap-6 sm:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[11px] font-semibold text-[#c9f8e5] backdrop-blur-xl">
                <Sparkles size={13} /> Your daily wellness space
              </div>
              <h1 className="max-w-md text-[34px] font-black leading-[1.03] tracking-[-0.045em] sm:text-[40px]">
                Good morning,
                <span className="block text-[#ffc094]">{firstName}.</span>
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-white/65">
                Small choices build strong routines. Let’s make today feel good.
              </p>
            </div>

            <Link
              to="/coach"
              className="group inline-flex w-fit items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[#17342c] shadow-[0_18px_45px_rgba(0,0,0,.2)] transition hover:-translate-y-0.5"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e9fff6] text-[#168164]">
                <MessageCircle size={18} />
              </span>
              Ask your AI coach
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-2.5">
            <HeroMetric icon={Footprints} label="Steps" value={todaySteps.toLocaleString()} detail={`${stepProgress}% goal`} />
            <HeroMetric icon={Flame} label="Left" value={caloriesLeft.toLocaleString()} detail="kcal today" />
            <HeroMetric icon={Trophy} label="Streak" value="7" detail="days strong" />
          </div>
        </div>
      </div>

      <main className="mx-auto -mt-3 max-w-xl space-y-7 px-5 pb-5 sm:px-7">
        <section className="rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-[0_20px_60px_rgba(48,40,30,.09)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#a46d4f]">Today’s balance</p>
              <h2 className="mt-1 text-xl font-black tracking-[-0.03em]">Your day at a glance</h2>
            </div>
            <Link to="/activity" className="rounded-full bg-[#f4f0e9] px-3 py-1.5 text-xs font-bold text-[#5f625f]">
              View details
            </Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-[1.2fr_.8fr]">
            <div className="relative overflow-hidden rounded-[26px] bg-[#fff3e9] p-5">
              <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#ff9a5f]/15" />
              <div className="relative flex items-center gap-5">
                <ProgressRing value={calorieProgress} />
                <div>
                  <p className="text-xs font-semibold text-[#8e715e]">Calories eaten</p>
                  <p className="mt-1 text-3xl font-black tracking-[-0.04em]">{todayCalories.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-[#8e715e]">of {targetCalories.toLocaleString()} kcal</p>
                </div>
              </div>
              <div className="relative mt-5 flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
                <span className="text-xs font-semibold text-[#69594f]">7-day average</span>
                <span className="text-sm font-extrabold text-[#2d302d]">{weekAverage.toLocaleString()} kcal</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
              <MiniInsight icon={Zap} label="Active" value={`${activeMinutes} min`} tint="mint" />
              <MiniInsight icon={Droplets} label="Water" value={`${waterLiters} L`} tint="blue" />
              <MiniInsight icon={Flame} label="Burned" value={`${totalBurned} kcal`} tint="orange" className="col-span-2 sm:col-span-1" />
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8f7a69]">Smart tools</p>
              <h2 className="mt-1 text-[23px] font-black tracking-[-0.035em]">What would help today?</h2>
            </div>
          </div>
          <div className="space-y-3">
            {FEATURE_CARDS.map((feature) => (
              <FeatureCard key={feature.to} {...feature} />
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <Link
            to="/metabolic"
            className="group rounded-[26px] border border-[#e6dfd4] bg-[#efe9ff] p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/75 text-[#6745cf] shadow-sm">
              <BrainCircuit size={20} />
            </span>
            <p className="mt-5 text-base font-black tracking-[-0.025em]">Metabolic calculator</p>
            <p className="mt-1 text-xs leading-5 text-[#6d6481]">Understand BMR, TDEE and daily targets.</p>
            <ArrowRight size={17} className="mt-4 text-[#6745cf] transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/community"
            className="group rounded-[26px] border border-[#d9e8df] bg-[#e8f6ee] p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/75 text-[#23775e] shadow-sm">
              <MessageCircle size={20} />
            </span>
            <p className="mt-5 text-base font-black tracking-[-0.025em]">Community support</p>
            <p className="mt-1 text-xs leading-5 text-[#567164]">Share wins, ask questions and stay motivated.</p>
            <ArrowRight size={17} className="mt-4 text-[#23775e] transition-transform group-hover:translate-x-1" />
          </Link>
        </section>

        <UsageSection material={material} calorie={calorie} />

        {!subStatus.isPremium && (
          <section className="relative overflow-hidden rounded-[30px] bg-[#171b19] p-6 text-white shadow-[0_24px_65px_rgba(28,25,20,.2)]">
            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#ff8a52]/25 blur-2xl" />
            <div className="absolute -bottom-20 left-14 h-44 w-44 rounded-full bg-[#6ce0b1]/15 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 text-[#ffd1b5]">
                <Crown size={18} />
                <span className="text-xs font-bold uppercase tracking-[0.18em]">Premium</span>
              </div>
              <h2 className="mt-3 max-w-xs text-2xl font-black leading-tight tracking-[-0.04em]">
                Deeper insights. A plan made for you.
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-white/65">
                Unlock unlimited AI tools, advanced progress tracking, and a more personal wellness journey.
              </p>
              <Link
                to="/pricing"
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#ffb37e] px-5 py-3 text-sm font-extrabold text-[#2e241e] transition hover:bg-[#ffc49d]"
              >
                Start 7-day free trial <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        )}

        <p className="px-3 text-center text-[10px] leading-5 text-[#969087]">
          AI-generated calorie and nutrition estimates are approximations and are not medical advice.
        </p>
      </main>
    </div>
  );
}

function HeroMetric({ icon: Icon, label, value, detail }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-1.5 text-white/55">
        <Icon size={13} />
        <span className="text-[10px] font-semibold">{label}</span>
      </div>
      <p className="mt-2 text-lg font-extrabold tracking-[-0.03em]">{value}</p>
      <p className="mt-0.5 text-[9px] text-white/45">{detail}</p>
    </div>
  );
}

function ProgressRing({ value }) {
  return (
    <div
      className="relative grid h-[92px] w-[92px] shrink-0 place-items-center rounded-full"
      style={{ background: `conic-gradient(#ff7c45 ${value * 3.6}deg, rgba(255,124,69,.12) 0deg)` }}
    >
      <div className="grid h-[72px] w-[72px] place-items-center rounded-full bg-[#fff9f4] shadow-inner">
        <div className="text-center">
          <p className="text-xl font-black tracking-[-0.04em]">{value}%</p>
          <p className="text-[9px] font-semibold text-[#9a7a67]">of goal</p>
        </div>
      </div>
    </div>
  );
}

function MiniInsight({ icon: Icon, label, value, tint, className = '' }) {
  const styles = {
    mint: 'bg-[#e9f8f1] text-[#267760]',
    blue: 'bg-[#ebf5fb] text-[#397b9e]',
    orange: 'bg-[#fff0e7] text-[#bd6339]',
  };
  return (
    <div className={`rounded-[22px] p-4 ${styles[tint]} ${className}`}>
      <Icon size={17} />
      <p className="mt-4 text-[10px] font-semibold opacity-70">{label}</p>
      <p className="mt-1 text-base font-black tracking-[-0.025em]">{value}</p>
    </div>
  );
}

function FeatureCard({ to, eyebrow, title, description, icon: Icon, image, gradient }) {
  return (
    <Link
      to={to}
      className="group relative block min-h-[174px] overflow-hidden rounded-[30px] shadow-[0_18px_45px_rgba(42,34,26,.12)] transition hover:-translate-y-0.5"
    >
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/46 to-black/10" />
      <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${gradient}`} />
      <div className="relative flex min-h-[174px] flex-col justify-between p-5 text-white">
        <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur-md">
          <Icon size={20} />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">{eyebrow}</p>
          <div className="mt-1 flex items-end justify-between gap-3">
            <div>
              <h3 className="text-xl font-black tracking-[-0.035em]">{title}</h3>
              <p className="mt-1 max-w-[280px] text-xs leading-5 text-white/68">{description}</p>
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#20231f] transition-transform group-hover:translate-x-1">
              <ArrowRight size={17} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function UsageSection({ material, calorie }) {
  return (
    <section className="rounded-[28px] border border-[#e6dfd4] bg-[#fbfaf7] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8f7a69]">AI allowance</p>
          <h2 className="mt-1 text-lg font-black tracking-[-0.025em]">This week’s usage</h2>
        </div>
        <Target size={20} className="text-[#ca754b]" />
      </div>
      <div className="mt-5 space-y-4">
        <UsageRow label="Calorie analyses" usage={calorie} color="#ff7c45" />
        <UsageRow label="Material checks" usage={material} color="#7253d5" />
      </div>
    </section>
  );
}

function UsageRow({ label, usage, color }) {
  const total = Math.max(usage?.limit || 5, 1);
  const remaining = Math.max(usage?.remaining ?? total, 0);
  const used = Math.max(total - remaining, 0);
  const percentage = Math.min((used / total) * 100, 100);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-bold text-[#4c4e4b]">{label}</span>
        <span className="font-semibold text-[#8b887f]">{remaining} of {total} left</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#ebe7df]">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function PremiumHomeSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-[#f7f4ef]">
      <div className="h-[340px] bg-[#10241f]" />
      <div className="mx-auto -mt-8 max-w-xl space-y-5 px-5">
        <div className="h-64 rounded-[30px] bg-white" />
        <div className="h-44 rounded-[30px] bg-white" />
        <div className="h-44 rounded-[30px] bg-white" />
      </div>
    </div>
  );
}
