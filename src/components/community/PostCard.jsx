import React from 'react';
import { Heart, MessageCircle, Flag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCategoryMeta, timeAgo } from '@/lib/communityData';

export default function PostCard({ post, userId, onLike, onReport, commentCount }) {
  const cat = getCategoryMeta(post.category);
  const liked = post.liked_by?.includes(userId);
  const likeCount = post.liked_by?.length || 0;

  return (
    <div className="rounded-3xl bg-white border border-[#F0D5D5] shadow-sm shadow-rose-200/50 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E89AA4] to-[#C87883] flex items-center justify-center text-white text-xs font-bold">
            {post.author_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#2D1E1E] leading-tight">{post.author_name || 'Member'}</p>
            <p className="text-[10px] text-[#B59A9A]">{timeAgo(post.created_date)}</p>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#F5E0E0] text-[10px] font-medium text-[#A85A66]">{cat.emoji} {cat.label}</span>
        </div>
        <Link to={`/community/${post.id}`}>
          <h3 className="text-sm font-bold text-[#2D1E1E] mb-1 font-heading">{post.title}</h3>
          <p className="text-xs text-[#5A3F3F] leading-relaxed line-clamp-3">{post.content}</p>
        </Link>
      </div>
      {post.image_url && (
        <Link to={`/community/${post.id}`}>
          <img src={post.image_url} alt={post.title} className="w-full h-48 object-cover" />
        </Link>
      )}
      <div className="flex items-center gap-1 px-3 py-2 border-t border-[#F0D5D5]">
        <button onClick={() => onLike(post)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${liked ? 'text-rose-500 bg-rose-50' : 'text-[#8A6A6A] hover:bg-[#F5E0E0]'}`}>
          <Heart size={14} fill={liked ? 'currentColor' : 'none'} /> {likeCount > 0 && likeCount}
        </button>
        <Link to={`/community/${post.id}`} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-[#8A6A6A] hover:bg-[#F5E0E0]">
          <MessageCircle size={14} /> {commentCount !== undefined ? commentCount : ''}
        </Link>
        <button onClick={() => onReport(post.id, 'post')} className="ml-auto px-2.5 py-1.5 rounded-full text-xs font-medium text-[#B59A9A] hover:bg-[#F5E0E0]">
          <Flag size={14} />
        </button>
      </div>
    </div>
  );
}