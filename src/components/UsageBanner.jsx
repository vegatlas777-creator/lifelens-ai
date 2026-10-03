import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, ArrowRight } from 'lucide-react';

export default function UsageBanner({ usage, label, icon: Icon }) {
  if (!usage || usage.loading) return null;

  if (usage.isPremium) {
    return (
      <div className="rounded-2xl bg-white border border-[#C26A52]/40 shadow-sm shadow-pink-200/60 p-3.5 flex items-center gap-2">
        <Crown size={15} className="text-[#5C4A3C]" />
        <p className="text-xs font-medium text-[#9B7B6E]">{label}: <span className="text-[#D97757] font-bold">Unlimited</span> (Premium)</p>
      </div>
    );
  }

  const remaining = usage.remaining;
  const limit = usage.limit;
  const pct = (remaining / limit) * 100;
  const isExhausted = remaining === 0;

  return (
    <div className={`rounded-2xl border p-3.5 shadow-sm ${isExhausted ? 'bg-red-50 border-red-200' : 'bg-white border-[#EDE3D3] shadow-pink-200/60'}`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon size={14} className="text-[#5C4A3C]" />}
          <p className="text-xs font-medium text-[#5C4A3C]">{label}</p>
        </div>
        <p className={`text-xs font-bold ${isExhausted ? 'text-red-500' : 'text-[#9B7B6E]'}`}>
          {remaining} of {limit} left
        </p>
      </div>
      <div className="w-full h-1.5 rounded-full bg-[#F5EFE6] overflow-hidden">
        <div className={`h-full rounded-full transition-all ${isExhausted ? 'bg-red-400' : 'bg-gradient-to-r from-[#C26A52] to-[#5C4A3C]'}`} style={{ width: `${pct}%` }} />
      </div>
      {isExhausted && (
        <div className="mt-2.5">
          <p className="text-[11px] text-[#9B7B6E] leading-relaxed">
            You've used all {limit} free {label.toLowerCase()} this week. Upgrade to Premium for unlimited access.
          </p>
          <Link to="/pricing" className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#C26A52] to-[#5C4A3C] text-white text-xs font-semibold shadow-md shadow-pink-300/50">
            <Crown size={13} /> Upgrade to Premium <ArrowRight size={13} />
          </Link>
        </div>
      )}
    </div>
  );
}