import React, { useState } from 'react';
import { 
  Search, 
  Star, 
  RotateCcw, 
  MapPin, 
  SlidersHorizontal,
  DollarSign,
  Check
} from 'lucide-react';
import { SearchFilterParams, Destination, Amenity, PropertyCategory, PlaceTypeOption } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface FilterSidebarProps {
  destinations: Destination[];
  amenities: Amenity[];
  placeTypes?: PlaceTypeOption[];
  filters: SearchFilterParams;
  onChange: (filters: SearchFilterParams) => void;
  onReset: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  destinations,
  amenities,
  placeTypes = [],
  filters,
  onChange,
  onReset
}) => {
  const { formatPrice } = useAuth();
  const [destSearch, setDestSearch] = useState('');

  const filteredDestinations = destinations.filter(d => 
    d.name.toLowerCase().includes(destSearch.toLowerCase()) ||
    d.province.toLowerCase().includes(destSearch.toLowerCase())
  );

  const handleDestinationSelect = (city: string) => {
    onChange({
      ...filters,
      destination: filters.destination === city ? undefined : city
    });
  };

  const handleRatingSelect = (rating: number) => {
    onChange({
      ...filters,
      minRating: filters.minRating === rating ? undefined : rating
    });
  };

  const handleAmenityToggle = (slug: string) => {
    const current = filters.amenities || [];
    const next = current.includes(slug)
      ? current.filter(s => s !== slug)
      : [...current, slug];
    onChange({
      ...filters,
      amenities: next.length > 0 ? next : undefined
    });
  };

  const handleCategorySelect = (category: PropertyCategory | 'all') => {
    onChange({
      ...filters,
      category: filters.category === category ? undefined : category
    });
  };

  const budgetTiers = [
    { label: 'Under PKR 5,000', min: 0, max: 5000 },
    { label: 'PKR 5,000 to PKR 10,000', min: 5000, max: 10000 },
    { label: 'PKR 10,000 to PKR 20,000', min: 10000, max: 20000 },
    { label: 'PKR 20,000+', min: 20000, max: 100000 },
  ];

  const handleBudgetTier = (min: number, max: number) => {
    if (filters.minPrice === min && filters.maxPrice === max) {
      onChange({ ...filters, minPrice: undefined, maxPrice: undefined });
    } else {
      onChange({ ...filters, minPrice: min, maxPrice: max });
    }
  };

  return (
    <aside className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs divide-y divide-slate-100 text-slate-800">
      
      {/* Header with Reset */}
      <div className="pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900">
            Filters
          </h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* 1. DESTINATIONS (Matches reference layout with search) */}
      <div className="py-4">
        <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide text-slate-900 mb-2.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>Destinations</span>
        </div>

        {/* Quick search input */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Search Pakistani city..."
            value={destSearch}
            onChange={(e) => setDestSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {filteredDestinations.map((d) => {
            const isSelected = filters.destination?.toLowerCase() === d.name.toLowerCase();
            return (
              <label
                key={d.id}
                className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs group"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleDestinationSelect(d.name)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className={`${isSelected ? 'font-bold text-emerald-900' : 'text-slate-700'}`}>
                    {d.name}
                  </span>
                </div>
                <span className="text-[11px] text-slate-600">
                  {d.property_count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 2. GUEST RATING */}
      <div className="py-4">
        <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide text-slate-900 mb-2.5">
          <Star className="w-3.5 h-3.5 text-amber-500" />
          <span>Guest Rating</span>
        </div>
        <div className="space-y-1.5">
          {[5, 4, 3].map((stars) => {
            const isSelected = filters.minRating === stars;
            return (
              <label
                key={stars}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleRatingSelect(stars)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex items-center gap-1">
                  <div className="flex text-amber-400">
                    {[...Array(stars)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-slate-600 text-[11px] font-medium">
                    {stars === 5 ? '5 Star (Exceptional)' : `${stars}+ Stars`}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. BUDGET (PKR) */}
      <div className="py-4">
        <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide text-slate-900 mb-2.5">
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          <span>Nightly Budget</span>
        </div>
        <div className="space-y-1.5">
          {budgetTiers.map((tier, idx) => {
            const isSelected = filters.minPrice === tier.min && filters.maxPrice === tier.max;
            return (
              <label
                key={idx}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleBudgetTier(tier.min, tier.max)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className={isSelected ? 'font-bold text-emerald-900' : 'text-slate-700'}>
                  {tier.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 4. ACCOMMODATION TYPE */}
      <div className="py-4">
        <span className="block font-bold text-xs uppercase tracking-wide text-slate-900 mb-2.5">
          Place Type
        </span>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {placeTypes.length > 0 ? (
            placeTypes.map((cat) => {
              const isSelected = filters.category === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.slug as any)}
                  className={`text-left px-2 py-1.5 rounded-lg border text-[11px] font-semibold transition-all truncate ${
                    isSelected 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                  title={cat.name}
                >
                  {cat.name}
                </button>
              );
            })
          ) : (
            [
              { id: 'apartment', label: 'Apartments' },
              { id: 'hostel', label: 'Hostels / Student' },
              { id: 'guest_house', label: 'Guest Houses' },
              { id: 'serviced_residence', label: 'Serviced Stays' },
              { id: 'villa', label: 'Villas & Chalets' },
              { id: 'hotel', label: 'Hotels' }
            ].map((cat) => {
              const isSelected = filters.category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id as any)}
                  className={`text-left px-2 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                    isSelected 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 5. AMENITIES */}
      <div className="pt-4">
        <span className="block font-bold text-xs uppercase tracking-wide text-slate-900 mb-2.5">
          Key Amenities
        </span>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {amenities.slice(0, 8).map((amenity) => {
            const isSelected = (filters.amenities || []).includes(amenity.slug);
            return (
              <label
                key={amenity.id}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleAmenityToggle(amenity.slug)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className={isSelected ? 'font-bold text-emerald-900' : 'text-slate-700'}>
                  {amenity.name}
                </span>
              </label>
            );
          })}
        </div>
      </div>

    </aside>
  );
};
