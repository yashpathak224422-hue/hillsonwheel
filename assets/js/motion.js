/**
 * HILLSONWHEELS - MOTION & AMBIENT ENGINE
 * Magnetic fluid cursor, parallax 3D card tilt, scroll progress tracker.
 */
(function(window) {
  'use strict';

  function initMotionEngine() {
    // 1. Scroll Progress Tracker
    window.addEventListener('scroll', () => {
      const bar = document.getElementById('scroll-progress');
      if (!bar) return;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? (window.scrollY / h) * 100 : 0;
      bar.style.width = p + '%';
    });

    // 3. Parallax 3D Card Tilt on Mouse Move
    document.addEventListener('mousemove', e => {
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.transform = `perspective(1000px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-8px) scale(1.02)`;
        } else {
          card.style.transform = '';
        }
      });
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initMotionEngine);
    } else {
      initMotionEngine();
    }
  }
})(typeof window !== 'undefined' ? window : global);
