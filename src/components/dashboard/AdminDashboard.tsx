import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Database, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  Download, 
  DollarSign, 
  Building2, 
  Users, 
  Calendar,
  AlertTriangle,
  RefreshCw,
  Terminal,
  FileText,
  MapPin,
  PlusCircle,
  Pencil,
  Trash2,
  Package as PackageIcon,
  Search,
  X,
  Sparkles,
  Layers,
  Eye,
  EyeOff
} from 'lucide-react';
import { dbService } from '../../services/db';
import { Property, Booking, Destination, Package, PlaceTypeOption, AuditLog } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';

interface AdminDashboardProps {
  onNavigate?: (view: string, params?: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { formatPrice, user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [placeTypes, setPlaceTypes] = useState<PlaceTypeOption[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'destinations' | 'add-destination' | 'properties' | 'place-types' | 'packages' | 'overview' | 'bookings' | 'workspace'>('destinations');
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dedicated Separate Adding Destination Page State
  const [newDestName, setNewDestName] = useState('');
  const [newDestProvince, setNewDestProvince] = useState('Khyber Pakhtunkhwa');
  const [newDestDesc, setNewDestDesc] = useState('');
  const [newDestImg, setNewDestImg] = useState('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80');
  const [newDestLat, setNewDestLat] = useState('35.2227');
  const [newDestLng, setNewDestLng] = useState('72.4258');
  const [newDestLandmarks, setNewDestLandmarks] = useState('Malam Jabba, Kalam Valley, White Palace');
  
  // Customization: Highlighted place types for this destination
  const [newDestPlaceTypes, setNewDestPlaceTypes] = useState<string[]>(['villa', 'apartment', 'guest_house']);

  // Customization: Starter place option in this destination
  const [enableStarterPlace, setEnableStarterPlace] = useState(true);
  const [starterPlaceTitle, setStarterPlaceTitle] = useState('');
  const [starterPlaceType, setStarterPlaceType] = useState('villa');
  const [starterPlacePrice, setStarterPlacePrice] = useState('9500');
  const [starterPlaceAddress, setStarterPlaceAddress] = useState('Main Bypass Road, Upper Valley');
  const [starterPlaceNeighborhood, setStarterPlaceNeighborhood] = useState('Scenic Ridge');
  const [starterPlaceCleaning, setStarterPlaceCleaning] = useState('1500');

  // Customization: Starter package option for this destination
  const [enableStarterPkg, setEnableStarterPkg] = useState(true);
  const [starterPkgTitle, setStarterPkgTitle] = useState('');
  const [starterPkgType, setStarterPkgType] = useState<'student' | 'professional' | 'family' | 'budget' | 'luxury' | 'long_stay'>('family');
  const [starterPkgDiscount, setStarterPkgDiscount] = useState('25');
  const [starterPkgMinStay, setStarterPkgMinStay] = useState('5');
  const [starterPkgAudience, setStarterPkgAudience] = useState('Vacationing families and sightseeing travelers');
  const [starterPkgInclusions, setStarterPkgInclusions] = useState('Scenic balcony view, Daily breakfast, Heated rooms, Local driver guide');

  // Success celebration state for dedicated page
  const [destPublishSuccess, setDestPublishSuccess] = useState<Destination | null>(null);

  // Destination Modals
  const [showAddDestModal, setShowAddDestModal] = useState<boolean>(false);
  const [editingDest, setEditingDest] = useState<Destination | null>(null);
  const [deletingDest, setDeletingDest] = useState<Destination | null>(null);

  // Place Modals
  const [showAddPlaceModal, setShowAddPlaceModal] = useState<boolean>(false);
  const [editingPlace, setEditingPlace] = useState<Property | null>(null);
  const [deletingPlace, setDeletingPlace] = useState<Property | null>(null);

  // Place Type Modals
  const [showAddPlaceTypeModal, setShowAddPlaceTypeModal] = useState<boolean>(false);
  const [editingPlaceType, setEditingPlaceType] = useState<PlaceTypeOption | null>(null);
  const [deletingPlaceType, setDeletingPlaceType] = useState<PlaceTypeOption | null>(null);

  // Package Modals
  const [showAddPackageModal, setShowAddPackageModal] = useState<boolean>(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [deletingPackage, setDeletingPackage] = useState<Package | null>(null);

  // Destination Form State
  const [destName, setDestName] = useState('');
  const [destProvince, setDestProvince] = useState('Khyber Pakhtunkhwa');
  const [destDescription, setDestDescription] = useState('');
  const [destImageUrl, setDestImageUrl] = useState('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80');
  const [destLat, setDestLat] = useState('35.2227');
  const [destLng, setDestLng] = useState('72.4258');
  const [destLandmarks, setDestLandmarks] = useState('Malam Jabba, Kalam Valley, White Palace');

  // Place / Property Form State
  const [placeTitle, setPlaceTitle] = useState('');
  const [placeCity, setPlaceCity] = useState('Islamabad');
  const [placeNeighborhood, setPlaceNeighborhood] = useState('Sector F-7');
  const [placeAddress, setPlaceAddress] = useState('');
  const [placeType, setPlaceType] = useState<string>('apartment');
  const [placeClass, setPlaceClass] = useState<any>('standard');
  const [placePrice, setPlacePrice] = useState('8500');
  const [placeCleaningFee, setPlaceCleaningFee] = useState('1500');
  const [placeDescription, setPlaceDescription] = useState('');
  const [placeImageUrl, setPlaceImageUrl] = useState('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80');

  // Place Type Form State
  const [ptName, setPtName] = useState('');
  const [ptSlug, setPtSlug] = useState('');
  const [ptDescription, setPtDescription] = useState('');
  const [ptIcon, setPtIcon] = useState('Building');
  const [ptBadge, setPtBadge] = useState('Verified Option');
  const [ptShowOnFront, setPtShowOnFront] = useState(true);

  // Package Form State
  const [pkgTitle, setPkgTitle] = useState('');
  const [pkgType, setPkgType] = useState<any>('student');
  const [pkgDescription, setPkgDescription] = useState('');
  const [pkgAudience, setPkgAudience] = useState('');
  const [pkgDiscount, setPkgDiscount] = useState('20');
  const [pkgMinStay, setPkgMinStay] = useState('30');
  const [pkgInclusions, setPkgInclusions] = useState('Fiber Wi-Fi, No utility charges, Study desk, UPS backup');
  const [pkgBannerUrl, setPkgBannerUrl] = useState('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80');

  const loadData = async () => {
    const [s, props, dests, pts, pkgs, bks] = await Promise.all([
      dbService.getAdminStats(),
      dbService.getProperties(),
      dbService.getDestinations(),
      dbService.getPlaceTypes(),
      dbService.getPackages(),
      dbService.getBookings(undefined, 'admin')
    ]);
    setStats(s);
    setProperties(props);
    setDestinations(dests);
    setPlaceTypes(pts);
    setPackages(pkgs);
    setBookings(bks);
    setAuditLogs(dbService.getAuditLogs());
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const PRESET_DESTINATIONS = [
    {
      name: 'Swat Valley',
      province: 'Khyber Pakhtunkhwa',
      lat: '35.2227',
      lng: '72.4258',
      desc: 'Known as the Switzerland of Pakistan with alpine valleys, pine forests, Malam Jabba ski slopes, and glacial rivers.',
      img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      landmarks: 'Malam Jabba Ski Resort, Kalam Valley, Mahodand Lake, White Palace'
    },
    {
      name: 'Skardu & Deosai',
      province: 'Gilgit-Baltistan',
      lat: '35.2971',
      lng: '75.6333',
      desc: 'High-altitude gateway to K2, featuring Shangrila Lake, the cold desert of Sarfaranga, and pristine high plateaus.',
      img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      landmarks: 'Shangrila Resort, Upper Kachura Lake, Sarfaranga Cold Desert, Deosai Plains'
    },
    {
      name: 'Hunza & Nagar',
      province: 'Gilgit-Baltistan',
      lat: '36.3167',
      lng: '74.6500',
      desc: 'Breathtaking valley surrounded by Rakaposhi and Ultar peaks, famous for apricot orchards and ancient Baltit Fort.',
      img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
      landmarks: 'Baltit Fort, Altit Fort, Attabad Lake, Passu Cones, Eagle’s Nest'
    },
    {
      name: 'Gwadar Coast',
      province: 'Balochistan',
      lat: '25.1264',
      lng: '62.3225',
      desc: 'Emerging deep-sea coastal city along the Arabian Sea featuring dramatic hammerhead cliff formations and clean beaches.',
      img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      landmarks: 'Koh-e-Batil, Marine Drive, Hammerhead Cliff, Padizer Beach'
    },
    {
      name: 'Chitral & Kalash',
      province: 'Khyber Pakhtunkhwa',
      lat: '35.8510',
      lng: '71.7864',
      desc: 'Dramatic Hindu Kush valleys home to the unique Kalash culture, Shandur high pass polo ground, and Tirich Mir views.',
      img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
      landmarks: 'Kalash Valleys, Shahi Masjid Chitral, Shandur Top, Tirich Mir Base'
    },
    {
      name: 'Murree & Galyat',
      province: 'Punjab',
      lat: '33.9062',
      lng: '73.3903',
      desc: 'Lush pine forests, colonial mountain architecture, and crisp highland breezes just an hour from Islamabad.',
      img: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=800&q=80',
      landmarks: 'Mall Road, Patriata Chairlift, Bhurban Golf Course, Changla Gali, Nathia Gali'
    }
  ];

  const applyPreset = (preset: typeof PRESET_DESTINATIONS[0]) => {
    setNewDestName(preset.name);
    setNewDestProvince(preset.province);
    setNewDestLat(preset.lat);
    setNewDestLng(preset.lng);
    setNewDestDesc(preset.desc);
    setNewDestImg(preset.img);
    setNewDestLandmarks(preset.landmarks);
    setStarterPlaceTitle(`${preset.name} Executive Residency`);
    setStarterPkgTitle(`${preset.name} Explorer & Vacation Package`);
    setToastMessage(`Loaded preset for ${preset.name}!`);
  };

  // --------------------------------------------------------------------------
  // DEDICATED SEPARATE ADDING DESTINATION PAGE SUBMISSION
  // --------------------------------------------------------------------------
  const handlePublishDedicatedDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDestName.trim()) {
      setToastMessage('Please enter a destination name.');
      return;
    }

    const landmarksArr = newDestLandmarks.split(',').map(s => s.trim()).filter(Boolean);
    const slug = newDestName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // 1. Create Destination
    const createdDest = await dbService.createDestination({
      name: newDestName.trim(),
      slug,
      province: newDestProvince,
      description: newDestDesc || `Scenic Pakistani destination in ${newDestProvince} offering verified guest accommodations.`,
      image_url: newDestImg || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      property_count: enableStarterPlace ? 1 : 0,
      latitude: parseFloat(newDestLat) || 33.68,
      longitude: parseFloat(newDestLng) || 73.04,
      popular_landmarks: landmarksArr
    });

    try {
      await fetch('/api/admin/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createdDest)
      });
    } catch (err) {
      console.warn('Backend sync warning:', err);
    }

    // 2. If Starter Place is enabled, create initial property in this destination
    if (enableStarterPlace) {
      const placeTitle = starterPlaceTitle.trim() || `${newDestName} Heritage Residency & Stays`;
      const createdPlace = await dbService.createProperty({
        host_id: user?.id || 'admin-user',
        title: placeTitle,
        description: `Verified, fully furnished accommodation located in ${newDestName}, ${newDestProvince}. Equipped with high-speed Wi-Fi, generator/solar backup, and hot water.`,
        property_type: starterPlaceType,
        accommodation_class: 'standard',
        address: starterPlaceAddress || `Main Valley Road, ${newDestName}`,
        city: newDestName.trim(),
        neighborhood: starterPlaceNeighborhood || 'Central Tourist Area',
        latitude: parseFloat(newDestLat) || 33.68,
        longitude: parseFloat(newDestLng) || 73.04,
        base_nightly_price: parseFloat(starterPlacePrice) || 8500,
        currency: 'PKR',
        cleaning_fee: parseFloat(starterPlaceCleaning) || 1500,
        security_deposit: 5000,
        tax_rate_percent: 5,
        weekly_discount_percent: 10,
        monthly_discount_percent: 25,
        check_in_time: '14:00',
        check_out_time: '11:00',
        cancellation_policy: 'flexible',
        is_published: true,
        is_verified_listing: true,
        featured: true,
        suitable_for: ['travelers', 'families', 'professionals'],
        images: [newDestImg],
        amenity_slugs: ['fiber-wifi', 'generator-backup', 'hot-water', 'ac']
      });

      try {
        await fetch('/api/admin/places', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createdPlace)
        });
      } catch (err) {
        console.warn('Backend place sync warning:', err);
      }
    }

    // 3. If Starter Package is enabled, create package tailored for this destination
    if (enableStarterPkg) {
      const pkgTitle = starterPkgTitle.trim() || `${newDestName} Living & Travel Package`;
      const createdPkg = await dbService.createPackage({
        title: pkgTitle,
        slug: pkgTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        package_type: starterPkgType,
        discount_percentage: parseFloat(starterPkgDiscount) || 20,
        minimum_stay_days: parseInt(starterPkgMinStay) || 5,
        target_audience: starterPkgAudience || `Visitors and long-stayers in ${newDestName}`,
        inclusions: starterPkgInclusions.split(',').map(s => s.trim()).filter(Boolean),
        banner_image: newDestImg,
        description: `Exclusive accommodation package tailored for ${newDestName}, ${newDestProvince}. Includes utility backup and verified security.`,
        is_active: true
      });

      try {
        await fetch('/api/admin/packages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createdPkg)
        });
      } catch (err) {
        console.warn('Backend package sync warning:', err);
      }
    }

    setDestPublishSuccess(createdDest);
    setToastMessage(`Destination "${newDestName}" & customizations published successfully!`);
    await loadData();
  };

  // --------------------------------------------------------------------------
  // DESTINATION ACTIONS (Edit, Save, and Delete)
  // --------------------------------------------------------------------------
  const handleEditDestClick = (dest: Destination) => {
    setEditingDest(dest);
    setDestName(dest.name);
    setDestProvince(dest.province);
    setDestDescription(dest.description);
    setDestImageUrl(dest.image_url);
    setDestLat(String(dest.latitude));
    setDestLng(String(dest.longitude));
    setDestLandmarks(dest.popular_landmarks ? dest.popular_landmarks.join(', ') : '');
  };

  const handleSaveDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destName.trim()) return;

    const landmarksArr = destLandmarks.split(',').map(s => s.trim()).filter(Boolean);
    const slug = destName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (editingDest) {
      await dbService.updateDestination(editingDest.id, {
        name: destName.trim(),
        slug,
        province: destProvince,
        description: destDescription,
        image_url: destImageUrl,
        latitude: parseFloat(destLat) || 33.68,
        longitude: parseFloat(destLng) || 73.04,
        popular_landmarks: landmarksArr
      });

      try {
        await fetch(`/api/admin/destinations/${editingDest.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: destName, province: destProvince, slug })
        });
      } catch (err) {
        console.warn('Backend sync warning:', err);
      }
      setToastMessage(`Destination "${destName}" updated successfully!`);
      setEditingDest(null);
    } else {
      const created = await dbService.createDestination({
        name: destName.trim(),
        slug,
        province: destProvince,
        description: destDescription || `Scenic Pakistani destination in ${destProvince}.`,
        image_url: destImageUrl || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
        property_count: 0,
        latitude: parseFloat(destLat) || 33.68,
        longitude: parseFloat(destLng) || 73.04,
        popular_landmarks: landmarksArr
      });

      try {
        await fetch('/api/admin/destinations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(created)
        });
      } catch (err) {
        console.warn('Backend sync warning:', err);
      }
      setToastMessage(`Destination "${destName}" added successfully!`);
      setShowAddDestModal(false);
    }

    setDestName('');
    setDestDescription('');
    setDestLandmarks('');
    await loadData();
  };

  const confirmDeleteDestination = async () => {
    if (!deletingDest) return;
    const destToDelete = deletingDest;
    const destId = destToDelete.id;

    // Optimistic UI update immediately so user feels instant feedback
    setDestinations(prev => prev.filter(d => d.id !== destId && d.slug !== destToDelete.slug && d.name !== destToDelete.name));
    setDeletingDest(null);

    try {
      await dbService.deleteDestination(destId);
    } catch (err) {
      console.error('dbService deleteDestination error:', err);
    }

    try {
      await fetch(`/api/admin/destinations/${destId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend sync warning:', err);
    }

    setToastMessage(`Destination "${destToDelete.name}" removed successfully.`);
    await loadData();
  };

  // --------------------------------------------------------------------------
  // PLACE / PROPERTY ACTIONS
  // --------------------------------------------------------------------------
  const handleSavePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeTitle.trim() || !placeAddress.trim()) return;

    if (editingPlace) {
      await dbService.updateProperty(editingPlace.id, {
        title: placeTitle,
        city: placeCity,
        neighborhood: placeNeighborhood,
        address: placeAddress,
        property_type: placeType,
        accommodation_class: placeClass,
        base_nightly_price: parseFloat(placePrice) || 8500,
        cleaning_fee: parseFloat(placeCleaningFee) || 1500,
        description: placeDescription,
        images: [placeImageUrl]
      });

      try {
        await fetch(`/api/admin/places/${editingPlace.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: placeTitle, city: placeCity, base_nightly_price: placePrice })
        });
      } catch (err) {
        console.warn('Backend sync error:', err);
      }
      setEditingPlace(null);
    } else {
      const created = await dbService.createProperty({
        host_id: user?.id || 'admin-user',
        title: placeTitle,
        description: placeDescription,
        property_type: placeType,
        accommodation_class: placeClass,
        address: placeAddress,
        city: placeCity,
        neighborhood: placeNeighborhood,
        latitude: 33.72,
        longitude: 73.05,
        base_nightly_price: parseFloat(placePrice) || 8500,
        currency: 'PKR',
        cleaning_fee: parseFloat(placeCleaningFee) || 1500,
        security_deposit: 5000,
        tax_rate_percent: 5,
        weekly_discount_percent: 10,
        monthly_discount_percent: 25,
        check_in_time: '14:00',
        check_out_time: '11:00',
        cancellation_policy: 'flexible',
        is_published: true,
        is_verified_listing: true,
        featured: false,
        suitable_for: ['travelers', 'professionals'],
        images: [placeImageUrl],
        amenity_slugs: ['fiber-wifi', 'generator-backup', 'hot-water', 'ac']
      });

      try {
        await fetch('/api/admin/places', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(created)
        });
      } catch (err) {
        console.warn('Backend sync error:', err);
      }
      setShowAddPlaceModal(false);
    }

    setPlaceTitle('');
    setPlaceAddress('');
    setPlaceDescription('');
    loadData();
  };

  const handleEditPlaceClick = (p: Property) => {
    setEditingPlace(p);
    setPlaceTitle(p.title);
    setPlaceCity(p.city);
    setPlaceNeighborhood(p.neighborhood);
    setPlaceAddress(p.address);
    setPlaceType(p.property_type);
    setPlaceClass(p.accommodation_class);
    setPlacePrice(String(p.base_nightly_price));
    setPlaceCleaningFee(String(p.cleaning_fee || 0));
    setPlaceDescription(p.description);
    setPlaceImageUrl(p.images[0] || '');
  };

  const confirmDeletePlace = async () => {
    if (!deletingPlace) return;
    const placeId = deletingPlace.id;
    await dbService.deleteProperty(placeId);
    try {
      await fetch(`/api/admin/places/${placeId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend sync warning:', err);
    }
    setDeletingPlace(null);
    loadData();
  };

  const handleToggleVerification = async (p: Property) => {
    const updated = await dbService.updateProperty(p.id, {
      is_verified_listing: !p.is_verified_listing
    });
    if (updated) {
      setProperties(properties.map(item => item.id === p.id ? updated : item));
    }
  };

  // --------------------------------------------------------------------------
  // PLACE TYPES ACTIONS (Customizable by Admin & displayed on Front Page)
  // --------------------------------------------------------------------------
  const handleSavePlaceType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ptName.trim()) return;

    const slug = ptSlug.trim() || ptName.toLowerCase().replace(/[^a-z0-9]+/g, '_');

    if (editingPlaceType) {
      await dbService.updatePlaceType(editingPlaceType.id, {
        name: ptName,
        slug,
        description: ptDescription,
        icon_name: ptIcon,
        badge_text: ptBadge,
        is_featured_on_front: ptShowOnFront
      });

      try {
        await fetch(`/api/admin/place-types/${editingPlaceType.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: ptName, slug, is_featured_on_front: ptShowOnFront })
        });
      } catch (err) {
        console.warn('Backend sync warning:', err);
      }
      setEditingPlaceType(null);
    } else {
      const created = await dbService.createPlaceType({
        name: ptName,
        slug,
        description: ptDescription,
        icon_name: ptIcon,
        badge_text: ptBadge,
        is_featured_on_front: ptShowOnFront
      });

      try {
        await fetch('/api/admin/place-types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(created)
        });
      } catch (err) {
        console.warn('Backend sync warning:', err);
      }
      setShowAddPlaceTypeModal(false);
    }

    setPtName('');
    setPtSlug('');
    setPtDescription('');
    loadData();
  };

  const handleEditPlaceTypeClick = (pt: PlaceTypeOption) => {
    setEditingPlaceType(pt);
    setPtName(pt.name);
    setPtSlug(pt.slug);
    setPtDescription(pt.description || '');
    setPtIcon(pt.icon_name || 'Building');
    setPtBadge(pt.badge_text || '');
    setPtShowOnFront(pt.is_featured_on_front);
  };

  const handleTogglePlaceTypeFront = async (pt: PlaceTypeOption) => {
    const updated = await dbService.updatePlaceType(pt.id, {
      is_featured_on_front: !pt.is_featured_on_front
    });
    if (updated) {
      setPlaceTypes(placeTypes.map(item => item.id === pt.id ? updated : item));
    }
  };

  const confirmDeletePlaceType = async () => {
    if (!deletingPlaceType) return;
    const ptId = deletingPlaceType.id;
    await dbService.deletePlaceType(ptId);
    try {
      await fetch(`/api/admin/place-types/${ptId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend sync warning:', err);
    }
    setDeletingPlaceType(null);
    loadData();
  };

  // --------------------------------------------------------------------------
  // PACKAGE ACTIONS
  // --------------------------------------------------------------------------
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgTitle.trim()) return;

    const incArr = pkgInclusions.split(',').map(s => s.trim()).filter(Boolean);
    const slug = pkgTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (editingPackage) {
      await dbService.updatePackage(editingPackage.id, {
        title: pkgTitle,
        slug,
        package_type: pkgType,
        description: pkgDescription,
        target_audience: pkgAudience,
        discount_percentage: parseFloat(pkgDiscount) || 20,
        minimum_stay_days: parseInt(pkgMinStay) || 30,
        inclusions: incArr,
        banner_image: pkgBannerUrl
      });
      setEditingPackage(null);
    } else {
      await dbService.createPackage({
        title: pkgTitle,
        slug,
        package_type: pkgType,
        description: pkgDescription,
        target_audience: pkgAudience,
        discount_percentage: parseFloat(pkgDiscount) || 20,
        minimum_stay_days: parseInt(pkgMinStay) || 30,
        inclusions: incArr,
        banner_image: pkgBannerUrl,
        is_active: true
      });
      setShowAddPackageModal(false);
    }

    setPkgTitle('');
    setPkgDescription('');
    loadData();
  };

  const handleEditPackageClick = (pkg: Package) => {
    setEditingPackage(pkg);
    setPkgTitle(pkg.title);
    setPkgType(pkg.package_type);
    setPkgDescription(pkg.description);
    setPkgAudience(pkg.target_audience);
    setPkgDiscount(String(pkg.discount_percentage));
    setPkgMinStay(String(pkg.minimum_stay_days));
    setPkgInclusions(pkg.inclusions.join(', '));
    setPkgBannerUrl(pkg.banner_image);
  };

  const confirmDeletePackage = async () => {
    if (!deletingPackage) return;
    await dbService.deletePackage(deletingPackage.id);
    setDeletingPackage(null);
    loadData();
  };

  // --------------------------------------------------------------------------
  // GOOGLE SHEETS EXPORT
  // --------------------------------------------------------------------------
  const handleExportSheets = async () => {
    setSyncStatus('Compiling spreadsheet export payload...');
    try {
      const res = await fetch('/api/workspace/export-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookings })
      });
      const data = await res.json();
      
      const blob = new Blob([data.csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BookAPlace_Reservations_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();

      setSyncStatus(`Successfully exported ${data.rowCount} rows to Google Sheets CSV format.`);
    } catch (err: any) {
      setSyncStatus(`Export error: ${err.message}`);
    }
  };

  // Filtering
  const filteredDestinations = destinations.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.province.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.neighborhood.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-[#0B192C] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-black">Book a Place Administrator & Operations Hub</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Backend database control: Add, customize & remove Pakistani destinations, accommodation places, place types, and packages.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isSupabaseConfigured ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
            }`}>
              <Database className="w-3.5 h-3.5" />
              <span>{isSupabaseConfigured ? 'Connected to Supabase PostgreSQL' : 'Local Persistence & Schema Ready'}</span>
            </span>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex flex-wrap gap-1 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700 text-xs font-bold">
          <button
            onClick={() => setActiveTab('destinations')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'destinations' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Destinations ({destinations.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('add-destination');
              setDestPublishSuccess(null);
            }}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'add-destination' ? 'bg-amber-400 text-slate-950 font-black shadow-xs' : 'text-amber-300 hover:text-white'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>➕ Add Destination Page</span>
          </button>
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'properties' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Places / Stays ({properties.length})
          </button>
          <button
            onClick={() => setActiveTab('place-types')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'place-types' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Place Types ({placeTypes.length})
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'packages' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Packages ({packages.length})
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'bookings' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'workspace' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Google Workspace
          </button>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[120] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: DESTINATIONS MANAGEMENT PAGE                                       */}
      {/* ========================================================================= */}
      {activeTab === 'destinations' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-700" />
                <h3 className="text-lg font-black text-slate-900">Pakistani Destinations Manager</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Add, customize, update, or remove Pakistani cities and tourist valleys. Changes immediately sync across search and hero.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <input
                  type="text"
                  placeholder="Filter destinations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-600"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              <button
                onClick={() => {
                  setActiveTab('add-destination');
                  setDestPublishSuccess(null);
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Destination Page</span>
              </button>
            </div>
          </div>

          {/* Destination Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDestinations.map((dest) => (
              <div key={dest.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="h-44 relative bg-slate-100 overflow-hidden">
                    <img src={dest.image_url} alt={dest.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-bold">
                      {dest.province}
                    </div>
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 text-[10px] font-bold">
                      {dest.property_count} Stays
                    </div>
                  </div>

                  <div className="p-5 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-extrabold text-base text-slate-900">{dest.name}</h4>
                      <span className="text-[10px] font-mono text-slate-400">/{dest.slug}</span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {dest.description}
                    </p>

                    {dest.popular_landmarks && dest.popular_landmarks.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Key Landmarks:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {dest.popular_landmarks.map((lm, i) => (
                            <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                              {lm}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Coord: {dest.latitude.toFixed(2)}, {dest.longitude.toFixed(2)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditDestClick(dest)}
                      className="px-2.5 py-1 text-slate-600 hover:text-emerald-700 hover:bg-white rounded-lg border border-slate-200 transition-colors cursor-pointer flex items-center gap-1 font-bold"
                      title="Edit Destination"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeletingDest(dest)}
                      className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors cursor-pointer flex items-center gap-1 font-bold"
                      title="Delete Destination"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEPARATE DEDICATED PAGE: ADD DESTINATION & CUSTOMIZE PLACES / PACKAGES     */}
      {/* ========================================================================= */}
      {activeTab === 'add-destination' && (
        <div className="space-y-8 animate-in fade-in">
          {/* Top Return Header */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('destinations')}
                  className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                >
                  ← Back to Destinations
                </button>
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                  Dedicated Admin Page
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Add Pakistani Destination & Customizer
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                Create a new Pakistani city or tourist valley. On this page you can customize the destination profile, configure supported place types, create an initial verified accommodation, and attach customized travel packages in one unified flow.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('destinations')}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold cursor-pointer shrink-0"
            >
              View All Destinations ({destinations.length})
            </button>
          </div>

          {/* Quick Preset Selector for Popular Pakistani Hubs */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
                Quick-Load Pakistani Destination Presets
              </h4>
            </div>
            <p className="text-xs text-slate-400">
              Click any region to auto-populate high-resolution photos, coordinates, landmarks, and starter options:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {PRESET_DESTINATIONS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-700 text-white text-xs font-bold border border-slate-700 hover:border-emerald-500 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{preset.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({preset.province})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Success Banner if published */}
          {destPublishSuccess && (
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 space-y-4 animate-in zoom-in-95">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-emerald-950">
                    Destination "{destPublishSuccess.name}" is Now Live on the Marketplace!
                  </h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Successfully published to Book a Place. It is now instantly searchable on the front page, destination explorer, and filter menus with live coordinates and photos.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('explore', { destination: destPublishSuccess.name });
                    } else {
                      setActiveTab('destinations');
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  View on Explore / Front Page
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('destinations')}
                  className="px-4 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-100 text-xs font-bold cursor-pointer"
                >
                  Manage All Destinations
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDestPublishSuccess(null);
                    setNewDestName('');
                    setNewDestDesc('');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold cursor-pointer"
                >
                  + Add Another Destination
                </button>
              </div>
            </div>
          )}

          {/* Main Full-Page Form */}
          <form onSubmit={handlePublishDedicatedDestination} className="space-y-8">
            
            {/* SECTION 1: DESTINATION IDENTITY & LOCATION */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
                  1
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Destination Profile & Location</h4>
                  <p className="text-xs text-slate-500">Provide official identity, provincial territory, description, and imagery</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    City / Destination Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newDestName}
                    onChange={(e) => setNewDestName(e.target.value)}
                    placeholder="E.g., Swat Valley, Skardu, Gwadar, Chitral, Bahawalpur"
                    className="w-full p-3 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-emerald-600 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Province / Administrative Region</label>
                  <select
                    value={newDestProvince}
                    onChange={(e) => setNewDestProvince(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-emerald-600 text-xs cursor-pointer"
                  >
                    <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                    <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Azad Kashmir">Azad Kashmir</option>
                    <option value="Federal Capital">Federal Capital (Islamabad)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Latitude</label>
                  <input
                    type="text"
                    value={newDestLat}
                    onChange={(e) => setNewDestLat(e.target.value)}
                    placeholder="35.2227"
                    className="w-full p-3 rounded-xl border border-slate-200 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Longitude</label>
                  <input
                    type="text"
                    value={newDestLng}
                    onChange={(e) => setNewDestLng(e.target.value)}
                    placeholder="72.4258"
                    className="w-full p-3 rounded-xl border border-slate-200 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Key Landmarks (comma-separated)</label>
                  <input
                    type="text"
                    value={newDestLandmarks}
                    onChange={(e) => setNewDestLandmarks(e.target.value)}
                    placeholder="Malam Jabba, Kalam Valley, White Palace"
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="font-bold text-slate-700 block mb-1">Destination Description</label>
                <textarea
                  value={newDestDesc}
                  onChange={(e) => setNewDestDesc(e.target.value)}
                  rows={3}
                  placeholder="Scenic northern alpine valley known for lush pine forests, glacial streams, ski resorts, and cool summer weather..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs leading-relaxed focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center text-xs">
                <div className="md:col-span-8">
                  <label className="font-bold text-slate-700 block mb-1">Cover Image URL</label>
                  <input
                    type="url"
                    value={newDestImg}
                    onChange={(e) => setNewDestImg(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div className="md:col-span-4">
                  <div className="h-24 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 relative">
                    <img
                      src={newDestImg}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <span className="absolute bottom-1 right-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded">
                      Live Preview
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: PLACE & ACCOMMODATION OPTIONS CUSTOMIZER */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs">
                  2
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Customize Place & Accommodation Options</h4>
                  <p className="text-xs text-slate-500">
                    Select place types available in this destination and optionally create an initial verified accommodation
                  </p>
                </div>
              </div>

              {/* Place Types Multi-Select */}
              <div className="space-y-2">
                <label className="font-bold text-xs text-slate-700 block">
                  Allowed / Highlighted Place Types for {newDestName || 'this Destination'}:
                </label>
                <div className="flex flex-wrap gap-2">
                  {placeTypes.map((pt) => {
                    const isSelected = newDestPlaceTypes.includes(pt.slug);
                    return (
                      <button
                        type="button"
                        key={pt.id}
                        onClick={() => {
                          if (isSelected) {
                            setNewDestPlaceTypes(newDestPlaceTypes.filter(s => s !== pt.slug));
                          } else {
                            setNewDestPlaceTypes([...newDestPlaceTypes, pt.slug]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{pt.name}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Starter Place Toggle Box */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">
                      Instantly Create a Starter Verified Stay in {newDestName || 'this Destination'}
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Automatically seeds a verified property so travelers can book right away
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableStarterPlace}
                      onChange={(e) => setEnableStarterPlace(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {enableStarterPlace && (
                  <div className="pt-3 border-t border-slate-200/60 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-in fade-in">
                    <div className="md:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">Place Title</label>
                      <input
                        type="text"
                        value={starterPlaceTitle}
                        onChange={(e) => setStarterPlaceTitle(e.target.value)}
                        placeholder={`E.g., ${newDestName || 'Valley'} Alpine Ski Chalet & Suites`}
                        className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Place Type</label>
                      <select
                        value={starterPlaceType}
                        onChange={(e) => setStarterPlaceType(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold cursor-pointer"
                      >
                        {placeTypes.map((pt) => (
                          <option key={pt.id} value={pt.slug}>{pt.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Nightly Price (PKR)</label>
                      <input
                        type="number"
                        value={starterPlacePrice}
                        onChange={(e) => setStarterPlacePrice(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Neighborhood / Sector</label>
                      <input
                        type="text"
                        value={starterPlaceNeighborhood}
                        onChange={(e) => setStarterPlaceNeighborhood(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Cleaning Fee (PKR)</label>
                      <input
                        type="number"
                        value={starterPlaceCleaning}
                        onChange={(e) => setStarterPlaceCleaning(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 3: PACKAGE OPTIONS CUSTOMIZER */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs">
                  3
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Customize Travel & Living Packages</h4>
                  <p className="text-xs text-slate-500">
                    Create student discounts, long-stay seasonal promotions, or family vacation packages for this destination
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">
                      Attach a Curated Living Package for {newDestName || 'this Destination'}
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Offers discounts for extended semester stays, group tours, or corporate workations
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableStarterPkg}
                      onChange={(e) => setEnableStarterPkg(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {enableStarterPkg && (
                  <div className="pt-3 border-t border-slate-200/60 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-in fade-in">
                    <div className="md:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">Package Title</label>
                      <input
                        type="text"
                        value={starterPkgTitle}
                        onChange={(e) => setStarterPkgTitle(e.target.value)}
                        placeholder={`E.g., ${newDestName || 'Regional'} Living & Vacation Retreat`}
                        className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Package Category</label>
                      <select
                        value={starterPkgType}
                        onChange={(e) => setStarterPkgType(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold cursor-pointer"
                      >
                        <option value="student">Student Living</option>
                        <option value="professional">Corporate Executive</option>
                        <option value="family">Family Holiday</option>
                        <option value="budget">Budget Traveler</option>
                        <option value="luxury">Luxury Retreat</option>
                        <option value="long_stay">Long Stay (Monthly)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Discount %</label>
                      <input
                        type="number"
                        value={starterPkgDiscount}
                        onChange={(e) => setStarterPkgDiscount(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Min Stay Days</label>
                      <input
                        type="number"
                        value={starterPkgMinStay}
                        onChange={(e) => setStarterPkgMinStay(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Target Audience</label>
                      <input
                        type="text"
                        value={starterPkgAudience}
                        onChange={(e) => setStarterPkgAudience(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="font-bold text-slate-700 block mb-1">Included Amenities (comma-separated)</label>
                      <input
                        type="text"
                        value={starterPkgInclusions}
                        onChange={(e) => setStarterPkgInclusions(e.target.value)}
                        placeholder="Heated rooms, UPS power backup, Fiber Wi-Fi, Breakfast"
                        className="w-full p-2.5 rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ACTION BAR */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                <span>Destination will be published to PostgreSQL & synchronized across live frontend search</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('destinations')}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Publish Destination & Customizations</span>
                </button>
              </div>
            </div>

          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PLACES / STAYS MANAGEMENT PAGE                                     */}
      {/* ========================================================================= */}
      {activeTab === 'properties' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-700" />
                <h3 className="text-lg font-black text-slate-900">Accommodation Places & Stays</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Add new accommodation places, update rates in PKR, manage verification badges, and publish/delete stays.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <input
                  type="text"
                  placeholder="Filter places by name/city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-600"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              <button
                onClick={() => {
                  setEditingPlace(null);
                  setPlaceTitle('');
                  setPlaceAddress('');
                  setPlaceDescription('');
                  setShowAddPlaceModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Place</span>
              </button>
            </div>
          </div>

          {/* Places Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
                  <tr>
                    <th className="p-4">Place / Accommodation</th>
                    <th className="p-4">City & Area</th>
                    <th className="p-4">Place Type</th>
                    <th className="p-4">Nightly Rate</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Verified</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredProperties.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={p.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900">{p.title}</p>
                            <p className="text-[11px] text-slate-400">{p.address}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-700">
                        <p className="font-semibold">{p.city}</p>
                        <p className="text-[11px] text-slate-400">{p.neighborhood}</p>
                      </td>
                      <td className="p-4 capitalize text-slate-600">
                        {p.property_type.replace('_', ' ')}
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-900">
                        {formatPrice(p.base_nightly_price)}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleVerification(p)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                            p.is_verified_listing ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {p.is_verified_listing ? '✓ Verified' : 'Standard'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEditPlaceClick(p)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                            title="Edit Place"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingPlace(p)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                            title="Delete Place"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PLACE TYPES & CATEGORIES (Customizable by Admin & Front-Page)      */}
      {/* ========================================================================= */}
      {activeTab === 'place-types' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-700" />
                <h3 className="text-lg font-black text-slate-900">Custom Place Types & Front-Page Categories</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize accommodation types (e.g., Farmhouse, Glamping Pod, Executive Suite) and choose which appear on the front page.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingPlaceType(null);
                setPtName('');
                setPtSlug('');
                setPtDescription('');
                setPtBadge('Verified Option');
                setPtShowOnFront(true);
                setShowAddPlaceTypeModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Place Type</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {placeTypes.map((pt) => (
              <div key={pt.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900">{pt.name}</h4>
                      <span className="text-[10px] font-mono text-slate-400">slug: {pt.slug}</span>
                    </div>
                    <button
                      onClick={() => handleTogglePlaceTypeFront(pt)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        pt.is_featured_on_front
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                      title="Toggle visibility on front page"
                    >
                      {pt.is_featured_on_front ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                      <span>{pt.is_featured_on_front ? 'Shown on Front Page' : 'Hidden from Front'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {pt.description || 'No description provided'}
                  </p>

                  {pt.badge_text && (
                    <span className="inline-block px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                      Tag: {pt.badge_text}
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">Icon: {pt.icon_name || 'Building'}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEditPlaceTypeClick(pt)}
                      className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                      title="Edit Place Type"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingPlaceType(pt)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                      title="Delete Place Type"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PACKAGES MANAGEMENT PAGE                                           */}
      {/* ========================================================================= */}
      {activeTab === 'packages' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <PackageIcon className="w-5 h-5 text-emerald-700" />
                <h3 className="text-lg font-black text-slate-900">Custom Accommodation Packages</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize student living, corporate executive suites, family packages, and long-stay seasonal discounts.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingPackage(null);
                setPkgTitle('');
                setPkgDescription('');
                setShowAddPackageModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Package</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="h-40 relative bg-slate-100 overflow-hidden">
                    <img src={pkg.banner_image} alt={pkg.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 text-[10px] font-bold">
                      {pkg.discount_percentage}% OFF
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {pkg.package_type}
                    </span>
                    <h4 className="font-extrabold text-base text-slate-900">{pkg.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{pkg.description}</p>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Min Stay: {pkg.minimum_stay_days} days • Target: {pkg.target_audience}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{pkg.inclusions.length} Inclusions</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEditPackageClick(pkg)}
                      className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-white rounded-lg border border-slate-200 transition-colors cursor-pointer"
                      title="Edit Package"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingPackage(pkg)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                      title="Delete Package"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: OVERVIEW STATS                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Gross Booking Value (GBV)</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">
                {formatPrice(stats.totalGBV)}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">Total platform GMV</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Platform Commission (10%)</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 block">
                {formatPrice(stats.platformCommission)}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Net marketplace revenue</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Accommodations</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">
                {stats.totalProperties}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold mt-1 block">{stats.verifiedProperties} verified stays</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Destinations</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">
                {stats.destinationsCount}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Pakistani cities</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: BOOKINGS LEDGER                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-extrabold text-base text-slate-900">Platform Bookings Ledger</h3>
            <span className="text-xs text-slate-500">{bookings.length} total reservations</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Guest</th>
                  <th className="p-4">Dates</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70">
                    <td className="p-4 font-mono font-bold text-emerald-800">{b.booking_reference}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{b.guest_name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{b.guest_phone}</p>
                    </td>
                    <td className="p-4 text-slate-700">
                      {b.check_in_date} to {b.check_out_date} ({b.nights_count} nights)
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-900">{formatPrice(b.final_total)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.booking_status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {b.booking_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold">
                        {b.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: GOOGLE WORKSPACE                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'workspace' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">Google Workspace Integrations</h3>
            <p className="text-xs text-slate-500 mt-1">
              Export data directly to Google Sheets, generate official reservation Docs, and test Gmail notifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Google Sheets Reporting</h4>
              <p className="text-xs text-slate-500">
                Synchronize all reservations, financial settlements, and guest records to Google Sheets.
              </p>
              <button
                onClick={handleExportSheets}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Bookings to CSV/Sheets</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Google Docs Itineraries</h4>
              <p className="text-xs text-slate-500">
                Automated generation of official reservation documents for guests and visa authorities.
              </p>
              <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-2 rounded-lg">
                ✓ Ready: Integrated in guest vouchers & admin records.
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Terminal className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Gmail Booking Notifications</h4>
              <p className="text-xs text-slate-500">
                Configured with Google Workspace Gmail API proxy on the server backend.
              </p>
              <div className="text-xs font-semibold text-purple-700 bg-purple-50 p-2 rounded-lg">
                ✓ Ready: Queue handler running on Express `/api/workspace/send-email`.
              </div>
            </div>
          </div>

          {syncStatus && (
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-medium text-emerald-800">
              {syncStatus}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT DESTINATION                                           */}
      {/* ========================================================================= */}
      {(showAddDestModal || editingDest) && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full space-y-4 border border-slate-200 shadow-2xl my-4 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-700" />
                <h4 className="font-black text-base text-slate-900">
                  {editingDest ? `Edit Destination: ${editingDest.name}` : 'Add New Pakistani Destination'}
                </h4>
              </div>
              <button 
                onClick={() => { setShowAddDestModal(false); setEditingDest(null); }} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDestination} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City / Destination Name</label>
                  <input
                    type="text"
                    value={destName}
                    onChange={(e) => setDestName(e.target.value)}
                    placeholder="E.g., Swat Valley, Gwadar, Chitral"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Province / Region</label>
                  <select
                    value={destProvince}
                    onChange={(e) => setDestProvince(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-medium cursor-pointer"
                  >
                    <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                    <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Federal Capital">Federal Capital</option>
                    <option value="Azad Jammu & Kashmir">Azad Jammu & Kashmir</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Photo URL</label>
                <input
                  type="url"
                  value={destImageUrl}
                  onChange={(e) => setDestImageUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Latitude</label>
                  <input
                    type="text"
                    value={destLat}
                    onChange={(e) => setDestLat(e.target.value)}
                    placeholder="35.22"
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Longitude</label>
                  <input
                    type="text"
                    value={destLng}
                    onChange={(e) => setDestLng(e.target.value)}
                    placeholder="72.42"
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Popular Landmarks (comma separated)</label>
                <input
                  type="text"
                  value={destLandmarks}
                  onChange={(e) => setDestLandmarks(e.target.value)}
                  placeholder="Malam Jabba, Kalam, White Palace"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Destination Description</label>
                <textarea
                  value={destDescription}
                  onChange={(e) => setDestDescription(e.target.value)}
                  rows={3}
                  placeholder="Scenic valley known for skiing, glacial rivers, and lush green alpine meadows..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowAddDestModal(false); setEditingDest(null); }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer"
                >
                  {editingDest ? 'Update Destination' : 'Save Destination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD / EDIT PLACE                                                 */}
      {/* ========================================================================= */}
      {(showAddPlaceModal || editingPlace) && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-4 border border-slate-200 shadow-2xl my-4 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-700" />
                <h4 className="font-black text-base text-slate-900">
                  {editingPlace ? `Edit Place: ${editingPlace.title}` : 'Add New Accommodation Place'}
                </h4>
              </div>
              <button 
                onClick={() => { setShowAddPlaceModal(false); setEditingPlace(null); }} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlace} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Place Title</label>
                <input
                  type="text"
                  value={placeTitle}
                  onChange={(e) => setPlaceTitle(e.target.value)}
                  placeholder="E.g., Margalla Crest Executive Residence"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City</label>
                  <select
                    value={placeCity}
                    onChange={(e) => setPlaceCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold cursor-pointer"
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
                    value={placeNeighborhood}
                    onChange={(e) => setPlaceNeighborhood(e.target.value)}
                    placeholder="Gulberg III, Sector F-7, Clifton"
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Physical Address</label>
                <input
                  type="text"
                  value={placeAddress}
                  onChange={(e) => setPlaceAddress(e.target.value)}
                  placeholder="Street 14, Plot 32-A"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Place Type</label>
                  <select
                    value={placeType}
                    onChange={(e) => setPlaceType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 cursor-pointer font-medium"
                  >
                    {placeTypes.map(pt => (
                      <option key={pt.id} value={pt.slug}>{pt.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nightly Price (PKR)</label>
                  <input
                    type="number"
                    value={placePrice}
                    onChange={(e) => setPlacePrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cleaning Fee (PKR)</label>
                  <input
                    type="number"
                    value={placeCleaningFee}
                    onChange={(e) => setPlaceCleaningFee(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={placeImageUrl}
                  onChange={(e) => setPlaceImageUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  value={placeDescription}
                  onChange={(e) => setPlaceDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowAddPlaceModal(false); setEditingPlace(null); }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer"
                >
                  {editingPlace ? 'Update Place' : 'Save Place'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD / EDIT PLACE TYPE (Customizable by Admin)                     */}
      {/* ========================================================================= */}
      {(showAddPlaceTypeModal || editingPlaceType) && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full space-y-4 border border-slate-200 shadow-2xl my-4 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-700" />
                <h4 className="font-black text-base text-slate-900">
                  {editingPlaceType ? `Edit Place Type: ${editingPlaceType.name}` : 'Add New Place Type Option'}
                </h4>
              </div>
              <button 
                onClick={() => { setShowAddPlaceTypeModal(false); setEditingPlaceType(null); }} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlaceType} className="space-y-3 text-xs">
              {/* Quick Preset Place Type Options */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Quick Pakistani Place Type Templates:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { name: 'Farmhouses & Haveli Stays', slug: 'farmhouse', icon: 'Trees', badge: 'Weekend Retreat', desc: 'Spacious rural farmhouses with private pools, lush gardens, and haveli architecture.' },
                    { name: 'Glamping Pods & Alpine Tents', slug: 'glamping', icon: 'Tent', badge: 'Scenic Wilderness', desc: 'Insulated mountain domes and all-weather safari glamping tents with scenic views.' },
                    { name: 'Student Hostels & Dorms', slug: 'hostel', icon: 'GraduationCap', badge: 'Student Verified', desc: 'Secure, affordable student rooms with study desks, high-speed Wi-Fi, and mess facilities.' },
                    { name: 'Executive Serviced Suites', slug: 'executive_suite', icon: 'Briefcase', badge: 'Business Prime', desc: 'High-end apartments in major commercial zones with workspace and generator backup.' },
                    { name: 'Boutique Mountain Chalets', slug: 'chalet', icon: 'Mountain', badge: 'Alpine Escapes', desc: 'Traditional cedarwood alpine lodges with fireplaces and mountain panoramas.' },
                    { name: 'Beach Huts & Coastal Villas', slug: 'beach_hut', icon: 'Compass', badge: 'Coastal Living', desc: 'Private waterfront havens with Arabian Sea views and sunset decks.' },
                  ].map((tpl) => (
                    <button
                      key={tpl.slug}
                      type="button"
                      onClick={() => {
                        setPtName(tpl.name);
                        setPtSlug(tpl.slug);
                        setPtIcon(tpl.icon);
                        setPtBadge(tpl.badge);
                        setPtDescription(tpl.desc);
                        setPtShowOnFront(true);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-[11px] font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    >
                      + {tpl.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Place Type Name</label>
                  <input
                    type="text"
                    value={ptName}
                    onChange={(e) => setPtName(e.target.value)}
                    placeholder="E.g., Farmhouses, Glamping Pods, Executive Studios"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">System Slug (optional)</label>
                  <input
                    type="text"
                    value={ptSlug}
                    onChange={(e) => setPtSlug(e.target.value)}
                    placeholder="e.g. farmhouse, glamping_pod"
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Icon Representation</label>
                  <select
                    value={ptIcon}
                    onChange={(e) => setPtIcon(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 cursor-pointer font-medium"
                  >
                    <option value="Building">Building / Apartment / Flat</option>
                    <option value="Home">Home / Villa / Haveli</option>
                    <option value="Mountain">Mountain / Alpine Chalet</option>
                    <option value="Trees">Trees / Farmhouse / Orchard Lodge</option>
                    <option value="Tent">Tent / Glamping Pod / Campsite</option>
                    <option value="Hotel">Hotel / Guest House / Inn</option>
                    <option value="GraduationCap">GraduationCap / Student Hostel</option>
                    <option value="Briefcase">Briefcase / Executive Suite</option>
                    <option value="Warehouse">Warehouse / Studio Loft</option>
                    <option value="Sparkles">Sparkles / Luxury Resort / Penthouse</option>
                    <option value="Compass">Compass / Adventure & Coastal Stay</option>
                    <option value="Key">Key / Private Room / Annexe</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Front-Page Badge Tag</label>
                  <input
                    type="text"
                    value={ptBadge}
                    onChange={(e) => setPtBadge(e.target.value)}
                    placeholder="E.g., Weekend Retreat, Student Choice"
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Short Description</label>
                <textarea
                  value={ptDescription}
                  onChange={(e) => setPtDescription(e.target.value)}
                  rows={2}
                  placeholder="Description shown to guests on hero & filters..."
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Feature on Front Page</p>
                  <p className="text-[11px] text-slate-500">Show this category card directly in the Front Page Hero collections</p>
                </div>
                <input
                  type="checkbox"
                  checked={ptShowOnFront}
                  onChange={(e) => setPtShowOnFront(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowAddPlaceTypeModal(false); setEditingPlaceType(null); }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer"
                >
                  {editingPlaceType ? 'Update Place Type' : 'Save Place Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ADD / EDIT PACKAGE                                               */}
      {/* ========================================================================= */}
      {(showAddPackageModal || editingPackage) && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full space-y-4 border border-slate-200 shadow-2xl my-4 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PackageIcon className="w-5 h-5 text-emerald-700" />
                <h4 className="font-black text-base text-slate-900">
                  {editingPackage ? `Edit Package: ${editingPackage.title}` : 'Add New Accommodation Package'}
                </h4>
              </div>
              <button 
                onClick={() => { setShowAddPackageModal(false); setEditingPackage(null); }} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Package Title</label>
                <input
                  type="text"
                  value={pkgTitle}
                  onChange={(e) => setPkgTitle(e.target.value)}
                  placeholder="E.g., Student Living & University Hostels"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Package Category</label>
                  <select
                    value={pkgType}
                    onChange={(e) => setPkgType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 cursor-pointer"
                  >
                    <option value="student">Student</option>
                    <option value="professional">Professional</option>
                    <option value="family">Family</option>
                    <option value="budget">Budget</option>
                    <option value="luxury">Luxury</option>
                    <option value="long_stay">Long Stay</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Discount %</label>
                  <input
                    type="number"
                    value={pkgDiscount}
                    onChange={(e) => setPkgDiscount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Min Days Stay</label>
                  <input
                    type="number"
                    value={pkgMinStay}
                    onChange={(e) => setPkgMinStay(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Audience</label>
                <input
                  type="text"
                  value={pkgAudience}
                  onChange={(e) => setPkgAudience(e.target.value)}
                  placeholder="NUST, LUMS, FAST students and university interns"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Inclusions (comma separated)</label>
                <input
                  type="text"
                  value={pkgInclusions}
                  onChange={(e) => setPkgInclusions(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Banner Image URL</label>
                <input
                  type="url"
                  value={pkgBannerUrl}
                  onChange={(e) => setPkgBannerUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  value={pkgDescription}
                  onChange={(e) => setPkgDescription(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowAddPackageModal(false); setEditingPackage(null); }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer"
                >
                  {editingPackage ? 'Update Package' : 'Save Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IN-APP CONFIRMATION MODALS (REPLACING BROWSER WINDOW.CONFIRM)             */}
      {/* ========================================================================= */}
      
      {/* 1. Delete Destination Confirmation Modal */}
      {deletingDest && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-black text-lg text-slate-900">Remove Destination?</h4>
              <p className="text-xs text-slate-600">
                Are you sure you want to delete <strong>{deletingDest.name}</strong> ({deletingDest.province}) from the system?
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setDeletingDest(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteDestination}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Delete Place Confirmation Modal */}
      {deletingPlace && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-black text-lg text-slate-900">Remove Accommodation Place?</h4>
              <p className="text-xs text-slate-600">
                Are you sure you want to delete <strong>{deletingPlace.title}</strong>?
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setDeletingPlace(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePlace}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Delete Place Type Confirmation Modal */}
      {deletingPlaceType && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-black text-lg text-slate-900">Delete Place Type Option?</h4>
              <p className="text-xs text-slate-600">
                Are you sure you want to delete place type <strong>{deletingPlaceType.name}</strong>?
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setDeletingPlaceType(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePlaceType}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Delete Package Confirmation Modal */}
      {deletingPackage && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-black text-lg text-slate-900">Remove Package?</h4>
              <p className="text-xs text-slate-600">
                Are you sure you want to delete package <strong>{deletingPackage.title}</strong>?
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setDeletingPackage(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePackage}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
