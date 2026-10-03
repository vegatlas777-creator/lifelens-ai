import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BackButton({ className = '', light = false }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className={`mb-2 inline-flex items-center gap-1 text-sm font-medium hover:opacity-70 transition-opacity ${light ? 'text-white drop-shadow' : 'text-[#B8902E]'} ${className}`}
    >
      <ChevronLeft size={18} /> Back
    </button>
  );
}