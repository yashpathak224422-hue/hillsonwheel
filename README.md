# HILLSONWHEELS — Architecture & Security Blueprint

Welcome to the **HILLSONWHEELS** web platform — a digital cultural bridge celebrating the living mountain traditions, organic produce, sacred journeys, and indigenous crafts of Uttarakhand.

---

## Systematic Folder Structure

The project follows a clean, modular, and enterprise-grade directory structure:

```
hillsonwheels/
├── Hillsonwheels — The World of Uttarakhand.html # Master entrypoint served at /
├── index.html                           # Legacy page, not served at /
├── assets/
│   ├── css/
│   │   ├── variables.css               # Design tokens (colors, typography, shadows, easing)
│   │   ├── base.css                    # Resets, typography hierarchies, smooth scrollbars
│   │   ├── components.css              # Buttons, chips, cards, inputs, audio visualizer
│   │   ├── layout.css                  # Glassmorphism navbar, hero, 6-world bento, drawer, modal
│   │   └── animations.css              # Magnetic cursor, golden dust canvas, 3D card tilt, curtains
│   ├── js/
│   │   ├── security.js                 # XSS sanitization, safe storage, input validators, anti-pollution
│   │   ├── config.js                   # High-res photography catalog, branding, constants
│   │   ├── motion.js                   # 60fps magnetic cursor physics, golden dust canvas, parallax tilt
│   │   ├── auth.js                     # Email/phone account, OTP, and password recovery UI
│   │   └── app.js                      # Core router, interactive modules, synthesis & cart store
│   └── images/
│       ├── maps/
│       │   └── uttarakhand-3d-map.png  # High-definition 3D interactive terrain map
│       └── local/                      # Curated brand banners and imagery
├── server/
│   ├── index.js                         # Express API, MongoDB models, auth and order/trip routes
│   └── notifications.js                # SMTP and Twilio delivery adapters
├── .env.example                         # Local configuration template
├── package.json                         # Server dependencies and run scripts
└── README.md                            # Technical specification and setup guide
```

## Backend Setup

The API requires Node.js 18 or newer and a MongoDB instance. From the project folder:

1. Install dependencies with `npm install`. In a new PowerShell terminal on this workspace, first add the local Node runtime to `PATH` with `$env:PATH="$PWD\.nodeenv\Scripts;$env:PATH"`.
2. Copy `.env.example` to `.env`, set `MONGODB_URI`, and replace `JWT_SECRET` with a random secret of at least 32 characters.
3. Start MongoDB, then run `npm start` and open `http://localhost:3000`. In each new PowerShell terminal, repeat the local Node `PATH` command from step 1 first.

Email OTP and order/tourism notifications use SMTP. Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `EMAIL_FROM`; set `ORDER_NOTIFICATION_EMAIL` and `TOURISM_NOTIFICATION_EMAIL` for the two business inboxes. Phone OTP uses Meta's WhatsApp Cloud API: set `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID`, then create and get approval for the authentication copy-code template named by `WHATSAPP_OTP_TEMPLATE` in `WHATSAPP_OTP_LANGUAGE`. The template must use the standard authentication code body and copy-code button. Meta charges per delivered authentication template message, so WhatsApp is not guaranteed to be free. Tell users the code will arrive on WhatsApp and collect their opt-in. Credentials belong only in `.env`, never browser code. The API reports delivery as unavailable until the relevant provider is configured.

Accounts support email or phone sign-up, password login, OTP login, and OTP-based password reset. OTPs are hashed in MongoDB, expire after ten minutes, and are consumed once. Orders and trip requests require a signed-in account and are stored in MongoDB. Order totals are recalculated from the server catalog. With SMTP configured, the business inbox receives each order/trip request and customers with an email address receive an acknowledgement. Email delivery is reported separately from record creation so a missing mail provider does not discard the submitted record.

The main API routes are `/api/auth/otp/request`, `/api/auth/register`, `/api/auth/login`, `/api/auth/otp/verify`, `/api/auth/password/reset`, `/api/orders`, and `/api/trips`. `GET /api/health` reports server and MongoDB connection status.

---

## Security Hardening & Implementation

The application incorporates multi-layer security defenses across client and network boundaries:

### 1. Strict Content Security Policy (CSP)
- **Zero Inline Exploits**: Prevents unauthorized inline script injection and restricts executable contexts.
- **Strict Origin Whitelisting**: Only trusted font endpoints (`fonts.googleapis.com`, `fonts.gstatic.com`) and secure CDN imagery (`images.unsplash.com`) are permitted.
- **Anti-Sniffing & Framing Defense**: Configured with `X-Content-Type-Options: nosniff` and `X-Frame-Options: SAMEORIGIN` / `frame-ancestors 'self'` to prevent Clickjacking and MIME-type confusion attacks.

### 2. Cross-Site Scripting (XSS) Prevention
- **HTML & Attribute Escaping**: Integrated `Security.escapeHTML()` and `Security.sanitizeAttr()` across dynamic template literals and search renderers.
- **Protocol Guard**: `Security.sanitizeUrl()` ensures that external links and dynamic media sources are strictly restricted to `http`, `https`, or relative paths, blocking `javascript:` URIs.

### 3. Client-Side State & Storage Integrity
- **Prototype Pollution Defense**: `Security.storage` removes dangerous prototype attributes (`__proto__`, `constructor`) upon deserializing JSON from `localStorage` or `sessionStorage`.
- **Input Validation**: Dedicated regex validators for emails, phone numbers, and address inputs before processing checkout payloads.

### 4. Rate Limiting & Resource Protection
- **Interaction Debounce**: Integrated debounce wrappers on search input and continuous events to mitigate denial-of-service or CPU spikes.

---

## Visual Aesthetics & Motion System

- **Magnetic Fluid Cursor**: Double-ring gold-glowing cursor with elastic physics and magnetic attraction on cards and CTA buttons.

- **3D Interactive Card Tilt**: Perspective tilt with dynamic shimmer reflection on mouse movement.
- **Mountain Sound Synthesizer**: Built with Web Audio API for ambient mountain wind, temple bells, and glacier river streams.
