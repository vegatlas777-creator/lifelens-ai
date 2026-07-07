import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, Loader2, ExternalLink, Play } from 'lucide-react';

const searchCategories = [
  'Walking workout', 'Running workout', 'Cycling workout',
  'Hip Hop workout', 'Ballet workout', 'Yoga workout',
  'Weight loss workout', 'Beginner workout', 'Senior workout',
];

function extractVideoId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/);
  return match ? match[1] : null;
}

function getThumbnail(url) {
  const id = extractVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export default function YouTubeFitnessSearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  async function search(searchQuery) {
    const q = (searchQuery || query).trim();
    if (!q) return;
    setQuery(q);
    setError(null);
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Search YouTube for high-quality fitness videos about "${q}". Return the top 8 most relevant and popular results. For each video, provide the exact YouTube watch URL (https://www.youtube.com/watch?v=...), video title, channel name, and duration. Only include real, existing YouTube videos. Prioritize videos with high view counts and positive ratings.`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            videos: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  channel: { type: 'string' },
                  url: { type: 'string' },
                  duration: { type: 'string' },
                },
              },
            },
          },
        },
      });
      const videos = (result.videos || []).filter((v) => extractVideoId(v.url));
      setResults(videos);
    } catch (e) {
      setError('Could not search YouTube. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-5">
      {/* Search bar */}
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="Search fitness videos..."
          className="flex-1 rounded-full bg-white border border-[#F5EFE6] px-4 py-2.5 text-sm focus:outline-none focus:border-[#FF9F43] text-[#1A1A1A]"
        />
        <button
          onClick={() => search()}
          disabled={loading || !query.trim()}
          className="p-2.5 rounded-full bg-[#FFD5A8] text-[#1A1A1A] disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
        </button>
      </div>

      {/* Category quick search */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
        {searchCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => search(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${query === cat ? 'bg-[#FF9F43] text-white' : 'bg-white border border-[#F5EFE6] text-[#666]'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center gap-3 mt-8 py-8">
          <Loader2 size={32} className="text-[#FF9F43] animate-spin" />
          <p className="text-sm text-[#666]">Searching YouTube for fitness videos...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div className="mt-4">
          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#FDDDBD] p-8 text-center">
              <p className="text-sm text-[#666]">No videos found. Try a different search.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((v, i) => {
                const thumb = getThumbnail(v.url);
                return (
                  <a
                    key={i}
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-2xl bg-white border border-[#F5EFE6] overflow-hidden hover:border-[#FF9F43] transition-colors"
                  >
                    <div className="flex gap-3 p-3">
                      <div className="relative w-32 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#F5EFE6]">
                        {thumb ? (
                          <img src={thumb} alt={v.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play size={20} className="text-[#999]" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Play size={24} className="text-white" fill="white" />
                        </div>
                        {v.duration && (
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-medium">
                            {v.duration}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <p className="text-sm font-medium text-[#1A1A1A] line-clamp-2 leading-snug">{v.title}</p>
                          <p className="text-xs text-[#666] mt-1">{v.channel}</p>
                        </div>
                        <p className="text-[11px] text-[#FF9F43] font-medium flex items-center gap-1">
                          Watch on YouTube <ExternalLink size={10} />
                        </p>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!results && !loading && !error && (
        <div className="mt-6 rounded-2xl border border-dashed border-[#FDDDBD] p-8 text-center">
          <Search size={28} className="text-[#FDDDBD] mx-auto mb-2" />
          <p className="text-sm text-[#666]">Search for fitness videos or pick a category above.</p>
        </div>
      )}

      <div className="mt-6">
        <p className="text-[11px] text-[#999] text-center leading-relaxed">
          Videos are sourced from YouTube. The app does not host or generate fitness videos — it helps you discover public content.
        </p>
      </div>
    </div>
  );
}