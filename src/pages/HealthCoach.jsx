import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageCircle, Send, Loader2, Sparkles, Trash2 } from 'lucide-react';

const SYSTEM_CONTEXT = `You are LifeLens AI, a friendly and knowledgeable health coach. You help users with:
- Nutrition questions and calorie explanations
- Workout suggestions and fitness goals
- Healthy habit encouragement
- Explaining how BMR/TDEE and calorie burning work
Always be encouraging, clear, and concise. Keep responses under 200 words unless the user asks for detail. Always remind users that your advice is educational and not a substitute for professional medical guidance.`;

export default function HealthCoach() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function loadMessages() {
    try {
      const data = await base44.entities.ChatMessage.list('-created_date', 30);
      setMessages(data.reverse());
      if (data.length === 0) {
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: "Hi! I'm your AI Health Coach 🌿 Ask me about nutrition, calories, workouts, or any health questions. How can I help you today?",
        }]);
      }
    } catch (e) { console.error(e); }
  }

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');

    const tempUser = { id: 'temp-u', role: 'user', content: userMsg };
    setMessages((prev) => [...prev, tempUser]);
    setLoading(true);

    try {
      await base44.entities.ChatMessage.create({ role: 'user', content: userMsg });

      const history = messages.filter((m) => m.id !== 'welcome').map((m) => ({ role: m.role, content: m.content }));

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_CONTEXT}\n\nConversation so far:\n${history.map((m) => `${m.role}: ${m.content}`).join('\n')}\n\nUser: ${userMsg}\n\nAssistant:`,
      });

      const assistantMsg = { id: 'temp-a', role: 'assistant', content: response };
      setMessages((prev) => [...prev, assistantMsg]);

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
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Hi! I'm your AI Health Coach 🌿 Ask me about nutrition, calories, workouts, or any health questions. How can I help you today?",
      }]);
    } catch (e) { console.error(e); }
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-7rem)]">
      {/* Header */}
      <div className="px-5 pt-14 pb-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
            <MessageCircle size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">AI Health Coach</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Sparkles size={10} /> Powered by AI</p>
          </div>
        </div>
        {messages.length > 1 && (
          <button onClick={clearChat} className="p-2 rounded-xl text-muted-foreground hover:text-destructive">
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-card border border-border rounded-bl-md'}`}>
              <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-3 border-t border-border bg-background">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask about nutrition, workouts..."
            className="flex-1 rounded-2xl bg-card border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
          />
          <button onClick={send} disabled={!input.trim() || loading} className="p-2.5 rounded-2xl bg-primary text-primary-foreground disabled:opacity-50">
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground/70 text-center mt-2">⚠️ AI responses are educational and not medical advice.</p>
      </div>
    </div>
  );
}