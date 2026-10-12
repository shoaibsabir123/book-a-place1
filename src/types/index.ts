/**
 * Book a Place - Domain Types & Database Schema
 * Matching normalized PostgreSQL Supabase Schema (21 tables)
 */

export type UserRoleType = 'customer' | 'host' | 'admin';

export interface Profile {
  id: string; // references auth.users
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  cnic_or_passport?: string;
  is_verified: boolean;
  city?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: UserRoleType;
  created_at: string;
}

export interface HostProfile {
  id: string;
  user_id: string;
  business_name?: string;
  cnic_verified: boolean;
  bank_name?: string;
  bank_account_title?: string;
  iban?: string;
  payout_method: 'bank_transfer' | 'easypaisa' | 'jazzcash';
  total_listings: number;
  average_rating: number;
  response_time_hours: number;
  about?: string;
  created_at: string;
}

export type PropertyCategory = string;

export interface PlaceTypeOption {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon_name?: string;
  badge_text?: string;
  is_featured_on_front: boolean;
  created_at: string;
}

export type AccommodationClass = 'budget' | 'standard' | 'premium' | 'luxury';

export interface Property {
  id: string;
  host_id: string;
  title: string;
  description: string;
  property_type: PropertyCategory;
  accommodation_class: AccommodationClass;
  address: string;
  city: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  postal_code?: string;
  base_nightly_price: number;
  currency: 'PKR' | 'USD' | 'EUR' | 'GBP' | 'AED';
  cleaning_fee: number;
  security_deposit: number;
  tax_rate_percent: number;
  weekly_discount_percent: number;
  monthly_discount_percent: number;
  check_in_time: string;
  check_out_time: string;
  house_rules?: string[];
  cancellation_policy: 'flexible' | 'moderate' | 'strict';
  is_published: boolean;
  is_verified_listing: boolean;
  featured: boolean;
  suitable_for: ('students' | 'professionals' | 'families' | 'backpackers' | 'groups' | 'travelers')[];
  rating: number;
  review_count: number;
  images: string[];
  amenity_slugs: string[];
  created_at: string;
  updated_at: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  caption?: string;
  display_order: number;
  is_cover: boolean;
  created_at: string;
}

export interface RoomType {
  id: string;
  property_id: string;
  name: string;
  room_class: 'shared_room' | 'private_room' | 'studio' | 'entire_apartment' | 'suite' | 'dormitory';
  capacity_guests: number;
  beds_count: number;
  bathrooms_count: number;
  square_meters: number;
  nightly_price: number;
  currency: string;
  stock_quantity: number;
  amenities: string[];
  description?: string;
  created_at: string;
}

export interface Availability {
  id: string;
  room_type_id: string;
  date: string; // YYYY-MM-DD
  available_units: number;
  is_blocked: boolean;
  price_override?: number;
  created_at: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'checked_in';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'partially_refunded';

export interface Booking {
  id: string;
  booking_reference: string;
  user_id: string;
  property_id: string;
  room_type_id: string;
  check_in_date: string;
  check_out_date: string;
  nights_count: number;
  adults_count: number;
  children_count: number;
  total_guests: number;
  rooms_count: number;
  base_rate: number;
  cleaning_fee: number;
  taxes_amount: number;
  security_deposit: number;
  discount_amount: number;
  final_total: number;
  currency: string;
  booking_status: BookingStatus;
  payment_status: PaymentStatus;
  cancellation_reason?: string;
  special_requests?: string;
  hold_expires_at?: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  created_at: string;
  updated_at: string;
}

export interface BookingGuest {
  id: string;
  booking_id: string;
  guest_name: string;
  guest_email?: string;
  guest_phone?: string;
  is_primary: boolean;
  cnic_or_passport?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  user_id: string;
  provider: 'easypaisa' | 'jazzcash' | 'stripe' | 'bank_transfer' | 'cash_on_arrival';
  provider_transaction_id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  payment_method_details?: Record<string, any>;
  created_at: string;
}

export interface Refund {
  id: string;
  payment_id: string;
  booking_id: string;
  amount: number;
  currency: string;
  reason: string;
  status: 'pending' | 'processed' | 'rejected';
  initiated_by: string;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id?: string;
  property_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number; // 1-5
  rating_cleanliness: number;
  rating_communication: number;
  rating_location: number;
  rating_value: number;
  comment: string;
  host_response?: string;
  is_verified_stay: boolean;
  is_moderated: boolean;
  created_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  province: string;
  description: string;
  image_url: string;
  property_count: number;
  latitude: number;
  longitude: number;
  popular_landmarks: string[];
  created_at: string;
}

export interface Amenity {
  id: string;
  name: string;
  slug: string;
  category: 'essentials' | 'climate' | 'power_backup' | 'kitchen' | 'safety' | 'location' | 'work';
  icon_name: string;
  description: string;
}

export interface Package {
  id: string;
  title: string;
  slug: string;
  package_type: 'student' | 'professional' | 'family' | 'budget' | 'long_stay' | 'luxury';
  description: string;
  banner_image: string;
  target_audience: string;
  minimum_stay_days: number;
  discount_percentage: number;
  inclusions: string[];
  is_active: boolean;
  created_at: string;
}

export interface Promotion {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_booking_amount: number;
  currency: string;
  max_discount?: number;
  valid_from: string;
  valid_to: string;
  usage_limit: number;
  times_used: number;
  is_active: boolean;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  booking_id?: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  admin_notes?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: 'booking_confirmed' | 'payment_received' | 'cancellation' | 'system' | 'reminder';
  is_read: boolean;
  link_url?: string;
  created_at: string;
}

export interface IntegrationJob {
  id: string;
  job_type: 'google_sheets_sync' | 'google_docs_itinerary' | 'gmail_confirmation' | 'payment_webhook';
  payload: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_log?: string;
  attempts_count: number;
  next_retry_at?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_user_id: string;
  action: string;
  target_table: string;
  record_id: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

// Search and Filter parameters
export interface SearchFilterParams {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  rooms?: number;
  category?: PropertyCategory | 'all';
  accommodationClass?: AccommodationClass | 'all';
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  amenities?: string[];
  sortBy?: 'recommended' | 'price_low' | 'price_high' | 'rating' | 'popular';
  packageType?: string;
  suitableFor?: string;
}

// Pricing Quote Calculation
export interface BookingQuote {
  nights: number;
  baseRatePerNight: number;
  baseTotal: number;
  cleaningFee: number;
  securityDeposit: number;
  taxRatePercent: number;
  taxAmount: number;
  discountPercent: number;
  discountAmount: number;
  promoDiscount: number;
  finalTotal: number;
  currency: string;
}
