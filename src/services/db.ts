import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  Property, 
  Destination, 
  Package, 
  Amenity, 
  Booking, 
  Review, 
  RoomType,
  SearchFilterParams,
  SupportTicket,
  AuditLog
} from '../types';
import { 
  INITIAL_PROPERTIES, 
  INITIAL_DESTINATIONS, 
  INITIAL_PACKAGES, 
  INITIAL_AMENITIES, 
  INITIAL_ROOM_TYPES, 
  INITIAL_REVIEWS, 
  INITIAL_BOOKINGS,
  INITIAL_PLACE_TYPES 
} from '../lib/mockData';
import { PlaceTypeOption } from '../types';

// Local storage key constants for seamless state persistence
const STORAGE_KEYS = {
  PROPERTIES: 'bap_properties_v1',
  DESTINATIONS: 'bap_destinations_v1',
  PLACE_TYPES: 'bap_place_types_v1',
  PACKAGES: 'bap_packages_v1',
  BOOKINGS: 'bap_bookings_v1',
  REVIEWS: 'bap_reviews_v1',
  WISHLIST: 'bap_wishlist_v1',
  TICKETS: 'bap_tickets_v1',
  AUDIT_LOGS: 'bap_audit_logs_v1',
  USER_ROLE: 'bap_active_role_v1'
};

function getLocalStore<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalStore<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage write error:', e);
  }
}

// Ensure local persistence is initialized
if (!localStorage.getItem(STORAGE_KEYS.PROPERTIES)) {
  setLocalStore(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES);
}
if (!localStorage.getItem(STORAGE_KEYS.DESTINATIONS)) {
  setLocalStore(STORAGE_KEYS.DESTINATIONS, INITIAL_DESTINATIONS);
}
if (!localStorage.getItem(STORAGE_KEYS.PLACE_TYPES)) {
  setLocalStore(STORAGE_KEYS.PLACE_TYPES, INITIAL_PLACE_TYPES);
}
if (!localStorage.getItem(STORAGE_KEYS.PACKAGES)) {
  setLocalStore(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
}
if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
  setLocalStore(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
}
if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
  setLocalStore(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
}

export const dbService = {
  // Check if live Supabase is active
  isLiveSupabase: () => isSupabaseConfigured,

  // 1. PROPERTIES
  async getProperties(params?: SearchFilterParams): Promise<Property[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('properties').select('*').eq('is_published', true);
        if (params?.destination && params.destination !== 'all') {
          query = query.ilike('city', `%${params.destination}%`);
        }
        if (params?.category && params.category !== 'all') {
          query = query.eq('property_type', params.category);
        }
        if (params?.minPrice) {
          query = query.gte('base_nightly_price', params.minPrice);
        }
        if (params?.maxPrice) {
          query = query.lte('base_nightly_price', params.maxPrice);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data as Property[];
        }
      } catch (err) {
        console.warn('Supabase query fallback to local store:', err);
      }
    }

    // Local filter fallback
    let list = getLocalStore<Property[]>(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES);

    if (params) {
      if (params.destination && params.destination !== 'all') {
        const destLower = params.destination.toLowerCase();
        list = list.filter(p => 
          p.city.toLowerCase().includes(destLower) ||
          p.neighborhood.toLowerCase().includes(destLower) ||
          p.address.toLowerCase().includes(destLower)
        );
      }
      if (params.category && params.category !== 'all') {
        list = list.filter(p => p.property_type === params.category);
      }
      if (params.accommodationClass && params.accommodationClass !== 'all') {
        list = list.filter(p => p.accommodation_class === params.accommodationClass);
      }
      if (params.minPrice) {
        list = list.filter(p => p.base_nightly_price >= (params.minPrice || 0));
      }
      if (params.maxPrice) {
        list = list.filter(p => p.base_nightly_price <= (params.maxPrice || Infinity));
      }
      if (params.minRating) {
        list = list.filter(p => p.rating >= (params.minRating || 0));
      }
      if (params.amenities && params.amenities.length > 0) {
        list = list.filter(p => 
          params.amenities!.every(a => p.amenity_slugs.includes(a))
        );
      }
      if (params.packageType && params.packageType !== 'all') {
        list = list.filter(p => 
          p.suitable_for?.some(s => s.toLowerCase().includes(params.packageType!.toLowerCase()))
        );
      }

      // Sorting
      if (params.sortBy === 'price_low') {
        list.sort((a, b) => a.base_nightly_price - b.base_nightly_price);
      } else if (params.sortBy === 'price_high') {
        list.sort((a, b) => b.base_nightly_price - a.base_nightly_price);
      } else if (params.sortBy === 'rating') {
        list.sort((a, b) => b.rating - a.rating);
      } else if (params.sortBy === 'popular') {
        list.sort((a, b) => b.review_count - a.review_count);
      }
    }

    return list;
  },

  async getPropertyById(id: string): Promise<Property | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
        if (!error && data) return data as Property;
      } catch (err) {
        console.warn('Supabase fetch single error:', err);
      }
    }
    const list = getLocalStore<Property[]>(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES);
    return list.find(p => p.id === id) || null;
  },

  async createProperty(property: Omit<Property, 'id' | 'created_at' | 'updated_at' | 'rating' | 'review_count'>): Promise<Property> {
    const newProperty: Property = {
      ...property,
      id: `prop-new-${Date.now()}`,
      rating: 5.0,
      review_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('properties').insert([newProperty]);
      } catch (err) {
        console.error('Supabase property insert error:', err);
      }
    }

    const current = getLocalStore<Property[]>(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES);
    const updated = [newProperty, ...current];
    setLocalStore(STORAGE_KEYS.PROPERTIES, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bap_data_updated', {
        detail: { entity: 'properties', action: 'create', data: newProperty }
      }));
    }
    return newProperty;
  },

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property | null> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('properties').update(updates).eq('id', id);
      } catch (err) {
        console.error('Supabase update property error:', err);
      }
    }
    const current = getLocalStore<Property[]>(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES);
    const index = current.findIndex(p => p.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...updates, updated_at: new Date().toISOString() };
      setLocalStore(STORAGE_KEYS.PROPERTIES, current);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bap_data_updated', {
          detail: { entity: 'properties', action: 'update', id, updates }
        }));
      }
      return current[index];
    }
    return null;
  },

  async deleteProperty(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('properties').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase delete property error:', err);
      }
    }
    const current = getLocalStore<Property[]>(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES);
    const updated = current.filter(p => p.id !== id);
    setLocalStore(STORAGE_KEYS.PROPERTIES, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bap_data_updated', {
        detail: { entity: 'properties', action: 'delete', id }
      }));
    }
    return true;
  },

  // 2. ROOM TYPES
  async getRoomTypes(propertyId: string): Promise<RoomType[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('room_types').select('*').eq('property_id', propertyId);
        if (!error && data && data.length > 0) return data as RoomType[];
      } catch (err) {
        console.warn('Room types supabase fetch error:', err);
      }
    }
    return INITIAL_ROOM_TYPES[propertyId] || [
      {
        id: `room-default-${propertyId}`,
        property_id: propertyId,
        name: 'Standard Guest Accommodation',
        room_class: 'entire_apartment',
        capacity_guests: 2,
        beds_count: 1,
        bathrooms_count: 1,
        square_meters: 35,
        nightly_price: 6500,
        currency: 'PKR',
        stock_quantity: 3,
        amenities: ['fiber-wifi', 'ac', 'hot-water'],
        description: 'Standard comfortable furnished accommodation with attached bathroom.',
        created_at: new Date().toISOString()
      }
    ];
  },

  // 3. DESTINATIONS
  async getDestinations(): Promise<Destination[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('destinations').select('*');
        if (!error && data && data.length > 0) return data as Destination[];
      } catch (err) {
        console.warn('Destinations fetch error:', err);
      }
    }
    return getLocalStore<Destination[]>(STORAGE_KEYS.DESTINATIONS, INITIAL_DESTINATIONS);
  },

  async createDestination(destination: Omit<Destination, 'id' | 'created_at'>): Promise<Destination> {
    const slug = destination.slug || destination.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newDest: Destination = {
      ...destination,
      slug,
      id: `dest-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('destinations').insert([newDest]);
      } catch (err) {
        console.error('Supabase destination insert error:', err);
      }
    }

    const current = getLocalStore<Destination[]>(STORAGE_KEYS.DESTINATIONS, INITIAL_DESTINATIONS);
    const updated = [newDest, ...current];
    setLocalStore(STORAGE_KEYS.DESTINATIONS, updated);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bap_data_updated', {
        detail: { entity: 'destinations', action: 'create', data: newDest }
      }));
    }
    return newDest;
  },

  async updateDestination(id: string, updates: Partial<Destination>): Promise<Destination | null> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('destinations').update(updates).eq('id', id);
      } catch (err) {
        console.error('Supabase destination update error:', err);
      }
    }

    const current = getLocalStore<Destination[]>(STORAGE_KEYS.DESTINATIONS, INITIAL_DESTINATIONS);
    const index = current.findIndex(d => d.id === id || d.slug === id || d.name.toLowerCase() === id.toLowerCase());
    if (index !== -1) {
      current[index] = { ...current[index], ...updates };
      setLocalStore(STORAGE_KEYS.DESTINATIONS, current);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bap_data_updated', {
          detail: { entity: 'destinations', action: 'update', id, updates }
        }));
      }
      return current[index];
    }
    return null;
  },

  async deleteDestination(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('destinations').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase destination delete error:', err);
      }
    }

    const current = getLocalStore<Destination[]>(STORAGE_KEYS.DESTINATIONS, INITIAL_DESTINATIONS);
    const target = id.toLowerCase().trim();
    const updated = current.filter(d => 
      d.id !== id && 
      d.slug !== id && 
      d.name.toLowerCase().trim() !== target &&
      d.id.toLowerCase() !== target &&
      d.slug.toLowerCase() !== target
    );
    setLocalStore(STORAGE_KEYS.DESTINATIONS, updated);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bap_data_updated', {
        detail: { entity: 'destinations', action: 'delete', id }
      }));
    }
    return true;
  },

  // 4. PACKAGES & AMENITIES
  async getPackages(): Promise<Package[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('packages').select('*').eq('is_active', true);
        if (!error && data && data.length > 0) return data as Package[];
      } catch (err) {
        console.warn('Packages fetch error:', err);
      }
    }
    return getLocalStore<Package[]>(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
  },

  async createPackage(pkg: Omit<Package, 'id' | 'created_at'>): Promise<Package> {
    const newPkg: Package = {
      ...pkg,
      id: `pkg-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('packages').insert([newPkg]);
      } catch (err) {
        console.error('Supabase package insert error:', err);
      }
    }

    const current = getLocalStore<Package[]>(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
    const updated = [newPkg, ...current];
    setLocalStore(STORAGE_KEYS.PACKAGES, updated);
    return newPkg;
  },

  async updatePackage(id: string, updates: Partial<Package>): Promise<Package | null> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('packages').update(updates).eq('id', id);
      } catch (err) {
        console.error('Supabase package update error:', err);
      }
    }

    const current = getLocalStore<Package[]>(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
    const index = current.findIndex(p => p.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...updates };
      setLocalStore(STORAGE_KEYS.PACKAGES, current);
      return current[index];
    }
    return null;
  },

  async deletePackage(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('packages').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase package delete error:', err);
      }
    }

    const current = getLocalStore<Package[]>(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
    const updated = current.filter(p => p.id !== id);
    setLocalStore(STORAGE_KEYS.PACKAGES, updated);
    return true;
  },

  // 5. PLACE TYPES / CATEGORIES (Customizable by Admin & Shown on Front Page)
  async getPlaceTypes(): Promise<PlaceTypeOption[]> {
    return getLocalStore<PlaceTypeOption[]>(STORAGE_KEYS.PLACE_TYPES, INITIAL_PLACE_TYPES);
  },

  async createPlaceType(data: Omit<PlaceTypeOption, 'id' | 'created_at'>): Promise<PlaceTypeOption> {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const newPt: PlaceTypeOption = {
      ...data,
      slug,
      id: `pt-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    const current = getLocalStore<PlaceTypeOption[]>(STORAGE_KEYS.PLACE_TYPES, INITIAL_PLACE_TYPES);
    const updated = [newPt, ...current];
    setLocalStore(STORAGE_KEYS.PLACE_TYPES, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bap_data_updated', {
        detail: { entity: 'place_types', action: 'create', data: newPt }
      }));
    }
    return newPt;
  },

  async updatePlaceType(id: string, updates: Partial<PlaceTypeOption>): Promise<PlaceTypeOption | null> {
    const current = getLocalStore<PlaceTypeOption[]>(STORAGE_KEYS.PLACE_TYPES, INITIAL_PLACE_TYPES);
    const idx = current.findIndex(p => p.id === id || p.slug === id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates };
      setLocalStore(STORAGE_KEYS.PLACE_TYPES, current);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bap_data_updated', {
          detail: { entity: 'place_types', action: 'update', id, updates }
        }));
      }
      return current[idx];
    }
    return null;
  },

  async deletePlaceType(id: string): Promise<boolean> {
    const current = getLocalStore<PlaceTypeOption[]>(STORAGE_KEYS.PLACE_TYPES, INITIAL_PLACE_TYPES);
    const target = id.toLowerCase().trim();
    const updated = current.filter(p => 
      p.id !== id && 
      p.slug !== id && 
      p.name.toLowerCase().trim() !== target &&
      p.id.toLowerCase() !== target &&
      p.slug.toLowerCase() !== target
    );
    setLocalStore(STORAGE_KEYS.PLACE_TYPES, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bap_data_updated', {
        detail: { entity: 'place_types', action: 'delete', id }
      }));
    }
    return true;
  },

  async getAmenities(): Promise<Amenity[]> {
    return INITIAL_AMENITIES;
  },

  // 5. BOOKINGS
  async getBookings(userId?: string, role: string = 'customer'): Promise<Booking[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('bookings').select('*');
        if (role === 'customer' && userId) {
          query = query.eq('user_id', userId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data as Booking[];
      } catch (err) {
        console.warn('Supabase bookings query error:', err);
      }
    }
    const all = getLocalStore<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    if (role === 'admin') return all;
    if (userId) return all.filter(b => b.user_id === userId);
    return all;
  },

  async createBooking(bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<Booking> {
    const newBooking: Booking = {
      ...bookingData,
      id: `book-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('bookings').insert([newBooking]);
      } catch (err) {
        console.error('Supabase booking insert error:', err);
      }
    }

    const current = getLocalStore<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    setLocalStore(STORAGE_KEYS.BOOKINGS, [newBooking, ...current]);

    // Record audit log
    await this.logAudit({
      actor_user_id: newBooking.user_id,
      action: 'CREATE_BOOKING',
      target_table: 'bookings',
      record_id: newBooking.id,
      new_values: { reference: newBooking.booking_reference, total: newBooking.final_total }
    });

    return newBooking;
  },

  async cancelBooking(bookingId: string, reason: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('bookings').update({
          booking_status: 'cancelled',
          cancellation_reason: reason,
          updated_at: new Date().toISOString()
        }).eq('id', bookingId);
      } catch (err) {
        console.error('Supabase cancel booking error:', err);
      }
    }

    const current = getLocalStore<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const index = current.findIndex(b => b.id === bookingId);
    if (index !== -1) {
      current[index].booking_status = 'cancelled';
      current[index].cancellation_reason = reason;
      current[index].updated_at = new Date().toISOString();
      setLocalStore(STORAGE_KEYS.BOOKINGS, current);
      return true;
    }
    return false;
  },

  // 6. REVIEWS
  async getReviews(propertyId: string): Promise<Review[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('reviews').select('*').eq('property_id', propertyId).eq('is_moderated', true);
        if (!error && data && data.length > 0) return data as Review[];
      } catch (err) {
        console.warn('Supabase reviews error:', err);
      }
    }
    const all = getLocalStore<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    return all.filter(r => r.property_id === propertyId);
  },

  async addReview(reviewData: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('reviews').insert([newReview]);
      } catch (err) {
        console.error('Supabase add review error:', err);
      }
    }

    const current = getLocalStore<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    setLocalStore(STORAGE_KEYS.REVIEWS, [newReview, ...current]);
    return newReview;
  },

  // 7. WISHLIST
  getWishlist(): string[] {
    return getLocalStore<string[]>(STORAGE_KEYS.WISHLIST, ['prop-isb-1']);
  },

  toggleWishlist(propertyId: string): string[] {
    const list = this.getWishlist();
    const next = list.includes(propertyId) ? list.filter(id => id !== propertyId) : [...list, propertyId];
    setLocalStore(STORAGE_KEYS.WISHLIST, next);
    return next;
  },

  // 8. AUDIT LOGS
  async logAudit(log: Omit<AuditLog, 'id' | 'created_at'>): Promise<void> {
    const newLog: AuditLog = {
      ...log,
      id: `audit-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    const current = getLocalStore<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    setLocalStore(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...current.slice(0, 99)]);
  },

  getAuditLogs(): AuditLog[] {
    return getLocalStore<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  },

  // 9. ADMIN METRICS
  async getAdminStats() {
    const properties = await this.getProperties();
    const bookings = await this.getBookings(undefined, 'admin');
    const totalGBV = bookings.reduce((sum, b) => sum + (b.booking_status !== 'cancelled' ? b.final_total : 0), 0);
    const platformCommission = Math.round(totalGBV * 0.10); // 10% commission

    return {
      totalProperties: properties.length,
      verifiedProperties: properties.filter(p => p.is_verified_listing).length,
      totalBookings: bookings.length,
      confirmedBookings: bookings.filter(b => b.booking_status === 'confirmed').length,
      totalGBV,
      platformCommission,
      activeHosts: 8,
      registeredCustomers: 450,
      destinationsCount: INITIAL_DESTINATIONS.length
    };
  }
};
