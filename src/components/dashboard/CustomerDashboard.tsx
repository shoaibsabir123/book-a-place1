import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  Heart, 
  CheckCircle2, 
  Clock, 
  FileText, 
  XCircle, 
  Download, 
  ShieldCheck,
  Building2,
  MapPin
} from 'lucide-react';
import { Booking, Property } from '../../types';
import { dbService } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

interface CustomerDashboardProps {
  onExploreStays: () => void;
  onSelectProperty: (property: Property) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onExploreStays,
  onSelectProperty
}) => {
  const { user, formatPrice } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [wishlistProperties, setWishlistProperties] = useState<Property[]>([]);
  const [activeTab, setActiveTab] = useState<'bookings' | 'wishlist' | 'profile'>('bookings');
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('Change of travel plans');

  useEffect(() => {
    async function loadData() {
      const bList = await dbService.getBookings(user?.id);
      setBookings(bList);

      const wIds = dbService.getWishlist();
      const allProps = await dbService.getProperties();
      setWishlistProperties(allProps.filter(p => wIds.includes(p.id)));
    }
    loadData();
  }, [user]);

  const handleCancelConfirm = async () => {
    if (!cancelModalBooking) return;
    await dbService.cancelBooking(cancelModalBooking.id, cancelReason);
    const updated = await dbService.getBookings(user?.id);
    setBookings(updated);
    setCancelModalBooking(null);
  };

  const handleDownloadItinerary = async (b: Booking) => {
    try {
      const res = await fetch('/api/workspace/generate-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking: b })
      });
      const data = await res.json();
      const blob = new Blob([data.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Voucher_${b.booking_reference}.txt`;
      a.click();
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0B192C] to-[#047857] text-white flex items-center justify-center text-2xl font-black shadow-md">
            {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">{user?.full_name}</h2>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Guest
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{user?.email} • {user?.phone || '+92 300 1234567'}</p>
            <p className="text-xs text-slate-400 font-mono mt-0.5">CNIC: {user?.cnic_or_passport || '37405-1234567-1'}</p>
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'bookings' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Stays ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'wishlist' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Wishlist ({wishlistProperties.length})
          </button>
        </div>
      </div>

      {/* TAB CONTENT: Bookings */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-lg text-slate-900">Your Reservations</h3>

          {bookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-bold text-base text-slate-800">No active bookings yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore student hostels, serviced suites, or scenic mountain chalets in Pakistan.
              </p>
              <button
                onClick={onExploreStays}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs"
              >
                Browse Stays
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {bookings.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {b.booking_reference}
                      </span>
                      <span className={`text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        b.booking_status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                        b.booking_status === 'cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {b.booking_status}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 pt-1">
                      Reservation for {b.guest_name}
                    </h4>

                    <p className="text-xs text-slate-500">
                      📅 {b.check_in_date} to {b.check_out_date} ({b.nights_count} nights) • 👥 {b.total_guests} Guest(s)
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Total Paid</span>
                      <span className="text-base font-black text-slate-900">{formatPrice(b.final_total)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadItinerary(b)}
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        title="Download Google Docs Itinerary"
                      >
                        <Download className="w-4 h-4 text-emerald-700" />
                        <span className="hidden sm:inline">Voucher</span>
                      </button>

                      {b.booking_status === 'confirmed' && (
                        <button
                          onClick={() => setCancelModalBooking(b)}
                          className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-lg text-slate-900">Saved Wishlist ({wishlistProperties.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlistProperties.map((p) => (
              <div 
                key={p.id}
                onClick={() => onSelectProperty(p)}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md cursor-pointer transition-all group"
              >
                <div className="h-44 relative overflow-hidden bg-slate-100">
                  <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold">
                    {p.city}
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{p.title}</h4>
                  <p className="text-xs text-slate-500">{p.neighborhood}</p>
                  <p className="text-sm font-black text-slate-900 pt-2">{formatPrice(p.base_nightly_price)} <span className="text-xs font-normal text-slate-400">/ night</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 border border-slate-200 shadow-2xl">
            <h4 className="font-bold text-base text-slate-900">Cancel Booking</h4>
            <p className="text-xs text-slate-600">
              Are you sure you want to cancel reservation <strong>{cancelModalBooking.booking_reference}</strong>?
            </p>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Reason for cancellation:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
              >
                <option value="Change of travel plans">Change of travel plans</option>
                <option value="Found alternative accommodation">Found alternative accommodation</option>
                <option value="Flight or transit rescheduling">Flight or transit rescheduling</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelConfirm}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
