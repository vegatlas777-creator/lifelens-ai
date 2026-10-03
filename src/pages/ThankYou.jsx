import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export default function ThankYou() {
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const timer = setTimeout(() => setStatus('success'), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E293B]">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl shadow-pink-300/50">
        {status === 'processing' ? (
          <>
            <Loader2 size={48} className="text-[#0F172A] animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2 text-[#0F172A] font-heading">Confirming your payment…</h1>
            <p className="text-sm text-[#64748B]">We're activating your Premium plan. This usually takes a few seconds.</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} className="text-[#0F172A]" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-[#0F172A] font-heading">Welcome to Premium! 🎉</h1>
            <p className="text-sm text-[#64748B] mb-6">Your 7-day free trial has started. Enjoy personalized plans, daily AI coaching, and advanced insights.</p>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 w-full rounded-2xl bg-gradient-to-r from-[#1E293B] to-[#0F172A] text-white py-3.5 font-semibold shadow-md shadow-pink-300/50"
            >
              <Sparkles size={18} /> Start Exploring
            </Link>
          </>
        )}
      </div>
    </div>
  );
}