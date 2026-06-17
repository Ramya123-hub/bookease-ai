import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Search, 
  MapPin, 
  DollarSign, 
  LogOut, 
  User as UserIcon, 
  Clock, 
  CheckCircle, 
  Briefcase,
  SlidersHorizontal,
  Plus,
  Compass,
  AlertCircle,
  XCircle,
  HelpCircle,
  FileText
} from 'lucide-react';
import { User, Booking, ServiceProvider, Service } from '../types';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Navigation tab controls
  const [activeSection, setActiveSection] = useState<'providers' | 'services' | 'bookings'>('providers');

  // Custom added services
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [targetProvider, setTargetProvider] = useState<ServiceProvider | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00 AM IST');
  const [notes, setNotes] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  // Authentication check & Data retrieval
  useEffect(() => {
    const userStr = localStorage.getItem('bookease_current_user');
    if (!userStr) {
      navigate('/');
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr) as User;
      if (parsedUser.role !== 'customer') {
        // Not a customer, redirect to index/login
        navigate('/');
        return;
      }
      setCurrentUser(parsedUser);
      loadAllData(parsedUser.email);
    } catch (e) {
      localStorage.removeItem('bookease_current_user');
      navigate('/');
    }
  }, [navigate]);

  const loadServices = () => {
    const currentServicesStr = localStorage.getItem('bookease_services');
    let loadedServices: Service[] = [];
    if (!currentServicesStr) {
      // Seed initial services matching requirements
      const initialServices: Service[] = [
        {
          id: 'srv-1',
          providerEmail: 'anita.salon@bookease.com',
          providerName: 'Anita Deshmukh',
          businessName: "Anita's Luxury Salon",
          serviceName: 'Haircut & Styling Session',
          description: 'Professional precision haircut, luxury hair conditioning wash, blow dry, and customized styling suited to your face structure.',
          category: 'Home Services',
          price: 300,
          duration: '45 mins'
        },
        {
          id: 'srv-2',
          providerEmail: 'sparkle.cleaning@bookease.com',
          providerName: 'Rajesh Kumar',
          businessName: 'Sparkle Cleaners Mumbai',
          serviceName: 'Elite Deep Home Cleaning',
          description: 'Deep sanitary cleaning of kitchen, bathroom, bedrooms and hallways. Eco-friendly solution used, with wet-mopping and sanitization.',
          category: 'Home Services',
          price: 1500,
          duration: '3 hours'
        },
        {
          id: 'srv-3',
          providerEmail: 'ayush.tuition@bookease.com',
          providerName: 'Ayush Gupta',
          businessName: 'Gupta Academic Coaching',
          serviceName: 'Mathematics Masterclass',
          description: 'Comprehensive coaching class focusing on advanced mathematical problems, calculus, algebra and university preparation material.',
          category: 'Education',
          price: 500,
          duration: '1 hour'
        },
        {
          id: 'srv-4',
          providerEmail: 'aditya.photo@bookease.com',
          providerName: 'Vikram Aditya',
          businessName: 'Aditya Wedding Photography',
          serviceName: 'Outdoor Portrait & Video Shoot',
          description: 'Stellar portrait photography package. Includes high-quality editing, raw files share, and individual lifestyle headshot consultation.',
          category: 'Tech Consulting',
          price: 2500,
          duration: '2 hours'
        },
        {
          id: 'srv-5',
          providerEmail: 'karan.gym@bookease.com',
          providerName: 'Karan Malhotra',
          businessName: 'Malhotra Fitness & Gym',
          serviceName: 'Personal Strength Coaching',
          description: 'One-on-one bodybuilding coaching, physical stance alignment correction, custom diet programs and monthly nutrition advice.',
          category: 'Fitness',
          price: 1200,
          duration: '1 Month'
        }
      ];
      localStorage.setItem('bookease_services', JSON.stringify(initialServices));
      loadedServices = initialServices;
    } else {
      try {
        loadedServices = JSON.parse(currentServicesStr) as Service[];
      } catch (e) {
        console.error('Error parsing services', e);
      }
    }
    setServices(loadedServices);
  };

  const loadAllData = (customerEmail: string) => {
    // 1. Get providers from "bookease_users"
    const allUsersStr = localStorage.getItem('bookease_users') || '[]';
    try {
      const allUsers = JSON.parse(allUsersStr);
      const provList = allUsers
        .filter((u: any) => u.role === 'provider')
        .map((p: any) => ({
          email: p.email,
          name: p.name,
          businessName: p.businessName || 'Elite Services Ltd',
          category: p.category || 'Professional Services',
          rating: p.rating || 4.8,
          price: p.price || 500,
          location: p.location || 'Mumbai / Remote',
          description: p.description || 'Dedicated specialist offering custom appointments.'
        }));
      setProviders(provList);
    } catch (e) {
      console.error(e);
    }

    // Load Services
    loadServices();

    // 2. Get bookings from "bookease_bookings"
    const allBookingsStr = localStorage.getItem('bookease_bookings') || '[]';
    try {
      const allBookings = JSON.parse(allBookingsStr) as Booking[];
      const filtered = allBookings.filter(b => b.customerEmail === customerEmail);
      setBookings(filtered);
    } catch (e) {
      console.error(e);
    }
  };

  // LOGOUT FUNCTIONALITY (Requirement 1, 2, 3)
  const handleLogout = () => {
    // 1. Remove user from localStorage
    localStorage.removeItem('bookease_current_user');
    
    // 2. Redirect to home page (/) using navigate()
    navigate('/');
  };

  // Open active booking configuration
  const startBookingFlow = (prov: ServiceProvider) => {
    setTargetProvider(prov);
    setSelectedService(null);
    setBookingDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]); // Tomorrow's date
    setBookingTime('10:00 AM IST');
    setNotes('');
    setBookingError('');
    setBookingSuccess('');
    setIsBookingModalOpen(true);
  };

  // Open custom service booking configuration
  const startServiceBookingFlow = (srv: Service) => {
    const matchingProvider = providers.find(p => p.email.toLowerCase() === srv.providerEmail.toLowerCase()) || {
      email: srv.providerEmail,
      name: srv.providerName,
      businessName: srv.businessName,
      category: srv.category,
      rating: 4.8,
      price: srv.price,
      location: 'Mumbai & Remote',
      description: srv.description
    };

    setTargetProvider(matchingProvider);
    setSelectedService(srv);
    setBookingDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]); // Tomorrow
    setBookingTime('11:30 AM IST');
    setNotes(`Requested custom service: ${srv.serviceName}`);
    setBookingError('');
    setBookingSuccess('');
    setIsBookingModalOpen(true);
  };

  const handleCancelBooking = (bookingId: string) => {
    const allBookingsStr = localStorage.getItem('bookease_bookings') || '[]';
    try {
      const allBookings = JSON.parse(allBookingsStr) as any[];
      const updated = allBookings.map(b => {
        if (b.id === bookingId) {
          return { ...b, status: 'Cancelled' };
        }
        return b;
      });
      localStorage.setItem('bookease_bookings', JSON.stringify(updated));
      
      // Update local state
      if (currentUser) {
        setBookings(updated.filter(b => b.customerEmail === currentUser.email));
      }
    } catch (e) {
      console.error('Error cancelling booking', e);
    }
  };

  const confirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !targetProvider) return;

    if (!bookingDate) {
      setBookingError('Please choose a valid scheduling date.');
      return;
    }

    const serviceNameString = selectedService ? selectedService.serviceName : `${targetProvider.businessName} - ${targetProvider.name}`;

    const newBooking = {
      id: 'book_' + Date.now(),
      customerEmail: currentUser.email,
      customerName: currentUser.name,
      providerEmail: targetProvider.email,
      providerName: targetProvider.name,
      serviceName: serviceNameString,
      date: bookingDate,
      time: bookingTime,
      bookingDate: bookingDate, // Explicit requirement: bookingDate
      bookingTime: bookingTime, // Explicit requirement: bookingTime
      status: 'Upcoming' as const, // Explicit requirement: status = "Upcoming"
      notes: notes
    };

    // Save to localStorage
    const allBookingsStr = localStorage.getItem('bookease_bookings') || '[]';
    let allBookings: any[] = [];
    try {
      allBookings = JSON.parse(allBookingsStr);
    } catch (err) {
      allBookings = [];
    }

    allBookings.push(newBooking);
    localStorage.setItem('bookease_bookings', JSON.stringify(allBookings));

    setBookingSuccess(`Slot reserved successfully for ${newBooking.serviceName}!`);
    setBookings(prev => [...prev, newBooking as any]);

    setTimeout(() => {
      setIsBookingModalOpen(false);
      setTargetProvider(null);
      setSelectedService(null);
    }, 1200);
  };

  // Categories list
  const categories = ['All', 'Home Services', 'Healthcare', 'Fitness', 'Education', 'Tech Consulting'];

  // Fliter logic
  const filteredProviders = providers.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Upper Navigation Bar */}
      <nav className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white mr-3">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900">BookEase <span className="text-indigo-600">AI</span></span>
                <span className="ml-2.5 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-md">Client Portal</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-800">{currentUser?.name}</span>
                <span className="text-xs text-slate-400 font-mono">{currentUser?.email}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>

              {/* LOGOUT BUTTON - Explicit requirement 1 & 2 */}
              <button
                id="customer_logout_btn"
                onClick={handleLogout}
                className="inline-flex items-center space-x-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 px-3.5 py-2 rounded-xl text-xs font-bold border border-rose-100 transition-all cursor-pointer shadow-3xs"
                title="Log out of BookEase AI"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner Greeting */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase font-mono">WELCOME BACK</span>
            <h2 id="client_welcome_title" className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">
              Hello, {currentUser?.name}!
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select one of our highly-rated professionals below to coordinate your next session.
            </p>
          </div>
          <div className="bg-indigo-50 px-4 py-3 rounded-xl border border-indigo-100 text-center shrink-0 w-full md:w-auto">
            <span className="block text-xl font-extrabold text-indigo-700">{bookings.length}</span>
            <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Total Appointments</span>
          </div>
        </div>

        {/* Navigation Selector Bar */}
        <div id="customer_tab_nav" className="bg-white p-1 rounded-xl border border-slate-200 shadow-3xs flex space-x-1">
          <button
            id="customer_tab_providers"
            onClick={() => setActiveSection('providers')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              activeSection === 'providers'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Discover Providers</span>
          </button>
          
          <button
            id="customer_tab_services"
            onClick={() => {
              setActiveSection('services');
              loadServices();
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              activeSection === 'services'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Services Catalog ({services.length})</span>
          </button>

          <button
            id="customer_tab_bookings"
            onClick={() => setActiveSection('bookings')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              activeSection === 'bookings'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>My Reservations ({bookings.length})</span>
          </button>
        </div>

        {/* Dynamic Workspace Container */}
        {activeSection === 'providers' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Discover & Book (8 cols) */}
            <div className="col-span-1 lg:col-span-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <Compass className="w-5 h-5 text-indigo-600" />
                    <span>Discover Skilled Service Providers</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-mono font-bold uppercase">{filteredProviders.length} Listing(s) Found</span>
                </div>

                {/* Search Bar and Filter Badges */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-3xs space-y-3.5">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by name, business, or expertise keywords..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-lg text-sm focus:outline-hidden focus:border-indigo-500 font-medium"
                    />
                  </div>

                  {/* Categories badges filter */}
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center space-x-1">
                      <SlidersHorizontal className="w-3 h-3" />
                      <span>Quick Filter By Industry</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`text-xs px-3 py-1 rounded-full font-medium transition cursor-pointer ${
                            selectedCategory === cat
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Providers Grid */}
              {filteredProviders.length === 0 ? (
                <div className="bg-white py-12 px-4 rounded-2xl border border-slate-200 text-center space-y-3">
                  <HelpCircle className="w-12 h-12 text-slate-400 mx-auto" />
                  <h4 className="font-bold text-slate-800">No service providers match your search or filters.</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">Try typing another keyword or change your industry selection tags.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProviders.map((prov) => (
                    <motion.div
                      key={prov.email}
                      layoutId={`prov-${prov.email}`}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold tracking-wider rounded-md uppercase">
                            {prov.category}
                          </span>
                          <div className="flex items-center space-x-1 bg-amber-50 rounded px-1.5 py-0.5 border border-amber-100 text-amber-700 text-xs font-bold">
                            <span>★</span>
                            <span>{prov.rating.toFixed(1)}</span>
                          </div>
                        </div>

                        <h4 className="font-bold text-base text-slate-950 mt-2">{prov.businessName}</h4>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">Contact: {prov.name}</p>

                        <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                          {prov.description}
                        </p>
                      </div>

                      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-mono font-bold">HOURLY RATE</span>
                          <span className="font-extrabold text-slate-900 text-base">₹{prov.price}/hr</span>
                        </div>

                        <button
                          onClick={() => startBookingFlow(prov)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Book Session</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Appointments Mini-Feed (4 cols) */}
            <div className="col-span-1 lg:col-span-4 space-y-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span>My Booking Logs</span>
              </h3>

              {bookings.length === 0 ? (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2">
                  <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-700 text-sm">No bookings set yet.</h4>
                  <p className="text-xs text-slate-500">Pick a provider on the left and tap "Book Session" to initiate your first appointment request.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {[...bookings].reverse().slice(0, 4).map((b) => (
                    <div key={b.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">{b.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          b.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' :
                          b.status === 'Accepted' || b.status === 'confirmed' ? 'bg-indigo-150 text-indigo-800 bg-indigo-50 border border-indigo-100' :
                          b.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          b.status === 'Rejected' ? 'bg-amber-100 text-amber-700' :
                          b.status === 'cancelled' || b.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {b.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-xs text-slate-900 leading-tight">{b.serviceName}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Contact Email: {b.providerEmail}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg text-xs font-medium text-slate-600">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{b.bookingDate || b.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{b.bookingTime || b.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {bookings.length > 4 && (
                    <button
                      onClick={() => setActiveSection('bookings')}
                      className="w-full text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-lg transition"
                    >
                      View All {bookings.length} Bookings
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Services Page Segment */}
        {activeSection === 'services' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-slate-950">Services Catalog</h3>
                <p className="text-xs text-slate-500 mt-1">Explore specialized service packages registered by our trusted professionals.</p>
              </div>
              <span className="px-3 py-1 font-mono text-xs font-bold text-indigo-700 bg-indigo-50 rounded-lg border border-indigo-100 shadow-3xs">
                {services.length} Custom Service(s) available
              </span>
            </div>

            {services.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3.5">
                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-800">No services available</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Our service providers have not registered any custom services in the database yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((srv) => (
                  <div key={srv.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-3xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between h-full bg-gradient-to-br from-slate-50/20 to-white">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md border border-indigo-100/50">
                          {srv.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-bold flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{srv.duration}</span>
                        </span>
                      </div>

                      <h4 className="text-base font-extrabold text-slate-900">{srv.serviceName}</h4>
                      <p className="text-xs text-slate-400 font-semibold mt-1">Provider: {srv.providerName} ({srv.businessName})</p>
                      
                      <p className="text-xs text-slate-500 mt-3.5 leading-relaxed line-clamp-4">
                        {srv.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-widest">Charges (INR)</span>
                        <span className="text-base font-black text-rose-600">₹{srv.price.toLocaleString('en-IN')}</span>
                      </div>

                      <button
                        onClick={() => startServiceBookingFlow(srv)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-3xs cursor-pointer flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Book Now</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Detailed Bookings Logs (Spacious Full Tab View) */}
        {activeSection === 'bookings' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>My Appointments & Reservation Status Feed</span>
              </h3>
              <span className="px-2.5 py-1 text-xs font-semibold font-mono bg-white border border-slate-100 rounded-md shadow-3xs text-slate-500">
                {bookings.length} Record(s) total
              </span>
            </div>

            {bookings.length === 0 ? (
              <div className="p-12 text-center space-y-3.5 animate-fadeIn">
                <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700">No scheduled sessions found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Reserve a profile slot or click "Book Service" inside the Catalog to request appointment slots.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {[...bookings].reverse().map((b) => (
                  <div key={b.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white hover:bg-slate-50/50 transition duration-150">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{b.id}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          b.status === 'Upcoming' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          b.status === 'Accepted' || b.status === 'confirmed' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                          b.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          b.status === 'Rejected' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          b.status === 'cancelled' || b.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                          'bg-slate-50 text-slate-750 border border-slate-150'
                        }`}>
                          {b.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{b.serviceName}</h4>
                        <p className="text-xs text-slate-400 font-semibold">Scheduled Professional: <span className="text-indigo-600">{b.providerName}</span> ({b.providerEmail})</p>
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
                        <div className="flex items-center space-x-1.5">
                          <CalendarIcon className="w-4 h-4 text-indigo-500" />
                          <span>Date: {b.bookingDate || b.date}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-4 h-4 text-indigo-500" />
                          <span>Slot Time: {b.bookingTime || b.time}</span>
                        </div>
                      </div>

                      {b.notes && (
                        <div className="text-xs text-slate-500 italic bg-indigo-50/30 p-2.5 rounded-lg border-l-3 border-indigo-300 max-w-xl">
                          <span className="font-semibold text-indigo-800 text-[10px] block uppercase not-italic tracking-wider mb-0.5">My Notes / Requirements</span>
                          "{b.notes}"
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0 self-start md:self-center min-w-40">
                      <div className="bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-100 shadow-3xs text-center w-full text-slate-600">
                        <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold">RESERVATION</span>
                        <span className="text-xs font-bold text-slate-700 block">
                          {b.status === 'pending' && 'Review in Progress'}
                          {b.status === 'confirmed' && 'Approved & Active'}
                          {b.status === 'Upcoming' && 'Upcoming Booking'}
                          {b.status === 'Accepted' && 'Accepted & Scheduled'}
                          {b.status === 'Rejected' && 'Booking Rejected'}
                          {b.status === 'completed' && 'Delivered Successfully'}
                          {b.status === 'cancelled' && 'Session Voided'}
                          {b.status === 'Cancelled' && 'Cancelled'}
                        </span>
                      </div>
                      {b.status === 'Upcoming' && (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="w-full px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 rounded-lg text-xs font-bold transition text-center cursor-pointer flex items-center justify-center space-x-1"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Booking Form Overlay Modal */}
      {isBookingModalOpen && targetProvider && (
        <div id="booking_modal_overlay" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
          >
            <div className="bg-indigo-600 px-5 py-4 text-white flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-base">Book a Session</h3>
                <p className="text-[10px] text-indigo-100 font-semibold mt-0.5">Scheduling with {targetProvider.name}</p>
              </div>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="w-8 h-8 rounded-full bg-indigo-700/60 hover:bg-indigo-700 text-white flex items-center justify-center font-bold text-sm transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={confirmBooking} className="p-5 space-y-4">
              {bookingError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-medium rounded-lg">{bookingError}</div>
              )}
              {bookingSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{bookingSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Target Service Business
                </label>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>{targetProvider.businessName}</span>
                  <span className="text-indigo-600 font-bold font-mono">₹{targetProvider.price}/hour</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5Packed">
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Start Time Slot
                  </label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="08:00 AM IST">08:00 AM IST</option>
                    <option value="10:00 AM IST">10:00 AM IST</option>
                    <option value="11:30 AM IST">11:30 AM IST</option>
                    <option value="01:00 PM IST">01:00 PM IST</option>
                    <option value="02:30 PM IST">02:30 PM IST</option>
                    <option value="04:00 PM IST">04:00 PM IST</option>
                    <option value="05:30 PM IST">05:30 PM IST</option>
                    <option value="06:00 PM IST">06:00 PM IST</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Treatment / Session Requirements
                </label>
                <textarea
                  placeholder="e.g. Please specify details, concerns or preferences for the provider..."
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition"
                >
                  Request Booking
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
