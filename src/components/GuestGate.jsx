import React from 'react';
import { Link } from 'react-router-dom';
import { X, LogIn, UserPlus, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function GuestGate() {
  const { guestGateOpen, closeGuestGate, exitGuest } = useAuth();
  if (!guestGateOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-3xl bg-white border border-[#EDE3D3] shadow-2xl shadow-pink-300/50 p-6 text-center">
        <button onClick={closeGuestGate} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#F5EFE6]">
          <X size={18} className="text-[#9B7B6E]" />
        </button>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C26A52] to-[#5C4A3C] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-300/50">
          <Sparkles size={26} className="text-white" />
        </div>
        <h2 className="text-lg font-bold text-[#5C4A3C] font-heading">Create an account to continue</h2>
        <p className="text-sm text-[#9B7B6E] mt-2 leading-relaxed">
          You're browsing as a guest. Sign up to start using AI features, save your progress, and track your wellness journey.
        </p>
        <div className="mt-5 space-y-2.5">
          <Link to="/register" onClick={exitGuest} className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#C26A52] to-[#5C4A3C] text-white py-3 font-semibold text-sm shadow-md shadow-pink-300/50">
            <UserPlus size={16} /> Sign up free
          </Link>
          <Link to="/login" onClick={exitGuest} className="w-full flex items-center justify-center gap-2 rounded-full bg-[#F5EFE6] border border-[#EDE3D3] text-[#D97757] py-3 font-medium text-sm">
            <LogIn size={16} /> Log in
          </Link>
        </div>
        <button onClick={closeGuestGate} className="mt-4 text-xs text-[#C2A99A] hover:text-[#D97757]">
          Keep browsing
        </button>
      </div>
    </div>
  );
}