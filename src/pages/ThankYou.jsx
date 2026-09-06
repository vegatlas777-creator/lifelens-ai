import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export default function ThankYou() {
  const [status, setStatus] = useState('processing'); // processing | success

  useEffect(() => {
    const timer = setTimeout(() => setStatus('success'), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500">
      <div className="bg-card rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        {status === 'processing' ? (
          <>
            <Loader2 size={48} className="text-primary animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Confirming your payment…</h1>
            <p className="text-sm text-muted-foreground">We're activating your Premium plan. This usually takes a few seconds.</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Welcome to Premium! 🎉</h1>
            <p className="text-sm text-muted-foreground mb-6">Your 7-day free trial has started. Enjoy personalized plans, daily AI coaching, and advanced insights.</p>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 w-full rounded-2xl bg-primary text-primary-foreground py-3.5 font-semibold"
            >
              <Sparkles size={18} /> Start Exploring
            </Link>
          </>
        )}
      </div>
    </div>
  );
}