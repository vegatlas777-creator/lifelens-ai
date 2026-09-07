import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Camera, Upload, Leaf, Shield, HeartPulse, Wind, Zap, Activity, Trophy, Target, ArrowRight, Crown, X, Loader2, Recycle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUsage } from '@/hooks/useUsage';
import UsageBanner from '@/components/UsageBanner';
import { useAuth } from '@/lib/AuthContext';

export default function ClothingAnalyzer() {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [limitReached, setLimitReached] = useState(false);
  const fileRef = useRef(null);
  const { material, consume } = useUsage();
  const { guard } = useAuth();

  async function handleFile(file) {
    if (!file) return;
    if (!guard()) return;
    setError(null);
    setAnalysis(null);
    setLimitReached(false);
    const check = await consume('material_check');
    if (!check.allowed) {
      setLimitReached(true);
      setImagePreview(URL.createObjectURL(file));
      return;
    }
    setImagePreview(URL.createObjectURL(file));
    setLoading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImageUrl(file_url);

      const response = await base44.functions.invoke('analyze-clothing', { image_url: file_url });
      const result = response.data;

      setAnalysis(result);

      await base44.entities.ClothingAnalysis.create({
        image_url: file_url,
        sport_type: result.sport_type,
        garment_type: result.garment_type,
        materials: result.materials,
        summary: result.summary,
        performance_score: result.performance_score,
        breathability_score: result.breathability_score,
        comfort_score: result.comfort_score,
        durability_score: result.durability_score,
        fit_score: result.fit_score,
        recommended_sports: result.recommended_sports,
        alternatives: result.alternatives,
      });
    } catch (e) {
      setError('Could not analyze the sports garment. Please try a clearer photo of the clothing item.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setImagePreview(null);
    setImageUrl(null);
    setAnalysis(null);
    setError(null);
    setLimitReached(false);
  }

  return (
    <div className="min-h-screen bg-[#F5F0FF] pb-4">
      <div className="px-5 pt-12 pb-3">
        <h1 className="text-2xl font-bold text-[#2E1065] font-heading">Sports Clothing Analyzer</h1>
        <p className="text-sm text-[#7E5BA8]">AI-powered sports gear performance scan</p>
      </div>

      <div className="px-5 mt-2">
        <div className="mb-3">
          <UsageBanner usage={material} label="Material Checks" icon={Leaf} />
        </div>

        {!imagePreview && (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-3xl border-2 border-dashed border-[#D4C2F5] bg-white hover:border-[#7C3AED] transition-colors p-10 flex flex-col items-center gap-3 shadow-sm shadow-purple-200/60"
          >
            <div className="p-4 rounded-2xl bg-[#EDE5FF]">
              <Camera size={32} className="text-[#7C3AED]" />
            </div>
            <p className="font-semibold text-[#2E1065]">Scan Sports Gear</p>
            <p className="text-sm text-[#7E5BA8] text-center max-w-xs">Upload a photo of any sports clothing item — our AI evaluates how well it performs for your sport.</p>
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {imagePreview && (
          <div className="relative rounded-3xl overflow-hidden border border-[#D4C2F5] shadow-sm shadow-purple-200/60">
            <img src={imagePreview} alt="sports clothing" className="w-full h-56 object-cover" />
            {!loading && (
              <button onClick={reset} className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur">
                <X size={18} className="text-[#2E1065]" />
              </button>
            )}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center gap-3 mt-6 py-8">
            <Loader2 size={32} className="text-[#7C3AED] animate-spin" />
            <p className="text-sm text-[#7E5BA8]">Analyzing sports gear with AI...</p>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {limitReached && (
          <div className="mt-4 rounded-3xl bg-gradient-to-br from-[#EDE5FF] to-[#D4C2F5] border border-[#9333EA]/40 p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto mb-3 shadow-sm shadow-purple-200/60">
              <Crown size={24} className="text-[#7C3AED]" />
            </div>
            <p className="text-sm font-semibold text-[#2E1065]">Weekly Limit Reached</p>
            <p className="text-xs text-[#7E5BA8] mt-1 leading-relaxed">
              You have used all 5 free material checks for this week. Upgrade to Premium for unlimited sports gear checks, unlimited calorie analysis, personalized AI coaching, and advanced progress tracking.
            </p>
            <Link to="/pricing" className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#9333EA] to-[#7C3AED] text-white text-sm font-semibold shadow-md shadow-purple-300/50">
              <Crown size={16} /> Upgrade to Premium <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {analysis && (
          <div className="mt-5 space-y-4">
            {/* Sport type badge */}
            {analysis.sport_type && (
              <div className="rounded-2xl bg-gradient-to-r from-[#9333EA] to-[#7C3AED] p-4 text-white shadow-md shadow-purple-300/50">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy size={18} />
                  <span className="text-xs font-medium uppercase tracking-wide opacity-90">Designed for</span>
                </div>
                <p className="text-xl font-bold font-heading">{analysis.sport_type}</p>
                {analysis.garment_type && <p className="text-sm opacity-90 mt-0.5">{analysis.garment_type}</p>}
              </div>
            )}

            {/* Performance scores */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <ScoreCard icon={Zap} label="Performance" score={analysis.performance_score} color="text-[#7C3AED]" />
              <ScoreCard icon={Wind} label="Breathability" score={analysis.breathability_score} color="text-[#6D28D9]" />
              <ScoreCard icon={HeartPulse} label="Comfort" score={analysis.comfort_score} color="text-[#7C3AED]" />
              <ScoreCard icon={Shield} label="Durability" score={analysis.durability_score} color="text-[#6D28D9]" />
              <ScoreCard icon={Activity} label="Fit & Support" score={analysis.fit_score} color="text-[#7C3AED]" />
            </div>

            {/* Summary */}
            <div className="rounded-2xl bg-white border border-[#D4C2F5] shadow-sm shadow-purple-200/60 p-4 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#EDE5FF] text-[#7C3AED] shrink-0">
                <Target size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm text-[#2E1065]">Performance Summary</p>
                <p className="text-xs text-[#7E5BA8] mt-0.5 leading-relaxed">{analysis.summary}</p>
              </div>
            </div>

            {/* Recommended sports */}
            {analysis.recommended_sports?.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-2 px-1 text-[#2E1065]">Recommended Sports</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.recommended_sports.map((sport, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-[#EDE5FF] text-[#6D28D9] text-xs font-medium border border-[#9333EA]">
                      {sport}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Materials */}
            {analysis.materials?.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-2 px-1 text-[#2E1065]">Materials Detected</h3>
                <div className="space-y-3">
                  {analysis.materials.map((mat, i) => (
                    <div key={i} className="rounded-2xl bg-white border border-[#D4C2F5] shadow-sm shadow-purple-200/60 p-4">
                      <p className="font-semibold text-[#2E1065]">{mat.name}</p>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-medium text-emerald-500 mb-1">Pros for Sport</p>
                          <ul className="space-y-1">
                            {mat.advantages?.map((a, j) => (
                              <li key={j} className="text-xs text-[#7E5BA8] flex gap-1">
                                <span className="text-emerald-500">+</span> {a}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-rose-400 mb-1">Cons for Sport</p>
                          <ul className="space-y-1">
                            {mat.disadvantages?.map((d, j) => (
                              <li key={j} className="text-xs text-[#7E5BA8] flex gap-1">
                                <span className="text-rose-500">−</span> {d}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alternatives */}
            {analysis.alternatives?.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-2 px-1 flex items-center gap-2 text-[#2E1065]">
                  <Recycle size={16} className="text-[#6D28D9]" /> Better Sports Alternatives
                </h3>
                <div className="space-y-2">
                  {analysis.alternatives.map((alt, i) => (
                    <div key={i} className="rounded-2xl bg-[#EDE5FF] border border-[#D4C2F5] p-3">
                      <p className="font-medium text-sm text-[#2E1065]">{alt.name}</p>
                      <p className="text-xs text-[#7E5BA8] mt-0.5">{alt.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-full bg-gradient-to-r from-[#9333EA] to-[#7C3AED] text-white py-3 font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-purple-300/50"
            >
              <Upload size={16} /> Analyze Another Item <ArrowRight size={16} />
            </button>
          </div>
        )}

        <div className="mt-6">
          <p className="text-[11px] text-[#A78BD9] text-center leading-relaxed">
            ⚠️ Sports gear analysis is AI-generated and approximate. Not professional advice.
          </p>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ icon: Icon, label, score, color }) {
  const pct = (score / 10) * 100;
  return (
    <div className="rounded-2xl bg-white border border-[#D4C2F5] shadow-sm shadow-purple-200/60 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className={color} />
        <span className="text-xs text-[#7E5BA8] font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-bold text-[#2E1065]">{score ?? '-'}</span>
        <span className="text-xs text-[#A78BD9]">/10</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-[#EDE5FF] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: `hsl(${265 + pct * 0.1}, 80%, 55%)` }} />
      </div>
    </div>
  );
}