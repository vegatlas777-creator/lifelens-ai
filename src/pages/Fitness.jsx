import React from 'react';
import ActivityCalorieBurn from '@/components/fitness/ActivityCalorieBurn';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Fitness() {
  return (
    <div className="min-h-screen bg-[#F3F7F5] pb-4">
      <div className="px-5 pt-12 pb-3">
        <h1 className="text-2xl font-bold text-[#0A0A0A] font-heading">Fitness</h1>
        <p className="text-sm text-[#737373]">AI-personalized calorie burn estimates</p>
      </div>

      <div className="px-5 mt-2">
        <Link
          to="/coach"
          className="flex items-center justify-between rounded-2xl bg-white border border-[#E0E0E0] shadow-sm shadow-black/5 p-3"
        >
          <span className="text-sm font-medium text-[#0A0A0A]">Ask AI Coach for activity recommendations</span>
          <ArrowRight size={16} className="text-[#2D9F6A]" />
        </Link>
      </div>

      <div className="mt-4">
        <ActivityCalorieBurn />
      </div>
    </div>
  );
}