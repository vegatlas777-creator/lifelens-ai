import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Camera, Upload, Sparkles, Leaf, Shield, HeartPulse, Recycle, Loader2, X } from 'lucide-react';
import PageHeader, { Disclaimer } from '@/components/PageHeader';

export default function ClothingAnalyzer() {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  async function handleFile(file) {
    if (!file) return;
    setError(null);
    setAnalysis(null);
    setImagePreview(URL.createObjectURL(file));
    setLoading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImageUrl(file_url);

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert textile and sustainability analyst. Analyze the clothing item/label in this image. Identify the materials used. For EACH material, provide: name, advantages (array of strings), disadvantages (array of strings). Then provide an overall summary, a boolean eco_friendly, scores 1-10 for sustainability, comfort, durability, and health_impact, and suggest better alternatives (array of objects with name and reason). Respond as JSON matching this schema.`,
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
      setError('Could not analyze the image. Please try a clearer photo of the label or garment.');
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
  }

  return (
    <div className="pb-4">
      <PageHeader title="Clothing Analyzer" subtitle="AI-powered material & sustainability scan" icon={Sparkles} />

      <div className="px-5 mt-2">
        {!imagePreview && (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-3xl border-2 border-dashed border-border bg-card hover:border-primary/50 transition-colors p-10 flex flex-col items-center gap-3"
          >
            <div className="p-4 rounded-2xl bg-primary/10 text-primary">
              <Camera size={32} />
            </div>
            <p className="font-semibold">Scan a Clothing Label</p>
            <p className="text-sm text-muted-foreground text-center max-w-xs">Upload a photo of the care label or garment to analyze materials, sustainability, and health impact.</p>
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
          <div className="relative rounded-2xl overflow-hidden border border-border">
            <img src={imagePreview} alt="clothing" className="w-full h-56 object-cover" />
            {!loading && (
              <button onClick={reset} className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur">
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center gap-3 mt-6 py-8">
            <Loader2 size={32} className="text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Analyzing materials with AI...</p>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl bg-destructive/10 border border-destructive/20 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {analysis && (
          <div className="mt-5 space-y-4">
            {/* Scores */}
            <div className="grid grid-cols-2 gap-3">
              <ScoreCard icon={Leaf} label="Sustainability" score={analysis.sustainability_score} color="text-emerald-500" />
              <ScoreCard icon={HeartPulse} label="Comfort" score={analysis.comfort_score} color="text-blue-500" />
              <ScoreCard icon={Shield} label="Durability" score={analysis.durability_score} color="text-amber-500" />
              <ScoreCard icon={HeartPulse} label="Health Impact" score={analysis.health_score} color="text-rose-500" />
            </div>

            {/* Eco Badge */}
            <div className={`rounded-2xl p-4 flex items-center gap-3 ${analysis.eco_friendly ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
              <div className={`p-2 rounded-xl ${analysis.eco_friendly ? 'bg-emerald-500/20 text-emerald-600' : 'bg-amber-500/20 text-amber-600'}`}>
                <Leaf size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm">{analysis.eco_friendly ? 'Eco-Friendly Choice' : 'Not Very Eco-Friendly'}</p>
                <p className="text-xs text-muted-foreground">{analysis.summary}</p>
              </div>
            </div>

            {/* Materials */}
            <div>
              <h3 className="font-semibold text-sm mb-2 px-1">Materials Detected</h3>
              <div className="space-y-3">
                {analysis.materials?.map((mat, i) => (
                  <div key={i} className="rounded-2xl bg-card border border-border p-4">
                    <p className="font-semibold">{mat.name}</p>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-medium text-emerald-600 mb-1">Advantages</p>
                        <ul className="space-y-1">
                          {mat.advantages?.map((a, j) => (
                            <li key={j} className="text-xs text-muted-foreground flex gap-1">
                              <span className="text-emerald-500">+</span> {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-rose-600 mb-1">Disadvantages</p>
                        <ul className="space-y-1">
                          {mat.disadvantages?.map((d, j) => (
                            <li key={j} className="text-xs text-muted-foreground flex gap-1">
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

            {/* Alternatives */}
            {analysis.alternatives?.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-2 px-1 flex items-center gap-2">
                  <Recycle size={16} className="text-primary" /> Better Alternatives
                </h3>
                <div className="space-y-2">
                  {analysis.alternatives.map((alt, i) => (
                    <div key={i} className="rounded-2xl bg-primary/5 border border-primary/20 p-3">
                      <p className="font-medium text-sm">{alt.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{alt.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-2xl border border-border bg-card py-3 font-medium text-sm flex items-center justify-center gap-2 hover:border-primary/40 transition-colors"
            >
              <Upload size={16} /> Analyze Another Item
            </button>
          </div>
        )}

        <div className="mt-6">
          <Disclaimer />
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ icon: Icon, label, score, color }) {
  const pct = (score / 10) * 100;
  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className={color} />
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-bold">{score}</span>
        <span className="text-xs text-muted-foreground">/10</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: `hsl(${pct * 1.2}, 60%, 50%)` }} />
      </div>
    </div>
  );
}