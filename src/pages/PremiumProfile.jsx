import React, { useState, useEffect } from 'react';
import { Crown, User, TrendingUp, Ruler, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSubscriptionStatus } from '@/lib/subscription';
import ProfileForm from '@/components/premium/ProfileForm';
import WeightTracker from '@/components/premium/WeightTracker';
import MeasurementsTracker from '@/components/premium/MeasurementsTracker';
import ProgressDashboard from '@/components/premium/ProgressDashboard';
import BackButton from '@/components/BackButton';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
  { id: 'weight', label: 'Weight', icon: TrendingUp },
  { id: 'measure', label: 'Measurements', icon: Ruler },
];

export default function PremiumProfile() {
  const [tab, setTab] = useState('profile');
  const [subStatus, setSubStatus] = useState({ isPremium: false, loading: true });

  useEffect(() => { getSubscriptionStatus().then(setSubStatus); }, []);

  if (subStatus.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFF8DC]">
        <Loader2 size={28} className="text-[#2D9F6A] animate-spin" />
      </div>
    );
  }

  if (!subStatus.isPremium) {
    return (
      <div className="min-h-screen bg-[#FFF8DC] flex flex-col items-center justify-center px-5">
        <div className="w-16 h-16 rounded-full bg-white border border-[#E0E0E0] shadow-sm shadow-black/5 flex items-center justify-center mb-4">
          <Crown size={32} className="text-[#2D9F6A]" />
        </div>
        <h1 className="text-xl font-bold text-[#0A0A0A] font-heading">Premium Feature</h1>
        <p className="text-sm text-[#737373] mt-2 text-center max-w-xs">Premium Profile & Progress Tracking is available exclusively for Premium subscribers.</p>
        <Link to="/pricing" className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#2D9F6A] to-[#1F8A58] text-white text-sm font-semibold shadow-md shadow-black/10">
          Upgrade to Premium <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8DC] pb-4">
      <div className="px-5 pt-12 pb-3">
        <BackButton />
        <div className="flex items-center gap-2">
          <Crown size={20} className="text-[#2D9F6A]" />
          <h1 className="text-2xl font-bold text-[#0A0A0A] font-heading">Premium Profile</h1>
        </div>
        <p className="text-sm text-[#737373]">Track your progress & reach your goals</p>
      </div>

      <div className="px-5 mt-3">
        <div className="flex gap-1 bg-white rounded-full p-1 border border-[#E0E0E0] shadow-sm shadow-black/5 overflow-x-auto scrollbar-hide">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 min-w-fit py-2 px-3 rounded-full text-xs font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${tab === t.id ? 'bg-[#2D9F6A] text-white' : 'text-[#737373]'}`}>
                <Icon size={13} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        {tab === 'profile' && <ProfileForm />}
        {tab === 'dashboard' && <ProgressDashboard />}
        {tab === 'weight' && <WeightTracker />}
        {tab === 'measure' && <MeasurementsTracker />}
      </div>
    </div>
  );
}