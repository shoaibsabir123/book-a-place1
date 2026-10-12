import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  PlusCircle, 
  Calendar, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  MapPin, 
  X,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Property, Booking, Destination } from '../../types';
import { dbService } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

export const HostDashboard: React.FC = () => {
  const { user, formatPrice } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);

  // New property form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('Islamabad');
  const [neighborhood, setNeighborhood] = useState('Sector F-7');
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState<any>('apartment');
  const [accommodationClass, setAccommodationClass] = useState<any>('standard');
  const [basePrice, setBasePrice] = useState(8500);
  const [cleaningFee, setCleaningFee] = useState(1500);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80');

  useEffect(() => {
    async function loadData() {
      const allProps = await dbService.getProperties();
      setProperties(allProps);
      const bList = await dbService.getBookings(undefined, 'host');
      setBookings(bList);
      const dList = await dbService.getDestinations();
      setDestinations(dList);
    }
    loadData();
  }, []);

  const totalEarnings = bookings.reduce((sum, b) => sum + (b.booking_status !== 'cancelled' ? b.final_total : 0), 0);

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !address.trim()) return;

    const created = await dbService.createProperty({
      host_id: user?.id || 'host-user-1',
      title,
      description,
      property_type: propertyType,
      accommodation_class: accommodationClass,
      address,
      city,
      neighborhood,
      latitude: city === 'Islamabad' ? 33.72 : city === 'Lahore' ? 31.52 : 24.86,
      longitude: city === 'Islamabad' ? 73.05 : city === 'Lahore' ? 74.35 : 67.00,
      base_nightly_price: Number(basePrice),
      currency: 'PKR',
      cleaning_fee: Number(cleaningFee),
      security_deposit: 5000,
      tax_rate_percent: 5,
      weekly_discount_percent: 10,
      monthly_discount_percent: 25,
      check_in_time: '14:00',
      check_out_time: '11:00',
      cancellation_policy: 'flexible',
      is_published: true,
      is_verified_listing: false,
      featured: false,
      suitable_for: ['professionals', 'travelers'],
      images: [imageUrl],
      amenity_slugs: ['fiber-wifi', 'generator-backup', 'hot-water', 'ac']
    });

    setProperties([created, ...properties]);
    setShowAddModal(false);
    setTitle('');
    setAddress('');
    setDescription('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Host Portal Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900">Host Management Portal</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Pakistan Partner
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your accommodations, room inventory, reservations, and payouts in PKR.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Property Listing</span>
        </button>
      </div>

      {/* Host Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Host Revenue</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">
            {formatPrice(totalEarnings)}
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">100% direct bank payout</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Listings</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">
            {properties.length}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Across Pakistani cities</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Reservations</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">
            {bookings.length}
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">Avg 92% positive rating</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">CNIC Verification</span>
          <span className="text-base sm:text-lg font-bold text-emerald-700 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Verified Host
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">NADRA Verified</span>
        </div>
      </div>

      {/* Property Listings Management */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-lg text-slate-900">Your Properties</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all">
              <div className="h-44 relative bg-slate-100">
                <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold">
                  {p.city}
                </div>
                {p.is_verified_listing && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 text-[10px] font-bold">
                    Verified Listing
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{p.title}</h4>
                <p className="text-xs text-slate-500">{p.neighborhood}</p>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="text-sm font-black text-slate-900">{formatPrice(p.base_nightly_price)} / night</span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Published</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-4 border border-slate-200 shadow-2xl my-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-base text-slate-900">List a New Property in Pakistan</h4>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProperty} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Property Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g., Margalla Crest Executive Residence"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    {destinations.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Neighborhood / Sector</label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="E.g. Gulberg III, Sector F-7, Clifton"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street 14, Plot 32-A"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="apartment">Apartment</option>
                    <option value="serviced_residence">Serviced Suite</option>
                    <option value="hostel">Hostel (Student)</option>
                    <option value="guest_house">Guest House</option>
                    <option value="villa">Mountain Villa</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nightly Price (PKR)</label>
                  <input
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cleaning Fee (PKR)</label>
                  <input
                    type="number"
                    value={cleaningFee}
                    onChange={(e) => setCleaningFee(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Cover Photo URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description & House Rules</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Detail power backup, Wi-Fi speed, distance to universities or markets..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                >
                  Publish Property Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
