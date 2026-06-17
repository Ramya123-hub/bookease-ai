export interface User {
  email: string;
  name: string;
  role: 'customer' | 'provider';
  businessName?: string;
  category?: string;
}

export interface Booking {
  id: string;
  customerEmail: string;
  customerName: string;
  providerEmail: string;
  providerName: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'Upcoming' | 'Cancelled' | 'Accepted' | 'Rejected';
  notes?: string;
}

export interface Service {
  id: string;
  providerEmail: string;
  providerName: string;
  businessName: string;
  serviceName: string;
  description: string;
  category: string;
  price: number; // in INR
  duration: string; // e.g. "60 min", "2 hours"
}

export interface ServiceProvider {
  email: string;
  name: string;
  businessName: string;
  category: string;
  rating: number;
  price: number;
  location: string;
  description: string;
  image?: string;
}
