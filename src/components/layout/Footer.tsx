import React from 'react';
import { Building2, ShieldCheck, Zap, Headphones, Heart, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, params?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#0B192C] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-slate-800/80">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-900/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Verified Pakistani Listings</h4>
              <p className="text-xs text-slate-400 mt-0.5">Every property inspected for safety, reliable amenities, and verified hosts.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-900/40 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Guaranteed Power & Wi-Fi</h4>
              <p className="text-xs text-slate-400 mt-0.5">Filter with confidence for 24/7 generator backup, solar UPS, and fiber internet.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-900/40 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Local 24/7 Guest Support</h4>
              <p className="text-xs text-slate-400 mt-0.5">Helpline in Urdu and English for seamless check-in and booking support.</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold">
                <Building2 className="w-5 h-5 text-amber-300" />
              </div>
              <span className="font-extrabold text-lg text-white">Book a Place</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pakistan’s premier AI-powered accommodation marketplace. Connecting students, corporate professionals, and families with exceptional stays.
            </p>
            <div className="text-xs text-slate-400 pt-2">
              <p className="font-semibold text-slate-300">Helpline Pakistan:</p>
              <p className="text-emerald-400 font-mono">+92 51 111 266 575</p>
              <p className="text-slate-400">support@bookaplace.pk</p>
            </div>
          </div>

          {/* Popular Cities */}
          <div>
            <h5 className="text-white font-bold text-sm mb-3">Popular Destinations</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('explore', { destination: 'Islamabad' })} className="hover:text-emerald-400 transition-colors">
                  Stays in Islamabad (F-6, F-7, E-11)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore', { destination: 'Lahore' })} className="hover:text-emerald-400 transition-colors">
                  Lahore (Gulberg, DHA, Johar Town)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore', { destination: 'Karachi' })} className="hover:text-emerald-400 transition-colors">
                  Karachi (Clifton, DHA, PECHS)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore', { destination: 'Murree' })} className="hover:text-emerald-400 transition-colors">
                  Murree & Bhurban Hills
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore', { destination: 'Hunza' })} className="hover:text-emerald-400 transition-colors">
                  Hunza Valley & Karimabad
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore', { destination: 'Skardu' })} className="hover:text-emerald-400 transition-colors">
                  Skardu Lake Chalets
                </button>
              </li>
            </ul>
          </div>

          {/* Stays by Category */}
          <div>
            <h5 className="text-white font-bold text-sm mb-3">Accommodation Types</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('packages', { slug: 'student-living' })} className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  Student Living & Hostels <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('packages', { slug: 'working-professionals' })} className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  Executive Corporate Suites <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('packages', { slug: 'family-comfort' })} className="hover:text-emerald-400 transition-colors">
                  Furnished Family Apartments
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('packages', { slug: 'northern-escapes' })} className="hover:text-emerald-400 transition-colors">
                  Mountain Villas & Chalets
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('packages', { slug: 'budget-travelers' })} className="hover:text-emerald-400 transition-colors">
                  Budget Haveli Rooms
                </button>
              </li>
            </ul>
          </div>

          {/* Hosting & Legal */}
          <div>
            <h5 className="text-white font-bold text-sm mb-3">Hosting & Policies</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('host-onboarding')} className="text-emerald-400 font-bold hover:underline">
                  List Your Property in Pakistan
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('cancellation-policy')} className="hover:text-emerald-400 transition-colors">
                  Cancellation & Refund Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('terms')} className="hover:text-emerald-400 transition-colors">
                  Guest Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy')} className="hover:text-emerald-400 transition-colors">
                  Privacy & Data Protection
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin-panel')} className="text-slate-500 hover:text-slate-300 text-[11px]">
                  Admin Gateway
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Book a Place Pakistan. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-slate-400">
            Powered by Supabase PostgreSQL & Google Gemini AI
          </p>
        </div>

      </div>
    </footer>
  );
};
