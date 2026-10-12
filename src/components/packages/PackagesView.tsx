import React from 'react';
import { Package } from '../../types';
import { CheckCircle2, ArrowRight, Sparkles, GraduationCap, Briefcase, Users, Mountain } from 'lucide-react';

interface PackagesViewProps {
  packages: Package[];
  onSelectPackage: (pkg: Package) => void;
}

export const PackagesView: React.FC<PackagesViewProps> = ({ packages, onSelectPackage }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
          Curated Pakistani Living Packages
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Accommodation Tailored to Your Journey
        </h2>
        <p className="text-sm text-slate-600">
          From university semesters in Lahore & Islamabad to corporate assignments in Karachi and mountain retreats in Hunza.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="h-52 relative overflow-hidden bg-slate-100">
                <img
                  src={pkg.banner_image}
                  alt={pkg.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-950/85 text-emerald-300 text-xs font-extrabold backdrop-blur-xs">
                  Save up to {pkg.discount_percentage}%
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {pkg.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Target: {pkg.target_audience}
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {pkg.description}
                </p>

                <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs">
                  <span className="font-bold text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                    What’s Included:
                  </span>
                  {pkg.inclusions.map((inc, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => onSelectPackage(pkg)}
                className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all"
              >
                <span>Explore {pkg.title}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
