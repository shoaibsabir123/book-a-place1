import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Building2, 
  CheckCircle, 
  Lock, 
  FileText, 
  Download, 
  ArrowRight,
  Sparkles,
  Ticket
} from 'lucide-react';
import { Property, RoomType, Booking } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';

interface CheckoutModalProps {
  property: Property;
  roomType: RoomType;
  bookingDetails: {
    checkIn: string;
    checkOut: string;
    guestsCount: number;
    roomsCount: number;
    quote: any;
  };
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  property,
  roomType,
  bookingDetails,
  onClose,
  onBookingSuccess
}) => {
  const { user, formatPrice } = useAuth();
  const [step, setStep] = useState<'details' | 'payment' | 'confirmed'>('details');

  // Guest details form
  const [guestName, setGuestName] = useState(user?.full_name || 'Rizwan Sabir');
  const [guestEmail, setGuestEmail] = useState(user?.email || 'rizwansabirksa1990@gmail.com');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '+92 300 1234567');
  const [cnic, setCnic] = useState(user?.cnic_or_passport || '37405-1234567-1');
  const [specialRequests, setSpecialRequests] = useState('');

  // Promo code
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');

  // Payment method
  const [paymentProvider, setPaymentProvider] = useState<'easypaisa' | 'jazzcash' | 'stripe' | 'bank_transfer'>('easypaisa');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'WELCOMEPK') {
      const disc = Math.round(bookingDetails.quote.baseTotal * 0.10);
      setPromoDiscount(disc);
      setPromoMessage('Promo WELCOMEPK applied! 10% discount on base rate.');
    } else if (code === 'STUDENT15') {
      const disc = Math.round(bookingDetails.quote.baseTotal * 0.15);
      setPromoDiscount(disc);
      setPromoMessage('Student Living 15% discount applied successfully.');
    } else {
      setPromoMessage('Invalid coupon code. Try WELCOMEPK or STUDENT15.');
      setPromoDiscount(0);
    }
  };

  const finalAdjustedTotal = Math.max(0, bookingDetails.quote.finalTotal - promoDiscount);

  const handleProcessPayment = async () => {
    setIsProcessing(true);

    try {
      // 1. Call server payment intent endpoint
      const response = await fetch('/api/payments/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAdjustedTotal,
          currency: 'PKR',
          provider: paymentProvider,
          bookingReference: `BAP-PK-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
        })
      });

      const paymentResult = await response.json();
      const ref = paymentResult.bookingReference || `BAP-PK-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      // 2. Persist booking record into database service (Supabase / local)
      const newBooking = await dbService.createBooking({
        booking_reference: ref,
        user_id: user?.id || 'guest-user',
        property_id: property.id,
        room_type_id: roomType.id,
        check_in_date: bookingDetails.checkIn,
        check_out_date: bookingDetails.checkOut,
        nights_count: bookingDetails.quote.nights,
        adults_count: bookingDetails.guestsCount,
        children_count: 0,
        total_guests: bookingDetails.guestsCount,
        rooms_count: bookingDetails.roomsCount,
        base_rate: bookingDetails.quote.baseTotal,
        cleaning_fee: bookingDetails.quote.cleaning,
        taxes_amount: bookingDetails.quote.taxes,
        security_deposit: bookingDetails.quote.security,
        discount_amount: bookingDetails.quote.discountAmount + promoDiscount,
        final_total: finalAdjustedTotal,
        currency: 'PKR',
        booking_status: 'confirmed',
        payment_status: 'paid',
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
        special_requests: specialRequests
      });

      setConfirmedBooking(newBooking);
      setStep('confirmed');
      onBookingSuccess(newBooking);
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadDoc = async () => {
    if (!confirmedBooking) return;
    try {
      const res = await fetch('/api/workspace/generate-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking: {
            ...confirmedBooking,
            property_title: property.title,
            address: property.address,
            city: property.city
          }
        })
      });
      const data = await res.json();
      const blob = new Blob([data.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reservation_${confirmedBooking.booking_reference}.txt`;
      a.click();
    } catch (err) {
      console.error('Download itinerary error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 relative my-4">
        
        {/* Header */}
        <div className="bg-[#0B192C] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-sm sm:text-base">
              {step === 'confirmed' ? 'Reservation Confirmed!' : 'Secure Booking Checkout'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          
          {/* STEP 1: Guest Details */}
          {step === 'details' && (
            <div className="space-y-5">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-sm text-slate-900">{property.title}</h4>
                <p className="text-xs text-slate-500">{property.address}, {property.city}</p>
                <div className="mt-2 flex items-center gap-4 text-xs font-semibold text-emerald-800">
                  <span>📅 {bookingDetails.checkIn} to {bookingDetails.checkOut} ({bookingDetails.quote.nights} nights)</span>
                  <span>👥 {bookingDetails.guestsCount} Guest(s)</span>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Guest Information
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number (Pakistani)</label>
                    <input
                      type="text"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Government CNIC or Passport</label>
                    <input
                      type="text"
                      value={cnic}
                      onChange={(e) => setCnic(e.target.value)}
                      placeholder="37405-1234567-1"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Special Requests</label>
                  <input
                    type="text"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Late check-in, quiet room, extra study table..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Promo code box */}
              <div className="pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block mb-1">Have a Promo Code?</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="WELCOMEPK or STUDENT15"
                    className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 font-mono uppercase"
                  />
                  <button
                    type="button"
                    onClick={applyPromo}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900"
                  >
                    Apply
                  </button>
                </div>
                {promoMessage && (
                  <p className={`text-xs mt-1.5 font-medium ${promoDiscount > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {promoMessage}
                  </p>
                )}
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-slate-100">
                <div>
                  <span className="text-xs text-slate-400 block">Total Amount</span>
                  <span className="text-lg font-black text-slate-900">{formatPrice(finalAdjustedTotal)}</span>
                </div>
                <button
                  onClick={() => setStep('payment')}
                  className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Payment Provider Selection */}
          {step === 'payment' && (
            <div className="space-y-5">
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-1">Select Payment Method</h4>
                <p className="text-xs text-slate-500">Fast, local Pakistani payment gateways with instant receipt.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  onClick={() => setPaymentProvider('easypaisa')}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                    paymentProvider === 'easypaisa' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <Smartphone className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-xs text-slate-900">Easypaisa Mobile Wallet</p>
                    <p className="text-[11px] text-slate-500">Instant OTP payment</p>
                  </div>
                </label>

                <label
                  onClick={() => setPaymentProvider('jazzcash')}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                    paymentProvider === 'jazzcash' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <Smartphone className="w-6 h-6 text-amber-600 shrink-0" />
                  <div>
                    <p className="font-bold text-xs text-slate-900">JazzCash Account</p>
                    <p className="text-[11px] text-slate-500">Pay via JazzCash PIN</p>
                  </div>
                </label>

                <label
                  onClick={() => setPaymentProvider('stripe')}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                    paymentProvider === 'stripe' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-blue-600 shrink-0" />
                  <div>
                    <p className="font-bold text-xs text-slate-900">Debit / Credit Card</p>
                    <p className="text-[11px] text-slate-500">Visa, Mastercard, PayPak</p>
                  </div>
                </label>

                <label
                  onClick={() => setPaymentProvider('bank_transfer')}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                    paymentProvider === 'bank_transfer' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <Building2 className="w-6 h-6 text-purple-600 shrink-0" />
                  <div>
                    <p className="font-bold text-xs text-slate-900">1Link Direct Transfer</p>
                    <p className="text-[11px] text-slate-500">HBL, Meezan, Alfalah, UBL</p>
                  </div>
                </label>
              </div>

              {/* Payment details summary */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Guest Name:</span>
                  <span className="font-bold text-slate-900">{guestName}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Contact Phone:</span>
                  <span className="font-bold text-slate-900 font-mono">{guestPhone}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>CNIC / Passport:</span>
                  <span className="font-bold text-slate-900 font-mono">{cnic}</span>
                </div>
                <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-2 font-bold text-sm">
                  <span>Amount to Pay (PKR):</span>
                  <span className="text-emerald-800 font-black">{formatPrice(finalAdjustedTotal)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleProcessPayment}
                  disabled={isProcessing}
                  className="flex-1 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isProcessing ? 'Confirming with Payment Gateway...' : `Pay & Confirm ${formatPrice(finalAdjustedTotal)}`}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Confirmed Voucher Screen */}
          {step === 'confirmed' && confirmedBooking && (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-xl font-black text-slate-900">Your Booking is Confirmed!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  A confirmation SMS & email have been queued via Google Workspace integration.
                </p>
                <div className="mt-3 inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-mono font-bold border border-slate-200">
                  Reference: {confirmedBooking.booking_reference}
                </div>
              </div>

              {/* Printable Voucher Card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left text-xs space-y-2.5">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Property:</span>
                  <span className="font-bold text-slate-900">{property.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Room Type:</span>
                  <span className="font-bold text-slate-900">{roomType.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dates:</span>
                  <span className="font-bold text-slate-900">{confirmedBooking.check_in_date} to {confirmedBooking.check_out_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Primary Guest:</span>
                  <span className="font-bold text-slate-900">{confirmedBooking.guest_name} ({confirmedBooking.guest_phone})</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
                  <span className="text-slate-500">Paid Amount:</span>
                  <span className="text-emerald-700 font-extrabold">{formatPrice(confirmedBooking.final_total)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDownloadDoc}
                  className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Download Google Docs Itinerary</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Done & Back to Browse
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
