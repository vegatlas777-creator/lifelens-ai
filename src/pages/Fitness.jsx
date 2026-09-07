import React from 'react';
import ActivityCalorieBurn from '@/components/fitness/ActivityCalorieBurn';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Fitness() {
  return (
    <div className="min-h-screen bg-[#F5F0FF] pb-4">
      <div className="px-5 pt-12 pb-3">
        <h1 className="text-2xl font-bold text-[#2E1065] font-heading">Fitness</h1>
        <p className="text-sm text-[#7E5BA8]">AI-personalized calorie burn estimates</p>
      </div>

      <div className="px-5 mt-2">
        <Link
          to="/coach"
          className="flex items-center justify-between rounded-2xl bg-white border border-[#D4C2F5] shadow-sm shadow-purple-200/60 p-3"
        >
          <span className="text-sm font-medium text-[#2E1065]">Ask AI Coach for activity recommendations</span>
          <ArrowRight size={16} className="text-[#7C3AED]" />
        </Link>
      </div>

      <div className="mt-4">
        <ActivityCalorieBurn />
      </div>
    </div>
  );
}