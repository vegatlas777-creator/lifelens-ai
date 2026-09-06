import React from 'react';
import ActivityCalorieBurn from '@/components/fitness/ActivityCalorieBurn';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Fitness() {
  return (
    <div className="min-h-screen bg-[#0A1628] pb-4">
      <div className="px-5 pt-12 pb-3">
        <h1 className="text-2xl font-bold text-[#FFFFFF]">Fitness</h1>
        <p className="text-sm text-[#C7D2FE]">AI-personalized calorie burn estimates</p>
      </div>

      <div className="px-5 mt-2">
        <Link
          to="/coach"
          className="flex items-center justify-between rounded-2xl bg-[#1E293B]/50 border border-[#1E293B] p-3"
        >
          <span className="text-sm font-medium text-[#FFFFFF]">Ask AI Coach for activity recommendations</span>
          <ArrowRight size={16} className="text-[#C7D2FE]" />
        </Link>
      </div>

      <div className="mt-4">
        <ActivityCalorieBurn />
      </div>
    </div>
  );
}