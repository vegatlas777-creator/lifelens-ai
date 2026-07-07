import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Camera, Upload, Sparkles, Leaf, Shield, HeartPulse, Recycle, Loader2, X, ArrowRight, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUsage } from '@/hooks/useUsage';
import UsageBanner from '@/components/UsageBanner';

export default function ClothingAnalyzer() {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [limitReached, setLimitReached] = useState(false);
  const fileRef = useRef(null);
  const { material, consume } = useUsage();

  async function handleFile(file) {
    if (!file) return;
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

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert textile and sustainability analyst. Analyze the clothing item in this photo. Examine the garment itself — its fabric texture, weave pattern, sheen, drape, weight, and visual characteristics — to identify the material composition. Do NOT rely on care labels; identify the fabric by visually analyzing the garment. For EACH material you identify, provide: name, advantages (array of strings), disadvantages (array of strings). Then provide an overall summary, a boolean eco_friendly, scores 1-10 for sustainability, comfort, durability, and health_impact, and suggest better alternatives (array of objects with name and reason). Respond as JSON matching this schema.`,
        response_json_schema: {
          type: 'object',
          properties: {
            materials: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  advantages: { type: 'array', items: { type: 'string' } },
                  disadvantages: { type: 'array', items: { type: 'string' } },
                },
              },
            },
            summary: { type: 'string' },
            eco_friendly: { type: 'boolean' },
            sustainability_score: { type: 'number' },
            comfort_score: { type: 'number' },
            durability_score: { type: 'number' },
            health_score: { type: 'number' },
            alternatives: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  reason: { type: 'string' },
                },
              },
            },
          },
        },
        file_urls: [file_url],
      });

      setAnalysis(result);

      await base44.entities.ClothingAnalysis.create({
        image_url: file_url,
        materials: result.materials,
        summary: result.summary,
        sustainability_score: result.sustainability_score,
        comfort_score: result.comfort_score,
        durability_score: result.durability_score,
        health_score: result.health_score,
        eco_friendly: result.eco_friendly,
        alternatives: result.alternatives,
      });
    } catch (e) {
      setError('Could not analyze the garment. Please try a clearer photo of the clothing item.');
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
    <div className="min-h-screen bg-[#FDFBF8] pb-4">
      <div className="px-5 pt-12 pb-3">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Clothing Analyzer</h1>
        <p className="text-sm text-[#666]">AI-powered fabric & sustainability scan</p>
      </div>

      <div className="px-5 mt-2">
        <div className="mb-3">
          <UsageBanner usage={material} label="Material Checks" icon={Leaf} />
        </div>

        {!imagePreview && (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-3xl border-2 border-dashed border-[#FDDDBD] bg-white hover:border-[#FF9F43] transition-colors p-10 flex flex-col items-center gap-3"
          >
            <div className="p-4 rounded-2xl bg-[#FDDDBD]">
              <Camera size={32} className="text-[#E8821E]" />
            </div>
            <p className="font-semibold text-[#1A1A1A]">Scan a Garment</p>
            <p className="text-sm text-[#666] text-center max-w-xs">Upload a photo of any clothing item — our AI analyzes the fabric itself, no label needed.</p>
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
          <div className="relative rounded-3xl overflow-hidden border border-[#F5EFE6]">
            <img src={imagePreview} alt="clothing" className="w-full h-56 object-cover" />
            {!loading && (
              <button onClick={reset} className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur">
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center gap-3 mt-6 py-8">
            <Loader2 size={32} className="text-[#FF9F43] animate-spin" />
            <p className="text-sm text-[#666]">Analyzing fabric with AI...</p>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {limitReached && (
          <div className="mt-4 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FDDDBD] flex items-center justify-center mx-auto mb-3">
              <Crown size={24} className="text-[#E8821E]" />
            </div>
            <p className="text-sm font-semibold text-[#1A1A1A]">Weekly Limit Reached</p>
            <p className="text-xs text-[#666] mt-1 leading-relaxed">
              You have used all 5 free material checks for this week. Upgrade to Premium for unlimited material checks, unlimited calorie analysis, personalized AI coaching, and advanced progress tracking.
            </p>
            <Link to="/pricing" className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold">
              <Crown size={16} /> Upgrade to Premium <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {analysis && (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <ScoreCard icon={Leaf} label="Sustainability" score={analysis.sustainability_score} color="text-emerald-500" />
              <ScoreCard icon={HeartPulse} label="Comfort" score={analysis.comfort_score} color="text-blue-500" />
              <ScoreCard icon={Shield} label="Durability" score={analysis.durability_score} color="text-amber-500" />
              <ScoreCard icon={HeartPulse} label="Health Impact" score={analysis.health_score} color="text-rose-500" />
            </div>

            <div className={`rounded-2xl p-4 flex items-center gap-3 ${analysis.eco_friendly ? 'bg-emerald-50' : 'bg-amber-50'}`}>
              <div className={`p-2 rounded-xl ${analysis.eco_friendly ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                <Leaf size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm text-[#1A1A1A]">{analysis.eco_friendly ? 'Eco-Friendly Choice' : 'Not Very Eco-Friendly'}</p>
                <p className="text-xs text-[#666]">{analysis.summary}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-2 px-1 text-[#1A1A1A]">Materials Detected</h3>
              <div className="space-y-3">
                {analysis.materials?.map((mat, i) => (
                  <div key={i} className="rounded-2xl bg-white border border-[#F5EFE6] p-4">
                    <p className="font-semibold text-[#1A1A1A]">{mat.name}</p>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-medium text-emerald-600 mb-1">Advantages</p>
                        <ul className="space-y-1">
                          {mat.advantages?.map((a, j) => (
                            <li key={j} className="text-xs text-[#666] flex gap-1">
                              <span className="text-emerald-500">+</span> {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-rose-600 mb-1">Disadvantages</p>
                        <ul className="space-y-1">
                          {mat.disadvantages?.map((d, j) => (
                            <li key={j} className="text-xs text-[#666] flex gap-1">
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

            {analysis.alternatives?.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-2 px-1 flex items-center gap-2 text-[#1A1A1A]">
                  <Recycle size={16} className="text-[#FF9F43]" /> Better Alternatives
                </h3>
                <div className="space-y-2">
                  {analysis.alternatives.map((alt, i) => (
                    <div key={i} className="rounded-2xl bg-[#FDDDBD]/40 border border-[#FDDDBD] p-3">
                      <p className="font-medium text-sm text-[#1A1A1A]">{alt.name}</p>
                      <p className="text-xs text-[#666] mt-0.5">{alt.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-full bg-[#FFD5A8] text-[#1A1A1A] py-3 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#FFC58A] transition-colors"
            >
              <Upload size={16} /> Analyze Another Item <ArrowRight size={16} />
            </button>
          </div>
        )}

        <div className="mt-6">
          <p className="text-[11px] text-[#999] text-center leading-relaxed">
            ⚠️ Fabric analysis is AI-generated and approximate. Not professional textile advice.
          </p>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ icon: Icon, label, score, color }) {
  const pct = (score / 10) * 100;
  return (
    <div className="rounded-2xl bg-white border border-[#F5EFE6] p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className={color} />
        <span className="text-xs text-[#666] font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-bold text-[#1A1A1A]">{score}</span>
        <span className="text-xs text-[#999]">/10</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-[#F5EFE6] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: `hsl(${pct * 1.2}, 60%, 50%)` }} />
      </div>
    </div>
  );
}