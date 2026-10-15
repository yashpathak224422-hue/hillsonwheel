'use strict';
const nodemailer = require('nodemailer');

const INTERNAL_SECRET = process.env.JWT_SECRET || 'DCIgcYdtHg5Rt-sGlM2Xo3W6gXZG9_GLx0AzEX5LIXgW3Cwky6VI-MZRitWa_oi7';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', service: 'mail-relay', timestamp: new Date().toISOString() });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token || token !== INTERNAL_SECRET) {
    return res.status(401).json({ error: 'Unauthorized relay access' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (_) {}
  }

  const { to, subject, html, text, attachments } = body || {};
  if (!to || !subject || (!html && !text)) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, and content.' });
  }

  const user = process.env.SMTP_USER || 'howsmailbox@gmail.com';
  const pass = process.env.SMTP_PASSWORD || 'nscxzaacfqgrksdb';

  // 1. Blazing fast HTTPS delivery via Resend (if configured)
  if (process.env.RESEND_API_KEY) {
    try {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'HILLSONWHEELS <onboarding@resend.dev>',
          to: [to],
          subject,
          html,
          text
        })
      });
      if (resendRes.ok) {
        const data = await resendRes.json();
        return res.status(200).json({ success: true, messageId: data.id, provider: 'resend' });
      }
    } catch (resendErr) {
      console.warn('[MAIL RELAY] Resend attempt failed:', resendErr.message);
    }
  }

  // 2. Blazing fast HTTPS delivery via Brevo (Sendinblue)
  if (process.env.BREVO_API_KEY) {
    try {
      const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || 'howsmailbox@gmail.com';
      const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'HILLSONWHEELS', email: fromAddress },
          to: [{ email: to }],
          subject,
          htmlContent: html,
          textContent: text
        })
      });
      if (brevoRes.ok) {
        const data = await brevoRes.json();
        return res.status(200).json({ success: true, messageId: data.messageId, provider: 'brevo' });
      }
    } catch (brevoErr) {
      console.warn('[MAIL RELAY] Brevo attempt failed:', brevoErr.message);
    }
  }

  // 3. Try port 465 (Direct SSL/TLS)
  try {
    const transporter465 = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 8000
    });

    const info = await transporter465.sendMail({
      from: `"HILLSONWHEELS" <${user}>`,
      to,
      subject,
      html,
      text: text || subject,
      attachments: attachments || []
    });

    return res.status(200).json({ success: true, messageId: info.messageId, port: 465 });
  } catch (err465) {
    console.warn('[MAIL RELAY] Port 465 attempt failed:', err465.message, 'Trying port 587...');
    // 2. Try port 587 (STARTTLS)
    try {
      const transporter587 = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user, pass },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 8000
      });

      const info = await transporter587.sendMail({
        from: `"HILLSONWHEELS" <${user}>`,
        to,
        subject,
        html,
        text: text || subject,
        attachments: attachments || []
      });

      return res.status(200).json({ success: true, messageId: info.messageId, port: 587 });
    } catch (err587) {
      console.error('[MAIL RELAY ERROR] Port 587 attempt failed:', err587.message);
      return res.status(500).json({
        success: false,
        error: err587.message,
        port465Error: err465.message
      });
    }
  }
};
