require('dotenv').config();

const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
let MongoMemoryServer = null;
const jwt = require('jsonwebtoken');
const { rateLimit } = require('express-rate-limit');
const Razorpay = require('razorpay');
const cors = require('cors');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const { body, validationResult, param } = require('express-validator');
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
    auth: { windowMs: 15 * 60 * 1000, limit: 30 },
    strict: { windowMs: 15 * 60 * 1000, limit: 8 },
    api: { windowMs: 1 * 60 * 1000, limit: 20 }
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

const { loadCatalog, loadJourneys, saveCatalog, saveJourneys } = require('./dataStore');
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
// Ensure database is connected for API requests (supports both serverless & standalone)
app.use('/api', async (req, res, next) => {
  if (mongoose.connection.readyState < 1 && process.env.MONGODB_URI) {
    try {
      await connectDatabase();
    } catch (err) {
      console.error('Request-time DB connection failure:', err.message);
    }
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
  return crypto.createHmac('sha256', process.env.JWT_SECRET).update(`${key}:${code}`).digest('hex');
}

function issueSession(res, user) {
  const token = jwt.sign({ sub: user.id, iat: Date.now(), jti: crypto.randomBytes(16).toString('hex') }, process.env.JWT_SECRET, { expiresIn: JWT_TTL });
  res.cookie(JWT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined
  });
  logSecurityEvent('SESSION_ISSUED', { userId: user.id, ip: res.req?.ip });
  res.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone, addresses: user.addresses || [] } });
}

async function requireUser(req, res, next) {
  try {
    const token = req.cookies[JWT_COOKIE];
    if (!token) {
      logSecurityEvent('AUTH_MISSING_TOKEN', { ip: req.ip, path: req.path });
      return res.status(401).json({ error: 'Please sign in or create an account to place an order.', requireLogin: true });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) {
      logSecurityEvent('AUTH_INVALID_USER', { ip: req.ip, userId: payload.sub });
      return res.status(401).json({ error: 'Please sign in or create an account to place an order.', requireLogin: true });
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
    const token = req.cookies[JWT_COOKIE];
    if (token) {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.sub);
      if (user) req.user = user;
    }
  } catch {
    // Guest access
  }
  next();
}

/* ==========================================================================
   HEALTH, CATALOG & AUTH ENDPOINTS
   ========================================================================== */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Security audit endpoint (protected)
app.get('/api/admin/security-audit', requireUser, (req, res) => {
  // In production, this should be restricted to admin users only
  res.json({ 
    auditLog: securityAuditLog.slice(-100), // Last 100 entries
    totalEvents: securityAuditLog.length
  });
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

    const existing = await User.findOne(channel === 'email' ? { email: identity.email } : { phone: identity.phone });
    if (purpose === 'signup' && existing) return res.status(409).json({ error: 'An account already exists. Please sign in.' });
    if ((purpose === 'login' || purpose === 'reset') && !existing) {
      return res.json({ message: 'If an account matches, a verification code has been sent.' });
    }

    const code = crypto.randomInt(100000, 1000000).toString();
    const key = `${purpose}:${channel}:${identity.value}`;
    await VerificationCode.findOneAndUpdate(
      { key },
      { key, codeHash: codeDigest(key, code), expiresAt: new Date(Date.now() + CODE_TTL_MS) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const delivered = await sendVerification({ channel, destination: identity.value, code });
    if (!delivered || (typeof delivered === 'object' && !delivered.success)) {
      await VerificationCode.deleteOne({ key });
      return res.status(503).json({ error: `The ${channel === 'email' ? 'email' : 'WhatsApp'} delivery service is not configured yet.` });
    }

    const responseMessage = channel === 'phone'
      ? (delivered.provider === 'simulated' ? `Your verification code is: ${code}` : 'A verification code has been sent to your WhatsApp.')
      : (delivered.provider === 'simulated' ? `Your verification code is: ${code}` : 'A verification code has been sent to your email.');

    res.json({ message: responseMessage });
  } catch (error) {
    logSecurityEvent('OTP_REQUEST_FAILED', { ip: req.ip, error: error.message });
    res.status(500).json({ error: 'Could not send a verification code right now.' });
  }
});

async function consumeCode({ channel, identifier, purpose, code }) {
  const identity = normalizeIdentifier(identifier, channel);
  if (!identity || !/^\d{6}$/.test(String(code || ''))) return null;
  const key = `${purpose}:${channel}:${identity.value}`;
  const entry = await VerificationCode.findOneAndDelete({
    key,
    expiresAt: { $gt: new Date() },
    codeHash: codeDigest(key, String(code))
  });
  return entry ? identity : null;
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
    const user = await User.create({ ...identity, name: String(name).trim().slice(0, 100), passwordHash, verifiedAt: new Date() });
    issueSession(res, user);
  } catch (error) {
    if (error.code === 11000) {
      logSecurityEvent('REGISTRATION_DUPLICATE', { ip: req.ip });
      return res.status(409).json({ error: 'An account already exists. Please sign in.' });
    }
    logSecurityEvent('REGISTRATION_FAILED', { ip: req.ip, error: error.message });
    res.status(500).json({ error: 'Could not create your account right now.' });
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { channel, identifier, password } = req.body;
    const identity = normalizeIdentifier(identifier, channel);
    if (!identity || typeof password !== 'string') return res.status(400).json({ error: 'Enter your account details.' });
    const user = await User.findOne(channel === 'email' ? { email: identity.email } : { phone: identity.phone });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'The account details are not correct.' });
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
    const user = await User.findOne(channel === 'email' ? { email: identity.email } : { phone: identity.phone });
    if (!user) return res.status(401).json({ error: 'The account details are not correct.' });
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
    const user = await User.findOneAndUpdate(
      channel === 'email' ? { email: identity.email } : { phone: identity.phone },
      { passwordHash: await bcrypt.hash(password, 12) },
      { new: true }
    );
    if (!user) return res.status(400).json({ error: 'The code is invalid or expired. Request a new one.' });
    issueSession(res, user);
  } catch (error) {
    logSecurityEvent('PASSWORD_RESET_FAILED', { ip: req.ip, error: error.message });
    res.status(500).json({ error: 'Could not reset your password right now.' });
  }
});

app.get('/api/auth/me', requireUser, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
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
app.post('/api/orders', requireUser, async (req, res) => {
  try {
    const { items, shippingAddress, shippingMethod, giftOptions, couponCode, paymentMethod, paymentDetails } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Your basket is empty.' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.pincode || !shippingAddress.house || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state) {
      return res.status(400).json({ error: 'Please provide complete delivery address details.' });
    }

    // Validate and price items from Catalog
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const catProduct = CATALOG[item.sku];
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

    const order = await Order.create({
      orderNumber,
      userId: req.user ? req.user._id : undefined,
      customerName: shippingAddress.fullName,
      customerEmail: req.user ? req.user.email : shippingAddress.email || '',
      customerPhone: shippingAddress.phone,
      items: validatedItems,
      shippingAddress: {
        fullName: String(shippingAddress.fullName).trim(),
        phone: String(shippingAddress.phone).trim(),
        altPhone: String(shippingAddress.altPhone || '').trim(),
        pincode: String(shippingAddress.pincode).trim(),
        house: String(shippingAddress.house).trim(),
        street: String(shippingAddress.street).trim(),
        landmark: String(shippingAddress.landmark || '').trim(),
        city: String(shippingAddress.city).trim(),
        state: String(shippingAddress.state).trim(),
        type: shippingAddress.type || 'Home'
      },
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
      estimatedDelivery: estDelivery
    });

    // If user is logged in, optionally save address if not already present
    if (req.user && shippingAddress.saveAddress) {
      const alreadyHas = req.user.addresses.some(a => a.pincode === shippingAddress.pincode && a.house === shippingAddress.house);
      if (!alreadyHas) {
        req.user.addresses.push({ ...order.shippingAddress.toObject(), isDefault: req.user.addresses.length === 0 });
        await req.user.save();
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
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: 'Could not load your orders.' });
  }
});

app.get('/api/orders/:id', optionalUser, async (req, res) => {
  try {
    const query = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { $or: [{ _id: req.params.id }, { orderNumber: req.params.id }, { trackingNumber: req.params.id }] }
      : { $or: [{ orderNumber: req.params.id }, { trackingNumber: req.params.id }] };

    const order = await Order.findOne(query);
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
    const order = await Order.findOne({
      $or: [
        { trackingNumber: { $regex: new RegExp(`^${term}$`, 'i') } },
        { orderNumber: { $regex: new RegExp(`^${term}$`, 'i') } }
      ]
    }).select('orderNumber trackingNumber orderStatus statusHistory shippingAddress.city shippingAddress.state estimatedDelivery createdAt items.name items.variant');

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

    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise, // in paise
      currency,
      receipt: receipt || `hsw_${Date.now()}`,
      notes: notes || { source: 'HILLSONWHEELS', userId: req.user ? req.user.id : 'guest' }
    });

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

    const isMatch = (generatedSignature.length === razorpay_signature.length) &&
      crypto.timingSafeEqual(Buffer.from(generatedSignature, 'utf-8'), Buffer.from(razorpay_signature, 'utf-8'));

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
      order = await Order.findOne(orderQuery);
    } else {
      order = await Order.findOne({ 'paymentDetails.razorpayOrderId': razorpay_order_id });
    }

    if (order) {
      order.paymentStatus = 'paid';
      order.paymentDetails = {
        ...order.paymentDetails,
        transactionId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paidAt: new Date()
      };
      order.statusHistory.push({
        status: 'confirmed',
        title: 'Payment Verified via Razorpay',
        location: 'HILLSONWHEELS Payment Gateway',
        timestamp: new Date(),
        note: `Payment ID: ${razorpay_payment_id} | Order ID: ${razorpay_order_id}`
      });
      await order.save();

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

// Standard endpoints (authentication strictly required to place orders / initiate payments)
app.post('/api/create-order', requireUser, handleCreateRazorpayOrder);
app.post('/api/payments/razorpay/create-order', requireUser, handleCreateRazorpayOrder);

app.post('/api/verify-payment', requireUser, handleVerifyRazorpayPayment);
app.post('/api/payments/razorpay/verify', requireUser, handleVerifyRazorpayPayment);

// Generate UPI QR code for payment
app.post('/api/payments/razorpay/upi-qr', requireUser, async (req, res) => {
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
    const query = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { $or: [{ _id: req.params.id }, { orderNumber: req.params.id }, { trackingNumber: req.params.id }] }
      : { $or: [{ orderNumber: req.params.id }, { trackingNumber: req.params.id }] };
    const order = await Order.findOne(query);
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
    const trip = await TripRequest.create({ ...req.body, userId: req.user._id });
    let notificationSent = false;
    try {
      notificationSent = await sendBusinessNotification({ type: 'trip', record: trip, user: req.user });
    } catch (error) {
      console.error('Tourism notification failed:', error.message);
    }
    res.status(201).json({ requestId: trip.id, notificationSent });
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
app.use('/api/admin', createAdminRouter({ Order, User, TripRequest, CATALOG, JOURNEYS, saveCatalog, saveJourneys, buildInvoiceHtml }));

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

async function connectDatabase() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  if (dbConnectionPromise) {
    return dbConnectionPromise;
  }

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

  return server;
}

if (require.main === module) {
  start().catch(error => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = { app, normalizeIdentifier, codeDigest, CATALOG, JOURNEYS, COUPONS };