/**
 * HILLSONWHEELS - E-COMMERCE ENGINE & SHOPPING SYSTEM
 * Complete luxury shopping, cart, address book, multi-payment gateway,
 * order management, tracking, tax invoices, and reviews.
 */
(function(window) {
  'use strict';

  const STORAGE_CART_KEY = 'hsw_ecommerce_cart_v2';
  const STORAGE_ADDRESS_KEY = 'hsw_last_address';

  // Comprehensive Product Master Definition
  const PRODUCTS_DB = {
    'buransh-honey': {
      id: 'buransh-honey',
      name: 'Organic Buransh Honey',
      category: 'Honey',
      origin: 'Chamoli · 2,450m',
      district: 'Chamoli',
      altitude: '2,450 m',
      farmer: 'Pahadi Traditional Beekeepers Guild',
      harvest: 'Spring Wild Rhododendron Bloom',
      soil: 'Scarlet Deodar & Oak Groves',
      cert: 'Raw, Unheated, Muslin Filtered',
      photoKey: 'buransh-honey',
      gallery: ['buransh-honey', 'buranshtree', 'deodar'],
      tagline: 'Wild rhododendron nectar gathered in spring. Raw, unheated, filtered through muslin cloth.',
      story: 'Harvested from wild scarlet rhododendron forests clinging to the high slopes of Chamoli. Mountain bees collect nectar in early spring when the valleys burst into scarlet bloom. Never pasteurized or blended.',
      nutrition: ['Pure Fructose & Glucose: 82%', 'Pollen Count: High Alpine Multi-Flora', 'Antioxidants: Quercetin & Rutin Rich', 'Zero Added Cane Sugars or Preservatives'],
      recipeKey: 'honey',
      rating: 4.9,
      reviewsCount: 42,
      inStock: 18,
      variants: [
        { sku: 'buransh-honey-250g', weight: '250g', label: '250g Glass Jar', price: 699, mrp: 850 },
        { sku: 'buransh-honey-500g', weight: '500g', label: '500g Glass Jar', price: 1299, mrp: 1600 },
        { sku: 'buransh-honey-1kg', weight: '1kg', label: '1kg Glass Jar', price: 2399, mrp: 3000 }
      ]
    },
    'chamoli-rajma': {
      id: 'chamoli-rajma',
      name: 'Organic Chamoli Rajma',
      category: 'Pulses',
      origin: 'Chamoli · Urgam Valley',
      district: 'Chamoli',
      altitude: '2,450 m',
      farmer: 'Nanda Devi Organic Grain Collective',
      harvest: 'Autumn Harvest 2025',
      soil: 'Glacial Mineral Slate Soil',
      cert: '100% Certified Heirloom Seed',
      photoKey: 'chamoli-rajma',
      gallery: ['chamoli-rajma', 'urgam', 'terraces'],
      tagline: 'Slow-grown high altitude kidney beans, buttery texture, naturally mineral-dense.',
      story: 'Grown on terraced fields watered by glacial streams in Urgam valley. These heirloom kidney beans have thin skins and cook to a creamy, melt-in-mouth richness with authentic mountain aroma.',
      nutrition: ['Plant Protein: 24g per 100g', 'Dietary Fibre: 16g', 'Rich in Iron, Potassium & Magnesium', 'Low Glycemic Index'],
      recipeKey: 'rajma',
      rating: 4.8,
      reviewsCount: 38,
      inStock: 35,
      variants: [
        { sku: 'chamoli-rajma-500g', weight: '500g', label: '500g Cloth Bag', price: 349, mrp: 420 },
        { sku: 'chamoli-rajma-1kg', weight: '1kg', label: '1kg Cloth Bag', price: 649, mrp: 800 }
      ]
    },
    'pahadi-pulses': {
      id: 'pahadi-pulses',
      name: 'Traditional Pahadi Mixed Pulses',
      category: 'Pulses',
      origin: 'Almora · Kumaon Ridge',
      district: 'Almora',
      altitude: '1,750 m',
      farmer: 'Women Farmers Self-Help Group Almora',
      harvest: 'November 2025',
      soil: 'Rain-fed Terraced Red Loam',
      cert: 'Natural Sun-dried, Stone-milled',
      photoKey: 'pahadi-pulses',
      gallery: ['pahadi-pulses', 'terraces', 'almora'],
      tagline: 'Traditional mixed Kumaoni dals (Gahat, Bhatt, Rainsh), hand-harvested & sun-dried.',
      story: 'A nutrient powerhouse mix of high-protein black soybean (Bhatt), horse gram (Gahat), and mountain red beans. Revered in Kumaoni households for warming winter soups and stews.',
      nutrition: ['Protein: 26g per 100g', 'Natural Polyphenols & Antioxidants', 'Rich in Dietary Iron & Zinc', 'Ancient Indigenous Grains'],
      recipeKey: 'rajma',
      rating: 4.7,
      reviewsCount: 29,
      inStock: 40,
      variants: [
        { sku: 'pahadi-pulses-500g', weight: '500g', label: '500g Pack', price: 289, mrp: 360 },
        { sku: 'pahadi-pulses-1kg', weight: '1kg', label: '1kg Pack', price: 549, mrp: 700 }
      ]
    },
    'mixed-spices': {
      id: 'mixed-spices',
      name: 'Stone-Ground Mountain Spices & Herb Salt',
      category: 'Spices',
      origin: 'Bageshwar · Kumaon',
      district: 'Bageshwar',
      altitude: '1,500 m',
      farmer: 'Traditional Spice Millers of Sarayu',
      harvest: 'Fresh Ground Weekly',
      soil: 'Wild Himalayan Slopes',
      cert: 'Zero Artificial Additives · Stone Ground',
      photoKey: 'mixed-spices',
      gallery: ['mixed-spices', 'terraces', 'kausani'],
      tagline: 'Sun-dried mountain spices ground on granite silbatta with wild mountain garlic.',
      story: 'Crafted rhythmically on granite Silbattas using wild Himalayan rock salt, hand-roasted cumin, coriander, mountain garlic, and sun-dried chillies. Elevates everyday dishes with smokey aroma.',
      nutrition: ['100% Whole Spice Essential Oils Intact', 'Unrefined Himalayan Rock Minerals', 'Zero Preservatives or Fillers', 'Fresh Hand-Ground Batches'],
      recipeKey: 'spices',
      rating: 5.0,
      reviewsCount: 56,
      inStock: 50,
      variants: [
        { sku: 'mixed-spices-200g', weight: '200g', label: '200g Earthen Jar', price: 399, mrp: 490 },
        { sku: 'mixed-spices-500g', weight: '500g', label: '500g Earthen Jar', price: 799, mrp: 1000 }
      ]
    },
    'garhwal-walnuts': {
      id: 'garhwal-walnuts',
      name: 'Garhwal Wild Kagzi Walnuts',
      category: 'Dry Fruits',
      origin: 'Uttarkashi · Harsil Valley',
      district: 'Uttarkashi',
      altitude: '2,620 m',
      farmer: 'Bhagirathi Orchard Growers',
      harvest: 'September 2025',
      soil: 'High Mountain Glacial Terraces',
      cert: 'Thin-Shelled Kagzi Heirloom',
      photoKey: 'garhwal-walnuts',
      gallery: ['garhwal-walnuts', 'osla', 'gangotri'],
      tagline: 'Thin-shelled mountain walnuts, cracks in palm, rich in natural omega oils.',
      story: 'Grown along the pristine Bhagirathi river basin near Harsil. These thin-shelled Kagzi walnuts can be cracked between two fingers and are loaded with natural buttery brain oils.',
      nutrition: ['Omega-3 ALA: 9.1g per 100g', 'Natural Vitamin E & Melatonin', 'Heart-Healthy Monounsaturated Fats', 'Raw Sun-Dried Kernel'],
      recipeKey: 'honey',
      rating: 4.9,
      reviewsCount: 31,
      inStock: 25,
      variants: [
        { sku: 'garhwal-walnuts-500g', weight: '500g', label: '500g Shell', price: 549, mrp: 680 },
        { sku: 'garhwal-walnuts-1kg', weight: '1kg', label: '1kg Shell', price: 999, mrp: 1300 }
      ]
    },
    'chilli-pickle': {
      id: 'chilli-pickle',
      name: 'Pithoragarh Yellow Chilli Mustard Pickle',
      category: 'Pickles',
      origin: 'Pithoragarh · Johar Valley',
      district: 'Pithoragarh',
      altitude: '1,960 m',
      farmer: 'Johari Village Recipe Artisans',
      harvest: 'Mustard Oil Cured 90 Days',
      soil: 'Mountain Organic Terraces',
      cert: 'Cold-pressed Mustard Oil Base',
      photoKey: 'chilli-pickle',
      gallery: ['chilli-pickle', 'munsiyari', 'terraces'],
      tagline: 'Fiery mountain yellow chilli pickle cured in cold-pressed mustard oil.',
      story: 'An artisanal 90-day sun-fermented pickle made by women artisans in Pithoragarh using heirloom round yellow chillies, coarse Rai mustard seeds, rock salt, and wood-pressed oil.',
      nutrition: ['Natural Probiotic Fermentation', 'Cold-Pressed Wood Churned Mustard Oil', 'No Synthetic Vinegar or Chemicals', 'Digestive Mountain Spices'],
      recipeKey: 'spices',
      rating: 4.8,
      reviewsCount: 22,
      inStock: 30,
      variants: [
        { sku: 'chilli-pickle-350g', weight: '350g', label: '350g Ceramic Jar', price: 259, mrp: 320 },
        { sku: 'chilli-pickle-700g', weight: '700g', label: '700g Ceramic Jar', price: 489, mrp: 600 }
      ]
    },
    'himalayan-herbs': {
      id: 'himalayan-herbs',
      name: 'Wild Alpine Herbs (Jambu & Gandharani)',
      category: 'Herbs',
      origin: 'Munsiyari · 2,800m',
      district: 'Pithoragarh',
      altitude: '2,800 m',
      farmer: 'Bhotia Alpine Gatherers Association',
      harvest: 'High Summer 2025',
      soil: 'Sub-alpine Rock Scree',
      cert: 'Wild Foraged Single-Batch',
      photoKey: 'himalayan-herbs',
      gallery: ['himalayan-herbs', 'bednibugyal', 'munsiyari'],
      tagline: 'Wild gathered Jambu (Faran), Gandharani & mountain thyme from Panchachuli slopes.',
      story: 'Foraged by tribal Bhotia shepherds on alpine meadows above 2,800m. Essential for authentic Pahadi tempering (Tadka), lending an unmistakable garlicky-herbal aroma.',
      nutrition: ['Wild Essential Oils (Thymol & Carvacrol)', 'Traditional Ayurvedic Digestive Tonic', 'Sun-Dried at High Altitude', 'Pesticide-Free Alpine Growth'],
      recipeKey: 'rajma',
      rating: 4.9,
      reviewsCount: 34,
      inStock: 45,
      variants: [
        { sku: 'himalayan-herbs-100g', weight: '100g', label: '100g Heritage Tin', price: 329, mrp: 400 },
        { sku: 'himalayan-herbs-250g', weight: '250g', label: '250g Heritage Tin', price: 699, mrp: 900 }
      ]
    },
    'aipan-weave': {
      id: 'aipan-weave',
      name: 'Handwoven Aipan Ritual Textile',
      category: 'Handicrafts',
      origin: 'Almora Craft Guild',
      district: 'Almora',
      altitude: '1,640 m',
      farmer: 'Lata Bisht & Almora Weavers Guild',
      harvest: 'Hand-dyed & Handloom Loomed',
      soil: 'Indigenous Mountain Wool & Cotton',
      cert: 'GI Heritage Uttarakhand Certified',
      photoKey: 'aipan-weave',
      gallery: ['aipan-weave', 'aipanartisan', 'almora'],
      tagline: 'Traditional handloom table runner and ritual wall weave with sacred Aipan motifs.',
      story: 'Aipan is the ancient ritual geometric art form of Kumaon. Handwoven by master women artisans on traditional wooden pit looms with natural Geru terracotta dye and white rice paste patterns.',
      nutrition: ['100% Handspun Natural Cotton & Wool', 'Natural Mineral Dyes (Geru Clay)', 'Zero Synthetic Acrylics', 'Supports 12 Artisan Families'],
      recipeKey: 'spices',
      rating: 5.0,
      reviewsCount: 17,
      inStock: 9,
      variants: [
        { sku: 'aipan-weave-standard', weight: 'Standard', label: 'Standard (3 × 2 ft)', price: 899, mrp: 1200 },
        { sku: 'aipan-weave-deluxe', weight: 'Grand Loom', label: 'Grand (5 × 3 ft)', price: 1599, mrp: 2200 }
      ]
    },
    'dry-apricot': {
      id: 'dry-apricot',
      name: 'Sun-Dried Mountain Apricots (Chuli)',
      category: 'Dry Fruits',
      origin: 'Gangolihat · Pithoragarh',
      district: 'Pithoragarh',
      altitude: '1,780 m',
      farmer: 'Kumaon Rooftop Sun-Driers Society',
      harvest: 'July 2025',
      soil: 'Temperate Fruit Belts',
      cert: 'Unsulphured Natural Sun Cure',
      photoKey: 'dry-apricot',
      gallery: ['dry-apricot', 'kausani', 'binsar'],
      tagline: 'Wild sweet mountain apricots sun-dried on slate rooftops without sulphur.',
      story: 'Handpicked from wild orchards in Gangolihat and naturally cured under intense Himalayan UV sunlight on slate rooftops. Deep amber color, tart-sweet taste, and edible apricot almond kernel inside.',
      nutrition: ['Rich in Vitamin A (Beta-Carotene)', 'High Soluble Fibre for Digestion', 'Zero Added Sugar or Sulphur Dioxide', '100% Raw Dried Whole Fruit'],
      recipeKey: 'honey',
      rating: 4.8,
      reviewsCount: 26,
      inStock: 24,
      variants: [
        { sku: 'dry-apricot-400g', weight: '400g', label: '400g Pouch', price: 459, mrp: 580 },
        { sku: 'dry-apricot-800g', weight: '800g', label: '800g Pouch', price: 849, mrp: 1100 }
      ]
    },
    'wild-timur': {
      id: 'wild-timur',
      name: 'Wild Himalayan Timur Pepper',
      category: 'Spices',
      origin: 'Pithoragarh · 2,200m',
      district: 'Pithoragarh',
      altitude: '2,200 m',
      farmer: 'Johar Alpine Foragers',
      harvest: 'Autumn Harvest 2025',
      soil: 'High Mountain Limestone Slopes',
      cert: '100% Wild Foraged Organic',
      photoKey: 'wild-timur',
      gallery: ['wild-timur', 'munsiyari', 'bednibugyal'],
      tagline: 'Citrusy, electric, numbing wild Himalayan peppercorns hand-foraged in high valleys.',
      story: 'Foraged from wild thorny trees growing along high mountain passes in Pithoragarh. Known for its intense zesty citrus aroma and tongue-tingling numbing sensation, Timur is the secret spice of authentic mountain chutneys and curries.',
      nutrition: ['Rich in Essential Oils (Limonene & Linalool)', 'Ayurvedic Digestive & Warming Herb', 'High Natural Antioxidants', 'Hand-Cleaned & Sun-Dried'],
      recipeKey: 'spices',
      rating: 4.9,
      reviewsCount: 19,
      inStock: 25,
      variants: [
        { sku: 'wild-timur-pepper-100g', weight: '100g', label: '100g Pouch', price: 349, mrp: 420 }
      ]
    }
  };

  function getImageUrl(k) {
    if (!k) return (window.PHOTO && window.PHOTO.honey) || '';
    if (typeof k === 'string' && (k.startsWith('http://') || k.startsWith('https://') || k.startsWith('data:') || k.startsWith('/') || k.startsWith('./'))) {
      return k;
    }
    return (window.PHOTO && window.PHOTO[k]) || (window.PHOTO && window.PHOTO.honey) || '';
  }

  async function fetchCatalog() {
    try {
      const res = await fetch('/api/catalog');
      if (res.ok) {
        const items = await res.json();
        if (Array.isArray(items) && items.length) {
          registerCatalog(items);
        }
      }
    } catch (e) {
      console.warn('EcommerceStore: live catalog sync fallback', e);
    }
  }

  function registerCatalog(items) {
    if (!Array.isArray(items)) return;
    items.forEach(p => {
      const id = p.id || (p.sku ? p.sku.split('-')[0] : 'prod_' + Math.random().toString(36).substr(2,9));
      const sku = p.sku || id;
      const unitPrice = Number(p.unitPrice) || 0;
      const mrp = Number(p.mrp !== undefined ? p.mrp : p.unitPrice) || unitPrice;

      if (!PRODUCTS_DB[id]) {
        PRODUCTS_DB[id] = {
          id: id,
          sku: sku,
          name: p.name,
          category: p.category || 'Mountain Produce',
          origin: p.origin || 'Uttarakhand',
          district: p.origin ? p.origin.split('·')[0].trim() : 'Chamoli',
          altitude: p.origin && p.origin.includes('·') ? p.origin.split('·')[1].trim() : '2,200 m',
          farmer: p.farmer || 'Pahadi Traditional Producers Guild',
          harvest: p.harvest || 'Alpine Mountain Harvest',
          soil: p.soil || 'Glacial Mineral Slate Soil',
          cert: p.cert || 'Certified Pure Himalayan Origin',
          photoKey: p.photoKey || 'p1',
          gallery: [p.photoKey || 'p1', 'land', 'village'],
          tagline: p.description || `${p.name} from high valleys of Uttarakhand.`,
          story: p.description || 'Small-batch harvested from the pristine high slopes of Uttarakhand.',
          nutrition: Array.isArray(p.benefits) && p.benefits.length ? p.benefits : ['100% Pure Mountain Harvest', 'Zero Preservatives or Chemicals'],
          recipeKey: 'honey',
          rating: Number(p.rating || 4.9),
          reviewsCount: Number(p.reviewsCount || 0),
          inStock: Number(p.inStock !== undefined ? p.inStock : 20),
          unitPrice: unitPrice,
          mrp: mrp,
          variants: [
            {
              sku: sku,
              weight: p.weight || p.variant || 'Standard',
              label: p.variant || p.weight || 'Standard Pack',
              price: unitPrice,
              mrp: mrp
            }
          ]
        };
      } else {
        const existing = PRODUCTS_DB[id];
        existing.inStock = Number(p.inStock !== undefined ? p.inStock : existing.inStock);
        existing.name = p.name || existing.name;
        existing.unitPrice = unitPrice;
        existing.mrp = mrp;
        if (p.photoKey) existing.photoKey = p.photoKey;
        if (p.origin) existing.origin = p.origin;
        if (p.description) {
          existing.tagline = p.description;
          existing.story = p.description;
        }
        
        const varIdx = existing.variants.findIndex(v => v.sku === sku);
        if (varIdx > -1) {
          existing.variants[varIdx].price = unitPrice;
          existing.variants[varIdx].mrp = mrp;
          existing.variants[varIdx].weight = p.weight || p.variant || existing.variants[varIdx].weight;
          existing.variants[varIdx].label = p.variant || p.weight || existing.variants[varIdx].label;
        } else {
          existing.variants.push({
            sku: sku,
            weight: p.weight || p.variant || 'Pack',
            label: p.variant || p.weight || 'Pack',
            price: unitPrice,
            mrp: mrp
          });
        }
      }

      // Also register direct alias by SKU
      if (sku && sku !== id) {
        PRODUCTS_DB[sku] = PRODUCTS_DB[id];
      }
    });
  }

  /* ==========================================================================
     ECOMMERCE STATE MANAGER
     ========================================================================== */
  const state = {
    cart: [],
    appliedCoupon: null,
    selectedShippingMethod: { id: 'standard', name: 'Direct Mountain Dispatch (3-5 Days)', cost: 0 },
    giftOptions: { isGift: false, pineBox: false, giftMessage: '' },
    shippingAddress: {
      fullName: '',
      phone: '',
      altPhone: '',
      pincode: '',
      house: '',
      street: '',
      landmark: '',
      city: '',
      state: '',
      type: 'Home',
      saveAddress: true
    },
    savedAddresses: [],
    paymentMethod: 'UPI',
    paymentDetails: {
      upiMethod: 'qr',
      upiId: '',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
      cardName: '',
      bankCode: 'SBI',
      codCaptcha: '5842',
      enteredCaptcha: ''
    },
    checkoutStep: 2,
    activePdpId: 'buransh-honey',
    activePdpVariantIndex: 0,
    pdpTab: 'provenance',
    currentUser: null
  };

  function init() {
    try {
      const savedCart = localStorage.getItem(STORAGE_CART_KEY);
      if (savedCart) {
        state.cart = JSON.parse(savedCart);
      } else {
        // Default starter item
        state.cart = [{
          sku: 'buransh-honey-250g',
          id: 'buransh-honey',
          name: 'Organic Buransh Honey',
          variant: '250g Glass Jar',
          weight: '250g',
          unitPrice: 699,
          mrp: 850,
          photoKey: 'honey',
          quantity: 1
        }];
        saveCart();
      }
      const savedAddr = localStorage.getItem(STORAGE_ADDRESS_KEY);
      if (savedAddr) {
        state.shippingAddress = { ...state.shippingAddress, ...JSON.parse(savedAddr) };
      }
    } catch (e) {
      console.warn('Cart initialization error:', e);
    }
    updateNavBadge();
    checkCurrentUser();
    fetchCatalog();
  }

  async function checkCurrentUser() {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
      if (res.ok) {
        const data = await res.json();
        state.currentUser = data.user;
        if (window.setAccountUser && !window.accountUser) {
          window.accountUser = data.user;
        }
        if (data.user.addresses && data.user.addresses.length) {
          state.savedAddresses = data.user.addresses;
          const def = data.user.addresses.find(a => a.isDefault) || data.user.addresses[0];
          if (def && !state.shippingAddress.fullName) {
            state.shippingAddress = { ...def, saveAddress: false };
          }
        }
        return data.user;
      } else {
        state.currentUser = null;
        return null;
      }
    } catch (e) {
      return null;
    }
  }

  function isLoggedIn() {
    return !!(state.currentUser || (window.accountUser && window.accountUser.id));
  }

  function syncCurrentUser(user) {
    state.currentUser = user || null;
    if (user && user.addresses && user.addresses.length) {
      state.savedAddresses = user.addresses;
      const def = user.addresses.find(a => a.isDefault) || user.addresses[0];
      if (def && !state.shippingAddress.fullName) {
        state.shippingAddress = { ...def, saveAddress: false };
      }
    }
    if (!user) {
      state.savedAddresses = [];
    }
  }

  async function proceedToCheckout() {
    closeCartDrawer();
    if (!state.cart || state.cart.length === 0) {
      showToast('Your mountain basket is empty. Please add items to proceed.', 'info');
      return;
    }
    if (!isLoggedIn()) {
      await checkCurrentUser();
    }
    if (!isLoggedIn()) {
      sessionStorage.setItem('hsw-auth-return', 'checkout');
      showToast('Please sign in or create an account before placing your order.', 'info');
      window.go('login');
      return;
    }
    window.go('checkout');
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(state.cart));
      updateNavBadge();
    } catch (e) {}
  }

  function updateNavBadge() {
    const totalQty = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const badges = document.querySelectorAll('.cart-nav-badge');
    badges.forEach(b => {
      b.textContent = totalQty;
      b.style.display = totalQty > 0 ? 'inline-flex' : 'none';
      b.classList.remove('bump');
      void b.offsetWidth;
      b.classList.add('bump');
    });
  }

  function showToast(message, type = 'info') {
    let container = document.getElementById('hsw-toasts');
    if (!container) {
      container = document.createElement('div');
      container.id = 'hsw-toasts';
      container.className = 'hsw-toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `hsw-toast ${type}`;
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : '✦';
    toast.innerHTML = `<span style="font-weight:700;font-size:15px">${icon}</span><div>${window.Security ? window.Security.escapeHTML(message) : message}</div>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3800);
  }

  /* Cart CRUD */
  function addToCart(productId, variantSku, quantity = 1, openDrawer = true) {
    let prod = PRODUCTS_DB[productId];
    if (!prod) {
      prod = Object.values(PRODUCTS_DB).find(p => 
        p.id === productId || 
        p.sku === productId || 
        p.sku === variantSku ||
        (p.variants && p.variants.some(v => v.sku === variantSku || v.sku === productId)) ||
        p.photoKey === productId ||
        (p.name && String(p.name).toLowerCase() === String(productId).toLowerCase())
      );
    }
    if (!prod) {
      console.warn('EcommerceStore: product not found for addToCart:', productId, variantSku);
      return;
    }

    let variant = null;
    if (variantSku && prod.variants) {
      variant = prod.variants.find(v => v.sku === variantSku);
    }
    if (!variant && prod.variants && prod.variants.length) {
      variant = prod.variants[0];
    }
    if (!variant) {
      variant = {
        sku: variantSku || prod.sku || prod.id,
        label: prod.variant || prod.weight || 'Standard Pack',
        weight: prod.weight || 'Standard',
        price: Number(prod.unitPrice) || 0,
        mrp: Number(prod.mrp !== undefined ? prod.mrp : prod.unitPrice) || 0
      };
    }

    const unitPrice = Number(variant.price);
    const mrp = Number(variant.mrp !== undefined ? variant.mrp : unitPrice);
    const maxStock = prod.inStock !== undefined ? prod.inStock : 99;
    const existingIndex = state.cart.findIndex(item => item.sku === variant.sku);
    const currentQty = existingIndex > -1 ? state.cart[existingIndex].quantity : 0;

    if (currentQty + quantity > maxStock) {
      showToast(`Stock limit reached. Only ${maxStock} unit(s) of "${prod.name}" available in mountain harvest.`, 'error');
      return;
    }

    if (existingIndex > -1) {
      state.cart[existingIndex].quantity += quantity;
      state.cart[existingIndex].unitPrice = unitPrice;
      state.cart[existingIndex].mrp = mrp;
    } else {
      state.cart.push({
        sku: variant.sku,
        id: prod.id,
        name: prod.name,
        variant: variant.label,
        weight: variant.weight,
        unitPrice: unitPrice,
        mrp: mrp,
        photoKey: prod.photoKey,
        inStock: maxStock,
        quantity
      });
    }

    saveCart();
    renderCartDrawer();
    if (window.MountainAudio && typeof window.MountainAudio.chime === 'function') {
      window.MountainAudio.chime(880, 1.2);
    }
    showToast(`Added "${prod.name} (${variant.weight})" to your Mountain Basket`, 'success');

    if (openDrawer) {
      openCartDrawer();
    }
  }

  function updateItemQty(sku, delta) {
    const item = state.cart.find(i => i.sku === sku);
    if (!item) return;
    const prod = PRODUCTS_DB[item.id] || Object.values(PRODUCTS_DB).find(p => p.id === item.id || p.variants.some(v => v.sku === sku));
    const maxStock = (prod && prod.inStock) || item.inStock || 99;

    if (delta > 0 && item.quantity + delta > maxStock) {
      showToast(`Stock limit reached. Maximum ${maxStock} unit(s) available for "${item.name}".`, 'error');
      return;
    }

    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(sku);
      return;
    }
    saveCart();
    renderCartDrawer();
    if (window.cur === 'cart' || window.cur === 'checkout') {
      window.go(window.cur, 1);
    }
  }

  function getCartCount() {
    return state.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function removeFromCart(sku) {
    const item = state.cart.find(i => i.sku === sku);
    state.cart = state.cart.filter(i => i.sku !== sku);
    saveCart();
    renderCartDrawer();
    if (item) showToast(`Removed "${item.name}" from basket`, 'info');
    if (window.cur === 'cart' || window.cur === 'checkout') {
      window.go(window.cur, 1);
    }
  }

  function clearCart() {
    state.cart = [];
    state.appliedCoupon = null;
    saveCart();
    renderCartDrawer();
    if (window.cur === 'cart' || window.cur === 'checkout') {
      window.go(window.cur, 1);
    }
  }

  function getSubtotal() {
    return state.cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }

  function getDiscount() {
    if (!state.appliedCoupon) return 0;
    return state.appliedCoupon.discount || 0;
  }

  function getShippingFee() {
    if (state.appliedCoupon && state.appliedCoupon.freeShipping) return 0;
    return state.selectedShippingMethod.cost || 0;
  }

  function getGiftFee() {
    return state.giftOptions.pineBox ? 149 : 0;
  }

  function getTotal() {
    const sub = getSubtotal();
    if (sub === 0) return 0;
    return Math.max(0, sub + getShippingFee() + getGiftFee() - getDiscount());
  }

  async function applyCoupon(code) {
    if (!code || !code.trim()) {
      showToast('Please enter a coupon code', 'error');
      return;
    }
    const cleanCode = code.trim().toUpperCase();
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode, cartTotal: getSubtotal() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid coupon code');

      state.appliedCoupon = data;
      showToast(`Coupon "${data.code}" applied! Saved ₹${data.discount}`, 'success');
      if (window.MountainAudio) window.MountainAudio.chime(1056, 1.5);
      renderCartDrawer();
      if (window.cur === 'cart' || window.cur === 'checkout') window.go(window.cur, 1);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  function removeCoupon() {
    state.appliedCoupon = null;
    showToast('Coupon removed', 'info');
    renderCartDrawer();
    if (window.cur === 'cart' || window.cur === 'checkout') window.go(window.cur, 1);
  }

  async function lookupPincode(pin) {
    if (!/^\d{6}$/.test(pin)) return;
    try {
      const res = await fetch(`/api/pincode/${pin}`);
      if (res.ok) {
        const data = await res.json();
        const cityInput = document.getElementById('addr-city');
        const stateInput = document.getElementById('addr-state');
        if (cityInput) cityInput.value = data.city;
        if (stateInput) stateInput.value = data.state;
        state.shippingAddress.city = data.city;
        state.shippingAddress.state = data.state;
        state.shippingAddress.pincode = pin;
        showToast(`PIN Code verified: ${data.city}, ${data.state}`, 'success');
      }
    } catch (e) {}
  }

  /* Slide-over Cart Drawer */
  function openCartDrawer() {
    if (window.MountainAudio && typeof window.MountainAudio.chime === 'function') {
      window.MountainAudio.chime(792, 1.2);
    }
    renderCartDrawer();
    const d = document.getElementById('cart-drawer');
    const b = document.getElementById('cart-drawer-backdrop');
    if (d) d.classList.add('o');
    if (b) b.classList.add('o');
  }

  function closeCartDrawer() {
    const d = document.getElementById('cart-drawer');
    const b = document.getElementById('cart-drawer-backdrop');
    if (d) d.classList.remove('o');
    if (b) b.classList.remove('o');
  }

  function renderCartDrawer() {
    const d = document.getElementById('cart-drawer');
    if (!d) return;

    const items = state.cart;
    const subtotal = getSubtotal();
    const discount = getDiscount();
    const total = getTotal();
    const freeThreshold = 2000;
    const rem = freeThreshold - subtotal;
    const pct = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

    if (items.length === 0) {
      d.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(26,27,24,0.12);padding-bottom:18px">
          <div><div class="lab">Mountain Basket</div><h2 style="font-size:24px;margin:2px 0">Your Bag is Empty</h2></div>
          <span style="font-size:12px;cursor:pointer;opacity:.6;padding:4px" onclick="EcommerceStore.closeCartDrawer()">Close</span>
        </div>
        <div style="text-align:center;padding:60px 20px;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center">
          <div style="font-size:48px;margin-bottom:16px;opacity:0.6"></div>
          <h3 style="font-size:20px;margin-bottom:8px">No mountain harvest selected yet</h3>
          <p style="font-size:13px;opacity:0.75;max-width:260px;line-height:1.6;margin-bottom:24px">Explore our handcrafted organic honey, stone-ground spices, and heirloom pulses from Uttarakhand.</p>
          <button class="btn on" onclick="EcommerceStore.closeCartDrawer();window.go('bazaar')">Explore Pahadi Bazaar</button>
        </div>
      `;
      return;
    }

    d.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(26,27,24,0.12);padding-bottom:16px">
        <div><div class="lab">Mountain Harvest Basket</div><h2 style="font-size:24px;margin:2px 0">Your Bag (${items.reduce((s,i)=>s+i.quantity,0)})</h2></div>
        <span style="font-size:12px;cursor:pointer;opacity:.6;padding:4px;font-weight:600" onclick="EcommerceStore.closeCartDrawer()">✕ CLOSE</span>
      </div>

      <!-- Free Gift Box Progress Bar -->
      <div style="background:rgba(197,168,105,0.12);padding:12px 14px;border-radius:4px;margin:14px 0;border:1px solid rgba(197,168,105,0.3)">
        <div style="font-size:11px;font-weight:600;display:flex;justify-content:space-between;color:var(--tx-dark)">
          <span>${rem <= 0 ? '✓ Free Hand-Carved Pine Gift Crate Unlocked!' : `Add ₹${rem} more for a Free Heritage Pine Gift Crate`}</span>
          <span>${pct}%</span>
        </div>
        <div style="background:rgba(0,0,0,0.08);height:6px;border-radius:99px;margin-top:6px;overflow:hidden">
          <div style="background:var(--gold);height:100%;width:${pct}%;transition:width .4s"></div>
        </div>
      </div>

      <!-- Items List -->
      <div style="flex:1;overflow-y:auto;padding-right:4px">
        ${items.map(item => `
          <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid rgba(26,27,24,0.08);align-items:center">
            <div style="width:68px;height:68px;background-image:url('${getImageUrl(item.photoKey)}');background-size:cover;background-position:center;border-radius:3px;flex-shrink:0"></div>
            <div style="flex:1;min-width:0">
              <h4 style="font-size:14px;margin:0 0 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.name}</h4>
              <div style="font-size:11px;color:#797f74;margin-bottom:6px">${item.variant}</div>
              <div style="display:flex;justify-content:space-between;align-items:center">
                <div class="pdp-qty-stepper" style="transform:scale(0.85);transform-origin:left center">
                  <button onclick="EcommerceStore.updateItemQty('${item.sku}', -1)">−</button>
                  <span>${item.quantity}</span>
                  <button onclick="EcommerceStore.updateItemQty('${item.sku}', 1)">+</button>
                </div>
                <div style="font-weight:700;font-size:14px">₹ ${item.unitPrice * item.quantity}</div>
              </div>
            </div>
            <button style="border:none;background:none;color:#991b1b;cursor:pointer;padding:4px;font-size:14px;opacity:0.6" title="Remove" onclick="EcommerceStore.removeFromCart('${item.sku}')">✕</button>
          </div>
        `).join('')}

        <!-- Pine Gift Crate Addon -->
        <label style="display:flex;align-items:center;gap:10px;margin-top:14px;background:#fff;padding:10px 12px;border:1px solid rgba(26,27,24,0.1);border-radius:4px;cursor:pointer;font-size:12px">
          <input type="checkbox" ${state.giftOptions.pineBox ? 'checked' : ''} onchange="EcommerceStore.togglePineBox(this.checked)" style="accent-color:var(--gold)">
          <div><b>Add Handcrafted Pine Wood Gift Crate</b> <span style="color:var(--terra);font-weight:600">(+₹149)</span><div style="font-size:10.5px;color:#797f74">Includes hand-waxed pine box & personalized mountain postcard.</div></div>
        </label>
      </div>

      <!-- Footer Summary -->
      <div style="border-top:1px solid rgba(26,27,24,0.15);padding-top:14px;margin-top:auto">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:13px"><span style="opacity:.8">Items Subtotal</span><span style="font-weight:600">₹ ${subtotal}</span></div>
        ${discount > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:13px;color:#047857"><span>Coupon (${state.appliedCoupon.code})</span><span>− ₹ ${discount}</span></div>` : ''}
        ${state.giftOptions.pineBox ? `<div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:13px"><span>Pine Gift Crate</span><span>₹ 149</span></div>` : ''}
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:13px"><span style="opacity:.8">Mountain Direct Shipping</span><span style="color:var(--terra);font-weight:600">FREE</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:16px;font-size:18px;font-weight:700;border-top:1px solid rgba(26,27,24,0.1);padding-top:8px">
          <span>Total Amount</span>
          <span>₹ ${total}</span>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn on" style="flex:1.4;padding:13px;font-size:11px" onclick="EcommerceStore.proceedToCheckout()">Proceed to Checkout →</button>
          <button class="btn" style="flex:1;padding:13px;font-size:11px" onclick="EcommerceStore.closeCartDrawer();window.go('cart')">View Bag</button>
        </div>
      </div>
    `;
  }

  function togglePineBox(checked) {
    state.giftOptions.pineBox = checked;
    renderCartDrawer();
    if (window.cur === 'cart' || window.cur === 'checkout') window.go(window.cur, 1);
  }

  /* Product Detail Page Renderer */
  function renderPDP(productId) {
    let prod = PRODUCTS_DB[productId];
    if (!prod) {
      prod = Object.values(PRODUCTS_DB).find(p => 
        p.id === productId || 
        p.sku === productId || 
        (p.variants && p.variants.some(v => v.sku === productId)) ||
        p.photoKey === productId ||
        (p.name && String(p.name).toLowerCase() === String(productId).toLowerCase())
      ) || PRODUCTS_DB['buransh-honey'];
    }
    state.activePdpId = prod.id;
    const selVariant = (prod.variants && (prod.variants[state.activePdpVariantIndex] || prod.variants[0])) || { price: prod.unitPrice || 0, mrp: prod.mrp || prod.unitPrice || 0, label: 'Standard Pack' };
    const qty = state.pdpQty || 1;
    const saveAmt = Math.max(0, (selVariant.mrp || selVariant.price) - selVariant.price);
    const savePct = selVariant.mrp && selVariant.mrp > selVariant.price ? Math.round((saveAmt / selVariant.mrp) * 100) : 0;
    const mainPhotoUrl = getImageUrl(prod.photoKey);
    const galleryItems = Array.isArray(prod.gallery) && prod.gallery.length ? prod.gallery : [prod.photoKey || 'p1'];

    return `
      <div class="light" style="padding-top:110px">
        <div class="lab" style="margin-bottom:18px">
          <span style="cursor:pointer" onclick="window.go('bazaar')">Pahadi Bazaar</span> / 
          <span>${prod.category || 'Produce'}</span> / 
          <span>${prod.name}</span>
        </div>

        <div class="pdp-grid">
          <!-- Gallery -->
          <div>
            <div id="pdp-main-img" class="pdp-gallery-main" style="background-image:url('${mainPhotoUrl}')">
              <span class="ecom-tag-stock">In Stock · ${prod.inStock !== undefined ? prod.inStock : 20} Harvest Units</span>
            </div>
            <div class="pdp-thumbs">
              ${galleryItems.map((k, i) => `
                <div class="pdp-thumb ${i === 0 ? 'active' : ''}" style="background-image:url('${getImageUrl(k)}')" onclick="EcommerceStore.changePdpImage('${k}', this)"></div>
              `).join('')}
            </div>
          </div>

          <!-- Product Details & Purchase Form -->
          <div>
            <div class="lab">${prod.origin || 'Uttarakhand'}</div>
            <h1 style="font-size:clamp(28px, 3.5vw, 44px);margin:6px 0 10px;line-height:1.2">${prod.name}</h1>
            
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
              <div class="ecom-rating-pill">★ ${prod.rating || 5}</div>
              <span style="font-size:12.5px;color:#5d6357;cursor:pointer" onclick="EcommerceStore.switchPdpTab('reviews')">${prod.reviewsCount || 0} Verified Mountain Reviews</span>
            </div>

            <p style="font-size:14.5px;line-height:1.8;opacity:.9;margin-bottom:20px">${prod.tagline || prod.description || 'Authentic mountain harvest from Uttarakhand.'}</p>

            <div class="pdp-price-row">
              <span class="pdp-current-price">₹ ${selVariant.price}</span>
              ${selVariant.mrp && selVariant.mrp > selVariant.price ? `<span class="pdp-mrp-price">MRP ₹ ${selVariant.mrp}</span>` : ''}
              ${savePct > 0 ? `<span class="pdp-save-badge">Save ₹${saveAmt} (${savePct}% OFF)</span>` : ''}
            </div>

            <!-- Variant Selector -->
            ${prod.variants && prod.variants.length > 1 ? `
              <div class="lab" style="margin-top:16px">Select Pack / Net Weight</div>
              <div class="chips" style="margin:10px 0 20px">
                ${prod.variants.map((v, i) => `
                  <span class="chip ${i === state.activePdpVariantIndex ? 'on' : ''}" onclick="EcommerceStore.selectPdpVariant(${i})">${v.label} (₹${v.price})</span>
                `).join('')}
              </div>
            ` : ''}

            <!-- Quantity Selector -->
            <div class="lab" style="margin-bottom:8px">Quantity</div>
            <div class="pdp-qty-stepper" style="margin-bottom:24px">
              <button onclick="EcommerceStore.updatePdpQty(-1)">−</button>
              <span id="pdp-qty-num">${qty}</span>
              <button onclick="EcommerceStore.updatePdpQty(1)">+</button>
            </div>

            <!-- Action Buttons -->
            <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:24px">
              <button class="btn" style="padding:14px 28px;flex:1" onclick="EcommerceStore.addToCart('${prod.id}', '${selVariant.sku}', ${qty})">Add to Bag</button>
              <button class="btn on" style="padding:14px 28px;flex:1" onclick="EcommerceStore.buyNow('${prod.id}', '${selVariant.sku}', ${qty})">Instant Buy Now</button>
            </div>

            <!-- Trust Highlights -->
            <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:14px;border-top:1px solid rgba(26,27,24,0.12);padding-top:20px;font-size:12px;color:#454b40">
              <div style="display:flex;gap:8px;align-items:center"> 100% Raw Himalayan Harvest</div>
              <div style="display:flex;gap:8px;align-items:center"><span></span> Direct Farmer Cooperative</div>
              <div style="display:flex;gap:8px;align-items:center"> Zero Plastic Eco Packaging</div>
              <div style="display:flex;gap:8px;align-items:center"> Free Mountain Direct Transit</div>
            </div>
          </div>
        </div>

        <!-- Tabbed Information (Provenance, Recipe, Nutrition, Reviews) -->
        <div class="ecom-tabs-nav">
          <button class="ecom-tab-btn ${state.pdpTab === 'provenance' ? 'active' : ''}" onclick="EcommerceStore.switchPdpTab('provenance')">Provenance & Soil</button>
          <button class="ecom-tab-btn ${state.pdpTab === 'nutrition' ? 'active' : ''}" onclick="EcommerceStore.switchPdpTab('nutrition')">Purity & Metrics</button>
          <button class="ecom-tab-btn ${state.pdpTab === 'recipe' ? 'active' : ''}" onclick="EcommerceStore.switchPdpTab('recipe')">Mountain Kitchen Recipe</button>
          <button class="ecom-tab-btn ${state.pdpTab === 'reviews' ? 'active' : ''}" onclick="EcommerceStore.switchPdpTab('reviews')">Customer Reviews (${prod.reviewsCount || 0})</button>
        </div>

        <div id="pdp-tab-content">
          ${renderPdpTabContent(prod)}
        </div>

        <!-- Frequently Bought Together Mountain Bundle -->
        <div style="margin-top:50px;background:var(--ivory-card);border:1px solid rgba(26,27,24,0.12);padding:28px;border-radius:4px">
          <div class="lab">Himalayan Pairing Collection</div>
          <h3 style="font-size:24px;margin:6px 0 16px">Frequently Enjoyed Together</h3>
          <div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">
            <div style="display:flex;gap:10px;align-items:center">
              <div style="width:70px;height:70px;background-image:url('${getImageUrl(prod.photoKey)}');background-size:cover;border-radius:3px"></div>
              <div style="font-size:18px;font-weight:700">+</div>
              <div style="width:70px;height:70px;background-image:url('${getImageUrl('p3')}');background-size:cover;border-radius:3px"></div>
              <div style="font-size:18px;font-weight:700">+</div>
              <div style="width:70px;height:70px;background-image:url('${getImageUrl('p4')}');background-size:cover;border-radius:3px"></div>
            </div>
            <div style="flex:1;min-width:220px">
              <div style="font-weight:600;font-size:15px">${prod.name} + Stone-Ground Spices + Garhwal Walnuts</div>
              <div style="font-size:13px;color:#797f74;margin-top:2px">Mountain Harvest Selection · Direct from Chamoli & Kumaon</div>
            </div>
            <button class="btn on" onclick="EcommerceStore.addBundleToCart('${prod.id}')">+ Add Bundle to Bag</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderPdpTabContent(prod) {
    switch (state.pdpTab) {
      case 'provenance':
        return `
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:16px;background:var(--ivory-card);padding:24px;border-radius:4px;border:1px solid rgba(26,27,24,0.1)">
            <div><div class="lab">Origin Valley</div><p style="font-size:16px;font-weight:600;margin-top:4px">${prod.origin}</p></div>
            <div><div class="lab">Harvest Altitude</div><p style="font-size:16px;font-weight:600;margin-top:4px">${prod.altitude}</p></div>
            <div><div class="lab">Farmer Guild / Cooperative</div><p style="font-size:16px;font-weight:600;margin-top:4px">${prod.farmer}</p></div>
            <div><div class="lab">Harvest Season</div><p style="font-size:16px;font-weight:600;margin-top:4px">${prod.harvest}</p></div>
            <div><div class="lab">Soil & Water Source</div><p style="font-size:16px;font-weight:600;margin-top:4px">${prod.soil}</p></div>
            <div><div class="lab">Purity Certification</div><p style="font-size:16px;font-weight:600;margin-top:4px">${prod.cert}</p></div>
          </div>
          <p style="margin-top:20px;font-size:14.5px;line-height:1.85;opacity:.88">${prod.story}</p>
        `;
      case 'nutrition':
        return `
          <div style="background:var(--ivory-card);padding:24px;border-radius:4px;border:1px solid rgba(26,27,24,0.1)">
            <h3 style="font-size:20px;margin-bottom:14px">Mountain Botanical Metrics</h3>
            <ul style="margin:0 0 0 20px;font-size:14px;line-height:1.9;color:#3f443b">
              ${prod.nutrition.map(n => `<li><b>${n}</b></li>`).join('')}
            </ul>
          </div>
        `;
      case 'recipe':
        const rKey = prod.recipeKey || 'honey';
        const recipe = window.RECIPES_DATA ? window.RECIPES_DATA[rKey] : null;
        if (!recipe) return '<p>Recipe coming soon.</p>';
        return `
          <div style="background:var(--ivory-card);padding:24px;border-radius:4px;border:1px solid rgba(26,27,24,0.1)">
            <div class="lab">Traditional Preparation</div>
            <h3 style="font-size:24px;margin:4px 0">${recipe.name}</h3>
            <p style="font-size:12.5px;color:var(--terra);margin-bottom:12px">${recipe.time} · Serves ${recipe.serves}</p>
            <p style="font-size:14px;line-height:1.75;margin-bottom:18px">${recipe.desc}</p>
            <div style="display:grid;grid-template-columns:1fr 1.2fr;gap:24px">
              <div>
                <div class="lab">Mountain Ingredients</div>
                <ul style="margin:8px 0 0 20px;font-size:13.5px;line-height:1.8">${recipe.items.map(i => `<li>${i}</li>`).join('')}</ul>
              </div>
              <div>
                <div class="lab">Culinary Method</div>
                <ol style="margin:8px 0 0 20px;font-size:13.5px;line-height:1.8">${recipe.steps.map(s => `<li>${s}</li>`).join('')}</ol>
              </div>
            </div>
          </div>
        `;
      case 'reviews':
        return `
          <div style="display:grid;grid-template-columns:1.3fr 1fr;gap:36px;align-items:start">
            <div>
              <div class="review-item">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <b>Sunita Rawat</b>
                  <span class="star-rating">★★★★★</span>
                </div>
                <div style="font-size:11px;color:#047857;margin:2px 0 6px">✓ Verified Buyer · Dehradun</div>
                <p style="font-size:13.5px;line-height:1.7;color:#3f443b">The taste takes me back to my grandmother's home in Chamoli. The aroma is unlike commercial store honey — subtle floral notes and rich dark amber texture.</p>
              </div>
              <div class="review-item">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <b>Col. Vikram Joshi</b>
                  <span class="star-rating">★★★★★</span>
                </div>
                <div style="font-size:11px;color:#047857;margin:2px 0 6px">✓ Verified Buyer · Noida</div>
                <p style="font-size:13.5px;line-height:1.7;color:#3f443b">Authentic high-altitude harvest. Delivery was swift with zero plastic packaging. Highly recommend to everyone who appreciates real purity.</p>
              </div>
            </div>

            <!-- Review Submission Form -->
            <div class="review-form-box">
              <div class="lab">Share Your Experience</div>
              <h3 style="font-size:20px;margin:4px 0 14px">Write a Mountain Review</h3>
              <form id="review-form" onsubmit="EcommerceStore.handleReviewSubmit(event, '${prod.id}')">
                <div class="ecom-input-field" style="margin-bottom:12px">
                  <label>Your Rating</label>
                  <select id="rev-rating" required>
                    <option value="5">★★★★★ (5 Stars - Exceptional)</option>
                    <option value="4">★★★★☆ (4 Stars - Very Good)</option>
                    <option value="3">★★★☆☆ (3 Stars - Good)</option>
                    <option value="2">★★☆☆☆ (2 Stars - Fair)</option>
                    <option value="1">★☆☆☆☆ (1 Star - Needs Work)</option>
                  </select>
                </div>
                <div class="ecom-input-field" style="margin-bottom:12px">
                  <label>Your Name</label>
                  <input id="rev-name" placeholder="E.g. Meera Negi" value="${state.currentUser ? state.currentUser.name : ''}" required>
                </div>
                <div class="ecom-input-field" style="margin-bottom:14px">
                  <label>Your Feedback</label>
                  <textarea id="rev-comment" rows="3" placeholder="Describe the aroma, flavour, or delivery experience…" required></textarea>
                </div>
                <button class="btn on" type="submit" style="width:100%">Submit Review</button>
              </form>
            </div>
          </div>
        `;
    }
  }

  function changePdpImage(photoKey, el) {
    const main = document.getElementById('pdp-main-img');
    const url = getImageUrl(photoKey);
    if (main && url) {
      main.style.backgroundImage = `url('${url}')`;
    }
    document.querySelectorAll('.pdp-thumb').forEach(t => t.classList.remove('active'));
    if (el) el.classList.add('active');
  }

  function selectPdpVariant(index) {
    state.activePdpVariantIndex = index;
    const prod = PRODUCTS_DB[state.activePdpId];
    if (prod) {
      window.go('product', 1);
    }
  }

  function updatePdpQty(delta) {
    const prod = PRODUCTS_DB[state.activePdpId] || Object.values(PRODUCTS_DB)[0];
    const maxStock = (prod && prod.inStock) || 99;
    let newQty = (state.pdpQty || 1) + delta;
    if (newQty < 1) newQty = 1;
    if (newQty > maxStock) {
      showToast(`Only ${maxStock} unit(s) available in mountain harvest.`, 'error');
      newQty = maxStock;
    }
    state.pdpQty = newQty;
    const num = document.getElementById('pdp-qty-num');
    if (num) num.textContent = state.pdpQty;
  }

  function switchPdpTab(tab) {
    state.pdpTab = tab;
    const prod = PRODUCTS_DB[state.activePdpId];
    const container = document.getElementById('pdp-tab-content');
    if (container && prod) {
      container.innerHTML = renderPdpTabContent(prod);
    }
    document.querySelectorAll('.ecom-tab-btn').forEach(b => {
      b.classList.toggle('active', b.textContent.toLowerCase().includes(tab));
    });
  }

  function buyNow(productId, variantSku, qty) {
    addToCart(productId, variantSku, qty, false);
    proceedToCheckout();
  }

  function addBundleToCart(productId) {
    addToCart(productId, `${productId}-500g` in PRODUCTS_DB[productId].variants ? `${productId}-500g` : PRODUCTS_DB[productId].variants[0].sku, 1, false);
    addToCart('mixed-spices', 'mixed-spices-200g', 1, false);
    addToCart('garhwal-walnuts', 'garhwal-walnuts-500g', 1, true);
    showToast('Mountain Pairing Collection added to Bag!', 'success');
  }

  async function handleReviewSubmit(e, sku) {
    e.preventDefault();
    const rating = document.getElementById('rev-rating').value;
    const name = document.getElementById('rev-name').value.trim();
    const comment = document.getElementById('rev-comment').value.trim();
    try {
      const res = await fetch(`/api/catalog/${sku}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, userName: name, comment })
      });
      if (!res.ok) throw new Error('Could not submit review.');
      showToast('Thank you! Your mountain review was published.', 'success');
      switchPdpTab('reviews');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  /* ==========================================================================
     FULL CART PAGE RENDERER
     ========================================================================== */
  function renderCartPage() {
    const items = state.cart;
    const subtotal = getSubtotal();
    const discount = getDiscount();
    const shipping = getShippingFee();
    const giftFee = getGiftFee();
    const total = getTotal();

    if (items.length === 0) {
      return `
        <div class="light" style="padding-top:120px;text-align:center;min-height:70vh;display:grid;place-items:center">
          <div>
            <div style="font-size:56px;margin-bottom:16px"></div>
            <h1 style="font-size:36px;margin-bottom:10px">Your Mountain Basket is Empty</h1>
            <p style="font-size:15px;color:#666d61;max-width:400px;margin:0 auto 24px;line-height:1.7">Explore the purity of Uttarakhand's high meadows, organic bee apiaries, and heirloom harvest.</p>
            <button class="btn on" onclick="window.go('bazaar')">Explore Pahadi Bazaar Catalog</button>
          </div>
        </div>
      `;
    }

    return `
      <div class="light" style="padding-top:110px">
        <div class="lab">Review Your Mountain Selection</div>
        <h1 style="font-size:42px;margin:6px 0 28px">Shopping Bag (${items.reduce((s,i)=>s+i.quantity,0)} Items)</h1>

        <div class="cart-page-grid">
          <!-- Items Column -->
          <div>
            ${items.map(item => `
              <div class="cart-item-row">
                <div class="cart-item-thumb" style="background-image:url('${window.PHOTO[item.photoKey] || window.PHOTO.honey}')"></div>
                <div style="flex:1">
                  <div class="lab" style="font-size:10px">Chamoli / Kumaon Harvest</div>
                  <h3 style="font-size:18px;margin:3px 0">${item.name}</h3>
                  <div style="font-size:12px;color:#797f74">${item.variant}</div>
                  <div style="display:flex;align-items:center;gap:12px;margin-top:8px">
                    <span style="font-size:16px;font-weight:700">₹ ${item.unitPrice}</span>
                    <span style="font-size:12px;color:#8c9187;text-decoration:line-through">₹ ${item.mrp}</span>
                  </div>
                </div>
                <div class="pdp-qty-stepper">
                  <button onclick="EcommerceStore.updateItemQty('${item.sku}', -1)">−</button>
                  <span>${item.quantity}</span>
                  <button onclick="EcommerceStore.updateItemQty('${item.sku}', 1)">+</button>
                </div>
                <div style="text-align:right;min-width:80px">
                  <div style="font-size:18px;font-weight:700">₹ ${item.unitPrice * item.quantity}</div>
                  <button style="border:none;background:none;color:#991b1b;cursor:pointer;font-size:11px;margin-top:6px;opacity:0.75" onclick="EcommerceStore.removeFromCart('${item.sku}')">Remove</button>
                </div>
              </div>
            `).join('')}

            <!-- Gift Wrap & Message Box -->
            <div style="background:var(--ivory-card);border:1px solid rgba(26,27,24,0.1);padding:20px;border-radius:4px;margin-top:20px">
              <label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:13px;font-weight:600">
                <input type="checkbox" ${state.giftOptions.pineBox ? 'checked' : ''} onchange="EcommerceStore.togglePineBox(this.checked)" style="accent-color:var(--gold)">
                <span>Gift Wrap in Authentic Mountain Pine Wood Crate (+ ₹149)</span>
              </label>
              ${state.giftOptions.pineBox ? `
                <div style="margin-top:14px">
                  <div class="lab">Personalized Mountain Postcard Message</div>
                  <textarea rows="2" placeholder="Write your heartfelt note for the recipient…" oninput="EcommerceStore.setGiftMessage(this.value)" style="width:100%;margin-top:6px;padding:8px 12px;border:1px solid rgba(26,27,24,0.2);border-radius:3px">${state.giftOptions.giftMessage || ''}</textarea>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Summary Column -->
          <div>
            <div class="cart-summary-box">
              <div class="lab">Order Summary</div>
              <h3 style="font-size:22px;margin:6px 0 18px">Payment Overview</h3>

              <!-- Coupon Code Input -->
              <div class="lab">Promotional Coupon</div>
              ${state.appliedCoupon ? `
                <div class="coupon-tag-badge" style="width:100%;justify-content:space-between;margin:8px 0 16px;padding:8px 12px">
                  <span>✓ <b>${state.appliedCoupon.code}</b> (${state.appliedCoupon.description})</span>
                  <span onclick="EcommerceStore.removeCoupon()" style="font-weight:700">✕</span>
                </div>
              ` : `
                <div class="coupon-input-group">
                  <input id="coupon-code-input" placeholder="HIMALAYA10">
                  <button class="btn on" style="padding:8px 16px;font-size:11px" onclick="EcommerceStore.applyCoupon(document.getElementById('coupon-code-input').value)">Apply</button>
                </div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">
                  <span class="coupon-tag-badge" onclick="EcommerceStore.applyCoupon('HIMALAYA10')">HIMALAYA10</span>
                  <span class="coupon-tag-badge" onclick="EcommerceStore.applyCoupon('PAHADI500')">PAHADI500</span>
                  <span class="coupon-tag-badge" onclick="EcommerceStore.applyCoupon('BURANSHFREE')">BURANSHFREE</span>
                </div>
              `}

              <div style="border-top:1px solid rgba(26,27,24,0.1);padding-top:14px;margin-top:14px">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px">
                  <span>Item Subtotal</span><span>₹ ${subtotal}</span>
                </div>
                ${discount > 0 ? `
                  <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;color:#047857;font-weight:600">
                    <span>Coupon Discount</span><span>− ₹ ${discount}</span>
                  </div>
                ` : ''}
                ${giftFee > 0 ? `
                  <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px">
                    <span>Pine Crate Packaging</span><span>₹ ${giftFee}</span>
                  </div>
                ` : ''}
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px">
                  <span>Mountain Direct Shipping</span><span style="color:var(--terra);font-weight:600">FREE</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px">
                  <span>Estimated GST & Local Taxes</span><span style="color:#797f74">Included</span>
                </div>

                <div style="display:flex;justify-content:space-between;font-size:20px;font-weight:700;border-top:1.5px solid rgba(26,27,24,0.15);padding-top:14px;margin:16px 0 24px">
                  <span>Total Payable</span><span>₹ ${total}</span>
                </div>

                <button class="btn on" style="width:100%;padding:16px" onclick="EcommerceStore.proceedToCheckout()">Proceed to Checkout →</button>
                <button class="btn" style="width:100%;padding:10px;margin-top:8px;border-color:transparent" onclick="window.go('bazaar')">← Continue Shopping</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function setGiftMessage(msg) {
    state.giftOptions.giftMessage = msg;
  }

  /* ==========================================================================
     MULTI-STEP CHECKOUT SYSTEM
     ========================================================================== */
  function renderCheckoutAuthGate() {
    const items = state.cart;
    const total = getTotal();
    return `
      <div class="light" style="padding-top:110px">
        <div class="checkout-auth-gate-box">
          <div class="lab">Member / Patron Sign In Required</div>
          <h1 style="font-size:clamp(28px,4vw,40px);margin:12px 0 16px;line-height:1.2">Sign In Before Placing Your Order</h1>
          <p style="font-size:15px;line-height:1.8;color:#555a4e;max-width:620px;margin:0 auto 24px">
            To ensure genuine provenance verification, direct farmer-guild tracking, and safe high-altitude delivery, you must sign in or create an account before completing checkout.
          </p>

          <div class="checkout-auth-features">
            <div class="checkout-auth-feature-item">
              <strong>Direct Harvest Protection</strong>
              <span>Guaranteed authentic produce from Chamoli & Kumaon cooperatives</span>
            </div>
            <div class="checkout-auth-feature-item">
              <strong>Live Expedition Tracking</strong>
              <span>Follow your harvest dispatch from the high peaks to your doorstep</span>
            </div>
            <div class="checkout-auth-feature-item">
              <strong>Saved Mountain Addresses</strong>
              <span>Fast 1-click checkout with secure 256-bit encrypted data</span>
            </div>
          </div>

          <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:28px">
            <button class="btn on" style="padding:15px 36px;font-size:12px" onclick="sessionStorage.setItem('hsw-auth-return','checkout');window.go('login');if(window.authSetMode)window.authSetMode('login');">Sign In with OTP / Password →</button>
            <button class="btn" style="padding:15px 32px;font-size:12px" onclick="sessionStorage.setItem('hsw-auth-return','checkout');window.go('login');if(window.authSetMode)window.authSetMode('signup');">Create New Account</button>
          </div>

          <div style="margin-top:28px">
            <a onclick="window.go('cart')" style="font-size:12.5px;color:var(--gold,#C5A869);cursor:pointer;text-decoration:underline">← Return to Shopping Bag (${items.reduce((s,i)=>s+i.quantity,0)} items · ₹${total})</a>
          </div>
        </div>
      </div>
    `;
  }

  function renderCheckout(stepNumber) {
    if (typeof stepNumber === 'number' && stepNumber >= 2 && stepNumber <= 4) {
      state.checkoutStep = stepNumber;
    } else if (!state.checkoutStep || state.checkoutStep < 2 || state.checkoutStep > 4) {
      state.checkoutStep = 2;
    }
    const currentStep = state.checkoutStep;
    const items = state.cart;
    if (items.length === 0) {
      return renderCartPage();
    }

    if (!isLoggedIn()) {
      return renderCheckoutAuthGate();
    }

    const subtotal = getSubtotal();
    const discount = getDiscount();
    const shipping = getShippingFee();
    const giftFee = getGiftFee();
    const total = getTotal();

    const loggedName = state.currentUser?.name || window.accountUser?.name || state.currentUser?.email || window.accountUser?.email || state.currentUser?.phone || window.accountUser?.phone || 'Patron';
    const loggedContact = state.currentUser?.email || window.accountUser?.email || state.currentUser?.phone || window.accountUser?.phone || '';

    return `
      <div class="light" style="padding-top:110px">
        <!-- Logged-in Patron Status Banner -->
        <div class="checkout-user-banner">
          <div>
            <span class="lab">Ordering as</span>
            <strong style="margin-left:6px;font-size:14px">${loggedName}</strong>
            ${loggedContact ? `<span style="opacity:.65;font-size:12px;margin-left:6px">(${loggedContact})</span>` : ''}
          </div>
          <button type="button" class="btn" style="padding:5px 14px;font-size:10px" onclick="if(window.accountLogout)accountLogout();else window.go('login')">Switch Account / Sign Out</button>
        </div>

        <!-- Breadcrumb Stepper -->
        <div class="checkout-steps-bar">
          <div class="checkout-step-node done" onclick="window.go('cart')">
            <div class="checkout-step-circle">✓</div>
            <div class="checkout-step-label">1. Bag Review</div>
          </div>
          <div class="checkout-step-node ${currentStep === 2 ? 'active' : currentStep > 2 ? 'done' : ''}" onclick="EcommerceStore.setCheckoutStep(2)">
            <div class="checkout-step-circle">${currentStep > 2 ? '✓' : '2'}</div>
            <div class="checkout-step-label">2. Delivery Address</div>
          </div>
          <div class="checkout-step-node ${currentStep === 3 ? 'active' : currentStep > 3 ? 'done' : ''}" onclick="EcommerceStore.setCheckoutStep(3)">
            <div class="checkout-step-circle">${currentStep > 3 ? '✓' : '3'}</div>
            <div class="checkout-step-label">3. Shipping Speed</div>
          </div>
          <div class="checkout-step-node ${currentStep === 4 ? 'active' : ''}" onclick="EcommerceStore.setCheckoutStep(4)">
            <div class="checkout-step-circle">4</div>
            <div class="checkout-step-label">4. Payment & Confirm</div>
          </div>
        </div>

        <div class="cart-page-grid">
          <!-- Step Active Form -->
          <div>
            ${renderStepContent(currentStep)}
          </div>

          <!-- Checkout Sticky Summary Sidebar -->
          <div>
            <div class="cart-summary-box">
              <div class="lab">Order Breakdown (${items.reduce((s,i)=>s+i.quantity,0)} items)</div>
              <div style="max-height:180px;overflow-y:auto;margin:12px 0 16px;border-bottom:1px solid rgba(26,27,24,0.08);padding-bottom:10px">
                ${items.map(item => `
                  <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:6px">
                    <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px">${item.name} (${item.variant}) × ${item.quantity}</span>
                    <span style="font-weight:600">₹ ${item.unitPrice * item.quantity}</span>
                  </div>
                `).join('')}
              </div>

              <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13.5px">
                <span>Items Subtotal</span><span>₹ ${subtotal}</span>
              </div>
              ${discount > 0 ? `
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13.5px;color:#047857;font-weight:600">
                  <span>Discount (${state.appliedCoupon ? state.appliedCoupon.code : ''})</span><span>− ₹ ${discount}</span>
                </div>
              ` : ''}
              <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13.5px">
                <span>Shipping (${state.selectedShippingMethod.id === 'express' ? 'Air Express' : 'Standard'})</span>
                <span>${shipping === 0 ? '<span style="color:var(--terra);font-weight:600">FREE</span>' : `₹ ${shipping}`}</span>
              </div>
              ${giftFee > 0 ? `
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13.5px">
                  <span>Pine Gift Crate</span><span>₹ ${giftFee}</span>
                </div>
              ` : ''}

              <div style="display:flex;justify-content:space-between;font-size:20px;font-weight:700;border-top:1.5px solid rgba(26,27,24,0.15);padding-top:12px;margin:16px 0">
                <span>Total Amount</span><span>₹ ${total}</span>
              </div>

              <div style="background:rgba(197,168,105,0.1);padding:12px;border-radius:4px;font-size:11.5px;line-height:1.6;color:#52584d">
                <b>256-Bit SSL Encrypted Mountain Checkout</b><br>
                100% Direct Uttarakhand origin guaranteed.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderStepContent(step) {
    const activeStep = (typeof step === 'number' && step >= 2 && step <= 4) ? step : 2;
    const addr = state.shippingAddress;
    switch (activeStep) {
      case 2: // Address
      default:
        return `
          <div style="background:var(--ivory-card);border:1px solid rgba(26,27,24,0.1);padding:28px;border-radius:4px">
            <div class="lab">Step 2 of 4</div>
            <h2 style="font-size:26px;margin:4px 0 16px">Delivery Address</h2>

            ${state.savedAddresses && state.savedAddresses.length ? `
              <div class="lab">Choose from Saved Addresses</div>
              <div class="address-card-grid">
                ${state.savedAddresses.map((saved, idx) => `
                  <div class="address-card ${saved.pincode === addr.pincode && saved.house === addr.house ? 'selected' : ''}" onclick="EcommerceStore.selectSavedAddress(${idx})">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                      <b>${saved.fullName}</b>
                      <span class="address-badge-type">${saved.type}</span>
                    </div>
                    <div style="font-size:12.5px;color:#494f44;line-height:1.5">${saved.house}, ${saved.street}</div>
                    <div style="font-size:12.5px;color:#494f44">${saved.city}, ${saved.state} — <b>${saved.pincode}</b></div>
                    <div style="font-size:11.5px;color:#797f74;margin-top:6px">Phone: ${saved.phone}</div>
                  </div>
                `).join('')}
              </div>
              <div style="text-align:right;margin-bottom:16px">
                <button class="btn" style="padding:6px 12px;font-size:10px" onclick="EcommerceStore.clearAddressForm()">+ Add New Address</button>
              </div>
            ` : ''}

            <form id="checkout-address-form" onsubmit="EcommerceStore.handleAddressSubmit(event); return false;">
              <div class="address-form-grid">
                <div class="ecom-input-field">
                  <label>Full Name *</label>
                  <input id="addr-name" placeholder="E.g. Narendra Semwal" value="${addr.fullName || ''}" required>
                </div>
                <div class="ecom-input-field">
                  <label>10-Digit Mobile Number *</label>
                  <input id="addr-phone" type="tel" placeholder="9876543210" value="${addr.phone || ''}" required>
                </div>
                <div class="ecom-input-field">
                  <label>Alternative Phone (Optional)</label>
                  <input id="addr-alt-phone" type="tel" placeholder="Optional backup contact" value="${addr.altPhone || ''}">
                </div>
                <div class="ecom-input-field">
                  <label>PIN Code (Auto-Detect) *</label>
                  <input id="addr-pincode" type="text" maxlength="6" placeholder="246443" value="${addr.pincode || ''}" oninput="EcommerceStore.lookupPincode(this.value)" required>
                </div>
                <div class="ecom-input-field full-width">
                  <label>Flat / House No. / Building Name *</label>
                  <input id="addr-house" placeholder="House #12, Pine Ridge Lodge" value="${addr.house || ''}" required>
                </div>
                <div class="ecom-input-field full-width">
                  <label>Street / Area / Locality *</label>
                  <input id="addr-street" placeholder="Near Ancient Cedar Grove, Upper Market" value="${addr.street || ''}" required>
                </div>
                <div class="ecom-input-field">
                  <label>Landmark (Optional)</label>
                  <input id="addr-landmark" placeholder="Near Temple / Post Office" value="${addr.landmark || ''}">
                </div>
                <div class="ecom-input-field">
                  <label>City / District *</label>
                  <input id="addr-city" placeholder="Joshimath / Dehradun" value="${addr.city || ''}" required>
                </div>
                <div class="ecom-input-field">
                  <label>State *</label>
                  <input id="addr-state" placeholder="Uttarakhand" value="${addr.state || ''}" required>
                </div>
                <div class="ecom-input-field">
                  <label>Address Type</label>
                  <select id="addr-type">
                    <option value="Home" ${addr.type === 'Home' ? 'selected' : ''}>Home (All Day Delivery)</option>
                    <option value="Work" ${addr.type === 'Work' ? 'selected' : ''}>Work (9 AM – 6 PM Delivery)</option>
                    <option value="Other" ${addr.type === 'Other' ? 'selected' : ''}>Other</option>
                  </select>
                </div>
              </div>

              <label style="display:flex;align-items:center;gap:10px;margin-top:18px;font-size:12.5px;cursor:pointer">
                <input type="checkbox" id="addr-save" ${addr.saveAddress ? 'checked' : ''} style="accent-color:var(--gold)">
                <span>Save this address for faster checkouts</span>
              </label>

              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:24px">
                <button class="btn" type="button" onclick="window.go('cart')">← Back to Bag</button>
                <button class="btn on" type="button" onclick="EcommerceStore.handleAddressSubmit(event)" style="padding:14px 28px">Continue to Shipping Method →</button>
              </div>
            </form>
          </div>
        `;

      case 3: // Shipping Speed
        return `
          <div style="background:var(--ivory-card);border:1px solid rgba(26,27,24,0.1);padding:28px;border-radius:4px">
            <div class="lab">Step 3 of 4</div>
            <h2 style="font-size:26px;margin:4px 0 16px">Choose Mountain Shipping Speed</h2>

            <div class="shipping-method-card ${state.selectedShippingMethod.id === 'standard' ? 'selected' : ''}" onclick="EcommerceStore.selectShippingMethod('standard', 0)">
              <div>
                <div style="font-weight:700;font-size:15px">Direct Mountain Dispatch (3–5 Business Days)</div>
                <div style="font-size:12px;color:#6d7367;margin-top:2px">Dispatched straight from Chamoli & Kumaon valley hubs via carbon-neutral road cargo.</div>
              </div>
              <div style="color:var(--terra);font-weight:700;font-size:16px">FREE</div>
            </div>

            <div class="shipping-method-card ${state.selectedShippingMethod.id === 'express' ? 'selected' : ''}" onclick="EcommerceStore.selectShippingMethod('express', 99)">
              <div>
                <div style="display:flex;align-items:center;gap:8px">
                  <span style="font-weight:700;font-size:15px">Himalayan Express Air Cargo (1–2 Days)</span>
                  <span style="background:var(--gold);color:var(--tx-dark);font-size:9.5px;font-weight:700;padding:2px 6px;border-radius:2px">PRIORITY AIR</span>
                </div>
                <div style="font-size:12px;color:#6d7367;margin-top:2px">Immediate air routing from Jolly Grant Dehradun Airport to major metros.</div>
              </div>
              <div style="font-weight:700;font-size:16px">₹ 99</div>
            </div>

            <div style="background:#fff;border:1px solid rgba(26,27,24,0.1);padding:16px;border-radius:4px;margin-top:20px">
              <div class="lab">Delivering To</div>
              <div style="font-weight:600;font-size:14px;margin-top:4px">${state.shippingAddress.fullName} · ${state.shippingAddress.phone}</div>
              <div style="font-size:12.5px;color:#585e52">${state.shippingAddress.house}, ${state.shippingAddress.street}, ${state.shippingAddress.city}, ${state.shippingAddress.state} — ${state.shippingAddress.pincode}</div>
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:28px">
              <button class="btn" type="button" onclick="EcommerceStore.setCheckoutStep(2)">← Back to Address</button>
              <button class="btn on" type="button" style="padding:14px 28px" onclick="EcommerceStore.setCheckoutStep(4)">Proceed to Payment →</button>
            </div>
          </div>
        `;

      case 4: // Payment Gateways
        return `
          <div style="background:var(--ivory-card);border:1px solid rgba(26,27,24,0.1);padding:28px;border-radius:4px">
            <div class="lab">Step 4 of 4</div>
            <h2 style="font-size:26px;margin:4px 0 16px">Select Payment Method</h2>

            <div class="payment-methods-grid">
              <!-- Sidebar tabs -->
              <div class="payment-tabs-sidebar">
                <div class="payment-tab-item ${state.paymentMethod === 'UPI' ? 'active' : ''}" onclick="EcommerceStore.setPaymentMethod('UPI')">
                   UPI (GPay / PhonePe / QR)
                </div>
                <div class="payment-tab-item ${state.paymentMethod === 'card' ? 'active' : ''}" onclick="EcommerceStore.setPaymentMethod('card')">
                   Credit / Debit Card
                </div>
                <div class="payment-tab-item ${state.paymentMethod === 'netbanking' ? 'active' : ''}" onclick="EcommerceStore.setPaymentMethod('netbanking')">
                   Net Banking
                </div>
                <div class="payment-tab-item ${state.paymentMethod === 'cod' ? 'active' : ''}" onclick="EcommerceStore.setPaymentMethod('cod')">
                   Cash on Delivery (COD)
                </div>
              </div>

              <!-- Payment Form Content -->
              <div class="payment-tab-content">
                ${renderPaymentGatewayTab()}
              </div>
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:24px">
              <button class="btn" type="button" onclick="EcommerceStore.setCheckoutStep(3)">← Back to Shipping</button>
              <button id="place-order-btn" class="btn on" type="button" style="padding:16px 36px" onclick="EcommerceStore.submitOrder()">Confirm & Pay ₹${getTotal()} →</button>
            </div>
          </div>
        `;
    }
  }

  function renderPaymentGatewayTab() {
    const total = getTotal();
    switch (state.paymentMethod) {
      case 'UPI':
        return `
          <div style="text-align:center">
            <div class="lab">Instant UPI Payment (0% Gateway Fee)</div>
            <h3 style="font-size:20px;margin:4px 0 14px">Scan & Pay ₹${total}</h3>
            
            <div class="upi-qr-box" id="upi-qr-container">
              <div style="width:160px;height:160px;margin:0 auto;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#f8f6f1,#f0ede5);border-radius:10px;border:2px dashed var(--gold,#C5A869)">
                <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
                  <div style="width:32px;height:32px;border:3px solid var(--gold,#C5A869);border-top-color:transparent;border-radius:50%;animation:spin 0.7s linear infinite"></div>
                  <div style="color:#888;font-size:11px;letter-spacing:0.05em">Generating QR…</div>
                </div>
              </div>
            </div>

            <div class="lab" style="margin-top:16px">Or choose your preferred UPI app</div>
            <div class="upi-app-buttons">
              <div class="upi-app-btn" onclick="EcommerceStore.simulateUpiApp('Google Pay')"> Google Pay</div>
              <div class="upi-app-btn" onclick="EcommerceStore.simulateUpiApp('PhonePe')"> PhonePe</div>
              <div class="upi-app-btn" onclick="EcommerceStore.simulateUpiApp('Paytm')"> Paytm</div>
              <div class="upi-app-btn" onclick="EcommerceStore.simulateUpiApp('BHIM')"> BHIM UPI</div>
            </div>

            <div style="margin-top:14px;display:flex;gap:8px">
              <input id="upi-custom-vpa" placeholder="Enter UPI ID (e.g. name@okhdfcbank)" style="flex:1;padding:8px 12px;border:1px solid rgba(26,27,24,0.2);border-radius:3px">
              <button class="btn on" style="padding:8px 14px;font-size:11px" onclick="EcommerceStore.verifyCustomVpa()">Verify</button>
            </div>
          </div>
        `;

      case 'card':
        return `
          <div>
            <div class="lab">Credit or Debit Card</div>
            <h3 style="font-size:18px;margin:4px 0 16px">Enter Card Details</h3>

            <!-- 3D Card Simulation -->
            <div class="live-credit-card">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <div class="card-chip"></div>
                <div style="font-size:12px;letter-spacing:0.2em;color:var(--gold)">HILLSONWHEELS</div>
              </div>
              <div class="card-number-display" id="card-num-disp">•••• •••• •••• ••••</div>
              <div style="display:flex;justify-content:space-between;font-size:11px;letter-spacing:0.1em;text-transform:uppercase">
                <div>
                  <div style="opacity:0.6;font-size:9px">Cardholder</div>
                  <div id="card-name-disp" style="font-weight:700">YOUR NAME</div>
                </div>
                <div>
                  <div style="opacity:0.6;font-size:9px">Expires</div>
                  <div id="card-exp-disp" style="font-weight:700">MM/YY</div>
                </div>
              </div>
            </div>

            <div class="address-form-grid">
              <div class="ecom-input-field full-width">
                <label>Card Number *</label>
                <input id="card-input-number" maxlength="19" placeholder="4532 •••• •••• ••••" oninput="EcommerceStore.formatCardNumber(this)">
              </div>
              <div class="ecom-input-field">
                <label>Expiry Date (MM/YY) *</label>
                <input id="card-input-exp" maxlength="5" placeholder="12/28" oninput="EcommerceStore.formatCardExpiry(this)">
              </div>
              <div class="ecom-input-field">
                <label>CVV / CVC (3 Digits) *</label>
                <input id="card-input-cvv" type="password" maxlength="4" placeholder="•••">
              </div>
              <div class="ecom-input-field full-width">
                <label>Name on Card *</label>
                <input id="card-input-name" placeholder="Name as printed on card" oninput="document.getElementById('card-name-disp').textContent = this.value.toUpperCase() || 'YOUR NAME'">
              </div>
            </div>
          </div>
        `;

      case 'netbanking':
        return `
          <div>
            <div class="lab">Direct Bank Transfer</div>
            <h3 style="font-size:18px;margin:4px 0 14px">Select Popular Bank</h3>

            <div class="bank-quick-grid">
              ${['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National'].map((bank, i) => `
                <div class="bank-option-btn ${i === 0 ? 'selected' : ''}" onclick="EcommerceStore.selectBank(this, '${bank}')">${bank}</div>
              `).join('')}
            </div>

            <div class="ecom-input-field" style="margin-top:14px">
              <label>Or search 50+ other Indian Banks</label>
              <select style="width:100%">
                <option>Bank of Baroda</option>
                <option>Canara Bank</option>
                <option>Union Bank of India</option>
                <option>IndusInd Bank</option>
                <option>IDFC FIRST Bank</option>
                <option>Yes Bank</option>
                <option>Federal Bank</option>
              </select>
            </div>
          </div>
        `;

      case 'cod':
        return `
          <div>
            <div class="lab">Pay on Mountain Arrival</div>
            <h3 style="font-size:18px;margin:4px 0 12px">Cash on Delivery (COD)</h3>
            <p style="font-size:13px;line-height:1.7;color:#555b50;margin-bottom:16px">You can pay using Cash, Google Pay, PhonePe, or UPI QR directly to the delivery partner when your package arrives.</p>

            <div style="background:#fff;border:1px solid rgba(26,27,24,0.15);padding:14px;border-radius:4px;display:flex;align-items:center;gap:14px">
              <div style="background:var(--tx-dark);color:var(--gold);font-family:monospace;font-size:22px;font-weight:700;padding:6px 14px;border-radius:3px;letter-spacing:4px">
                5842
              </div>
              <div style="flex:1">
                <div class="lab" style="font-size:10px">Enter Captcha to Confirm</div>
                <input id="cod-captcha-input" maxlength="4" placeholder="Enter 5842" style="padding:6px 10px;width:100%;border:1px solid rgba(26,27,24,0.2);border-radius:3px;margin-top:2px">
              </div>
            </div>
          </div>
        `;
    }
  }

  function setCheckoutStep(step) {
    if (step === 3 && (!state.shippingAddress.fullName || !state.shippingAddress.phone || !state.shippingAddress.pincode)) {
      showToast('Please complete your delivery address first', 'error');
      return;
    }
    state.checkoutStep = step;
    window.go('checkout', 1);
  }

  function selectSavedAddress(idx) {
    const saved = state.savedAddresses[idx];
    if (saved) {
      state.shippingAddress = { ...saved, saveAddress: false };
      showToast(`Selected address for ${saved.fullName}`, 'info');
      window.go('checkout', 1);
    }
  }

  function clearAddressForm() {
    state.shippingAddress = {
      fullName: '',
      phone: '',
      altPhone: '',
      pincode: '',
      house: '',
      street: '',
      landmark: '',
      city: '',
      state: '',
      type: 'Home',
      saveAddress: true
    };
    window.go('checkout', 1);
  }

  function handleAddressSubmit(e) {
    if (e) {
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
    }
    const nameEl = document.getElementById('addr-name');
    const phoneEl = document.getElementById('addr-phone');
    const altPhoneEl = document.getElementById('addr-alt-phone');
    const pincodeEl = document.getElementById('addr-pincode');
    const houseEl = document.getElementById('addr-house');
    const streetEl = document.getElementById('addr-street');
    const landmarkEl = document.getElementById('addr-landmark');
    const cityEl = document.getElementById('addr-city');
    const stateEl = document.getElementById('addr-state');
    const typeEl = document.getElementById('addr-type');
    const saveEl = document.getElementById('addr-save');

    const fullName = (nameEl ? nameEl.value : state.shippingAddress.fullName || '').trim();
    let rawPhone = (phoneEl ? phoneEl.value : state.shippingAddress.phone || '').trim();
    const altPhone = (altPhoneEl ? altPhoneEl.value : state.shippingAddress.altPhone || '').trim();
    let rawPincode = (pincodeEl ? pincodeEl.value : state.shippingAddress.pincode || '').trim();
    const house = (houseEl ? houseEl.value : state.shippingAddress.house || '').trim();
    const street = (streetEl ? streetEl.value : state.shippingAddress.street || '').trim();
    const landmark = (landmarkEl ? landmarkEl.value : state.shippingAddress.landmark || '').trim();
    const city = (cityEl ? cityEl.value : state.shippingAddress.city || '').trim();
    const stateVal = (stateEl ? stateEl.value : state.shippingAddress.state || '').trim();
    const type = typeEl ? typeEl.value : (state.shippingAddress.type || 'Home');
    const saveAddress = saveEl ? saveEl.checked : (state.shippingAddress.saveAddress || false);

    if (!fullName) {
      showToast('Please enter your full name', 'error');
      if (nameEl) nameEl.focus();
      return;
    }

    const cleanPhone = rawPhone.replace(/[\s()-]/g, '').replace(/^(\+91|91|0)/, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      if (phoneEl) phoneEl.focus();
      return;
    }
    const phone = cleanPhone.slice(-10);

    const cleanPincode = rawPincode.replace(/\s+/g, '');
    if (!cleanPincode || !/^\d{6}$/.test(cleanPincode)) {
      showToast('Please enter a valid 6-digit PIN code', 'error');
      if (pincodeEl) pincodeEl.focus();
      return;
    }

    if (!house) {
      showToast('Please enter your Flat / House / Building details', 'error');
      if (houseEl) houseEl.focus();
      return;
    }

    if (!street) {
      showToast('Please enter your Street / Locality', 'error');
      if (streetEl) streetEl.focus();
      return;
    }

    if (!city) {
      showToast('Please enter your City / District', 'error');
      if (cityEl) cityEl.focus();
      return;
    }

    if (!stateVal) {
      showToast('Please enter your State', 'error');
      if (stateEl) stateEl.focus();
      return;
    }

    state.shippingAddress = {
      fullName,
      phone,
      altPhone,
      pincode: cleanPincode,
      house,
      street,
      landmark,
      city,
      state: stateVal,
      type,
      saveAddress
    };

    try {
      localStorage.setItem(STORAGE_ADDRESS_KEY, JSON.stringify(state.shippingAddress));
    } catch (_) {}

    state.checkoutStep = 3;
    window.go('checkout', 1);
  }

  function selectShippingMethod(id, cost) {
    state.selectedShippingMethod = {
      id,
      name: id === 'express' ? 'Himalayan Express Air Logistics (1–2 Days)' : 'Direct Mountain Dispatch (3–5 Days)',
      cost
    };
    window.go('checkout', 1);
  }

  function setPaymentMethod(method) {
    state.paymentMethod = method;
    window.go('checkout', 1);
    // Generate QR code if UPI is selected — instant client-side, no server round-trip
    if (method === 'UPI') {
      requestAnimationFrame(() => generateUpiQR());
    }
  }

  function generateUpiQR() {
    const total = getTotal();
    const vpa = 'hillsonwheels@okhdfcbank';
    const upiUrl = `upi://pay?pa=${vpa}&pn=HILLSONWHEELS&am=${total}&cu=INR&tn=Order%20Payment`;

    const container = document.getElementById('upi-qr-container');
    if (!container) return;

    // PRIMARY: Use QR image API — zero JS, renders as plain <img>, instant
    // qrserver.com is free, reliable, and imgSrc CSP allows all https:
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=1A1B18&bgcolor=FFFFFF&qzone=1&data=${encodeURIComponent(upiUrl)}`;

    const img = new Image();
    img.onload = () => {
      container.innerHTML = `
        <img src="${qrApiUrl}" alt="Scan & Pay ₹${total} via UPI"
          style="width:160px;height:160px;margin:0 auto;display:block;
                 border-radius:10px;box-shadow:0 4px 24px rgba(0,0,0,0.12)" />
        <div style="margin-top:6px;font-size:11px;color:#888;letter-spacing:0.04em">UPI: ${vpa}</div>
      `;
    };
    img.onerror = () => {
      // FALLBACK: Try client-side QRCode library if already loaded
      if (typeof QRCode !== 'undefined') {
        QRCode.toDataURL(upiUrl, { width: 180, margin: 1, color: { dark: '#1A1B18', light: '#FFFFFF' } })
          .then(dataUrl => {
            container.innerHTML = `
              <img src="${dataUrl}" alt="Scan & Pay ₹${total} via UPI"
                style="width:160px;height:160px;margin:0 auto;display:block;border-radius:10px" />
              <div style="margin-top:6px;font-size:11px;color:#888">UPI: ${vpa}</div>
            `;
          })
          .catch(() => showUpiIdFallback(container, vpa));
      } else {
        showUpiIdFallback(container, vpa);
      }
    };
    img.src = qrApiUrl;
  }

  function showUpiIdFallback(container, vpa) {
    container.innerHTML = `
      <div style="padding:14px;text-align:center;border:1px solid var(--gold,#C5A869);border-radius:8px">
        <div style="font-size:11px;color:#888;margin-bottom:6px">Pay directly via UPI ID:</div>
        <div style="font-size:15px;font-weight:700;letter-spacing:0.04em;color:var(--tx-dark,#1A1B18)">${vpa}</div>
      </div>
    `;
  }

  function formatCardNumber(input) {
    let val = input.value.replace(/\D/g, '').slice(0, 16);
    val = val.replace(/(.{4})/g, '$1 ').trim();
    input.value = val;
    const disp = document.getElementById('card-num-disp');
    if (disp) disp.textContent = val || '•••• •••• •••• ••••';
  }

  function formatCardExpiry(input) {
    let val = input.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2);
    input.value = val;
    const disp = document.getElementById('card-exp-disp');
    if (disp) disp.textContent = val || 'MM/YY';
  }

  function selectBank(el, bankName) {
    document.querySelectorAll('.bank-option-btn').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
    state.paymentDetails.bankName = bankName;
    showToast(`Selected ${bankName}`, 'info');
  }

  function simulateUpiApp(appName) {
    showToast(`Redirecting to ${appName} Gateway…`, 'info');
    setTimeout(() => {
      showToast(`UPI request approved via ${appName}!`, 'success');
    }, 1200);
  }

  function verifyCustomVpa() {
    const vpa = document.getElementById('upi-custom-vpa');
    if (!vpa || !vpa.value.includes('@')) {
      showToast('Please enter a valid UPI ID (e.g. name@okhdfcbank)', 'error');
      return;
    }
    state.paymentDetails.upiId = vpa.value.trim();
    showToast(`Verified UPI VPA: ${vpa.value.trim()}`, 'success');
  }

  /* Order Placement & Razorpay Payment */
  async function submitOrder() {
    // Authentication requirement check
    if (!isLoggedIn()) {
      await checkCurrentUser();
    }
    if (!isLoggedIn()) {
      showToast('Please sign in or create an account before placing your order.', 'error');
      sessionStorage.setItem('hsw-auth-return', 'checkout');
      window.go('login');
      return;
    }

    // COD captcha check
    if (state.paymentMethod === 'cod') {
      const captchaInput = document.getElementById('cod-captcha-input');
      if (captchaInput && captchaInput.value.trim() !== '5842') {
        showToast('Please enter the 4-digit captcha (5842) for Cash on Delivery', 'error');
        return;
      }
    }

    const btn = document.getElementById('place-order-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Connecting to Gateway…'; }

    const payload = {
      items: state.cart.map(item => ({ sku: item.sku, quantity: item.quantity })),
      shippingAddress: state.shippingAddress,
      shippingMethod: state.selectedShippingMethod,
      giftOptions: state.giftOptions,
      couponCode: state.appliedCoupon ? state.appliedCoupon.code : '',
      paymentMethod: state.paymentMethod,
      paymentDetails: state.paymentDetails
    };

    try {
      // Step 1: Create HSW order in DB
      showToast('Reserving your mountain harvest…', 'info');
      const res = await fetch('/api/orders', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.status === 401 || (data && data.requireLogin)) {
        showToast(data.error || 'Authentication required. Please sign in to place your order.', 'error');
        sessionStorage.setItem('hsw-auth-return', 'checkout');
        window.go('login');
        if (btn) { btn.disabled = false; btn.textContent = 'Confirm & Pay'; }
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Could not place order');

      state.lastOrder = data;

      // Step 2: For UPI/Card/Netbanking — launch Razorpay
      if (['UPI', 'card', 'netbanking'].includes(state.paymentMethod)) {
        await launchRazorpay(data);
        return; // Razorpay success handler clears cart
      }

      // Step 3: COD — go straight to success
      finalizeOrderSuccess(data);
    } catch (err) {
      showToast(err.message, 'error');
      if (btn) { btn.disabled = false; btn.textContent = 'Place Order'; }
    }
  }

  /* Razorpay Standard Web Checkout Launcher */
  async function launchRazorpay(orderData) {
    const btn = document.getElementById('place-order-btn');
    try {
      // Step 1: Create Razorpay order via backend
      showToast('Opening secure Razorpay payment gateway…', 'info');
      const rzpRes = await fetch('/api/create-order', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: orderData.total,
          receipt: orderData.orderNumber,
          notes: {
            hswOrderNumber: orderData.orderNumber,
            customerName: state.shippingAddress.fullName || ''
          }
        })
      });
      const rzpData = await rzpRes.json();
      if (!rzpRes.ok) throw new Error(rzpData.error || 'Payment initiation failed');

      // If simulation mode (no live keys or simulated order)
      if (rzpData.simulation) {
        showToast('Processing test payment simulation…', 'info');
        await new Promise(r => setTimeout(r, 800));
        const verRes = await fetch('/api/verify-payment', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: rzpData.order_id || rzpData.id,
            razorpay_payment_id: `pay_sim_${Date.now()}`,
            razorpay_signature: 'simulation_signature',
            hswOrderId: orderData.orderNumber
          })
        });
        const verData = await verRes.json();
        finalizeOrderSuccess(verData.orderNumber ? verData : orderData);
        return;
      }

      // Step 2: Ensure Razorpay SDK script is loaded and ready
      await ensureRazorpayLoaded();

      // Step 3: Configure Razorpay Standard Checkout options
      const options = {
        key: rzpData.keyId || rzpData.key_id,
        amount: rzpData.amount,
        currency: rzpData.currency || 'INR',
        name: 'HILLSONWHEELS',
        description: `Uttarakhand Harvest Order ${orderData.orderNumber}`,
        order_id: rzpData.order_id || rzpData.id,
        prefill: {
          name: state.shippingAddress.fullName || '',
          contact: state.shippingAddress.phone || '',
          email: (state.currentUser && state.currentUser.email) || state.shippingAddress.email || ''
        },
        theme: {
          color: '#C5A869'
        },
        modal: {
          ondismiss: function() {
            showToast('Payment window closed. Your mountain basket is saved — retry whenever ready.', 'info');
            if (btn) { btn.disabled = false; btn.textContent = 'Retry Payment'; }
          }
        },
        handler: async function(response) {
          try {
            showToast('Verifying payment signature with Razorpay…', 'info');
            const verRes = await fetch('/api/verify-payment', {
              method: 'POST',
              credentials: 'same-origin',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                hswOrderId: orderData.orderNumber
              })
            });
            const verData = await verRes.json();
            if (!verRes.ok || !verData.verified) {
              throw new Error(verData.error || 'Payment signature verification failed');
            }
            showToast('Payment verified successfully!', 'success');
            finalizeOrderSuccess(verData.orderNumber ? verData : orderData);
          } catch (verErr) {
            showToast(verErr.message, 'error');
            if (btn) { btn.disabled = false; btn.textContent = 'Retry Payment'; }
          }
        }
      };

      const rzp = new window.Razorpay(options);

      // Handle payment failure event
      rzp.on('payment.failed', function(response) {
        console.error('Razorpay payment failure event:', response.error);
        const failReason = (response.error && (response.error.description || response.error.reason)) || 'Transaction could not be completed';
        showToast(`Payment Failed: ${failReason}`, 'error');
        if (btn) { btn.disabled = false; btn.textContent = 'Retry Payment'; }
      });

      rzp.open();
    } catch (err) {
      showToast(err.message, 'error');
      if (btn) { btn.disabled = false; btn.textContent = 'Place Order'; }
    }
  }

  function ensureRazorpayLoaded() {
    // Already available — resolve immediately
    if (typeof window.Razorpay === 'function') return Promise.resolve(true);

    return new Promise((resolve, reject) => {
      let script = document.querySelector('script[src*="checkout.razorpay.com"]');
      const TIMEOUT_MS = 15000;

      const timer = setTimeout(() => {
        reject(new Error('Razorpay gateway timed out. Check your internet connection and try again.'));
      }, TIMEOUT_MS);

      const onSuccess = () => {
        clearTimeout(timer);
        if (typeof window.Razorpay === 'function') {
          resolve(true);
        } else {
          reject(new Error('Razorpay script loaded but window.Razorpay is not available. This may be a browser security policy (CSP) issue.'));
        }
      };

      const onFailure = () => {
        clearTimeout(timer);
        reject(new Error('Failed to load Razorpay payment gateway. Please check your network and try again.'));
      };

      if (!script) {
        // No script tag yet — create and inject it
        script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = onSuccess;
        script.onerror = onFailure;
        document.head.appendChild(script);
      } else {
        // Script tag already in DOM — it may still be loading
        // Attach listeners; also poll briefly in case it loaded between the
        // check above and now (avoids missing a fast-cached load)
        script.addEventListener('load', onSuccess, { once: true });
        script.addEventListener('error', onFailure, { once: true });

        // Check again in next tick in case script already finished
        setTimeout(() => {
          if (typeof window.Razorpay === 'function') {
            clearTimeout(timer);
            script.removeEventListener('load', onSuccess);
            script.removeEventListener('error', onFailure);
            resolve(true);
          }
        }, 50);
      }
    });
  }

  function finalizeOrderSuccess(data) {
    state.cart = [];
    state.appliedCoupon = null;
    saveCart();
    if (window.MountainAudio && typeof window.MountainAudio.chime === 'function') {
      window.MountainAudio.chime(1056, 3);
    }
    window.sel = window.sel || {};
    window.sel.orderId = data.orderNumber || data.id || 'HSW-2026';
    window.sel.orderNumber = data.orderNumber || data.id || 'HSW-2026';
    window.sel.orderTracking = data.trackingNumber || 'TRK-UTK';
    window.sel.trackingNumber = data.trackingNumber || 'TRK-UTK';
    window.sel.orderTotal = data.total || 0;
    if (typeof window.go === 'function') {
      window.go('order-success');
    }
  }

  /* Order Success & Live Tracking View */
  function renderOrderSuccess(paramOrderId, paramOrderNumber, paramTracking, paramTotal) {
    const selObj = window.sel || {};
    const orderNum = paramOrderNumber || paramOrderId || selObj.orderNumber || selObj.orderId || (state.lastOrder && state.lastOrder.orderNumber) || 'HSW-2026-984210';
    const trk = paramTracking || selObj.trackingNumber || selObj.orderTracking || (state.lastOrder && state.lastOrder.trackingNumber) || 'TRK-UTK-84920194';
    const total = paramTotal || selObj.orderTotal || (state.lastOrder && state.lastOrder.total) || 1299;

    return `
      <div class="light" style="padding-top:110px">
        <div style="text-align:center;max-width:680px;margin:0 auto 36px">
          <div style="display:inline-flex;width:64px;height:64px;border-radius:50%;background:rgba(197,168,105,0.15);color:var(--gold);border:2px solid var(--gold);align-items:center;justify-content:center;font-size:28px;margin-bottom:14px">✓</div>
          <div class="lab">Mountain Order Confirmed</div>
          <h1 style="font-size:clamp(32px, 4vw, 48px);margin:6px 0 10px">The Hills Await Your Parcel</h1>
          <p style="font-size:15px;line-height:1.75;color:#555b50">Thank you for supporting traditional mountain beekeepers and organic grain guilds across Uttarakhand. Your harvest is being carefully packaged.</p>
          <div style="display:inline-flex;gap:12px;background:var(--ivory-card);padding:8px 18px;border-radius:99px;border:1px solid rgba(26,27,24,0.12);margin-top:12px;font-size:13px">
            <span>Order Reference: <b>${orderNum}</b></span>
            <span>·</span>
            <span>Total Paid: <b>₹ ${total}</b></span>
          </div>
        </div>

        <!-- Live Visual Shipment Tracker -->
        <div style="background:var(--ivory-card);border:1px solid rgba(26,27,24,0.12);border-radius:4px;padding:32px;max-width:840px;margin:0 auto 36px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px">
            <div>
              <div class="lab">Live Mountain Logistics Tracking</div>
              <h3 style="font-size:20px;margin:2px 0">Tracking ID: ${trk}</h3>
            </div>
            <span class="order-status-pill harvest_packaged">● Harvest Inspection & Packaged</span>
          </div>

          <div class="tracking-timeline">
            <div class="tracking-point completed">
              <div class="tracking-point-dot"></div>
              <div style="font-weight:700;font-size:14px">Order Confirmed & Payment Verified</div>
              <div style="font-size:12px;color:#797f74">HILLSONWHEELS Platform · Instant Gateway</div>
            </div>
            <div class="tracking-point active">
              <div class="tracking-point-dot"></div>
              <div style="font-weight:700;font-size:14px">Artisan Purity Check & Muslin Packaging</div>
              <div style="font-size:12px;color:#797f74">Chamoli Central Apiary Hub, 2,100m · Packaging in progress</div>
            </div>
            <div class="tracking-point">
              <div class="tracking-point-dot"></div>
              <div style="font-weight:700;font-size:14px">Mountain Air Cargo Dispatch</div>
              <div style="font-size:12px;color:#797f74">Dehradun Central Transit Distribution Hub</div>
            </div>
            <div class="tracking-point">
              <div class="tracking-point-dot"></div>
              <div style="font-weight:700;font-size:14px">Arriving at Your Local Delivery Hub</div>
              <div style="font-size:12px;color:#797f74">Destination City Depot</div>
            </div>
            <div class="tracking-point">
              <div class="tracking-point-dot"></div>
              <div style="font-weight:700;font-size:14px">Delivered with Mountain Blessings</div>
              <div style="font-size:12px;color:#797f74">Estimated 3–4 Days</div>
            </div>
          </div>

          <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:24px">
            <button class="btn on" onclick="EcommerceStore.printInvoice('${orderNum}')">Print / Download Tax Invoice</button>
            <button class="btn" onclick="window.go('bazaar')">Continue Exploring Catalog</button>
            <button class="btn" onclick="window.go('home')">Return to the Hills</button>
          </div>
        </div>
      </div>
    `;
  }

  function printInvoice(orderNumOrId) {
    // Open the real server-generated invoice
    const invoiceUrl = `/api/orders/${encodeURIComponent(orderNumOrId)}/invoice`;
    const invoiceWindow = window.open(invoiceUrl, '_blank');
    if (invoiceWindow) {
      showToast('Invoice opened in new tab. Use browser Print (Ctrl+P) to save as PDF.', 'info');
    } else {
      showToast('Please allow pop-ups to view invoice, then press Ctrl+P to save as PDF.', 'error');
    }
  }

  /* ==========================================================================
     PATRON DASHBOARD & ORDER MANAGEMENT
     ========================================================================== */
  async function renderOrdersDashboard() {
    return `
      <div class="light" style="padding-top:110px;min-height:90vh">
        <div style="max-width:1100px;margin:0 auto;padding:0 20px 60px">
          <div class="lab" style="margin-bottom:6px">HILLSONWHEELS · PATRON HUB</div>
          <h1 style="font-size:clamp(32px,4vw,48px);margin:0 0 24px;font-weight:900">My Mountain Sanctuary & Orders</h1>

          <!-- Account Tabs Navigation -->
          <div style="display:flex;gap:10px;border-bottom:2px solid #e4e1d8;margin-bottom:30px;flex-wrap:wrap">
            <button class="account-tab-btn active" onclick="showAccountSection('orders', this)" style="padding:12px 20px;font-weight:700;font-size:14px;background:none;border:none;border-bottom:3px solid #C5A869;color:#1a1b18;cursor:pointer">My Orders</button>
            <button class="account-tab-btn" onclick="showAccountSection('tracking', this)" style="padding:12px 20px;font-weight:700;font-size:14px;background:none;border:none;border-bottom:3px solid transparent;color:#797f74;cursor:pointer">Live Parcel Tracker</button>
            <button class="account-tab-btn" onclick="showAccountSection('profile', this)" style="padding:12px 20px;font-weight:700;font-size:14px;background:none;border:none;border-bottom:3px solid transparent;color:#797f74;cursor:pointer">Patron Profile</button>
            <button class="account-tab-btn" onclick="showAccountSection('addresses', this)" style="padding:12px 20px;font-weight:700;font-size:14px;background:none;border:none;border-bottom:3px solid transparent;color:#797f74;cursor:pointer">Saved Addresses</button>
          </div>

          <!-- Section 1: Orders List -->
          <div id="acc-sec-orders" class="account-section">
            <div id="orders-list-container">
              <div style="text-align:center;padding:40px;color:#797f74">
                <div style="font-size:28px;margin-bottom:12px"></div>
                <p>Loading your mountain harvest orders…</p>
              </div>
            </div>
          </div>

          <!-- Section 2: Live Tracking -->
          <div id="acc-sec-tracking" class="account-section" style="display:none">
            <div style="background:#fff;border:1px solid #e4e1d8;border-radius:8px;padding:28px;margin-bottom:24px;box-shadow:0 2px 12px rgba(0,0,0,0.03)">
              <h2 style="font-size:22px;margin:0 0 8px">Real-Time Mountain Transit Tracker</h2>
              <p style="color:#797f74;font-size:13.5px;margin-bottom:20px">Enter your Tracking ID (e.g. TRK-UTK-...) or Order ID to inspect live harvest & transit milestones.</p>
              
              <div style="display:flex;gap:12px;max-width:550px">
                <input type="text" id="manual-track-input" placeholder="Enter Tracking ID or Order No." style="flex:1;padding:12px 16px;border:1.5px solid #d4cfc5;border-radius:4px;font-size:14px;font-family:monospace;text-transform:uppercase">
                <button class="btn on" onclick="EcommerceStore.trackOrderByInput(document.getElementById('manual-track-input').value)" style="padding:12px 24px">Track Parcel</button>
              </div>
            </div>

            <div id="manual-tracking-results"></div>
          </div>

          <!-- Section 3: Profile Settings -->
          <div id="acc-sec-profile" class="account-section" style="display:none">
            <div style="background:#fff;border:1px solid #e4e1d8;border-radius:8px;padding:32px;max-width:600px;box-shadow:0 2px 12px rgba(0,0,0,0.03)">
              <h2 style="font-size:22px;margin:0 0 16px">Patron Profile & Contact Details</h2>
              <form id="profile-edit-form" onsubmit="EcommerceStore.saveProfile(event)">
                <div style="margin-bottom:18px">
                  <label style="display:block;font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#797f74;margin-bottom:6px">Full Name</label>
                  <input type="text" id="prof-name" required style="width:100%;padding:12px 14px;border:1.5px solid #d4cfc5;border-radius:4px;font-size:14px">
                </div>
                <div style="margin-bottom:18px">
                  <label style="display:block;font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#797f74;margin-bottom:6px">Email Address</label>
                  <input type="email" id="prof-email" style="width:100%;padding:12px 14px;border:1.5px solid #d4cfc5;border-radius:4px;font-size:14px" placeholder="patron@example.com">
                </div>
                <div style="margin-bottom:24px">
                  <label style="display:block;font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#797f74;margin-bottom:6px">Phone Number</label>
                  <input type="tel" id="prof-phone" style="width:100%;padding:12px 14px;border:1.5px solid #d4cfc5;border-radius:4px;font-size:14px" placeholder="+91 9876543210">
                </div>
                <button type="submit" class="btn on" style="padding:12px 28px">Save Profile Changes</button>
              </form>
            </div>
          </div>

          <!-- Section 4: Address Book -->
          <div id="acc-sec-addresses" class="account-section" style="display:none">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
              <h2 style="font-size:22px;margin:0">Delivery Address Book</h2>
              <button class="btn on" onclick="document.getElementById('new-address-form-wrap').style.display='block';this.style.display='none'">+ Add New Address</button>
            </div>

            <!-- New Address Form (Toggleable) -->
            <div id="new-address-form-wrap" style="display:none;background:#fff;border:1px solid #C5A869;border-radius:8px;padding:24px;margin-bottom:28px">
              <h3 style="font-size:18px;margin:0 0 16px;color:#C5A869">Add Delivery Address</h3>
              <form onsubmit="EcommerceStore.saveNewAddress(event)">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
                  <div>
                    <label style="font-size:11px;font-weight:700;color:#797f74">Full Name *</label>
                    <input type="text" id="addr-name" required style="width:100%;padding:10px;border:1px solid #d4cfc5;border-radius:4px">
                  </div>
                  <div>
                    <label style="font-size:11px;font-weight:700;color:#797f74">Phone Number *</label>
                    <input type="tel" id="addr-phone" required style="width:100%;padding:10px;border:1px solid #d4cfc5;border-radius:4px">
                  </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
                  <div>
                    <label style="font-size:11px;font-weight:700;color:#797f74">PIN Code *</label>
                    <input type="text" id="addr-pin" maxlength="6" required onblur="EcommerceStore.lookupPincode(this.value)" style="width:100%;padding:10px;border:1px solid #d4cfc5;border-radius:4px">
                  </div>
                  <div>
                    <label style="font-size:11px;font-weight:700;color:#797f74">Flat / House No. *</label>
                    <input type="text" id="addr-house" required style="width:100%;padding:10px;border:1px solid #d4cfc5;border-radius:4px">
                  </div>
                </div>
                <div style="margin-bottom:14px">
                  <label style="font-size:11px;font-weight:700;color:#797f74">Street / Locality / Village *</label>
                  <input type="text" id="addr-street" required style="width:100%;padding:10px;border:1px solid #d4cfc5;border-radius:4px">
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:16px">
                  <div>
                    <label style="font-size:11px;font-weight:700;color:#797f74">Landmark</label>
                    <input type="text" id="addr-landmark" style="width:100%;padding:10px;border:1px solid #d4cfc5;border-radius:4px">
                  </div>
                  <div>
                    <label style="font-size:11px;font-weight:700;color:#797f74">City / Town *</label>
                    <input type="text" id="addr-city" required style="width:100%;padding:10px;border:1px solid #d4cfc5;border-radius:4px">
                  </div>
                  <div>
                    <label style="font-size:11px;font-weight:700;color:#797f74">State *</label>
                    <input type="text" id="addr-state" required style="width:100%;padding:10px;border:1px solid #d4cfc5;border-radius:4px">
                  </div>
                </div>
                <div style="display:flex;gap:14px;align-items:center;margin-bottom:18px">
                  <label style="font-size:12px;display:flex;align-items:center;gap:6px">
                    <input type="checkbox" id="addr-default"> Set as Default Address
                  </label>
                </div>
                <div style="display:flex;gap:10px">
                  <button type="submit" class="btn on">Save Address</button>
                  <button type="button" class="btn" onclick="document.getElementById('new-address-form-wrap').style.display='none'">Cancel</button>
                </div>
              </form>
            </div>

            <div id="addresses-list-container">
              <p style="color:#797f74">Loading saved addresses…</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function showAccountSection(section, btnEl) {
    document.querySelectorAll('.account-section').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.account-tab-btn').forEach(btn => {
      btn.style.borderBottomColor = 'transparent';
      btn.style.color = '#797f74';
    });

    const target = document.getElementById(`acc-sec-${section}`);
    if (target) target.style.display = 'block';

    if (btnEl) {
      btnEl.style.borderBottomColor = '#C5A869';
      btnEl.style.color = '#1a1b18';
    }

    if (section === 'orders') loadOrdersList();
    if (section === 'profile') loadProfileData();
    if (section === 'addresses') loadAddressesManager();
  }

  async function loadOrdersList() {
    const container = document.getElementById('orders-list-container');
    if (!container) return;

    try {
      const res = await fetch('/api/orders/my-orders', { credentials: 'same-origin' });
      if (res.status === 401) {
        container.innerHTML = `
          <div style="background:#fff;border:1px solid #e4e1d8;border-radius:8px;padding:36px;text-align:center">
            <h3 style="font-size:20px;margin:0 0 10px">Patron Sign-In Required</h3>
            <p style="color:#797f74;margin-bottom:20px">Please sign in to view your complete mountain harvest orders and tax invoices.</p>
            <button class="btn on" onclick="sessionStorage.setItem('hsw-auth-return','account');window.go('login')">Sign In with OTP / Password</button>
          </div>
        `;
        return;
      }
      const data = await res.json();
      const orders = data.orders || [];

      if (!orders.length) {
        container.innerHTML = `
          <div style="background:#fff;border:1px solid #e4e1d8;border-radius:8px;padding:48px;text-align:center">
            <div style="font-size:42px;margin-bottom:12px"></div>
            <h3 style="font-size:22px;margin:0 0 8px">No Mountain Orders Placed Yet</h3>
            <p style="color:#797f74;margin-bottom:24px">Your basket awaits the finest wild honey, stone-ground spices, and ritual weaves from Uttarakhand.</p>
            <button class="btn on" onclick="window.go('bazaar')">Explore Pahadi Bazaar</button>
          </div>
        `;
        return;
      }

      const statusLabels = {
        confirmed: { text: 'Order Confirmed', color: '#047857', bg: 'rgba(4,120,87,0.1)' },
        harvest_packaged: { text: 'Eco-Packaged at Valley Hub', color: '#b45309', bg: 'rgba(180,83,9,0.1)' },
        dispatched: { text: 'Dispatched via Air Logistics', color: '#1d4ed8', bg: 'rgba(29,78,216,0.1)' },
        in_transit: { text: 'In Transit to Destination Hub', color: '#6d28d9', bg: 'rgba(109,40,217,0.1)' },
        out_for_delivery: { text: 'Out for Mountain Delivery', color: '#0369a1', bg: 'rgba(3,105,161,0.1)' },
        delivered: { text: 'Delivered with Blessings', color: '#047857', bg: 'rgba(4,120,87,0.15)' },
        cancelled: { text: 'Order Cancelled', color: '#b91c1c', bg: 'rgba(185,28,28,0.1)' }
      };

      container.innerHTML = orders.map(order => {
        const st = statusLabels[order.orderStatus] || { text: order.orderStatus, color: '#1a1b18', bg: '#eee' };
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
        const itemsSummary = (order.items || []).map(i => `${i.name} (${i.variant || ''}) × ${i.quantity}`).join(' · ');
        const canCancel = ['confirmed', 'harvest_packaged'].includes(order.orderStatus);

        return `
          <div style="background:#fff;border:1px solid #e4e1d8;border-radius:8px;padding:24px;margin-bottom:20px;box-shadow:0 2px 10px rgba(0,0,0,0.03);transition:transform 0.2s ease">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;border-bottom:1px solid #f0ede6;padding-bottom:16px;margin-bottom:16px">
              <div>
                <div style="font-size:11px;font-weight:700;color:#797f74;letter-spacing:1px;text-transform:uppercase">Order ID: <span style="color:#C5A869;font-weight:900">${order.orderNumber}</span></div>
                <div style="font-size:12.5px;color:#52584d;margin-top:3px">Placed on ${orderDate} · Tracking: <strong style="font-family:monospace">${order.trackingNumber || 'Pending'}</strong></div>
              </div>
              <div style="display:flex;align-items:center;gap:10px">
                <span style="font-size:11.5px;font-weight:700;padding:5px 12px;border-radius:99px;color:${st.color};background:${st.bg}">${st.text}</span>
                <span style="font-size:18px;font-weight:800;color:#1a1b18">₹ ${Number(order.total || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style="font-size:13.5px;color:#333;margin-bottom:18px;line-height:1.6">
              <strong>Items:</strong> ${itemsSummary}
            </div>

            <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end">
              <button class="btn" style="padding:8px 16px;font-size:12px" onclick="EcommerceStore.viewOrderDetail('${order._id}')">View Details & Timeline</button>
              <button class="btn on" style="padding:8px 18px;font-size:12px" onclick="EcommerceStore.printInvoice('${order.orderNumber}')">Tax Invoice (PDF)</button>
              ${canCancel ? `<button class="btn" style="padding:8px 14px;font-size:12px;color:#b91c1c;border-color:rgba(185,28,28,0.3)" onclick="EcommerceStore.cancelOrder('${order._id}')">Cancel Order</button>` : ''}
            </div>
          </div>
        `;
      }).join('');
    } catch (err) {
      container.innerHTML = `<p style="color:#b91c1c">Failed to load orders: ${err.message}</p>`;
    }
  }

  async function viewOrderDetail(orderId) {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not fetch order');
      const o = data.order;
      const addr = o.shippingAddress || {};

      const historyHtml = (o.statusHistory || []).map((h, i) => `
        <div style="display:flex;gap:14px;margin-bottom:18px;position:relative">
          <div style="width:12px;height:12px;border-radius:50%;background:#C5A869;margin-top:4px;flex-shrink:0"></div>
          <div>
            <div style="font-weight:700;font-size:13.5px">${h.title}</div>
            <div style="font-size:11.5px;color:#797f74">${h.location} · ${new Date(h.timestamp).toLocaleString('en-IN')}</div>
            <div style="font-size:12.5px;color:#52584d;margin-top:2px">${h.note || ''}</div>
          </div>
        </div>
      `).join('');

      const modalHtml = `
        <div style="max-width:680px;background:#fff;border-radius:8px;padding:32px;max-height:85vh;overflow-y:auto">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #C5A869;padding-bottom:16px;margin-bottom:20px">
            <div>
              <div class="lab">Order Breakdown & Tracking</div>
              <h2 style="font-size:24px;margin:4px 0">${o.orderNumber}</h2>
              <div style="font-size:12px;color:#797f74">Tracking ID: <strong>${o.trackingNumber}</strong></div>
            </div>
            <button class="btn" style="padding:6px 12px;font-size:12px" onclick="closeModal()">Close</button>
          </div>

          <h3 style="font-size:16px;margin:16px 0 12px">Live Status Milestones</h3>
          <div style="background:#fbf9f4;border:1px solid #e6e2d8;border-radius:6px;padding:18px;margin-bottom:20px">
            ${historyHtml || '<p>No history available.</p>'}
          </div>

          <h3 style="font-size:16px;margin:16px 0 12px">Delivery Address</h3>
          <div style="background:#fbf9f4;border:1px solid #e6e2d8;border-radius:6px;padding:14px 18px;font-size:13px;line-height:1.7;margin-bottom:20px">
            <strong>${addr.fullName}</strong><br>
            ${addr.house}, ${addr.street}${addr.landmark ? ', Near ' + addr.landmark : ''}<br>
            ${addr.city}, ${addr.state} — <strong>${addr.pincode}</strong><br>
            Phone: ${addr.phone}
          </div>

          <div style="display:flex;gap:12px;justify-content:flex-end">
            <button class="btn on" onclick="EcommerceStore.printInvoice('${o.orderNumber}')">Print / Download Full Tax Invoice</button>
          </div>
        </div>
      `;
      if (window.openModal) window.openModal(modalHtml);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function cancelOrder(orderId) {
    if (!confirm('Are you sure you wish to cancel this mountain harvest order?')) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ reason: 'Customer requested cancellation from patron dashboard' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not cancel order');
      showToast('Order successfully cancelled.', 'success');
      loadOrdersList();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function trackOrderByInput(query) {
    const term = (query || '').trim();
    const container = document.getElementById('manual-tracking-results');
    if (!term || !container) {
      showToast('Please enter a valid Tracking ID or Order ID.', 'error');
      return;
    }

    container.innerHTML = '<p style="color:#797f74">Tracking parcel across Himalayan logistics network…</p>';

    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(term)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Parcel not found');
      const o = data.order;

      const milestones = o.statusHistory || [];
      const historyHtml = milestones.map(m => `
        <div style="display:flex;gap:16px;margin-bottom:18px;position:relative">
          <div style="width:14px;height:14px;border-radius:50%;background:#C5A869;flex-shrink:0;margin-top:3px"></div>
          <div>
            <div style="font-weight:700;font-size:14px;color:#1a1b18">${m.title}</div>
            <div style="font-size:12px;color:#797f74">${m.location} · ${new Date(m.timestamp).toLocaleString('en-IN')}</div>
            <div style="font-size:13px;color:#52584d;margin-top:3px">${m.note || ''}</div>
          </div>
        </div>
      `).join('');

      container.innerHTML = `
        <div style="background:#fff;border:1.5px solid #C5A869;border-radius:8px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,0.04)">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;border-bottom:1px solid #eee;padding-bottom:16px;margin-bottom:20px">
            <div>
              <div class="lab">Live Mountain Tracking</div>
              <h3 style="font-size:22px;margin:4px 0">${o.trackingNumber}</h3>
              <div style="font-size:12.5px;color:#52584d">Order Reference: <strong>${o.orderNumber}</strong></div>
            </div>
            <div style="text-align:right">
              <span style="display:inline-block;padding:6px 14px;border-radius:99px;background:rgba(197,168,105,0.15);color:#C5A869;font-weight:800;font-size:12px;text-transform:uppercase">${o.orderStatus}</span>
              ${o.estimatedDelivery ? `<div style="font-size:11.5px;color:#797f74;margin-top:4px">Est. Delivery: ${new Date(o.estimatedDelivery).toLocaleDateString('en-IN')}</div>` : ''}
            </div>
          </div>

          <div style="padding-left:10px;border-left:2px solid #f0ede6;margin-left:6px;margin-top:20px">
            ${historyHtml}
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `
        <div style="background:#fff;border:1px solid #fca5a5;border-radius:8px;padding:24px;color:#b91c1c">
          ${err.message}. Please verify the Tracking or Order Number and try again.
        </div>
      `;
    }
  }

  async function loadProfileData() {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
      if (!res.ok) return;
      const data = await res.json();
      const u = data.user;
      if (document.getElementById('prof-name')) document.getElementById('prof-name').value = u.name || '';
      if (document.getElementById('prof-email')) document.getElementById('prof-email').value = u.email || '';
      if (document.getElementById('prof-phone')) document.getElementById('prof-phone').value = u.phone || '';
    } catch (err) {
      console.error('Failed to load profile:', err.message);
    }
  }

  async function saveProfile(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('prof-name').value.trim();
    const email = document.getElementById('prof-email').value.trim();
    const phone = document.getElementById('prof-phone').value.trim();

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ name, email, phone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not update profile');
      showToast('Patron profile updated successfully.', 'success');
      if (window.AccountAuth && window.AccountAuth.syncUser) {
        window.AccountAuth.syncUser(data.user);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function loadAddressesManager() {
    const container = document.getElementById('addresses-list-container');
    if (!container) return;

    try {
      const res = await fetch('/api/user/addresses', { credentials: 'same-origin' });
      if (!res.ok) return;
      const data = await res.json();
      const addrs = data.addresses || [];

      if (!addrs.length) {
        container.innerHTML = '<p style="color:#797f74">No saved addresses found. Add one above for instant 1-click checkout.</p>';
        return;
      }

      container.innerHTML = addrs.map(a => `
        <div style="background:#fff;border:1.5px solid ${a.isDefault ? '#C5A869' : '#e4e1d8'};border-radius:8px;padding:20px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:14px">
          <div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
              <strong>${a.fullName}</strong>
              <span style="font-size:10.5px;background:#f0ede6;padding:2px 8px;border-radius:3px">${a.type || 'Home'}</span>
              ${a.isDefault ? '<span style="font-size:10.5px;background:rgba(197,168,105,0.15);color:#C5A869;font-weight:700;padding:2px 8px;border-radius:3px">Default</span>' : ''}
            </div>
            <div style="font-size:13px;color:#52584d;line-height:1.6">
              ${a.house}, ${a.street}${a.landmark ? ', Near ' + a.landmark : ''}<br>
              ${a.city}, ${a.state} — <strong>${a.pincode}</strong><br>
              Phone: ${a.phone}
            </div>
          </div>
          <div style="display:flex;gap:8px">
            ${!a.isDefault ? `<button class="btn" style="padding:6px 12px;font-size:11.5px" onclick="EcommerceStore.setDefaultAddress('${a._id}')">Set Default</button>` : ''}
            <button class="btn" style="padding:6px 10px;font-size:11.5px;color:#b91c1c;border-color:rgba(185,28,28,0.3)" onclick="EcommerceStore.deleteAddress('${a._id}')">Delete</button>
          </div>
        </div>
      `).join('');
    } catch (err) {
      container.innerHTML = `<p style="color:#b91c1c">Failed to load addresses.</p>`;
    }
  }

  async function saveNewAddress(e) {
    if (e) e.preventDefault();
    const payload = {
      fullName: document.getElementById('addr-name').value.trim(),
      phone: document.getElementById('addr-phone').value.trim(),
      pincode: document.getElementById('addr-pin').value.trim(),
      house: document.getElementById('addr-house').value.trim(),
      street: document.getElementById('addr-street').value.trim(),
      landmark: document.getElementById('addr-landmark').value.trim(),
      city: document.getElementById('addr-city').value.trim(),
      state: document.getElementById('addr-state').value.trim(),
      isDefault: document.getElementById('addr-default').checked
    };

    try {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save address');
      showToast('Delivery address saved successfully.', 'success');
      document.getElementById('new-address-form-wrap').style.display = 'none';
      loadAddressesManager();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function setDefaultAddress(addrId) {
    try {
      const res = await fetch(`/api/user/addresses/${addrId}/default`, {
        method: 'PUT',
        credentials: 'same-origin'
      });
      if (!res.ok) throw new Error('Could not set default address');
      showToast('Default address updated.', 'success');
      loadAddressesManager();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function deleteAddress(addrId) {
    if (!confirm('Delete this address?')) return;
    try {
      const res = await fetch(`/api/user/addresses/${addrId}`, {
        method: 'DELETE',
        credentials: 'same-origin'
      });
      if (!res.ok) throw new Error('Could not delete address');
      showToast('Address removed.', 'success');
      loadAddressesManager();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  window.EcommerceStore = {
    init,
    PRODUCTS_DB,
    addToCart,
    buyNow,
    addBundleToCart,
    updateItemQty,
    getCartCount,
    removeFromCart,
    clearCart,
    openCartDrawer,
    closeCartDrawer,
    renderCartDrawer,
    renderCartPage,
    renderPDP,
    renderCheckout,
    renderOrderSuccess,
    renderOrdersDashboard,
    changePdpImage,
    selectPdpVariant,
    updatePdpQty,
    switchPdpTab,
    handleReviewSubmit,
    applyCoupon,
    removeCoupon,
    lookupPincode,
    setCheckoutStep,
    selectSavedAddress,
    clearAddressForm,
    handleAddressSubmit,
    selectShippingMethod,
    setPaymentMethod,
    generateUpiQR,
    formatCardNumber,
    formatCardExpiry,
    selectBank,
    simulateUpiApp,
    verifyCustomVpa,
    submitOrder,
    printInvoice,
    showToast,
    togglePineBox,
    setGiftMessage,
    // Authentication & Checkout access
    isLoggedIn,
    proceedToCheckout,
    syncCurrentUser,
    // New full implementations
    loadOrdersList,
    viewOrderDetail,
    cancelOrder,
    trackOrderByInput,
    showAccountSection,
    loadProfileData,
    saveProfile,
    loadAddressesManager,
    saveNewAddress,
    setDefaultAddress,
    deleteAddress
  };

  // Auto-load orders when orders dashboard is shown
  const _origRenderOrdersDashboard = renderOrdersDashboard;
  window._hswPostRender = function(page) {
    if (page === 'orders' || page === 'account') {
      setTimeout(() => loadOrdersList(), 100);
    }
  };

  // Global helper for showAccountSection (called from inline onclick)
  window.showAccountSection = function(section, btn) {
    if (window.EcommerceStore) window.EcommerceStore.showAccountSection(section, btn);
  };

  document.addEventListener('DOMContentLoaded', init);
})(window);
