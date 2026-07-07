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
  'Food photo calorie estimation',
  'Basic calorie tracking',
  'Basic BMR & TDEE calculations',
  'Limited workout videos',
  'General AI health questions',
];

export const PREMIUM_FEATURES = [
  'Personalized calorie targets',
  'Personalized weight loss / maintenance / gain plans',
  'Personalized dance recommendations',
  'Walking & running recommendations',
  'Daily AI coaching',
  'Weekly progress reports',
  'Advanced nutrition insights',
  'Advanced fitness recommendations',
  'Full workout video library',
  'Goal tracking dashboard',
];