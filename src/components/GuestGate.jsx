import React from 'react';
import { Link } from 'react-router-dom';
import { X, LogIn, UserPlus, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function GuestGate() {
  const { guestGateOpen, closeGuestGate, exitGuest } = useAuth();
  if (!guestGateOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-3xl bg-white border border-[#FFC0D6] shadow-2xl shadow-pink-300/50 p-6 text-center">
        <button onClick={closeGuestGate} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#FFD9E6]">
          <X size={18} className="text-[#B0407A]" />
        </button>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF69B4] to-[#FF149C] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-300/50">
          <Sparkles size={26} className="text-white" />
        </div>
        <h2 className="text-lg font-bold text-[#4A0E2E] font-heading">Create an account to continue</h2>
        <p className="text-sm text-[#B0407A] mt-2 leading-relaxed">
          You're browsing as a guest. Sign up to start using AI features, save your progress, and track your wellness journey.
        </p>
        <div className="mt-5 space-y-2.5">
          <Link to="/register" onClick={exitGuest} className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF69B4] to-[#FF149C] text-white py-3 font-semibold text-sm shadow-md shadow-pink-300/50">
            <UserPlus size={16} /> Sign up free
          </Link>
          <Link to="/login" onClick={exitGuest} className="w-full flex items-center justify-center gap-2 rounded-full bg-[#FFD9E6] border border-[#FFC0D6] text-[#E91E63] py-3 font-medium text-sm">
            <LogIn size={16} /> Log in
          </Link>
        </div>
        <button onClick={closeGuestGate} className="mt-4 text-xs text-[#D67A9E] hover:text-[#E91E63]">
          Keep browsing
        </button>
      </div>
    </div>
  );
}