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
    <div className="min-h-screen bg-[#FFF0F5]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col border-r border-[#FFC0D6] bg-[#FFD9E6] z-40">
        <div className="px-6 py-8 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF69B4] to-[#FF149C] flex items-center justify-center shadow-lg shadow-pink-300/60">
            <Leaf size={20} className="text-white" />
          </div>
          <span className="text-sm font-bold text-[#4A0E2E] leading-tight font-heading">3 in 1<br />Healthy Choice</span>
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
                    ? 'bg-gradient-to-r from-[#FF69B4]/30 to-[#FF149C]/15 text-[#E91E63] border border-[#FF69B4]/40'
                    : 'text-[#B0407A] hover:text-[#E91E63] hover:bg-white/70 border border-transparent'
                }`}
              >
                <Icon size={18} strokeWidth={2.2} />
                {label}
              </NavLink>
            );
          })}
        </nav>
        <div className="px-6 py-5 border-t border-[#FFC0D6]">
          <p className="text-[10px] text-[#D67A9E] leading-relaxed">⚠️ Estimates are approximations, not medical advice.</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen pb-28 lg:pb-8">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#FFD9E6]/95 backdrop-blur-xl border-t border-[#FFC0D6] z-50 safe-area-bottom">
        <div className="max-w-md mx-auto flex items-stretch justify-around px-2 py-1.5">
          {mobileNavItems.map(({ to, label, icon: Icon }) => {
            const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className="flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-2xl transition-all min-w-[56px]"
              >
                <div className={`p-2 rounded-2xl transition-all ${isActive ? 'bg-gradient-to-br from-[#FF69B4] to-[#FF149C] text-white shadow-lg shadow-pink-300/60' : 'text-[#B0407A]'}`}>
                  <Icon size={22} strokeWidth={2.2} />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-[#E91E63]' : 'text-[#B0407A]'}`}>{label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}