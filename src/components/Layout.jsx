import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Shirt, UtensilsCrossed, Dumbbell, Footprints, MessageCircle, Users, User, Leaf } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/clothing', label: 'Clothing', icon: Shirt },
  { to: '/calories', label: 'Calories', icon: UtensilsCrossed },
  { to: '/fitness', label: 'Fitness', icon: Dumbbell },
  { to: '/activity', label: 'Activity', icon: Footprints },
  { to: '/community', label: 'Community', icon: Users },
  { to: '/coach', label: 'Coach', icon: MessageCircle },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Layout() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col border-r border-white/10 bg-[#0d0d13] z-40">
        <div className="px-6 py-8 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Leaf size={20} className="text-white" />
          </div>
          <span className="text-sm font-bold text-white leading-tight">3 in 1<br />Healthy Choice</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400/20 to-orange-500/10 text-amber-300 border border-amber-400/20'
                    : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={18} strokeWidth={2.2} />
                {label}
              </NavLink>
            );
          })}
        </nav>
        <div className="px-6 py-5 border-t border-white/10">
          <p className="text-[10px] text-white/30 leading-relaxed">⚠️ Estimates are approximations, not medical advice.</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen pb-28 lg:pb-8">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0d0d13]/90 backdrop-blur-xl border-t border-white/10 z-50">
        <div className="flex items-center justify-around px-1.5 py-2 safe-area-bottom">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className="flex flex-col items-center gap-1 px-1.5 py-1.5 rounded-xl transition-all"
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-black' : 'text-white/40'}`}>
                  <Icon size={18} strokeWidth={2.2} />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-amber-300' : 'text-white/40'}`}>{label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}