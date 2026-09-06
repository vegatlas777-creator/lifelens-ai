import React from 'react';
import { Heart, MessageCircle, Flag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCategoryMeta, timeAgo } from '@/lib/communityData';

export default function PostCard({ post, userId, onLike, onReport, commentCount }) {
  const cat = getCategoryMeta(post.category);
  const liked = post.liked_by?.includes(userId);
  const likeCount = post.liked_by?.length || 0;

  return (
    <div className="rounded-3xl bg-white/5 border border-[#F5EFE6] overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD5A8] to-[#FF9F43] flex items-center justify-center text-white text-xs font-bold">
            {post.author_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#1A1A1A] leading-tight">{post.author_name || 'Member'}</p>
            <p className="text-[10px] text-[#999]">{timeAgo(post.created_date)}</p>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#FDF6EE] text-[10px] font-medium text-[#666]">{cat.emoji} {cat.label}</span>
        </div>
        <Link to={`/community/${post.id}`}>
          <h3 className="text-sm font-bold text-[#1A1A1A] mb-1">{post.title}</h3>
          <p className="text-xs text-[#666] leading-relaxed line-clamp-3">{post.content}</p>
        </Link>
      </div>
      {post.image_url && (
        <Link to={`/community/${post.id}`}>
          <img src={post.image_url} alt={post.title} className="w-full h-48 object-cover" />
        </Link>
      )}
      <div className="flex items-center gap-1 px-3 py-2 border-t border-[#F5EFE6]">
        <button onClick={() => onLike(post)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${liked ? 'text-rose-500 bg-rose-50' : 'text-[#666] hover:bg-[#FDF6EE]'}`}>
          <Heart size={14} fill={liked ? 'currentColor' : 'none'} /> {likeCount > 0 && likeCount}
        </button>
        <Link to={`/community/${post.id}`} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-[#666] hover:bg-[#FDF6EE]">
          <MessageCircle size={14} /> {commentCount !== undefined ? commentCount : ''}
        </Link>
        <button onClick={() => onReport(post.id, 'post')} className="ml-auto px-2.5 py-1.5 rounded-full text-xs font-medium text-[#999] hover:bg-[#FDF6EE]">
          <Flag size={14} />
        </button>
      </div>
    </div>
  );
}