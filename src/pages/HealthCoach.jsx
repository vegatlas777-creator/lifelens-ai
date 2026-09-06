import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Loader2, Sparkles, Trash2, Crown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSubscriptionStatus } from '@/lib/subscription';
import { getTodayStr } from '@/lib/dateUtils';

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
    <div className="flex flex-col h-[calc(100dvh-7rem)] bg-[#0A1628]">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 border-b border-[#1E293B] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#1E293B]">
            <Sparkles size={22} className="text-[#3B82F6]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#FFFFFF]">AI Health Coach</h1>
            <p className="text-xs text-[#C7D2FE] flex items-center gap-1"><Sparkles size={10} /> Powered by AI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!subStatus.isPremium && (
            <Link to="/pricing" className="p-2 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white">
              <Crown size={18} />
            </Link>
          )}
          {messages.length > 1 && (
            <button onClick={clearChat} className="p-2 rounded-xl text-[#C7D2FE] hover:text-red-500">
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-3xl px-4 py-2.5 text-sm ${m.role === 'user' ? 'bg-[#3B82F6] text-[#FFFFFF] rounded-br-md' : 'bg-white/5 border border-[#1E293B] rounded-bl-md'}`}>
              <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-[#1E293B] rounded-3xl rounded-bl-md px-4 py-3 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-[#C7D2FE]" />
              <span className="text-xs text-[#C7D2FE]">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-3 border-t border-[#1E293B] bg-[#0A1628]">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask about nutrition, workouts..."
            className="flex-1 rounded-full bg-white/5 border border-[#1E293B] px-4 py-2.5 text-sm focus:outline-none focus:border-[#2563EB] text-[#FFFFFF]"
          />
          <button onClick={send} disabled={!input.trim() || loading} className="p-2.5 rounded-full bg-[#3B82F6] text-[#FFFFFF] disabled:opacity-50">
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-[#94A3B8] text-center mt-2">⚠️ AI responses are educational and not medical advice.</p>
      </div>
    </div>
  );
}