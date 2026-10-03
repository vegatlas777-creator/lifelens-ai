import React from 'react';
import { Link } from 'react-router-dom';
import { X, LogIn, UserPlus, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function GuestGate() {
  const { guestGateOpen, closeGuestGate, exitGuest } = useAuth();
  if (!guestGateOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-3xl bg-white border border-[#E0E0E0] shadow-2xl shadow-black/10 p-6 text-center">
        <button onClick={closeGuestGate} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#EBEBEB]">
          <X size={18} className="text-[#737373]" />
        </button>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#171717] to-[#0A0A0A] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-black/10">
          <Sparkles size={26} className="text-white" />
        </div>
        <h2 className="text-lg font-bold text-[#0A0A0A] font-heading">Create an account to continue</h2>
        <p className="text-sm text-[#737373] mt-2 leading-relaxed">
          You're browsing as a guest. Sign up to start using AI features, save your progress, and track your wellness journey.
        </p>
        <div className="mt-5 space-y-2.5">
          <Link to="/register" onClick={exitGuest} className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#171717] to-[#0A0A0A] text-white py-3 font-semibold text-sm shadow-md shadow-black/10">
            <UserPlus size={16} /> Sign up free
          </Link>
          <Link to="/login" onClick={exitGuest} className="w-full flex items-center justify-center gap-2 rounded-full bg-[#EBEBEB] border border-[#E0E0E0] text-[#404040] py-3 font-medium text-sm">
            <LogIn size={16} /> Log in
          </Link>
        </div>
        <button onClick={closeGuestGate} className="mt-4 text-xs text-[#A3A3A3] hover:text-[#404040]">
          Keep browsing
        </button>
      </div>
    </div>
  );
}