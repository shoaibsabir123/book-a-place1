import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSearch } from './components/home/HeroSearch';
import { PropertyCard } from './components/properties/PropertyCard';
import { FilterSidebar } from './components/properties/FilterSidebar';
import { InteractiveMap } from './components/properties/InteractiveMap';
import { PropertyDetailView } from './components/properties/PropertyDetailView';
import { CheckoutModal } from './components/booking/CheckoutModal';
import { AiStayFinderModal } from './components/ai/AiStayFinderModal';
import { CustomerDashboard } from './components/dashboard/CustomerDashboard';
import { HostDashboard } from './components/dashboard/HostDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { PackagesView } from './components/packages/PackagesView';
import { DestinationsView } from './components/destinations/DestinationsView';
import { StaticPage } from './components/static/StaticPages';
import { dbService } from './services/db';
import { 
  Property, 
  Destination, 
  Amenity, 
  Package, 
  SearchFilterParams, 
  RoomType, 
  Booking,
  PlaceTypeOption 
} from './types';
import { 
  Map, 
  List, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Star, 
  ArrowRight,
  GraduationCap,
  Briefcase,
  Building2,
  Users,
  Layers,
  Home,
  Mountain,
  Key,
  Tent,
  Hotel,
  Compass,
  Trees,
  Warehouse
} from 'lucide-react';

function MainApp() {
  const { role, formatPrice } = useAuth();
  
  // Navigation state
  const [currentView, setCurrentView] = useState<string>('home');
  const [staticPageType, setStaticPageType] = useState<any>('about');

  // Data states
  const [properties, setProperties] = useState<Property[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [placeTypes, setPlaceTypes] = useState<PlaceTypeOption[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search & Filter state
  const [filters, setFilters] = useState<SearchFilterParams>({
    sortBy: 'recommended'
  });
  const [showMapToggle, setShowMapToggle] = useState<boolean>(false);

  // Active Modals
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [bookingCheckoutData, setBookingCheckoutData] = useState<{
    property: Property;
    roomType: RoomType;
    bookingDetails: any;
  } | null>(null);
  const [aiFinderOpen, setAiFinderOpen] = useState<boolean>(false);

  // Load initial data
  const loadAllData = async () => {
    setIsLoading(true);
    const [allProps, allDests, allAmens, allPkgs, allPts] = await Promise.all([
      dbService.getProperties(filters),
      dbService.getDestinations(),
      dbService.getAmenities(),
      dbService.getPackages(),
      dbService.getPlaceTypes()
    ]);
    setProperties(allProps);
    setDestinations(allDests);
    setAmenities(allAmens);
    setPackages(allPkgs);
    setPlaceTypes(allPts);
    setWishlist(dbService.getWishlist());
    setIsLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, [filters]);

  // Real-time synchronization when destinations, places, place types or packages change
  useEffect(() => {
    const handleDataUpdated = () => {
      loadAllData();
    };
    window.addEventListener('bap_data_updated', handleDataUpdated);
    return () => {
      window.removeEventListener('bap_data_updated', handleDataUpdated);
    };
  }, []);

  const renderPlaceTypeIcon = (iconName?: string) => {
    switch (iconName) {
      case 'GraduationCap': return <GraduationCap className="w-5 h-5" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5" />;
      case 'Mountain': return <Mountain className="w-5 h-5" />;
      case 'Home': return <Home className="w-5 h-5" />;
      case 'Key': return <Key className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'Tent': return <Tent className="w-5 h-5" />;
      case 'Hotel': return <Hotel className="w-5 h-5" />;
      case 'Trees': return <Trees className="w-5 h-5" />;
      case 'Warehouse': return <Warehouse className="w-5 h-5" />;
      case 'Compass': return <Compass className="w-5 h-5" />;
      default: return <Building2 className="w-5 h-5" />;
    }
  };

  const handleNavigate = (view: string, params?: any) => {
    if (['cancellation-policy', 'terms', 'privacy', 'about', 'help'].includes(view)) {
      setStaticPageType(view);
      setCurrentView('static');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'host-onboarding') {
      setCurrentView('host-portal');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (params?.destination) {
      setFilters(prev => ({ ...prev, destination: params.destination }));
      setCurrentView('explore');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleWishlist = (propertyId: string) => {
    const updated = dbService.toggleWishlist(propertyId);
    setWishlist(updated);
  };

  const handleSearchFromHero = (newParams: SearchFilterParams) => {
    setFilters(prev => ({ ...prev, ...newParams }));
    setCurrentView('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-[#0F172A]">
      
      {/* Global Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAiFinder={() => setAiFinderOpen(true)}
        wishlistCount={wishlist.length}
      />

      {/* Main Routed Content */}
      <main className="flex-1">
        
        {/* VIEW 1: HOME PAGE */}
        {currentView === 'home' && (
          <div className="space-y-16 pb-16">
            
            {/* Hero Section with Interactive Multi-Field Search */}
            <HeroSearch
              destinations={destinations}
              placeTypes={placeTypes}
              onSearch={handleSearchFromHero}
              onOpenAiFinder={() => setAiFinderOpen(true)}
            />

            {/* Front-Page Customizable Place Types (Admin Customizable & Displayed on Front Page) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                      Stay Categories
                    </span>
                    {role === 'admin' && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                        Admin Customizable
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                    Browse by Accommodation Type
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Explore student living, executive co-living, family apartments, mountain chalets, and heritage havelis across Pakistan.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {role === 'admin' && (
                    <button
                      onClick={() => setCurrentView('admin-panel')}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      <span>Manage Place Types</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setFilters({ sortBy: 'recommended' });
                      setCurrentView('explore');
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>View All Stays</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Grid of Place Types (Customizable by Admin & displayed on Front Page) */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(placeTypes.filter(pt => pt.is_featured_on_front).length > 0
                  ? placeTypes.filter(pt => pt.is_featured_on_front)
                  : placeTypes
                ).map((pt) => {
                  const matchingCount = properties.filter(p => p.property_type === pt.slug).length;
                  return (
                    <div
                      key={pt.id}
                      onClick={() => {
                        setFilters(prev => ({ ...prev, category: pt.slug }));
                        setCurrentView('explore');
                      }}
                      className="group bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-lg hover:border-emerald-500/40 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                            {renderPlaceTypeIcon(pt.icon_name)}
                          </div>
                          {pt.badge_text && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 group-hover:bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200/60 truncate max-w-[130px]">
                              {pt.badge_text}
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-800 transition-colors">
                            {pt.name}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                            {pt.description || 'Verified accommodation with essential amenities and security.'}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-[11px] text-slate-600">
                          {matchingCount > 0 ? `${matchingCount} places available` : 'Available on request'}
                        </span>
                        <span className="text-emerald-700 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5 text-xs">
                          Explore <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Featured Stays in Pakistan (Horizontal cards preview) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                    Handpicked Stays
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                    Featured Accommodations in Pakistan
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Inspected for 24/7 power backup, high-speed fiber Wi-Fi, and verified hosts.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentView('explore')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>View All {properties.length} Listings</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Horizontal Listing Cards List (Reference visual style) */}
              <div className="space-y-5">
                {properties.slice(0, 4).map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onSelect={(p) => setSelectedProperty(p)}
                    onBookNow={(p) => setSelectedProperty(p)}
                    isWishlisted={wishlist.includes(property.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            </section>

            {/* Destinations Grid Shortcut */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                    Top Cities & Valleys
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                    Popular Destinations
                  </h2>
                </div>
                <button
                  onClick={() => setCurrentView('destinations')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore All Cities</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {destinations.slice(0, 4).map((dest) => (
                  <div
                    key={dest.id}
                    onClick={() => {
                      setFilters(prev => ({ ...prev, destination: dest.name }));
                      setCurrentView('explore');
                    }}
                    className="relative h-56 rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-all"
                  >
                    <img src={dest.image_url} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <span className="text-[10px] font-bold uppercase text-emerald-400 block">{dest.province}</span>
                      <h4 className="font-bold text-base">{dest.name}</h4>
                      <p className="text-[11px] text-slate-300">{dest.property_count} verified stays</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Pakistani Living Packages Banner */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gradient-to-br from-[#0B192C] via-[#065F46] to-[#0B192C] text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 max-w-xl">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30">
                    Long Stay & Student Living in Pakistan
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black leading-tight">
                    Save up to 35% on Monthly & Semester Rentals
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Designed for students near NUST, LUMS, FAST, IBA and corporate relocators in Gulberg, Blue Area, and Clifton. Fixed utilities, high-speed Wi-Fi, and verified peace of mind.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <button
                      onClick={() => setCurrentView('packages')}
                      className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs tracking-wide shadow-md cursor-pointer transition-all"
                    >
                      Browse Accommodation Packages
                    </button>
                    <button
                      onClick={() => setAiFinderOpen(true)}
                      className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Ask AI Matchmaker</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 shrink-0 w-full sm:w-auto">
                  <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
                    <GraduationCap className="w-6 h-6 text-amber-300 mx-auto mb-1" />
                    <p className="text-xs font-bold">Student Hostels</p>
                    <p className="text-[10px] text-slate-300">From PKR 1,900/night</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
                    <Briefcase className="w-6 h-6 text-emerald-300 mx-auto mb-1" />
                    <p className="text-xs font-bold">Executive Suites</p>
                    <p className="text-[10px] text-slate-300">With 24/7 Generator</p>
                  </div>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* VIEW 2: EXPLORE / SEARCH MARKETPLACE (MATCHING REFERENCE DESIGN) */}
        {currentView === 'explore' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            
            {/* Top Toolbar matching reference image */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {filters.destination ? `Stays in ${filters.destination}` : 'All Accommodations in Pakistan'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing {properties.length} verified stays • Live availability updated
                </p>
              </div>

              {/* View options and Sort selector */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <button
                  onClick={() => setShowMapToggle(!showMapToggle)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                    showMapToggle ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {showMapToggle ? <List className="w-4 h-4" /> : <Map className="w-4 h-4" />}
                  <span>{showMapToggle ? 'Show Cards Only' : 'Interactive Map'}</span>
                </button>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="font-medium hidden sm:inline">Sort by:</span>
                  <select
                    value={filters.sortBy || 'recommended'}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="rating">Highest Guest Rating</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Main Marketplace Grid (Sidebar + Listings or Map) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Filter Sidebar (4 cols on lg) */}
              <div className="lg:col-span-4 xl:col-span-3">
                <FilterSidebar
                  destinations={destinations}
                  amenities={amenities}
                  placeTypes={placeTypes}
                  filters={filters}
                  onChange={(f) => setFilters(f)}
                  onReset={() => setFilters({ sortBy: 'recommended' })}
                />
              </div>

              {/* Right Column: Listing Cards or Interactive Map (8 cols on lg) */}
              <div className="lg:col-span-8 xl:col-span-9 space-y-5">
                
                {/* Optional Map View */}
                {showMapToggle && (
                  <div className="mb-6 animate-in fade-in">
                    <InteractiveMap
                      properties={properties}
                      onSelectProperty={(p) => setSelectedProperty(p)}
                      activeCity={filters.destination}
                    />
                  </div>
                )}

                {/* Listings */}
                {properties.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
                    <h3 className="font-bold text-base text-slate-900">No properties match your filter</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Try clearing some filters or searching for another city in Pakistan.
                    </p>
                    <button
                      onClick={() => setFilters({ sortBy: 'recommended' })}
                      className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {properties.map((prop) => (
                      <PropertyCard
                        key={prop.id}
                        property={prop}
                        onSelect={(p) => setSelectedProperty(p)}
                        onBookNow={(p) => setSelectedProperty(p)}
                        isWishlisted={wishlist.includes(prop.id)}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    ))}
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

        {/* VIEW 3: DESTINATIONS */}
        {currentView === 'destinations' && (
          <DestinationsView
            destinations={destinations}
            onSelectDestination={(destName) => {
              setFilters({ destination: destName });
              setCurrentView('explore');
            }}
          />
        )}

        {/* VIEW 4: PACKAGES */}
        {currentView === 'packages' && (
          <PackagesView
            packages={packages}
            onSelectPackage={(pkg) => {
              setFilters({ packageType: pkg.package_type });
              setCurrentView('explore');
            }}
          />
        )}

        {/* VIEW 5: CUSTOMER DASHBOARD */}
        {currentView === 'account' && (
          <CustomerDashboard
            onExploreStays={() => setCurrentView('explore')}
            onSelectProperty={(p) => setSelectedProperty(p)}
          />
        )}

        {/* VIEW 6: HOST DASHBOARD */}
        {currentView === 'host-portal' && (
          <HostDashboard />
        )}

        {/* VIEW 7: ADMIN DASHBOARD (Protected) */}
        {currentView === 'admin-panel' && (
          <AdminDashboard onNavigate={(view, params) => handleNavigate(view, params)} />
        )}

        {/* VIEW 8: STATIC POLICY & HELP PAGES */}
        {currentView === 'static' && (
          <StaticPage
            page={staticPageType}
            onBack={() => setCurrentView('home')}
          />
        )}

      </main>

      {/* Global Modals */}

      {/* 1. Property Detail Modal */}
      {selectedProperty && (
        <PropertyDetailView
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onProceedToBooking={(prop, room, details) => {
            setSelectedProperty(null);
            setBookingCheckoutData({
              property: prop,
              roomType: room,
              bookingDetails: details
            });
          }}
          onOpenItineraryGen={(prop) => {
            setAiFinderOpen(true);
          }}
          isWishlisted={wishlist.includes(selectedProperty.id)}
          onToggleWishlist={handleToggleWishlist}
        />
      )}

      {/* 2. Checkout Modal */}
      {bookingCheckoutData && (
        <CheckoutModal
          property={bookingCheckoutData.property}
          roomType={bookingCheckoutData.roomType}
          bookingDetails={bookingCheckoutData.bookingDetails}
          onClose={() => setBookingCheckoutData(null)}
          onBookingSuccess={() => {
            // Keep booking confirmed in modal until user clicks done
          }}
        />
      )}

      {/* 3. AI Stay Finder Modal */}
      {aiFinderOpen && (
        <AiStayFinderModal
          onClose={() => setAiFinderOpen(false)}
          onSelectPropertyByTitle={(title) => {
            const found = properties.find(p => p.title.toLowerCase().includes(title.toLowerCase()));
            if (found) {
              setAiFinderOpen(false);
              setSelectedProperty(found);
            }
          }}
        />
      )}

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
