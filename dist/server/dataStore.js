const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const JOURNEYS_FILE = path.join(DATA_DIR, 'journeys.json');

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadUsers() {
  ensureDataDir();
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, 'utf8');
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        return new Map(data.map(u => [u.id || String(u._id), u]));
      }
    }
  } catch (err) {
    console.error('[DataStore] Error loading users.json:', err.message);
  }
  return new Map();
}

function saveUsers(userMap) {
  ensureDataDir();
  try {
    const list = Array.from(userMap.values());
    const tempFile = USERS_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(list, null, 2), 'utf8');
    fs.renameSync(tempFile, USERS_FILE);
  } catch (err) {
    console.error('[DataStore] Error persisting users.json:', err.message);
  }
}

function loadOrders() {
  ensureDataDir();
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const raw = fs.readFileSync(ORDERS_FILE, 'utf8');
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        return new Map(data.map(o => [o.orderNumber || String(o._id), o]));
      }
    }
  } catch (err) {
    console.error('[DataStore] Error loading orders.json:', err.message);
  }
  return new Map();
}

function saveOrders(orderMap) {
  ensureDataDir();
  try {
    const list = Array.from(orderMap.values());
    const tempFile = ORDERS_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(list, null, 2), 'utf8');
    fs.renameSync(tempFile, ORDERS_FILE);
  } catch (err) {
    console.error('[DataStore] Error persisting orders.json:', err.message);
  }
}

function loadCatalog(defaultCatalog = {}) {
  ensureDataDir();
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const raw = fs.readFileSync(PRODUCTS_FILE, 'utf8');
      const data = JSON.parse(raw);
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        console.log(`[DataStore] Loaded ${Object.keys(data).length} persistent products from file store.`);
        return Object.assign({}, defaultCatalog, data);
      }
    }
  } catch (err) {
    console.error('[DataStore] Error loading products.json:', err.message);
  }

  // Seed default file
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(defaultCatalog, null, 2), 'utf8');
    console.log(`[DataStore] Seeded default products.json with ${Object.keys(defaultCatalog).length} items.`);
  } catch (err) {
    console.error('[DataStore] Error saving initial products.json:', err.message);
  }
  return defaultCatalog;
}

function loadJourneys(defaultJourneys = {}) {
  ensureDataDir();
  try {
    if (fs.existsSync(JOURNEYS_FILE)) {
      const raw = fs.readFileSync(JOURNEYS_FILE, 'utf8');
      const data = JSON.parse(raw);
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        console.log(`[DataStore] Loaded ${Object.keys(data).length} persistent journey packages from file store.`);
        return Object.assign({}, defaultJourneys, data);
      }
    }
  } catch (err) {
    console.error('[DataStore] Error loading journeys.json:', err.message);
  }

  // Seed default file
  try {
    fs.writeFileSync(JOURNEYS_FILE, JSON.stringify(defaultJourneys, null, 2), 'utf8');
    console.log(`[DataStore] Seeded default journeys.json with ${Object.keys(defaultJourneys).length} items.`);
  } catch (err) {
    console.error('[DataStore] Error saving initial journeys.json:', err.message);
  }
  return defaultJourneys;
}

function saveCatalog(catalog) {
  ensureDataDir();
  try {
    const tempFile = PRODUCTS_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(catalog, null, 2), 'utf8');
    fs.renameSync(tempFile, PRODUCTS_FILE);
  } catch (err) {
    console.error('[DataStore] Error persisting products.json:', err.message);
  }
}

function saveJourneys(journeys) {
  ensureDataDir();
  try {
    const tempFile = JOURNEYS_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(journeys, null, 2), 'utf8');
    fs.renameSync(tempFile, JOURNEYS_FILE);
  } catch (err) {
    console.error('[DataStore] Error persisting journeys.json:', err.message);
  }
}

module.exports = {
  loadCatalog,
  loadJourneys,
  saveCatalog,
  saveJourneys,
  loadUsers,
  saveUsers,
  loadOrders,
  saveOrders
};
