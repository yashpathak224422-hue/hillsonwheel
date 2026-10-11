'use strict';
const nodemailer = require('nodemailer');

/* ==========================================================================
   SMTP TRANSPORT
   ========================================================================== */
function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.EMAIL_FROM);
}

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined
  });
}

async function sendEmail({ to, subject, html, text, attachments }) {
  if (!hasSmtpConfig()) return false;
  const transport = createTransport();
  await transport.sendMail({
    from: `"HILLSONWHEELS" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
    text: text || subject,
    attachments: attachments || []
  });
  return true;
}

/* ==========================================================================
   WHATSAPP OTP
   ========================================================================== */
function hasWhatsAppConfig() {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID &&
    process.env.WHATSAPP_OTP_TEMPLATE
  );
}

async function sendWhatsAppOTP({ to, code }) {
  if (!hasWhatsAppConfig()) return false;
  const apiVersion = (process.env.WHATSAPP_API_VERSION || 'v25.0').replace(/^v/, '');
  if (!/^\d+\.\d+$/.test(apiVersion)) throw new Error('Invalid WhatsApp Graph API version');
  const endpoint = `https://graph.facebook.com/v${apiVersion}/${encodeURIComponent(process.env.WHATSAPP_PHONE_NUMBER_ID)}/messages`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to.replace(/\D/g, ''),
      type: 'template',
      template: {
        name: process.env.WHATSAPP_OTP_TEMPLATE,
        language: { code: process.env.WHATSAPP_OTP_LANGUAGE || 'en_US' },
        components: [
          { type: 'body', parameters: [{ type: 'text', text: code }] },
          { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: code }] }
        ]
      }
    })
  });
  if (!response.ok) throw new Error('WhatsApp Cloud API rejected the OTP message');
  return true;
}

async function sendVerification({ channel, destination, code }) {
  if (channel === 'phone') return sendWhatsAppOTP({ to: destination, code });
  return sendEmail({
    to: destination,
    subject: `${code} — Your HILLSONWHEELS Verification Code`,
    html: buildOtpEmail(code),
    text: `Your HILLSONWHEELS verification code is ${code}. It expires in 10 minutes.`
  });
}

/* ==========================================================================
   EMAIL TEMPLATE HELPERS
   ========================================================================== */
const BRAND_COLOR = '#C5A869';
const DARK = '#1a1b18';
const BG = '#f8f6f0';

function emailWrapper(content, previewText = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HILLSONWHEELS</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background: ${BG}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: ${DARK}; }
    .email-wrapper { max-width: 640px; margin: 0 auto; background: #fff; }
    .header { background: ${DARK}; padding: 28px 36px; text-align: center; }
    .header-brand { color: ${BRAND_COLOR}; font-size: 22px; font-weight: 800; letter-spacing: 3px; }
    .header-sub { color: rgba(255,255,255,0.55); font-size: 11px; letter-spacing: 1.5px; margin-top: 4px; }
    .body { padding: 36px; }
    .hero-badge { display: inline-block; background: rgba(197,168,105,0.12); border: 1px solid rgba(197,168,105,0.4); color: ${BRAND_COLOR}; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; padding: 5px 12px; border-radius: 99px; margin-bottom: 16px; text-transform: uppercase; }
    h1 { font-size: 28px; font-weight: 800; margin: 0 0 12px; color: ${DARK}; line-height: 1.25; }
    h2 { font-size: 20px; font-weight: 700; margin: 28px 0 12px; color: ${DARK}; }
    p { font-size: 14.5px; line-height: 1.75; color: #52584d; margin: 0 0 16px; }
    .order-meta { background: ${BG}; border-radius: 6px; padding: 18px 22px; margin: 22px 0; border-left: 3px solid ${BRAND_COLOR}; }
    .order-meta-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
    .order-meta-label { color: #797f74; }
    .order-meta-value { font-weight: 700; color: ${DARK}; }
    table.items { width: 100%; border-collapse: collapse; margin: 18px 0; }
    table.items th { background: ${BG}; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; padding: 10px 12px; text-align: left; color: #797f74; border-bottom: 1px solid #e4e1d8; }
    table.items td { font-size: 13.5px; padding: 12px; border-bottom: 1px solid #f0ede5; vertical-align: middle; color: ${DARK}; }
    table.items tr:last-child td { border-bottom: none; }
    .price-summary { background: ${BG}; border-radius: 6px; padding: 18px 22px; margin: 18px 0; }
    .price-row { display: flex; justify-content: space-between; font-size: 13.5px; padding: 5px 0; color: #52584d; }
    .price-row.total { font-size: 17px; font-weight: 800; color: ${DARK}; border-top: 2px solid #e4e1d8; margin-top: 8px; padding-top: 12px; }
    .price-row.discount { color: #047857; font-weight: 600; }
    .tracking-box { background: ${DARK}; color: #fff; border-radius: 6px; padding: 20px 24px; margin: 22px 0; text-align: center; }
    .tracking-id { font-family: 'Courier New', Courier, monospace; font-size: 18px; color: ${BRAND_COLOR}; font-weight: 700; letter-spacing: 2px; margin: 8px 0; }
    .btn-primary { display: inline-block; background: ${BRAND_COLOR}; color: ${DARK}; font-size: 13px; font-weight: 800; letter-spacing: 1px; padding: 12px 28px; border-radius: 3px; text-decoration: none; margin: 8px 4px; }
    .btn-secondary { display: inline-block; background: transparent; border: 1.5px solid ${DARK}; color: ${DARK}; font-size: 13px; font-weight: 700; padding: 11px 26px; border-radius: 3px; text-decoration: none; margin: 8px 4px; }
    .trust-strip { display: flex; gap: 18px; justify-content: center; margin: 24px 0; flex-wrap: wrap; }
    .trust-item { font-size: 11px; color: #797f74; display: flex; align-items: center; gap: 5px; }
    .address-box { background: ${BG}; border-radius: 6px; padding: 16px 20px; font-size: 13px; line-height: 1.75; color: #52584d; margin: 10px 0; }
    .footer { background: ${DARK}; padding: 24px 36px; text-align: center; }
    .footer p { font-size: 11px; color: rgba(255,255,255,0.4); margin: 4px 0; }
    .footer a { color: ${BRAND_COLOR}; text-decoration: none; }
    .divider { height: 1px; background: #e8e4da; margin: 24px 0; border: none; }
    .highlight { color: ${BRAND_COLOR}; font-weight: 700; }
    .success-icon { width: 56px; height: 56px; background: rgba(197,168,105,0.15); border: 2px solid ${BRAND_COLOR}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 24px; }
  </style>
</head>
<body>
  ${previewText ? `<div style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">${previewText}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}
  <div class="email-wrapper">
    <div class="header">
      <div class="header-brand">HILLSONWHEELS</div>
      <div class="header-sub">THE WORLD OF UTTARAKHAND · SINCE 2024</div>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p style="font-weight:700;color:rgba(255,255,255,0.8);font-size:12px">HILLSONWHEELS</p>
      <p>Hld Add: 53/A,Haridutt Vihar,Rampur Road,Haldwani(Nainital),Uttarakhand:263139</p>
      <p>C-49,Vishwakarma Colony,M.B.Road,New Delhi:110047</p>
      <p>GSTIN: GST#07AODPP1828E1Z4</p>
      <p style="margin-top:10px">Contact: +91 8218359120 &nbsp;·&nbsp; <a href="mailto:howsmailbox@gmail.com">howsmailbox@gmail.com</a></p>
      <p style="margin-top:10px;font-size:10.5px;color:rgba(255,255,255,0.3)">© 2026 HILLSONWHEELS. All mountain produce sourced with love.</p>
    </div>
  </div>
</body>
</html>`;
}

/* ==========================================================================
   OTP EMAIL
   ========================================================================== */
function buildOtpEmail(code) {
  const content = `
    <div class="hero-badge">Account Verification</div>
    <h1>Your Verification Code</h1>
    <p>Use the following code to verify your HILLSONWHEELS account. It expires in <strong>10 minutes</strong>.</p>
    <div style="text-align:center;margin:28px 0">
      <div style="display:inline-block;background:#f8f6f0;border:2px dashed ${BRAND_COLOR};border-radius:8px;padding:16px 40px">
        <div style="font-family:'Courier New',Courier,monospace;font-size:36px;font-weight:900;letter-spacing:10px;color:${DARK}">${code}</div>
      </div>
    </div>
    <p style="font-size:13px;color:#797f74">If you didn't request this code, you can safely ignore this email. Never share this code with anyone.</p>`;
  return emailWrapper(content, `Your verification code is ${code}`);
}

/* ==========================================================================
   CUSTOMER ORDER CONFIRMATION EMAIL
   ========================================================================== */
function buildOrderConfirmationEmail(order, user) {
  const addr = order.shippingAddress;
  const fmt = (n) => `₹ ${Number(n || 0).toLocaleString('en-IN')}`;

  const itemsHtml = (order.items || []).map(item => `
    <tr>
      <td>
        <strong>${item.name}</strong><br>
        <span style="font-size:11.5px;color:#797f74">${item.variant || ''}</span>
      </td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:right">${fmt(item.unitPrice)}</td>
      <td style="text-align:right;font-weight:700">${fmt(item.totalItemPrice)}</td>
    </tr>`).join('');

  const estimatedDate = order.estimatedDelivery
    ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'Within 3–5 business days';

  const paymentMethodLabel = {
    UPI: 'UPI / QR Payment',
    card: 'Credit / Debit Card',
    netbanking: 'Net Banking',
    cod: 'Cash on Delivery'
  }[order.paymentMethod] || order.paymentMethod;

  const content = `
    <div style="text-align:center;margin-bottom:28px">
      <div class="success-icon">✓</div>
      <div class="hero-badge">Order Confirmed</div>
      <h1>Thank you, ${user.name || addr.fullName}!</h1>
      <p>Your mountain harvest order has been confirmed and is being prepared with care. We'll notify you when it ships.</p>
    </div>

    <div class="order-meta">
      <div class="order-meta-row">
        <span class="order-meta-label">Order Number</span>
        <span class="order-meta-value highlight">${order.orderNumber}</span>
      </div>
      <div class="order-meta-row">
        <span class="order-meta-label">Order Date</span>
        <span class="order-meta-value">${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
      <div class="order-meta-row">
        <span class="order-meta-label">Payment Method</span>
        <span class="order-meta-value">${paymentMethodLabel}</span>
      </div>
      <div class="order-meta-row">
        <span class="order-meta-label">Payment Status</span>
        <span class="order-meta-value" style="color:${order.paymentStatus === 'paid' ? '#047857' : '#92400e'}">${order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus === 'cod_pending' ? 'Pay on Delivery' : order.paymentStatus}</span>
      </div>
      <div class="order-meta-row">
        <span class="order-meta-label">Estimated Delivery</span>
        <span class="order-meta-value">${estimatedDate}</span>
      </div>
    </div>

    <div class="tracking-box">
      <div style="font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,0.6);text-transform:uppercase">Your Tracking ID</div>
      <div class="tracking-id">${order.trackingNumber}</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:6px">Use this to track your parcel in real time</div>
    </div>

    <h2>Order Items</h2>
    <table class="items">
      <thead>
        <tr>
          <th>Product</th>
          <th style="text-align:center">Qty</th>
          <th style="text-align:right">Rate</th>
          <th style="text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <div class="price-summary">
      <div class="price-row">
        <span>Items Subtotal</span>
        <span>${fmt(order.subtotal)}</span>
      </div>
      ${order.discount > 0 ? `<div class="price-row discount"><span>Coupon Discount (${order.couponCode})</span><span>− ${fmt(order.discount)}</span></div>` : ''}
      <div class="price-row">
        <span>Shipping</span>
        <span>${order.shippingFee > 0 ? fmt(order.shippingFee) : '<span style="color:#047857;font-weight:700">FREE</span>'}</span>
      </div>
      ${order.giftFee > 0 ? `<div class="price-row"><span>Pine Gift Crate</span><span>${fmt(order.giftFee)}</span></div>` : ''}
      <div class="price-row" style="color:#797f74;font-size:12px">
        <span>GST (Included)</span>
        <span>${fmt(Math.round((order.total || 0) * 0.05))}</span>
      </div>
      <div class="price-row total">
        <span>Total Paid</span>
        <span class="highlight">${fmt(order.total)}</span>
      </div>
    </div>

    <h2>Delivery Address</h2>
    <div class="address-box">
      <strong>${addr.fullName}</strong><br>
      ${addr.house}, ${addr.street}${addr.landmark ? ', Near ' + addr.landmark : ''}<br>
      ${addr.city}, ${addr.state} — <strong>${addr.pincode}</strong><br>
      Phone: ${addr.phone}${addr.altPhone ? ' / ' + addr.altPhone : ''}
    </div>

    ${order.giftOptions && order.giftOptions.isGift ? `
    <div style="background:rgba(197,168,105,0.08);border:1px solid rgba(197,168,105,0.3);padding:14px 18px;border-radius:6px;margin:16px 0">
      <strong>This is a Gift Order</strong><br>
      <span style="font-size:13px;color:#52584d">${order.giftOptions.giftMessage || 'A mountain gift from the hills of Uttarakhand.'}</span>
    </div>` : ''}

    <hr class="divider">

    <div style="text-align:center;margin:24px 0">
      <div style="font-size:13px;color:#797f74;margin-bottom:14px">The full tax invoice is attached to this email as a PDF.</div>
      <div class="trust-strip">
        <span class="trust-item">SSL Secured Checkout</span>
        <span class="trust-item">100% Uttarakhand Origin</span>
        <span class="trust-item">Eco Packaging</span>
        <span class="trust-item">Money Back Guarantee</span>
      </div>
    </div>

    <p style="font-size:13px;color:#797f74;text-align:center">
      Questions? Reply to this email or WhatsApp us.<br>
      Thank you for supporting mountain farmers! 
    </p>`;

  return emailWrapper(content, `Order ${order.orderNumber} confirmed — Thank you for your HILLSONWHEELS order!`);
}

/* ==========================================================================
   OWNER NOTIFICATION EMAIL (detailed)
   ========================================================================== */
function buildOwnerOrderEmail(order, user) {
  const fmt = (n) => `₹ ${Number(n || 0).toLocaleString('en-IN')}`;
  const addr = order.shippingAddress;

  const itemsText = (order.items || [])
    .map(i => `  • ${i.name} (${i.variant}) × ${i.quantity} = ${fmt(i.totalItemPrice)}`)
    .join('\n');

  const content = `
    <div class="hero-badge" style="background:rgba(220,38,38,0.08);border-color:rgba(220,38,38,0.3);color:#991b1b">NEW ORDER RECEIVED</div>
    <h1 style="font-size:24px">New Order: <span class="highlight">${order.orderNumber}</span></h1>

    <div class="order-meta">
      <div class="order-meta-row"><span class="order-meta-label">Order Number</span><span class="order-meta-value">${order.orderNumber}</span></div>
      <div class="order-meta-row"><span class="order-meta-label">Tracking ID</span><span class="order-meta-value">${order.trackingNumber}</span></div>
      <div class="order-meta-row"><span class="order-meta-label">Payment Method</span><span class="order-meta-value">${order.paymentMethod}</span></div>
      <div class="order-meta-row"><span class="order-meta-label">Payment Status</span><span class="order-meta-value">${order.paymentStatus}</span></div>
      <div class="order-meta-row"><span class="order-meta-label">Order Total</span><span class="order-meta-value highlight">${fmt(order.total)}</span></div>
      <div class="order-meta-row"><span class="order-meta-label">Placed At</span><span class="order-meta-value">${new Date(order.createdAt || Date.now()).toLocaleString('en-IN')}</span></div>
    </div>

    <h2>Customer Details</h2>
    <div class="address-box">
      <strong>${user.name || addr.fullName}</strong><br>
      Email: ${user.email || order.customerEmail || 'N/A'}<br>
      Phone: ${user.phone || order.customerPhone || addr.phone}<br>
      ${user._id ? `User ID: ${user._id}` : 'Guest Order'}
    </div>

    <h2>Delivery Address</h2>
    <div class="address-box">
      ${addr.fullName}<br>
      ${addr.house}, ${addr.street}${addr.landmark ? ', Near ' + addr.landmark : ''}<br>
      ${addr.city}, ${addr.state} — ${addr.pincode}<br>
      Phone: ${addr.phone}
    </div>

    <h2>Order Items</h2>
    <table class="items">
      <thead>
        <tr>
          <th>SKU</th>
          <th>Product</th>
          <th>Variant</th>
          <th style="text-align:center">Qty</th>
          <th style="text-align:right">Unit Price</th>
          <th style="text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${(order.items || []).map(i => `
          <tr>
            <td style="font-size:11px;font-family:monospace;color:#797f74">${i.sku}</td>
            <td><strong>${i.name}</strong></td>
            <td>${i.variant}</td>
            <td style="text-align:center">${i.quantity}</td>
            <td style="text-align:right">${fmt(i.unitPrice)}</td>
            <td style="text-align:right;font-weight:700">${fmt(i.totalItemPrice)}</td>
          </tr>`).join('')}
      </tbody>
    </table>

    <div class="price-summary">
      <div class="price-row"><span>Subtotal</span><span>${fmt(order.subtotal)}</span></div>
      ${order.discount > 0 ? `<div class="price-row discount"><span>Discount (${order.couponCode})</span><span>− ${fmt(order.discount)}</span></div>` : ''}
      <div class="price-row"><span>Shipping</span><span>${fmt(order.shippingFee)}</span></div>
      ${order.giftFee > 0 ? `<div class="price-row"><span>Gift Crate</span><span>${fmt(order.giftFee)}</span></div>` : ''}
      <div class="price-row total"><span>TOTAL COLLECTED</span><span>${fmt(order.total)}</span></div>
    </div>

    <h2>Shipping Method</h2>
    <div class="address-box">${order.shippingMethod ? order.shippingMethod.name : 'Standard'}</div>

    ${order.giftOptions && order.giftOptions.isGift ? `<h2>Gift Order</h2><div class="address-box">${order.giftOptions.giftMessage || '(No message)'}</div>` : ''}

    ${order.paymentDetails && order.paymentDetails.transactionId ? `
    <h2>Payment Details</h2>
    <div class="address-box">
      Transaction ID: ${order.paymentDetails.transactionId}<br>
      ${order.paymentDetails.upiId ? 'UPI ID: ' + order.paymentDetails.upiId + '<br>' : ''}
      ${order.paymentDetails.cardLast4 ? 'Card: ****' + order.paymentDetails.cardLast4 + '<br>' : ''}
      ${order.paymentDetails.bankName ? 'Bank: ' + order.paymentDetails.bankName + '<br>' : ''}
      ${order.paymentDetails.paidAt ? 'Paid At: ' + new Date(order.paymentDetails.paidAt).toLocaleString('en-IN') : ''}
    </div>` : ''}`;

  return emailWrapper(content, `New order ${order.orderNumber} — ₹${order.total}`);
}

/* ==========================================================================
   INVOICE HTML (Full GST Breakdown, HSN Itemization & Print/Download)
   ========================================================================== */
const HSN_MAP = {
  'Honey': '0409 0000',
  'Pulses': '0713 3300',
  'Spices': '0910 9100',
  'Dry Fruits': '0802 3100',
  'Pickles': '2001 9000',
  'Herbs': '1211 9099',
  'Handicrafts': '6304 9200'
};

function numberToWords(num) {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  num = Math.floor(Number(num) || 0);
  if (num === 0) return 'Zero';

  function inWords(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + inWords(n % 100);
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + inWords(n % 10000000);
  }
  return inWords(num).trim() + ' Rupees Only';
}

function buildInvoiceHtml(order) {
  const fmt = (n) => `₹ ${Number(n || 0).toLocaleString('en-IN')}`;
  const addr = order.shippingAddress || {};
  const invoiceDate = new Date(order.createdAt || Date.now());
  
  // State code for Uttarakhand is 05
  const isUttarakhand = (addr.state || '').toLowerCase().includes('uttarakhand') || (addr.state || '').toLowerCase().includes('uk');
  
  // Itemized GST breakdown
  let totalTaxable = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  const itemRows = (order.items || []).map((item, i) => {
    const ratePercent = item.category === 'Handicrafts' ? 12 : 5;
    const hsn = HSN_MAP[item.category] || '0409 0000';
    const grossPrice = Number(item.totalItemPrice || 0);
    const taxableValue = Math.round((grossPrice / (1 + ratePercent / 100)) * 100) / 100;
    const taxValue = Math.round((grossPrice - taxableValue) * 100) / 100;

    totalTaxable += taxableValue;
    if (isUttarakhand) {
      totalCgst += taxValue / 2;
      totalSgst += taxValue / 2;
    } else {
      totalIgst += taxValue;
    }

    return `
      <tr>
        <td style="text-align:center">${i + 1}</td>
        <td>
          <strong>${item.name}</strong><br>
          <span style="font-size:11px;color:#797f74">${item.variant || ''} · SKU: ${item.sku}</span>
        </td>
        <td style="font-family:monospace;text-align:center;font-size:11px">${hsn}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">${fmt(item.unitPrice)}</td>
        <td style="text-align:right">${fmt(taxableValue)}</td>
        <td style="text-align:center;font-size:11px">${ratePercent}%</td>
        <td style="text-align:right;font-weight:700">${fmt(grossPrice)}</td>
      </tr>
    `;
  }).join('');

  const shippingTaxable = order.shippingFee > 0 ? Math.round((order.shippingFee / 1.18) * 100) / 100 : 0;
  const giftTaxable = order.giftFee > 0 ? Math.round((order.giftFee / 1.12) * 100) / 100 : 0;
  const grandTotalWords = numberToWords(order.total);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Invoice - ${order.orderNumber} - HILLSONWHEELS</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: A4 portrait; margin: 12mm 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1b18; background: #f5f5f5; font-size: 12px; line-height: 1.45; }
    .print-actions { max-width: 800px; margin: 20px auto 10px; display: flex; justify-content: flex-end; gap: 10px; }
    .print-btn { background: #C5A869; color: #1a1b18; border: none; padding: 8px 18px; font-weight: 700; font-size: 13px; border-radius: 4px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
    .print-btn:hover { background: #b59858; }
    .invoice-sheet { max-width: 800px; margin: 0 auto 30px; background: #fff; padding: 36px 40px; border: 1px solid #e2ded5; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .inv-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2.5px solid #C5A869; padding-bottom: 20px; margin-bottom: 20px; }
    .inv-brand { font-size: 24px; font-weight: 900; letter-spacing: 2px; color: #C5A869; }
    .inv-brand-sub { font-size: 10.5px; color: #797f74; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
    .inv-gst-tag { font-size: 11px; color: #42463e; margin-top: 4px; }
    .inv-meta-right { text-align: right; }
    .inv-title { font-size: 20px; font-weight: 900; color: #1a1b18; letter-spacing: 1px; margin-bottom: 4px; }
    .inv-meta-line { font-size: 11.5px; color: #52584d; margin-bottom: 3px; }
    .inv-meta-line strong { color: #1a1b18; }
    .parties-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; background: #fbf9f4; border: 1px solid #ede8de; border-radius: 6px; padding: 16px 20px; margin-bottom: 22px; }
    .party-col h4 { font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: #C5A869; margin-bottom: 6px; }
    .party-col p { font-size: 11.5px; line-height: 1.6; color: #40443c; }
    table.inv-table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
    table.inv-table th { background: #1a1b18; color: #fff; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; padding: 8px 10px; border: 1px solid #1a1b18; }
    table.inv-table td { padding: 9px 10px; border: 1px solid #e6e2d8; font-size: 11.5px; vertical-align: middle; }
    table.inv-table tbody tr:nth-child(even) { background: #faf9f6; }
    .summary-split { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 24px; margin-top: 14px; align-items: flex-start; }
    .tax-breakdown-box { border: 1px solid #e6e2d8; border-radius: 4px; overflow: hidden; }
    .tax-breakdown-box table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
    .tax-breakdown-box th { background: #f1ede3; color: #52584d; padding: 6px 8px; text-align: left; font-weight: 700; border-bottom: 1px solid #e6e2d8; }
    .tax-breakdown-box td { padding: 6px 8px; border-bottom: 1px solid #f0ede6; }
    .totals-box { border: 1px solid #e6e2d8; border-radius: 4px; padding: 12px 16px; background: #fbf9f4; }
    .tot-row { display: flex; justify-content: space-between; font-size: 11.5px; padding: 4px 0; color: #52584d; }
    .tot-row.grand { font-size: 15px; font-weight: 800; color: #1a1b18; border-top: 2px solid #C5A869; margin-top: 6px; padding-top: 8px; }
    .words-box { background: #fff; border: 1px dashed #d1cbbe; padding: 10px 14px; border-radius: 4px; margin: 18px 0; font-size: 11px; }
    .inv-footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e6e2d8; display: flex; justify-content: space-between; align-items: flex-end; }
    .sign-box { text-align: right; }
    .stamp-badge { display: inline-block; border: 2px solid #047857; color: #047857; font-weight: 800; font-size: 11px; letter-spacing: 1.5px; padding: 4px 12px; border-radius: 3px; transform: rotate(-3deg); margin-bottom: 6px; }
    @media print {
      body { background: #fff; font-size: 11px; }
      .print-actions { display: none; }
      .invoice-sheet { border: none; box-shadow: none; padding: 0; margin: 0; max-width: 100%; }
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  </style>
</head>
<body>
  <div class="print-actions">
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="invoice-sheet">
    <div class="inv-header">
      <div>
        <div class="inv-brand">HILLSONWHEELS</div>
        <div class="inv-brand-sub">The World of Uttarakhand</div>
        <div style="font-size:11px;color:#797f74;margin-top:4px">Hld Add: 53/A,Haridutt Vihar,Rampur Road,Haldwani(Nainital),Uttarakhand:263139</div>
        <div style="font-size:11px;color:#797f74;margin-top:1px">C-49,Vishwakarma Colony,M.B.Road,New Delhi:110047</div>
      </div>
      <div class="inv-meta-right">
        <div class="inv-title">TAX INVOICE</div>
        <div class="inv-meta-line">Invoice No: <strong>${order.orderNumber}</strong></div>
        <div class="inv-meta-line">Invoice Date: <strong>${invoiceDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</strong></div>
        <div class="inv-meta-line">Tracking No: <strong>${order.trackingNumber}</strong></div>
        <div class="inv-meta-line">Place of Supply: <strong>${addr.state || 'Uttarakhand'}</strong></div>
      </div>
    </div>

    <div class="parties-grid">
      <div class="party-col">
        <h4>Billed & Dispatched By</h4>
        <p><strong>RAISE SYSTEM</strong></p>
        <p>C-49,Vishwakarma Colony,M.B.Road,New Delhi:110047</p>
        <p><strong>GSTIN:</strong> GST#07AODPP1828E1Z4</p>
        <p><strong>Email:</strong> howsmailbox@gmail.com</p>
        <p><strong>Contact:</strong> +91 8218359120</p>
      </div>
      <div class="party-col">
        <h4>Billed & Delivered To</h4>
        <p><strong>${addr.fullName || 'Mountain Patron'}</strong></p>
        <p>${addr.house || ''}, ${addr.street || ''}${addr.landmark ? ', Near ' + addr.landmark : ''}</p>
        <p>${addr.city || ''}, ${addr.state || ''} — <strong>${addr.pincode || ''}</strong></p>
        <p>Phone: ${addr.phone || ''}${addr.altPhone ? ' / ' + addr.altPhone : ''}</p>
        <p>Address Type: ${addr.type || 'Home'}</p>
      </div>
    </div>

    <table class="inv-table">
      <thead>
        <tr>
          <th style="width:28px">#</th>
          <th>Item Description</th>
          <th style="width:75px;text-align:center">HSN/SAC</th>
          <th style="width:40px;text-align:center">Qty</th>
          <th style="width:75px;text-align:right">Rate (₹)</th>
          <th style="width:85px;text-align:right">Taxable (₹)</th>
          <th style="width:45px;text-align:center">GST</th>
          <th style="width:90px;text-align:right">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <div class="summary-split">
      <div class="tax-breakdown-box">
        <table>
          <thead>
            <tr>
              <th>Tax Category</th>
              <th style="text-align:right">Taxable Val</th>
              <th style="text-align:center">Rate</th>
              <th style="text-align:right">Tax Amount</th>
            </tr>
          </thead>
          <tbody>
            ${isUttarakhand ? `
            <tr>
              <td>Central GST (CGST)</td>
              <td style="text-align:right">${fmt(totalTaxable)}</td>
              <td style="text-align:center">2.5%</td>
              <td style="text-align:right">${fmt(totalCgst)}</td>
            </tr>
            <tr>
              <td>State GST (SGST)</td>
              <td style="text-align:right">${fmt(totalTaxable)}</td>
              <td style="text-align:center">2.5%</td>
              <td style="text-align:right">${fmt(totalSgst)}</td>
            </tr>
            ` : `
            <tr>
              <td>Integrated GST (IGST)</td>
              <td style="text-align:right">${fmt(totalTaxable)}</td>
              <td style="text-align:center">5%</td>
              <td style="text-align:right">${fmt(totalIgst)}</td>
            </tr>
            `}
            <tr style="background:#faf9f6;font-weight:700">
              <td>Total Tax</td>
              <td style="text-align:right">${fmt(totalTaxable)}</td>
              <td style="text-align:center">-</td>
              <td style="text-align:right">${fmt(totalCgst + totalSgst + totalIgst)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="totals-box">
        <div class="tot-row"><span>Items Taxable Subtotal</span><span>${fmt(totalTaxable)}</span></div>
        <div class="tot-row"><span>Applicable GST</span><span>${fmt(totalCgst + totalSgst + totalIgst)}</span></div>
        ${order.discount > 0 ? `<div class="tot-row" style="color:#047857"><span>Coupon Discount (${order.couponCode})</span><span>− ${fmt(order.discount)}</span></div>` : ''}
        <div class="tot-row"><span>Mountain Logistics</span><span>${order.shippingFee > 0 ? fmt(order.shippingFee) : 'FREE'}</span></div>
        ${order.giftFee > 0 ? `<div class="tot-row"><span>Pine Wood Gift Crate</span><span>${fmt(order.giftFee)}</span></div>` : ''}
        <div class="tot-row grand"><span>Total Payable / Paid</span><span style="color:#C5A869">${fmt(order.total)}</span></div>
      </div>
    </div>

    <div class="words-box">
      <strong>Amount in Words:</strong> ${grandTotalWords}
    </div>

    <div style="font-size:11.5px;color:#52584d;margin-top:12px;background:#fbf9f4;padding:10px 14px;border-radius:4px">
      <strong>Payment Mode:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery (Pending upon delivery)' : `${(order.paymentMethod || 'ONLINE').toUpperCase()} — Verified & Paid`}
      ${order.paymentDetails && order.paymentDetails.transactionId ? ` &nbsp;|&nbsp; <strong>Txn ID:</strong> ${order.paymentDetails.transactionId}` : ''}
      ${order.paymentDetails && order.paymentDetails.paidAt ? ` &nbsp;|&nbsp; <strong>Paid At:</strong> ${new Date(order.paymentDetails.paidAt).toLocaleString('en-IN')}` : ''}
    </div>

    <div class="inv-footer">
      <div style="font-size:10.5px;color:#797f74;max-width:440px;line-height:1.6">
        <p><strong>Declaration:</strong> We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</p>
        <p style="margin-top:4px">This is an authenticated computer-generated invoice under the GST Rules 2017.</p>
      </div>
      <div class="sign-box">
        <div class="stamp-badge">${order.paymentStatus === 'paid' ? 'PAID' : 'COD PENDING'}</div>
        <p style="font-size:11px;font-weight:700;color:#1a1b18">For RAISE SYSTEM</p>
        <p style="font-size:10px;color:#797f74;margin-top:2px">Authorized Signatory</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/* ==========================================================================
   TOURISM BOOKING CONFIRMATION EMAIL
   ========================================================================== */
function buildTourismConfirmationEmail(trip, user) {
  const content = `
    <div class="hero-badge">Journey Request Received</div>
    <h1>Your Uttarakhand Journey is Being Planned!</h1>
    <p>Dear <strong>${user.name || 'Mountain Explorer'}</strong>, we've received your travel request. Our expert Uttarakhand guides will reach out within <strong>24–48 hours</strong> with a personalized itinerary.</p>

    <div class="order-meta">
      <div class="order-meta-row"><span class="order-meta-label">Request ID</span><span class="order-meta-value highlight">${trip._id}</span></div>
      <div class="order-meta-row"><span class="order-meta-label">Destination</span><span class="order-meta-value">${trip.destination}</span></div>
      <div class="order-meta-row"><span class="order-meta-label">Journey Style</span><span class="order-meta-value">${trip.journeyStyle}</span></div>
      <div class="order-meta-row"><span class="order-meta-label">Travelers</span><span class="order-meta-value">${trip.travelers}</span></div>
      <div class="order-meta-row"><span class="order-meta-label">Stay Preference</span><span class="order-meta-value">${trip.stayPreference}</span></div>
      ${trip.startDate ? `<div class="order-meta-row"><span class="order-meta-label">Start Date</span><span class="order-meta-value">${new Date(trip.startDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>` : ''}
    </div>

    ${trip.notes ? `<h2>Special Notes</h2><div class="address-box">${trip.notes}</div>` : ''}

    <div style="background:rgba(197,168,105,0.08);border-left:3px solid ${BRAND_COLOR};padding:16px 20px;border-radius:0 6px 6px 0;margin:20px 0">
      <strong>What happens next?</strong>
      <ul style="margin:10px 0 0;padding-left:18px;font-size:13.5px;line-height:1.9;color:#52584d">
        <li>Our team reviews your preferences</li>
        <li>A personalized Uttarakhand itinerary is crafted</li>
        <li>We call/email you within 24–48 hours</li>
        <li>No advance payment until you confirm</li>
      </ul>
    </div>

    <div class="trust-strip">
      <span class="trust-item">Expert Local Guides</span>
      <span class="trust-item">Handpicked Stays</span>
      <span class="trust-item">Eco-Responsible Travel</span>
      <span class="trust-item">No Hidden Charges</span>
    </div>`;

  return emailWrapper(content, 'Your Uttarakhand journey request is confirmed!');
}

/* ==========================================================================
   OWNER TOURISM NOTIFICATION
   ========================================================================== */
function buildOwnerTourismEmail(trip, user) {
  const content = `
    <div class="hero-badge" style="background:rgba(5,150,105,0.08);border-color:rgba(5,150,105,0.3);color:#047857">NEW TRIP REQUEST</div>
    <h1 style="font-size:22px">New Tourism Request — <span class="highlight">${trip.destination}</span></h1>

    <div class="order-meta">
      <div class="order-meta-row"><span class="order-meta-label">Request ID</span><span class="order-meta-value">${trip._id}</span></div>
      <div class="order-meta-row"><span class="order-meta-label">Submitted At</span><span class="order-meta-value">${new Date(trip.createdAt || Date.now()).toLocaleString('en-IN')}</span></div>
    </div>

    <h2>Customer Details</h2>
    <div class="address-box">
      <strong>${user.name || 'Not provided'}</strong><br>
      Email: ${user.email || 'N/A'}<br>
      Phone: ${user.phone || 'N/A'}<br>
      ${user._id ? 'Registered User: ' + user._id : 'Guest Request'}
    </div>

    <h2>Trip Details</h2>
    <div class="address-box">
      Destination: <strong>${trip.destination}</strong><br>
      Journey Style: <strong>${trip.journeyStyle}</strong><br>
      Travelers: <strong>${trip.travelers}</strong><br>
      Stay Preference: <strong>${trip.stayPreference}</strong><br>
      ${trip.startDate ? 'Start Date: <strong>' + new Date(trip.startDate).toLocaleDateString('en-IN') + '</strong><br>' : ''}
      ${trip.notes ? 'Notes: ' + trip.notes : ''}
    </div>`;

  return emailWrapper(content, `New trip request: ${trip.destination}`);
}

/* ==========================================================================
   PAYMENT CONFIRMATION EMAIL (after Razorpay verification)
   ========================================================================== */
function buildPaymentConfirmationEmail(order) {
  const fmt = (n) => `₹ ${Number(n || 0).toLocaleString('en-IN')}`;
  const content = `
    <div style="text-align:center">
      <div class="success-icon"></div>
      <div class="hero-badge">Payment Successful</div>
      <h1>Payment Confirmed!</h1>
      <p>Your payment of <strong class="highlight">${fmt(order.total)}</strong> for order <strong>${order.orderNumber}</strong> has been successfully processed via Razorpay.</p>
    </div>

    <div class="order-meta">
      <div class="order-meta-row"><span class="order-meta-label">Order Number</span><span class="order-meta-value highlight">${order.orderNumber}</span></div>
      <div class="order-meta-row"><span class="order-meta-label">Transaction ID</span><span class="order-meta-value">${order.paymentDetails && order.paymentDetails.transactionId ? order.paymentDetails.transactionId : 'N/A'}</span></div>
      <div class="order-meta-row"><span class="order-meta-label">Razorpay Payment ID</span><span class="order-meta-value">${order.paymentDetails && order.paymentDetails.razorpayPaymentId ? order.paymentDetails.razorpayPaymentId : 'N/A'}</span></div>
      <div class="order-meta-row"><span class="order-meta-label">Amount Paid</span><span class="order-meta-value highlight">${fmt(order.total)}</span></div>
      <div class="order-meta-row"><span class="order-meta-label">Status</span><span class="order-meta-value" style="color:#047857">Confirmed & Paid</span></div>
    </div>

    <p style="text-align:center;color:#797f74;font-size:13px">Your order is now being prepared for dispatch. The full invoice is attached to this email.</p>`;

  return emailWrapper(content, `Payment ₹${order.total} confirmed for ${order.orderNumber}`);
}

/* ==========================================================================
   MAIN NOTIFICATION DISPATCH
   ========================================================================== */
async function sendBusinessNotification({ type, record, user }) {
  const isOrder = type === 'order';
  const isTrip = type === 'trip';

  const ownerEmail = isOrder
    ? process.env.ORDER_NOTIFICATION_EMAIL
    : process.env.TOURISM_NOTIFICATION_EMAIL;

  if (!hasSmtpConfig()) return false;

  let allSent = false;

  // ── Owner Notification ──────────────────────────────────────────────────
  if (ownerEmail) {
    try {
      const ownerHtml = isOrder
        ? buildOwnerOrderEmail(record, user)
        : buildOwnerTourismEmail(record, user);

      const ownerSubject = isOrder
        ? `New Order: ${record.orderNumber} — ₹${record.total}`
        : `New Trip Request: ${record.destination}`;

      const attachments = [];
      if (isOrder) {
        attachments.push({
          filename: `Invoice-${record.orderNumber}.html`,
          content: buildInvoiceHtml(record),
          contentType: 'text/html'
        });
      }

      await sendEmail({ to: ownerEmail, subject: ownerSubject, html: ownerHtml, attachments });
      allSent = true;
    } catch (err) {
      console.error('Owner notification failed:', err.message);
    }
  }

  // ── Customer Confirmation ───────────────────────────────────────────────
  const customerEmail = user.email || (isOrder && record.customerEmail) || null;
  if (customerEmail) {
    try {
      if (isOrder) {
        const invoiceAttachment = {
          filename: `HILLSONWHEELS-Invoice-${record.orderNumber}.html`,
          content: buildInvoiceHtml(record),
          contentType: 'text/html'
        };
        await sendEmail({
          to: customerEmail,
          subject: `Order Confirmed: ${record.orderNumber} — HILLSONWHEELS`,
          html: buildOrderConfirmationEmail(record, user),
          attachments: [invoiceAttachment]
        });
      } else if (isTrip) {
        await sendEmail({
          to: customerEmail,
          subject: `Your Uttarakhand Journey Request — HILLSONWHEELS`,
          html: buildTourismConfirmationEmail(record, user)
        });
      }
      allSent = true;
    } catch (err) {
      console.error('Customer confirmation email failed:', err.message);
    }
  }

  return allSent;
}

module.exports = {
  sendVerification,
  sendBusinessNotification,
  buildInvoiceHtml,
  buildOrderConfirmationEmail,
  buildPaymentConfirmationEmail,
  sendEmail
};