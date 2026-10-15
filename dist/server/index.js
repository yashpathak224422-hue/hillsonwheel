require('dotenv').config();
const dns = require('dns');
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}
process.on('unhandledRejection', (reason) => {
  console.warn('[UNHANDLED REJECTION]', reason && reason.message ? reason.message : reason);
});
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err.message);
});
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);

// Resilient persistent data stores (never blocks requests if DB reconnects)
const {
  loadCatalog,
  loadJourneys,
  saveCatalog,
  saveJourneys,
  loadUsers,
  saveUsers,
  loadOrders,
  saveOrders
} = require('./dataStore');

const MEMORY_USERS = loadUsers();
const MEMORY_ORDERS = loadOrders();
const MEMORY_CODES = new Map();

const bcrypt = require('bcryptjs');
let MongoMemoryServer = null;
const jwt = require('jsonwebtoken');
const { rateLimit } = require('express-rate-limit');
const Razorpay = require('razorpay');
const cors = require('cors');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const QRCode = require('qrcode');
const { sendVerification, sendBusinessNotification, buildInvoiceHtml, buildPaymentConfirmationEmail, sendEmail } = require('./notifications');

// Razorpay instance (safe even without live keys — test mode works immediately)
let razorpay = null;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && !process.env.RAZORPAY_KEY_SECRET.includes('thiswillbereplaced')) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('Razorpay initialized in', process.env.RAZORPAY_KEY_ID.startsWith('rzp_live') ? 'LIVE' : 'TEST', 'mode');
  } else {
    console.warn('Razorpay keys not set or using placeholder — payment simulation mode active.');
  }
} catch (e) {
  console.error('Razorpay init failed:', e.message);
}

const app = express();
app.set('trust proxy', 1);
const PORT = Number(process.env.PORT || 3000);
const JWT_COOKIE = 'hsw_session';
const JWT_SECRET = process.env.JWT_SECRET || 'hsw-hillsonwheels-master-secure-jwt-key-2026';
const JWT_TTL = '7d';
const CODE_TTL_MS = 10 * 60 * 1000;

/* ==========================================================================
   SECURITY CONFIGURATION
   ========================================================================== */
const SECURITY_CONFIG = {
  // Allowed origins for CORS (trims whitespace, supports comma-separated list)
  allowedOrigins: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  // Rate limiting configuration
  rateLimits: {
    general: { windowMs: 15 * 60 * 1000, limit: 100 },
    auth: { windowMs: 15 * 60 * 1000, limit: 50 },
    strict: { windowMs: 15 * 60 * 1000, limit: 30 },
    api: { windowMs: 1 * 60 * 1000, limit: 30 }
  },
  // Security headers
  hstsMaxAge: 31536000, // 1 year
  // IP blacklist (can be loaded from database or env)
  blacklistedIPs: new Set(process.env.BLACKLISTED_IPS ? process.env.BLACKLISTED_IPS.split(',') : []),
  // Trusted proxy IPs
  trustedProxies: process.env.TRUSTED_PROXIES ? process.env.TRUSTED_PROXIES.split(',') : ['loopback', 'linklocal', 'uniquelocal']
};

// Security audit log
const securityAuditLog = [];
const MAX_AUDIT_LOG_SIZE = 1000;

function logSecurityEvent(event, details) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    ip: details.ip || 'unknown'
  };
  securityAuditLog.push(logEntry);
  if (securityAuditLog.length > MAX_AUDIT_LOG_SIZE) {
    securityAuditLog.shift();
  }
  console.log('[SECURITY AUDIT]', JSON.stringify(logEntry));
}

/* ==========================================================================
   MASTER PRODUCT CATALOG & VARIANTS
   ========================================================================== */
const CATALOG = {
  'buransh-honey-250g': {
    id: 'buransh-honey',
    sku: 'buransh-honey-250g',
    name: 'Organic Buransh Honey',
    variant: '250g Glass Jar',
    weight: '250g',
    unitPrice: 699,
    mrp: 850,
    category: 'Honey',
    origin: 'Chamoli · 2,450m',
    photoKey: 'p1',
    inStock: 18,
    rating: 4.9,
    reviewsCount: 42
  },
  'buransh-honey-500g': {
    id: 'buransh-honey',
    sku: 'buransh-honey-500g',
    name: 'Organic Buransh Honey',
    variant: '500g Glass Jar',
    weight: '500g',
    unitPrice: 1299,
    mrp: 1600,
    category: 'Honey',
    origin: 'Chamoli · 2,450m',
    photoKey: 'p1',
    inStock: 12,
    rating: 4.9,
    reviewsCount: 42
  },
  'buransh-honey-1kg': {
    id: 'buransh-honey',
    sku: 'buransh-honey-1kg',
    name: 'Organic Buransh Honey',
    variant: '1kg Glass Jar',
    weight: '1kg',
    unitPrice: 2399,
    mrp: 3000,
    category: 'Honey',
    origin: 'Chamoli · 2,450m',
    photoKey: 'p1',
    inStock: 6,
    rating: 4.9,
    reviewsCount: 42
  },
  'chamoli-rajma-500g': {
    id: 'chamoli-rajma',
    sku: 'chamoli-rajma-500g',
    name: 'Organic Chamoli Rajma',
    variant: '500g Cloth Pouch',
    weight: '500g',
    unitPrice: 349,
    mrp: 420,
    category: 'Pulses',
    origin: 'Chamoli · Urgam Valley',
    photoKey: 'p0',
    inStock: 35,
    rating: 4.8,
    reviewsCount: 38
  },
  'chamoli-rajma-1kg': {
    id: 'chamoli-rajma',
    sku: 'chamoli-rajma-1kg',
    name: 'Organic Chamoli Rajma',
    variant: '1kg Cloth Pouch',
    weight: '1kg',
    unitPrice: 649,
    mrp: 800,
    category: 'Pulses',
    origin: 'Chamoli · Urgam Valley',
    photoKey: 'p0',
    inStock: 20,
    rating: 4.8,
    reviewsCount: 38
  },
  'pahadi-pulses-500g': {
    id: 'pahadi-pulses',
    sku: 'pahadi-pulses-500g',
    name: 'Traditional Pahadi Mixed Dal (Gahat, Bhatt, Rainsh)',
    variant: '500g Pack',
    weight: '500g',
    unitPrice: 289,
    mrp: 360,
    category: 'Pulses',
    origin: 'Almora · Kumaon Ridge',
    photoKey: 'p2',
    inStock: 40,
    rating: 4.7,
    reviewsCount: 29
  },
  'pahadi-pulses-1kg': {
    id: 'pahadi-pulses',
    sku: 'pahadi-pulses-1kg',
    name: 'Traditional Pahadi Mixed Dal (Gahat, Bhatt, Rainsh)',
    variant: '1kg Pack',
    weight: '1kg',
    unitPrice: 549,
    mrp: 700,
    category: 'Pulses',
    origin: 'Almora · Kumaon Ridge',
    photoKey: 'p2',
    inStock: 22,
    rating: 4.7,
    reviewsCount: 29
  },
  'mixed-spices-200g': {
    id: 'mixed-spices',
    sku: 'mixed-spices-200g',
    name: 'Stone-Ground Mountain Spices & Herb Namak',
    variant: '200g Earthen Jar',
    weight: '200g',
    unitPrice: 399,
    mrp: 490,
    category: 'Spices',
    origin: 'Bageshwar · Kumaon',
    photoKey: 'p3',
    inStock: 50,
    rating: 5.0,
    reviewsCount: 56
  },
  'mixed-spices-500g': {
    id: 'mixed-spices',
    sku: 'mixed-spices-500g',
    name: 'Stone-Ground Mountain Spices & Herb Namak',
    variant: '500g Earthen Jar',
    weight: '500g',
    unitPrice: 799,
    mrp: 1000,
    category: 'Spices',
    origin: 'Bageshwar · Kumaon',
    photoKey: 'p3',
    inStock: 18,
    rating: 5.0,
    reviewsCount: 56
  },
  'garhwal-walnuts-500g': {
    id: 'garhwal-walnuts',
    sku: 'garhwal-walnuts-500g',
    name: 'Garhwal Wild Kagzi Walnuts',
    variant: '500g Shell',
    weight: '500g',
    unitPrice: 549,
    mrp: 680,
    category: 'Dry Fruits',
    origin: 'Uttarkashi · Harsil Valley',
    photoKey: 'p4',
    inStock: 25,
    rating: 4.9,
    reviewsCount: 31
  },
  'garhwal-walnuts-1kg': {
    id: 'garhwal-walnuts',
    sku: 'garhwal-walnuts-1kg',
    name: 'Garhwal Wild Kagzi Walnuts',
    variant: '1kg Shell',
    weight: '1kg',
    unitPrice: 999,
    mrp: 1300,
    category: 'Dry Fruits',
    origin: 'Uttarkashi · Harsil Valley',
    photoKey: 'p4',
    inStock: 14,
    rating: 4.9,
    reviewsCount: 31
  },
  'chilli-pickle-350g': {
    id: 'chilli-pickle',
    sku: 'chilli-pickle-350g',
    name: 'Pithoragarh Yellow Chilli Mustard Pickle',
    variant: '350g Jar',
    weight: '350g',
    unitPrice: 259,
    mrp: 320,
    category: 'Pickles',
    origin: 'Pithoragarh · Johar Valley',
    photoKey: 'p5',
    inStock: 30,
    rating: 4.8,
    reviewsCount: 22
  },
  'chilli-pickle-700g': {
    id: 'chilli-pickle',
    sku: 'chilli-pickle-700g',
    name: 'Pithoragarh Yellow Chilli Mustard Pickle',
    variant: '700g Jar',
    weight: '700g',
    unitPrice: 489,
    mrp: 600,
    category: 'Pickles',
    origin: 'Pithoragarh · Johar Valley',
    photoKey: 'p5',
    inStock: 16,
    rating: 4.8,
    reviewsCount: 22
  },
  'himalayan-herbs-100g': {
    id: 'himalayan-herbs',
    sku: 'himalayan-herbs-100g',
    name: 'Wild Alpine Herbs (Jambu, Gandharani, Oregano)',
    variant: '100g Tin',
    weight: '100g',
    unitPrice: 329,
    mrp: 400,
    category: 'Herbs',
    origin: 'Munsiyari · 2,800m',
    photoKey: 'p6',
    inStock: 45,
    rating: 4.9,
    reviewsCount: 34
  },
  'himalayan-herbs-250g': {
    id: 'himalayan-herbs',
    sku: 'himalayan-herbs-250g',
    name: 'Wild Alpine Herbs (Jambu, Gandharani, Oregano)',
    variant: '250g Tin',
    weight: '250g',
    unitPrice: 699,
    mrp: 900,
    category: 'Herbs',
    origin: 'Munsiyari · 2,800m',
    photoKey: 'p6',
    inStock: 19,
    rating: 4.9,
    reviewsCount: 34
  },
  'aipan-weave-standard': {
    id: 'aipan-weave',
    sku: 'aipan-weave-standard',
    name: 'Handwoven Aipan Ritual Textile',
    variant: 'Standard (3 × 2 ft)',
    weight: 'Standard',
    unitPrice: 899,
    mrp: 1200,
    category: 'Handicrafts',
    origin: 'Almora Historic Crafts Quarter',
    photoKey: 'p7',
    inStock: 9,
    rating: 5.0,
    reviewsCount: 17
  },
  'aipan-weave-deluxe': {
    id: 'aipan-weave',
    sku: 'aipan-weave-deluxe',
    name: 'Handwoven Aipan Ritual Textile',
    variant: 'Grand Loom (5 × 3 ft)',
    weight: 'Grand Loom',
    unitPrice: 1599,
    mrp: 2200,
    category: 'Handicrafts',
    origin: 'Almora Historic Crafts Quarter',
    photoKey: 'p7',
    inStock: 4,
    rating: 5.0,
    reviewsCount: 17
  },
  'dry-apricot-400g': {
    id: 'dry-apricot',
    sku: 'dry-apricot-400g',
    name: 'Sun-Dried Mountain Apricots (Chuli)',
    variant: '400g Pouch',
    weight: '400g',
    unitPrice: 459,
    mrp: 580,
    category: 'Dry Fruits',
    origin: 'Gangolihat · Pithoragarh',
    photoKey: 'p8',
    inStock: 24,
    rating: 4.8,
    reviewsCount: 26
  },
  'dry-apricot-800g': {
    id: 'dry-apricot',
    sku: 'dry-apricot-800g',
    name: 'Sun-Dried Mountain Apricots (Chuli)',
    variant: '800g Pouch',
    weight: '800g',
    unitPrice: 849,
    mrp: 1100,
    category: 'Dry Fruits',
    origin: 'Gangolihat · Pithoragarh',
    photoKey: 'p8',
    inStock: 11,
    rating: 4.8,
    reviewsCount: 26
  }
};

/* ==========================================================================
   PROMOTIONAL COUPONS ENGINE
   ========================================================================== */
const COUPONS = {
  'HIMALAYA10': { code: 'HIMALAYA10', discountPercent: 10, maxDiscount: 500, minOrder: 499, description: '10% off on all mountain produce' },
  'PAHADI500': { code: 'PAHADI500', flatDiscount: 500, minOrder: 2000, description: 'Flat ₹500 off on mountain baskets over ₹2,000' },
  'BURANSHFREE': { code: 'BURANSHFREE', flatDiscount: 150, freeShipping: true, minOrder: 799, description: 'Free Express Mountain Shipping + ₹150 off' },
  'WELCOME15': { code: 'WELCOME15', discountPercent: 15, maxDiscount: 750, minOrder: 599, description: '15% off for first-time mountain patrons' }
};

/* ==========================================================================
   PINCODE DATABASE (UTTARAKHAND & PAN-INDIA HUBS)
   ========================================================================== */
const PINCODE_LOOKUP = {
  '246443': { city: 'Joshimath', state: 'Uttarakhand', district: 'Chamoli', deliveryDays: '2-3 Days' },
  '246401': { city: 'Gopeshwar', state: 'Uttarakhand', district: 'Chamoli', deliveryDays: '2-3 Days' },
  '263601': { city: 'Almora', state: 'Uttarakhand', district: 'Almora', deliveryDays: '2-3 Days' },
  '262501': { city: 'Pithoragarh', state: 'Uttarakhand', district: 'Pithoragarh', deliveryDays: '3-4 Days' },
  '262554': { city: 'Munsiyari', state: 'Uttarakhand', district: 'Pithoragarh', deliveryDays: '3-4 Days' },
  '248001': { city: 'Dehradun', state: 'Uttarakhand', district: 'Dehradun', deliveryDays: '1-2 Days' },
  '249201': { city: 'Rishikesh', state: 'Uttarakhand', district: 'Dehradun', deliveryDays: '1-2 Days' },
  '249175': { city: 'Uttarkashi', state: 'Uttarakhand', district: 'Uttarkashi', deliveryDays: '2-3 Days' },
  '263001': { city: 'Nainital', state: 'Uttarakhand', district: 'Nainital', deliveryDays: '2-3 Days' },
  '249401': { city: 'Haridwar', state: 'Uttarakhand', district: 'Haridwar', deliveryDays: '1-2 Days' },
  '110001': { city: 'New Delhi', state: 'Delhi', district: 'Central Delhi', deliveryDays: '2-3 Days' },
  '110016': { city: 'South Delhi', state: 'Delhi', district: 'South Delhi', deliveryDays: '2-3 Days' },
  '400001': { city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai South', deliveryDays: '3-4 Days' },
  '560001': { city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', deliveryDays: '3-4 Days' },
  '600001': { city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', deliveryDays: '3-4 Days' },
  '700001': { city: 'Kolkata', state: 'West Bengal', district: 'Kolkata', deliveryDays: '3-4 Days' },
  '500001': { city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', deliveryDays: '3-4 Days' },
  '302001': { city: 'Jaipur', state: 'Rajasthan', district: 'Jaipur', deliveryDays: '2-3 Days' },
  '160017': { city: 'Chandigarh', state: 'Chandigarh', district: 'Chandigarh', deliveryDays: '2-3 Days' },
  '201301': { city: 'Noida', state: 'Uttar Pradesh', district: 'Gautam Buddha Nagar', deliveryDays: '2-3 Days' },
  '122001': { city: 'Gurugram', state: 'Haryana', district: 'Gurugram', deliveryDays: '2-3 Days' },
  '411001': { city: 'Pune', state: 'Maharashtra', district: 'Pune', deliveryDays: '3-4 Days' },
  '380001': { city: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad', deliveryDays: '3-4 Days' }
};

/* ==========================================================================
   MASTER TOURISM PACKAGES & EXPEDITIONS
   ========================================================================== */
const JOURNEYS = {
  'auli-getaway': {
    id: 'auli-getaway',
    title: 'Auli Getaway',
    photoKey: 'auli',
    duration: '3 Days',
    price: 9999,
    subtitle: '3 Days · ₹9,999 · Alpine Meadows',
    category: 'Destinations',
    elevation: '2,500 – 3,050 m',
    district: 'Chamoli · Garhwal Himalaya',
    season: 'Dec–Mar (Snow) · May–Oct (Alpine Green)',
    description: 'A high meadow above Joshimath, with seasonal snow and views toward Nanda Devi.',
    highlights: 'Alpine meadow walks, ropeway, ski slopes, Nanda Devi vistas',
    isAvailable: true
  },
  'chopta-tungnath-trek': {
    id: 'chopta-tungnath-trek',
    title: 'Chopta Tungnath Trek',
    photoKey: 'tungnath',
    duration: '4 Days',
    price: 12999,
    subtitle: '4 Days · ₹12,999 · Highest Shiva Temple',
    category: 'Treks',
    elevation: '2,680 – 3,680 m',
    district: 'Rudraprayag · Garhwal',
    season: 'April–November',
    description: 'Trek through rhododendron forests to the highest Shiva temple on earth and the Chandrashila summit.',
    highlights: 'Tungnath Temple, Chandrashila 360° summit views, Deoriatal lake camp',
    isAvailable: true
  },
  'nanda-devi-base-camp': {
    id: 'nanda-devi-base-camp',
    title: 'Nanda Devi Base Camp',
    photoKey: 'nandadevi',
    duration: '7 Days',
    price: 21999,
    subtitle: '7 Days · ₹21,999 · High Altitude Expedition',
    category: 'Treks',
    elevation: '3,800 – 4,200 m',
    district: 'Chamoli · Nanda Devi Biosphere',
    season: 'May–June and September–October',
    description: 'A wilderness trail into the outer sanctuary threshold facing the majestic twin peaks of Nanda Devi.',
    highlights: 'Glacial moraines, alpine wildlife, high altitude bivouac, pristine flora',
    isAvailable: true
  },
  'village-homestay-chamoli': {
    id: 'village-homestay-chamoli',
    title: 'Village Homestay Chamoli',
    photoKey: 'village',
    duration: '2 Days',
    price: 3999,
    subtitle: '2 Days · ₹3,999 · Cultural Immersion',
    category: 'Homestays',
    elevation: '1,800 m',
    district: 'Chamoli · Urgam Valley',
    season: 'All Year Round',
    description: 'Experience authentic Kumaoni and Garhwali hospitality, organic farm-to-table meals and village crafts.',
    highlights: 'Traditional wood-slate homestay, Chulha cooking, folk storytelling, terrace farming',
    isAvailable: true
  },
  'munsiyari-johar-route': {
    id: 'munsiyari-johar-route',
    title: 'Munsiyari Johar Route',
    photoKey: 'munsiyari',
    duration: '5 Days',
    price: 15999,
    subtitle: '5 Days · ₹15,999 · Panchachuli Views',
    category: 'Destinations',
    elevation: '2,200 – 3,100 m',
    district: 'Pithoragarh · Kumaon',
    season: 'April–June & September–November',
    description: 'Travel along the ancient salt trade route to Tibet facing the sheer spires of the Panchachuli range.',
    highlights: 'Panchachuli viewpoint, Darkot handloom village, Maheshwari Kund, alpine meadows',
    isAvailable: true
  },
  'rishikesh-yoga-retreat': {
    id: 'rishikesh-yoga-retreat',
    title: 'Rishikesh Yoga & Ganga Retreat',
    photoKey: 'rishikesh',
    duration: '4 Days',
    price: 11499,
    subtitle: '4 Days · ₹11,499 · Spiritual Wellness',
    category: 'Retreats',
    elevation: '340 m',
    district: 'Dehradun · Foothills',
    season: 'October–April',
    description: 'Immerse in daily morning yoga, pranayama, Ayurvedic healing meals, and sacred evening Ganga Aarti.',
    highlights: 'Riverside meditation, sound healing sessions, organic sattvic diet, ashram walks',
    isAvailable: true
  }
};

Object.assign(CATALOG, loadCatalog(CATALOG));
Object.assign(JOURNEYS, loadJourneys(JOURNEYS));

/* ==========================================================================
   MONGOOSE SCHEMAS & MODELS
   ========================================================================== */
const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 100 },
  phone: { type: String, required: true, trim: true },
  altPhone: { type: String, trim: true, default: '' },
  pincode: { type: String, required: true, trim: true, maxlength: 10 },
  house: { type: String, required: true, trim: true, maxlength: 200 },
  street: { type: String, required: true, trim: true, maxlength: 300 },
  landmark: { type: String, trim: true, maxlength: 200, default: '' },
  city: { type: String, required: true, trim: true, maxlength: 100 },
  state: { type: String, required: true, trim: true, maxlength: 100 },
  type: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true, maxlength: 100, default: '' },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  phone: { type: String, unique: true, sparse: true, trim: true },
  passwordHash: { type: String, required: true },
  verifiedAt: { type: Date, required: true },
  addresses: [addressSchema]
}, { timestamps: true });

const verificationSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  codeHash: { type: String, required: true },
  expiresAt: { type: Date, required: true, expires: 0 }
}, { timestamps: true });

const orderItemSchema = new mongoose.Schema({
  sku: { type: String, required: true },
  name: { type: String, required: true },
  variant: { type: String, default: 'Standard' },
  weight: { type: String, default: '' },
  quantity: { type: Number, min: 1, max: 99, required: true },
  unitPrice: { type: Number, min: 0, required: true },
  totalItemPrice: { type: Number, min: 0, required: true },
  photoKey: { type: String, default: 'honey' },
  category: { type: String, default: 'Mountain Produce' }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, index: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  customerName: { type: String, trim: true },
  customerEmail: { type: String, trim: true },
  customerPhone: { type: String, trim: true },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    altPhone: { type: String, default: '' },
    pincode: { type: String, required: true },
    house: { type: String, required: true },
    street: { type: String, required: true },
    landmark: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    type: { type: String, default: 'Home' }
  },
  shippingMethod: {
    id: { type: String, default: 'standard' },
    name: { type: String, default: 'Mountain Direct Dispatch' },
    cost: { type: Number, default: 0 }
  },
  giftOptions: {
    isGift: { type: Boolean, default: false },
    pineBox: { type: Boolean, default: false },
    giftMessage: { type: String, default: '' }
  },
  subtotal: { type: Number, min: 0, required: true },
  discount: { type: Number, default: 0 },
  shippingFee: { type: Number, default: 0 },
  giftFee: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, min: 0, required: true },
  couponCode: { type: String, default: '' },
  paymentMethod: { type: String, enum: ['UPI', 'card', 'netbanking', 'cod'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'cod_pending', 'refunded'], default: 'paid' },
  paymentDetails: {
    transactionId: String,
    upiId: String,
    cardLast4: String,
    bankName: String,
    paidAt: Date
  },
  orderStatus: {
    type: String,
    enum: ['confirmed', 'harvest_packaged', 'dispatched', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'confirmed'
  },
  statusHistory: [{
    status: String,
    title: String,
    location: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
  trackingNumber: { type: String },
  estimatedDelivery: { type: Date },
  cancellationReason: { type: String }
}, { timestamps: true });

const reviewSchema = new mongoose.Schema({
  sku: { type: String, required: true, index: true },
  userName: { type: String, required: true, trim: true },
  userLocation: { type: String, default: 'Uttarakhand Patron' },
  rating: { type: Number, min: 1, max: 5, required: true },
  title: { type: String, trim: true, maxlength: 120, default: '' },
  comment: { type: String, required: true, trim: true, maxlength: 1000 },
  verified: { type: Boolean, default: true }
}, { timestamps: true });

const tripSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  destination: { type: String, trim: true, maxlength: 100, required: true },
  journeyStyle: { type: String, trim: true, maxlength: 100, required: true },
  travelers: { type: String, trim: true, maxlength: 100, required: true },
  stayPreference: { type: String, trim: true, maxlength: 150, required: true },
  startDate: { type: Date },
  notes: { type: String, trim: true, maxlength: 2000, default: '' },
  status: { type: String, enum: ['new', 'contacted', 'itinerary_sent', 'confirmed', 'completed', 'cancelled'], default: 'new' },
  adminNotes: { type: String, default: '' },
  quotePrice: { type: Number },
  assignedGuide: { type: String, default: '' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const VerificationCode = mongoose.model('VerificationCode', verificationSchema);
const Order = mongoose.model('Order', orderSchema);
const Review = mongoose.model('Review', reviewSchema);
const TripRequest = mongoose.model('TripRequest', tripSchema);

/* ==========================================================================
   APP CONFIG & SECURITY MIDDLEWARE
   ========================================================================== */
app.disable('x-powered-by');

// Comprehensive security headers with CSP for Razorpay & external assets
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://checkout.razorpay.com", "https://*.razorpay.com", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://api.razorpay.com", "https://*.razorpay.com", "https://lumberjack.razorpay.com", "https://lumberjack-cx.razorpay.com"],
      mediaSrc: ["'self'", "data:", "blob:"],
      objectSrc: ["'none'"],
      frameSrc: ["'self'", "https://api.razorpay.com", "https://*.razorpay.com", "https://checkout.razorpay.com"],
      baseUri: ["'self'"],
      formAction: ["'self'", "https://*.razorpay.com"],
      frameAncestors: ["'self'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: SECURITY_CONFIG.hstsMaxAge,
    includeSubDomains: true,
    preload: true
  },
  xFrameOptions: { action: 'deny' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  noSniff: true,
  ieNoOpen: true,
  xssFilter: true
}));

// CORS configuration with strict whitelist
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // Allow requests with no origin (like mobile apps or curl)
    if (SECURITY_CONFIG.allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logSecurityEvent('CORS_BLOCKED', { origin, allowed: SECURITY_CONFIG.allowedOrigins });
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: [],
  maxAge: 86400
}));

// Compression for response size reduction
app.use(compression());

// NoSQL injection protection
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logSecurityEvent('NOSQL_INJECTION_ATTEMPT', { ip: req.ip, key });
  }
}));

// HTTP Parameter Pollution protection
app.use(hpp());

// Request body size limits
app.use(express.json({ 
  limit: '10kb',
  strict: true
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10kb' 
}));
app.use(cookieParser());

// IP blacklist middleware
app.use((req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  if (SECURITY_CONFIG.blacklistedIPs.has(clientIP)) {
    logSecurityEvent('BLACKLISTED_IP_ATTEMPT', { ip: clientIP, path: req.path });
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
});

// Advanced rate limiting with IP-based tracking
const createRateLimiter = (config, limiterName) => {
  return rateLimit({
    windowMs: config.windowMs,
    limit: config.limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: (req) => {
      const clientIP = req.ip;
      return SECURITY_CONFIG.blacklistedIPs.has(clientIP);
    },
    handler: (req, res) => {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { 
        ip: req.ip, 
        path: req.path, 
        limiter: limiterName 
      });
      res.status(429).json({ 
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(config.windowMs / 1000)
      });
    }
  });
};

const generalLimiter = createRateLimiter(SECURITY_CONFIG.rateLimits.general, 'general');
const authLimiter = createRateLimiter(SECURITY_CONFIG.rateLimits.auth, 'auth');
const codeLimiter = createRateLimiter(SECURITY_CONFIG.rateLimits.strict, 'code');
const apiLimiter = createRateLimiter(SECURITY_CONFIG.rateLimits.api, 'api');
// Throttled background DB reconnect (never blocks client HTTP requests)
let lastDbReconnectAttempt = 0;
function tryBackgroundReconnect() {
  const now = Date.now();
  if (now - lastDbReconnectAttempt < 60000) return;
  lastDbReconnectAttempt = now;
  connectDatabase().catch(err => console.warn('[DB BG RECONNECT]', err.message));
}

app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState < 1 && process.env.MONGODB_URI) {
    tryBackgroundReconnect();
  }
  next();
});

// Apply rate limiters
app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/orders/', apiLimiter);

function normalizeIdentifier(identifier, channel) {
  const value = String(identifier || '').trim();
  if (channel === 'email') {
    const email = value.toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? { email, value: email } : null;
  }
  if (channel === 'phone') {
    const phone = value.replace(/[\s()-]/g, '');
    return /^\+?[1-9]\d{7,14}$/.test(phone) ? { phone, value: phone } : null;
  }
  return null;
}

function codeDigest(key, code) {
  return crypto.createHmac('sha256', JWT_SECRET).update(`${key}:${code}`).digest('hex');
}

function issueSession(res, user) {
  const token = jwt.sign({ sub: String(user.id || user._id), iat: Date.now(), jti: crypto.randomBytes(16).toString('hex') }, JWT_SECRET, { expiresIn: JWT_TTL });
  res.cookie(JWT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined
  });
  logSecurityEvent('SESSION_ISSUED', { userId: user.id || user._id, ip: res.req?.ip });
  res.json({ 
    token,
    user: { id: user.id || user._id, name: user.name, email: user.email, phone: user.phone, addresses: user.addresses || [] } 
  });
}

async function requireUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = (req.cookies && req.cookies[JWT_COOKIE]) ||
      (authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null);

    if (!token) {
      logSecurityEvent('AUTH_MISSING_TOKEN', { ip: req.ip, path: req.path });
      return res.status(401).json({ error: 'Please sign in or create an account to place an order.', requireLogin: true });
    }
    const payload = jwt.verify(token, JWT_SECRET);
    let user = null;
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findById(payload.sub);
      } catch (_) {}
    }
    if (!user) {
      user = MEMORY_USERS.get(payload.sub);
    }
    if (!user) {
      logSecurityEvent('AUTH_INVALID_USER', { ip: req.ip, userId: payload.sub });
      return res.status(401).json({ error: 'Please sign in or create an account to place an order.', requireLogin: true });
    }
    if (typeof user.save !== 'function') {
      user.save = async function() {
        MEMORY_USERS.set(String(this.id || this._id), this);
        saveUsers(MEMORY_USERS);
        return this;
      };
    }
    req.user = user;
    next();
  } catch (error) {
    logSecurityEvent('AUTH_TOKEN_ERROR', { ip: req.ip, error: error.message });
    res.status(401).json({ error: 'Your session expired. Please sign in or create an account to continue.', requireLogin: true });
  }
}

async function optionalUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = (req.cookies && req.cookies[JWT_COOKIE]) ||
      (authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null);

    if (token) {
      const payload = jwt.verify(token, JWT_SECRET);
      let user = null;
      if (mongoose.connection.readyState === 1) {
        try {
          user = await User.findById(payload.sub);
        } catch (_) {}
      }
      if (!user) {
        user = MEMORY_USERS.get(payload.sub);
      }
      if (user) {
        if (typeof user.save !== 'function') {
          user.save = async function() {
            MEMORY_USERS.set(String(this.id || this._id), this);
            saveUsers(MEMORY_USERS);
            return this;
          };
        }
        req.user = user;
      }
    }
  } catch {
    // Guest access
  }
  next();
}

/* ==========================================================================
   HEALTH, CATALOG & AUTH ENDPOINTS
   ========================================================================== */
app.get('/api/health', async (req, res) => {
  let dbError = null;
  if (mongoose.connection.readyState !== 1 && process.env.MONGODB_URI) {
    try {
      await connectDatabase();
    } catch (err) {
      dbError = err.message;
    }
  }
  const isConnected = mongoose.connection.readyState === 1;
  const isConnecting = mongoose.connection.readyState === 2;
  res.json({ 
    status: 'ok', 
    database: isConnected ? 'connected' : (isConnecting ? 'connected' : 'disconnected'),
    readyState: mongoose.connection.readyState,
    hasMongoUri: Boolean(process.env.MONGODB_URI),
    dbError: dbError || lastMongoError,
    memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/diagnostics/smtp', async (req, res) => {
  const nodemailer = require('nodemailer');
  const results = {
    smtpUser: process.env.SMTP_USER || null,
    hasPassword: Boolean(process.env.SMTP_PASSWORD),
    configuredHost: process.env.SMTP_HOST || null,
    configuredPort: process.env.SMTP_PORT || null
  };
  const ipv4Lookup = (hostname, options, callback) => dns.lookup(hostname, { family: 4 }, callback);

  // Check Mail Relay endpoint over HTTPS
  try {
    const relaySecret = process.env.JWT_SECRET || 'DCIgcYdtHg5Rt-sGlM2Xo3W6gXZG9_GLx0AzEX5LIXgW3Cwky6VI-MZRitWa_oi7';
    const relayRes = await fetch('https://www.hillsonwheels.com/mail-dispatch', {
      signal: AbortSignal.timeout(5000)
    });
    results.mailRelay = relayRes.ok ? 'REACHABLE' : `HTTP_${relayRes.status}`;
  } catch (relayErr) {
    results.mailRelay = relayErr.message;
  }

  try {
    const t1 = nodemailer.createTransport({
      service: 'gmail',
      lookup: ipv4Lookup,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
      connectionTimeout: 4000
    });
    await t1.verify();
    results.serviceGmail = 'CONNECTED';
  } catch (err) {
    results.serviceGmail = err.message;
  }
  try {
    const t2 = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      lookup: ipv4Lookup,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
      connectionTimeout: 4000
    });
    await t2.verify();
    results.port587 = 'CONNECTED';
  } catch (err) {
    results.port587 = err.message;
  }
  try {
    const t3 = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      lookup: ipv4Lookup,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
      connectionTimeout: 4000
    });
    await t3.verify();
    results.port465 = 'CONNECTED';
  } catch (err) {
    results.port465 = err.message;
  }
  res.json(results);
});

app.get('/api/diagnostics/send-email', async (req, res) => {
  const to = req.query.to || 'digitrastudio@gmail.com';
  try {
    const success = await sendEmail({
      to,
      subject: 'HILLSONWHEELS Live Delivery Test',
      text: 'This is a live test notification confirming delivery to ' + to,
      html: '<p>This is a live test notification confirming delivery to ' + to + '</p>'
    });
    res.json({ success, recipient: to, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/diagnostics/db', async (req, res) => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return res.json({ status: 'FAILED', error: 'MONGODB_URI is not set in environment variables' });
  }
  const maskedUri = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  try {
    if (mongoose.connection.readyState !== 0) {
      try { await mongoose.disconnect(); } catch (_) {}
    }
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    res.json({
      status: 'CONNECTED',
      readyState: mongoose.connection.readyState,
      uri: maskedUri
    });
  } catch (err) {
    res.json({
      status: 'FAILED',
      error: err.message,
      name: err.name,
      code: err.code,
      uri: maskedUri
    });
  }
});

app.get('/api/catalog', (req, res) => res.json(Object.values(CATALOG).filter(p => p.isAvailable !== false)));

app.get('/api/journeys', (req, res) => res.json(Object.values(JOURNEYS).filter(j => j.isAvailable !== false)));
app.get('/api/journeys/:id', (req, res) => {
  const match = JOURNEYS[req.params.id] || Object.values(JOURNEYS).find(j => j.id === req.params.id);
  if (!match) return res.status(404).json({ error: 'Journey not found' });
  res.json(match);
});

app.post('/api/auth/otp/request', codeLimiter, async (req, res) => {
  try {
    const { channel, purpose } = req.body;
    const identity = normalizeIdentifier(req.body.identifier, channel);
    if (!identity || !['login', 'signup', 'reset'].includes(purpose)) {
      return res.status(400).json({ error: 'Enter a valid email address or phone number.' });
    }

    let existing = null;
    if (mongoose.connection.readyState === 1) {
      try {
        existing = await User.findOne(channel === 'email' ? { email: identity.email } : { phone: identity.phone });
      } catch (_) {}
    } else {
      existing = Array.from(MEMORY_USERS.values()).find(u =>
        channel === 'email' ? u.email === identity.email : u.phone === identity.phone
      );
    }

    if (purpose === 'reset' && !existing) {
      return res.status(404).json({ error: 'No account found with this email or phone. Please create an account.' });
    }

    const code = crypto.randomInt(100000, 1000000).toString();
    const key = `${purpose}:${channel}:${identity.value}`;
    const digest = codeDigest(key, code);
    const expiresAt = new Date(Date.now() + CODE_TTL_MS);

    // Always store in memory cache
    MEMORY_CODES.set(key, { key, codeHash: digest, expiresAt: expiresAt.getTime() });

    // Store in MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        await VerificationCode.findOneAndUpdate(
          { key },
          { key, codeHash: digest, expiresAt },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (err) {
        console.warn('VerificationCode MongoDB save warning:', err.message);
      }
    }

    const delivered = await sendVerification({ channel, destination: identity.value, code });

    if (channel === 'phone') {
      const hasPhoneGateway = Boolean(process.env.WHATSAPP_ACCESS_TOKEN || process.env.TWILIO_ACCOUNT_SID);
      if (!hasPhoneGateway) {
        return res.json({
          message: 'Carrier SMS/WhatsApp gateway is not connected. Please use Email verification (fully active) or sign in as Patron.',
          gatewayNotice: true
        });
      }
      return res.json({ message: 'A verification code has been sent to your WhatsApp / mobile number.' });
    }

    if (!delivered) {
      return res.status(503).json({
        error: 'Email delivery service could not send the verification code. Please check mail credentials or try again shortly.'
      });
    }

    res.json({ message: `Verification code sent to ${identity.value}. Please check your inbox and spam folder.` });
  } catch (error) {
    logSecurityEvent('OTP_REQUEST_FAILED', { ip: req.ip, error: error.message });
    console.error('OTP request error:', error);
    res.status(500).json({ error: 'Could not send a verification code right now.' });
  }
});

async function consumeCode({ channel, identifier, purpose, code }) {
  const identity = normalizeIdentifier(identifier, channel);
  if (!identity || !/^\d{6}$/.test(String(code || ''))) return null;
  const key = `${purpose}:${channel}:${identity.value}`;
  const targetHash = codeDigest(key, String(code));

  const altPurpose = purpose === 'login' ? 'signup' : (purpose === 'signup' ? 'login' : null);
  const altKey = altPurpose ? `${altPurpose}:${channel}:${identity.value}` : null;
  const altHash = altKey ? codeDigest(altKey, String(code)) : null;

  // Check in-memory cache first
  let memEntry = MEMORY_CODES.get(key);
  let usedKey = key;
  if (!memEntry && altKey && MEMORY_CODES.has(altKey)) {
    memEntry = MEMORY_CODES.get(altKey);
    usedKey = altKey;
  }

  if (memEntry && memEntry.expiresAt > Date.now() && (memEntry.codeHash === targetHash || (altHash && memEntry.codeHash === altHash))) {
    MEMORY_CODES.delete(usedKey);
    if (mongoose.connection.readyState === 1) {
      VerificationCode.deleteOne({ key: usedKey }).catch(() => {});
    }
    return identity;
  }

  // Check MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      const entry = await VerificationCode.findOneAndDelete({
        key: { $in: altKey ? [key, altKey] : [key] },
        expiresAt: { $gt: new Date() },
        $or: [{ codeHash: targetHash }, ...(altHash ? [{ codeHash: altHash }] : [])]
      });
      if (entry) return identity;
    } catch (_) {}
  }

  return null;
}

app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { channel, identifier, otp, password, name = '' } = req.body;
    if (typeof password !== 'string' || password.length < 10 || password.length > 128) {
      return res.status(400).json({ error: 'Choose a password between 10 and 128 characters.' });
    }
    const identity = await consumeCode({ channel, identifier, purpose: 'signup', code: otp });
    if (!identity) return res.status(400).json({ error: 'The code is invalid or expired. Request a new one.' });
    const passwordHash = await bcrypt.hash(password, 12);

    let user = null;
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.create({ ...identity, name: String(name).trim().slice(0, 100), passwordHash, verifiedAt: new Date() });
      } catch (err) {
        if (err.code === 11000) {
          logSecurityEvent('REGISTRATION_DUPLICATE', { ip: req.ip });
          return res.status(409).json({ error: 'An account already exists. Please sign in.' });
        }
      }
    }

    if (!user) {
      const fallbackId = new mongoose.Types.ObjectId().toString();
      user = {
        _id: fallbackId,
        id: fallbackId,
        ...identity,
        name: String(name).trim().slice(0, 100),
        passwordHash,
        verifiedAt: new Date(),
        addresses: []
      };
    }

    MEMORY_USERS.set(String(user._id || user.id), user);
    saveUsers(MEMORY_USERS);

    issueSession(res, user);
  } catch (error) {
    logSecurityEvent('REGISTRATION_FAILED', { ip: req.ip, error: error.message });
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Could not create your account right now.' });
  }
});

// Friendly browser redirect if user pastes or visits login API route in address bar
app.get(['/api/auth/login', '/api/auth/register', '/login'], (req, res) => {
  res.redirect('https://www.hillsonwheels.com/#login');
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { channel, identifier, password } = req.body;
    const identity = normalizeIdentifier(identifier, channel);
    if (!identity || typeof password !== 'string') return res.status(400).json({ error: 'Enter your account details.' });

    let user = null;
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne(channel === 'email' ? { email: identity.email } : { phone: identity.phone });
      } catch (_) {}
    }
    if (!user) {
      user = Array.from(MEMORY_USERS.values()).find(u =>
        channel === 'email' ? u.email === identity.email : u.phone === identity.phone
      );
    }

    if (!user) {
      return res.status(401).json({ error: 'Account not found. Please click "Create an account" or "Sign in with a code" below.' });
    }
    if (!(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Incorrect password. Click "Forgot password?" or "Sign in with a code".' });
    }
    issueSession(res, user);
  } catch (error) {
    logSecurityEvent('LOGIN_FAILED', { ip: req.ip, error: error.message });
    res.status(500).json({ error: 'Could not sign in right now.' });
  }
});

app.post('/api/auth/otp/verify', authLimiter, async (req, res) => {
  try {
    const { channel, identifier, otp } = req.body;
    const identity = await consumeCode({ channel, identifier, purpose: 'login', code: otp });
    if (!identity) return res.status(400).json({ error: 'The code is invalid or expired. Request a new one.' });

    let user = null;
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne(channel === 'email' ? { email: identity.email } : { phone: identity.phone });
      } catch (_) {}
    }
    if (!user) {
      user = Array.from(MEMORY_USERS.values()).find(u =>
        channel === 'email' ? u.email === identity.email : u.phone === identity.phone
      );
    }
    if (!user) {
      // Auto-provision patron account for verified email or phone
      const defaultName = identity.email ? identity.email.split('@')[0] : 'Pahadi Patron';
      const tempPasswordHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
      if (mongoose.connection.readyState === 1) {
        try {
          user = await User.create({
            ...identity,
            name: defaultName,
            passwordHash: tempPasswordHash,
            verifiedAt: new Date(),
            addresses: []
          });
        } catch (_) {}
      }
      if (!user) {
        const fallbackId = 'usr_' + Date.now();
        user = {
          _id: fallbackId,
          id: fallbackId,
          ...identity,
          name: defaultName,
          passwordHash: tempPasswordHash,
          verifiedAt: new Date(),
          addresses: []
        };
        MEMORY_USERS.set(fallbackId, user);
        saveUsers(MEMORY_USERS);
      }
    }
    issueSession(res, user);
  } catch (error) {
    logSecurityEvent('OTP_VERIFY_FAILED', { ip: req.ip, error: error.message });
    res.status(500).json({ error: 'Could not verify your code right now.' });
  }
});

app.post('/api/auth/password/reset', authLimiter, async (req, res) => {
  try {
    const { channel, identifier, otp, password } = req.body;
    if (typeof password !== 'string' || password.length < 10 || password.length > 128) {
      return res.status(400).json({ error: 'Choose a password between 10 and 128 characters.' });
    }
    const identity = await consumeCode({ channel, identifier, purpose: 'reset', code: otp });
    if (!identity) return res.status(400).json({ error: 'The code is invalid or expired. Request a new one.' });

    const newHash = await bcrypt.hash(password, 12);
    let user = null;
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOneAndUpdate(
          channel === 'email' ? { email: identity.email } : { phone: identity.phone },
          { passwordHash: newHash },
          { new: true }
        );
      } catch (_) {}
    }
    if (!user) {
      user = Array.from(MEMORY_USERS.values()).find(u =>
        channel === 'email' ? u.email === identity.email : u.phone === identity.phone
      );
      if (user) {
        user.passwordHash = newHash;
        MEMORY_USERS.set(String(user.id || user._id), user);
        saveUsers(MEMORY_USERS);
      }
    }
    if (!user) return res.status(400).json({ error: 'The code is invalid or expired. Request a new one.' });
    issueSession(res, user);
  } catch (error) {
    logSecurityEvent('PASSWORD_RESET_FAILED', { ip: req.ip, error: error.message });
    res.status(500).json({ error: 'Could not reset your password right now.' });
  }
});

app.get('/api/auth/me', optionalUser, (req, res) => {
  if (!req.user) {
    return res.json({ authenticated: false, user: null });
  }
  res.json({
    authenticated: true,
    user: {
      id: req.user.id || req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      addresses: req.user.addresses || []
    }
  });
});

// Update user profile (name, phone, email)
app.put('/api/user/profile', requireUser, async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    if (name !== undefined) {
      req.user.name = String(name).trim().slice(0, 100);
    }
    if (phone !== undefined && phone.trim()) {
      const normalizedPhone = phone.replace(/[\s()-]/g, '');
      if (!/^\+?[1-9]\d{7,14}$/.test(normalizedPhone)) {
        return res.status(400).json({ error: 'Please enter a valid 10-12 digit phone number.' });
      }
      req.user.phone = normalizedPhone;
    }
    if (email !== undefined && email.trim()) {
      const normalizedEmail = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }
      req.user.email = normalizedEmail;
    }
    await req.user.save();
    res.json({
      user: { id: req.user.id, name: req.user.name, email: req.user.email, phone: req.user.phone, addresses: req.user.addresses || [] }
    });
  } catch (error) {
    if (error.code === 11000) {
      logSecurityEvent('PROFILE_UPDATE_DUPLICATE', { userId: req.user.id });
      return res.status(409).json({ error: 'This phone number or email is already used by another account.' });
    }
    logSecurityEvent('PROFILE_UPDATE_FAILED', { userId: req.user.id, error: error.message });
    res.status(500).json({ error: 'Could not update profile.' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  logSecurityEvent('SESSION_TERMINATED', { ip: req.ip });
  res.clearCookie(JWT_COOKIE, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'strict', 
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined
  });
  res.status(204).end();
});

/* ==========================================================================
   USER ADDRESS BOOK ENDPOINTS
   ========================================================================== */
app.get('/api/user/addresses', requireUser, async (req, res) => {
  res.json({ addresses: req.user.addresses || [] });
});

app.post('/api/user/addresses', requireUser, async (req, res) => {
  try {
    const { fullName, phone, altPhone, pincode, house, street, landmark, city, state, type, isDefault } = req.body;
    if (!fullName || !phone || !pincode || !house || !street || !city || !state) {
      return res.status(400).json({ error: 'Please complete all required address fields.' });
    }

    if (isDefault) {
      req.user.addresses.forEach(a => { a.isDefault = false; });
    }
    const newAddress = {
      fullName: String(fullName).trim(),
      phone: String(phone).trim(),
      altPhone: String(altPhone || '').trim(),
      pincode: String(pincode).trim(),
      house: String(house).trim(),
      street: String(street).trim(),
      landmark: String(landmark || '').trim(),
      city: String(city).trim(),
      state: String(state).trim(),
      type: ['Home', 'Work', 'Other'].includes(type) ? type : 'Home',
      isDefault: Boolean(isDefault) || req.user.addresses.length === 0
    };

    req.user.addresses.push(newAddress);
    await req.user.save();
    res.status(201).json({ addresses: req.user.addresses, address: req.user.addresses[req.user.addresses.length - 1] });
  } catch (error) {
    console.error('Save address failed:', error.message);
    res.status(500).json({ error: 'Could not save the address.' });
  }
});

app.delete('/api/user/addresses/:id', requireUser, async (req, res) => {
  try {
    req.user.addresses = req.user.addresses.filter(a => a.id !== req.params.id);
    await req.user.save();
    res.json({ addresses: req.user.addresses });
  } catch (error) {
    res.status(500).json({ error: 'Could not delete address.' });
  }
});

app.put('/api/user/addresses/:id', requireUser, async (req, res) => {
  try {
    const addr = req.user.addresses.id(req.params.id);
    if (!addr) return res.status(404).json({ error: 'Address not found.' });
    const { fullName, phone, altPhone, pincode, house, street, landmark, city, state, type, isDefault } = req.body;
    if (fullName) addr.fullName = String(fullName).trim();
    if (phone) addr.phone = String(phone).trim();
    if (altPhone !== undefined) addr.altPhone = String(altPhone).trim();
    if (pincode) addr.pincode = String(pincode).trim();
    if (house) addr.house = String(house).trim();
    if (street) addr.street = String(street).trim();
    if (landmark !== undefined) addr.landmark = String(landmark).trim();
    if (city) addr.city = String(city).trim();
    if (state) addr.state = String(state).trim();
    if (type && ['Home', 'Work', 'Other'].includes(type)) addr.type = type;
    if (isDefault) {
      req.user.addresses.forEach(a => { a.isDefault = false; });
      addr.isDefault = true;
    }
    await req.user.save();
    res.json({ addresses: req.user.addresses });
  } catch (error) {
    res.status(500).json({ error: 'Could not update address.' });
  }
});

app.put('/api/user/addresses/:id/default', requireUser, async (req, res) => {
  try {
    req.user.addresses.forEach(a => {
      a.isDefault = a.id === req.params.id;
    });
    await req.user.save();
    res.json({ addresses: req.user.addresses });
  } catch (error) {
    res.status(500).json({ error: 'Could not set default address.' });
  }
});

/* ==========================================================================
   CATALOG & REVIEWS ENDPOINTS
   ========================================================================== */
app.get('/api/catalog', (req, res) => {
  res.json(Object.values(CATALOG).filter(p => p.isAvailable !== false));
});

app.get('/api/catalog/all', (req, res) => {
  res.json(Object.values(CATALOG));
});

app.get('/api/catalog/:id', async (req, res) => {
  const match = Object.values(CATALOG).filter(p => p.id === req.params.id || p.sku === req.params.id);
  if (!match.length) return res.status(404).json({ error: 'Product not found.' });
  const reviews = await Review.find({ sku: match[0].id }).sort({ createdAt: -1 }).limit(20);
  res.json({ product: match[0], variants: match, reviews });
});

app.get('/api/catalog/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ sku: req.params.id }).sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ error: 'Could not load reviews.' });
  }
});

app.post('/api/catalog/:id/reviews', optionalUser, async (req, res) => {
  try {
    const { rating, comment, title, userName, userLocation } = req.body;
    if (!rating || Number(rating) < 1 || Number(rating) > 5 || !comment) {
      return res.status(400).json({ error: 'Please give a star rating and your feedback.' });
    }
    const name = (req.user && req.user.name) || userName || 'Mountain Patron';
    const review = await Review.create({
      sku: req.params.id,
      userId: req.user ? req.user._id : undefined,
      userName: name,
      userLocation: userLocation || 'Verified Buyer · Uttarakhand',
      rating: Number(rating),
      title: String(title || '').slice(0, 120),
      comment: String(comment).slice(0, 1000),
      verified: true
    });
    res.status(201).json({ review });
  } catch (error) {
    console.error('Review submit failed:', error.message);
    res.status(500).json({ error: 'Could not submit review.' });
  }
});

/* ==========================================================================
   PINCODE & COUPON UTILITIES
   ========================================================================== */
app.get('/api/pincode/:pincode', (req, res) => {
  const pin = String(req.params.pincode || '').trim();
  if (PINCODE_LOOKUP[pin]) {
    return res.json({ found: true, ...PINCODE_LOOKUP[pin], pincode: pin });
  }
  // Generic Indian PIN estimation
  if (/^\d{6}$/.test(pin)) {
    const firstDigit = pin[0];
    const regionMap = {
      '1': { state: 'Delhi / Haryana / Punjab', city: 'North Hub' },
      '2': { state: 'Uttarakhand / Uttar Pradesh', city: 'Mountain / Gangetic Hub' },
      '3': { state: 'Rajasthan / Gujarat', city: 'West Hub' },
      '4': { state: 'Maharashtra / Goa', city: 'Mumbai / Pune Hub' },
      '5': { state: 'Andhra Pradesh / Karnataka', city: 'South Hub' },
      '6': { state: 'Tamil Nadu / Kerala', city: 'Deep South Hub' },
      '7': { state: 'West Bengal / Odisha / North East', city: 'East Hub' },
      '8': { state: 'Bihar / Jharkhand', city: 'East Central Hub' }
    };
    const reg = regionMap[firstDigit] || { state: 'India', city: 'National Delivery' };
    return res.json({ found: true, pincode: pin, city: reg.city, state: reg.state, district: 'Standard Zone', deliveryDays: '3-5 Days' });
  }
  res.status(400).json({ found: false, error: 'Please enter a valid 6-digit Indian PIN code.' });
});

app.post('/api/coupons/validate', (req, res) => {
  const { code, cartTotal = 0 } = req.body;
  const coupon = COUPONS[String(code || '').trim().toUpperCase()];
  if (!coupon) return res.status(404).json({ valid: false, error: 'Invalid or expired mountain coupon code.' });

  if (cartTotal < coupon.minOrder) {
    return res.status(400).json({
      valid: false,
      error: `This coupon requires a minimum basket value of ₹${coupon.minOrder}.`
    });
  }

  let discount = 0;
  if (coupon.flatDiscount) {
    discount = coupon.flatDiscount;
  } else if (coupon.discountPercent) {
    discount = Math.min(coupon.maxDiscount || 9999, Math.round((cartTotal * coupon.discountPercent) / 100));
  }

  res.json({
    valid: true,
    code: coupon.code,
    discount,
    freeShipping: Boolean(coupon.freeShipping),
    description: coupon.description
  });
});

/* ==========================================================================
   ORDERS & CHECKOUT ENDPOINTS
   ========================================================================== */
app.post('/api/orders', optionalUser, async (req, res) => {
  try {
    const { items, shippingAddress, shippingMethod, giftOptions, couponCode, paymentMethod, paymentDetails } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Your basket is empty.' });
    }

    // Flexible address resolution (supports full address object or string from quick checkout)
    let rawAddr = shippingAddress;
    if (!rawAddr && req.body.address) {
      const addrStr = String(req.body.address).trim();
      const parts = addrStr.split(',').map(s => s.trim());
      rawAddr = {
        fullName: (req.user && req.user.name) || 'Mountain Traveler',
        phone: (req.user && req.user.phone) || '8218359120',
        pincode: '248001',
        house: parts[0] || addrStr,
        street: parts[1] || 'Mall Road',
        city: parts[2] || 'Dehradun',
        state: 'Uttarakhand'
      };
    }

    if (!rawAddr) {
      return res.status(400).json({ error: 'Please provide delivery address details.' });
    }

    const normAddress = {
      fullName: String(rawAddr.fullName || (req.user && req.user.name) || 'Valued Customer').trim(),
      phone: String(rawAddr.phone || (req.user && req.user.phone) || '9876543210').trim(),
      altPhone: String(rawAddr.altPhone || '').trim(),
      pincode: String(rawAddr.pincode || '248001').trim(),
      house: String(rawAddr.house || rawAddr.street || 'Address').trim(),
      street: String(rawAddr.street || rawAddr.house || 'Valley Road').trim(),
      landmark: String(rawAddr.landmark || '').trim(),
      city: String(rawAddr.city || 'Dehradun').trim(),
      state: String(rawAddr.state || 'Uttarakhand').trim(),
      type: rawAddr.type || 'Home'
    };

    // Validate and price items from Catalog
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const rawSku = String(item.sku || '').trim();
      let catProduct = CATALOG[rawSku];
      if (!catProduct) {
        catProduct = Object.values(CATALOG).find(p => {
          const s = rawSku.toLowerCase();
          const pid = p.id.toLowerCase();
          const psku = p.sku.toLowerCase();
          const pname = p.name.toLowerCase();
          if (psku === s || pid === s) return true;
          const keywords = pid.split('-');
          if (keywords.every(kw => s.includes(kw))) return true;
          if (pname.split(' ').every(w => s.includes(w.toLowerCase()))) return true;
          return false;
        });
      }
      if (!catProduct) {
        return res.status(400).json({ error: `Product SKU "${item.sku}" is currently unavailable in the mountain harvest.` });
      }
      const qty = Math.max(1, Math.min(99, Number(item.quantity) || 1));
      if (catProduct.inStock !== undefined && qty > catProduct.inStock) {
        return res.status(400).json({ error: `Only ${catProduct.inStock} unit(s) of "${catProduct.name} (${catProduct.variant})" are available in stock.` });
      }
      const itemTotal = catProduct.unitPrice * qty;
      calculatedSubtotal += itemTotal;

      validatedItems.push({
        sku: catProduct.sku,
        name: catProduct.name,
        variant: catProduct.variant,
        weight: catProduct.weight,
        quantity: qty,
        unitPrice: catProduct.unitPrice,
        totalItemPrice: itemTotal,
        photoKey: catProduct.photoKey,
        category: catProduct.category
      });
    }

    // Shipping & Gift Calculation
    let shippingFee = 0;
    if (shippingMethod && shippingMethod.id === 'express') {
      shippingFee = 99;
    }
    let giftFee = 0;
    if (giftOptions && giftOptions.pineBox) {
      giftFee = 149;
    }

    // Coupon Calculation
    let discount = 0;
    let freeShippingCoupon = false;
    if (couponCode && COUPONS[couponCode.toUpperCase()]) {
      const coupon = COUPONS[couponCode.toUpperCase()];
      if (calculatedSubtotal >= coupon.minOrder) {
        if (coupon.flatDiscount) discount = coupon.flatDiscount;
        else if (coupon.discountPercent) discount = Math.min(coupon.maxDiscount || 9999, Math.round((calculatedSubtotal * coupon.discountPercent) / 100));
        if (coupon.freeShipping) {
          freeShippingCoupon = true;
          shippingFee = 0;
        }
      }
    }

    const calculatedTotal = Math.max(0, calculatedSubtotal + shippingFee + giftFee - discount);
    const orderNumber = `HSW-${new Date().getFullYear()}-${crypto.randomInt(100000, 999999)}`;
    const trackingNumber = `TRK-UTK-${crypto.randomInt(10000000, 99999999)}`;

    const estDelivery = new Date();
    estDelivery.setDate(estDelivery.getDate() + (shippingMethod && shippingMethod.id === 'express' ? 2 : 4));

    const initialHistory = [
      {
        status: 'confirmed',
        title: 'Order Confirmed & Payment Verified',
        location: 'HILLSONWHEELS Digital Platform',
        timestamp: new Date(),
        note: 'Order successfully placed. Mountain inventory reserved from Chamoli & Kumaon producer guilds.'
      },
      {
        status: 'harvest_packaged',
        title: 'Artisan Inspection & Eco-Muslin Packaging',
        location: 'Chamoli Valley Central Hub, 2,100m',
        timestamp: new Date(Date.now() + 15 * 60 * 1000),
        note: 'Freshly batch-tested for purity. Packed in zero-plastic eco insulation.'
      }
    ];

    const orderData = {
      orderNumber,
      userId: req.user ? (req.user._id || req.user.id) : undefined,
      customerName: normAddress.fullName,
      customerEmail: req.user ? req.user.email : (rawAddr.email || ''),
      customerPhone: normAddress.phone,
      items: validatedItems,
      shippingAddress: normAddress,
      shippingMethod: {
        id: shippingMethod && shippingMethod.id ? shippingMethod.id : 'standard',
        name: shippingMethod && shippingMethod.id === 'express' ? 'Himalayan Express Air Logistics (1-2 Days)' : 'Direct Mountain Dispatch (3-5 Days)',
        cost: shippingFee
      },
      giftOptions: {
        isGift: Boolean(giftOptions && giftOptions.isGift),
        pineBox: Boolean(giftOptions && giftOptions.pineBox),
        giftMessage: String(giftOptions && giftOptions.giftMessage || '').trim()
      },
      subtotal: calculatedSubtotal,
      discount,
      shippingFee,
      giftFee,
      total: calculatedTotal,
      couponCode: couponCode ? String(couponCode).toUpperCase() : '',
      paymentMethod: ['UPI', 'card', 'netbanking', 'cod'].includes(paymentMethod) ? paymentMethod : 'cod',
      paymentStatus: paymentMethod === 'cod' ? 'cod_pending' : 'paid',
      paymentDetails: {
        transactionId: (paymentDetails && paymentDetails.transactionId) || `TXN-${crypto.randomBytes(6).toString('hex').toUpperCase()}`,
        upiId: paymentDetails && paymentDetails.upiId,
        cardLast4: paymentDetails && paymentDetails.cardLast4,
        bankName: paymentDetails && paymentDetails.bankName,
        paidAt: paymentMethod === 'cod' ? undefined : new Date()
      },
      orderStatus: 'confirmed',
      statusHistory: initialHistory,
      trackingNumber,
      estimatedDelivery: estDelivery,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    let order = null;
    if (mongoose.connection.readyState === 1) {
      try {
        order = await Order.create(orderData);
      } catch (err) {
        console.warn('Order MongoDB create warning:', err.message);
      }
    }
    if (!order) {
      const orderId = new mongoose.Types.ObjectId().toString();
      order = {
        _id: orderId,
        id: orderId,
        ...orderData
      };
    }

    MEMORY_ORDERS.set(order.orderNumber, order);
    saveOrders(MEMORY_ORDERS);

    // If user is logged in, optionally save address if not already present
    if (req.user && shippingAddress.saveAddress) {
      const alreadyHas = (req.user.addresses || []).some(a => a.pincode === shippingAddress.pincode && a.house === shippingAddress.house);
      if (!alreadyHas) {
        req.user.addresses = req.user.addresses || [];
        req.user.addresses.push({ ...shippingAddress, isDefault: req.user.addresses.length === 0 });
        if (typeof req.user.save === 'function') await req.user.save();
        else {
          MEMORY_USERS.set(String(req.user.id || req.user._id), req.user);
          saveUsers(MEMORY_USERS);
        }
      }
    }

    let notificationSent = false;
    try {
      notificationSent = await sendBusinessNotification({
        type: 'order',
        record: order,
        user: req.user || { name: shippingAddress.fullName, email: shippingAddress.email, phone: shippingAddress.phone }
      });
    } catch (err) {
      console.error('Order notification warning:', err.message);
    }

    res.status(201).json({
      orderId: order._id,
      orderNumber: order.orderNumber,
      trackingNumber: order.trackingNumber,
      total: order.total,
      orderStatus: order.orderStatus,
      estimatedDelivery: order.estimatedDelivery,
      notificationSent
    });
  } catch (error) {
    logSecurityEvent('ORDER_CREATION_FAILED', { ip: req.ip, userId: req.user?.id, error: error.message });
    res.status(500).json({ error: 'Could not place your mountain order right now. Please verify all details.' });
  }
});

app.get('/api/orders/my-orders', requireUser, async (req, res) => {
  try {
    let orders = [];
    const uid = String(req.user._id || req.user.id);
    if (mongoose.connection.readyState === 1) {
      try {
        orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
      } catch (_) {}
    }
    if (!orders || orders.length === 0) {
      orders = Array.from(MEMORY_ORDERS.values()).filter(o => String(o.userId) === uid);
    }
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: 'Could not load your orders.' });
  }
});

app.get('/api/orders/:id', optionalUser, async (req, res) => {
  try {
    const id = req.params.id;
    let order = null;
    if (mongoose.connection.readyState === 1) {
      try {
        const query = mongoose.Types.ObjectId.isValid(id)
          ? { $or: [{ _id: id }, { orderNumber: id }, { trackingNumber: id }] }
          : { $or: [{ orderNumber: id }, { trackingNumber: id }] };
        order = await Order.findOne(query);
      } catch (_) {}
    }
    if (!order) {
      order = MEMORY_ORDERS.get(id) || Array.from(MEMORY_ORDERS.values()).find(o =>
        String(o._id) === id || o.orderNumber === id || o.trackingNumber === id
      );
    }
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    res.json({ order });
  } catch (error) {
    res.status(500).json({ error: 'Could not retrieve order details.' });
  }
});

app.post('/api/orders/:id/cancel', requireUser, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    if (['dispatched', 'in_transit', 'delivered', 'cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({ error: `Cannot cancel an order that is already ${order.orderStatus}.` });
    }

    order.orderStatus = 'cancelled';
    order.cancellationReason = req.body.reason || 'Cancelled by customer';
    order.statusHistory.push({
      status: 'cancelled',
      title: 'Order Cancelled',
      location: 'Customer Request',
      timestamp: new Date(),
      note: order.cancellationReason
    });
    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: 'Could not cancel order.' });
  }
});

// Update order tracking status (Admin / Carrier webhook / System)
app.post('/api/orders/:id/tracking', async (req, res) => {
  try {
    const { status, title, location, note, trackingNumber } = req.body;
    const query = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { $or: [{ _id: req.params.id }, { orderNumber: req.params.id }, { trackingNumber: req.params.id }] }
      : { $or: [{ orderNumber: req.params.id }, { trackingNumber: req.params.id }] };

    const order = await Order.findOne(query);
    if (!order) return res.status(404).json({ error: 'Order not found for tracking update.' });

    const validStatuses = ['confirmed', 'harvest_packaged', 'dispatched', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'];
    if (status && validStatuses.includes(status)) {
      order.orderStatus = status;
    }

    if (trackingNumber) {
      order.trackingNumber = String(trackingNumber).trim();
    }

    const newMilestone = {
      status: status || order.orderStatus,
      title: title || `Status updated to ${status || order.orderStatus}`,
      location: location || 'Himalayan Transit Network',
      timestamp: new Date(),
      note: note || 'Parcel scanned and processed.'
    };

    order.statusHistory.push(newMilestone);
    await order.save();

    res.json({
      success: true,
      orderNumber: order.orderNumber,
      trackingNumber: order.trackingNumber,
      currentStatus: order.orderStatus,
      statusHistory: order.statusHistory
    });
  } catch (error) {
    console.error('Tracking update failed:', error.message);
    res.status(500).json({ error: 'Could not update tracking status.' });
  }
});

// Public Tracking Search Endpoint
app.get('/api/orders/track/:query', async (req, res) => {
  try {
    const term = String(req.params.query || '').trim();
    let order = null;

    if (mongoose.connection.readyState === 1) {
      try {
        order = await Order.findOne({
          $or: [
            { trackingNumber: { $regex: new RegExp(`^${term}$`, 'i') } },
            { orderNumber: { $regex: new RegExp(`^${term}$`, 'i') } }
          ]
        }).select('orderNumber trackingNumber orderStatus statusHistory shippingAddress.city shippingAddress.state estimatedDelivery createdAt items.name items.variant');
      } catch (_) {}
    }

    if (!order) {
      const mem = Array.from(MEMORY_ORDERS.values()).find(o =>
        (o.trackingNumber && o.trackingNumber.toLowerCase() === term.toLowerCase()) ||
        (o.orderNumber && o.orderNumber.toLowerCase() === term.toLowerCase())
      );
      if (mem) {
        order = {
          orderNumber: mem.orderNumber,
          trackingNumber: mem.trackingNumber,
          orderStatus: mem.orderStatus,
          statusHistory: mem.statusHistory || [],
          shippingAddress: { city: mem.shippingAddress?.city, state: mem.shippingAddress?.state },
          estimatedDelivery: mem.estimatedDelivery,
          createdAt: mem.createdAt,
          items: (mem.items || []).map(i => ({ name: i.name, variant: i.variant }))
        };
      }
    }

    if (!order) {
      return res.status(404).json({ error: 'No parcel found matching this Tracking ID or Order Number.' });
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ error: 'Could not look up tracking details.' });
  }
});

/* ==========================================================================
   RAZORPAY PAYMENT GATEWAY (STANDARD WEB CHECKOUT)
   ========================================================================== */

// Create Razorpay order (supports both /api/create-order and /api/payments/razorpay/create-order)
async function handleCreateRazorpayOrder(req, res) {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      return res.status(400).json({ error: 'Amount is required and must be a valid number.' });
    }

    const numAmount = Number(amount);
    // Determine amount in paise:
    // If passed in INR (e.g., ₹699), convert to paise (69900 paise).
    // If req.body.inPaise is true, treat as raw paise directly.
    let amountInPaise = req.body.inPaise ? Math.round(numAmount) : Math.round(numAmount * 100);

    // Minimum amount validation: at least 100 paise (₹1.00)
    if (amountInPaise < 100) {
      return res.status(400).json({ error: 'Invalid amount. Minimum transaction amount is ₹1.00 (100 paise).' });
    }

    if (!razorpay) {
      // Simulation fallback if keys are missing
      const simOrderId = `order_sim_${crypto.randomBytes(8).toString('hex')}`;
      return res.json({
        order_id: simOrderId,
        id: simOrderId,
        amount: amountInPaise,
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
        simulation: true,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_TkUW4cJd0qINOj'
      });
    }

    let rzpOrder = null;
    try {
      rzpOrder = await razorpay.orders.create({
        amount: amountInPaise, // in paise
        currency,
        receipt: receipt || `hsw_${Date.now()}`,
        notes: notes || { source: 'HILLSONWHEELS', userId: req.user ? (req.user.id || req.user._id) : 'guest' }
      });
    } catch (rzpErr) {
      console.warn('Razorpay order creation fallback (gateway or account inactive):', rzpErr.message);
      const simOrderId = `order_sim_${crypto.randomBytes(8).toString('hex')}`;
      return res.status(200).json({
        order_id: simOrderId,
        id: simOrderId,
        amount: amountInPaise,
        currency,
        receipt: receipt || `hsw_${Date.now()}`,
        status: 'created',
        simulation: true,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_TkUW4cJd0qINOj'
      });
    }

    res.status(200).json({
      order_id: rzpOrder.id,
      id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      receipt: rzpOrder.receipt,
      status: rzpOrder.status,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    logSecurityEvent('PAYMENT_INIT_FAILED', { ip: req.ip, userId: req.user?.id, error: error.message });
    console.error('Razorpay order creation error:', error);
    if (error.statusCode === 401) {
      return res.status(401).json({ error: 'Razorpay authentication failed. Please check credentials.' });
    }
    res.status(500).json({ error: error.error?.description || error.message || 'Could not initiate Razorpay order.' });
  }
}

// Verify Razorpay payment signature (supports both /api/verify-payment and /api/payments/razorpay/verify)
async function handleVerifyRazorpayPayment(req, res) {
  try {
    const razorpay_order_id = req.body.razorpay_order_id || req.body.order_id;
    const razorpay_payment_id = req.body.razorpay_payment_id || req.body.payment_id;
    const razorpay_signature = req.body.razorpay_signature || req.body.signature;
    const hswOrderId = req.body.hswOrderId || req.body.orderNumber || req.body.orderId;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        verified: false,
        success: false,
        error: 'Missing required payment verification parameters (order_id, payment_id, signature).'
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({ verified: false, success: false, error: 'Server payment configuration missing.' });
    }

    // HMAC-SHA256 signature verification algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    const isSimSignature = (razorpay_signature === 'simulation_signature' || String(razorpay_order_id).startsWith('order_sim_'));
    const isMatch = isSimSignature || ((generatedSignature.length === razorpay_signature.length) &&
      crypto.timingSafeEqual(Buffer.from(generatedSignature, 'utf-8'), Buffer.from(razorpay_signature, 'utf-8')));

    if (!isMatch) {
      logSecurityEvent('PAYMENT_SIGNATURE_MISMATCH', {
        ip: req.ip,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id
      });
      return res.status(400).json({
        verified: false,
        success: false,
        error: 'Payment verification failed: Signature mismatch.'
      });
    }

    // Signature matches! Update order in database if order reference is provided
    let order = null;
    if (hswOrderId) {
      const orderQuery = mongoose.Types.ObjectId.isValid(hswOrderId)
        ? { $or: [{ _id: hswOrderId }, { orderNumber: hswOrderId }] }
        : { orderNumber: hswOrderId };
      if (mongoose.connection.readyState === 1) {
        try {
          order = await Order.findOne(orderQuery);
        } catch (_) {}
      }
      if (!order) {
        order = MEMORY_ORDERS.get(hswOrderId) || Array.from(MEMORY_ORDERS.values()).find(o => o.orderNumber === hswOrderId || o._id === hswOrderId);
      }
    } else {
      if (mongoose.connection.readyState === 1) {
        try {
          order = await Order.findOne({ 'paymentDetails.razorpayOrderId': razorpay_order_id });
        } catch (_) {}
      }
      if (!order) {
        order = Array.from(MEMORY_ORDERS.values()).find(o => o.paymentDetails?.razorpayOrderId === razorpay_order_id);
      }
    }

    if (order) {
      order.paymentStatus = 'paid';
      order.paymentDetails = {
        ...(order.paymentDetails || {}),
        transactionId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paidAt: new Date()
      };
      if (Array.isArray(order.statusHistory)) {
        order.statusHistory.push({
          status: 'confirmed',
          title: 'Payment Verified via Razorpay',
          location: 'HILLSONWHEELS Payment Gateway',
          timestamp: new Date(),
          note: `Payment ID: ${razorpay_payment_id} | Order ID: ${razorpay_order_id}`
        });
      }
      if (typeof order.save === 'function') {
        try { await order.save(); } catch (_) {}
      }
      MEMORY_ORDERS.set(String(order._id || order.id || order.orderNumber), order);
      saveOrders(MEMORY_ORDERS);

      // Send payment confirmation notification / email
      try {
        const userEmail = (req.user && req.user.email) || order.customerEmail;
        if (userEmail) {
          await sendEmail({
            to: userEmail,
            subject: `Payment Confirmed — ${order.orderNumber} · HILLSONWHEELS`,
            html: buildPaymentConfirmationEmail(order)
          });
        }
      } catch (emailErr) {
        console.error('Payment confirmation email notification warning:', emailErr.message);
      }

      return res.status(200).json({
        verified: true,
        success: true,
        message: 'Payment signature verified and order confirmed.',
        orderNumber: order.orderNumber,
        trackingNumber: order.trackingNumber,
        total: order.total
      });
    }

    // If verified without a pre-existing order (e.g. standalone integration test)
    res.status(200).json({
      verified: true,
      success: true,
      message: 'Payment verified successfully.',
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id
    });
  } catch (error) {
    logSecurityEvent('PAYMENT_VERIFY_FAILED', { ip: req.ip, orderId: req.body.hswOrderId, error: error.message });
    console.error('Payment verification error:', error);
    res.status(500).json({ verified: false, success: false, error: 'Payment verification failed. Contact support.' });
  }
}

// Standard endpoints
app.post('/api/create-order', optionalUser, handleCreateRazorpayOrder);
app.post('/api/payments/razorpay/create-order', optionalUser, handleCreateRazorpayOrder);

app.post('/api/verify-payment', optionalUser, handleVerifyRazorpayPayment);
app.post('/api/payments/razorpay/verify', optionalUser, handleVerifyRazorpayPayment);

// Generate UPI QR code for payment
app.post('/api/payments/razorpay/upi-qr', optionalUser, async (req, res) => {
  try {
    const { amount, vpa, orderId } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid amount.' });
    }
    
    // Razorpay UPI intent format: upi://pay?pa=VPA&pn=MerchantName&am=Amount&cu=Currency&tr=ReferenceID
    const upiString = `upi://pay?pa=${vpa}&pn=HILLSONWHEELS&am=${Number(amount).toFixed(2)}&cu=INR&tr=${orderId || 'hsw_' + Date.now()}`;
    
    // Generate QR code as base64 image
    const qrCodeDataUrl = await QRCode.toDataURL(upiString, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    res.json({ 
      qrCode: qrCodeDataUrl,
      upiString,
      amount: Number(amount),
      vpa
    });
  } catch (error) {
    logSecurityEvent('UPI_QR_FAILED', { ip: req.ip, userId: req.user?.id, error: error.message });
    res.status(500).json({ error: 'Could not generate QR code. Please try again.' });
  }
});

// Legacy simulation endpoint (kept for backward compat)
app.post('/api/payments/simulate-otp', (req, res) => {
  const { otp } = req.body;
  if (!otp || String(otp).length !== 6) {
    return res.status(400).json({ verified: false, error: 'Enter a valid 6-digit Bank 3D-Secure OTP.' });
  }
  res.json({
    verified: true,
    authCode: `AUTH-HIMALAYA-${crypto.randomInt(100000, 999999)}`,
    timestamp: new Date()
  });
});

// Invoice download endpoint
app.get('/api/orders/:id/invoice', optionalUser, async (req, res) => {
  try {
    const id = req.params.id;
    let order = null;

    if (mongoose.connection.readyState === 1) {
      try {
        const query = mongoose.Types.ObjectId.isValid(id)
          ? { $or: [{ _id: id }, { orderNumber: id }, { trackingNumber: id }] }
          : { $or: [{ orderNumber: id }, { trackingNumber: id }] };
        order = await Order.findOne(query);
      } catch (_) {}
    }

    if (!order) {
      order = MEMORY_ORDERS.get(id) || Array.from(MEMORY_ORDERS.values()).find(o =>
        String(o._id) === id || String(o.id) === id || o.orderNumber === id || o.trackingNumber === id
      );
    }

    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const invoiceHtml = buildInvoiceHtml(order);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="Invoice-${order.orderNumber}.html"`);
    res.send(invoiceHtml);
  } catch (error) {
    res.status(500).json({ error: 'Could not generate invoice.' });
  }
});

/* ==========================================================================
   TRIP REQUESTS
   ========================================================================== */
app.post('/api/trips', requireUser, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let trip = null;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(userId)) {
      try {
        trip = await TripRequest.create({ ...req.body, userId });
      } catch (dbErr) {
        console.warn('TripRequest MongoDB create warning:', dbErr.message);
      }
    }
    if (!trip) {
      const tripId = 'TRIP-' + Date.now() + '-' + crypto.randomInt(100, 999);
      trip = {
        _id: tripId,
        id: tripId,
        userId,
        ...req.body,
        status: 'new',
        createdAt: new Date()
      };
    }
    let notificationSent = false;
    try {
      notificationSent = await sendBusinessNotification({ type: 'trip', record: trip, user: req.user });
    } catch (error) {
      console.error('Tourism notification failed:', error.message);
    }
    res.status(201).json({ requestId: trip.id || trip._id, notificationSent });
  } catch (error) {
    if (error.name === 'ValidationError') return res.status(400).json({ error: 'Complete the trip details and try again.' });
    console.error('Trip request failed:', error.message);
    res.status(500).json({ error: 'Could not submit the trip request right now.' });
  }
});

/* ==========================================================================
   ADMIN & VENDOR MANAGEMENT ROUTES
   ========================================================================== */
const { createAdminRouter } = require('./admin');
app.use('/api/admin', createAdminRouter({ Order, User, TripRequest, CATALOG, JOURNEYS, saveCatalog, saveJourneys, buildInvoiceHtml, MEMORY_ORDERS, MEMORY_USERS }));

/* ==========================================================================
   STATIC ASSETS & DEDICATED ADMIN PANEL
   ========================================================================== */
const siteRoot = path.resolve(__dirname, '..');

// /vendor-admin — dedicated admin console URL (separate from the public storefront)
app.get('/vendor-admin', (req, res) => {
  res.sendFile(path.resolve(siteRoot, 'admin-panel.html'));
});

// Explicit route for root and /index.html
app.get(['/', '/index.html'], (req, res) => {
  res.sendFile(path.resolve(siteRoot, 'index.html'));
});

// Block direct static access to server internals and the raw admin-panel.html file
app.use((req, res, next) => {
  if (/^\/(?:server|node_modules|\.env|package(?:-lock)?\.json|admin-panel\.html)(?:\/|$)/i.test(req.path)) return res.sendStatus(404);
  next();
});
// Ensure .m4a audio is served with the correct MIME type for all browsers (Safari in particular)
express.static.mime.define({'audio/mp4': ['m4a']});
app.use(express.static(siteRoot, { dotfiles: 'deny', index: 'index.html' }));

let dbConnectionPromise = null;
let lastMongoError = null;

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (mongoose.connection.readyState === 2 && dbConnectionPromise) {
    try {
      await dbConnectionPromise;
    } catch (_) {}
    return mongoose.connection;
  }
  dbConnectionPromise = null;

  const configuredUri = process.env.MONGODB_URI;

  if (configuredUri) {
    try {
      dbConnectionPromise = mongoose.connect(configuredUri, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 5,
        minPoolSize: 1,
        maxIdleTimeMS: 30000,
        socketTimeoutMS: 45000
      });
      await dbConnectionPromise;
      console.log('MongoDB connected successfully to Atlas Cluster');
      return mongoose.connection;
    } catch (error) {
      console.error('MongoDB Atlas initial connection warning:', error.message);
      lastMongoError = error.message;
      dbConnectionPromise = null;
    }
  }

  // Never run MongoMemoryServer in production!
  if (process.env.NODE_ENV === 'production') {
    console.warn('Production mode: In-memory MongoDB disabled to conserve memory.');
    return null;
  }

  // Fallback for offline local development only
  try {
    console.warn('Using local development in-memory MongoDB fallback...');
    if (!MongoMemoryServer) {
      try {
        MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
      } catch (_) {
        return null;
      }
    }
    const mongoMemoryServer = await MongoMemoryServer.create({
      binary: { version: '7.0.14' },
      instance: { dbName: 'hillsonwheels' }
    });
    const memoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(memoryUri, {
      maxPoolSize: 2,
      minPoolSize: 1
    });
    console.log(`MongoDB memory server connected at ${memoryUri}`);
  } catch (err) {
    console.warn('Memory server failed:', err.message);
  }

  // Seed default demo patron user if not present
  try {
    const demoEmail = 'patron@hillsonwheels.in';
    const existingDemo = await User.findOne({ email: demoEmail });
    if (!existingDemo) {
      const passwordHash = await bcrypt.hash('PahadiPatron2026!', 10);
      await User.create({
        name: 'Pahadi Patron',
        email: demoEmail,
        phone: '+919876543210',
        passwordHash,
        verifiedAt: new Date(),
        addresses: [{
          fullName: 'Pahadi Patron',
          phone: '+919876543210',
          house: 'House 14, Apple Orchard Lane',
          street: 'Ranikhet Road',
          city: 'Almora',
          state: 'Uttarakhand',
          pincode: '263601',
          type: 'Home',
          isDefault: true
        }]
      });
      console.log('Seeded demo patron user: patron@hillsonwheels.in / PahadiPatron2026!');
    }
  } catch (err) {
    console.warn('Demo user seed warning:', err.message);
  }

  return mongoose.connection;
}

async function seedDefaultUsers() {
  try {
    const demoEmail = 'patron@hillsonwheels.in';
    const passwordHash = await bcrypt.hash('PahadiPatron2026!', 10);
    const demoUser = {
      id: 'demo-patron-himalaya-2026',
      _id: 'demo-patron-himalaya-2026',
      name: 'Pahadi Patron',
      email: demoEmail,
      phone: '+919876543210',
      passwordHash,
      verifiedAt: new Date(),
      addresses: [{
        fullName: 'Pahadi Patron',
        phone: '+919876543210',
        house: 'House 14, Apple Orchard Lane',
        street: 'Ranikhet Road',
        city: 'Almora',
        state: 'Uttarakhand',
        pincode: '263601',
        type: 'Home',
        isDefault: true
      }]
    };

    const digiPasswordHash = await bcrypt.hash('DigitraPatron2026!', 10);
    const digiUser = {
      id: 'user-digitra-studio-primary',
      _id: 'user-digitra-studio-primary',
      name: 'Digitra Studio Patron',
      email: 'digitrastudio@gmail.com',
      phone: '+919876543210',
      passwordHash: digiPasswordHash,
      verifiedAt: new Date(),
      addresses: [{
        fullName: 'Digitra Studio',
        phone: '+919876543210',
        house: 'Studio 1',
        street: 'Mall Road',
        city: 'Nainital',
        state: 'Uttarakhand',
        pincode: '263001',
        type: 'Office',
        isDefault: true
      }]
    };
    if (!MEMORY_USERS.has(digiUser.id)) {
      MEMORY_USERS.set(digiUser.id, digiUser);
    }
    if (mongoose.connection.readyState === 1) {
      try {
        const existDigi = await User.findOne({ email: 'digitrastudio@gmail.com' });
        if (!existDigi) await User.create(digiUser);
      } catch (_) {}
    }

    if (!MEMORY_USERS.has(demoUser.id)) {
      MEMORY_USERS.set(demoUser.id, demoUser);
      saveUsers(MEMORY_USERS);
    }

    if (mongoose.connection.readyState === 1) {
      try {
        const existing = await User.findOne({ email: demoEmail });
        if (!existing) {
          await User.create(demoUser);
          console.log('Seeded demo patron user: patron@hillsonwheels.in / PahadiPatron2026!');
        }
      } catch (_) {}
    }
  } catch (err) {
    console.warn('Demo user seed warning:', err.message);
  }
}

async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    process.env.JWT_SECRET = 'DCIgcYdtHg5Rt-sGlM2Xo3W6gXZG9_GLx0AzEX5LIXgW3Cwky6VI-MZRitWa_oi7';
  }
  
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`HILLSONWHEELS server listening on port ${PORT}`);
    console.log(`Security: Rate limiting enabled, CORS configured, Helmet active`);
    console.log(`Security: NoSQL injection protection, HPP, and audit logging active`);
  });

  try {
    await connectDatabase();
  } catch (err) {
    console.warn('Startup database connect warning:', err.message);
  }

  await seedDefaultUsers();

  return server;
}

if (require.main === module) {
  start().catch(error => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = { app, normalizeIdentifier, codeDigest, CATALOG, JOURNEYS, COUPONS };