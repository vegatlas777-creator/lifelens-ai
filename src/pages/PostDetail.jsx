import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Heart, Flag, ArrowLeft, Bell, BellOff, Crown, Sparkles } from 'lucide-react';
import CommentSection from '@/components/community/CommentSection';
import { getCategoryMeta, timeAgo } from '@/lib/communityData';
import { getSubscriptionStatus } from '@/lib/subscription';

export default function PostDetail() {
  const navigate = useNavigate();
  const postId = window.location.pathname.split('/community/')[1];
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => { init(); }, [postId]);

  async function init() {
    try {
      const me = await base44.auth.me();
      setUser(me);
      const sub = await getSubscriptionStatus();
      setIsPremium(sub.isPremium);
      const p = await base44.entities.CommunityPost.get(postId);
      setPost(p);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function toggleLike() {
    const liked = post.liked_by?.includes(user?.id);
    try {
      await base44.entities.CommunityPost.updateMany(
        { id: post.id },
        liked ? { $pull: { liked_by: user.id } } : { $addToSet: { liked_by: user.id } }
      );
      setPost((prev) => ({ ...prev, liked_by: liked ? prev.liked_by.filter((u) => u !== user.id) : [...(prev.liked_by || []), user.id] }));
    } catch (e) { console.error(e); }
  }

  async function toggleFollow() {
    const following = post.followed_by?.includes(user?.id);
    try {
      await base44.entities.CommunityPost.updateMany(
        { id: post.id },
        following ? { $pull: { followed_by: user.id } } : { $addToSet: { followed_by: user.id } }
      );
      setPost((prev) => ({ ...prev, followed_by: following ? prev.followed_by.filter((u) => u !== user.id) : [...(prev.followed_by || []), user.id] }));
    } catch (e) { console.error(e); }
  }

  async function reportPost() {
    const reason = window.prompt('Why are you reporting this post?');
    if (!reason) return;
    try {
      await base44.entities.CommunityReport.create({ target_type: 'post', target_id: post.id, reason, reporter_id: user?.id });
      await base44.entities.CommunityPost.update(post.id, { report_count: (post.report_count || 0) + 1 });
    } catch (e) { console.error(e); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F0F9FF]">
        <Loader2 size={28} className="text-[#2563EB] animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#F0F9FF] flex flex-col items-center justify-center px-5">
        <p className="text-sm text-[#64748B]">Post not found.</p>
        <Link to="/community" className="mt-3 px-4 py-2 rounded-full bg-[#BFDBFE] text-[#0F172A] text-sm font-semibold">Back to Community</Link>
      </div>
    );
  }

  const cat = getCategoryMeta(post.category);
  const liked = post.liked_by?.includes(user?.id);
  const following = post.followed_by?.includes(user?.id);
  const likeCount = post.liked_by?.length || 0;

  return (
    <div className="min-h-screen bg-[#F0F9FF] pb-4">
      {/* Header */}
      <div className="px-5 pt-12 pb-3 flex items-center gap-3 border-b border-[#DBEAFE]">
        <button onClick={() => navigate('/community')} className="p-1.5 rounded-full hover:bg-[#EFF6FF]"><ArrowLeft size={20} className="text-[#0F172A]" /></button>
        <h1 className="text-lg font-bold text-[#0F172A]">Discussion</h1>
      </div>

      {/* Post */}
      <div className="px-5 mt-4">
        <div className="rounded-3xl bg-white border border-[#DBEAFE] overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#BFDBFE] to-[#2563EB] flex items-center justify-center text-white text-sm font-bold">
                {post.author_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#0F172A]">{post.author_name || 'Member'}</p>
                <p className="text-[10px] text-[#94A3B8]">{timeAgo(post.created_date)}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[10px] font-medium text-[#64748B]">{cat.emoji} {cat.label}</span>
            </div>
            <h2 className="text-lg font-bold text-[#0F172A] mb-2">{post.title}</h2>
            <p className="text-sm text-[#64748B] leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>
          {post.image_url && (
            <img src={post.image_url} alt={post.title} className="w-full max-h-96 object-cover" />
          )}
          <div className="flex items-center gap-1 px-3 py-2 border-t border-[#DBEAFE]">
            <button onClick={toggleLike} className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium ${liked ? 'text-rose-500 bg-rose-50' : 'text-[#64748B] hover:bg-[#EFF6FF]'}`}>
              <Heart size={16} fill={liked ? 'currentColor' : 'none'} /> {likeCount > 0 && likeCount}
            </button>
            <button onClick={toggleFollow} className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium ${following ? 'text-[#2563EB] bg-[#E0F2FE]/30' : 'text-[#64748B] hover:bg-[#EFF6FF]'}`}>
              {following ? <BellOff size={16} /> : <Bell size={16} />} {following ? 'Following' : 'Follow'}
            </button>
            <button onClick={reportPost} className="ml-auto px-3 py-2 rounded-full text-sm text-[#94A3B8] hover:bg-[#EFF6FF]">
              <Flag size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Premium tip */}
      {isPremium && (
        <div className="px-5 mt-4">
          <div className="rounded-2xl bg-[#E0F2FE]/30 border border-[#E0F2FE] p-3 flex items-center gap-2">
            <Crown size={14} className="text-[#E8821E]" />
            <p className="text-xs text-[#64748B]">You can add photos to your comments!</p>
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="px-5 mt-4">
        <CommentSection postId={post.id} user={user} isPremium={isPremium} />
      </div>

      <div className="px-5 mt-5">
        <p className="text-[11px] text-[#94A3B8] text-center leading-relaxed">
          ⚠️ Community content is user-generated and not medical advice. Be respectful and follow community guidelines.
        </p>
      </div>
    </div>
  );
}