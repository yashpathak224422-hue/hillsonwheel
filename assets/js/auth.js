(function (window) {
  'use strict';

  const state = {
    mode: 'login',
    channel: 'email',
    method: 'password',
    identifier: '',
    codeSent: false,
    notice: ''
  };

  function escape(value) {
    return window.Security.escapeHTML(value || '');
  }

  function render() {
    const mode = state.mode;
    const title = mode === 'signup' ? 'Create your account' : mode === 'forgot' ? 'Reset your password' : 'Welcome back';
    const description = mode === 'signup'
      ? 'Save your orders and journeys through Uttarakhand.'
      : mode === 'forgot' ? 'Verify your account to choose a new password.' : 'Continue your mountain journey.';
    const codeFlow = mode === 'forgot' || state.method === 'otp' || mode === 'signup';
    const channelTabs = `<div class="auth-tabs" role="group" aria-label="Account identifier">
      <button type="button" class="${state.channel === 'email' ? 'on' : ''}" onclick="authSetChannel('email')">Email</button>
      <button type="button" class="${state.channel === 'phone' ? 'on' : ''}" onclick="authSetChannel('phone')">Phone</button>
    </div>`;
    const field = `<label class="auth-label" for="auth-identifier">${state.channel === 'email' ? 'Email address' : 'Phone number'}</label>
      <input id="auth-identifier" name="identifier" type="${state.channel === 'email' ? 'email' : 'tel'}" autocomplete="${state.channel === 'email' ? 'email' : 'tel'}" placeholder="${state.channel === 'email' ? 'you@example.com' : '+91 98765 43210'}" value="${escape(state.identifier)}" required>`;
    const name = mode === 'signup' ? `<label class="auth-label" for="auth-name">Name</label><input id="auth-name" name="name" autocomplete="name" maxlength="100" placeholder="Your name">` : '';
    const password = mode === 'login' && state.method === 'password'
      ? `<label class="auth-label" for="auth-password">Password</label><input id="auth-password" name="password" type="password" autocomplete="current-password" required>`
      : mode === 'signup' || mode === 'forgot'
        ? `<label class="auth-label" for="auth-password">${mode === 'forgot' ? 'New password' : 'Password'}</label><input id="auth-password" name="password" type="password" minlength="10" maxlength="128" autocomplete="new-password" required><span class="auth-hint">Use at least 10 characters.</span>`
        : '';
    const otp = codeFlow
      ? `<label class="auth-label" for="auth-otp">Verification code</label><input id="auth-otp" name="otp" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code" placeholder="6-digit code" ${mode === 'login' && !state.codeSent ? '' : 'required'}>`
      : '';
    const sendCode = codeFlow
      ? `<button class="btn auth-secondary" type="button" onclick="authSendCode()">${state.channel === 'phone' ? (state.codeSent ? 'Resend WhatsApp code' : 'Send code on WhatsApp') : (state.codeSent ? 'Resend code' : 'Send verification code')}</button>`
      : '';
    const submitText = mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Update password' : state.method === 'otp' ? 'Verify & sign in' : 'Sign in';

    const phoneNotice = state.channel === 'phone'
      ? `<div style="font-size:11.5px;color:#797f74;margin:6px 0 10px;line-height:1.4">Email verification is fully automated via Google SMTP. For cellular SMS delivery, connect a gateway or switch to Email.</div>`
      : '';

    return `<div class="lab">HILLSONWHEELS · ACCOUNT</div>
      <h1 class="auth-title">${title}</h1><p class="auth-description">${description}</p>
      ${channelTabs}
      ${phoneNotice}
      <form id="account-form" class="auth-form" novalidate>
        ${field}${name}${password}${otp}
        <div class="auth-actions">${sendCode}<button class="btn on" type="submit">${submitText}</button></div>
        <p id="auth-message" class="auth-message" role="status" aria-live="polite">${escape(state.notice)}</p>
      </form>
      <div class="auth-links">
        ${mode === 'login' ? `<button type="button" onclick="authSetMode('signup')">Create an account</button><button type="button" onclick="authSetMode('forgot')">Forgot password?</button>${state.method === 'password' ? `<button type="button" onclick="authSetMethod('otp')">Sign in with a code</button>` : `<button type="button" onclick="authSetMethod('password')">Use password instead</button>`}` : `<button type="button" onclick="authSetMode('login')">Back to sign in</button>`}
      </div>
      <div style="margin-top:16px;padding:10px 14px;background:rgba(197,168,105,0.08);border:1px dashed var(--gold,#C5A869);border-radius:4px;font-size:11.5px;color:#52584d;text-align:center">
        Demo Patron: <strong style="cursor:pointer;color:#1A1B18;text-decoration:underline" onclick="authFillPatron()">patron@hillsonwheels.in</strong> · Password: <strong style="color:#1A1B18">PahadiPatron2026!</strong>
      </div>`;
  }

  function setMode(mode) {
    state.mode = mode;
    state.method = 'password';
    state.codeSent = false;
    state.notice = '';
    window.go('login', 1);
  }

  function setChannel(channel) {
    state.channel = channel;
    state.identifier = '';
    state.codeSent = false;
    state.notice = '';
    window.go('login', 1);
  }

  function setMethod(method) {
    state.method = method;
    state.codeSent = false;
    state.notice = '';
    window.go('login', 1);
  }

  async function requestCode() {
    const form = document.getElementById('account-form');
    const identifier = form.elements.identifier.value.trim();
    const field = form.elements.identifier;
    if (!field.checkValidity()) {
      field.reportValidity();
      return;
    }
    state.identifier = identifier;
    const purpose = state.mode === 'signup' ? 'signup' : state.mode === 'forgot' ? 'reset' : 'login';
    const message = document.getElementById('auth-message');
    message.textContent = 'Sending verification code…';

    try {
      const response = await fetch('/api/auth/otp/request', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, channel: state.channel, purpose })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not send a verification code.');
      state.codeSent = true;
      state.notice = result.message || 'Verification code sent.';
      message.textContent = state.notice;
      const otpInput = form.querySelector('input[name="otp"]') || document.getElementById('auth-otp');
      if (otpInput) {
        otpInput.value = '';
        otpInput.focus();
      }
      if (state.mode === 'login') window.go('login', 1);
    } catch (error) {
      state.notice = error.message;
      message.textContent = state.notice;
    }
  }

  async function submit(event) {
    const form = event.target;
    if (!form.matches('#account-form')) return;
    event.preventDefault();
    if (!form.reportValidity()) return;
    state.identifier = form.elements.identifier.value.trim();
    const message = document.getElementById('auth-message');
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    message.textContent = 'Please wait…';

    const payload = {
      identifier: state.identifier,
      channel: state.channel,
      password: form.elements.password ? form.elements.password.value : undefined,
      otp: form.elements.otp ? form.elements.otp.value : undefined,
      name: form.elements.name ? form.elements.name.value.trim() : undefined
    };
    const endpoint = state.mode === 'signup' ? '/api/auth/register'
      : state.mode === 'forgot' ? '/api/auth/password/reset'
        : state.method === 'otp' ? '/api/auth/otp/verify' : '/api/auth/login';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = response.status === 204 ? {} : await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Authentication failed. Please check your credentials.');
      }
      if (result.token) {
        try { localStorage.setItem('hsw_user_token', result.token); } catch (_) {}
      }
      if (result.user && typeof window.setAccountUser === 'function') window.setAccountUser(result.user);
      const destination = sessionStorage.getItem('hsw-auth-return') || 'home';
      sessionStorage.removeItem('hsw-auth-return');
      window.go(destination);
    } catch (error) {
      message.textContent = error.message;
      button.disabled = false;
    }
  }

  function fillPatron() {
    state.channel = 'email';
    state.mode = 'login';
    state.method = 'password';
    state.identifier = 'patron@hillsonwheels.in';
    window.go('login', 1);
    setTimeout(() => {
      const pass = document.getElementById('auth-password');
      if (pass) pass.value = 'PahadiPatron2026!';
    }, 50);
  }

  document.addEventListener('submit', submit);
  window.AccountAuth = { render };
  window.authSetMode = setMode;
  window.authSetChannel = setChannel;
  window.authSetMethod = setMethod;
  window.authSendCode = requestCode;
  window.authFillPatron = fillPatron;
})(window);