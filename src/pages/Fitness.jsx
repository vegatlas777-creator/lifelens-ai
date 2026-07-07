import React, { useState } from 'react';
import ActivityCalorieBurn from '@/components/fitness/ActivityCalorieBurn';
import YouTubeFitnessSearch from '@/components/fitness/YouTubeFitnessSearch';
import { Flame, Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Fitness() {
  const [tab, setTab] = useState('calories');

  return (
    <div className="min-h-screen bg-[#FDFBF8] pb-4">
      <div className="px-5 pt-12 pb-3">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Fitness</h1>
        <p className="text-sm text-[#666]">Calorie estimates & video discovery</p>
      </div>

      {/* AI Coach link */}
      <div className="px-5 mt-2">
        <Link
          to="/coach"
          className="flex items-center justify-between rounded-2xl bg-[#FDDDBD]/50 border border-[#FDDDBD] p-3"
        >
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-[#E8821E]" />
            <span className="text-sm font-medium text-[#1A1A1A]">Ask AI Coach for activity recommendations</span>
          </div>
          <ArrowRight size={16} className="text-[#666]" />
        </Link>
      </div>

      {/* Tab navigation */}
      <div className="px-5 mt-4">
        <div className="flex gap-1 bg-white rounded-full p-1 border border-[#F5EFE6]">
          <button
            onClick={() => setTab('calories')}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center justify-center gap-2 ${tab === 'calories' ? 'bg-[#FF9F43] text-white' : 'text-[#666]'}`}
          >
            <Flame size={15} /> Calorie Burn
          </button>
          <button
            onClick={() => setTab('discover')}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center justify-center gap-2 ${tab === 'discover' ? 'bg-[#FF9F43] text-white' : 'text-[#666]'}`}
          >
            <Search size={15} /> Discover Videos
          </button>
        </div>
      </div>

      <div className="mt-4">
        {tab === 'calories' && <ActivityCalorieBurn />}
        {tab === 'discover' && <YouTubeFitnessSearch />}
      </div>
    </div>
  );
}