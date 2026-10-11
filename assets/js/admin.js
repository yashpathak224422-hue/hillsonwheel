/**
 * HILLSONWHEELS — Vendor & Admin Control Console
 * Credentials: admin@1234 / admin@4321
 */
(function() {
  const AdminStore = {
    token: localStorage.getItem('hsw_admin_token') || '',
    adminUser: JSON.parse(localStorage.getItem('hsw_admin_user') || 'null'),
    activeTab: 'overview',
    stats: null,
    orders: [],
    products: [],
    trips: [],
    filterStatus: 'all',
    searchQuery: '',

    init() {
      if (this.token) {
        this.verifyToken();
      }
    },

    async verifyToken() {
      try {
        const res = await fetch('/api/admin/verify', {
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        if (!res.ok) {
          this.logout(false);
        }
      } catch {
        // Network offline / fallback
      }
    },

    async login(username, password) {
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed.');

        this.token = data.token;
        this.adminUser = data.admin;
        localStorage.setItem('hsw_admin_token', data.token);
        localStorage.setItem('hsw_admin_user', JSON.stringify(data.admin));

        if (window.EcommerceStore) {
          window.EcommerceStore.showToast('Welcome to HILLSONWHEELS Admin Console', 'success');
        }
        this.render();
      } catch (err) {
        if (window.EcommerceStore) {
          window.EcommerceStore.showToast(err.message, 'error');
        } else {
          alert(err.message);
        }
      }
    },

    logout(notify = true) {
      this.token = '';
      this.adminUser = null;
      localStorage.removeItem('hsw_admin_token');
      localStorage.removeItem('hsw_admin_user');
      fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
      if (notify && window.EcommerceStore) {
        window.EcommerceStore.showToast('Logged out from Admin Console', 'info');
      }
      this.render();
    },

    setTab(tab) {
      this.activeTab = tab;
      this.render();
    },

    async fetchStats() {
      try {
        const res = await fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        if (!res.ok) return;
        this.stats = await res.json();
      } catch (err) {
        console.error('Stats error:', err);
      }
    },

    async fetchOrders() {
      try {
        const params = new URLSearchParams({
          status: this.filterStatus,
          search: this.searchQuery,
          limit: 100
        });
        const res = await fetch(`/api/admin/orders?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        this.orders = data.orders || [];
      } catch (err) {
        console.error('Orders error:', err);
      }
    },

    async fetchProducts() {
      try {
        const res = await fetch('/api/admin/products', {
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        this.products = data.products || [];
      } catch (err) {
        console.error('Products error:', err);
      }
    },

    async fetchTrips() {
      try {
        const res = await fetch('/api/admin/trips', {
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        this.trips = data.trips || [];
      } catch (err) {
        console.error('Trips error:', err);
      }
    },

    async updateOrderStatus(orderId, payload) {
      try {
        const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update order status');

        if (window.EcommerceStore) {
          window.EcommerceStore.showToast('Delivery status & tracking milestone updated!', 'success');
        }
        if (window.closeModal) window.closeModal();
        await this.fetchOrders();
        await this.fetchStats();
        this.render();
      } catch (err) {
        if (window.EcommerceStore) {
          window.EcommerceStore.showToast(err.message, 'error');
        } else {
          alert(err.message);
        }
      }
    },

    async adjustProductStock(sku, delta) {
      const prod = this.products.find(p => p.sku === sku);
      if (!prod) return;
      const newStock = Math.max(0, (prod.inStock || 0) + delta);
      try {
        const res = await fetch(`/api/admin/products/${encodeURIComponent(sku)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({ inStock: newStock })
        });
        if (!res.ok) throw new Error('Stock update failed');
        prod.inStock = newStock;
        if (window.EcommerceStore) {
          window.EcommerceStore.showToast(`Stock for ${prod.name} set to ${newStock}`, 'success');
        }
        this.render();
      } catch (err) {
        if (window.EcommerceStore) window.EcommerceStore.showToast(err.message, 'error');
      }
    },

    async saveProduct(productData, isEdit = false) {
      try {
        const url = isEdit ? `/api/admin/products/${encodeURIComponent(productData.sku)}` : '/api/admin/products';
        const method = isEdit ? 'PUT' : 'POST';

        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify(productData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save product');

        if (window.EcommerceStore) {
          window.EcommerceStore.showToast(isEdit ? 'Product updated successfully!' : 'New product listed in catalog!', 'success');
        }
        if (window.closeModal) window.closeModal();
        await this.fetchProducts();
        await this.fetchStats();
        this.render();
      } catch (err) {
        if (window.EcommerceStore) window.EcommerceStore.showToast(err.message, 'error');
        else alert(err.message);
      }
    },

    async deleteProduct(sku) {
      if (!confirm(`Are you sure you want to remove product "${sku}" from the catalog?`)) return;
      try {
        const res = await fetch(`/api/admin/products/${encodeURIComponent(sku)}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Delete failed');

        if (window.EcommerceStore) window.EcommerceStore.showToast('Product removed from catalog', 'info');
        await this.fetchProducts();
        await this.fetchStats();
        this.render();
      } catch (err) {
        if (window.EcommerceStore) window.EcommerceStore.showToast(err.message, 'error');
      }
    },

    async updateTripStatus(tripId, status, adminNotes) {
      try {
        const res = await fetch(`/api/admin/trips/${encodeURIComponent(tripId)}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({ status, adminNotes })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Status update failed');

        if (window.EcommerceStore) window.EcommerceStore.showToast('Tourism lead status updated!', 'success');
        if (window.closeModal) window.closeModal();
        await this.fetchTrips();
        await this.fetchStats();
        this.render();
      } catch (err) {
        if (window.EcommerceStore) window.EcommerceStore.showToast(err.message, 'error');
      }
    },

    /* ==========================================================================
       MODAL DIALOGS
       ========================================================================== */
    openStatusModal(orderId) {
      const order = this.orders.find(o => o._id === orderId);
      if (!order) return;

      const modalHtml = `
        <div style="max-width:540px;background:#fff;border-radius:8px;padding:28px">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #C5A869;padding-bottom:12px;margin-bottom:20px">
            <h3 style="font-size:18px;margin:0">Update Delivery & Order Status</h3>
            <button class="btn" style="padding:4px 10px;font-size:12px" onclick="closeModal()">Close</button>
          </div>

          <div style="font-size:12px;color:#797f74;margin-bottom:16px">
            Order: <strong>${order.orderNumber}</strong> · Customer: <strong>${order.shippingAddress?.fullName || 'Patron'}</strong>
          </div>

          <form onsubmit="event.preventDefault(); AdminStore.handleStatusSubmit('${order._id}', this)">
            <div style="margin-bottom:14px">
              <label style="display:block;font-size:11.5px;font-weight:700;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">Fulfillment Status</label>
              <select name="orderStatus" style="width:100%;padding:10px;border:1px solid #d1cbbe;border-radius:4px;font-size:13px">
                <option value="confirmed" ${order.orderStatus === 'confirmed' ? 'selected' : ''}>Confirmed & Preparing</option>
                <option value="harvest_packaged" ${order.orderStatus === 'harvest_packaged' ? 'selected' : ''}>Harvest Packaged & Inspected</option>
                <option value="dispatched" ${order.orderStatus === 'dispatched' ? 'selected' : ''}>Dispatched from Haldwani/Delhi Hub</option>
                <option value="in_transit" ${order.orderStatus === 'in_transit' ? 'selected' : ''}>In Transit with Courier</option>
                <option value="out_for_delivery" ${order.orderStatus === 'out_for_delivery' ? 'selected' : ''}>Out for Delivery</option>
                <option value="delivered" ${order.orderStatus === 'delivered' ? 'selected' : ''}>Delivered to Customer</option>
                <option value="cancelled" ${order.orderStatus === 'cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </div>

            <div style="margin-bottom:14px">
              <label style="display:block;font-size:11.5px;font-weight:700;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">Payment Status</label>
              <select name="paymentStatus" style="width:100%;padding:10px;border:1px solid #d1cbbe;border-radius:4px;font-size:13px">
                <option value="paid" ${order.paymentStatus === 'paid' ? 'selected' : ''}>Paid (Verified / Collected)</option>
                <option value="cod_pending" ${order.paymentStatus === 'cod_pending' ? 'selected' : ''}>COD Pending (Pay on Delivery)</option>
                <option value="pending" ${order.paymentStatus === 'pending' ? 'selected' : ''}>Pending Gateway Settlement</option>
                <option value="refunded" ${order.paymentStatus === 'refunded' ? 'selected' : ''}>Refunded</option>
              </select>
            </div>

            <div style="margin-bottom:14px">
              <label style="display:block;font-size:11.5px;font-weight:700;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">Milestone Checkpoint Title (Optional)</label>
              <input name="title" placeholder="e.g. Arrived at Delhi Sorting Facility" style="width:100%;padding:10px;border:1px solid #d1cbbe;border-radius:4px;font-size:13px">
            </div>

            <div style="margin-bottom:14px">
              <label style="display:block;font-size:11.5px;font-weight:700;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">Current Location / Hub</label>
              <input name="location" value="Haldwani Hub / Central Logistics" style="width:100%;padding:10px;border:1px solid #d1cbbe;border-radius:4px;font-size:13px">
            </div>

            <div style="margin-bottom:20px">
              <label style="display:block;font-size:11.5px;font-weight:700;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">Courier Note / Remarks</label>
              <textarea name="note" rows="2" placeholder="e.g. Package cleared morning gate inspection and handed to air transit" style="width:100%;padding:10px;border:1px solid #d1cbbe;border-radius:4px;font-size:13px;resize:vertical"></textarea>
            </div>

            <div style="display:flex;justify-content:flex-end;gap:10px">
              <button type="button" class="btn" onclick="closeModal()">Cancel</button>
              <button type="submit" class="btn on">Update Status & Timeline</button>
            </div>
          </form>
        </div>
      `;
      if (window.openModal) window.openModal(modalHtml);
    },

    handleStatusSubmit(orderId, form) {
      const payload = {
        orderStatus: form.orderStatus.value,
        paymentStatus: form.paymentStatus.value,
        title: form.title.value.trim(),
        location: form.location.value.trim(),
        note: form.note.value.trim()
      };
      this.updateOrderStatus(orderId, payload);
    },

    openProductModal(sku = null) {
      const p = sku ? this.products.find(x => x.sku === sku) : null;
      const isEdit = Boolean(p);

      const modalHtml = `
        <div style="max-width:640px;background:#fff;border-radius:8px;padding:30px;max-height:85vh;overflow-y:auto">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #C5A869;padding-bottom:12px;margin-bottom:20px">
            <h3 style="font-size:20px;margin:0">${isEdit ? 'Edit Catalog Item' : 'Add New Product to Catalog'}</h3>
            <button class="btn" style="padding:4px 10px;font-size:12px" onclick="closeModal()">Close</button>
          </div>

          <form onsubmit="event.preventDefault(); AdminStore.handleProductSubmit(this, ${isEdit})">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
              <div>
                <label style="display:block;font-size:11px;font-weight:700;margin-bottom:4px;text-transform:uppercase">SKU (Unique Identifier)</label>
                <input name="sku" value="${p?.sku || ''}" ${isEdit ? 'readonly style="background:#f4f2ec"' : ''} placeholder="e.g. wild-rhododendron-500g" required style="width:100%;padding:9px;border:1px solid #d1cbbe;border-radius:4px;font-size:13px">
              </div>
              <div>
                <label style="display:block;font-size:11px;font-weight:700;margin-bottom:4px;text-transform:uppercase">Product Name</label>
                <input name="name" value="${p?.name || ''}" placeholder="e.g. Wild Rhododendron Honey" required style="width:100%;padding:9px;border:1px solid #d1cbbe;border-radius:4px;font-size:13px">
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:14px">
              <div>
                <label style="display:block;font-size:11px;font-weight:700;margin-bottom:4px;text-transform:uppercase">Variant / Pack</label>
                <input name="variant" value="${p?.variant || '500g Glass Jar'}" style="width:100%;padding:9px;border:1px solid #d1cbbe;border-radius:4px;font-size:13px">
              </div>
              <div>
                <label style="display:block;font-size:11px;font-weight:700;margin-bottom:4px;text-transform:uppercase">Selling Price (₹)</label>
                <input name="unitPrice" type="number" value="${p?.unitPrice || ''}" required style="width:100%;padding:9px;border:1px solid #d1cbbe;border-radius:4px;font-size:13px">
              </div>
              <div>
                <label style="display:block;font-size:11px;font-weight:700;margin-bottom:4px;text-transform:uppercase">MRP / Strikethrough (₹)</label>
                <input name="mrp" type="number" value="${p?.mrp || ''}" style="width:100%;padding:9px;border:1px solid #d1cbbe;border-radius:4px;font-size:13px">
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:14px">
              <div>
                <label style="display:block;font-size:11px;font-weight:700;margin-bottom:4px;text-transform:uppercase">Category</label>
                <select name="category" style="width:100%;padding:9px;border:1px solid #d1cbbe;border-radius:4px;font-size:13px">
                  ${['Honey','Pulses','Spices','Dry Fruits','Pickles','Herbs','Handicrafts'].map(c => `
                    <option value="${c}" ${p?.category === c ? 'selected' : ''}>${c}</option>
                  `).join('')}
                </select>
              </div>
              <div>
                <label style="display:block;font-size:11px;font-weight:700;margin-bottom:4px;text-transform:uppercase">Available Stock Units</label>
                <input name="inStock" type="number" value="${p?.inStock ?? 25}" required style="width:100%;padding:9px;border:1px solid #d1cbbe;border-radius:4px;font-size:13px">
              </div>
              <div>
                <label style="display:block;font-size:11px;font-weight:700;margin-bottom:4px;text-transform:uppercase">Origin / Altitude</label>
                <input name="origin" value="${p?.origin || 'Chamoli · 2,400m'}" style="width:100%;padding:9px;border:1px solid #d1cbbe;border-radius:4px;font-size:13px">
              </div>
            </div>

            <div style="margin-bottom:14px">
              <label style="display:block;font-size:11px;font-weight:700;margin-bottom:4px;text-transform:uppercase">Product Description</label>
              <textarea name="description" rows="3" style="width:100%;padding:9px;border:1px solid #d1cbbe;border-radius:4px;font-size:13px;resize:vertical">${p?.description || 'Authentic mountain produce harvested directly by local Uttarakhand cooperatives.'}</textarea>
            </div>

            <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px">
              <button type="button" class="btn" onclick="closeModal()">Cancel</button>
              <button type="submit" class="btn on">${isEdit ? 'Save Changes' : 'Publish Product'}</button>
            </div>
          </form>
        </div>
      `;
      if (window.openModal) window.openModal(modalHtml);
    },

    handleProductSubmit(form, isEdit) {
      const data = {
        sku: form.sku.value.trim(),
        name: form.name.value.trim(),
        variant: form.variant.value.trim(),
        unitPrice: Number(form.unitPrice.value),
        mrp: Number(form.mrp.value || form.unitPrice.value),
        category: form.category.value,
        inStock: Number(form.inStock.value),
        origin: form.origin.value.trim(),
        description: form.description.value.trim(),
        photoKey: 'p1'
      };
      this.saveProduct(data, isEdit);
    },

    openTripModal(tripId) {
      const trip = this.trips.find(t => t._id === tripId);
      if (!trip) return;

      const modalHtml = `
        <div style="max-width:520px;background:#fff;border-radius:8px;padding:28px">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #C5A869;padding-bottom:12px;margin-bottom:20px">
            <h3 style="font-size:18px;margin:0">Manage Tourism Lead</h3>
            <button class="btn" style="padding:4px 10px;font-size:12px" onclick="closeModal()">Close</button>
          </div>

          <div style="font-size:13px;line-height:1.7;background:#fbf9f4;padding:14px;border-radius:4px;margin-bottom:16px">
            <div><strong>Destination:</strong> ${trip.destination}</div>
            <div><strong>Style:</strong> ${trip.journeyStyle} · <strong>Travelers:</strong> ${trip.travelers}</div>
            <div><strong>Stay:</strong> ${trip.stayPreference}</div>
            ${trip.notes ? `<div style="margin-top:6px;font-style:italic">"${trip.notes}"</div>` : ''}
          </div>

          <form onsubmit="event.preventDefault(); AdminStore.handleTripSubmit('${trip._id}', this)">
            <div style="margin-bottom:14px">
              <label style="display:block;font-size:11px;font-weight:700;margin-bottom:4px;text-transform:uppercase">Lead Status</label>
              <select name="status" style="width:100%;padding:9px;border:1px solid #d1cbbe;border-radius:4px;font-size:13px">
                <option value="new" ${trip.status === 'new' ? 'selected' : ''}>New Lead (Pending Contact)</option>
                <option value="contacted" ${trip.status === 'contacted' ? 'selected' : ''}>Contacted via Phone/Email</option>
                <option value="itinerary_sent" ${trip.status === 'itinerary_sent' ? 'selected' : ''}>Custom Itinerary Sent</option>
                <option value="confirmed" ${trip.status === 'confirmed' ? 'selected' : ''}>Confirmed & Booked</option>
                <option value="completed" ${trip.status === 'completed' ? 'selected' : ''}>Journey Completed</option>
                <option value="cancelled" ${trip.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </div>

            <div style="margin-bottom:20px">
              <label style="display:block;font-size:11px;font-weight:700;margin-bottom:4px;text-transform:uppercase">Internal Vendor Notes</label>
              <textarea name="adminNotes" rows="3" placeholder="Add guide assignment or customer notes..." style="width:100%;padding:9px;border:1px solid #d1cbbe;border-radius:4px;font-size:13px;resize:vertical">${trip.adminNotes || ''}</textarea>
            </div>

            <div style="display:flex;justify-content:flex-end;gap:10px">
              <button type="button" class="btn" onclick="closeModal()">Cancel</button>
              <button type="submit" class="btn on">Save Lead Status</button>
            </div>
          </form>
        </div>
      `;
      if (window.openModal) window.openModal(modalHtml);
    },

    handleTripSubmit(tripId, form) {
      this.updateTripStatus(tripId, form.status.value, form.adminNotes.value.trim());
    },

    /* ==========================================================================
       RENDER MAIN ADMIN CONSOLE
       ========================================================================== */
    async render() {
      const app = document.getElementById('app');
      if (!app) return;
      window.scrollTo(0, 0);

      // If NOT logged in -> Render Luxury Admin Sign-in Card
      if (!this.token) {
        app.innerHTML = this.renderLoginCard();
        return;
      }

      // If logged in -> Load data and render Admin Dashboard
      if (!this.stats) await this.fetchStats();
      if (this.activeTab === 'orders') await this.fetchOrders();
      if (this.activeTab === 'products') await this.fetchProducts();
      if (this.activeTab === 'trips') await this.fetchTrips();

      const fmt = (n) => `₹ ${Number(n || 0).toLocaleString('en-IN')}`;

      app.innerHTML = `
        <div style="background:#0f100d;min-height:100vh;color:#E9E3D5;font-family:var(--sans)">
          <!-- Top Console Bar -->
          <header style="background:#171815;border-bottom:1px solid rgba(197,168,105,0.25);padding:14px 28px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px">
            <div style="display:flex;align-items:center;gap:16px">
              <span style="font-weight:900;letter-spacing:2px;font-size:18px;color:#C5A869">HILLSONWHEELS</span>
              <span style="background:rgba(197,168,105,0.15);color:#C5A869;font-size:11px;font-weight:700;letter-spacing:1px;padding:3px 8px;border-radius:3px">VENDOR CONSOLE</span>
            </div>
            <div style="display:flex;align-items:center;gap:16px;font-size:13px">
              <span style="color:#797f74">Logged in as: <strong style="color:#E9E3D5">${this.adminUser?.username || 'admin@1234'}</strong></span>
              <button class="btn" style="padding:6px 14px;font-size:12px" onclick="window.go('home')">Storefront View</button>
              <button class="btn" style="padding:6px 14px;font-size:12px;color:#ef4444;border-color:rgba(239,68,68,0.3)" onclick="AdminStore.logout()">Sign Out</button>
            </div>
          </header>

          <!-- Navigation Sub-Tabs -->
          <div style="background:#121310;border-bottom:1px solid #232520;padding:0 28px;display:flex;gap:8px;overflow-x:auto">
            <button class="admin-nav-btn ${this.activeTab === 'overview' ? 'active' : ''}" onclick="AdminStore.setTab('overview')">Overview & KPIs</button>
            <button class="admin-nav-btn ${this.activeTab === 'orders' ? 'active' : ''}" onclick="AdminStore.setTab('orders')">Order Fulfillment & Delivery (${this.stats?.pendingOrders || 0} Pending)</button>
            <button class="admin-nav-btn ${this.activeTab === 'products' ? 'active' : ''}" onclick="AdminStore.setTab('products')">Product & Stock Inventory (${this.stats?.totalProducts || 0})</button>
            <button class="admin-nav-btn ${this.activeTab === 'trips' ? 'active' : ''}" onclick="AdminStore.setTab('trips')">Tourism Leads (${this.stats?.newTrips || 0} New)</button>
          </div>

          <style>
            .admin-nav-btn { background: none; border: none; padding: 14px 20px; color: #797f74; font-weight: 700; font-size: 13.5px; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; white-space: nowrap; }
            .admin-nav-btn:hover { color: #C5A869; }
            .admin-nav-btn.active { color: #C5A869; border-bottom-color: #C5A869; }
            .kpi-card { background: #1a1b18; border: 1px solid #282a24; border-radius: 6px; padding: 22px; transition: border-color 0.2s; }
            .kpi-card:hover { border-color: rgba(197,168,105,0.4); }
            .admin-table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
            .admin-table th { background: #171815; color: #888e82; padding: 12px 14px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid #282a24; }
            .admin-table td { padding: 14px; border-bottom: 1px solid #20221c; vertical-align: middle; }
            .admin-table tbody tr:hover { background: #141512; }
            .badge-status { display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 3px; letter-spacing: 0.5px; }
          </style>

          <main style="padding:28px;max-width:1400px;margin:0 auto">
            ${this.renderActiveTabContent()}
          </main>
        </div>
      `;
    },

    renderLoginCard() {
      return `
        <div style="min-height:90vh;display:flex;align-items:center;justify-content:center;padding:40px 20px;background:#0f100d;color:#E9E3D5;font-family:var(--sans)">
          <div style="background:#171815;border:1px solid rgba(197,168,105,0.3);border-radius:8px;padding:40px;max-width:440px;width:100%;box-shadow:0 12px 40px rgba(0,0,0,0.5)">
            <div style="text-align:center;margin-bottom:28px">
              <span style="font-weight:900;letter-spacing:2.5px;font-size:22px;color:#C5A869">HILLSONWHEELS</span>
              <div style="font-size:12px;color:#797f74;letter-spacing:1px;margin-top:6px;text-transform:uppercase">Vendor & Admin Management Console</div>
            </div>

            <form onsubmit="event.preventDefault(); AdminStore.login(this.username.value, this.password.value)">
              <div style="margin-bottom:16px">
                <label style="display:block;font-size:11px;font-weight:700;margin-bottom:6px;letter-spacing:1px;color:#9da296;text-transform:uppercase">Admin ID / Email</label>
                <input name="username" value="admin@1234" required placeholder="admin@1234" style="width:100%;padding:12px;background:#0d0e0c;border:1px solid #2d3027;color:#fff;border-radius:4px;font-size:14px">
              </div>

              <div style="margin-bottom:24px">
                <label style="display:block;font-size:11px;font-weight:700;margin-bottom:6px;letter-spacing:1px;color:#9da296;text-transform:uppercase">Security Password</label>
                <input name="password" type="password" value="admin@4321" required placeholder="••••••••" style="width:100%;padding:12px;background:#0d0e0c;border:1px solid #2d3027;color:#fff;border-radius:4px;font-size:14px">
              </div>

              <button type="submit" class="btn on" style="width:100%;padding:13px;font-size:14px">Authenticate & Open Console</button>

              <div style="margin-top:20px;text-align:center">
                <a onclick="window.go('home')" style="color:#797f74;font-size:12px;cursor:pointer;text-decoration:none">Return to Storefront</a>
              </div>
            </form>
          </div>
        </div>
      `;
    },

    renderActiveTabContent() {
      switch (this.activeTab) {
        case 'overview': return this.renderOverviewTab();
        case 'orders': return this.renderOrdersTab();
        case 'products': return this.renderProductsTab();
        case 'trips': return this.renderTripsTab();
        default: return this.renderOverviewTab();
      }
    },

    renderOverviewTab() {
      const s = this.stats || {};
      const fmt = (n) => `₹ ${Number(n || 0).toLocaleString('en-IN')}`;

      return `
        <div>
          <!-- Top KPI Grid -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin-bottom:32px">
            <div class="kpi-card">
              <div style="font-size:11.5px;color:#797f74;font-weight:700;text-transform:uppercase;letter-spacing:1px">Total Settled Revenue</div>
              <div style="font-size:28px;font-weight:900;color:#C5A869;margin:8px 0">${fmt(s.totalRevenue || 0)}</div>
              <div style="font-size:12px;color:#059669">Verified & Delivered orders</div>
            </div>

            <div class="kpi-card">
              <div style="font-size:11.5px;color:#797f74;font-weight:700;text-transform:uppercase;letter-spacing:1px">Total Lifetime Orders</div>
              <div style="font-size:28px;font-weight:900;color:#E9E3D5;margin:8px 0">${s.totalOrders || 0}</div>
              <div style="font-size:12px;color:#797f74">${s.recentOrdersCount || 0} orders in last 7 days</div>
            </div>

            <div class="kpi-card">
              <div style="font-size:11.5px;color:#797f74;font-weight:700;text-transform:uppercase;letter-spacing:1px">Pending Fulfillment</div>
              <div style="font-size:28px;font-weight:900;color:${s.pendingOrders > 0 ? '#f59e0b' : '#059669'};margin:8px 0">${s.pendingOrders || 0}</div>
              <div style="font-size:12px;color:#797f74">Awaiting dispatch packaging</div>
            </div>

            <div class="kpi-card">
              <div style="font-size:11.5px;color:#797f74;font-weight:700;text-transform:uppercase;letter-spacing:1px">Active Catalog SKUs</div>
              <div style="font-size:28px;font-weight:900;color:#E9E3D5;margin:8px 0">${s.totalProducts || 0}</div>
              <div style="font-size:12px;color:${s.lowStockCount > 0 ? '#ef4444' : '#797f74'}">${s.lowStockCount || 0} items low in stock (&le; 5)</div>
            </div>

            <div class="kpi-card">
              <div style="font-size:11.5px;color:#797f74;font-weight:700;text-transform:uppercase;letter-spacing:1px">Tourism Journey Leads</div>
              <div style="font-size:28px;font-weight:900;color:#C5A869;margin:8px 0">${s.totalTrips || 0}</div>
              <div style="font-size:12px;color:#059669">${s.newTrips || 0} new itineraries requested</div>
            </div>
          </div>

          <!-- Quick Shortcuts & Low Stock Alert -->
          <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:24px;align-items:flex-start">
            <div style="background:#171815;border:1px solid #282a24;border-radius:6px;padding:24px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
                <h3 style="font-size:16px;margin:0">Quick Vendor Actions</h3>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <button class="btn on" style="padding:14px;font-size:13px;text-align:left" onclick="AdminStore.setTab('orders')">
                  <strong>Manage Dispatches & Tracking</strong><br>
                  <span style="font-size:11px;opacity:0.8">Update delivery status and milestones</span>
                </button>
                <button class="btn" style="padding:14px;font-size:13px;text-align:left" onclick="AdminStore.openProductModal()">
                  <strong>+ List New Item in Catalog</strong><br>
                  <span style="font-size:11px;opacity:0.8">Add SKU, pricing, and stock units</span>
                </button>
                <button class="btn" style="padding:14px;font-size:13px;text-align:left" onclick="AdminStore.setTab('products')">
                  <strong>Adjust Inventory Stock</strong><br>
                  <span style="font-size:11px;opacity:0.8">Update warehouse harvest quantities</span>
                </button>
                <button class="btn" style="padding:14px;font-size:13px;text-align:left" onclick="AdminStore.setTab('trips')">
                  <strong>Review Travel Requests</strong><br>
                  <span style="font-size:11px;opacity:0.8">Follow up with custom itinerary patrons</span>
                </button>
              </div>
            </div>

            <div style="background:#171815;border:1px solid #282a24;border-radius:6px;padding:24px">
              <h3 style="font-size:16px;margin:0 0 16px">Low Stock Warehouse Monitor</h3>
              ${s.lowStockProducts && s.lowStockProducts.length ? `
                <div style="display:flex;flex-direction:column;gap:10px">
                  ${s.lowStockProducts.map(p => `
                    <div style="display:flex;justify-content:space-between;align-items:center;background:#121310;padding:10px 14px;border-radius:4px;border:1px solid rgba(239,68,68,0.2)">
                      <div>
                        <div style="font-weight:700;font-size:13px">${p.name}</div>
                        <div style="font-size:11.5px;color:#797f74">${p.variant} · SKU: ${p.sku}</div>
                      </div>
                      <div style="text-align:right">
                        <span style="color:#ef4444;font-weight:800;font-size:14px">${p.inStock} Left</span>
                        <div style="margin-top:2px">
                          <button class="btn" style="padding:2px 8px;font-size:10px" onclick="AdminStore.adjustProductStock('${p.sku}', 10)">+10 Units</button>
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <p style="color:#059669;font-size:13px">All active products maintain healthy stock levels above threshold.</p>
              `}
            </div>
          </div>
        </div>
      `;
    },

    renderOrdersTab() {
      const orders = this.orders || [];
      const fmt = (n) => `₹ ${Number(n || 0).toLocaleString('en-IN')}`;

      const statusBadge = (st) => {
        const map = {
          confirmed: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', label: 'Confirmed' },
          harvest_packaged: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', label: 'Harvest Packaged' },
          dispatched: { bg: 'rgba(168,85,247,0.15)', color: '#c084fc', label: 'Dispatched' },
          in_transit: { bg: 'rgba(197,168,105,0.15)', color: '#C5A869', label: 'In Transit' },
          out_for_delivery: { bg: 'rgba(234,88,12,0.15)', color: '#fb923c', label: 'Out for Delivery' },
          delivered: { bg: 'rgba(16,185,129,0.15)', color: '#34d399', label: 'Delivered' },
          cancelled: { bg: 'rgba(239,68,68,0.15)', color: '#f87171', label: 'Cancelled' }
        };
        const item = map[st] || { bg: '#282a24', color: '#797f74', label: st };
        return `<span class="badge-status" style="background:${item.bg};color:${item.color}">${item.label}</span>`;
      };

      return `
        <div>
          <!-- Filter Controls -->
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;margin-bottom:20px">
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              ${['all', 'confirmed', 'dispatched', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'].map(st => `
                <button class="btn ${this.filterStatus === st ? 'on' : ''}" style="padding:6px 12px;font-size:12px;text-transform:capitalize" onclick="AdminStore.filterStatus='${st}';AdminStore.fetchOrders().then(()=>AdminStore.render())">${st.replace(/_/g, ' ')}</button>
              `).join('')}
            </div>

            <div style="display:flex;gap:10px">
              <input placeholder="Search Order #, Name, Phone..." value="${this.searchQuery}" oninput="AdminStore.searchQuery=this.value" onkeydown="if(event.key==='Enter'){AdminStore.fetchOrders().then(()=>AdminStore.render())}" style="padding:8px 14px;background:#171815;border:1px solid #2d3027;color:#fff;border-radius:4px;font-size:13px;width:260px">
              <button class="btn on" style="padding:8px 14px;font-size:12px" onclick="AdminStore.fetchOrders().then(()=>AdminStore.render())">Search</button>
            </div>
          </div>

          <!-- Orders Table -->
          <div style="background:#171815;border:1px solid #282a24;border-radius:6px;overflow-x:auto">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Order No / Date</th>
                  <th>Patron & Destination</th>
                  <th>Items Purchased</th>
                  <th>Total / Payment</th>
                  <th>Fulfillment Status</th>
                  <th style="text-align:right">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${orders.length ? orders.map(o => {
                  const addr = o.shippingAddress || {};
                  const itemsStr = (o.items || []).map(i => `${i.quantity}x ${i.name}`).join(', ');
                  return `
                    <tr>
                      <td>
                        <strong style="color:#C5A869">${o.orderNumber}</strong><br>
                        <span style="font-size:11px;color:#797f74">${new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span><br>
                        <span style="font-size:10.5px;color:#52584d">Trk: ${o.trackingNumber || 'N/A'}</span>
                      </td>
                      <td>
                        <strong>${addr.fullName || 'Mountain Patron'}</strong><br>
                        <span style="font-size:11.5px;color:#797f74">${addr.city || ''}, ${addr.state || ''} — ${addr.pincode || ''}</span><br>
                        <span style="font-size:11.5px;color:#C5A869">${addr.phone || ''}</span>
                      </td>
                      <td style="max-width:240px">
                        <span style="font-size:12px;color:#ccc">${itemsStr}</span>
                      </td>
                      <td>
                        <strong>${fmt(o.total)}</strong><br>
                        <span style="font-size:11px;text-transform:uppercase;color:#797f74">${o.paymentMethod} · </span>
                        <span style="font-size:11px;font-weight:700;color:${o.paymentStatus === 'paid' ? '#34d399' : '#fbbf24'}">${o.paymentStatus}</span>
                      </td>
                      <td>
                        ${statusBadge(o.orderStatus)}
                      </td>
                      <td style="text-align:right;white-space:nowrap">
                        <button class="btn on" style="padding:6px 12px;font-size:11.5px" onclick="AdminStore.openStatusModal('${o._id}')">Update Status</button>
                        <button class="btn" style="padding:6px 10px;font-size:11.5px;margin-left:6px" onclick="if(window.EcommerceStore)EcommerceStore.printInvoice('${o.orderNumber}')">Tax Invoice</button>
                      </td>
                    </tr>
                  `;
                }).join('') : `
                  <tr>
                    <td colspan="6" style="text-align:center;padding:40px;color:#797f74">No matching orders found.</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
      `;
    },

    renderProductsTab() {
      const products = this.products || [];
      const fmt = (n) => `₹ ${Number(n || 0).toLocaleString('en-IN')}`;

      return `
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:14px">
            <h3 style="font-size:18px;margin:0">Active Mountain Produce Inventory (${products.length} Items)</h3>
            <button class="btn on" style="padding:8px 18px;font-size:13px" onclick="AdminStore.openProductModal()">+ List New Item in Catalog</button>
          </div>

          <div style="background:#171815;border:1px solid #282a24;border-radius:6px;overflow-x:auto">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Product & Variant</th>
                  <th>Category</th>
                  <th>Origin / Altitude</th>
                  <th>Pricing</th>
                  <th>Warehouse Stock</th>
                  <th style="text-align:right">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${products.map(p => `
                  <tr>
                    <td>
                      <strong style="color:#E9E3D5;font-size:14px">${p.name}</strong><br>
                      <span style="font-size:11.5px;color:#797f74">${p.variant} · SKU: <code style="color:#C5A869">${p.sku}</code></span>
                    </td>
                    <td><span class="badge-status" style="background:#282a24;color:#E9E3D5">${p.category}</span></td>
                    <td style="font-size:12px;color:#797f74">${p.origin || 'Uttarakhand'}</td>
                    <td>
                      <strong>${fmt(p.unitPrice)}</strong>
                      ${p.mrp ? `<span style="font-size:11px;color:#797f74;text-decoration:line-through;margin-left:6px">${fmt(p.mrp)}</span>` : ''}
                    </td>
                    <td>
                      <div style="display:flex;align-items:center;gap:8px">
                        <button class="btn" style="padding:2px 8px;font-size:12px" onclick="AdminStore.adjustProductStock('${p.sku}', -1)">-</button>
                        <span style="font-weight:800;font-size:14px;color:${(p.inStock || 0) <= 5 ? '#ef4444' : '#34d399'}">${p.inStock || 0}</span>
                        <button class="btn" style="padding:2px 8px;font-size:12px" onclick="AdminStore.adjustProductStock('${p.sku}', 1)">+</button>
                      </div>
                    </td>
                    <td style="text-align:right;white-space:nowrap">
                      <button class="btn" style="padding:6px 12px;font-size:11.5px" onclick="AdminStore.openProductModal('${p.sku}')">Edit</button>
                      <button class="btn" style="padding:6px 10px;font-size:11.5px;color:#ef4444;border-color:rgba(239,68,68,0.3);margin-left:6px" onclick="AdminStore.deleteProduct('${p.sku}')">Delete</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    },

    renderTripsTab() {
      const trips = this.trips || [];

      return `
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
            <h3 style="font-size:18px;margin:0">Patron Uttarakhand Journey Inquiries (${trips.length})</h3>
          </div>

          <div style="background:#171815;border:1px solid #282a24;border-radius:6px;overflow-x:auto">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Destination & Style</th>
                  <th>Guests & Preference</th>
                  <th>Travel Dates</th>
                  <th>Status</th>
                  <th>Special Notes</th>
                  <th style="text-align:right">Action</th>
                </tr>
              </thead>
              <tbody>
                ${trips.length ? trips.map(t => `
                  <tr>
                    <td>
                      <strong style="color:#C5A869;font-size:14px">${t.destination}</strong><br>
                      <span style="font-size:11.5px;color:#797f74">${t.journeyStyle}</span>
                    </td>
                    <td>
                      <strong>${t.travelers}</strong><br>
                      <span style="font-size:11.5px;color:#797f74">${t.stayPreference}</span>
                    </td>
                    <td style="font-size:12px">
                      ${t.startDate ? new Date(t.startDate).toLocaleDateString('en-IN') : 'Flexible'}
                    </td>
                    <td>
                      <span class="badge-status" style="background:rgba(197,168,105,0.15);color:#C5A869">${(t.status || 'new').toUpperCase()}</span>
                    </td>
                    <td style="font-size:12px;color:#ccc;max-width:240px">
                      ${t.notes || 'No special notes'}
                    </td>
                    <td style="text-align:right">
                      <button class="btn on" style="padding:6px 12px;font-size:11.5px" onclick="AdminStore.openTripModal('${t._id}')">Update Lead</button>
                    </td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="6" style="text-align:center;padding:40px;color:#797f74">No tourism inquiries logged yet.</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
  };

  window.AdminStore = AdminStore;
  document.addEventListener('DOMContentLoaded', () => AdminStore.init());
})();
