import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  CheckCircle, 
  ArrowRight,
  Shield,
  Sparkles,
  Users
} from 'lucide-react';
import { User } from '../types';

export default function SignupLogin() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'customer' | 'provider'>('customer');

  // Provider-specific input fields
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('Home Services');
  const [price, setPrice] = useState('500');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initial dummy users and providers data
  useEffect(() => {
    // If user is already logged in, redirect them immediately to their dashboard
    const cachedUser = localStorage.getItem('bookease_current_user');
    if (cachedUser) {
      try {
        const u = JSON.parse(cachedUser) as User;
        if (u.role === 'customer') {
          navigate('/customer-dashboard');
        } else if (u.role === 'provider') {
          navigate('/provider-dashboard');
        }
      } catch (e) {
        localStorage.removeItem('bookease_current_user');
      }
    }

    // Populate initial providers if not present
    const existingUsersStr = localStorage.getItem('bookease_users');
    if (!existingUsersStr) {
      const initialUsers = [
        {
          email: 'customer@bookease.com',
          password: 'password123',
          name: 'Aarav Mehta',
          role: 'customer'
        },
        {
          email: 'anita.salon@bookease.com',
          password: 'password123',
          name: 'Anita Deshmukh',
          role: 'provider',
          businessName: "Anita's Luxury Salon",
          category: 'Home Services',
          price: 300,
          location: 'Andheri West, Mumbai',
          description: 'Expert haircut, luxury hair grooming, hair styling, and beauty sessions at your convenience. Price ₹300.'
        },
        {
          email: 'sparkle.cleaning@bookease.com',
          password: 'password123',
          name: 'Rajesh Kumar',
          role: 'provider',
          businessName: 'Sparkle Cleaners Mumbai',
          category: 'Home Services',
          price: 1500,
          location: 'Bandra, Mumbai',
          description: 'Elite deep home cleaning, sanitization, and eco-friendly carpet washing solution. Price ₹1500.'
        },
        {
          email: 'ayush.tuition@bookease.com',
          password: 'password123',
          name: 'Ayush Gupta',
          role: 'provider',
          businessName: 'Gupta Academic Coaching',
          category: 'Education',
          price: 500,
          location: 'South Delhi, New Delhi',
          description: 'Personalized Mathematics and Physics coaching sessions for school exams and engineering preparation. Price ₹500/class.'
        },
        {
          email: 'aditya.photo@bookease.com',
          password: 'password123',
          name: 'Vikram Aditya',
          role: 'provider',
          businessName: 'Aditya Wedding Photography',
          category: 'Tech Consulting',
          price: 2500,
          location: 'Indiranagar, Bengaluru',
          description: 'Premium portrait shoots, stellar cinematic wedding photography, candid video, and editing sessions. Price ₹2500.'
        },
        {
          email: 'karan.gym@bookease.com',
          password: 'password123',
          name: 'Karan Malhotra',
          role: 'provider',
          businessName: 'Malhotra Fitness & Gym',
          category: 'Fitness',
          price: 1200,
          location: 'Salt Lake, Kolkata',
          description: 'Personal strength training coaching, bodybuilding equipment access, and tailored diet charts. Price ₹1200/month.'
        }
      ];
      localStorage.setItem('bookease_users', JSON.stringify(initialUsers));
    }
  }, [navigate]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in all standard credentials.');
      return;
    }

    const usersStr = localStorage.getItem('bookease_users') || '[]';
    let users = [];
    try {
      users = JSON.parse(usersStr);
    } catch (err) {
      users = [];
    }

    if (isLogin) {
      // Find matching user
      const foundUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!foundUser) {
        setError('Invalid email or password combination.');
        return;
      }

      const activeUser: User = {
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
        businessName: foundUser.businessName,
        category: foundUser.category
      };

      localStorage.setItem('bookease_current_user', JSON.stringify(activeUser));
      setSuccess(`Awesome back! Redirecting as ${foundUser.role}...`);
      
      setTimeout(() => {
        if (foundUser.role === 'customer') {
          navigate('/customer-dashboard');
        } else {
          navigate('/provider-dashboard');
        }
      }, 700);

    } else {
      // Sign up process
      if (!name) {
        setError('Please enter your full name.');
        return;
      }

      const emailExists = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        setError('An account with this email address already exists.');
        return;
      }

      // If signing up as provider, require business details
      if (role === 'provider' && (!businessName || !location || !description)) {
        setError('Providers must fill in their business details so clients can find them!');
        return;
      }

      const newUser: any = {
        email: email.toLowerCase(),
        password,
        name,
        role,
        ...(role === 'provider' && {
          businessName,
          category,
          price: parseFloat(price) || 50,
          location,
          description
        })
      };

      users.push(newUser);
      localStorage.setItem('bookease_users', JSON.stringify(users));

      const activeUser: User = {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        businessName: newUser.businessName,
        category: newUser.category
      };

      localStorage.setItem('bookease_current_user', JSON.stringify(activeUser));
      setSuccess('Account created successfully! Logging you in...');

      setTimeout(() => {
        if (role === 'customer') {
          navigate('/customer-dashboard');
        } else {
          navigate('/provider-dashboard');
        }
      }, 750);
    }
  };

  // Pre-fill fields for easy evaluation demo
  const fillDemoCredentials = (roleType: 'customer' | 'provider') => {
    setError('');
    setIsLogin(true);
    if (roleType === 'customer') {
      setEmail('customer@bookease.com');
      setPassword('password123');
    } else {
      setEmail('ayush.tuition@bookease.com');
      setPassword('password123');
    }
  };

  return (
    <div id="auth_container" className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Banner Header */}
      <header className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-xs">
        <div id="logo_element" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Calendar className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">BookEase <span className="text-indigo-600">AI</span></h1>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">SMART SCHEDULING</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>Secure Encrypted Logins</span>
        </div>
      </header>

      {/* Main Form Center Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Interactive Column (Intro to the system) */}
        <div className="col-span-1 lg:col-span-6 space-y-6 lg:space-y-8 pr-0 lg:pr-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-3.5 py-1.5 rounded-full text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Effortless Appointments, Reimagined</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight"
          >
            Connect, Book, & Manage <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-800">
              Services in Seconds
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base text-slate-600 leading-relaxed"
          >
            BookEase AI provides a seamless ecosystem for Service Customers to discover professionals, 
            and Service Providers to optimize their calendar, scale appointments, and focus on delivering excellent quality.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2"
          >
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-start space-x-3">
              <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">For Customers</h4>
                <p className="text-xs text-slate-500 mt-0.5">Find elite services, select availability slots, track actions, and book with ease.</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-start space-x-3">
              <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">For Providers</h4>
                <p className="text-xs text-slate-500 mt-0.5">Organize bookings, highlight descriptions, establish dynamic prices, and log out securely.</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Demo Assist Panels */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="bg-slate-100 p-4 rounded-xl border border-slate-200"
          >
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">⚡ One-Click Evaluator Tool</span>
            <div className="mt-2.5 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => fillDemoCredentials('customer')}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-400 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition flex items-center space-x-1.5 shadow-2xs"
              >
                <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                <span>Load Demo Customer</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('provider')}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-400 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition flex items-center space-x-1.5 shadow-2xs"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span>Load Demo Provider</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Authentication Form Column */}
        <div className="col-span-1 lg:col-span-6 w-full max-w-md mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-100"
          >
            {/* Form Mode Toggle Header */}
            <div className="flex border-b border-slate-100 pb-5 mb-6">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
                className={`flex-1 text-center pb-3 text-sm font-semibold transition relative ${
                  isLogin ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Sign In
                {isLogin && (
                  <motion.div 
                    layoutId="activeBorder" 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" 
                  />
                )}
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
                className={`flex-1 text-center pb-3 text-sm font-semibold transition relative ${
                  !isLogin ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Register
                {!isLogin && (
                  <motion.div 
                    layoutId="activeBorder" 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" 
                  />
                )}
              </button>
            </div>

            {/* Error & Success Toast alerts */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-xs font-medium text-red-700"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg text-xs font-medium text-emerald-700 flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{success}</span>
              </motion.div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {/* Conditional Signup Full Name */}
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Standard Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Secure Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex justify-between">
                  <span>Secret Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Custom Sign-up role Selector and Details */}
              {!isLogin && (
                <>
                  <div>
                    <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Account Type (My Role)
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole('customer')}
                        className={`py-2 px-3 border rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                          role === 'customer'
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>I am a Client</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('provider')}
                        className={`py-2 px-3 border rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                          role === 'provider'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>I am a Provider</span>
                      </button>
                    </div>
                  </div>

                  {/* Provider Details expansion */}
                  {role === 'provider' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3 pt-2 pl-3 border-l-2 border-emerald-300"
                    >
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Business or Studio Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Apex Wellness"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs focus:outline-hidden focus:border-emerald-500 font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Service Category
                          </label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs focus:outline-hidden focus:border-emerald-500 font-medium"
                          >
                            <option value="Home Services">Home Services</option>
                            <option value="Healthcare">Healthcare</option>
                            <option value="Fitness">Fitness</option>
                            <option value="Education">Education</option>
                            <option value="Tech Consulting">Tech Consulting</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Base Hourly Rate (₹)
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-1.5 flex items-center text-slate-400 text-xs">₹</span>
                            <input
                              type="number"
                              required
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                              className="w-full pl-4.5 pr-2 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs focus:outline-hidden focus:border-emerald-500 font-medium"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Location or Remote Url
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Connaught Place, New Delhi & Remote"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs focus:outline-hidden focus:border-emerald-500 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Brief Service Bio / Description
                        </label>
                        <textarea
                          placeholder="Tell clients details about your services..."
                          rows={2}
                          required
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs focus:outline-hidden focus:border-emerald-500 font-medium resize-none"
                        />
                      </div>
                    </motion.div>
                  )}
                </>
              )}

              {/* Submit Trigger Action Button */}
              <button
                type="submit"
                className={`w-full py-2.5 px-4 rounded-xl text-white text-sm font-semibold transition-all flex items-center justify-center space-x-2 focus:ring-3 ${
                  role === 'provider' && !isLogin
                    ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500/20 shadow-md shadow-emerald-100'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500/20 shadow-md shadow-indigo-100'
                }`}
              >
                <span>{isLogin ? 'Sign In to Dashboard' : 'Complete Registration'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-slate-400">
              {isLogin ? "Don't have an account?" : "Already registered as a member?"}{' '}
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
                className="font-bold text-indigo-600 hover:text-indigo-800 transition underline decoration-1"
              >
                {isLogin ? 'Create free account' : 'Log in here'}
              </button>
            </p>
          </motion.div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="py-4 text-center border-t border-slate-100 bg-white text-xs text-slate-400">
        <p>© 2026 BookEase AI. Crafted with Absolute Responsive UI Standards.</p>
      </footer>
    </div>
  );
}
