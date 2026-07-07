export const videoLibrary = {
  'Hip Hop Dance': 'https://media.base44.com/videos/public/6a4d2399ef3bc08d1d9e1e75/d517aba64_Hip_Hop_Dance.mp4',
  'Latin Dance': 'https://media.base44.com/videos/public/6a4d2399ef3bc08d1d9e1e75/87a62cebb_Latin_Dance.mp4',
  'Street Dance': 'https://media.base44.com/videos/public/6a4d2399ef3bc08d1d9e1e75/b43173c5e_Street_Dance.mp4',
  'Ballet Barre': 'https://media.base44.com/videos/public/6a4d2399ef3bc08d1d9e1e75/d418fad59_Ballet_Barre.mp4',
  'Aerobic Dance': 'https://media.base44.com/videos/public/6a4d2399ef3bc08d1d9e1e75/d517aba64_Hip_Hop_Dance.mp4',
  'Beginner Cardio': 'https://media.base44.com/videos/public/6a4d2399ef3bc08d1d9e1e75/87a62cebb_Latin_Dance.mp4',
};

function v(cat) { return videoLibrary[cat] || videoLibrary['Hip Hop Dance']; }

export const workoutLibrary = [
  { id: 'hh1', name: 'Hip Hop Basics', category: 'Hip Hop Dance', duration: 10, met: 7.3, videoUrl: v('Hip Hop Dance'), description: 'Learn foundational hip hop moves in a fun 10-minute routine.', color: 'from-purple-500 to-pink-500' },
  { id: 'hh2', name: 'Hip Hop Cardio Flow', category: 'Hip Hop Dance', duration: 10, met: 7.8, videoUrl: v('Hip Hop Dance'), description: 'High-energy hip hop choreography to get your heart pumping.', color: 'from-purple-500 to-pink-500' },
  { id: 'hh3', name: 'Street Style Grooves', category: 'Hip Hop Dance', duration: 10, met: 7.5, videoUrl: v('Hip Hop Dance'), description: 'Urban grooves and body isolation techniques.', color: 'from-purple-500 to-pink-500' },
  { id: 'lt1', name: 'Salsa Beginners', category: 'Latin Dance', duration: 10, met: 6.5, videoUrl: v('Latin Dance'), description: 'Basic salsa steps with Latin rhythm.', color: 'from-orange-500 to-red-500' },
  { id: 'lt2', name: 'Bachata Flow', category: 'Latin Dance', duration: 10, met: 6.2, videoUrl: v('Latin Dance'), description: 'Smooth bachata movements for all levels.', color: 'from-orange-500 to-red-500' },
  { id: 'lt3', name: 'Latin Cardio Party', category: 'Latin Dance', duration: 10, met: 7.0, videoUrl: v('Latin Dance'), description: 'Zumba-style Latin dance workout.', color: 'from-orange-500 to-red-500' },
  { id: 'st1', name: 'Street Dance Foundations', category: 'Street Dance', duration: 10, met: 7.0, videoUrl: v('Street Dance'), description: 'Core street dance moves and footwork.', color: 'from-blue-500 to-indigo-500' },
  { id: 'st2', name: 'Breakdance Intro', category: 'Street Dance', duration: 10, met: 7.6, videoUrl: v('Street Dance'), description: 'Beginner-friendly breaking fundamentals.', color: 'from-blue-500 to-indigo-500' },
  { id: 'st3', name: 'Urban Freestyle', category: 'Street Dance', duration: 10, met: 7.2, videoUrl: v('Street Dance'), description: 'Express yourself with freestyle street moves.', color: 'from-blue-500 to-indigo-500' },
  { id: 'bb1', name: 'Barre Core Workout', category: 'Ballet Barre', duration: 10, met: 5.5, videoUrl: v('Ballet Barre'), description: 'Ballet-inspired barre for core strength.', color: 'from-pink-400 to-rose-500' },
  { id: 'bb2', name: 'Barre Leg Sculpt', category: 'Ballet Barre', duration: 10, met: 5.8, videoUrl: v('Ballet Barre'), description: 'Tone and sculpt your legs with barre technique.', color: 'from-pink-400 to-rose-500' },
  { id: 'bb3', name: 'Barre Posture & Flow', category: 'Ballet Barre', duration: 10, met: 5.3, videoUrl: v('Ballet Barre'), description: 'Improve posture with elegant barre flow.', color: 'from-pink-400 to-rose-500' },
  { id: 'ae1', name: 'Aerobic Dance Blast', category: 'Aerobic Dance', duration: 10, met: 6.8, videoUrl: v('Aerobic Dance'), description: 'Classic aerobics with a modern dance twist.', color: 'from-emerald-500 to-teal-500' },
  { id: 'ae2', name: 'Dance Cardio Burn', category: 'Aerobic Dance', duration: 10, met: 7.1, videoUrl: v('Aerobic Dance'), description: 'High-calorie-burn aerobic dance session.', color: 'from-emerald-500 to-teal-500' },
  { id: 'bc1', name: 'Beginner Cardio Walk', category: 'Beginner Cardio', duration: 10, met: 4.5, videoUrl: v('Beginner Cardio'), description: 'Low-impact cardio perfect for starters.', color: 'from-cyan-500 to-blue-500' },
  { id: 'bc2', name: 'Gentle Cardio Flow', category: 'Beginner Cardio', duration: 10, met: 4.8, videoUrl: v('Beginner Cardio'), description: 'Easy-paced cardio to build endurance.', color: 'from-cyan-500 to-blue-500' },
  { id: 'bc3', name: 'Step Cardio Basics', category: 'Beginner Cardio', duration: 10, met: 5.0, videoUrl: v('Beginner Cardio'), description: 'Simple step patterns for beginner cardio.', color: 'from-cyan-500 to-blue-500' },
];

export const categories = ['Hip Hop Dance', 'Latin Dance', 'Street Dance', 'Ballet Barre', 'Aerobic Dance', 'Beginner Cardio'];

export const activityLevels = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise', multiplier: 1.2 },
  { value: 'light', label: 'Lightly Active', desc: 'Exercise 1-3 days/week', multiplier: 1.375 },
  { value: 'moderate', label: 'Moderately Active', desc: 'Exercise 3-5 days/week', multiplier: 1.55 },
  { value: 'active', label: 'Very Active', desc: 'Exercise 6-7 days/week', multiplier: 1.725 },
  { value: 'very_active', label: 'Extra Active', desc: 'Hard exercise or physical job', multiplier: 1.9 },
];

export function calculateCaloriesBurned(met, weightKg, durationMin = 10) {
  return Math.round(met * weightKg * (durationMin / 60));
}