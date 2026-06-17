import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  LogOut, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Briefcase, 
  User as UserIcon, 
  ShieldCheck,
  TrendingUp,
  Inbox,
  Award,
  Plus,
  List,
  Tag
} from 'lucide-react';
import { User, Booking, Service } from '../types';

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Tab/Active Section tracking
  const [activeSection, setActiveSection] = useState<'bookings' | 'services' | 'add-service'>('bookings');
  
  // Custom Services state
  const [services, setServices] = useState<Service[]>([]);

  // Add Service Form fields
  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Home Services');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // Earnings estimation details
  const [hourlyRate, setHourlyRate] = useState<number>(500);

  // Authentication check & Data retrieval
  useEffect(() => {
    const userStr = localStorage.getItem('bookease_current_user');
    if (!userStr) {
      navigate('/');
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr) as User;
      if (parsedUser.role !== 'provider') {
        // Not a provider, redirect to login
        navigate('/');
        return;
      }
      setCurrentUser(parsedUser);
      loadAllBookings(parsedUser.email);
      loadServices(parsedUser.email);
    } catch (e) {
      localStorage.removeItem('bookease_current_user');
      navigate('/');
    }
  }, [navigate]);

  const loadServices = (providerEmail: string) => {
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
    
    // Filter services for the currently logged-in provider
    const myServicesList = loadedServices.filter(s => s.providerEmail.toLowerCase() === providerEmail.toLowerCase());
    setServices(myServicesList);
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!serviceName.trim() || !description.trim() || !category.trim() || !price || !duration.trim()) {
      setFormError('Please fill out all fields correctly.');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Please enter a valid price in INR (minimum ₹1).');
      return;
    }

    if (!currentUser) {
      setFormError('Authentication required to save service.');
      return;
    }

    // Create the new service record
    const newService: Service = {
      id: 'srv-' + Date.now(),
      providerEmail: currentUser.email,
      providerName: currentUser.name,
      businessName: currentUser.businessName || 'Elite Services Ltd',
      serviceName: serviceName.trim(),
      description: description.trim(),
      category: category.trim(),
      price: priceNum,
      duration: duration.trim(),
    };

    try {
      const currentServicesStr = localStorage.getItem('bookease_services') || '[]';
      const existingList = JSON.parse(currentServicesStr) as Service[];
      const updatedList = [...existingList, newService];
      localStorage.setItem('bookease_services', JSON.stringify(updatedList));

      setFormSuccess('Service successfully registered!');
      
      // Update internal state
      setServices(updatedList.filter(s => s.providerEmail.toLowerCase() === currentUser.email.toLowerCase()));
      
      // Shift tab back into the services tab after short time delay
      setTimeout(() => {
        setServiceName('');
        setDescription('');
        setCategory('Home Services');
        setPrice('');
        setDuration('');
        setFormSuccess('');
        setActiveSection('services');
      }, 1200);

    } catch (e) {
      setFormError('Local storage writing error. Please try again.');
    }
  };

  const loadAllBookings = (providerEmail: string) => {
    // 1. Get base hourly rate from registered users list
    const allUsersStr = localStorage.getItem('bookease_users') || '[]';
    try {
      const allUsers = JSON.parse(allUsersStr);
      const userRecord = allUsers.find((u: any) => u.email.toLowerCase() === providerEmail.toLowerCase());
      if (userRecord && userRecord.price) {
        setHourlyRate(parseFloat(userRecord.price) || 500);
      }
    } catch (e) {
      console.error('Error loading hourly rate', e);
    }

    // 2. Load incoming bookings
    const bookingsStr = localStorage.getItem('bookease_bookings') || '[]';
    try {
      const allBookings = JSON.parse(bookingsStr) as Booking[];
      const filtered = allBookings.filter(b => b.providerEmail.toLowerCase() === providerEmail.toLowerCase());
      setBookings(filtered);
    } catch (e) {
      console.error('Error loading bookings', e);
    }
  };

  // LOGOUT CALL (Requirement 1 & 2 & 3)
  const handleLogout = () => {
    // 1. Remove user from localStorage
    localStorage.removeItem('bookease_current_user');

    // 2. Redirect to home page (/) using navigate()
    navigate('/');
  };

  // Handle Booking Status Updates (Accept / Decline / Complete)
  const updateBookingStatus = (bookingId: string, newStatus: Booking['status']) => {
    const allBookingsStr = localStorage.getItem('bookease_bookings') || '[]';
    try {
      const allBookings = JSON.parse(allBookingsStr) as Booking[];
      const updatedList = allBookings.map(b => {
        if (b.id === bookingId) {
          return { ...b, status: newStatus };
        }
        return b;
      });

      localStorage.setItem('bookease_bookings', JSON.stringify(updatedList));
      
      // Update local state to reflect change instantly
      if (currentUser) {
        setBookings(updatedList.filter(b => b.providerEmail.toLowerCase() === currentUser.email.toLowerCase()));
      }
    } catch (e) {
      console.error('Error saving updated booking status', e);
    }
  };

  // Helper values for calculations
  const pendingCount = bookings.filter(b => b.status === 'pending' || b.status === 'Upcoming').length;
  const activeCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'Accepted').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  
  // Projected Earnings = sum of hourlyRate * completed or active appointments
  const totalEarnings = (completedCount + activeCount) * hourlyRate;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar Container */}
      <nav className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white mr-3">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900">BookEase <span className="text-emerald-600">AI</span></span>
                <span className="ml-2.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-md">Provider Studio</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-800">{currentUser?.name}</span>
                <span className="text-xs text-slate-400 font-mono">{currentUser?.businessName || 'Managing Partner'}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'P'}
              </div>

              {/* LOGOUT BUTTON - Explicit user requirement 1 & 2 */}
              <button
                id="provider_logout_btn"
                onClick={handleLogout}
                className="inline-flex items-center space-x-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 px-3.5 py-2 rounded-xl text-xs font-bold border border-rose-100 transition-all cursor-pointer shadow-3xs"
                title="Log out of BookEase AI Provider System"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Card Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] bg-emerald-500 text-white font-extrabold px-2.5 py-0.5 rounded-full tracking-wider uppercase">
                PARTNER BRAND
              </span>
              <h2 id="provider_brand_title" className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mt-2">
                {currentUser?.businessName || 'Business Studio'}
              </h2>
              <p className="text-sm text-slate-300 mt-1 flex items-center space-x-2">
                <span>Managed by {currentUser?.name}</span>
                <span>•</span>
                <span className="bg-slate-700 px-2 py-0.5 rounded text-xs text-slate-200">Category: {currentUser?.category || 'Professional Services'}</span>
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 shrink-0 w-full md:w-auto">
              <span className="block text-xs uppercase tracking-wider text-slate-400 font-mono">Hourly Billing Rate</span>
              <span className="text-2xl font-black text-emerald-400">₹{hourlyRate.toLocaleString('en-IN')} <span className="text-xs font-medium text-slate-300">/ hour</span></span>
            </div>
          </div>
          {/* Subtle design element */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-2xl -mr-20 -mt-20"></div>
        </div>

        {/* Analytic Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-3xs flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estimated Earnings</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">₹{totalEarnings.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Completed & Confirmed</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
              <span className="text-base font-extrabold">₹</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-3xs flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Completed Sessions</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{completedCount}</span>
              <span className="text-[10px] text-emerald-600 font-medium mt-1 block flex items-center space-x-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Job success 100%</span>
              </span>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
              <Award className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-3xs flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Approved</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{activeCount}</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Scheduled on calendar</span>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <CalendarIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-3xs flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending Requests</span>
              <span className={`text-2xl font-extrabold mt-1 block ${pendingCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>{pendingCount}</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Require approval actions</span>
            </div>
            <div className={`p-3 rounded-lg ${pendingCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'}`}>
              <Inbox className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Earnings Milestone Goals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-3xs flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Milestone Starter</span>
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${totalEarnings >= 12500 ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                {totalEarnings >= 12500 ? 'Achieved' : 'In Progress'}
              </span>
            </div>
            <div className="mt-3.5">
              <span className="text-xl font-bold text-slate-950 block">₹12,500</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Starter target revenue</span>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-3xs flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Milestone Growth</span>
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${totalEarnings >= 25000 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {totalEarnings >= 25000 ? 'Achieved' : 'In Progress'}
              </span>
            </div>
            <div className="mt-3.5">
              <span className="text-xl font-bold text-slate-950 block">₹25,000</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Intermediate target level</span>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-3xs flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Milestone Elite</span>
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${totalEarnings >= 50000 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                {totalEarnings >= 50000 ? 'Achieved' : 'In Progress'}
              </span>
            </div>
            <div className="mt-3.5">
              <span className="text-xl font-bold text-slate-950 block">₹50,000</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Premium agency standard</span>
            </div>
          </div>
        </div>

        {/* Sections Tab Navigator */}
        <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-3xs flex space-x-1">
          <button
            id="tab_active_bookings"
            onClick={() => setActiveSection('bookings')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              activeSection === 'bookings'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Incoming Reservations ({bookings.length})</span>
          </button>
          <button
            id="tab_active_services"
            onClick={() => {
              setActiveSection('services');
              if (currentUser) loadServices(currentUser.email);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              activeSection === 'services'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <List className="w-4 h-4" />
            <span>My Active Services ({services.length})</span>
          </button>
          <button
            id="tab_add_service"
            onClick={() => setActiveSection('add-service')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              activeSection === 'add-service'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Create New Service</span>
          </button>
        </div>

        {/* Dynamic Section rendering */}
        {activeSection === 'bookings' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <span>Incoming Customer Reservation List</span>
              </h3>
              <span className="px-2.5 py-1 text-xs font-semibold font-mono bg-white border border-slate-100 rounded-md shadow-3xs text-slate-500">
                {bookings.length} Record(s) total
              </span>
            </div>

            {bookings.length === 0 ? (
              <div className="p-12 text-center space-y-3.5">
                <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700">Your reservation schedule is currently blank.</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Once registered, clients will select your business name, price scale and book. Real-time updates automatically pop up here!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {[...bookings].reverse().map((b) => (
                  <div key={b.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/30 transition-all">
                    {/* Left Metadata column */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{b.id}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          b.status === 'Upcoming' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          b.status === 'Accepted' || b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          b.status === 'completed' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                          b.status === 'Rejected' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          b.status === 'cancelled' || b.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                          'bg-slate-50 text-slate-700 border border-slate-100'
                        }`}>
                          {b.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Service: <span className="text-slate-800">{b.serviceName}</span></h4>
                        <p className="text-xs text-slate-400 font-medium">Patient / Client Name: <span className="text-indigo-600 font-semibold">{b.customerName}</span> ({b.customerEmail})</p>
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
                        <div className="flex items-center space-x-1.5 ">
                          <CalendarIcon className="w-4 h-4 text-emerald-600" />
                          <span>Date: {b.bookingDate || b.date}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-4 h-4 text-emerald-600" />
                          <span>Time Slot: {b.bookingTime || b.time}</span>
                        </div>
                      </div>

                      {b.notes && (
                        <div className="text-xs text-slate-500 italic bg-amber-50/50 p-2.5 rounded-lg border-l-3 border-amber-300 max-w-xl">
                          <span className="font-semibold text-amber-800 text-[10px] block uppercase not-italic tracking-wider mb-0.5">Customer Message / Pre-reqs</span>
                          "{b.notes}"
                        </div>
                      )}
                    </div>

                    {/* Actions Column */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-center">
                      {(b.status === 'pending' || b.status === 'Upcoming') && (
                        <>
                          <button
                            onClick={() => updateBookingStatus(b.id, 'Accepted')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 shadow-xs cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Accept Booking</span>
                          </button>
                          <button
                            onClick={() => updateBookingStatus(b.id, 'Rejected')}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold text-center transition flex items-center space-x-1 cursor-pointer border border-rose-100"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject Booking</span>
                          </button>
                        </>
                      )}

                      {b.status === 'Accepted' && (
                        <>
                          <span className="text-xs text-slate-500 font-medium mr-2">Accepted</span>
                          <button
                            onClick={() => updateBookingStatus(b.id, 'completed')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 shadow-xs cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Mark Completed</span>
                          </button>
                          <button
                            onClick={() => updateBookingStatus(b.id, 'Cancelled')}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer border border-rose-100"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Cancel Booking</span>
                          </button>
                        </>
                      )}

                      {b.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => updateBookingStatus(b.id, 'completed')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 shadow-xs cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Mark Completed</span>
                          </button>
                          <button
                            onClick={() => updateBookingStatus(b.id, 'Cancelled')}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer border border-rose-100"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Cancel Booking</span>
                          </button>
                        </>
                      )}

                      {b.status === 'completed' && (
                        <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center space-x-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Completed Service</span>
                        </div>
                      )}

                      {b.status === 'Rejected' && (
                        <div className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 flex items-center space-x-1">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Rejected</span>
                        </div>
                      )}

                      {(b.status === 'cancelled' || b.status === 'Cancelled') && (
                        <div className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 flex items-center space-x-1">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancelled</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Services Catalog page */}
        {activeSection === 'services' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center space-x-2">
                <List className="w-5 h-5 text-emerald-600" />
                <span>My Registered Services</span>
              </h3>
              <button
                onClick={() => setActiveSection('add-service')}
                className="inline-flex items-center space-x-1 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100/60 cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Service</span>
              </button>
            </div>

            {services.length === 0 ? (
              <div className="p-12 text-center space-y-3.5">
                <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700">No services available</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You haven't listed any specialized services yet. Click "Add Service" to register custom services with specific pricing and durations.
                </p>
              </div>
            ) : (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((srv) => (
                  <div key={srv.id} className="relative bg-white border border-slate-100 rounded-xl p-5 shadow-3xs hover:shadow-xs transition-all flex flex-col justify-between h-full bg-gradient-to-br from-slate-50/50 to-white">
                    <div>
                      {/* Badge category */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100/50">
                          {srv.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-bold flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{srv.duration}</span>
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">{srv.serviceName}</h4>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">{srv.description}</p>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-slate-100/80 flex justify-between items-center">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">CHARGES</span>
                        <span className="text-sm font-black text-rose-600">₹{srv.price.toLocaleString('en-IN')}</span>
                      </div>
                      <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50/50 px-2 py-1 rounded">
                        Live on catalog
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Service dynamic form */}
        {activeSection === 'add-service' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden max-w-2xl mx-auto">
            <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center space-x-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <span>Create & Publish Custom Service</span>
              </h3>
            </div>

            <form onSubmit={handleAddService} className="p-6 space-y-5">
              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-bold leading-relaxed">
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-bold leading-relaxed">
                  {formSuccess}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Service Title / Offering Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Executive Men's Haircut, Special CBSE Math Prep Class"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Detailed Service Description
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe what customers get in this package, any prerequisites, and quality details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all leading-relaxed"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Category Type
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all"
                  >
                    <option value="Home Services">Home Services</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Tech Consulting">Tech Consulting</option>
                    <option value="Fitness">Fitness</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Cost / Fee (₹ INR)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-xs">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 1500"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Expected Duration
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 45 mins, 2 hours, 1 Month"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3.5">
                <button
                  type="button"
                  onClick={() => {
                    setServiceName('');
                    setDescription('');
                    setCategory('Home Services');
                    setPrice('');
                    setDuration('');
                    setActiveSection('services');
                  }}
                  className="px-4.5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center space-x-2"
                >
                  <Tag className="w-4 h-4" />
                  <span>Publish Service</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
