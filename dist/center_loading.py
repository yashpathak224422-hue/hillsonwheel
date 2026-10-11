import glob
import re

# 1. Update assets/css/base.css to ensure #app fills viewport
with open("assets/css/base.css", "r", encoding="utf-8") as f:
    base_css = f.read()

if "#app" not in base_css:
    base_css += """
#app {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}
.loading-screen {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  margin: auto;
}
"""
    with open("assets/css/base.css", "w", encoding="utf-8") as f:
        f.write(base_css)
    print("Updated assets/css/base.css")

# 2. Update open_ and reveal in assets/js/app.js
with open("assets/js/app.js", "r", encoding="utf-8") as f:
    app_js = f.read()

new_open_code = """function open_(){
  cur='open';
  $('#app').innerHTML=`<div class="loading-screen" style="min-height:100vh;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative">
    <div style="position:relative;display:flex;align-items:center;justify-content:center;margin-bottom:24px">
      <svg viewBox="0 0 400 200" style="width:min(80vw,520px);display:block">
        <path id="mt" d="M10 170L90 110 140 130 200 40 250 100 290 80 390 170" fill="none" stroke="#C5A869" stroke-width="1.2" stroke-dasharray="700" stroke-dashoffset="700" style="animation:dr 5s ease forwards"/>
      </svg>
      <div class="dot" style="position:absolute;top:44%;left:50%;transform:translate(-50%,-50%)"></div>
    </div>
    <div style="margin-top:20px"><button class="btn on" id="en" style="opacity:0;animation:up 1.8s 1.2s forwards">Discover</button></div>
  </div><style>@keyframes dr{to{stroke-dashoffset:0}}</style>`;
  $('#en').onclick=reveal;
}

function reveal(){
  const w=['forests','rivers','villages','food','craft','people','temples','roads','journeys'];
  $('#app').innerHTML=`<div class="loading-screen" style="min-height:100vh;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
    <div>
      <div class="lab" id="w" style="height:20px;margin-bottom:36px;letter-spacing:.32em"></div>
      <div style="display:flex;align-items:center;justify-content:center;gap:12px">
        <h1 class="rv" style="letter-spacing:.32em;font-size:clamp(28px,6vw,76px);animation-delay:2.8s;display:inline-block">HILLSONWHEELS</h1>
      </div>
      <p class="lab rv" style="margin:16px 0 40px;letter-spacing:.35em;animation-delay:3.5s">The world of Uttarakhand</p>
      <button class="btn on rv" style="animation-delay:4.2s" onclick="go('home')">Enter</button>
    </div>
  </div>`;
  let i=0;
  const t=setInterval(()=>{
    if(i>=w.length)return clearInterval(t);
    $('#w').textContent=w[i++];
  },300);
}

open_();
"""

app_js = re.sub(r'function open_\(\)\{.*', new_open_code, app_js, flags=re.DOTALL)
with open("assets/js/app.js", "w", encoding="utf-8") as f:
    f.write(app_js)
print("Updated assets/js/app.js")

# 3. Update Hillsonwheels — The World of Uttarakhand.html
with open("Hillsonwheels — The World of Uttarakhand.html", "r", encoding="utf-8") as f:
    html = f.read()

# Add #app min-height style if not present
if ".loading-screen" not in html:
    html = html.replace("</style>", "#app{min-height:100vh;width:100%;display:flex;flex-direction:column}.loading-screen{min-height:100vh;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}\n</style>")

# Update open_ and reveal in HTML
motion_code = """
/* ========== LUXURY MOTION & INTERACTION ENGINE ========== */
(function() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (dot) {
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    }
  });

  function updateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    if (ring) {
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
    }
    requestAnimationFrame(updateRing);
  }
  requestAnimationFrame(updateRing);

  document.addEventListener('mouseover', e => {
    if (e.target.closest('button, a, .card, .chip, .season-btn, .nav-brand, .six div, [onclick]')) {
      document.body.classList.add('cursor-hover');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('button, a, .card, .chip, .season-btn, .nav-brand, .six div, [onclick]')) {
      document.body.classList.remove('cursor-hover');
    }
  });

  // Scroll Progress Bar
  window.addEventListener('scroll', () => {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h > 0 ? (window.scrollY / h) * 100 : 0;
    bar.style.width = p + '%';
  });

  // Parallax 3D Card Tilt
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
})();
"""

html_idx = html.find("function open_(){")
if html_idx != -1:
    clean_html = html[:html_idx] + new_open_code + motion_code + "\n</script></body></html>"
    with open("Hillsonwheels — The World of Uttarakhand.html", "w", encoding="utf-8") as f:
        f.write(clean_html)
    print("Updated Hillsonwheels — The World of Uttarakhand.html")

print("Loading screen is now perfectly centered in the viewport.")
