import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Wifi, 
  Zap, 
  Car, 
  Flame, 
  Wind, 
  UtensilsCrossed, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Heart, 
  Share2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Property, RoomType, Review } from '../../types';
import { dbService } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

interface PropertyDetailViewProps {
  property: Property;
  onClose: () => void;
  onProceedToBooking: (property: Property, roomType: RoomType, bookingDetails: any) => void;
  onOpenItineraryGen: (property: Property) => void;
  isWishlisted: boolean;
  onToggleWishlist: (propertyId: string) => void;
}

export const PropertyDetailView: React.FC<PropertyDetailViewProps> = ({
  property,
  onClose,
  onProceedToBooking,
  onOpenItineraryGen,
  isWishlisted,
  onToggleWishlist
}) => {
  const { formatPrice, user } = useAuth();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Booking state
  const [checkIn, setCheckIn] = useState('2026-10-15');
  const [checkOut, setCheckOut] = useState('2026-10-18');
  const [guestsCount, setGuestsCount] = useState(2);
  const [roomsCount, setRoomsCount] = useState(1);
  const [quote, setQuote] = useState<any>(null);

  // Review submission state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    async function loadDetails() {
      const rooms = await dbService.getRoomTypes(property.id);
      setRoomTypes(rooms);
      if (rooms.length > 0) setSelectedRoom(rooms[0]);

      const revs = await dbService.getReviews(property.id);
      setReviews(revs);
    }
    loadDetails();
  }, [property.id]);

  // Recalculate quote dynamically
  useEffect(() => {
    if (!selectedRoom) return;

    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const nights = Math.max(1, Math.round((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24)));

    const nightly = selectedRoom.nightly_price;
    const baseTotal = nightly * nights * roomsCount;

    let discountPercent = 0;
    if (nights >= 30) discountPercent = property.monthly_discount_percent || 25;
    else if (nights >= 7) discountPercent = property.weekly_discount_percent || 10;

    const discountAmount = Math.round((baseTotal * discountPercent) / 100);
    const discountedBase = baseTotal - discountAmount;
    const taxes = Math.round((discountedBase * (property.tax_rate_percent || 5)) / 100);
    const cleaning = property.cleaning_fee || 0;
    const security = property.security_deposit || 0;
    const finalTotal = discountedBase + taxes + cleaning + security;

    setQuote({
      nights,
      nightly,
      baseTotal,
      discountPercent,
      discountAmount,
      taxes,
      cleaning,
      security,
      finalTotal
    });
  }, [selectedRoom, checkIn, checkOut, roomsCount, property]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const added = await dbService.addReview({
      property_id: property.id,
      user_id: user?.id || 'guest-user',
      user_name: user?.full_name || 'Verified Guest',
      rating: newRating,
      rating_cleanliness: newRating,
      rating_communication: 5,
      rating_location: 5,
      rating_value: newRating,
      comment: newComment,
      is_verified_stay: true,
      is_moderated: true
    });

    setReviews([added, ...reviews]);
    setNewComment('');
    setShowReviewForm(false);
  };

  const handleReserve = () => {
    if (!selectedRoom || !quote) return;
    onProceedToBooking(property, selectedRoom, {
      checkIn,
      checkOut,
      guestsCount,
      roomsCount,
      quote
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm overflow-y-auto flex items-start justify-center p-2 sm:p-4 md:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl border border-slate-200 my-4 relative">
        
        {/* Modal Close & Actions Header */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base sm:text-lg text-slate-900 line-clamp-1">
              {property.title}
            </span>
            {property.is_verified_listing && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleWishlist(property.id)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
              title="Save to Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
            <button
              onClick={() => onOpenItineraryGen(property)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI Trip Plan</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-8">
          
          {/* 1. Photo Gallery */}
          <div className="space-y-3">
            <div className="h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-100 relative shadow-inner">
              <img
                src={property.images[activeImageIdx] || property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-white text-xs font-semibold">
                Photo {activeImageIdx + 1} of {property.images.length}
              </div>
            </div>

            {/* Thumbnail row */}
            {property.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activeImageIdx === idx ? 'border-emerald-600 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Grid with Main Details + Sticky Reservation Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 7 cols: Descriptions, Rooms, Amenities, Reviews */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Basic Meta */}
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{property.address}, {property.neighborhood}, {property.city}, Pakistan</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex text-amber-500 items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="font-extrabold text-sm text-slate-900">{property.rating.toFixed(2)}</span>
                  <span className="text-xs text-slate-500">({reviews.length} verified reviews)</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-semibold capitalize text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {property.accommodation_class} Stay
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-slate-100 pt-5">
                <h4 className="font-bold text-sm uppercase tracking-wide text-slate-900 mb-2">
                  About this accommodation
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Room Types Picker */}
              <div className="border-t border-slate-100 pt-5">
                <h4 className="font-bold text-sm uppercase tracking-wide text-slate-900 mb-3">
                  Available Room Configurations
                </h4>
                <div className="space-y-3">
                  {roomTypes.map((room) => {
                    const isSelected = selectedRoom?.id === room.id;
                    return (
                      <div
                        key={room.id}
                        onClick={() => setSelectedRoom(room)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-sm text-slate-900">{room.name}</h5>
                              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                {room.room_class.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{room.description}</p>
                            <div className="flex items-center gap-4 text-xs text-slate-600 mt-2">
                              <span>👤 Up to {room.capacity_guests} Guests</span>
                              <span>🛏️ {room.beds_count} Bed(s)</span>
                              <span>🚿 {room.bathrooms_count} Bath</span>
                              <span>📐 {room.square_meters} m²</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-base font-extrabold text-slate-900 block">
                              {formatPrice(room.nightly_price)}
                            </span>
                            <span className="text-[10px] text-slate-400">per night</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Comprehensive Amenities */}
              <div className="border-t border-slate-100 pt-5">
                <h4 className="font-bold text-sm uppercase tracking-wide text-slate-900 mb-3">
                  What this place offers
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2 font-medium">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <span>24/7 Generator / UPS Backup</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Wifi className="w-4 h-4 text-emerald-600" />
                    <span>High-Speed 100Mbps Fiber Wi-Fi</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Wind className="w-4 h-4 text-emerald-600" />
                    <span>Inverter Air Conditioning</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Flame className="w-4 h-4 text-emerald-600" />
                    <span>Gas Heating / Hot Water</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Car className="w-4 h-4 text-emerald-600" />
                    <span>Free Secure Parking</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>24/7 Security & CCTV Guard</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
                    <span>Equipped Kitchen / Kitchenette</span>
                  </div>
                </div>
              </div>

              {/* House Rules & Policies */}
              <div className="border-t border-slate-100 pt-5 space-y-2 text-xs">
                <h4 className="font-bold text-sm uppercase tracking-wide text-slate-900">
                  House Rules & Check-in
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>⏰ Check-in: After {property.check_in_time} PKT</div>
                  <div>⏰ Check-out: Before {property.check_out_time} PKT</div>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                  <strong>Pakistani Law Notice:</strong> Original Government CNIC or Passport is required at physical check-in for all staying guests.
                </div>
              </div>

              {/* Verified Guest Reviews */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm uppercase tracking-wide text-slate-900">
                    Verified Guest Reviews ({reviews.length})
                  </h4>
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    {showReviewForm ? 'Cancel' : '+ Write a Review'}
                  </button>
                </div>

                {/* Review Form */}
                {showReviewForm && (
                  <form onSubmit={handleReviewSubmit} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <p className="font-bold text-xs text-slate-800">Share your experience:</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600">Rating:</span>
                      <select
                        value={newRating}
                        onChange={(e) => setNewRating(Number(e.target.value))}
                        className="text-xs p-1 rounded border border-slate-300"
                      >
                        <option value={5}>5 Stars - Excellent</option>
                        <option value={4}>4 Stars - Very Good</option>
                        <option value={3}>3 Stars - Average</option>
                      </select>
                    </div>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write your honest review regarding cleanliness, power backup, host communication..."
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-600"
                      rows={3}
                      required
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                    >
                      Submit Verified Review
                    </button>
                  </form>
                )}

                {/* Reviews List */}
                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{rev.user_name}</span>
                        <div className="flex text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Stay
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right 5 cols: Sticky Dynamic Reservation Panel */}
            <div className="lg:col-span-5 sticky top-24">
              <div className="bg-white rounded-3xl border-2 border-emerald-700/20 p-5 sm:p-6 shadow-xl space-y-5">
                
                {/* Price Display */}
                <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase">Rate</span>
                    <div className="text-2xl font-black text-slate-900">
                      {selectedRoom ? formatPrice(selectedRoom.nightly_price) : formatPrice(property.base_nightly_price)}
                      <span className="text-xs font-normal text-slate-500"> / night</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Instant Booking
                  </span>
                </div>

                {/* Date Selection Inputs */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Check-in</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full text-xs font-bold text-slate-800 bg-transparent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Check-out</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full text-xs font-bold text-slate-800 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                {/* Guests and Rooms Selection */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Guests</label>
                    <select
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(Number(e.target.value))}
                      className="w-full text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                    >
                      <option value={1}>1 Guest</option>
                      <option value={2}>2 Guests</option>
                      <option value={3}>3 Guests</option>
                      <option value={4}>4 Guests</option>
                    </select>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Rooms</label>
                    <select
                      value={roomsCount}
                      onChange={(e) => setRoomsCount(Number(e.target.value))}
                      className="w-full text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                    >
                      <option value={1}>1 Room</option>
                      <option value={2}>2 Rooms</option>
                      <option value={3}>3 Rooms</option>
                    </select>
                  </div>
                </div>

                {/* Price Calculation Breakdown */}
                {quote && (
                  <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                    <div className="flex justify-between">
                      <span>{formatPrice(quote.nightly)} × {quote.nights} night(s)</span>
                      <span>{formatPrice(quote.baseTotal)}</span>
                    </div>

                    {quote.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Stay Discount ({quote.discountPercent}%)</span>
                        <span>-{formatPrice(quote.discountAmount)}</span>
                      </div>
                    )}

                    {quote.cleaning > 0 && (
                      <div className="flex justify-between">
                        <span>Cleaning Fee</span>
                        <span>{formatPrice(quote.cleaning)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Taxes & GST (5%)</span>
                      <span>{formatPrice(quote.taxes)}</span>
                    </div>

                    {quote.security > 0 && (
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Refundable Security Deposit</span>
                        <span>{formatPrice(quote.security)}</span>
                      </div>
                    )}

                    <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-black text-slate-900">
                      <span>Total (PKR)</span>
                      <span className="text-emerald-800">{formatPrice(quote.finalTotal)}</span>
                    </div>
                  </div>
                )}

                {/* Reserve Action Button */}
                <button
                  onClick={handleReserve}
                  className="w-full py-4 rounded-2xl bg-[#047857] hover:bg-[#065F46] text-white font-black text-sm tracking-wide shadow-lg hover:shadow-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>PROCEED TO BOOKING</span>
                </button>

                <p className="text-[11px] text-center text-slate-400">
                  🔒 You won’t be charged yet. Cancellation is flexible up to 24 hrs before check-in.
                </p>

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
