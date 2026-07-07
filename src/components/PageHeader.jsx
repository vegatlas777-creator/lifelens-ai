import React from 'react';
import { Flame, TrendingUp, Dumbbell, Apple, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PageHeader({ title, subtitle, icon: Icon }) {
  return (
    <div className="px-5 pt-12 pb-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
            <Icon size={22} strokeWidth={2.2} />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-heading">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, sub, color = 'text-primary' }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Icon size={16} className={color} />
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <span className="text-2xl font-bold tracking-tight">{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

export function Disclaimer({ text }) {
  return (
    <p className="text-[11px] text-muted-foreground/80 px-5 text-center leading-relaxed">
      {text || '⚠️ Estimates are approximations and not medical advice. Consult a healthcare professional for personalized guidance.'}
    </p>
  );
}