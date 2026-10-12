import React, { useState } from 'react';
import { MapPin, Navigation, Star, ArrowRight, X, Building2 } from 'lucide-react';
import { Property } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface InteractiveMapProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  selectedProperty?: Property | null;
  activeCity?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  properties,
  onSelectProperty,
  selectedProperty,
  activeCity
}) => {
  const { formatPrice } = useAuth();
  const [activePin, setActivePin] = useState<Property | null>(selectedProperty || null);

  // Approximate relative bounds for Pakistan (Lat 24 to 37, Long 66 to 76)
  const MIN_LAT = 24.0;
  const MAX_LAT = 37.0;
  const MIN_LNG = 66.0;
  const MAX_LNG = 76.5;

  const getPositionPercent = (lat: number, lng: number) => {
    const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 100;
    // Latitude is inverted in SVG/CSS coordinates
    const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * 100;
    return {
      left: `${Math.max(5, Math.min(95, x))}%`,
      top: `${Math.max(5, Math.min(95, y))}%`
    };
  };

  return (
    <div className="relative w-full h-[520px] rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg select-none">
      
      {/* Visual Map Canvas with Pakistan Geography styling */}
      <div className="absolute inset-0 bg-radial from-slate-800 to-[#0B192C] opacity-90" />
      
      {/* Decorative Grid Lines */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: 'linear-gradient(#047857 1px, transparent 1px), linear-gradient(90deg, #047857 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Map Header Status Bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-[#0B192C]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700 text-xs text-slate-200">
        <Navigation className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-bold">Pakistan Accommodation Map</span>
        <span className="text-slate-400">•</span>
        <span className="text-emerald-400 font-medium">{properties.length} Active Listings</span>
      </div>

      {/* Regional Landmarks Labels */}
      <div className="absolute top-8 right-16 text-[10px] uppercase font-bold tracking-widest text-slate-400 select-none pointer-events-none">
        Karakoram & Himalayas
      </div>
      <div className="absolute top-28 right-24 text-[10px] font-bold text-slate-400 select-none pointer-events-none">
        Islamabad / Rawalpindi
      </div>
      <div className="absolute top-44 right-20 text-[10px] font-bold text-slate-400 select-none pointer-events-none">
        Lahore / Punjab Plains
      </div>
      <div className="absolute bottom-12 left-14 text-[10px] font-bold text-slate-400 select-none pointer-events-none">
        Karachi / Arabian Coast
      </div>

      {/* Render Property Pins */}
      {properties.map((prop) => {
        const { left, top } = getPositionPercent(prop.latitude, prop.longitude);
        const isSelected = activePin?.id === prop.id;

        return (
          <div
            key={prop.id}
            style={{ left, top }}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 hover:scale-110"
          >
            <button
              onClick={() => setActivePin(prop)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-lg transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/30 scale-110 z-30'
                  : 'bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-500'
              }`}
            >
              <Building2 className="w-3 h-3" />
              <span>{formatPrice(prop.base_nightly_price)}</span>
            </button>
          </div>
        );
      })}

      {/* Selected Property Preview Popup Modal */}
      {activePin && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-30 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 transition-all animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
              <MapPin className="w-3 h-3" />
              <span>{activePin.neighborhood}, {activePin.city}</span>
            </div>
            <button
              onClick={() => setActivePin(null)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex gap-3">
            <img
              src={activePin.images[0]}
              alt={activePin.title}
              className="w-20 h-20 rounded-xl object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-xs text-slate-900 truncate">
                {activePin.title}
              </h4>
              <div className="flex items-center gap-1 text-xs text-amber-500 my-1 font-semibold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{activePin.rating.toFixed(1)}</span>
                <span className="text-[10px] text-slate-600">({activePin.review_count})</span>
              </div>
              <div className="text-xs font-extrabold text-slate-900">
                {formatPrice(activePin.base_nightly_price)}
                <span className="text-[10px] font-normal text-slate-600"> / night</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectProperty(activePin)}
            className="w-full mt-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View Full Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute bottom-4 left-4 hidden sm:flex items-center gap-2 bg-[#0B192C]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] text-slate-300">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>Click any price pill to view property details</span>
      </div>

    </div>
  );
};
