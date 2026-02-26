// ============================================================
// MileVaahan - Firebase Configuration
// Replace with your actual Firebase project credentials
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyA1KpQVpcudOUixBidVhaYR7xsTqxyQGV8",
  authDomain: "milevaahan.firebaseapp.com",
  projectId: "milevaahan",
  storageBucket: "milevaahan.firebasestorage.app",
  messagingSenderId: "733890442016",
  appId: "1:733890442016:web:32f11624810c0487c65d45",
  measurementId: "G-9KC0MJ2Z4Y"
};

// Initialize Firebase
try { firebase.initializeApp(firebaseConfig); } catch(e) {}

// Services
const auth = firebase.auth();
const db = firebase.firestore();
let storage, analytics;
try { storage = firebase.storage(); } catch(e) {}
try { analytics = firebase.analytics(); } catch(e) {}

// Firestore Settings (deprecated in newer SDK, skip silently)
try { db.settings({ timestampsInSnapshots: true }); } catch(e) {}

// ============================================================
// ROLES
// ============================================================
const ROLES = {
  BUYER: 'buyer',
  DEALER: 'dealer',
  SUPER_ADMIN: 'super_admin'
};

// ============================================================
// COLLECTIONS
// ============================================================
const COLLECTIONS = {
  USERS: 'users',
  DEALERS: 'dealers',
  LISTINGS: 'listings',
  PARTS: 'parts',
  SUBSCRIPTIONS: 'subscriptions',
  MESSAGES: 'messages',
  REVIEWS: 'reviews',
  BLOGS: 'blogs',
  SEO_SETTINGS: 'seo_settings',
  FEATURED_SLOTS: 'featured_slots',
  INQUIRIES: 'inquiries',
  NOTIFICATIONS: 'notifications',
  ANALYTICS: 'analytics_events'
};

// ============================================================
// SUBSCRIPTION PLANS (INR)
// ============================================================
const SUBSCRIPTION_PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 1999,
    yearlyPrice: 19990,
    listings: 10,
    featured: 0,
    analytics: false,
    priority_support: false,
    verified_badge: false,
    whatsapp_leads: false,
    color: '#6B7280',
    features: [
      '10 Active Listings',
      'Basic Dealer Profile',
      'Email Inquiries',
      'Standard Search Placement'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 4999,
    yearlyPrice: 49990,
    listings: 50,
    featured: 3,
    analytics: true,
    priority_support: false,
    verified_badge: true,
    whatsapp_leads: true,
    color: '#0D9488',
    features: [
      '50 Active Listings',
      '3 Featured Listings/month',
      'Verified Dealer Badge',
      'WhatsApp Lead Integration',
      'Analytics Dashboard',
      'Priority Search Placement'
    ]
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 9999,
    yearlyPrice: 99990,
    listings: -1, // unlimited
    featured: 10,
    analytics: true,
    priority_support: true,
    verified_badge: true,
    whatsapp_leads: true,
    color: '#B8860B',
    features: [
      'Unlimited Listings',
      '10 Featured Listings/month',
      'Verified Dealer Badge',
      'WhatsApp Lead Integration',
      'Advanced Analytics',
      'Priority Support',
      'Top Search Placement',
      'Homepage Banner Slot'
    ]
  }
};

// ============================================================
// CAR DATA - Makes, Models, Years
// ============================================================
const CAR_DATA = {
  makes: {
    "Maruti Suzuki": ["Alto", "Swift", "Dzire", "Baleno", "Brezza", "Ertiga", "XL6", "Ciaz", "Wagon R", "Celerio", "Ignis", "S-Cross", "Grand Vitara", "Jimny", "Fronx", "Invicto"],
    "Hyundai": ["i10", "i20", "Aura", "Verna", "Creta", "Venue", "Tucson", "Alcazar", "Exter", "Ioniq 5", "Kona Electric"],
    "Tata": ["Tiago", "Tigor", "Altroz", "Nexon", "Harrier", "Safari", "Punch", "Curvv", "Avinya", "Sierra", "Nexon EV", "Tiago EV"],
    "Mahindra": ["Thar", "Scorpio", "Scorpio-N", "XUV700", "XUV300", "XUV400", "Bolero", "Marazzo", "BE 6e", "XEV 9e"],
    "Honda": ["Amaze", "City", "Elevate", "Jazz", "WR-V"],
    "Toyota": ["Glanza", "Urban Cruiser Hyryder", "Innova Crysta", "Innova HyCross", "Fortuner", "Hilux", "Camry", "Vellfire"],
    "Kia": ["Seltos", "Sonet", "Carens", "EV6", "EV9"],
    "Skoda": ["Kushaq", "Slavia", "Octavia", "Superb", "Kodiaq", "Karoq"],
    "Volkswagen": ["Polo", "Vento", "Taigun", "Virtus", "Tiguan"],
    "MG": ["Hector", "Astor", "Gloster", "ZS EV", "Comet EV", "Windsor EV"],
    "Renault": ["Kwid", "Triber", "Kiger"],
    "Nissan": ["Magnite", "Kicks"],
    "Ford": ["EcoSport", "Endeavour", "Figo", "Aspire"],
    "Jeep": ["Compass", "Wrangler", "Grand Cherokee", "Meridian"],
    "BMW": ["3 Series", "5 Series", "7 Series", "X1", "X3", "X5", "X7", "iX", "i4", "M3", "M5"],
    "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "S-Class", "GLA", "GLC", "GLE", "GLS", "EQS", "AMG GT"],
    "Audi": ["A4", "A6", "A8", "Q3", "Q5", "Q7", "Q8", "e-tron", "RS7"],
    "Volvo": ["XC40", "XC60", "XC90", "S60", "S90"],
    "Porsche": ["911", "Cayenne", "Macan", "Panamera", "Taycan"],
    "Land Rover": ["Defender", "Discovery", "Range Rover", "Range Rover Sport", "Freelander"],
    "Lamborghini": ["Urus", "Huracan", "Revuelto"],
    "Ferrari": ["Roma", "Portofino", "SF90", "296 GTB"],
    "Rolls-Royce": ["Ghost", "Phantom", "Cullinan", "Spectre"],
    "Bentley": ["Bentayga", "Continental GT", "Flying Spur"]
  },
  fuelTypes: ["Petrol", "Diesel", "CNG", "Electric", "Hybrid", "Mild Hybrid", "LPG"],
  transmissions: ["Manual", "Automatic", "AMT", "CVT", "DCT", "IMT"],
  bodyTypes: ["Sedan", "Hatchback", "SUV", "MUV/MPV", "Coupe", "Convertible", "Pickup Truck", "Van"],
  colors: ["White", "Black", "Silver", "Grey", "Red", "Blue", "Brown", "Green", "Yellow", "Orange", "Maroon", "Gold", "Beige"],
  conditions: ["New", "Used", "Certified Pre-Owned"],
  ownerTypes: ["1st Owner", "2nd Owner", "3rd Owner", "4th Owner or More"]
};

// Generate years from 1990 to current
const currentYear = new Date().getFullYear();
CAR_DATA.years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);

// ============================================================
// INDIAN STATES & CITIES
// ============================================================
const INDIA_LOCATIONS = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool"],
  "Delhi": ["New Delhi", "Dwarka", "Rohini", "Noida", "Gurgaon"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
  "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
  "Uttar Pradesh": ["Lucknow", "Agra", "Kanpur", "Varanasi", "Prayagraj", "Noida", "Ghaziabad"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
  "Punjab": ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala"],
  "Haryana": ["Gurgaon", "Faridabad", "Rohtak", "Panipat", "Ambala"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain"],
  "Bihar": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Rishikesh"],
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamsala", "Solan"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa"]
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function formatPrice(amount) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

function formatKm(km) {
  return `${parseInt(km).toLocaleString('en-IN')} km`;
}

function timeAgo(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diff = (Date.now() - date) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function generateSlug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function generateListingSlug(listing) {
  return `${generateSlug(listing.year + '-' + listing.make + '-' + listing.model + '-' + listing.city)}-${listing.id?.slice(-6)}`;
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-6 right-6 z-50 px-6 py-3 rounded-xl shadow-2xl text-white font-semibold transition-all duration-300 transform translate-y-0 opacity-100`;
  toast.style.cssText = type === 'success'
    ? 'background: linear-gradient(135deg, #0D9488, #0891B2);'
    : type === 'error'
    ? 'background: linear-gradient(135deg, #DC2626, #991B1B);'
    : 'background: linear-gradient(135deg, #B8860B, #D4A017);';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(20px)'; }, 3000);
  setTimeout(() => toast.remove(), 3500);
}

function showLoader(show = true) {
  const loader = document.getElementById('global-loader');
  if (loader) loader.style.display = show ? 'flex' : 'none';
}

// Auth state helper
function getCurrentUser() {
  return auth.currentUser;
}

async function getUserRole(uid) {
  try {
    const doc = await db.collection(COLLECTIONS.USERS).doc(uid).get();
    return doc.exists ? doc.data().role : null;
  } catch (e) {
    return null;
  }
}

async function requireAuth(redirectTo = '/pages/login.html') {
  return new Promise((resolve, reject) => {
    auth.onAuthStateChanged(async (user) => {
      if (user) resolve(user);
      else { window.location.href = redirectTo; reject(); }
    });
  });
}

async function requireRole(role, redirectTo = '/index.html') {
  const user = await requireAuth();
  const userRole = await getUserRole(user.uid);
  if (userRole !== role) { window.location.href = redirectTo; throw new Error('Unauthorized'); }
  return { user, role: userRole };
}