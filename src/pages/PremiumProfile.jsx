import React, { useState, useEffect } from 'react';
import { Crown, User, TrendingUp, Ruler, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSubscriptionStatus } from '@/lib/subscription';
import ProfileForm from '@/components/premium/ProfileForm';
import WeightTracker from '@/components/premium/WeightTracker';
import MeasurementsTracker from '@/components/premium/MeasurementsTracker';
import ProgressDashboard from '@/components/premium/ProgressDashboard';

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
      <div className="flex items-center justify-center min-h-screen bg-[#FDFBF8]">
        <Loader2 size={28} className="text-[#FF9F43] animate-spin" />
      </div>
    );
  }

  if (!subStatus.isPremium) {
    return (
      <div className="min-h-screen bg-[#FDFBF8] flex flex-col items-center justify-center px-5">
        <div className="w-16 h-16 rounded-full bg-[#FDDDBD] flex items-center justify-center mb-4">
          <Crown size={32} className="text-[#E8821E]" />
        </div>
        <h1 className="text-xl font-bold text-[#1A1A1A]">Premium Feature</h1>
        <p className="text-sm text-[#666] mt-2 text-center max-w-xs">Premium Profile & Progress Tracking is available exclusively for Premium subscribers.</p>
        <Link to="/pricing" className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FFD5A8] text-[#1A1A1A] text-sm font-semibold">
          Upgrade to Premium <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF8] pb-4">
      <div className="px-5 pt-12 pb-3">
        <div className="flex items-center gap-2">
          <Crown size={20} className="text-[#FF9F43]" />
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Premium Profile</h1>
        </div>
        <p className="text-sm text-[#666]">Track your progress & reach your goals</p>
      </div>

      <div className="px-5 mt-3">
        <div className="flex gap-1 bg-white rounded-full p-1 border border-[#F5EFE6] overflow-x-auto scrollbar-hide">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 min-w-fit py-2 px-3 rounded-full text-xs font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${tab === t.id ? 'bg-[#FF9F43] text-white' : 'text-[#666]'}`}>
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