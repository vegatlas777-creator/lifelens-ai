import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Camera, Mic, Keyboard, Loader2, Flame, Trash2, X, ArrowRight, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTodayStr } from '@/lib/dateUtils';
import { useUsage } from '@/hooks/useUsage';
import UsageBanner from '@/components/UsageBanner';
import { useAuth } from '@/lib/AuthContext';

const mealTypes = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

export default function CalorieCounter() {
  const [mode, setMode] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [textDesc, setTextDesc] = useState('');
  const [mealType, setMealType] = useState('snack');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [entries, setEntries] = useState([]);
  const [recording, setRecording] = useState(false);
  const fileRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const { calorie, consume } = useUsage();
  const { guard } = useAuth();
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => { loadEntries(); }, []);

  async function loadEntries() {
    try {
      const today = getTodayStr();
      const data = await base44.entities.FoodEntry.filter({ entry_date: today }, '-created_date');
      setEntries(data);
    } catch (e) { console.error(e); }
  }

  async function handlePhoto(file) {
    if (!file) return;
    if (!guard()) return;
    setError(null); setResult(null); setLimitReached(false);
    const check = await consume('calorie_analysis');
    if (!check.allowed) {
      setLimitReached(true);
      setImagePreview(URL.createObjectURL(file));
      return;
    }
    setImagePreview(URL.createObjectURL(file));
    setLoading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const response = await base44.functions.invoke('analyze-meal', { image_url: file_url });
      setResult({ ...response.data, image_url: file_url });
    } catch (e) {
      setError('Could not analyze the image. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function analyzeTextOrVoice(description) {
    if (!description.trim()) return;
    if (!guard()) return;
    setError(null); setResult(null); setLimitReached(false);
    const check = await consume('calorie_analysis');
    if (!check.allowed) {
      setLimitReached(true);
      return;
    }
    setLoading(true);
    try {
      const response = await base44.functions.invoke('analyze-meal', { description });
      setResult(response.data);
    } catch (e) {
      setError('Could not analyze the meal description. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function startRecording() {
    if (!guard()) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
        setRecording(false); setLoading(true); setError(null);
        try {
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          const response = await base44.functions.invoke('transcribe-audio', { audio_url: file_url });
          const transcript = response.data.transcript;
          setTextDesc(transcript);
          await analyzeTextOrVoice(transcript);
        } catch (e) {
          setError('Could not transcribe audio. Try typing instead.');
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch (e) {
      setError('Microphone access denied. Try typing instead.');
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && recording) mediaRecorderRef.current.stop();
  }

  async function saveEntry() {
    if (!result) return;
    if (!guard()) return;
    try {
      await base44.entities.FoodEntry.create({
        meal_type: mealType,
        description: result.description,
        image_url: result.image_url || null,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fats: result.fats,
        fiber: result.fiber,
        entry_date: getTodayStr(),
      });
      setResult(null); setImagePreview(null); setTextDesc(''); setMode(null);
      await loadEntries();
    } catch (e) {
      setError('Could not save the meal. Please try again.');
      console.error(e);
    }
  }

  async function deleteEntry(id) {
    try {
      await base44.entities.FoodEntry.delete(id);
      setEntries(entries.filter((e) => e.id !== id));
    } catch (e) { console.error(e); }
  }

  function resetAll() {
    setMode(null); setImagePreview(null); setTextDesc(''); setResult(null); setError(null); setLimitReached(false);
  }

  const todayTotals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + (e.calories || 0),
      protein: acc.protein + (e.protein || 0),
      carbs: acc.carbs + (e.carbs || 0),
      fats: acc.fats + (e.fats || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  return (
    <div className="min-h-screen bg-[#FFF0F5] pb-4">
      <div className="px-5 pt-12 pb-3">
        <h1 className="text-2xl font-bold text-[#4A0E2E] font-heading">Calorie Counter</h1>
        <p className="text-sm text-[#B0407A]">Log meals by photo, voice, or text</p>
      </div>

      <div className="px-5 mt-2">
        <div className="mb-3">
          <UsageBanner usage={calorie} label="Calorie Analyses" icon={Flame} />
        </div>

        {/* Today summary */}
        <div className="relative overflow-hidden rounded-3xl border border-[#FFC0D6] shadow-sm shadow-pink-200/60">
          <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF149C]/90 to-[#E91E63]/75" />
          <div className="relative p-5 text-white">
            <p className="text-sm opacity-80 font-medium">Today's Intake</p>
            <p className="text-4xl font-bold mt-1 font-heading">{Math.round(todayTotals.calories)} <span className="text-base font-normal opacity-80">kcal</span></p>
            <div className="flex gap-4 mt-3 pt-3 border-t border-white/25">
              <MacroPill label="Protein" value={todayTotals.protein} unit="g" />
              <MacroPill label="Carbs" value={todayTotals.carbs} unit="g" />
              <MacroPill label="Fats" value={todayTotals.fats} unit="g" />
            </div>
          </div>
        </div>

        {/* Mode selector */}
        {!mode && !result && (
          <div className="grid grid-cols-3 gap-3 mt-5">
            <ModeButton icon={Camera} label="Photo" onClick={() => { setMode('photo'); setTimeout(() => fileRef.current?.click(), 100); }} />
            <ModeButton icon={Mic} label="Voice" onClick={() => { setMode('voice'); startRecording(); }} />
            <ModeButton icon={Keyboard} label="Text" onClick={() => setMode('text')} />
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handlePhoto(e.target.files[0])} />

        {mode === 'photo' && (imagePreview || loading) && (
          <div className="mt-4">
            {imagePreview && (
              <div className="relative rounded-3xl overflow-hidden border border-[#FFC0D6] shadow-sm shadow-pink-200/60">
                <img src={imagePreview} alt="food" className="w-full h-48 object-cover" />
                {!loading && <button onClick={resetAll} className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur"><X size={18} className="text-[#4A0E2E]" /></button>}
              </div>
            )}
          </div>
        )}

        {mode === 'voice' && (
          <div className="mt-4 flex flex-col items-center gap-3 py-8 rounded-3xl bg-white border border-[#FFC0D6] shadow-sm shadow-pink-200/60">
            <button
              onClick={recording ? stopRecording : startRecording}
              className={`p-6 rounded-full transition-all ${recording ? 'bg-red-500 text-white animate-pulse' : 'bg-gradient-to-br from-[#FF69B4] to-[#FF149C] text-white shadow-lg shadow-pink-300/50'}`}
            >
              <Mic size={28} />
            </button>
            <p className="text-sm text-[#B0407A]">{recording ? 'Tap to stop recording' : 'Tap to describe your meal'}</p>
          </div>
        )}

        {mode === 'text' && !result && (
          <div className="mt-4 space-y-3">
            <textarea
              value={textDesc}
              onChange={(e) => setTextDesc(e.target.value)}
              placeholder="Describe what you ate... e.g., 'A bowl of oatmeal with banana and honey'"
              className="w-full rounded-2xl bg-white border border-[#FFC0D6] shadow-sm shadow-pink-200/60 p-4 text-sm resize-none focus:outline-none focus:border-[#FF149C] min-h-24 text-[#4A0E2E]"
            />
            <button
              onClick={() => analyzeTextOrVoice(textDesc)}
              disabled={!textDesc.trim() || loading}
              className="w-full rounded-full bg-gradient-to-r from-[#FF69B4] to-[#FF149C] text-white py-3 font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-pink-300/50"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <>Estimate Nutrition <ArrowRight size={16} /></>}
            </button>
          </div>
        )}

        {loading && !result && (
          <div className="flex flex-col items-center gap-3 mt-6 py-8">
            <Loader2 size={32} className="text-[#FF149C] animate-spin" />
            <p className="text-sm text-[#B0407A]">Estimating nutrition with AI...</p>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {limitReached && (
          <div className="mt-4 rounded-3xl bg-gradient-to-br from-[#FFD9E6] to-[#FFC0D6] border border-[#FF69B4]/40 p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto mb-3 shadow-sm shadow-pink-200/60">
              <Crown size={24} className="text-[#FF149C]" />
            </div>
            <p className="text-sm font-semibold text-[#4A0E2E]">Weekly Limit Reached</p>
            <p className="text-xs text-[#B0407A] mt-1 leading-relaxed">
              You have used all 5 free calorie analyses for this week. Upgrade to Premium for unlimited calorie analysis, unlimited food photo uploads, personalized AI coaching, and advanced progress tracking.
            </p>
            <Link to="/pricing" className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FF69B4] to-[#FF149C] text-white text-sm font-semibold shadow-md shadow-pink-300/50">
              <Crown size={16} /> Upgrade to Premium <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {result && (
          <div className="mt-5 space-y-4">
            <div className="rounded-3xl bg-white border border-[#FFC0D6] shadow-sm shadow-pink-200/60 p-5">
              <p className="font-semibold text-[#4A0E2E]">{result.description}</p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <ResultStat label="Calories" value={`${result.calories}`} unit="kcal" icon={Flame} />
                <ResultStat label="Protein" value={`${result.protein}`} unit="g" />
                <ResultStat label="Carbs" value={`${result.carbs}`} unit="g" />
                <ResultStat label="Fats" value={`${result.fats}`} unit="g" />
                <ResultStat label="Fiber" value={`${result.fiber}`} unit="g" />
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-[#B0407A] mb-2 px-1">Save as</p>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {mealTypes.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMealType(m.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${mealType === m.value ? 'bg-[#E91E63] text-white' : 'bg-white border border-[#FFC0D6] text-[#B0407A]'}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={resetAll} className="flex-1 rounded-full border border-[#FFC0D6] bg-white py-3 font-medium text-sm text-[#4A0E2E]">Cancel</button>
              <button onClick={saveEntry} className="flex-1 rounded-full bg-gradient-to-r from-[#FF69B4] to-[#FF149C] text-white py-3 font-medium text-sm shadow-md shadow-pink-300/50">Save to Diary</button>
            </div>
          </div>
        )}

        <div className="mt-8">
          <h3 className="font-semibold text-sm mb-3 text-[#4A0E2E]">Today's Diary</h3>
          {entries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#FFC0D6] p-8 text-center">
              <p className="text-sm text-[#B0407A]">No meals logged yet today.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((e) => (
                <div key={e.id} className="rounded-2xl bg-white border border-[#FFC0D6] shadow-sm shadow-pink-200/60 p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wide bg-[#FFD9E6] text-[#E91E63] px-2 py-0.5 rounded-full font-medium">{e.meal_type}</span>
                      <span className="text-sm font-medium truncate text-[#4A0E2E]">{e.description}</span>
                    </div>
                    <p className="text-xs text-[#B0407A] mt-1">{Math.round(e.calories)} kcal · P{Math.round(e.protein)}g · C{Math.round(e.carbs)}g · F{Math.round(e.fats)}g</p>
                  </div>
                  <button onClick={() => deleteEntry(e.id)} className="p-2 text-[#D67A9E] hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          <p className="text-[11px] text-[#D67A9E] text-center leading-relaxed">
            ⚠️ Calorie and nutrition estimates are AI-generated approximations and may not be exact. Not medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}

function ModeButton({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="rounded-2xl bg-white border border-[#FFC0D6] shadow-sm shadow-pink-200/60 p-4 flex flex-col items-center gap-2 hover:border-[#FF149C] transition-colors">
      <div className="p-2.5 rounded-xl bg-[#FFD9E6]">
        <Icon size={20} className="text-[#FF149C]" />
      </div>
      <span className="text-xs font-medium text-[#4A0E2E]">{label}</span>
    </button>
  );
}

function MacroPill({ label, value, unit }) {
  return (
    <div>
      <p className="text-xs opacity-80">{label}</p>
      <p className="font-semibold text-sm">{Math.round(value)}{unit}</p>
    </div>
  );
}

function ResultStat({ label, value, unit, icon: Icon }) {
  return (
    <div className="rounded-xl bg-[#FFF0F5] p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon size={12} className="text-[#E91E63]" />}
        <span className="text-xs text-[#B0407A]">{label}</span>
      </div>
      <p className="text-xl font-bold text-[#4A0E2E]">{value} <span className="text-xs font-normal text-[#D67A9E]">{unit}</span></p>
    </div>
  );
}