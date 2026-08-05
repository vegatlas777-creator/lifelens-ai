import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Activity,
  Calculator,
  Dumbbell,
  Home,
  MessageCircle,
  MoreHorizontal,
  Shirt,
  Sparkles,
  User,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react';

const primaryNav = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/calories', label: 'Calories', icon: UtensilsCrossed },
  { to: '/fitness', label: 'Fitness', icon: Dumbbell },
  { to: '/community', label: 'Community', icon: Users },
];

const moreItems = [
  { to: '/clothing', label: 'Clothing analyzer', description: 'Identify fabrics and care guidance', icon: Shirt, tint: 'bg-[#efe9ff] text-[#6745cf]' },
  { to: '/activity', label: 'Activity', description: 'Review steps, workouts and movement', icon: Activity, tint: 'bg-[#e8f6ee] text-[#23775e]' },
  { to: '/metabolic', label: 'Metabolic calculator', description: 'Calculate BMR, TDEE and targets', icon: Calculator, tint: 'bg-[#fff0e7] text-[#bd6339]' },
  { to: '/coach', label: 'AI coach', description: 'Personal support and motivation', icon: MessageCircle, tint: 'bg-[#ebf5fb] text-[#397b9e]' },
  { to: '/profile', label: 'Profile', description: 'Goals, measurements and account', icon: User, tint: 'bg-[#f1efe9] text-[#5f625f]' },
];

export default function Layout() {
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);
  const moreIsActive = moreItems.some((item) => location.pathname.startsWith(item.to));

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <main className="mx-auto min-h-screen w-full max-w-md pb-28 shadow-[0_0_70px_rgba(35,31,25,.05)] sm:max-w-xl">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-black/[0.06] bg-[#fffdfa]/92 px-3 pt-2 shadow-[0_-12px_40px_rgba(43,36,29,.08)] backdrop-blur-2xl sm:max-w-xl">
        <div className="grid grid-cols-5 items-end safe-area-bottom">
          {primaryNav.map(({ to, label, icon: Icon }) => {
            const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
            return (
              <NavLink key={to} to={to} className="flex min-h-[62px] flex-col items-center justify-center gap-1 rounded-2xl px-1">
                <span className={`grid h-9 w-9 place-items-center rounded-2xl transition ${active ? 'bg-[#17372e] text-white shadow-lg shadow-[#17372e]/20' : 'text-[#8f918d]'}`}>
                  <Icon size={18} strokeWidth={2.15} />
                </span>
                <span className={`text-[9px] font-bold ${active ? 'text-[#1d2420]' : 'text-[#9b9b96]'}`}>{label}</span>
              </NavLink>
            );
          })}

          <button type="button" onClick={() => setShowMore(true)} className="flex min-h-[62px] flex-col items-center justify-center gap-1 rounded-2xl px-1">
            <span className={`grid h-9 w-9 place-items-center rounded-2xl transition ${moreIsActive ? 'bg-[#ff8a52] text-white shadow-lg shadow-[#ff8a52]/25' : 'bg-[#f0ece5] text-[#747671]'}`}>
              <MoreHorizontal size={19} />
            </span>
            <span className={`text-[9px] font-bold ${moreIsActive ? 'text-[#1d2420]' : 'text-[#9b9b96]'}`}>Explore</span>
          </button>
        </div>
      </nav>

      {showMore && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-3 backdrop-blur-sm" onClick={() => setShowMore(false)}>
          <div className="w-full max-w-md rounded-[32px] bg-[#fffdfa] p-5 shadow-2xl sm:max-w-xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#bd6339]">
                  <Sparkles size={16} />
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em]">Explore</p>
                </div>
                <h2 className="mt-1 text-xl font-black tracking-[-0.03em]">All your healthy tools</h2>
              </div>
              <button type="button" onClick={() => setShowMore(false)} className="grid h-10 w-10 place-items-center rounded-full bg-[#f1ede6] text-[#62645f]" aria-label="Close explore menu">
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 space-y-2.5">
              {moreItems.map(({ to, label, description, icon: Icon, tint }) => (
                <NavLink key={to} to={to} onClick={() => setShowMore(false)} className="flex items-center gap-3 rounded-[22px] border border-[#ece7df] bg-white p-3.5 transition hover:border-[#d8d0c5]">
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${tint}`}>
                    <Icon size={19} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-extrabold text-[#242824]">{label}</span>
                    <span className="mt-0.5 block text-[11px] text-[#85847d]">{description}</span>
                  </span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
