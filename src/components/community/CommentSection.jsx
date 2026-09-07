import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Heart, Reply, Flag, Send, ImagePlus, X, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { timeAgo } from '@/lib/communityData';
import { useAuth } from '@/lib/AuthContext';

export default function CommentSection({ postId, user, isPremium }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const { guard } = useAuth();

  useEffect(() => { load(); }, [postId]);

  async function load() {
    try {
      const data = await base44.entities.Comment.filter({ post_id: postId }, '-created_date', 200);
      setComments(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function addComment() {
    if (!newComment.trim() || submitting) return;
    if (!guard()) return;
    setSubmitting(true);
    try {
      let image_url = null;
      if (imageFile && isPremium) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });
        image_url = file_url;
      }
      await base44.entities.Comment.create({
        post_id: postId,
        content: newComment.trim(),
        image_url,
        author_name: user?.full_name || user?.email?.split('@')[0] || 'Member',
        author_id: user?.id,
        liked_by: [],
        report_count: 0,
      });
      setNewComment('');
      setImageFile(null);
      setImagePreview(null);
      await load();
    } catch (e) { console.error(e); }
    setSubmitting(false);
  }

  async function addReply(parentId) {
    if (!replyText.trim()) return;
    if (!guard()) return;
    try {
      await base44.entities.Comment.create({
        post_id: postId,
        content: replyText.trim(),
        parent_comment_id: parentId,
        author_name: user?.full_name || user?.email?.split('@')[0] || 'Member',
        author_id: user?.id,
        liked_by: [],
        report_count: 0,
      });
      setReplyText('');
      setReplyingTo(null);
      await load();
    } catch (e) { console.error(e); }
  }

  async function toggleLike(comment) {
    if (!guard()) return;
    const liked = comment.liked_by?.includes(user?.id);
    try {
      await base44.entities.Comment.updateMany(
        { id: comment.id },
        liked ? { $pull: { liked_by: user.id } } : { $addToSet: { liked_by: user.id } }
      );
      await load();
    } catch (e) { console.error(e); }
  }

  async function reportComment(commentId) {
    const reason = window.prompt('Why are you reporting this comment?');
    if (!reason) return;
    try {
      await base44.entities.CommunityReport.create({
        target_type: 'comment',
        target_id: commentId,
        reason,
        reporter_id: user?.id,
      });
      await base44.entities.Comment.update(commentId, { report_count: (comments.find((c) => c.id === commentId)?.report_count || 0) + 1 });
    } catch (e) { console.error(e); }
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  const topLevel = comments.filter((c) => !c.parent_comment_id);
  const repliesOf = (id) => comments.filter((c) => c.parent_comment_id === id);

  if (loading) return <div className="flex justify-center py-8"><Loader2 size={24} className="text-[#FF149C] animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-[#4A0E2E] px-1 font-heading">{comments.length} Comments</h3>

      {/* New comment form */}
      <div className="rounded-3xl bg-white border border-[#FFC0D6] shadow-sm shadow-pink-200/60 p-4 space-y-2">
        <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." rows={2} className="w-full rounded-xl bg-[#FFF0F5] border border-[#FFC0D6] px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF149C] text-[#4A0E2E] resize-none" />
        {imagePreview && (
          <div className="relative rounded-xl overflow-hidden">
            <img src={imagePreview} alt="preview" className="w-full h-32 object-cover" />
            <button onClick={() => { setImagePreview(null); setImageFile(null); }} className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-white"><X size={14} /></button>
          </div>
        )}
        <div className="flex items-center gap-2">
          {isPremium ? (
            <label className="flex items-center gap-1 px-2.5 py-2 rounded-full bg-[#FFF0F5] border border-[#FFC0D6] text-xs text-[#B0407A] cursor-pointer">
              <ImagePlus size={14} />
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
          ) : (
            <Link to="/pricing" className="px-2.5 py-2 rounded-full bg-[#FFF0F5] border border-[#FFC0D6] text-xs text-[#D67A9E]">
              <Crown size={14} className="text-[#FF149C]" />
            </Link>
          )}
          <button onClick={addComment} disabled={!newComment.trim() || submitting} className="flex-1 rounded-full bg-gradient-to-r from-[#FF69B4] to-[#FF149C] text-white py-2.5 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-pink-300/50">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Comment
          </button>
        </div>
      </div>

      {/* Comments list */}
      {topLevel.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#FFC0D6] p-8 text-center">
          <p className="text-sm text-[#B0407A]">No comments yet. Be the first to share!</p>
        </div>
      )}
      {topLevel.map((c) => (
        <CommentItem key={c.id} comment={c} userId={user?.id} onLike={toggleLike} onReply={() => setReplyingTo(c.id)} onReport={reportComment}>
          {repliesOf(c.id).map((r) => (
            <CommentItem key={r.id} comment={r} userId={user?.id} onLike={toggleLike} onReport={reportComment} isReply />
          ))}
          {replyingTo === c.id && (
            <div className="mt-2 flex items-center gap-2">
              <input value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addReply(c.id)} placeholder="Write a reply..." className="flex-1 rounded-full bg-[#FFF0F5] border border-[#FFC0D6] px-3 py-2 text-xs focus:outline-none focus:border-[#FF149C] text-[#4A0E2E]" />
              <button onClick={() => addReply(c.id)} className="p-2 rounded-full bg-[#FF149C]"><Send size={14} className="text-white" /></button>
            </div>
          )}
        </CommentItem>
      ))}
    </div>
  );
}

function CommentItem({ comment, userId, onLike, onReply, onReport, isReply, children }) {
  const liked = comment.liked_by?.includes(userId);
  const likeCount = comment.liked_by?.length || 0;
  return (
    <div className={isReply ? 'ml-8' : ''}>
      <div className={`rounded-2xl ${isReply ? 'bg-[#FFF0F5] border border-[#FFC0D6]' : 'bg-white border border-[#FFC0D6] shadow-sm shadow-pink-200/60'} p-3`}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FF69B4] to-[#FF149C] flex items-center justify-center text-white text-[10px] font-bold">
            {comment.author_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <p className="text-xs font-semibold text-[#4A0E2E]">{comment.author_name || 'Member'}</p>
          <p className="text-[10px] text-[#D67A9E]">{timeAgo(comment.created_date)}</p>
        </div>
        <p className="text-sm text-[#4A0E2E] leading-relaxed">{comment.content}</p>
        {comment.image_url && <img src={comment.image_url} alt="" className="mt-2 rounded-xl w-full h-32 object-cover" />}
        <div className="flex items-center gap-1 mt-2">
          <button onClick={() => onLike(comment)} className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium ${liked ? 'text-pink-500' : 'text-[#B0407A]'}`}>
            <Heart size={12} fill={liked ? 'currentColor' : 'none'} /> {likeCount > 0 && likeCount}
          </button>
          {!isReply && <button onClick={onReply} className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium text-[#B0407A]"><Reply size={12} /> Reply</button>}
          <button onClick={() => onReport(comment.id)} className="ml-auto px-2 py-1 rounded-full text-[11px] text-[#D67A9E]"><Flag size={12} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}