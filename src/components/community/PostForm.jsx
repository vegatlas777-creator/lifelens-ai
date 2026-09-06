import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, ImagePlus, X, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '@/lib/communityData';

const inputCls = "w-full rounded-xl bg-[#0A1628] border border-[#1E293B] px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB] text-[#FFFFFF]";

export default function PostForm({ user, isPremium, onCreated, onCancel }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general_wellness');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function submit() {
    if (!title.trim() || !content.trim() || saving) return;
    setSaving(true);
    try {
      let image_url = null;
      if (imageFile && isPremium) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });
        image_url = file_url;
      }
      const post = await base44.entities.CommunityPost.create({
        title: title.trim(),
        content: content.trim(),
        category,
        image_url,
        author_name: user?.full_name || user?.email?.split('@')[0] || 'Member',
        author_id: user?.id,
        liked_by: [],
        followed_by: [],
        report_count: 0,
      });
      onCreated(post);
    } catch (e) { console.error(e); }
    setSaving(false);
  }

  return (
    <div className="rounded-3xl bg-white/5 border border-[#1E293B] p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-[#FFFFFF]">New Discussion</h2>
        <button onClick={onCancel} className="p-1.5 rounded-full hover:bg-[#0A1628]"><X size={16} className="text-[#C7D2FE]" /></button>
      </div>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title..." className={inputCls} />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Share your thoughts, questions, or progress..." rows={4} className={inputCls + ' resize-none'} />
      <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
        {CATEGORIES.map((c) => (<option key={c.value} value={c.value}>{c.emoji} {c.label}</option>))}
      </select>
      {imagePreview && (
        <div className="relative rounded-xl overflow-hidden">
          <img src={imagePreview} alt="preview" className="w-full h-40 object-cover" />
          <button onClick={() => { setImagePreview(null); setImageFile(null); }} className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white"><X size={14} /></button>
        </div>
      )}
      <div className="flex items-center gap-2">
        {isPremium ? (
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#0A1628] border border-[#1E293B] text-xs font-medium text-[#C7D2FE] cursor-pointer">
            <ImagePlus size={14} /> Photo
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
        ) : (
          <Link to="/pricing" className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#0A1628] border border-[#1E293B] text-xs font-medium text-[#94A3B8]">
            <Crown size={14} className="text-[#2563EB]" /> Premium for photos
          </Link>
        )}
        <button onClick={submit} disabled={saving || !title.trim() || !content.trim()} className="flex-1 rounded-full bg-[#FFD5A8] text-[#FFFFFF] py-2.5 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : null} Post
        </button>
      </div>
    </div>
  );
}