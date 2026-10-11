/**
 * HILLSONWHEELS Admin & Vendor Management API
 * Authentication: admin@1234 / admin@4321
 */
const express = require('express');
const jwt = require('jsonwebtoken');

function createAdminRouter({ Order, User, TripRequest, CATALOG, JOURNEYS = {}, saveCatalog, saveJourneys, buildInvoiceHtml, MEMORY_ORDERS = new Map(), MEMORY_USERS = new Map() }) {
  const router = express.Router();
  const ADMIN_USER = 'admin@1234';
  const ADMIN_PASS = 'admin@4321';
  const JWT_SECRET = process.env.JWT_SECRET || 'hsw-hillsonwheels-master-secure-jwt-key-2026';

  // Admin Authentication Middleware
  function requireAdmin(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      const token = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.slice(7) : (req.cookies && req.cookies.admin_token);
      if (!token) return res.status(401).json({ error: 'Admin authentication required.' });

      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.role !== 'admin' || decoded.sub !== ADMIN_USER) {
        return res.status(403).json({ error: 'Unauthorized: Admin privileges required.' });
      }
      req.admin = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Admin session expired. Please sign in again.' });
    }
  }

  /* ==========================================================================
     AUTH ENDPOINTS
     ========================================================================== */
  router.post('/login', (req, res) => {
    const { username, password } = req.body || {};
    const inputUser = String(username || '').trim();
    const inputPass = String(password || '').trim();

    if (inputUser !== ADMIN_USER || inputPass !== ADMIN_PASS) {
      return res.status(401).json({ error: 'Invalid Admin ID or Password. Access denied.' });
    }

    const token = jwt.sign(
      { sub: ADMIN_USER, role: 'admin', loggedAt: new Date().toISOString() },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    });

    res.json({
      success: true,
      token,
      admin: { username: ADMIN_USER, role: 'Vendor / Super Admin' }
    });
  });

  router.post('/logout', (req, res) => {
    res.clearCookie('admin_token', { path: '/' });
    res.json({ success: true, message: 'Logged out from Admin Console.' });
  });

  router.get('/verify', requireAdmin, (req, res) => {
    res.json({ valid: true, username: ADMIN_USER, role: 'Vendor / Super Admin' });
  });

  /* ==========================================================================
     DASHBOARD ANALYTICS
     ========================================================================== */
  router.get(['/stats', '/metrics'], requireAdmin, async (req, res) => {
    try {
      let allOrders = [];
      try {
        allOrders = await Order.find({}).sort({ createdAt: -1 });
      } catch (_) {}
      if (!allOrders || allOrders.length === 0) {
        allOrders = Array.from(MEMORY_ORDERS.values());
      }

      const totalRevenue = allOrders.reduce((acc, o) => (o.paymentStatus === 'paid' ? acc + (o.total || 0) : acc), 0);
      const totalOrders = allOrders.length;
      
      const pendingOrders = allOrders.filter(o => o.orderStatus === 'confirmed' || o.orderStatus === 'harvest_packaged').length;
      const inTransitOrders = allOrders.filter(o => o.orderStatus === 'dispatched' || o.orderStatus === 'in_transit' || o.orderStatus === 'out_for_delivery').length;
      const deliveredOrders = allOrders.filter(o => o.orderStatus === 'delivered').length;
      const cancelledOrders = allOrders.filter(o => o.orderStatus === 'cancelled').length;

      // Product inventory health
      const productList = Object.values(CATALOG);
      const totalProducts = productList.length;
      const lowStockProducts = productList.filter(p => (p.inStock || 0) <= 5);

      // Tourism requests
      let totalTrips = 0;
      let newTrips = 0;
      if (TripRequest) {
        try {
          const trips = await TripRequest.find({});
          totalTrips = trips.length;
          newTrips = trips.filter(t => !t.status || t.status === 'new').length;
        } catch (_) {}
      }

      // Recent 7 days revenue
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentOrders = allOrders.filter(o => new Date(o.createdAt || Date.now()) >= sevenDaysAgo);

      res.json({
        totalRevenue,
        revenue: totalRevenue,
        totalOrders,
        pendingOrders,
        inTransitOrders,
        deliveredOrders,
        cancelledOrders,
        totalProducts,
        totalPackages: Object.keys(JOURNEYS).length,
        lowStockCount: lowStockProducts.length,
        lowStockProducts,
        totalTrips,
        newTrips,
        recentOrdersCount: recentOrders.length
      });
    } catch (err) {
      console.error('Admin stats error:', err.message);
      res.status(500).json({ error: 'Failed to calculate analytics.' });
    }
  });

  /* ==========================================================================
     ORDER & DELIVERY FULFILLMENT MANAGEMENT
     ========================================================================== */
  router.get('/orders', requireAdmin, async (req, res) => {
    try {
      const { status, search, limit = 50, page = 1 } = req.query;
      const query = {};

      if (status && status !== 'all') {
        query.orderStatus = status;
      }

      if (search && search.trim()) {
        const s = search.trim();
        query.$or = [
          { orderNumber: new RegExp(s, 'i') },
          { trackingNumber: new RegExp(s, 'i') },
          { 'shippingAddress.fullName': new RegExp(s, 'i') },
          { 'shippingAddress.phone': new RegExp(s, 'i') },
          { customerEmail: new RegExp(s, 'i') },
          { 'shippingAddress.city': new RegExp(s, 'i') },
          { 'shippingAddress.pincode': new RegExp(s, 'i') }
        ];
      }

      let orders = [];
      let total = 0;
      try {
        total = await Order.countDocuments(query);
        orders = await Order.find(query)
          .sort({ createdAt: -1 })
          .skip((Number(page) - 1) * Number(limit))
          .limit(Number(limit));
      } catch (_) {}

      if (!orders || orders.length === 0) {
        let list = Array.from(MEMORY_ORDERS.values());
        if (status && status !== 'all') list = list.filter(o => o.orderStatus === status);
        total = list.length;
        orders = list.slice((Number(page) - 1) * Number(limit), Number(page) * Number(limit));
      }

      res.json({
        orders,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)) || 1
      });
    } catch (err) {
      console.error('Admin get orders error:', err.message);
      res.status(500).json({ error: 'Failed to fetch orders.' });
    }
  });

  router.get('/orders/:id', requireAdmin, async (req, res) => {
    try {
      let order = null;
      try {
        order = await Order.findById(req.params.id);
      } catch (_) {}
      if (!order) {
        order = MEMORY_ORDERS.get(req.params.id) || Array.from(MEMORY_ORDERS.values()).find(o =>
          String(o._id) === req.params.id || o.orderNumber === req.params.id
        );
      }
      if (!order) return res.status(404).json({ error: 'Order not found.' });
      res.json({ order });
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve order details.' });
    }
  });

  router.put('/orders/:id/status', requireAdmin, async (req, res) => {
    try {
      const { orderStatus, paymentStatus, title, location, note } = req.body;
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ error: 'Order not found.' });

      if (orderStatus) {
        order.orderStatus = orderStatus;
      }

      if (paymentStatus) {
        order.paymentStatus = paymentStatus;
        if (paymentStatus === 'paid' && !order.paymentDetails?.paidAt) {
          order.paymentDetails = order.paymentDetails || {};
          order.paymentDetails.paidAt = new Date();
        }
      }

      // Automatically sync payment if marked delivered on COD
      if (orderStatus === 'delivered' && order.paymentMethod === 'cod') {
        order.paymentStatus = 'paid';
        order.paymentDetails = order.paymentDetails || {};
        order.paymentDetails.paidAt = new Date();
      }

      // Add tracking milestone if title/location provided
      const milestoneTitle = title || {
        confirmed: 'Order Confirmed',
        harvest_packaged: 'Harvest Packaged & Quality Verified',
        dispatched: 'Dispatched from Mountain Hub',
        in_transit: 'In Transit with Courier',
        out_for_delivery: 'Out for Delivery to Patron Address',
        delivered: 'Delivered with Mountain Blessings',
        cancelled: 'Order Cancelled'
      }[orderStatus] || 'Status Updated';

      order.statusHistory.push({
        status: orderStatus || order.orderStatus,
        title: milestoneTitle,
        location: location || 'Haldwani Hub / Central Logistics',
        timestamp: new Date(),
        note: note || `Fulfillment milestone updated by Vendor Console.`
      });

      await order.save();
      res.json({ success: true, order });
    } catch (err) {
      console.error('Admin update order status error:', err.message);
      res.status(500).json({ error: 'Failed to update order status.' });
    }
  });

  /* ==========================================================================
     PRODUCT CATALOG & INVENTORY MANAGEMENT
     ========================================================================== */
  router.get('/products', requireAdmin, (req, res) => {
    const products = Object.values(CATALOG);
    res.json({ products, total: products.length });
  });

  router.post('/products', requireAdmin, (req, res) => {
    try {
      const {
        id, sku, name, variant, weight, unitPrice, mrp, category, origin,
        photoKey, inStock, rating, description, benefits, isAvailable
      } = req.body;

      if (!sku || !name || unitPrice === undefined) {
        return res.status(400).json({ error: 'SKU, Product Name, and Price are required.' });
      }

      const cleanSku = String(sku).trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
      if (CATALOG[cleanSku]) {
        return res.status(409).json({ error: `A product with SKU "${cleanSku}" already exists.` });
      }

      const newProduct = {
        id: id || cleanSku.split('-')[0] || cleanSku,
        sku: cleanSku,
        name: String(name).trim(),
        variant: variant || 'Standard Pack',
        weight: weight || '',
        unitPrice: Number(unitPrice),
        mrp: Number(mrp || unitPrice),
        category: category || 'Mountain Produce',
        origin: origin || 'Uttarakhand',
        photoKey: photoKey || 'p1',
        inStock: Number(inStock || 0),
        rating: Number(rating || 5.0),
        reviewsCount: 0,
        description: description || '',
        benefits: Array.isArray(benefits) ? benefits : [],
        isAvailable: isAvailable !== false
      };

      CATALOG[cleanSku] = newProduct;
      if (typeof saveCatalog === 'function') saveCatalog(CATALOG);
      res.status(201).json({ success: true, product: newProduct });
    } catch (err) {
      console.error('Admin create product error:', err.message);
      res.status(500).json({ error: 'Failed to create new product.' });
    }
  });

  router.put('/products/:sku', requireAdmin, (req, res) => {
    try {
      const sku = req.params.sku;
      if (!CATALOG[sku]) {
        return res.status(404).json({ error: `Product SKU "${sku}" not found.` });
      }

      const p = CATALOG[sku];
      const updates = req.body || {};

      if (updates.name !== undefined) p.name = String(updates.name).trim();
      if (updates.variant !== undefined) p.variant = String(updates.variant).trim();
      if (updates.weight !== undefined) p.weight = String(updates.weight).trim();
      if (updates.unitPrice !== undefined) p.unitPrice = Number(updates.unitPrice);
      if (updates.mrp !== undefined) p.mrp = Number(updates.mrp);
      if (updates.category !== undefined) p.category = String(updates.category).trim();
      if (updates.origin !== undefined) p.origin = String(updates.origin).trim();
      if (updates.photoKey !== undefined) p.photoKey = String(updates.photoKey).trim();
      if (updates.inStock !== undefined) p.inStock = Math.max(0, Number(updates.inStock));
      if (updates.isAvailable !== undefined) p.isAvailable = Boolean(updates.isAvailable);
      if (updates.description !== undefined) p.description = String(updates.description);

      CATALOG[sku] = p;
      if (typeof saveCatalog === 'function') saveCatalog(CATALOG);
      res.json({ success: true, product: p });
    } catch (err) {
      console.error('Admin update product error:', err.message);
      res.status(500).json({ error: 'Failed to update product.' });
    }
  });

  router.delete('/products/:sku', requireAdmin, (req, res) => {
    try {
      const sku = req.params.sku;
      if (!CATALOG[sku]) {
        return res.status(404).json({ error: `Product SKU "${sku}" not found.` });
      }

      delete CATALOG[sku];
      if (typeof saveCatalog === 'function') saveCatalog(CATALOG);
      res.json({ success: true, message: `Product "${sku}" removed from catalog.` });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete product.' });
    }
  });

  /* ==========================================================================
     TOURISM PACKAGES & EXPEDITIONS MANAGEMENT
     ========================================================================== */
  router.get('/packages', requireAdmin, (req, res) => {
    const packages = Object.values(JOURNEYS);
    res.json({ packages, total: packages.length });
  });

  router.post('/packages', requireAdmin, (req, res) => {
    try {
      const {
        id, title, photoKey, duration, price, category, elevation,
        district, season, description, highlights, isAvailable
      } = req.body;

      if (!title || price === undefined) {
        return res.status(400).json({ error: 'Package Title and Price are required.' });
      }

      const cleanId = (id || title).trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
      if (JOURNEYS[cleanId]) {
        return res.status(409).json({ error: `A package with ID "${cleanId}" already exists.` });
      }

      const dur = duration || '3 Days';
      const pr = Number(price || 0);
      const cat = category || 'Destinations';
      const dist = district || 'Uttarakhand';
      const newPkg = {
        id: cleanId,
        title: String(title).trim(),
        photoKey: photoKey || 'journey',
        duration: dur,
        price: pr,
        subtitle: `${dur} · ₹${pr.toLocaleString('en-IN')} · ${dist}`,
        category: cat,
        elevation: elevation || '2,000 m',
        district: dist,
        season: season || 'All Year',
        description: description || '',
        highlights: highlights || '',
        isAvailable: isAvailable !== false
      };

      JOURNEYS[cleanId] = newPkg;
      if (typeof saveJourneys === 'function') saveJourneys(JOURNEYS);
      res.status(201).json({ success: true, package: newPkg });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create new tourism package.' });
    }
  });

  router.put('/packages/:id', requireAdmin, (req, res) => {
    try {
      const id = req.params.id;
      if (!JOURNEYS[id]) {
        return res.status(404).json({ error: `Package "${id}" not found.` });
      }

      const pkg = JOURNEYS[id];
      const updates = req.body || {};

      if (updates.title !== undefined) pkg.title = String(updates.title).trim();
      if (updates.photoKey !== undefined) pkg.photoKey = String(updates.photoKey).trim();
      if (updates.duration !== undefined) pkg.duration = String(updates.duration).trim();
      if (updates.price !== undefined) pkg.price = Number(updates.price);
      if (updates.category !== undefined) pkg.category = String(updates.category).trim();
      if (updates.elevation !== undefined) pkg.elevation = String(updates.elevation).trim();
      if (updates.district !== undefined) pkg.district = String(updates.district).trim();
      if (updates.season !== undefined) pkg.season = String(updates.season).trim();
      if (updates.description !== undefined) pkg.description = String(updates.description);
      if (updates.highlights !== undefined) pkg.highlights = String(updates.highlights);
      if (updates.isAvailable !== undefined) pkg.isAvailable = Boolean(updates.isAvailable);

      pkg.subtitle = `${pkg.duration || '3 Days'} · ₹${Number(pkg.price||0).toLocaleString('en-IN')} · ${pkg.district || pkg.category}`;

      JOURNEYS[id] = pkg;
      if (typeof saveJourneys === 'function') saveJourneys(JOURNEYS);
      res.json({ success: true, package: pkg });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update tourism package.' });
    }
  });

  router.delete('/packages/:id', requireAdmin, (req, res) => {
    try {
      const id = req.params.id;
      if (!JOURNEYS[id]) {
        return res.status(404).json({ error: `Package "${id}" not found.` });
      }

      delete JOURNEYS[id];
      if (typeof saveJourneys === 'function') saveJourneys(JOURNEYS);
      res.json({ success: true, message: `Package "${id}" removed successfully.` });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete package.' });
    }
  });

  /* ==========================================================================
     TOURISM / JOURNEY LEADS
     ========================================================================== */
  router.get('/trips', requireAdmin, async (req, res) => {
    try {
      if (!TripRequest) return res.json({ trips: [] });
      const trips = await TripRequest.find({}).sort({ createdAt: -1 });
      res.json({ trips, total: trips.length });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch tourism leads.' });
    }
  });

  router.put('/trips/:id/status', requireAdmin, async (req, res) => {
    try {
      if (!TripRequest) return res.status(400).json({ error: 'Trip system unavailable.' });
      const { status, adminNotes, quotePrice, assignedGuide, startDate } = req.body;
      const trip = await TripRequest.findById(req.params.id);
      if (!trip) return res.status(404).json({ error: 'Trip lead not found.' });

      if (status) trip.status = status;
      if (adminNotes !== undefined) trip.adminNotes = adminNotes;
      if (quotePrice !== undefined) trip.quotePrice = Number(quotePrice);
      if (assignedGuide !== undefined) trip.assignedGuide = assignedGuide;
      if (startDate) trip.startDate = new Date(startDate);

      await trip.save();
      res.json({ success: true, trip });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update trip status.' });
    }
  });

  return router;
}

module.exports = { createAdminRouter };
