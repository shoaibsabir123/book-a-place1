import React from 'react';
import { Destination } from '../../types';
import { MapPin, ArrowRight } from 'lucide-react';

interface DestinationsViewProps {
  destinations: Destination[];
  onSelectDestination: (destName: string) => void;
}

export const DestinationsView: React.FC<DestinationsViewProps> = ({
  destinations,
  onSelectDestination
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
          Pakistani Destinations
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Explore Cities, Valleys & Coasts
        </h2>
        <p className="text-sm text-slate-600">
          From the majestic Margallas of Islamabad to the historic havelis of Lahore and the alpine lakes of Skardu.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {destinations.map((dest) => (
          <div
            key={dest.id}
            onClick={() => onSelectDestination(dest.name)}
            className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 border border-slate-200"
          >
            <img
              src={dest.image_url}
              alt={dest.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90 group-hover:opacity-85 transition-opacity" />

            <div className="absolute bottom-0 inset-x-0 p-6 text-white space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                {dest.province}
              </span>
              <h3 className="text-xl font-black leading-snug">
                {dest.name}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {dest.description}
              </p>

              <div className="pt-2 flex items-center justify-between border-t border-white/20 text-xs">
                <span className="text-emerald-300 font-bold">{dest.property_count} verified stays</span>
                <span className="flex items-center gap-1 font-bold group-hover:translate-x-1 transition-transform">
                  Explore <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
