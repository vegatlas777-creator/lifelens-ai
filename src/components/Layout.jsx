import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Shirt, UtensilsCrossed, Dumbbell, Footprints, MessageCircle, Users, User, Leaf } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/clothing', label: 'Sports', icon: Shirt },
  { to: '/calories', label: 'Calories', icon: UtensilsCrossed },
  { to: '/fitness', label: 'Fitness', icon: Dumbbell },
  { to: '/activity', label: 'Activity', icon: Footprints },
  { to: '/community', label: 'Community', icon: Users },
  { to: '/coach', label: 'Coach', icon: MessageCircle },
  { to: '/profile', label: 'Profile', icon: User },
];

const mobileNavItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/calories', label: 'Calories', icon: UtensilsCrossed },
  { to: '/coach', label: 'Coach', icon: MessageCircle },
  { to: '/community', label: 'Community', icon: Users },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Layout() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-[#FDF6EE]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col border-r border-[#EDE3D3] bg-[#F5EFE6] z-40">
        <div className="px-6 py-8 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C26A52] to-[#5C4A3C] flex items-center justify-center shadow-lg shadow-pink-300/60">
            <Leaf size={20} className="text-white" />
          </div>
          <span className="text-sm font-bold text-[#5C4A3C] leading-tight font-heading">3 in 1<br />Healthy Choice</span>
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
                    ? 'bg-gradient-to-r from-[#C26A52]/30 to-[#5C4A3C]/15 text-[#D97757] border border-[#C26A52]/40'
                    : 'text-[#9B7B6E] hover:text-[#D97757] hover:bg-white/70 border border-transparent'
                }`}
              >
                <Icon size={18} strokeWidth={2.2} />
                {label}
              </NavLink>
            );
          })}
        </nav>
        <div className="px-6 py-5 border-t border-[#EDE3D3]">
          <p className="text-[10px] text-[#C2A99A] leading-relaxed">⚠️ Estimates are approximations, not medical advice.</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen pb-28 lg:pb-8">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#F5EFE6]/95 backdrop-blur-xl border-t border-[#EDE3D3] z-50 safe-area-bottom">
        <div className="max-w-md mx-auto flex items-stretch justify-around px-2 py-1.5">
          {mobileNavItems.map(({ to, label, icon: Icon }) => {
            const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className="flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-2xl transition-all min-w-[56px]"
              >
                <div className={`p-2 rounded-2xl transition-all ${isActive ? 'bg-gradient-to-br from-[#C26A52] to-[#5C4A3C] text-white shadow-lg shadow-pink-300/60' : 'text-[#9B7B6E]'}`}>
                  <Icon size={22} strokeWidth={2.2} />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-[#D97757]' : 'text-[#9B7B6E]'}`}>{label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}