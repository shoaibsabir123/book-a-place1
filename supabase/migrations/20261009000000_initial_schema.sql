-- ==============================================================================
-- BOOK A PLACE - POSTGRESQL SCHEMA FOR SUPABASE
-- Normalized database schema with 21 tables, constraints, RLS policies & seed data
-- Default display currency: PKR (Pakistani Rupee)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Customers, Hosts, Admins)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    cnic_or_passport TEXT,
    city TEXT DEFAULT 'Islamabad',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER ROLES (Role-Based Access Control)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('customer', 'host', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 3. HOST PROFILES (Verification, Bank/Payout details)
CREATE TABLE IF NOT EXISTS public.host_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    business_name TEXT,
    cnic_verified BOOLEAN DEFAULT FALSE,
    bank_name TEXT,
    bank_account_title TEXT,
    iban TEXT,
    payout_method TEXT DEFAULT 'bank_transfer' CHECK (payout_method IN ('bank_transfer', 'easypaisa', 'jazzcash')),
    total_listings INT DEFAULT 0,
    average_rating NUMERIC(3,2) DEFAULT 0.00,
    response_time_hours INT DEFAULT 2,
    about TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DESTINATIONS (Pakistani Cities & Regions)
CREATE TABLE IF NOT EXISTS public.destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    province TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    property_count INT DEFAULT 0,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    popular_landmarks JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AMENITIES (Reusable Amenities)
CREATE TABLE IF NOT EXISTS public.amenities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('essentials', 'climate', 'power_backup', 'kitchen', 'safety', 'location', 'work')),
    icon_name TEXT NOT NULL,
    description TEXT
);

-- 6. PROPERTIES (Listings in Pakistan)
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    property_type TEXT NOT NULL CHECK (property_type IN ('apartment', 'guest_house', 'hotel', 'hostel', 'private_room', 'shared_room', 'resort', 'serviced_residence', 'villa')),
    accommodation_class TEXT NOT NULL DEFAULT 'standard' CHECK (accommodation_class IN ('budget', 'standard', 'premium', 'luxury')),
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    postal_code TEXT,
    base_nightly_price NUMERIC(12, 2) NOT NULL CHECK (base_nightly_price > 0),
    currency TEXT NOT NULL DEFAULT 'PKR',
    cleaning_fee NUMERIC(10, 2) DEFAULT 0.00,
    security_deposit NUMERIC(10, 2) DEFAULT 0.00,
    tax_rate_percent NUMERIC(5, 2) DEFAULT 5.00,
    weekly_discount_percent NUMERIC(5, 2) DEFAULT 10.00,
    monthly_discount_percent NUMERIC(5, 2) DEFAULT 25.00,
    check_in_time TEXT DEFAULT '14:00',
    check_out_time TEXT DEFAULT '11:00',
    house_rules JSONB DEFAULT '[]'::JSONB,
    cancellation_policy TEXT DEFAULT 'flexible' CHECK (cancellation_policy IN ('flexible', 'moderate', 'strict')),
    is_published BOOLEAN DEFAULT TRUE,
    is_verified_listing BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    suitable_for JSONB DEFAULT '["travelers"]'::JSONB,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    review_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PROPERTY IMAGES
CREATE TABLE IF NOT EXISTS public.property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    display_order INT DEFAULT 0,
    is_cover BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ROOM TYPES (Room categories, capacity, and rates)
CREATE TABLE IF NOT EXISTS public.room_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    room_class TEXT NOT NULL CHECK (room_class IN ('shared_room', 'private_room', 'studio', 'entire_apartment', 'suite', 'dormitory')),
    capacity_guests INT NOT NULL DEFAULT 1 CHECK (capacity_guests > 0),
    beds_count INT NOT NULL DEFAULT 1,
    bathrooms_count INT NOT NULL DEFAULT 1,
    square_meters INT DEFAULT 25,
    nightly_price NUMERIC(12, 2) NOT NULL CHECK (nightly_price > 0),
    currency TEXT NOT NULL DEFAULT 'PKR',
    stock_quantity INT NOT NULL DEFAULT 1 CHECK (stock_quantity > 0),
    amenities JSONB DEFAULT '[]'::JSONB,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. AVAILABILITY (Date-level inventory and blocks)
CREATE TABLE IF NOT EXISTS public.availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_type_id UUID NOT NULL REFERENCES public.room_types(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    available_units INT NOT NULL DEFAULT 1 CHECK (available_units >= 0),
    is_blocked BOOLEAN DEFAULT FALSE,
    price_override NUMERIC(12, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_type_id, date)
);

-- 10. PACKAGES (Student living, professional stays, luxury)
CREATE TABLE IF NOT EXISTS public.packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    package_type TEXT NOT NULL CHECK (package_type IN ('student', 'professional', 'family', 'budget', 'long_stay', 'luxury')),
    description TEXT NOT NULL,
    banner_image TEXT,
    target_audience TEXT,
    minimum_stay_days INT DEFAULT 30,
    discount_percentage NUMERIC(5, 2) DEFAULT 20.00,
    inclusions JSONB DEFAULT '[]'::JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PROMOTIONS (Discount codes & eligibility)
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    min_booking_amount NUMERIC(12, 2) DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'PKR',
    max_discount NUMERIC(10, 2),
    valid_from DATE DEFAULT CURRENT_DATE,
    valid_to DATE DEFAULT (CURRENT_DATE + INTERVAL '1 year'),
    usage_limit INT DEFAULT 500,
    times_used INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- 12. BOOKINGS
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE RESTRICT,
    room_type_id UUID NOT NULL REFERENCES public.room_types(id) ON DELETE RESTRICT,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    nights_count INT NOT NULL CHECK (nights_count > 0),
    adults_count INT NOT NULL DEFAULT 1 CHECK (adults_count > 0),
    children_count INT NOT NULL DEFAULT 0 CHECK (children_count >= 0),
    total_guests INT NOT NULL CHECK (total_guests > 0),
    rooms_count INT NOT NULL DEFAULT 1 CHECK (rooms_count > 0),
    base_rate NUMERIC(12, 2) NOT NULL,
    cleaning_fee NUMERIC(10, 2) DEFAULT 0.00,
    taxes_amount NUMERIC(10, 2) DEFAULT 0.00,
    security_deposit NUMERIC(10, 2) DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    final_total NUMERIC(12, 2) NOT NULL CHECK (final_total >= 0),
    currency TEXT NOT NULL DEFAULT 'PKR',
    booking_status TEXT NOT NULL DEFAULT 'confirmed' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled', 'completed', 'checked_in')),
    payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'partially_refunded')),
    cancellation_reason TEXT,
    special_requests TEXT,
    hold_expires_at TIMESTAMPTZ,
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_booking_dates CHECK (check_out_date > check_in_date)
);

-- 13. BOOKING GUESTS (Detailed guest records)
CREATE TABLE IF NOT EXISTS public.booking_guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    guest_name TEXT NOT NULL,
    guest_email TEXT,
    guest_phone TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    cnic_or_passport TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. PAYMENTS (Transactions & payment providers)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    provider TEXT NOT NULL CHECK (provider IN ('easypaisa', 'jazzcash', 'stripe', 'bank_transfer', 'cash_on_arrival')),
    provider_transaction_id TEXT NOT NULL UNIQUE,
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'PKR',
    status TEXT NOT NULL DEFAULT 'succeeded' CHECK (status IN ('succeeded', 'pending', 'failed', 'refunded')),
    payment_method_details JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. REFUNDS
CREATE TABLE IF NOT EXISTS public.refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE RESTRICT,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'PKR',
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'rejected')),
    initiated_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. REVIEWS (Verified stays only)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    rating_cleanliness INT DEFAULT 5 CHECK (rating_cleanliness BETWEEN 1 AND 5),
    rating_communication INT DEFAULT 5 CHECK (rating_communication BETWEEN 1 AND 5),
    rating_location INT DEFAULT 5 CHECK (rating_location BETWEEN 1 AND 5),
    rating_value INT DEFAULT 5 CHECK (rating_value BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    host_response TEXT,
    is_verified_stay BOOLEAN DEFAULT TRUE,
    is_moderated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. WISHLISTS
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- 18. SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('booking_confirmed', 'payment_received', 'cancellation', 'system', 'reminder')),
    is_read BOOLEAN DEFAULT FALSE,
    link_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. INTEGRATION JOBS (Google Sheets, Docs, Gmail synchronization)
CREATE TABLE IF NOT EXISTS public.integration_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type TEXT NOT NULL CHECK (job_type IN ('google_sheets_sync', 'google_docs_itinerary', 'gmail_confirmation', 'payment_webhook')),
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_log TEXT,
    attempts_count INT DEFAULT 0,
    next_retry_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. AUDIT LOGS (Security and administrative tracking)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_table TEXT NOT NULL,
    record_id TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR PRODUCTION QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_host ON public.properties(host_id);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(base_nightly_price);
CREATE INDEX IF NOT EXISTS idx_room_types_property ON public.room_types(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_property ON public.bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_reviews_property ON public.reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_availability_room_date ON public.availability(room_type_id, date);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions for RBAC
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_host()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND (role = 'host' OR role = 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Public read, self-edit, admin all
CREATE POLICY "Profiles readable by anyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Properties: Public read published, hosts manage own, admin all
CREATE POLICY "Public read published properties" ON public.properties FOR SELECT USING (is_published = true OR auth.uid() = host_id OR public.is_admin());
CREATE POLICY "Hosts insert properties" ON public.properties FOR INSERT WITH CHECK (auth.uid() = host_id OR public.is_admin());
CREATE POLICY "Hosts update own properties" ON public.properties FOR UPDATE USING (auth.uid() = host_id OR public.is_admin());
CREATE POLICY "Hosts delete own properties" ON public.properties FOR DELETE USING (auth.uid() = host_id OR public.is_admin());

-- Room types & Property Images: Public read, host manage
CREATE POLICY "Public read room types" ON public.room_types FOR SELECT USING (true);
CREATE POLICY "Host manage room types" ON public.room_types FOR ALL USING (
    EXISTS (SELECT 1 FROM public.properties WHERE id = room_types.property_id AND (host_id = auth.uid() OR public.is_admin()))
);

CREATE POLICY "Public read property images" ON public.property_images FOR SELECT USING (true);
CREATE POLICY "Host manage property images" ON public.property_images FOR ALL USING (
    EXISTS (SELECT 1 FROM public.properties WHERE id = property_images.property_id AND (host_id = auth.uid() OR public.is_admin()))
);

-- Bookings: Customers read own, hosts read for their properties, admins all
CREATE POLICY "Customers and Hosts view bookings" ON public.bookings FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.properties WHERE id = bookings.property_id AND host_id = auth.uid()) OR
    public.is_admin()
);
CREATE POLICY "Authenticated users create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users and Hosts update bookings" ON public.bookings FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.properties WHERE id = bookings.property_id AND host_id = auth.uid()) OR
    public.is_admin()
);

-- Reviews: Public read moderated, customers create if completed stay
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (is_moderated = true OR auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Customers submit reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Wishlists: Own user only
CREATE POLICY "Users manage wishlist" ON public.wishlists FOR ALL USING (auth.uid() = user_id);

-- Destinations, Amenities, Packages: Public read, admin manage
CREATE POLICY "Public read destinations" ON public.destinations FOR SELECT USING (true);
CREATE POLICY "Public read amenities" ON public.amenities FOR SELECT USING (true);
CREATE POLICY "Public read packages" ON public.packages FOR SELECT USING (true);
CREATE POLICY "Admin manage packages" ON public.packages FOR ALL USING (public.is_admin());

-- Audit logs & Integration jobs: Admin only
CREATE POLICY "Admin access audit logs" ON public.audit_logs FOR ALL USING (public.is_admin());
CREATE POLICY "Admin access integration jobs" ON public.integration_jobs FOR ALL USING (public.is_admin());
