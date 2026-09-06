import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Search, X, Users, Shield, ChevronRight } from 'lucide-react';
import PostCard from '@/components/community/PostCard';
import PostForm from '@/components/community/PostForm';
import { CATEGORIES } from '@/lib/communityData';
import { getSubscriptionStatus } from '@/lib/subscription';

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [commentCounts, setCommentCounts] = useState({});
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [dailyTopic, setDailyTopic] = useState(null);

  useEffect(() => { init(); }, []);

  async function init() {
    try {
      const me = await base44.auth.me();
      setUser(me);
      const sub = await getSubscriptionStatus();
      setIsPremium(sub.isPremium);
      await loadPosts();
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
      setDailyTopic(CATEGORIES[dayOfYear % CATEGORIES.length]);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function loadPosts() {
    try {
      const data = await base44.entities.CommunityPost.list('-created_date', 50);
      setPosts(data);
    } catch (e) { console.error(e); }
  }

  async function loadCommentCounts(postList) {
    const counts = {};
    for (const p of postList) {
      try {
        const comments = await base44.entities.Comment.filter({ post_id: p.id });
        counts[p.id] = comments.length;
      } catch (e) { /* skip */ }
    }
    setCommentCounts(counts);
  }

  useEffect(() => {
    if (posts.length > 0 && posts.length <= 50) loadCommentCounts(posts);
  }, [posts]);

  async function toggleLike(post) {
    const liked = post.liked_by?.includes(user?.id);
    try {
      await base44.entities.CommunityPost.updateMany(
        { id: post.id },
        liked ? { $pull: { liked_by: user.id } } : { $addToSet: { liked_by: user.id } }
      );
      setPosts((prev) => prev.map((p) => p.id === post.id ? {
        ...p,
        liked_by: liked ? p.liked_by.filter((u) => u !== user.id) : [...(p.liked_by || []), user.id],
      } : p));
    } catch (e) { console.error(e); }
  }

  async function reportPost(postId) {
    const reason = window.prompt('Why are you reporting this post?');
    if (!reason) return;
    try {
      await base44.entities.CommunityReport.create({ target_type: 'post', target_id: postId, reason, reporter_id: user?.id });
      const post = posts.find((p) => p.id === postId);
      await base44.entities.CommunityPost.update(postId, { report_count: (post?.report_count || 0) + 1 });
    } catch (e) { console.error(e); }
  }

  function onCreated(post) {
    setPosts((prev) => [post, ...prev]);
    setShowForm(false);
  }

  const filtered = posts.filter((p) => {
    const matchCat = activeCat === 'all' || p.category === activeCat;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.content.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#FDF2F2] pb-4">
      {/* Header */}
      <div className="px-5 pt-12 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white border border-[#F0D5D5] shadow-sm shadow-rose-200/50 flex items-center justify-center">
            <Users size={20} className="text-[#C87883]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#2D1E1E] font-heading">Community</h1>
            <p className="text-[11px] text-[#8A6A6A]">Connect, share & grow together</p>
          </div>
        </div>
      </div>

      {/* Daily topic */}
      {dailyTopic && (
        <div className="px-5 mt-2">
          <div className="rounded-2xl bg-gradient-to-r from-[#E89AA4] to-[#C87883] p-4 text-white shadow-md shadow-rose-300/50">
            <p className="text-[10px] font-semibold opacity-90 uppercase">Daily Discussion Topic</p>
            <p className="text-base font-bold mt-0.5 font-heading">{dailyTopic.emoji} {dailyTopic.label}</p>
            <p className="text-xs opacity-90 mt-1">Share your thoughts on today's topic!</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="px-5 mt-3">
        <div className="flex items-center gap-2 rounded-full bg-white border border-[#F0D5D5] shadow-sm shadow-rose-200/50 px-4 py-2.5">
          <Search size={16} className="text-[#B59A9A]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search discussions..." className="flex-1 bg-transparent text-sm focus:outline-none text-[#2D1E1E]" />
          {search && <button onClick={() => setSearch('')}><X size={14} className="text-[#B59A9A]" /></button>}
        </div>
      </div>

      {/* Category filter */}
      <div className="mt-3 px-5">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button onClick={() => setActiveCat('all')} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${activeCat === 'all' ? 'bg-[#A85A66] text-white' : 'bg-white border border-[#F0D5D5] text-[#8A6A6A]'}`}>All</button>
          {CATEGORIES.map((c) => (
            <button key={c.value} onClick={() => setActiveCat(c.value)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${activeCat === c.value ? 'bg-[#A85A66] text-white' : 'bg-white border border-[#F0D5D5] text-[#8A6A6A]'}`}>{c.emoji} {c.label}</button>
          ))}
        </div>
      </div>

      {/* Create post button */}
      <div className="px-5 mt-3">
        {!showForm ? (
          <button onClick={() => setShowForm(true)} className="w-full rounded-full bg-gradient-to-r from-[#E89AA4] to-[#C87883] text-white py-3 font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-300/50">
            <Plus size={16} /> Start a Discussion
          </button>
        ) : (
          <PostForm user={user} isPremium={isPremium} onCreated={onCreated} onCancel={() => setShowForm(false)} />
        )}
      </div>

      {/* Guidelines link */}
      <div className="px-5 mt-3 flex items-center justify-between">
        <button onClick={() => setShowGuidelines(true)} className="flex items-center gap-1 text-xs text-[#8A6A6A]">
          <Shield size={13} /> Community Guidelines
        </button>
        <span className="text-xs text-[#B59A9A]">{filtered.length} posts</span>
      </div>

      {/* Posts */}
      <div className="px-5 mt-3 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 size={28} className="text-[#C87883] animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#F0D5D5] p-8 text-center">
            <p className="text-sm text-[#8A6A6A]">No discussions yet. {search ? 'Try a different search.' : 'Be the first to post!'}</p>
          </div>
        ) : (
          filtered.map((p) => (
            <PostCard key={p.id} post={p} userId={user?.id} onLike={toggleLike} onReport={reportPost} commentCount={commentCounts[p.id]} />
          ))
        )}
      </div>

      {/* Guidelines modal */}
      {showGuidelines && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowGuidelines(false)}>
          <div className="w-full max-w-md bg-white rounded-t-3xl border border-[#F0D5D5] p-5 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-[#2D1E1E] flex items-center gap-2 font-heading"><Shield size={18} className="text-[#C87883]" /> Community Guidelines</h2>
              <button onClick={() => setShowGuidelines(false)}><X size={18} className="text-[#8A6A6A]" /></button>
            </div>
            <div className="space-y-3 text-sm text-[#8A6A6A]">
              <Guideline text="Be kind and respectful to all members." />
              <Guideline text="Share evidence-based health information." />
              <Guideline text="No spam, self-promotion, or inappropriate content." />
              <Guideline text="Respect privacy — don't share others' personal info." />
              <Guideline text="Report any content that violates these guidelines." />
              <Guideline text="Celebrate each other's progress and milestones!" />
            </div>
            <p className="text-[11px] text-[#B59A9A] mt-4">⚠️ This community is for educational support only. Content is not medical advice. Violations may result in content removal.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Guideline({ text }) {
  return <div className="flex items-start gap-2"><ChevronRight size={14} className="text-[#C87883] mt-0.5 flex-shrink-0" /><p>{text}</p></div>;
}