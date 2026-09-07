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
      <div className="flex items-center justify-center min-h-screen bg-[#FFF0F5]">
        <Loader2 size={28} className="text-[#FF149C] animate-spin" />
      </div>
    );
  }

  if (!subStatus.isPremium) {
    return (
      <div className="min-h-screen bg-[#FFF0F5] flex flex-col items-center justify-center px-5">
        <div className="w-16 h-16 rounded-full bg-white border border-[#FFC0D6] shadow-sm shadow-pink-200/60 flex items-center justify-center mb-4">
          <Crown size={32} className="text-[#FF149C]" />
        </div>
        <h1 className="text-xl font-bold text-[#4A0E2E] font-heading">Premium Feature</h1>
        <p className="text-sm text-[#B0407A] mt-2 text-center max-w-xs">Premium Profile & Progress Tracking is available exclusively for Premium subscribers.</p>
        <Link to="/pricing" className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FF69B4] to-[#FF149C] text-white text-sm font-semibold shadow-md shadow-pink-300/50">
          Upgrade to Premium <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF0F5] pb-4">
      <div className="px-5 pt-12 pb-3">
        <div className="flex items-center gap-2">
          <Crown size={20} className="text-[#FF149C]" />
          <h1 className="text-2xl font-bold text-[#4A0E2E] font-heading">Premium Profile</h1>
        </div>
        <p className="text-sm text-[#B0407A]">Track your progress & reach your goals</p>
      </div>

      <div className="px-5 mt-3">
        <div className="flex gap-1 bg-white rounded-full p-1 border border-[#FFC0D6] shadow-sm shadow-pink-200/60 overflow-x-auto scrollbar-hide">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 min-w-fit py-2 px-3 rounded-full text-xs font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${tab === t.id ? 'bg-[#E91E63] text-white' : 'text-[#B0407A]'}`}>
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