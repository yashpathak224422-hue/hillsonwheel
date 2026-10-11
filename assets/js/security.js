/**
 * HILLSONWHEELS - ENTERPRISE SECURITY MODULE
 * Provides XSS sanitization, input validation, safe storage, and prototype protection.
 * Enhanced with DOMPurify for advanced HTML sanitization.
 */
(function(window) {
  'use strict';

  // DOMPurify will be loaded from CDN or bundled
  let DOMPurify = window.DOMPurify;

  const Security = {
    /**
     * Sanitizes HTML using DOMPurify to prevent XSS attacks
     * @param {string} dirty - Dirty HTML string
     * @param {object} config - DOMPurify configuration
     * @returns {string} Clean, safe HTML
     */
    sanitizeHTML: function(dirty, config = {}) {
      if (typeof dirty !== 'string') return dirty == null ? '' : String(dirty);
      
      if (DOMPurify) {
        const defaultConfig = {
          ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a', 'span'],
          ALLOWED_ATTR: ['href', 'target', 'rel'],
          ALLOW_DATA_ATTR: false,
          FORCE_BODY: false,
          SANITIZE_DOM: true,
          KEEP_CONTENT: true
        };
        return DOMPurify.sanitize(dirty, { ...defaultConfig, ...config });
      }
      
      // Fallback to basic escaping if DOMPurify not available
      return this.escapeHTML(dirty);
    },

    /**
     * Escapes HTML to prevent Cross-Site Scripting (XSS)
     * @param {string} str - Raw string
     * @returns {string} Sanitized string
     */
    escapeHTML: function(str) {
      if (typeof str !== 'string') return str == null ? '' : String(str);
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    },

    /**
     * Sanitizes attribute values
     * @param {string} str - Attribute value
     * @returns {string} Sanitized attribute
     */
    sanitizeAttr: function(str) {
      if (typeof str !== 'string') return str == null ? '' : String(str);
      return str.replace(/[^a-zA-Z0-9_-]/g, '');
    },

    /**
     * Validates safe URLs (only http, https, or relative paths)
     * @param {string} url - Target URL
     * @returns {string} Safe URL or fallback
     */
    sanitizeUrl: function(url, fallback = '#') {
      if (!url || typeof url !== 'string') return fallback;
      const clean = url.trim();
      if (/^(https?:\/\/|\.\/|\/)/i.test(clean) && !/^javascript:/i.test(clean)) {
        return clean;
      }
      return fallback;
    },

    /**
     * Email format validator with stricter validation
     */
    validateEmail: function(email) {
      if (!email || typeof email !== 'string') return false;
      const trimmed = email.trim();
      if (trimmed.length > 254) return false; // RFC 5321 limit
      const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      return re.test(trimmed);
    },

    /**
     * Phone number validator (Indian/International format)
     */
    validatePhone: function(phone) {
      if (!phone || typeof phone !== 'string') return false;
      const clean = phone.replace(/[\s-()]/g, '');
      return /^(\+?\d{1,4})?\d{10}$/.test(clean);
    },

    /**
     * Password strength validator
     * @param {string} password - Password to validate
     * @returns {object} Validation result with score and feedback
     */
    validatePassword: function(password) {
      if (!password || typeof password !== 'string') {
        return { valid: false, score: 0, feedback: 'Password is required' };
      }
      
      let score = 0;
      const feedback = [];
      
      if (password.length < 10) {
        feedback.push('Use at least 10 characters');
      } else {
        score += 1;
      }
      
      if (password.length > 128) {
        return { valid: false, score: 0, feedback: 'Password must be less than 128 characters' };
      }
      
      if (/[a-z]/.test(password)) score += 1;
      else feedback.push('Include lowercase letters');
      
      if (/[A-Z]/.test(password)) score += 1;
      else feedback.push('Include uppercase letters');
      
      if (/[0-9]/.test(password)) score += 1;
      else feedback.push('Include numbers');
      
      if (/[^a-zA-Z0-9]/.test(password)) score += 1;
      else feedback.push('Include special characters');
      
      return {
        valid: score >= 4 && password.length >= 10,
        score: Math.min(score, 5),
        feedback: feedback.length > 0 ? feedback : ['Strong password']
      };
    },

    /**
     * Input sanitizer for user-generated content
     * @param {string} input - Raw input
     * @param {string} type - Type of input (text, email, phone, html)
     * @returns {string} Sanitized input
     */
    sanitizeInput: function(input, type = 'text') {
      if (input == null) return '';
      const str = String(input).trim();
      
      switch(type) {
        case 'email':
          return this.validateEmail(str) ? str.toLowerCase() : '';
        case 'phone':
          return this.validatePhone(str) ? str.replace(/[\s-()]/g, '') : '';
        case 'html':
          return this.sanitizeHTML(str);
        case 'url':
          return this.sanitizeUrl(str);
        case 'number':
          return str.replace(/[^0-9.-]/g, '');
        case 'alpha':
          return str.replace(/[^a-zA-Z]/g, '');
        case 'alphanumeric':
          return str.replace(/[^a-zA-Z0-9]/g, '');
        default:
          return this.escapeHTML(str);
      }
    },

    /**
     * Safe LocalStorage wrapper with error handling and sanitization
     */
    storage: {
      get: function(key, fallback = null) {
        try {
          const raw = localStorage.getItem('hsw_' + key);
          if (!raw) return fallback;
          const parsed = JSON.parse(raw);
          // Prototype pollution defense
          if (parsed && typeof parsed === 'object') {
            delete parsed.__proto__;
            delete parsed.constructor;
            Object.freeze(parsed);
          }
          return parsed;
        } catch (e) {
          console.warn('Storage read error:', e);
          return fallback;
        }
      },
      set: function(key, val) {
        try {
          // Sanitize before storing
          const sanitized = JSON.parse(JSON.stringify(val));
          localStorage.setItem('hsw_' + key, JSON.stringify(sanitized));
          return true;
        } catch (e) {
          console.warn('Storage write error:', e);
          return false;
        }
      },
      remove: function(key) {
        try {
          localStorage.removeItem('hsw_' + key);
        } catch (e) {}
      },
      clear: function() {
        try {
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            if (key.startsWith('hsw_')) {
              localStorage.removeItem(key);
            }
          });
        } catch (e) {}
      }
    },

    /**
     * CSRF token management
     */
    csrf: {
      generate: function() {
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
      },
      get: function() {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || null;
      },
      set: function(token) {
        let meta = document.querySelector('meta[name="csrf-token"]');
        if (!meta) {
          meta = document.createElement('meta');
          meta.name = 'csrf-token';
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', token);
      }
    },

    /**
     * Content Security Policy violation handler
     */
    handleCSPViolation: function() {
      if (window.addEventListener) {
        window.addEventListener('securitypolicyviolation', (event) => {
          console.warn('CSP Violation:', {
            violatedDirective: event.violatedDirective,
            blockedURI: event.blockedURI,
            documentURI: event.documentURI,
            referrer: event.referrer
          });
        });
      }
    },

    /**
     * Debounce helper to prevent rapid invocation / resource exhaustion
     */
    debounce: function(func, wait) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    },

    /**
     * Throttle helper to limit function execution rate
     */
    throttle: function(func, limit) {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },

    /**
     * Initialize security measures
     */
    init: function() {
      this.handleCSPViolation();
      // Generate CSRF token on page load
      const token = this.csrf.generate();
      this.csrf.set(token);
      console.log('HILLSONWHEELS Security Module initialized');
    }
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Security.init());
  } else {
    Security.init();
  }

  window.Security = Object.freeze(Security);
})(window);
