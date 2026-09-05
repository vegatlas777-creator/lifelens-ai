import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, ArrowRight } from 'lucide-react';

export default function UsageBanner({ usage, label, icon: Icon }) {
  if (!usage || usage.loading) return null;

  if (usage.isPremium) {
    return (
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-amber-400/20 p-3.5 flex items-center gap-2">
        <Crown size={15} className="text-amber-300" />
        <p className="text-xs font-medium text-white/70">{label}: <span className="text-amber-300 font-bold">Unlimited</span> (Premium)</p>
      </div>
    );
  }

  const remaining = usage.remaining;
  const limit = usage.limit;
  const pct = (remaining / limit) * 100;
  const isExhausted = remaining === 0;

  return (
    <div className={`rounded-2xl border p-3.5 backdrop-blur-xl ${isExhausted ? 'bg-rose-500/10 border-rose-400/30' : 'bg-white/5 border-white/10'}`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon size={14} className="text-amber-300" />}
          <p className="text-xs font-medium text-white/80">{label}</p>
        </div>
        <p className={`text-xs font-bold ${isExhausted ? 'text-rose-300' : 'text-white/60'}`}>
          {remaining} of {limit} left
        </p>
      </div>
      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${isExhausted ? 'bg-rose-400' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`} style={{ width: `${pct}%` }} />
      </div>
      {isExhausted && (
        <div className="mt-2.5">
          <p className="text-[11px] text-white/50 leading-relaxed">
            You've used all {limit} free {label.toLowerCase()} this week. Upgrade to Premium for unlimited access.
          </p>
          <Link to="/pricing" className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs font-semibold">
            <Crown size={13} /> Upgrade to Premium <ArrowRight size={13} />
          </Link>
        </div>
      )}
    </div>
  );
}