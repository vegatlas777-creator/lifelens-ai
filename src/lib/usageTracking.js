import { base44 } from '@/api/base44Client';
import { getSubscriptionStatus } from '@/lib/subscription';

export const WEEKLY_LIMITS = {
  material_check: 5,
  calorie_analysis: 5,
};

export const FEATURE_LABELS = {
  material_check: 'Material Checks',
  calorie_analysis: 'Calorie Analyses',
};

export function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().split('T')[0];
}

export async function getUsageCount(featureType) {
  const weekStart = getWeekStart();
  const records = await base44.entities.UsageRecord.filter({ feature_type: featureType, week_start: weekStart });
  return records.length;
}

export async function getFeatureUsage(featureType) {
  const sub = await getSubscriptionStatus();
  if (sub.isPremium) {
    return { allowed: true, remaining: Infinity, used: 0, limit: Infinity, isPremium: true };
  }
  const used = await getUsageCount(featureType);
  const limit = WEEKLY_LIMITS[featureType];
  return { allowed: used < limit, remaining: Math.max(limit - used, 0), used, limit, isPremium: false };
}

export async function consumeFeature(featureType) {
  const sub = await getSubscriptionStatus();
  if (sub.isPremium) return { allowed: true, remaining: Infinity, used: 0, limit: Infinity, isPremium: true };
  const check = await getFeatureUsage(featureType);
  if (!check.allowed) return check;
  await base44.entities.UsageRecord.create({ feature_type: featureType, week_start: getWeekStart() });
  return { allowed: true, remaining: check.remaining - 1, used: check.used + 1, limit: check.limit, isPremium: false };
}