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
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#2D9F6A] via-[#248F5F] to-[#1F8A58]">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl shadow-black/10">
        {status === 'processing' ? (
          <>
            <Loader2 size={48} className="text-[#2D9F6A] animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2 text-[#0A0A0A] font-heading">Confirming your payment…</h1>
            <p className="text-sm text-[#737373]">We're activating your Premium plan. This usually takes a few seconds.</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-[#E6F4EC] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} className="text-[#2D9F6A]" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-[#0A0A0A] font-heading">Welcome to Premium! 🎉</h1>
            <p className="text-sm text-[#737373] mb-6">Your 7-day free trial has started. Enjoy personalized plans, daily AI coaching, and advanced insights.</p>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 w-full rounded-2xl bg-gradient-to-r from-[#2D9F6A] to-[#1F8A58] text-white py-3.5 font-semibold shadow-md shadow-black/10"
            >
              <Sparkles size={18} /> Start Exploring
            </Link>
          </>
        )}
      </div>
    </div>
  );
}