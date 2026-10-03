import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { User, LogOut, Activity, Flame, Dumbbell, ChevronRight, Crown, Calculator, TrendingUp, CreditCard, LogOut as LogOutIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTodayStr } from '@/lib/dateUtils';
import { getSubscriptionStatus } from '@/lib/subscription';
import BackButton from '@/components/BackButton';

const GOLD = '#D6B35A';
const GOLD_DARK = '#B8902E';
const CREAM = '#F6F1E8';
const CARD = '#FFFDFC';
const TEXT = '#2B241C';
const TEXT_SEC = '#7B7268';
const BORDER = '#E5DDD1';

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

  const initial = user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';
  const firstName = user?.full_name?.split(' ')[0] || 'User';

  return (
    <div className="min-h-screen pb-6" style={{ backgroundColor: CREAM }}>
      <div className="px-5 pt-12 pb-2">
        <BackButton />
      </div>

      {/* Premium header card */}
      <div className="px-5">
        <div className="relative overflow-hidden rounded-3xl shadow-lg shadow-black/15" style={{ background: 'linear-gradient(135deg, #1B2333 0%, #243044 100%)' }}>
          {/* subtle gold sheen */}
          <div className="absolute inset-0 opacity-[0.07]" style={{ background: 'radial-gradient(circle at 80% 20%, #D6B35A 0%, transparent 60%)' }} />
          <div className="relative p-6 flex items-center gap-4">
            {/* Avatar with gold ring */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, #D6B35A, #B8902E)', boxShadow: '0 0 0 3px rgba(214, 179, 90, 0.3), 0 8px 20px rgba(0,0,0,0.3)' }}>
                {initial}
              </div>
            </div>
            {/* Identity block */}
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold font-heading text-white truncate">{user?.full_name || 'User'}</p>
              <p className="text-xs text-white/60 truncate mt-0.5">{user?.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                style={{ background: subStatus.isPremium ? 'rgba(214, 179, 90, 0.25)' : 'rgba(255,255,255,0.1)', color: subStatus.isPremium ? '#D6B35A' : 'rgba(255,255,255,0.7)', border: subStatus.isPremium ? '1px solid rgba(214,179,90,0.4)' : '1px solid rgba(255,255,255,0.15)' }}>
                {subStatus.isPremium ? (<><Crown size={11} /> PREMIUM</>) : 'FREE PLAN'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's stats — compact */}
      <div className="px-5 mt-3 grid grid-cols-3 gap-2.5">
        <StatBox icon={Flame} value={Math.round(todayStats.calories)} label="kcal eaten" />
        <StatBox icon={Activity} value={todayStats.burned} label="kcal burned" />
        <StatBox icon={Dumbbell} value={todayStats.workouts} label="workouts" />
      </div>

      {/* Subscription section */}
      <div className="px-5 mt-5">
        <SectionHeading>Subscription</SectionHeading>
        <div className="mt-2">
          {subStatus.isPremium ? (
            <div className="rounded-2xl p-4 flex items-center gap-3 shadow-sm shadow-black/5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
              <div className="p-2.5 rounded-xl" style={{ background: 'rgba(214,179,90,0.15)' }}>
                <Crown size={20} style={{ color: GOLD_DARK }} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: TEXT }}>Premium Active</p>
                <p className="text-xs" style={{ color: TEXT_SEC }}>{subStatus.subscription?.billing_cycle === 'annual' ? 'Annual plan' : 'Monthly plan'}</p>
              </div>
              <Link to="/pricing" className="p-1.5 rounded-lg" style={{ color: TEXT_SEC }}>
                <ChevronRight size={18} />
              </Link>
            </div>
          ) : (
            <Link to="/pricing" className="relative overflow-hidden rounded-2xl block shadow-md shadow-black/10" style={{ background: 'linear-gradient(135deg, #E8D091 0%, #D6B35A 100%)', border: `1px solid ${GOLD_DARK}` }}>
              <img src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&q=80" alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
              <div className="relative p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.35)' }}>
                  <Crown size={20} style={{ color: '#1F1A14' }} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm" style={{ color: '#1F1A14' }}>Upgrade to Premium</p>
                  <p className="text-xs" style={{ color: '#4B4032' }}>7-day free trial · $5/mo</p>
                </div>
                <ChevronRight size={18} style={{ color: '#1F1A14' }} />
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Account section */}
      <div className="px-5 mt-5">
        <SectionHeading>Account</SectionHeading>
        <div className="mt-2 rounded-2xl overflow-hidden shadow-sm shadow-black/5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <SettingsRow to="/metabolic" icon={Calculator} title="Metabolic Calculator" sub="BMR, TDEE & calorie goals" />
          <Divider />
          <SettingsRow to="/premium-profile" icon={TrendingUp} title="Premium Profile & Progress" sub="Track weight, measurements & goals" />
        </div>
      </div>

      {/* Preferences section */}
      <div className="px-5 mt-4">
        <SectionHeading>Preferences</SectionHeading>
        <div className="mt-2 rounded-2xl overflow-hidden shadow-sm shadow-black/5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <SettingsRow to="/pricing" icon={CreditCard} title="Subscription & Pricing" />
        </div>
      </div>

      {/* Metabolic info */}
      {profile && (
        <div className="px-5 mt-4">
          <SectionHeading>Metabolic Profile</SectionHeading>
          <div className="mt-2 rounded-2xl p-4 shadow-sm shadow-black/5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
            <div className="grid grid-cols-2 gap-y-3">
              <Info label="BMR" value={`${profile.bmr} kcal`} />
              <Info label="TDEE" value={`${profile.tdee} kcal`} />
              <Info label="Target" value={`${profile.target_calories} kcal`} />
              <Info label="Goal" value={profile.goal === 'loss' ? 'Weight Loss' : profile.goal === 'gain' ? 'Weight Gain' : 'Maintenance'} />
            </div>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="px-5 mt-5">
        <button
          onClick={() => base44.auth.logout('/login')}
          className="w-full rounded-2xl py-3.5 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
          style={{ background: CARD, border: `1px solid ${BORDER}`, color: '#B91C1C' }}
        >
          <LogOut size={16} /> Log Out
        </button>
      </div>

      <div className="mt-5 text-center px-5">
        <p className="text-xs" style={{ color: TEXT_SEC }}>3 in 1 Healthy Choice · v2.0</p>
        <p className="text-[10px] mt-1" style={{ color: '#A3A3A3' }}>All estimates are approximations and not medical advice.</p>
      </div>
    </div>
  );
}

function SectionHeading({ children }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: GOLD_DARK }}>{children}</p>
  );
}

function StatBox({ icon: Icon, value, label }) {
  return (
    <div className="rounded-2xl p-3 text-center shadow-sm shadow-black/5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
      <Icon size={18} className="mx-auto mb-1" style={{ color: GOLD_DARK }} />
      <p className="text-lg font-bold" style={{ color: TEXT }}>{value}</p>
      <p className="text-[10px]" style={{ color: TEXT_SEC }}>{label}</p>
    </div>
  );
}

function SettingsRow({ to, icon: Icon, title, sub }) {
  return (
    <Link to={to} className="w-full flex items-center gap-3 p-4 transition-colors hover:bg-[#F6F1E8]/50">
      <div className="p-2 rounded-xl flex-shrink-0" style={{ background: 'rgba(214,179,90,0.12)' }}>
        <Icon size={18} style={{ color: GOLD_DARK }} />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-medium" style={{ color: TEXT }}>{title}</p>
        {sub && <p className="text-[11px] mt-0.5" style={{ color: TEXT_SEC }}>{sub}</p>}
      </div>
      <ChevronRight size={18} style={{ color: TEXT_SEC }} />
    </Link>
  );
}

function Divider() {
  return <div style={{ height: '1px', background: BORDER }} />;
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs" style={{ color: TEXT_SEC }}>{label}</p>
      <p className="font-semibold text-sm mt-0.5" style={{ color: TEXT }}>{value}</p>
    </div>
  );
}