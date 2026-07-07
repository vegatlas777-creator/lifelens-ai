import { useState, useEffect, useCallback } from 'react';
import { getUsageCount, consumeFeature, WEEKLY_LIMITS } from '@/lib/usageTracking';
import { getSubscriptionStatus } from '@/lib/subscription';

export function useUsage() {
  const [material, setMaterial] = useState({ loading: true });
  const [calorie, setCalorie] = useState({ loading: true });
  const [isPremium, setIsPremium] = useState(false);

  const load = useCallback(async () => {
    const sub = await getSubscriptionStatus();
    setIsPremium(sub.isPremium);
    if (sub.isPremium) {
      setMaterial({ allowed: true, remaining: Infinity, used: 0, limit: Infinity, isPremium: true, loading: false });
      setCalorie({ allowed: true, remaining: Infinity, used: 0, limit: Infinity, isPremium: true, loading: false });
      return;
    }
    const [mUsed, cUsed] = await Promise.all([
      getUsageCount('material_check'),
      getUsageCount('calorie_analysis'),
    ]);
    setMaterial({ allowed: mUsed < WEEKLY_LIMITS.material_check, remaining: Math.max(WEEKLY_LIMITS.material_check - mUsed, 0), used: mUsed, limit: WEEKLY_LIMITS.material_check, isPremium: false, loading: false });
    setCalorie({ allowed: cUsed < WEEKLY_LIMITS.calorie_analysis, remaining: Math.max(WEEKLY_LIMITS.calorie_analysis - cUsed, 0), used: cUsed, limit: WEEKLY_LIMITS.calorie_analysis, isPremium: false, loading: false });
  }, []);

  useEffect(() => { load(); }, [load]);

  const consume = useCallback(async (featureType) => {
    const res = await consumeFeature(featureType);
    if (!res.isPremium) {
      if (featureType === 'material_check') setMaterial({ ...res, loading: false });
      if (featureType === 'calorie_analysis') setCalorie({ ...res, loading: false });
    }
    return res;
  }, []);

  return { material, calorie, isPremium, reload: load, consume };
}