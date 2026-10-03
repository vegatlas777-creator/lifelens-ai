import React from 'react';
import { Heart, MessageCircle, Flag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCategoryMeta, timeAgo } from '@/lib/communityData';

export default function PostCard({ post, userId, onLike, onReport, commentCount }) {
  const cat = getCategoryMeta(post.category);
  const liked = post.liked_by?.includes(userId);
  const likeCount = post.liked_by?.length || 0;

  return (
    <div className="rounded-3xl bg-white border border-[#EDE3D3] shadow-sm shadow-pink-200/60 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C26A52] to-[#5C4A3C] flex items-center justify-center text-white text-xs font-bold">
            {post.author_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#5C4A3C] leading-tight">{post.author_name || 'Member'}</p>
            <p className="text-[10px] text-[#C2A99A]">{timeAgo(post.created_date)}</p>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#F5EFE6] text-[10px] font-medium text-[#D97757]">{cat.emoji} {cat.label}</span>
        </div>
        <Link to={`/community/${post.id}`}>
          <h3 className="text-sm font-bold text-[#5C4A3C] mb-1 font-heading">{post.title}</h3>
          <p className="text-xs text-[#7A6557] leading-relaxed line-clamp-3">{post.content}</p>
        </Link>
      </div>
      {post.image_url && (
        <Link to={`/community/${post.id}`}>
          <img src={post.image_url} alt={post.title} className="w-full h-48 object-cover" />
        </Link>
      )}
      <div className="flex items-center gap-1 px-3 py-2 border-t border-[#EDE3D3]">
        <button onClick={() => onLike(post)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${liked ? 'text-pink-500 bg-pink-50' : 'text-[#9B7B6E] hover:bg-[#F5EFE6]'}`}>
          <Heart size={14} fill={liked ? 'currentColor' : 'none'} /> {likeCount > 0 && likeCount}
        </button>
        <Link to={`/community/${post.id}`} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-[#9B7B6E] hover:bg-[#F5EFE6]">
          <MessageCircle size={14} /> {commentCount !== undefined ? commentCount : ''}
        </Link>
        <button onClick={() => onReport(post.id, 'post')} className="ml-auto px-2.5 py-1.5 rounded-full text-xs font-medium text-[#C2A99A] hover:bg-[#F5EFE6]">
          <Flag size={14} />
        </button>
      </div>
    </div>
  );
}