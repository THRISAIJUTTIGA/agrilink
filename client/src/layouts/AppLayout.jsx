import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, LineChart, Sprout, FileText, HandCoins, Truck,
  Warehouse, Wallet, MessageSquareWarning, ShoppingBag, Users, Bell, LogOut, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { DemoTag } from '../components/ui';

const NAV = {
  farmer: [
    { to: '/farmer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/farmer/markets', label: 'Market Intelligence', icon: LineChart },
    { to: '/farmer/insights', label: 'Sale-Window Insights', icon: Sprout },
    { to: '/farmer/create-lot', label: 'Create Lot', icon: FileText },
    { to: '/farmer/offers', label: 'Offers', icon: HandCoins },
    { to: '/farmer/transactions', label: 'Transactions', icon: Wallet },
    { to: '/farmer/logistics', label: 'Logistics & Storage', icon: Truck },
    { to: '/farmer/payments', label: 'Payments', icon: Wallet },
    { to: '/farmer/grievances', label: 'Grievances', icon: MessageSquareWarning },
  ],
  buyer: [
    { to: '/buyer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/buyer/lots', label: 'Marketplace', icon: ShoppingBag },
  ],
  fpo: [
    { to: '/fpo/dashboard', label: 'Dashboard', icon: Users },
  ],
};

export default function AppLayout({ children }) {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (!session) return;
    api.get(`/notifications?role=${session.role}`).then(setNotifs).catch(() => {});
  }, [session]);

  useEffect(() => {
    function onClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (!session) {
    navigate('/login');
    return null;
  }

  const items = NAV[session.role] || [];
  const displayName = session.profile?.name || session.profile?.company_name || session.user.name;

  return (
    <div className="min-h-screen flex bg-soil-50">
      {/* Sidebar */}
      <aside className={`fixed lg:static z-30 inset-y-0 left-0 w-64 bg-field-700 text-white flex flex-col transition-transform ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-5 py-5 flex items-center justify-between border-b border-white/10">
          <div>
            <p className="font-display text-xl leading-none">AgriLink</p>
            <p className="text-[11px] text-field-200 mt-1 tracking-wide uppercase">{session.role} portal</p>
          </div>
          <button className="lg:hidden text-white" onClick={() => setMobileNavOpen(false)}><X size={20} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-card text-sm transition-colors ${
                  isActive ? 'bg-white/15 text-white font-medium' : 'text-field-100 hover:bg-white/10'
                }`
              }
            >
              <Icon size={17} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-card text-sm text-field-100 hover:bg-white/10 w-full"
          >
            <LogOut size={17} /> Log out
          </button>
        </div>
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setMobileNavOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-10 bg-white border-b border-soil-100 px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-soil-600" onClick={() => setMobileNavOpen(true)}><Menu size={22} /></button>
            <div>
              <p className="text-sm text-soil-400">Welcome back,</p>
              <p className="font-display text-lg leading-tight">{displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DemoTag />
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(o => !o)}
                className="relative p-2 rounded-card hover:bg-soil-50 text-soil-600"
              >
                <Bell size={19} />
                {notifs.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rust-500" />
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-soil-100 rounded-card shadow-lg py-2 max-h-96 overflow-y-auto">
                  <p className="px-4 py-1.5 text-xs uppercase tracking-wide text-soil-400 font-medium">Notifications</p>
                  {notifs.length === 0 && <p className="px-4 py-3 text-sm text-soil-400">No notifications yet.</p>}
                  {notifs.map(n => (
                    <div key={n.id} className="px-4 py-2.5 text-sm border-t border-soil-50 hover:bg-soil-50">
                      <p className="text-soil-800">{n.message}</p>
                      <p className="text-[11px] text-soil-400 mt-0.5">{n.created_at}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
