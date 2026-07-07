import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Loader2, Sparkles, Trash2, Crown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSubscriptionStatus } from '@/lib/subscription';
import { getTodayStr } from '@/lib/dateUtils';

const SYSTEM_CONTEXT = `You are the AI Health Coach for "3 in 1 Healthy Choice", a supportive wellness coach and motivator. Your role:
- Encourage healthy habits and celebrate milestones (e.g., hitting step goals, logging meals consistently, completing workouts)
- Track user progress and suggest realistic, achievable fitness goals
- Help users stay consistent with gentle accountability and positive reinforcement
- Answer nutrition questions, explain calorie/BMR/TDEE calculations
- Suggest workouts (dance, walking, running) with estimated calorie burns
- Provide personalized recommendations based on the user's context provided
- Be warm, energetic, and motivational — like a supportive fitness friend
Keep responses under 200 words unless the user asks for detail. Use emojis occasionally to feel encouraging. Always remind that advice is educational and not a substitute for professional medical guidance.`;

export default function HealthCoach() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [subStatus, setSubStatus] = useState({ isPremium: false, loading: true });
  const scrollRef = useRef(null);

  useEffect(() => {
    loadMessages();
    getSubscriptionStatus().then(setSubStatus);
  }, []);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  async function loadMessages() {
    try {
      const data = await base44.entities.ChatMessage.list('-created_date', 30);
      setMessages(data.reverse());
      if (data.length === 0) {
        setMessages([{ id: 'welcome', role: 'assistant', content: "Hi! I'm your AI Health Coach 🔥 I'm here to support your wellness journey — ask me about nutrition, workouts, calorie goals, or anything health-related. Let's make today count! 💪" }]);
      }
    } catch (e) { console.error(e); }
  }

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { id: 'temp-u', role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      await base44.entities.ChatMessage.create({ role: 'user', content: userMsg });
      const history = messages.filter((m) => m.id !== 'welcome').map((m) => ({ role: m.role, content: m.content }));
      const today = getTodayStr();
      const [foodEntries, workouts, activityLogs, profiles] = await Promise.all([
        base44.entities.FoodEntry.filter({ entry_date: today }),
        base44.entities.WorkoutLog.filter({ completed_date: today }),
        base44.entities.ActivityLog.filter({ log_date: today }),
        base44.entities.MetabolicProfile.list('-created_date', 1),
      ]);
      const todayCalories = foodEntries.reduce((s, e) => s + (e.calories || 0), 0);
      const todaySteps = activityLogs.reduce((s, l) => s + (l.steps || 0), 0);
      const todayBurned = workouts.reduce((s, w) => s + (w.calories_burned || 0), 0);
      const profile = profiles[0];
      const userContext = `User's progress today: ${todayCalories} calories consumed (target: ${profile?.target_calories || 2000}), ${todaySteps} steps, ${todayBurned} calories burned from workouts. Goal: ${profile?.goal || 'maintenance'}. Activity level: ${profile?.activity_level || 'moderate'}.`;
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_CONTEXT}\n\n${userContext}\n\nConversation so far:\n${history.map((m) => `${m.role}: ${m.content}`).join('\n')}\n\nUser: ${userMsg}\n\nAssistant:`,
      });
      setMessages((prev) => [...prev, { id: 'temp-a', role: 'assistant', content: response }]);
      await base44.entities.ChatMessage.create({ role: 'assistant', content: response });
    } catch (e) {
      setMessages((prev) => [...prev, { id: 'err', role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.' }]);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function clearChat() {
    try {
      await base44.entities.ChatMessage.deleteMany({});
      setMessages([{ id: 'welcome', role: 'assistant', content: "Hi! I'm your AI Health Coach 🔥 I'm here to support your wellness journey — ask me about nutrition, workouts, calorie goals, or anything health-related. Let's make today count! 💪" }]);
    } catch (e) { console.error(e); }
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-7rem)] bg-[#FDFBF8]">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 border-b border-[#F5EFE6] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#FDDDBD]">
            <Sparkles size={22} className="text-[#E8821E]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A]">AI Health Coach</h1>
            <p className="text-xs text-[#666] flex items-center gap-1"><Sparkles size={10} /> Powered by AI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!subStatus.isPremium && (
            <Link to="/pricing" className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <Crown size={18} />
            </Link>
          )}
          {messages.length > 1 && (
            <button onClick={clearChat} className="p-2 rounded-xl text-[#666] hover:text-red-500">
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-3xl px-4 py-2.5 text-sm ${m.role === 'user' ? 'bg-[#FFD5A8] text-[#1A1A1A] rounded-br-md' : 'bg-white border border-[#F5EFE6] rounded-bl-md'}`}>
              <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-[#F5EFE6] rounded-3xl rounded-bl-md px-4 py-3 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-[#666]" />
              <span className="text-xs text-[#666]">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-3 border-t border-[#F5EFE6] bg-[#FDFBF8]">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask about nutrition, workouts..."
            className="flex-1 rounded-full bg-white border border-[#F5EFE6] px-4 py-2.5 text-sm focus:outline-none focus:border-[#FF9F43] text-[#1A1A1A]"
          />
          <button onClick={send} disabled={!input.trim() || loading} className="p-2.5 rounded-full bg-[#FFD5A8] text-[#1A1A1A] disabled:opacity-50">
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-[#999] text-center mt-2">⚠️ AI responses are educational and not medical advice.</p>
      </div>
    </div>
  );
}