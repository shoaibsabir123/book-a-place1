import React, { useState } from 'react';
import { 
  Building2, 
  Sparkles, 
  Heart, 
  User, 
  Menu, 
  X, 
  ShieldCheck, 
  PlusCircle, 
  ChevronDown, 
  LogOut, 
  Layers,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenAiFinder: () => void;
  wishlistCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAiFinder,
  wishlistCount
}) => {
  const { user, role, setRole, signOut, isAuthenticated, currency, setCurrency } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0B192C] to-[#047857] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-[#0B192C]">
                  Book a Place
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800">
                  PK
                </span>
              </div>
              <p className="text-[11px] text-slate-700 font-medium tracking-wide hidden sm:block">
                Find Your Place. Make Yourself at Home.
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onNavigate('explore')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentView === 'explore' 
                  ? 'text-emerald-700 bg-emerald-50' 
                  : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
              Explore Stays
            </button>
            <button
              onClick={() => onNavigate('destinations')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentView === 'destinations' 
                  ? 'text-emerald-700 bg-emerald-50' 
                  : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
              Destinations
            </button>
            <button
              onClick={() => onNavigate('packages')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentView === 'packages' 
                  ? 'text-emerald-700 bg-emerald-50' 
                  : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
              Packages
            </button>
            
            {/* AI Stay Specialist Button */}
            <button
              onClick={onOpenAiFinder}
              className="ml-1 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold text-emerald-800 bg-gradient-to-r from-emerald-100 to-amber-100/60 border border-emerald-300/60 hover:shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>AI Stay Finder</span>
            </button>
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Currency selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg px-2.5 py-1.5 border-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="PKR">PKR (Rs)</option>
              <option value="USD">USD ($)</option>
              <option value="AED">AED (Dh)</option>
              <option value="GBP">GBP (£)</option>
            </select>

            {/* Role Switcher Pill (For easy evaluation across Customer, Host, Admin) */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setRole('customer')}
                className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${
                  role === 'customer' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Customer Mode"
              >
                Guest
              </button>
              <button
                onClick={() => setRole('host')}
                className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${
                  role === 'host' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Host Management Portal"
              >
                Host
              </button>
              <button
                onClick={() => setRole('admin')}
                className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${
                  role === 'admin' ? 'bg-[#0B192C] text-amber-300 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Administrator Security Control"
              >
                Admin
              </button>
            </div>

            {/* Wishlist */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="relative p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Host CTA */}
            {role !== 'host' && role !== 'admin' && (
              <button
                onClick={() => onNavigate('host-onboarding')}
                className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-slate-700 hover:text-emerald-800 rounded-lg hover:bg-slate-50 border border-slate-200 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                List Property
              </button>
            )}

            {/* User Account Menu */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all bg-white"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">
                  {user?.full_name ? user.full_name[0].toUpperCase() : 'G'}
                </div>
                <span className="text-xs font-semibold text-slate-700 max-w-[80px] truncate">
                  {user?.full_name?.split(' ')[0] || 'Account'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-800">{user?.full_name}</p>
                    <p className="text-slate-500 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-100 text-slate-700">
                      Role: {role}
                    </span>
                  </div>

                  <button
                    onClick={() => { onNavigate('account'); setUserDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" /> My Bookings & Profile
                  </button>

                  {role === 'host' && (
                    <button
                      onClick={() => { onNavigate('host-portal'); setUserDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-emerald-700 hover:bg-emerald-50 font-bold flex items-center gap-2"
                    >
                      <Layers className="w-3.5 h-3.5 text-emerald-600" /> Host Dashboard
                    </button>
                  )}

                  {role === 'admin' && (
                    <button
                      onClick={() => { onNavigate('admin-panel'); setUserDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-amber-700 hover:bg-amber-50 font-bold flex items-center gap-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Admin Security Panel
                    </button>
                  )}

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    onClick={() => { signOut(); setUserDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 font-medium flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" /> Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenAiFinder}
              className="p-2 text-emerald-700 bg-emerald-50 rounded-lg"
              title="AI Assistant"
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-lg text-center text-xs font-bold">
            <button 
              onClick={() => { setRole('customer'); setMobileMenuOpen(false); }}
              className={`py-1.5 rounded ${role === 'customer' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'}`}
            >
              Guest
            </button>
            <button 
              onClick={() => { setRole('host'); setMobileMenuOpen(false); }}
              className={`py-1.5 rounded ${role === 'host' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'}`}
            >
              Host
            </button>
            <button 
              onClick={() => { setRole('admin'); setMobileMenuOpen(false); }}
              className={`py-1.5 rounded ${role === 'admin' ? 'bg-[#0B192C] text-amber-300' : 'text-slate-600'}`}
            >
              Admin
            </button>
          </div>

          <div className="flex flex-col space-y-1 text-sm font-semibold">
            <button
              onClick={() => { onNavigate('explore'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Explore Stays
            </button>
            <button
              onClick={() => { onNavigate('destinations'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Destinations
            </button>
            <button
              onClick={() => { onNavigate('packages'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Packages (Student & Corporate)
            </button>
            <button
              onClick={() => { onNavigate('account'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              My Bookings ({user?.full_name})
            </button>
            {role === 'host' && (
              <button
                onClick={() => { onNavigate('host-portal'); setMobileMenuOpen(false); }}
                className="text-left px-3 py-2 rounded-lg text-emerald-700 font-bold bg-emerald-50"
              >
                Host Management Portal
              </button>
            )}
            {role === 'admin' && (
              <button
                onClick={() => { onNavigate('admin-panel'); setMobileMenuOpen(false); }}
                className="text-left px-3 py-2 rounded-lg text-amber-800 font-bold bg-amber-50"
              >
                Admin Security Dashboard
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
