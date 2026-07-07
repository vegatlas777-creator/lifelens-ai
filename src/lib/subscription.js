import { base44 } from '@/api/base44Client';

export async function getSubscriptionStatus() {
  try {
    const subs = await base44.entities.Subscription.list('-created_date', 5);
    const active = subs.find(s => s.status === 'active' || s.status === 'trialing');
    return {
      isPremium: !!active,
      subscription: active || null,
      status: active?.status || 'free',
      plan: active?.plan || 'free',
    };
  } catch (e) {
    return { isPremium: false, subscription: null, status: 'free', plan: 'free' };
  }
}

export async function startCheckout(plan) {
  const response = await base44.functions.invoke('create-checkout', { plan });
  return response.data;
}

export const FREE_FEATURES = [
  '5 material checks per week',
  '5 calorie analyses per week (photo, voice, text)',
  'Basic calorie tracking',
  'Basic BMR & TDEE calculations',
  'General AI health questions',
];

export const PREMIUM_FEATURES = [
  'Unlimited material checks',
  'Unlimited calorie analyses',
  'Unlimited food photo uploads',
  'Unlimited voice meal analysis',
  'Personalized AI calorie targets',
  'Personalized metabolic rate calculations',
  'Personalized fitness recommendations',
  'Premium profile & progress tracking',
  'Community photo uploads',
  'Advanced analytics & reports',
  'Priority AI responses',
  'Weekly & monthly AI progress reports',
  'Daily AI coaching with profile data',
  'Personalized weight loss / maintenance / gain plans',
];