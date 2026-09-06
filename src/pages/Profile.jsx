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
    <div className="min-h-screen bg-[#FFF0F5] pb-4">
      <div className="px-5 pt-12 pb-3">
        <h1 className="text-2xl font-bold text-[#4A0E2E] font-heading">Profile</h1>
      </div>

      <div className="px-5 mt-2">
        {/* User card */}
        <div className="relative overflow-hidden rounded-3xl border border-[#FFC0D6] shadow-sm shadow-pink-200/60">
          <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF149C]/90 to-[#E91E63]/75" />
          <div className="relative p-6 flex items-center gap-4 text-white">
            <div className="w-16 h-16 rounded-full bg-white/25 backdrop-blur flex items-center justify-center text-2xl font-bold">
              {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold font-heading">{user?.full_name || 'User'}</p>
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
          <StatBox icon={Flame} value={Math.round(todayStats.calories)} label="kcal eaten" color="text-[#FF149C]" />
          <StatBox icon={Activity} value={todayStats.burned} label="kcal burned" color="text-[#E91E63]" />
          <StatBox icon={Dumbbell} value={todayStats.workouts} label="workouts" color="text-[#FF149C]" />
        </div>

        {/* Subscription card */}
        <div className="mt-4">
          {subStatus.isPremium ? (
            <div className="rounded-2xl bg-white border border-[#FF69B4]/40 shadow-sm shadow-pink-200/60 p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#FFD9E6]">
                <Crown size={20} className="text-[#FF149C]" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-[#4A0E2E]">Premium Active</p>
                <p className="text-xs text-[#B0407A]">{subStatus.subscription?.billing_cycle === 'annual' ? 'Annual plan' : 'Monthly plan'}</p>
              </div>
            </div>
          ) : (
            <Link to="/pricing" className="relative overflow-hidden rounded-2xl block border border-[#FFC0D6] shadow-sm shadow-pink-200/60">
              <img src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=500&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF149C]/90 to-[#E91E63]/75" />
              <div className="relative p-4 flex items-center gap-3 text-white">
                <div className="p-2.5 rounded-xl bg-white/25 backdrop-blur">
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
          <div className="mt-4 rounded-2xl bg-white border border-[#FFC0D6] shadow-sm shadow-pink-200/60 p-4">
            <p className="text-xs font-medium text-[#B0407A] mb-3">METABOLIC PROFILE</p>
            <div className="grid grid-cols-2 gap-y-3">
              <Info label="BMR" value={`${profile.bmr} kcal`} />
              <Info label="TDEE" value={`${profile.tdee} kcal`} />
              <Info label="Target" value={`${profile.target_calories} kcal`} />
              <Info label="Goal" value={profile.goal === 'loss' ? 'Weight Loss' : profile.goal === 'gain' ? 'Weight Gain' : 'Maintenance'} />
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="mt-4 rounded-2xl bg-white border border-[#FFC0D6] shadow-sm shadow-pink-200/60 divide-y divide-[#FFC0D6]">
          <Link to="/metabolic" className="w-full flex items-center gap-3 p-4 hover:bg-[#FFF0F5] transition-colors">
            <div className="p-2 rounded-xl bg-[#FFD9E6]"><Activity size={18} className="text-[#FF149C]" /></div>
            <span className="flex-1 text-left text-sm font-medium text-[#4A0E2E]">Metabolic Calculator</span>
            <ChevronRight size={18} className="text-[#D67A9E]" />
          </Link>
          <Link to="/premium-profile" className="w-full flex items-center gap-3 p-4 hover:bg-[#FFF0F5] transition-colors">
            <div className="p-2 rounded-xl bg-[#FFD9E6]"><Activity size={18} className="text-[#FF149C]" /></div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-[#4A0E2E]">Premium Profile & Progress</p>
              <p className="text-[10px] text-[#B0407A]">Track weight, measurements & goals</p>
            </div>
            <ChevronRight size={18} className="text-[#D67A9E]" />
          </Link>
          <Link to="/pricing" className="w-full flex items-center gap-3 p-4 hover:bg-[#FFF0F5] transition-colors">
            <div className="p-2 rounded-xl bg-[#FFD9E6]"><Crown size={18} className="text-[#FF149C]" /></div>
            <span className="flex-1 text-left text-sm font-medium text-[#4A0E2E]">Subscription & Pricing</span>
            <ChevronRight size={18} className="text-[#D67A9E]" />
          </Link>
        </div>

        {/* Logout */}
        <button
          onClick={() => base44.auth.logout('/login')}
          className="w-full mt-4 rounded-full border border-red-300 bg-red-50 text-red-500 py-3.5 font-medium text-sm flex items-center justify-center gap-2"
        >
          <LogOut size={16} /> Log Out
        </button>

        <div className="mt-6 text-center">
          <p className="text-xs text-[#B0407A]">3 in 1 Healthy Choice · v2.0</p>
          <p className="text-[10px] text-[#D67A9E] mt-1">All estimates are approximations and not medical advice.</p>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, value, label, color }) {
  return (
    <div className="rounded-2xl bg-white border border-[#FFC0D6] shadow-sm shadow-pink-200/60 p-3 text-center">
      <Icon size={18} className={`${color} mx-auto mb-1`} />
      <p className="text-lg font-bold text-[#4A0E2E]">{value}</p>
      <p className="text-[10px] text-[#B0407A]">{label}</p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-[#B0407A]">{label}</p>
      <p className="font-semibold text-sm text-[#4A0E2E]">{value}</p>
    </div>
  );
}