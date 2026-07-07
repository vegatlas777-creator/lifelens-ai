import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Check, Crown, Sparkles, Loader2, Zap, TrendingUp, Heart, Award } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { getSubscriptionStatus, startCheckout, FREE_FEATURES, PREMIUM_FEATURES } from '@/lib/subscription';

export default function Pricing() {
  const [subStatus, setSubStatus] = useState({ isPremium: false, status: 'free', loading: true });
  const [checkoutLoading, setCheckoutLoading] = useState(null); // 'monthly' | 'annual' | null
  const [error, setError] = useState(null);

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    const status = await getSubscriptionStatus();
    setSubStatus({ ...status, loading: false });
  }

  async function handleCheckout(plan) {
    setError(null);
    setCheckoutLoading(plan);
    try {
      const { redirectUrl } = await startCheckout(plan);
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    } catch (e) {
      setError('Could not start checkout. Please try again.');
      console.error(e);
    } finally {
      setCheckoutLoading(null);
    }
  }

  return (
    <div className="pb-4 min-h-screen">
      {/* Hero with background images */}
      <div className="relative overflow-hidden">
        {/* Background image collage */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-0.5">
          <img src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=70" alt="" className="w-full h-full object-cover" />
          <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=70" alt="" className="w-full h-full object-cover" />
          <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=70" alt="" className="w-full h-full object-cover" />
          <img src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=70" alt="" className="w-full h-full object-cover" />
          <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=70" alt="" className="w-full h-full object-cover" />
          <img src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=70" alt="" className="w-full h-full object-cover" />
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-900/80 via-orange-800/85 to-red-900/90" />
        <div className="relative px-5 pt-14 pb-8 text-center text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/25 backdrop-blur mb-3">
            <Crown size={14} />
            <span className="text-xs font-semibold">3 in 1 Healthy Choice Premium</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight drop-shadow-lg">Unlock Your Full Potential</h1>
          <p className="text-sm opacity-95 mt-2 max-w-xs mx-auto drop-shadow">Personalized plans, daily AI coaching, and advanced insights to reach your goals faster.</p>
        </div>
      </div>

      <div className="px-5 -mt-4 relative">
        {subStatus.loading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={32} className="text-primary animate-spin" />
          </div>
        ) : subStatus.isPremium ? (
          <div className="rounded-3xl bg-card border-2 border-primary p-6 text-center shadow-lg">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Crown size={28} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold">You're Premium! 👑</h2>
            <p className="text-sm text-muted-foreground mt-1">You have full access to all premium features.</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-2xl bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Annual plan (best value) */}
            <PlanCard
              badge="BEST VALUE — Save 17%"
              badgeColor="bg-red-500"
              name="Premium Annual"
              price="$50"
              altPrice="€45"
              period="/year"
              trial="7-day free trial"
              features={PREMIUM_FEATURES}
              cta="Start Free Trial"
              loading={checkoutLoading === 'annual'}
              onClick={() => handleCheckout('annual')}
              highlighted
            />

            {/* Monthly plan */}
            <div className="mt-4">
              <PlanCard
                name="Premium Monthly"
                price="$5"
                altPrice="€4"
                period="/month"
                trial="7-day free trial"
                features={PREMIUM_FEATURES}
                cta="Start Free Trial"
                loading={checkoutLoading === 'monthly'}
                onClick={() => handleCheckout('monthly')}
              />
            </div>

            {/* Promotional offers */}
            <div className="mt-6 rounded-2xl bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-300/50 dark:border-amber-800/30 p-4">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Sparkles size={16} className="text-orange-500" /> Limited Time Offers
              </p>
              <ul className="mt-2 space-y-1.5">
                <li className="text-xs text-muted-foreground">🎁 7-day free trial on all plans</li>
                <li className="text-xs text-muted-foreground">🏆 Save 17% with annual billing</li>
                <li className="text-xs text-muted-foreground">👫 Refer a friend and get a free month</li>
              </ul>
            </div>
          </>
        )}

        {/* Free plan comparison */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-3 px-1">Free Plan Includes</h3>
          <div className="rounded-2xl bg-card border border-border p-4 space-y-2">
            {FREE_FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check size={14} className="text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground/80 text-center mt-6 leading-relaxed px-4">
          ⚠️ Subscriptions auto-renew unless canceled. The AI coach is not a medical professional — all estimates and recommendations are informational only and not medical advice. Cancel anytime in your profile settings.
        </p>
      </div>
    </div>
  );
}

function PlanCard({ badge, badgeColor, name, price, altPrice, period, trial, features, cta, loading, onClick, highlighted }) {
  return (
    <div className={`rounded-3xl p-6 shadow-lg transition-all ${highlighted ? 'bg-card border-2 border-primary scale-[1.02]' : 'bg-card border border-border'}`}>
      {badge && (
        <div className={`inline-block px-3 py-1 rounded-full text-white text-xs font-bold mb-3 ${badgeColor}`}>
          {badge}
        </div>
      )}
      <p className="text-sm font-semibold text-muted-foreground">{name}</p>
      <div className="flex items-baseline gap-1.5 mt-1">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-sm text-muted-foreground">{period}</span>
        {altPrice && <span className="text-sm text-muted-foreground ml-1">({altPrice}{period})</span>}
      </div>
      <p className="text-xs text-primary font-medium mt-1">✨ {trial}</p>

      <div className="mt-4 space-y-2 max-h-44 overflow-y-auto scrollbar-hide">
        {features.map((f, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check size={10} className="text-primary" />
            </div>
            <span className="text-sm">{f}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onClick}
        disabled={loading}
        className="w-full mt-5 rounded-2xl bg-primary text-primary-foreground py-3.5 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Crown size={18} />}
        {cta}
      </button>
    </div>
  );
}