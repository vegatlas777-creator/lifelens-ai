export const CATEGORIES = [
  { value: 'weight_loss', label: 'Weight Loss', emoji: '⚖️' },
  { value: 'weight_maintenance', label: 'Weight Maintenance', emoji: '🔧' },
  { value: 'weight_gain', label: 'Weight Gain', emoji: '💪' },
  { value: 'nutrition', label: 'Nutrition', emoji: '🥗' },
  { value: 'calorie_tracking', label: 'Calorie Tracking', emoji: '🔢' },
  { value: 'fitness', label: 'Fitness', emoji: '🏋️' },
  { value: 'walking', label: 'Walking', emoji: '🚶' },
  { value: 'running', label: 'Running', emoji: '🏃' },
  { value: 'cycling', label: 'Cycling', emoji: '🚴' },
  { value: 'motivation', label: 'Motivation', emoji: '🔥' },
  { value: 'success_stories', label: 'Success Stories', emoji: '🏆' },
  { value: 'qa', label: 'Questions & Answers', emoji: '❓' },
  { value: 'general_wellness', label: 'General Wellness', emoji: '🌿' },
];

export function getCategoryMeta(value) {
  return CATEGORIES.find((c) => c.value === value) || { label: value, emoji: '📌' };
}

export function timeAgo(dateStr) {
  const now = new Date();
  const past = new Date(dateStr);
  const diff = Math.floor((now - past) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en', { month: 'short', day: 'numeric' });
}