import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Shirt, UtensilsCrossed, Dumbbell, Footprints, MessageCircle, Users, User } from 'lucide-react';

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
    <div className="min-h-screen bg-[#FDFBF8]">
      <main className="mx-auto w-full max-w-md pb-28 min-h-screen">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur-xl border-t border-[#F5EFE6] z-50">
        <div className="flex items-center justify-around px-1.5 py-2 safe-area-bottom">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className="flex flex-col items-center gap-1 px-1.5 py-1.5 rounded-xl transition-all"
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-[#FF9F43] text-white' : 'text-[#999]'}`}>
                  <Icon size={18} strokeWidth={2.2} />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-[#1A1A1A]' : 'text-[#999]'}`}>{label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}