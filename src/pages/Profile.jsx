import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { User, LogOut, Activity, Flame, Dumbbell, ChevronRight, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTodayStr } from '@/lib/dateUtils';
import { getSubscriptionStatus } from '@/lib/subscription';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [todayStats, setTodayStats] = useState({ calories: 0, burned: 0, workouts: 0 });
  const [subStatus, setSubStatus] = useState({ isPremium: false, loading: true });

  useEffect(() => {
    loadData();
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

  return (
    <div className="min-h-screen bg-[#0A1628] pb-4">
      <div className="px-5 pt-12 pb-3">
        <h1 className="text-2xl font-bold text-[#FFFFFF]">Profile</h1>
      </div>

      <div className="px-5 mt-2">
        {/* User card */}
        <div className="relative overflow-hidden rounded-3xl">
          <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2563EB]/85 to-[#3B82F6]/70" />
          <div className="relative p-6 flex items-center gap-4 text-white">
            <div className="w-16 h-16 rounded-full bg-white/25 backdrop-blur flex items-center justify-center text-2xl font-bold">
              {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold">{user?.full_name || 'User'}</p>
              <p className="text-sm opacity-90">{user?.email}</p>
            </div>
            {subStatus.isPremium && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/25 backdrop-blur text-xs font-bold">
                <Crown size={12} /> PRO
              </div>
            )}
          </div>
        </div>

        {/* Today's stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <StatBox icon={Flame} value={Math.round(todayStats.calories)} label="kcal eaten" color="text-blue-500" />
          <StatBox icon={Activity} value={todayStats.burned} label="kcal burned" color="text-[#2563EB]" />
          <StatBox icon={Dumbbell} value={todayStats.workouts} label="workouts" color="text-blue-500" />
        </div>

        {/* Subscription card */}
        <div className="mt-4">
          {subStatus.isPremium ? (
            <div className="rounded-2xl bg-white/5 border border-[#2563EB]/30 p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#1E293B]">
                <Crown size={20} className="text-[#3B82F6]" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-[#FFFFFF]">Premium Active</p>
                <p className="text-xs text-[#C7D2FE]">{subStatus.subscription?.billing_cycle === 'annual' ? 'Annual plan' : 'Monthly plan'}</p>
              </div>
            </div>
          ) : (
            <Link to="/pricing" className="relative overflow-hidden rounded-2xl block">
              <img src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=500&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#FFFFFF]/85 to-[#FFFFFF]/50" />
              <div className="relative p-4 flex items-center gap-3 text-white">
                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur">
                  <Crown size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Upgrade to Premium</p>
                  <p className="text-xs opacity-90">7-day free trial · $5/mo</p>
                </div>
                <ChevronRight size={18} />
              </div>
            </Link>
          )}
        </div>

        {/* Metabolic info */}
        {profile && (
          <div className="mt-4 rounded-2xl bg-white/5 border border-[#1E293B] p-4">
            <p className="text-xs font-medium text-[#C7D2FE] mb-3">METABOLIC PROFILE</p>
            <div className="grid grid-cols-2 gap-y-3">
              <Info label="BMR" value={`${profile.bmr} kcal`} />
              <Info label="TDEE" value={`${profile.tdee} kcal`} />
              <Info label="Target" value={`${profile.target_calories} kcal`} />
              <Info label="Goal" value={profile.goal === 'loss' ? 'Weight Loss' : profile.goal === 'gain' ? 'Weight Gain' : 'Maintenance'} />
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="mt-4 rounded-2xl bg-white/5 border border-[#1E293B] divide-y divide-[#1E293B]">
          <Link to="/metabolic" className="w-full flex items-center gap-3 p-4 hover:bg-[#0A1628] transition-colors">
            <div className="p-2 rounded-xl bg-[#1E293B]"><Activity size={18} className="text-[#3B82F6]" /></div>
            <span className="flex-1 text-left text-sm font-medium text-[#FFFFFF]">Metabolic Calculator</span>
            <ChevronRight size={18} className="text-[#C7D2FE]" />
          </Link>
          <Link to="/premium-profile" className="w-full flex items-center gap-3 p-4 hover:bg-[#0A1628] transition-colors">
            <div className="p-2 rounded-xl bg-[#1E293B]"><Activity size={18} className="text-[#3B82F6]" /></div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-[#FFFFFF]">Premium Profile & Progress</p>
              <p className="text-[10px] text-[#C7D2FE]">Track weight, measurements & goals</p>
            </div>
            <ChevronRight size={18} className="text-[#C7D2FE]" />
          </Link>
          <Link to="/pricing" className="w-full flex items-center gap-3 p-4 hover:bg-[#0A1628] transition-colors">
            <div className="p-2 rounded-xl bg-[#1E293B]"><Crown size={18} className="text-[#3B82F6]" /></div>
            <span className="flex-1 text-left text-sm font-medium text-[#FFFFFF]">Subscription & Pricing</span>
            <ChevronRight size={18} className="text-[#C7D2FE]" />
          </Link>
        </div>

        {/* Logout */}
        <button
          onClick={() => base44.auth.logout('/login')}
          className="w-full mt-4 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 py-3.5 font-medium text-sm flex items-center justify-center gap-2"
        >
          <LogOut size={16} /> Log Out
        </button>

        <div className="mt-6 text-center">
          <p className="text-xs text-[#C7D2FE]">3 in 1 Healthy Choice · v2.0</p>
          <p className="text-[10px] text-[#94A3B8] mt-1">All estimates are approximations and not medical advice.</p>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, value, label, color }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-[#1E293B] p-3 text-center">
      <Icon size={18} className={`${color} mx-auto mb-1`} />
      <p className="text-lg font-bold text-[#FFFFFF]">{value}</p>
      <p className="text-[10px] text-[#C7D2FE]">{label}</p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-[#C7D2FE]">{label}</p>
      <p className="font-semibold text-sm text-[#FFFFFF]">{value}</p>
    </div>
  );
}