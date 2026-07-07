import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, ArrowRight } from 'lucide-react';

export default function UsageBanner({ usage, label, icon: Icon }) {
  if (!usage || usage.loading) return null;

  if (usage.isPremium) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 p-3 flex items-center gap-2">
        <Crown size={15} className="text-[#E8821E]" />
        <p className="text-xs font-medium text-[#666]">{label}: <span className="text-[#E8821E] font-bold">Unlimited</span> (Premium)</p>
      </div>
    );
  }

  const remaining = usage.remaining;
  const limit = usage.limit;
  const pct = (remaining / limit) * 100;
  const isExhausted = remaining === 0;

  return (
    <div className={`rounded-2xl border p-3 ${isExhausted ? 'bg-rose-50 border-rose-200' : 'bg-white border-[#F5EFE6]'}`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon size={14} className="text-[#FF9F43]" />}
          <p className="text-xs font-medium text-[#1A1A1A]">{label}</p>
        </div>
        <p className={`text-xs font-bold ${isExhausted ? 'text-rose-500' : 'text-[#666]'}`}>
          {remaining} of {limit} left
        </p>
      </div>
      <div className="w-full h-1.5 rounded-full bg-[#F5EFE6] overflow-hidden">
        <div className={`h-full rounded-full transition-all ${isExhausted ? 'bg-rose-400' : 'bg-[#FF9F43]'}`} style={{ width: `${pct}%` }} />
      </div>
      {isExhausted && (
        <div className="mt-2.5">
          <p className="text-[11px] text-[#666] leading-relaxed">
            You've used all {limit} free {label.toLowerCase()} this week. Upgrade to Premium for unlimited access.
          </p>
          <Link to="/pricing" className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold">
            <Crown size={13} /> Upgrade to Premium <ArrowRight size={13} />
          </Link>
        </div>
      )}
    </div>
  );
}