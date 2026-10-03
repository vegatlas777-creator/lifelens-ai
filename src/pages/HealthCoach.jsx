import React, { useState, useEffect, useRef, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Loader2, Sparkles, Trash2, Crown, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSubscriptionStatus } from '@/lib/subscription';
import { getTodayStr } from '@/lib/dateUtils';
import { useAuth } from '@/lib/AuthContext';
import BackButton from '@/components/BackButton';

const WELLNESS_TIPS = [
  { icon: '💧', text: 'Start your day with a glass of water — hydration boosts metabolism and energy.' },
  { icon: '🚶', text: 'A 10-minute walk after meals can improve digestion and blood sugar control.' },
  { icon: '🥗', text: 'Fill half your plate with vegetables at every meal for natural fiber and vitamins.' },
  { icon: '😴', text: 'Aim for 7–9 hours of sleep — recovery is when your body rebuilds and strengthens.' },
  { icon: '🧘', text: 'Take 3 deep breaths before eating. Mindful meals improve digestion and satisfaction.' },
  { icon: '💪', text: 'Strength training 2× a week preserves muscle and keeps your metabolism humming.' },
  { icon: '☀️', text: 'Morning sunlight for 10 minutes helps regulate your sleep-wake cycle.' },
];

export default function HealthCoach() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [subStatus, setSubStatus] = useState({ isPremium: false, loading: true });
  const { guard } = useAuth();
  const scrollRef = useRef(null);

  const dailyTip = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return WELLNESS_TIPS[dayOfYear % WELLNESS_TIPS.length];
  }, []);

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
    if (!guard()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { id: 'temp-u', role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      await base44.entities.ChatMessage.create({ role: 'user', content: userMsg });
      const history = messages.filter((m) => m.id !== 'welcome').map((m) => ({ role: m.role, content: m.content }));
      const today = getTodayStr();
      const response = await base44.functions.invoke('coach-reply', { message: userMsg, history, today });
      const reply = response.data.reply;
      setMessages((prev) => [...prev, { id: 'temp-a', role: 'assistant', content: reply }]);
      await base44.entities.ChatMessage.create({ role: 'assistant', content: reply });
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
    <div className="flex flex-col h-[calc(100dvh-7rem)]" style={{ backgroundColor: '#F6F1E8' }}>
      <div className="px-5 pt-12 pb-4 border-b border-[#E5DDD1]">
        <BackButton />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FFFDFC] border border-[#E5DDD1] shadow-sm shadow-black/5">
              <Sparkles size={22} className="text-[#2D9F6A]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#0A0A0A] font-heading">AI Health Coach</h1>
              <p className="text-xs text-[#737373] flex items-center gap-1"><Sparkles size={10} /> Powered by AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!subStatus.isPremium && (
              <Link to="/pricing" className="p-2 rounded-xl bg-gradient-to-br from-[#2D9F6A] to-[#1F8A58] text-white shadow-md shadow-black/10">
                <Crown size={18} />
              </Link>
            )}
            {messages.length > 1 && (
              <button onClick={clearChat} className="p-2 rounded-xl text-[#737373] hover:text-red-500">
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Daily wellness tip */}
      <div className="px-5 py-3">
        <div className="rounded-2xl bg-[#FFFDFC] border border-[#E5DDD1] shadow-sm shadow-black/5 p-3.5 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#FDF6E3] flex-shrink-0">
            <Lightbulb size={18} className="text-[#B8902E]" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#B8902E]">Daily Tip</p>
            <p className="text-sm text-[#404040] mt-1 leading-relaxed">
              <span className="mr-1">{dailyTip.icon}</span>{dailyTip.text}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-3xl px-4 py-2.5 text-sm ${m.role === 'user' ? 'bg-gradient-to-br from-[#2D9F6A] to-[#1F8A58] text-white rounded-br-md shadow-md shadow-black/10' : 'bg-[#FFFDFC] border border-[#E5DDD1] text-[#0A0A0A] rounded-bl-md shadow-sm shadow-black/5'}`}>
              <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#FFFDFC] border border-[#E5DDD1] rounded-3xl rounded-bl-md px-4 py-3 flex items-center gap-2 shadow-sm shadow-black/5">
              <Loader2 size={14} className="animate-spin text-[#2D9F6A]" />
              <span className="text-xs text-[#737373]">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="px-5 py-3 border-t border-[#E5DDD1]" style={{ backgroundColor: '#F6F1E8' }}>
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask about nutrition, workouts..."
            className="flex-1 rounded-full bg-[#FFFDFC] border border-[#E5DDD1] shadow-sm shadow-black/5 px-4 py-2.5 text-sm focus:outline-none focus:border-[#2D9F6A] text-[#0A0A0A]"
          />
          <button onClick={send} disabled={!input.trim() || loading} className="p-2.5 rounded-full bg-gradient-to-br from-[#2D9F6A] to-[#1F8A58] text-white shadow-md shadow-black/10 disabled:opacity-50">
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-[#A3A3A3] text-center mt-2">⚠️ AI responses are educational and not medical advice.</p>
      </div>
    </div>
  );
}