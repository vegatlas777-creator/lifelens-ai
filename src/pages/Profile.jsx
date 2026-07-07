import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { User, Moon, Sun, LogOut, Activity, Flame, Dumbbell, ChevronRight, Crown } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { getTodayStr } from '@/lib/dateUtils';
import { getSubscriptionStatus } from '@/lib/subscription';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [todayStats, setTodayStats] = useState({ calories: 0, burned: 0, workouts: 0 });
  const [dark, setDark] = useState(false);
  const [subStatus, setSubStatus] = useState({ isPremium: false, loading: true });

  useEffect(() => {
    loadData();
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  async function loadData() {
    try {
      const me = await base44.auth.me();
      setUser(me);
      const today = getTodayStr();
      const [food, workouts, profiles, sub] = await Promise.all([
        base44.entities.FoodEntry.filter({ entry_date: today }),
        base44.entities.WorkoutLog.filter({ completed_date: today }),
        base44.entities.MetabolicProfile.list('-created_date', 1),
        getSubscriptionStatus(),
      ]);
      setTodayStats({
        calories: food.reduce((s, e) => s + (e.calories || 0), 0),
        burned: workouts.reduce((s, w) => s + (w.calories_burned || 0), 0),
        workouts: workouts.length,
      });
      if (profiles.length) setProfile(profiles[0]);
      setSubStatus(sub);
    } catch (e) { console.error(e); }
  }

  function toggleDark() {
    const newDark = !dark;
    setDark(newDark);
    if (newDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }

  return (
    <div className="pb-4">
      <PageHeader title="Profile" icon={User} />

      <div className="px-5 mt-2">
        {/* User card */}
        <div className="rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 text-white p-6 flex items-center gap-4 shadow-lg">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold">
            {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold">{user?.full_name || 'User'}</p>
            <p className="text-sm opacity-90">{user?.email}</p>
          </div>
          {subStatus.isPremium && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-bold">
              <Crown size={12} /> PRO
            </div>
          )}
        </div>

        {/* Subscription card */}
        <div className="mt-4">
          {subStatus.isPremium ? (
            <div className="rounded-2xl bg-card border border-primary/30 p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Crown size={20} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Premium Active</p>
                <p className="text-xs text-muted-foreground">{subStatus.subscription?.billing_cycle === 'annual' ? 'Annual plan' : 'Monthly plan'}</p>
              </div>
            </div>
          ) : (
            <Link to="/pricing" className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 flex items-center gap-3 shadow-md">
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur">
                <Crown size={20} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Upgrade to Premium</p>
                <p className="text-xs opacity-90">7-day free trial</p>
              </div>
              <ChevronRight size={18} />
            </Link>
          )}
        </div>

        {/* Today's stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <StatBox icon={Flame} value={Math.round(todayStats.calories)} label="kcal eaten" color="text-orange-500" />
          <StatBox icon={Activity} value={todayStats.burned} label="kcal burned" color="text-primary" />
          <StatBox icon={Dumbbell} value={todayStats.workouts} label="workouts" color="text-blue-500" />
        </div>

        {/* Metabolic info */}
        {profile && (
          <div className="mt-4 rounded-2xl bg-card border border-border p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">METABOLIC PROFILE</p>
            <div className="grid grid-cols-2 gap-y-3">
              <Info label="BMR" value={`${profile.bmr} kcal`} />
              <Info label="TDEE" value={`${profile.tdee} kcal`} />
              <Info label="Target" value={`${profile.target_calories} kcal`} />
              <Info label="Goal" value={profile.goal === 'loss' ? 'Weight Loss' : profile.goal === 'gain' ? 'Weight Gain' : 'Maintenance'} />
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="mt-4 rounded-2xl bg-card border border-border divide-y divide-border">
          <button onClick={toggleDark} className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
            <div className="p-2 rounded-xl bg-muted">
              {dark ? <Moon size={18} /> : <Sun size={18} />}
            </div>
            <span className="flex-1 text-left text-sm font-medium">Dark Mode</span>
            <div className={`w-10 h-6 rounded-full transition-colors ${dark ? 'bg-primary' : 'bg-muted'}`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-transform mt-0.5 ${dark ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
          </button>
          <Link to="/metabolic" className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
            <div className="p-2 rounded-xl bg-muted"><Activity size={18} /></div>
            <span className="flex-1 text-left text-sm font-medium">Metabolic Calculator</span>
            <ChevronRight size={18} className="text-muted-foreground" />
          </Link>
          <Link to="/pricing" className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
            <div className="p-2 rounded-xl bg-muted"><Crown size={18} /></div>
            <span className="flex-1 text-left text-sm font-medium">Subscription & Pricing</span>
            <ChevronRight size={18} className="text-muted-foreground" />
          </Link>
        </div>

        {/* Logout */}
        <button
          onClick={() => base44.auth.logout('/login')}
          className="w-full mt-4 rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive py-3.5 font-medium text-sm flex items-center justify-center gap-2"
        >
          <LogOut size={16} /> Log Out
        </button>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">3 in 1 Healthy Choice · v2.0</p>
          <p className="text-[10px] text-muted-foreground/70 mt-1">All estimates are approximations and not medical advice.</p>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, value, label, color }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-3 text-center">
      <Icon size={18} className={`${color} mx-auto mb-1`} />
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold text-sm">{value}</p>
    </div>
  );
}