import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, ArrowRight } from 'lucide-react';

export default function UsageBanner({ usage, label, icon: Icon }) {
  if (!usage || usage.loading) return null;

  if (usage.isPremium) {
    return (
      <div className="rounded-2xl bg-white border border-[#FF69B4]/40 shadow-sm shadow-pink-200/60 p-3.5 flex items-center gap-2">
        <Crown size={15} className="text-[#FF149C]" />
        <p className="text-xs font-medium text-[#B0407A]">{label}: <span className="text-[#E91E63] font-bold">Unlimited</span> (Premium)</p>
      </div>
    );
  }

  const remaining = usage.remaining;
  const limit = usage.limit;
  const pct = (remaining / limit) * 100;
  const isExhausted = remaining === 0;

  return (
    <div className={`rounded-2xl border p-3.5 shadow-sm ${isExhausted ? 'bg-red-50 border-red-200' : 'bg-white border-[#FFC0D6] shadow-pink-200/60'}`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon size={14} className="text-[#FF149C]" />}
          <p className="text-xs font-medium text-[#4A0E2E]">{label}</p>
        </div>
        <p className={`text-xs font-bold ${isExhausted ? 'text-red-500' : 'text-[#B0407A]'}`}>
          {remaining} of {limit} left
        </p>
      </div>
      <div className="w-full h-1.5 rounded-full bg-[#FFD9E6] overflow-hidden">
        <div className={`h-full rounded-full transition-all ${isExhausted ? 'bg-red-400' : 'bg-gradient-to-r from-[#FF69B4] to-[#FF149C]'}`} style={{ width: `${pct}%` }} />
      </div>
      {isExhausted && (
        <div className="mt-2.5">
          <p className="text-[11px] text-[#B0407A] leading-relaxed">
            You've used all {limit} free {label.toLowerCase()} this week. Upgrade to Premium for unlimited access.
          </p>
          <Link to="/pricing" className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FF69B4] to-[#FF149C] text-white text-xs font-semibold shadow-md shadow-pink-300/50">
            <Crown size={13} /> Upgrade to Premium <ArrowRight size={13} />
          </Link>
        </div>
      )}
    </div>
  );
}