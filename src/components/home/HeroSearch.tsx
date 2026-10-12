import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Sparkles, 
  Building, 
  ShieldCheck, 
  ArrowRight,
  GraduationCap,
  Briefcase,
  Mountain,
  Home,
  Key,
  Layers,
  Tent,
  Hotel,
  Trees,
  Compass,
  Warehouse
} from 'lucide-react';
import { SearchFilterParams, Destination, PlaceTypeOption } from '../../types';

interface HeroSearchProps {
  destinations: Destination[];
  placeTypes?: PlaceTypeOption[];
  onSearch: (params: SearchFilterParams) => void;
  onOpenAiFinder: () => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  destinations,
  placeTypes = [],
  onSearch,
  onOpenAiFinder
}) => {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [selectedType, setSelectedType] = useState<string>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      destination: destination || undefined,
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      guests,
      category: selectedType !== 'all' ? selectedType : undefined
    });
  };

  const quickCities = [
    { name: 'Islamabad', tag: 'Margalla Stays' },
    { name: 'Lahore', tag: 'Gulberg & DHA' },
    { name: 'Karachi', tag: 'Clifton Coast' },
    { name: 'Murree', tag: 'Pine Hills' },
    { name: 'Hunza', tag: 'Karakoram Views' },
    { name: 'Skardu', tag: 'Lakeside Chalets' },
  ];

  // Helper to render icon for custom place type
  const renderPlaceIcon = (iconName?: string) => {
    switch (iconName) {
      case 'GraduationCap': return <GraduationCap className="w-5 h-5" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5" />;
      case 'Mountain': return <Mountain className="w-5 h-5" />;
      case 'Home': return <Home className="w-5 h-5" />;
      case 'Key': return <Key className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'Tent': return <Tent className="w-5 h-5" />;
      case 'Hotel': return <Hotel className="w-5 h-5" />;
      case 'Trees': return <Trees className="w-5 h-5" />;
      case 'Warehouse': return <Warehouse className="w-5 h-5" />;
      case 'Compass': return <Compass className="w-5 h-5" />;
      default: return <Building className="w-5 h-5" />;
    }
  };

  const featuredTypes = placeTypes.length > 0 
    ? (placeTypes.filter(pt => pt.is_featured_on_front).length > 0
        ? placeTypes.filter(pt => pt.is_featured_on_front)
        : placeTypes.slice(0, 8))
    : [];

  return (
    <div className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden">
      
      {/* Background Gradient & Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Hero Top Title & Trust Pill */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-bold mb-4 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Pakistan’s Trusted Accommodation Marketplace</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0B192C] tracking-tight leading-tight">
            Find Your Place. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#047857] via-[#065F46] to-[#0B192C]">
              Make Yourself at Home.
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Discover verified apartments, student living, executive co-living, and luxury northern chalets across Islamabad, Lahore, Karachi, and beyond.
          </p>
        </div>

        {/* Master Booking Search Console */}
        <div className="max-w-5xl mx-auto bg-white rounded-3xl p-3 sm:p-5 shadow-xl border border-slate-200/80">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* 1. Destination Input */}
            <div className="md:col-span-3 p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/60 transition-colors">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>City / Destination</span>
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-transparent font-bold text-slate-900 text-xs sm:text-sm focus:outline-none cursor-pointer"
              >
                <option value="">All Destinations</option>
                {destinations.map(d => (
                  <option key={d.id} value={d.name}>{d.name} ({d.province})</option>
                ))}
              </select>
            </div>

            {/* 2. Place Type Option Dropdown (Customizable by Admin) */}
            <div className="md:col-span-3 p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/60 transition-colors">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>Place Type</span>
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-transparent font-bold text-slate-900 text-xs sm:text-sm focus:outline-none cursor-pointer"
              >
                <option value="all">All Place Types</option>
                {placeTypes.map(pt => (
                  <option key={pt.id} value={pt.slug}>{pt.name}</option>
                ))}
              </select>
            </div>

            {/* 3. Check-in Date */}
            <div className="md:col-span-2 p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/60 transition-colors">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Check-in</span>
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-transparent font-semibold text-slate-900 text-xs focus:outline-none"
              />
            </div>

            {/* 4. Guests Selector */}
            <div className="md:col-span-2 p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/60 transition-colors">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Guests</span>
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full bg-transparent font-bold text-slate-900 text-xs focus:outline-none cursor-pointer"
              >
                <option value={1}>1 Solo</option>
                <option value={2}>2 Guests</option>
                <option value={3}>3 Guests</option>
                <option value={4}>4 Family</option>
                <option value={6}>5+ Group</option>
              </select>
            </div>

            {/* 5. Search Action Button */}
            <div className="md:col-span-2 h-full flex items-center">
              <button
                type="submit"
                className="w-full h-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#047857] to-[#065F46] hover:from-[#065F46] hover:to-[#047857] text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Search className="w-4 h-4" />
                <span>SEARCH</span>
              </button>
            </div>

          </form>

          {/* Quick Filter Categories Bar */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                Popular Cities:
              </span>
              {quickCities.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    setDestination(c.name);
                    onSearch({ destination: c.name });
                  }}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-medium transition-colors cursor-pointer text-xs"
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* AI Assistant Banner Link */}
            <button
              type="button"
              onClick={onOpenAiFinder}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>Need custom advice? Ask AI Concierge</span>
            </button>
          </div>

        </div>

        {/* Dynamic Front-Page Place Types (Customizable by Admin in Backend) */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-5xl mx-auto">
          {featuredTypes.map((pt) => (
            <div 
              key={pt.id}
              onClick={() => onSearch({ category: pt.slug })}
              className="p-3.5 rounded-2xl bg-white/80 hover:bg-white border border-slate-200/80 shadow-2xs hover:shadow-sm cursor-pointer transition-all flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                {renderPlaceIcon(pt.icon_name)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{pt.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{pt.badge_text || pt.description || 'Verified listings'}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};

