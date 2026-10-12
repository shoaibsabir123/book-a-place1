import React from 'react';
import { 
  Star, 
  MapPin, 
  Wifi, 
  ShieldCheck, 
  Car, 
  Zap, 
  Coffee, 
  Heart, 
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Property } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
  onBookNow: (property: Property) => void;
  isWishlisted: boolean;
  onToggleWishlist: (propertyId: string) => void;
  stayNights?: number;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelect,
  onBookNow,
  isWishlisted,
  onToggleWishlist,
  stayNights = 1
}) => {
  const { formatPrice } = useAuth();

  // Get primary amenities for display matching the card reference
  const hasWifi = property.amenity_slugs.includes('fiber-wifi');
  const hasGenerator = property.amenity_slugs.includes('generator-backup') || property.amenity_slugs.includes('ups-power');
  const hasParking = property.amenity_slugs.includes('parking');
  const hasCctv = property.amenity_slugs.includes('cctv-guard');
  const hasBreakfast = property.amenity_slugs.includes('breakfast');

  const calculatedTotal = property.base_nightly_price * stayNights;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col md:flex-row group">
      
      {/* Left Image Section */}
      <div className="relative md:w-80 h-56 md:h-auto shrink-0 overflow-hidden bg-slate-100">
        <img
          src={property.images[0] || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(property.id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md backdrop-blur-xs transition-transform active:scale-90 cursor-pointer"
          aria-label="Save to wishlist"
        >
          <Heart 
            className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} 
          />
        </button>

        {/* Verified Badge */}
        {property.is_verified_listing && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/85 text-emerald-300 text-[11px] font-bold backdrop-blur-xs shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified Stay</span>
          </div>
        )}

        {/* Student / Professional category tag */}
        {property.suitable_for?.includes('students') && (
          <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wide">
            Student Friendly
          </div>
        )}
      </div>

      {/* Middle Content Section */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
        <div>
          {/* Location & Title */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{property.neighborhood}, {property.city}</span>
            <span className="text-slate-300">•</span>
            <span className="capitalize text-slate-600 font-semibold">{property.property_type.replace('_', ' ')}</span>
          </div>

          <h3 
            onClick={() => onSelect(property)}
            className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-emerald-800 transition-colors cursor-pointer line-clamp-1"
          >
            {property.title}
          </h3>

          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {property.description}
          </p>

          {/* Amenities Grid (Matches reference image styling) */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Amenities
            </span>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
              {hasGenerator && (
                <div className="flex items-center gap-1.5 font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>24/7 Power Backup</span>
                </div>
              )}
              {hasWifi && (
                <div className="flex items-center gap-1.5 font-medium">
                  <Wifi className="w-3.5 h-3.5 text-slate-500" />
                  <span>Fiber Wi-Fi</span>
                </div>
              )}
              {hasParking && (
                <div className="flex items-center gap-1.5 font-medium">
                  <Car className="w-3.5 h-3.5 text-slate-500" />
                  <span>Free Parking</span>
                </div>
              )}
              {hasCctv && (
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>CCTV & Guard</span>
                </div>
              )}
              {hasBreakfast && (
                <div className="flex items-center gap-1.5 font-medium">
                  <Coffee className="w-3.5 h-3.5 text-slate-500" />
                  <span>Breakfast</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rating and Booking CTA Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-end justify-between gap-3">
          
          {/* Star Rating */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-900">{property.rating.toFixed(1)}</span>
            <span className="text-xs text-slate-600">({property.review_count} verified reviews)</span>
          </div>

          {/* Pricing & CTA Button */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-slate-600 block">
                Starts from
              </span>
              <div className="text-base sm:text-lg font-extrabold text-slate-900">
                {formatPrice(property.base_nightly_price)}
                <span className="text-xs font-normal text-slate-600"> / night</span>
              </div>
              {stayNights > 1 && (
                <span className="text-[10px] text-emerald-800 font-semibold block">
                  Total {stayNights} nights: {formatPrice(calculatedTotal)}
                </span>
              )}
            </div>

            <button
              onClick={() => onSelect(property)}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#047857] hover:bg-[#065F46] text-white text-xs sm:text-sm font-bold tracking-wide shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>VIEW DETAILS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
