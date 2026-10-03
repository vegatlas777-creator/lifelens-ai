import React from 'react';
import ActivityCalorieBurn from '@/components/fitness/ActivityCalorieBurn';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Fitness() {
  return (
    <div className="min-h-screen bg-[#FDF6EE] pb-4">
      <div className="px-5 pt-12 pb-3">
        <h1 className="text-2xl font-bold text-[#5C4A3C] font-heading">Fitness</h1>
        <p className="text-sm text-[#9B7B6E]">AI-personalized calorie burn estimates</p>
      </div>

      <div className="px-5 mt-2">
        <Link
          to="/coach"
          className="flex items-center justify-between rounded-2xl bg-white border border-[#EDE3D3] shadow-sm shadow-pink-200/60 p-3"
        >
          <span className="text-sm font-medium text-[#5C4A3C]">Ask AI Coach for activity recommendations</span>
          <ArrowRight size={16} className="text-[#5C4A3C]" />
        </Link>
      </div>

      <div className="mt-4">
        <ActivityCalorieBurn />
      </div>
    </div>
  );
}