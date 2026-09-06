import React from 'react';
import ActivityCalorieBurn from '@/components/fitness/ActivityCalorieBurn';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Fitness() {
  return (
    <div className="min-h-screen bg-[#FFF0F5] pb-4">
      <div className="px-5 pt-12 pb-3">
        <h1 className="text-2xl font-bold text-[#4A0E2E] font-heading">Fitness</h1>
        <p className="text-sm text-[#B0407A]">AI-personalized calorie burn estimates</p>
      </div>

      <div className="px-5 mt-2">
        <Link
          to="/coach"
          className="flex items-center justify-between rounded-2xl bg-white border border-[#FFC0D6] shadow-sm shadow-pink-200/60 p-3"
        >
          <span className="text-sm font-medium text-[#4A0E2E]">Ask AI Coach for activity recommendations</span>
          <ArrowRight size={16} className="text-[#FF149C]" />
        </Link>
      </div>

      <div className="mt-4">
        <ActivityCalorieBurn />
      </div>
    </div>
  );
}