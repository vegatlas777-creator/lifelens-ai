import React from 'react';
import ActivityCalorieBurn from '@/components/fitness/ActivityCalorieBurn';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Fitness() {
  return (
    <div className="min-h-screen bg-[#F0F9FF] pb-4">
      <div className="px-5 pt-12 pb-3">
        <h1 className="text-2xl font-bold text-[#0F172A]">Fitness</h1>
        <p className="text-sm text-[#64748B]">AI-personalized calorie burn estimates</p>
      </div>

      <div className="px-5 mt-2">
        <Link
          to="/coach"
          className="flex items-center justify-between rounded-2xl bg-[#E0F2FE]/50 border border-[#E0F2FE] p-3"
        >
          <span className="text-sm font-medium text-[#0F172A]">Ask AI Coach for activity recommendations</span>
          <ArrowRight size={16} className="text-[#64748B]" />
        </Link>
      </div>

      <div className="mt-4">
        <ActivityCalorieBurn />
      </div>
    </div>
  );
}