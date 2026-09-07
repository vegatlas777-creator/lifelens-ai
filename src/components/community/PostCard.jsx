import React from 'react';
import { Heart, MessageCircle, Flag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCategoryMeta, timeAgo } from '@/lib/communityData';

export default function PostCard({ post, userId, onLike, onReport, commentCount }) {
  const cat = getCategoryMeta(post.category);
  const liked = post.liked_by?.includes(userId);
  const likeCount = post.liked_by?.length || 0;

  return (
    <div className="rounded-3xl bg-white border border-[#D4C2F5] shadow-sm shadow-purple-200/60 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9333EA] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold">
            {post.author_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#2E1065] leading-tight">{post.author_name || 'Member'}</p>
            <p className="text-[10px] text-[#A78BD9]">{timeAgo(post.created_date)}</p>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#EDE5FF] text-[10px] font-medium text-[#6D28D9]">{cat.emoji} {cat.label}</span>
        </div>
        <Link to={`/community/${post.id}`}>
          <h3 className="text-sm font-bold text-[#2E1065] mb-1 font-heading">{post.title}</h3>
          <p className="text-xs text-[#4C1D95] leading-relaxed line-clamp-3">{post.content}</p>
        </Link>
      </div>
      {post.image_url && (
        <Link to={`/community/${post.id}`}>
          <img src={post.image_url} alt={post.title} className="w-full h-48 object-cover" />
        </Link>
      )}
      <div className="flex items-center gap-1 px-3 py-2 border-t border-[#D4C2F5]">
        <button onClick={() => onLike(post)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${liked ? 'text-purple-500 bg-purple-50' : 'text-[#7E5BA8] hover:bg-[#EDE5FF]'}`}>
          <Heart size={14} fill={liked ? 'currentColor' : 'none'} /> {likeCount > 0 && likeCount}
        </button>
        <Link to={`/community/${post.id}`} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-[#7E5BA8] hover:bg-[#EDE5FF]">
          <MessageCircle size={14} /> {commentCount !== undefined ? commentCount : ''}
        </Link>
        <button onClick={() => onReport(post.id, 'post')} className="ml-auto px-2.5 py-1.5 rounded-full text-xs font-medium text-[#A78BD9] hover:bg-[#EDE5FF]">
          <Flag size={14} />
        </button>
      </div>
    </div>
  );
}