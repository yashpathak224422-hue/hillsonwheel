// Pre-warm backend API to prevent cold start latency
(function prewarmBackend() {
  try {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const healthUrl = isLocal ? 'http://localhost:5000/api/health' : '/api/health';
    fetch(healthUrl, { cache: 'no-store' }).catch(() => {});
  } catch (_) {}
})();

const PHOTO={
  hero:'./assets/images/local/hero-banner.png',
  land:'./assets/images/places/kausani-panorama.jpg',
  taste:'./assets/images/local/taste-banner.png',
  craft:'./assets/images/local/craft-banner.png',
  journey:'./assets/images/places/chopta-tungnath.jpg',
  people:'./assets/images/local/people-banner.png',
  soul:'./assets/images/places/kedarnath-temple.jpg',
  village:'./assets/images/places/village-homestay.jpg',
  valley:'./assets/images/places/valley-of-flowers.jpg',
  auli:'./assets/images/places/auli-getaway.jpg',
  river:'./assets/images/places/devprayag-sangam.jpg',
  about:'./assets/images/places/kumaon-panorama.jpg',
  login:'./assets/images/local/hero-banner.png',
  honey:'./assets/images/products/buransh-honey.jpg',
  map:'./assets/images/maps/uttarakhand-3d-map.png',
  p0:'./assets/images/products/chamoli-rajma.jpg',
  p1:'./assets/images/products/buransh-honey.jpg',
  p2:'./assets/images/products/pahadi-pulses.jpg',
  p3:'./assets/images/products/mixed-spices.jpg',
  p4:'./assets/images/products/garhwal-walnuts.jpg',
  p5:'./assets/images/products/chilli-pickle.jpg',
  p6:'./assets/images/products/himalayan-herbs.jpg',
  p7:'./assets/images/products/aipan-weave.jpg',
  p8:'./assets/images/products/dry-apricot.jpg',
  p9:'./assets/images/products/wild-timur.jpg',
  'buransh-honey':'./assets/images/products/buransh-honey.jpg',
  'chamoli-rajma':'./assets/images/products/chamoli-rajma.jpg',
  'pahadi-pulses':'./assets/images/products/pahadi-pulses.jpg',
  'mixed-spices':'./assets/images/products/mixed-spices.jpg',
  'garhwal-walnuts':'./assets/images/products/garhwal-walnuts.jpg',
  'chilli-pickle':'./assets/images/products/chilli-pickle.jpg',
  'himalayan-herbs':'./assets/images/products/himalayan-herbs.jpg',
  'aipan-weave':'./assets/images/products/aipan-weave.jpg',
  'dry-apricot':'./assets/images/products/dry-apricot.jpg',
  'wild-timur':'./assets/images/products/wild-timur.jpg',

  // Places & Landscapes (Unique, Authenticated, Zero Repetition)
  heaven:'./assets/images/places/heaven-redefined.jpg',
  kausani:'./assets/images/places/kausani-panorama.jpg',
  devprayag:'./assets/images/places/devprayag-sangam.jpg',
  mana:'./assets/images/places/mana-village.jpg',
  jageshwar:'./assets/images/places/jageshwar-dham.jpg',
  kedarnath:'./assets/images/places/kedarnath-temple.jpg',
  badrinath:'./assets/images/places/badrinath-temple.jpg',
  nainital:'./assets/images/places/nainital-lake.jpg',
  mussoorie:'./assets/images/places/mussoorie-ridge.jpg',
  laxmanjhula:'./assets/images/places/laxman-jhula.jpg',
  gangotri:'./assets/images/places/gangotri-bhagirathi.jpg',
  bednibugyal:'./assets/images/places/bedni-bugyal.jpg',
  terraces:'./assets/images/places/terrace-fields.jpg',
  deodar:'./assets/images/places/deodar-canopy.jpg',
  buranshtree:'./assets/images/places/buransh-bloom.jpg',
  chholiya:'./assets/images/places/chholiya-dance.jpg',
  aipanartisan:'./assets/images/places/aipan-artisan.jpg',
  binsar:'./assets/images/places/binsar-oak.jpg',
  almora:'./assets/images/places/almora-kasar.jpg',
  osla:'./assets/images/places/osla-timber-village.jpg',
  urgam:'./assets/images/places/urgam-valley-peaks.jpg',
  tungnath:'./assets/images/places/chopta-tungnath.jpg',
  nandadevi:'./assets/images/places/nanda-devi.jpg',
  munsiyari:'./assets/images/places/munsiyari-panchachuli.jpg',
  rishikesh:'./assets/images/places/rishikesh-ganga-aarti.jpg',
  roopkund:'./assets/images/places/roopkund-lake.jpg',
  panchachuli:'./assets/images/places/munsiyari-panchachuli.jpg',
  kumaon:'./assets/images/places/kumaon-panorama.jpg',
  solar:'./assets/images/places/solar-renewable-energy.jpg',
  water:'./assets/images/places/pure-drinking-water.jpg',
  circular:'./assets/images/places/circular-economy.jpg',
  green:'./assets/images/places/green-living.jpg',
  'renewable-energy':'./assets/images/places/solar-renewable-energy.jpg',
  'water-solutions':'./assets/images/places/pure-drinking-water.jpg',
  'circular-economy':'./assets/images/places/circular-economy.jpg',
  'green-living':'./assets/images/places/green-living.jpg'
};
window.PHOTO = PHOTO;
const IM=PHOTO;
const getImageUrl = k => {
  if (!k) return PHOTO.hero;
  if (typeof k === 'string' && (k.startsWith('http://') || k.startsWith('https://') || k.startsWith('data:') || k.startsWith('/') || k.startsWith('./'))) {
    return k;
  }
  return PHOTO[k] || PHOTO.hero;
};
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s),U=k=>`background-image:url('${getImageUrl(k)}')`;
let cart=1,cur='open',sel={};
const WORLDS=[['land','The Land','01'],['taste','The Taste','02'],['craft','The Craft','03'],['journey','The Journey','04'],['people','The People','05'],['soul','The Soul','06']];
const MENU=[...WORLDS.map(w=>[w[0]=='taste'?'bazaar':w[0],w[1]]),['map','Map'],['stories','Stories'],['about','About'],['search','Search'],['login','Login'],['cart','Cart']];
let PROD=[
  ['Organic Rajma','Chamoli',349,'p0','Pulses','Slow-grown high altitude kidney beans, rich and buttery.','chamoli-rajma-500g','chamoli-rajma'],
  ['Buransh Honey','Chamoli',699,'p1','Honey','Wild rhododendron nectar, harvested above 2,000m.','buransh-honey-250g','buransh-honey'],
  ['Pahadi Pulses','Almora',289,'p2','Pulses','Traditional mixed Kumaoni dals, hand-harvested.','pahadi-pulses-500g','pahadi-pulses'],
  ['Mixed Spices','Kumaon',399,'p3','Spices','Sun-dried mountain spices ground on stone silbatta.','mixed-spices-200g','mixed-spices'],
  ['Garhwal Walnuts','Uttarkashi',549,'p4','Dry Fruits','Thin-shelled mountain walnuts, rich in natural oils.','garhwal-walnuts-500g','garhwal-walnuts'],
  ['Chilli Pickle','Pithoragarh',259,'p5','Pickles','Fiery yellow mustard & mountain chilli pickle.','chilli-pickle-350g','chilli-pickle'],
  ['Himalayan Herbs','Munsiyari',329,'p6','Herbs','Wild gathered Jambu, Gandharani & mountain oregano.','himalayan-herbs-100g','himalayan-herbs'],
  ['Aipan Weave','Almora',899,'p7','Handicrafts','Traditional handloom weave with ritual Aipan motifs.','aipan-weave-standard','aipan-weave'],
  ['Dry Apricot','Gangolihat',459,'p8','Dry Fruits','Wild sweet mountain apricots sun-dried on rooftops.','dry-apricot-400g','dry-apricot']
];

let LIVE_CATALOG = [];
let LIVE_JOURNEYS = [];

async function syncLiveCatalog() {
  try {
    const res = await fetch('/api/catalog');
    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items) && items.length > 0) {
        LIVE_CATALOG = items;
        PROD = items.map(p => [
          p.name,
          p.origin ? p.origin.split('·')[0].trim() : 'Uttarakhand',
          Number(p.unitPrice || 0),
          p.photoKey || 'p1',
          p.category || 'Mountain Produce',
          p.description || `${p.name} from high Uttarakhand valleys.`,
          p.sku,
          p.id || p.sku,
          p.origin || '',
          p.inStock,
          p.variant || 'Standard'
        ]);
        if (window.EcommerceStore && window.EcommerceStore.registerCatalog) {
          window.EcommerceStore.registerCatalog(items);
        }
        if (cur === 'bazaar') render('bazaar', 1);
      }
    }
  } catch (err) {
    console.warn('Live catalog sync offline fallback:', err);
  }
}

async function syncLiveJourneys() {
  try {
    const res = await fetch('/api/journeys');
    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items) && items.length > 0) {
        LIVE_JOURNEYS = items;
        if (cur === 'journey') render('journey', 1);
      }
    }
  } catch (err) {
    console.warn('Live journeys sync offline fallback:', err);
  }
}

function handleAddToCart(sku, id, qty = 1) {
  if (window.EcommerceStore && window.EcommerceStore.addToCart) {
    window.EcommerceStore.addToCart(id || sku, sku, qty, true);
  } else {
    cart += qty;
    openCartDrawer();
  }
}

function openProductDetail(skuOrId) {
  const prod = LIVE_CATALOG.find(p => p.sku === skuOrId || p.id === skuOrId) ||
               PROD.find(p => p[6] === skuOrId || p[0] === skuOrId);
  if (prod) {
    sel.activeProd = prod.sku ? prod : {
      name: prod[0], origin: prod[1], unitPrice: prod[2], photoKey: prod[3], category: prod[4], description: prod[5], sku: prod[6], id: prod[7]
    };
  }
  if (window.EcommerceStore && window.EcommerceStore.openPDP) {
    window.EcommerceStore.openPDP(sel.activeProd?.id || sel.activeProd?.sku || skuOrId);
  } else {
    go('product');
  }
}

function openJourneyDetails(id) {
  const j = LIVE_JOURNEYS.find(x => x.id === id) || {
    title: id || 'Auli Getaway', photoKey: 'auli', category: 'Destinations',
    description: 'A curated journey through the valleys and high meadows of Uttarakhand.',
    elevation: '2,500 – 3,050 m', district: 'Chamoli · Garhwal Himalaya', season: 'Dec–Mar · May–Oct', price: 9999, duration: '3 Days',
    highlights: 'Alpine meadow walks, ropeway, ski slopes, Nanda Devi vistas'
  };
  sel.activeJourney = j;
  go('dest');
}

/* Web Audio API Synthesizer - 100% self-contained */
const MountainAudio={
  ctx:null,mode:'off',node:null,gain:null,bellTimer:null,
  init(){
    if(!this.ctx){
      const AC=window.AudioContext||window.webkitAudioContext;
      if(AC)this.ctx=new AC();
    }
    if(this.ctx&&this.ctx.state==='suspended')this.ctx.resume();
  },
  chime(freq=528,dur=3.2){
    try{
      this.init();if(!this.ctx)return;
      const osc=this.ctx.createOscillator(),g=this.ctx.createGain();
      osc.type='sine';
      osc.frequency.setValueAtTime(freq,this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq*0.48,this.ctx.currentTime+dur);
      g.gain.setValueAtTime(0.18,this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001,this.ctx.currentTime+dur);
      osc.connect(g);g.connect(this.ctx.destination);
      osc.start();osc.stop(this.ctx.currentTime+dur);
    }catch(e){}
  },
  toggle(){
    this.init();
    const modes=['off','breeze','bells','river'];
    const next=modes[(modes.indexOf(this.mode)+1)%modes.length];
    this.setMode(next);
  },
  setMode(m){
    this.mode=m;
    if(this.bellTimer){clearInterval(this.bellTimer);this.bellTimer=null;}
    if(this.node){try{this.node.stop();this.node.disconnect()}catch(e){}this.node=null;}
    if(this.gain){try{this.gain.disconnect()}catch(e){}this.gain=null;}
    if(m==='off'){this.updateUI();return;}
    if(!this.ctx)return;
    const bufSize=this.ctx.sampleRate*2;
    const buf=this.ctx.createBuffer(1,bufSize,this.ctx.sampleRate);
    const data=buf.getChannelData(0);
    for(let i=0;i<bufSize;i++)data[i]=Math.random()*2-1;
    const noise=this.ctx.createBufferSource();
    noise.buffer=buf;noise.loop=true;
    const filter=this.ctx.createBiquadFilter();
    this.gain=this.ctx.createGain();
    if(m==='breeze'){
      filter.type='bandpass';filter.frequency.setValueAtTime(360,this.ctx.currentTime);filter.Q.setValueAtTime(3.2,this.ctx.currentTime);
      this.gain.gain.setValueAtTime(0.14,this.ctx.currentTime);
      this.chime(640,2.5);
    }else if(m==='river'){
      filter.type='lowpass';filter.frequency.setValueAtTime(620,this.ctx.currentTime);
      this.gain.gain.setValueAtTime(0.16,this.ctx.currentTime);
    }else if(m==='bells'){
      filter.type='bandpass';filter.frequency.setValueAtTime(528,this.ctx.currentTime);
      this.gain.gain.setValueAtTime(0.04,this.ctx.currentTime);
      this.chime(528,4);
      this.bellTimer=setInterval(()=>{if(this.mode==='bells')this.chime([528,640,792,1056][Math.floor(Math.random()*4)],3.5)},3600);
    }
    noise.connect(filter);filter.connect(this.gain);this.gain.connect(this.ctx.destination);
    noise.start();this.node=noise;this.updateUI();
  },
  updateUI(){
    const b=$('#audio-btn');
    if(b){
      const t={off:'Mountain Audio: Off',breeze:'Alpine Breeze',bells:'Temple Bells',river:'Glacial Ganga'}[this.mode];
      b.innerHTML=`<span class="audio-wave"><span></span><span></span><span></span></span> ${t}`;
      b.className='audio-toggle '+(this.mode!=='off'?'on':'');
    }
  }
};

/* Provenance & Origin Details */
const PROVENANCE_DATA={
  p0:{title:'Organic Chamoli Rajma',origin:'Chamoli · Urgam Valley',altitude:'2,450 m',farmer:'Nanda Devi Organic Grain Collective',harvest:'Autumn Harvest 2025',soil:'Glacial Mineral Slate Soil',cert:'100% Certified Heirloom Seed'},
  p1:{title:'Organic Buransh Honey',origin:'Chamoli · Joshimath Apiaries',altitude:'2,100 m',farmer:'Pahadi Traditional Beekeepers Guild',harvest:'Spring Wild Rhododendron Bloom',soil:'Scarlet Deodar & Oak Groves',cert:'Raw, Unheated, Muslin Filtered'},
  p2:{title:'Traditional Pahadi Pulses',origin:'Almora · Kumaon Ridge',altitude:'1,750 m',farmer:'Women Farmers Self-Help Group Almora',harvest:'November 2025',soil:'Rain-fed Terraced Red Loam',cert:'Natural Sun-dried, Stone-milled'},
  p3:{title:'Stone-Ground Mixed Spices',origin:'Bageshwar · Kumaon',altitude:'1,500 m',farmer:'Traditional Spice Millers of Sarayu',harvest:'Fresh Ground Weekly',soil:'Wild Himalayan slopes',cert:'Zero Artificial Additives'},
  p4:{title:'Garhwal Wild Walnuts',origin:'Uttarkashi · Harsil Valley',altitude:'2,620 m',farmer:'Bhagirathi Orchard Growers',harvest:'September 2025',soil:'High Mountain Glacial Terraces',cert:'Thin-Shelled Kagzi Heirloom'},
  p5:{title:'Pithoragarh Mustard Chilli Pickle',origin:'Pithoragarh · Johar Valley',altitude:'1,960 m',farmer:'Johari Village Recipe Artisans',harvest:'Mustard Oil Cured 90 Days',soil:'Mountain Organic Terraces',cert:'Cold-pressed Mustard Oil Base'},
  p6:{title:'High Altitude Wild Herbs',origin:'Munsiyari · Panchachuli Slopes',altitude:'2,800 m',farmer:'Bhotia Alpine Gatherers Association',harvest:'High Summer 2025',soil:'Sub-alpine Rock Scree',cert:'Wild Foraged Single-Batch'},
  p7:{title:'Handwoven Aipan Textile',origin:'Almora Historic Crafts Quarter',altitude:'1,640 m',farmer:'Lata Bisht & Almora Weavers Guild',harvest:'Hand-dyed & Handloom Loomed',soil:'Indigenous Mountain Wool & Cotton',cert:'GI Heritage Uttarakhand Certified'},
  p8:{title:'Sun-Dried Mountain Apricots',origin:'Gangolihat · Pithoragarh',altitude:'1,780 m',farmer:'Kumaon Rooftop Sun-Driers Society',harvest:'July 2025',soil:'Temperate Fruit Belts',cert:'Unsulphured Natural Sun Cure'}
};

/* Authentic Mountain Recipes */
const RECIPES_DATA={
  honey:{name:'Buransh Wild Nectar Kahwa',time:'10 Mins',serves:'2 Cups',desc:'An ancient Himalayan restorative tea brewed with raw Buransh rhododendron honey, crushed ginger, cardamom, and saffron.',items:['2 tbsp Organic Buransh Honey','2 cups pure mountain water','1 inch crushed ginger','2 green cardamom pods','4 strands saffron','1 cinnamon quill'],steps:['Boil water with ginger, cardamom, and cinnamon for 4 mins.','Cool slightly to 70°C to preserve live nectar enzymes.','Stir in pure Buransh honey and saffron strands.','Sip slowly from warm earthen cups.']},
  rajma:{name:'Chamoli Pahadi Rajma Curry',time:'45 Mins',serves:'4 Portions',desc:'Slow-cooked in an iron Kadai with wild Jambu herbs, pure mountain ghee, and stone-ground spices.',items:['250g Chamoli Red Rajma (soaked)','2 tbsp Pure Cow Ghee','1 tsp Wild Jambu (Faran) herb','1 tsp Jakhiya seeds','1 tsp Stone-ground spices','2 green chillies'],steps:['Pressure cook soaked Rajma with rock salt and turmeric until buttery.','Heat ghee in iron Kadai; crackle Jakhiya and Jambu herbs until fragrant.','Add ginger, chillies, and stone-ground spices.','Simmer on slow flame for 20 mins until rich and velvety.']},
  spices:{name:'Pahadi Silbatta Herbal Namak',time:'15 Mins',serves:'1 Jar',desc:'The soul of every Pahadi household. Fresh herbs, wild mountain garlic, roasted cumin, and Himalayan rock salt ground on granite.',items:['1 cup Himalayan Rock Salt','1 cup Fresh Mountain Coriander & Mint','6 cloves Mountain Garlic','2 green chillies','1 tbsp Roasted Cumin & Mustard seeds'],steps:['Wash and thoroughly dry fresh herbs.','Place rock salt, roasted spices, and garlic on granite Silbatta.','Grind with rhythmic strokes until pale emerald green.','Sprinkle over fresh cucumbers, fruit, or warm parathas.']}
};

/* Seasonal Packing Guides */
const PACKING_GUIDES={
  summer:['UV 400 Polarized Sunglasses (High UV above 2,500m)','Light Merino wool sweater for cool evenings','Sturdy high-traction trekking shoes with ankle support','Refillable insulated water flask','Sun protection hat & eco-friendly sunscreen','Altitude hydration electrolyte salts'],
  winter:['Heavy down jacket rated for -10°C (Joshimath / Auli)','Thermal base layers (Top & Bottom)','Gore-Tex waterproof snow gloves & woollen beanie','High-grip snow trekking boots with gaiters','Moisturizing skin balm & lip protection','High-calorie trail mix (Garhwal walnuts & apricots)'],
  monsoon:['Lightweight breathable waterproof poncho / rain jacket','Quick-dry trekking trousers','Waterproof dry-bag covers for electronics','Natural citronella insect repellent','Water-purification tablets or UV straw','Spare merino wool socks (3 pairs)'],
  autumn:['Windbreaker fleece jacket for clear high ridge winds','Trekking poles with rubber tips','Binoculars for panoramic 300km Himalayan peak viewing','Camera with spare batteries (cold drains lithium cells fast)','Light gloves for dawn and dusk walks','Personal herbal tea tumbler']
};

/* Modal Controller */
function openModal(contentHtml){
  const m=$('#global-modal');
  if(!m)return;
  m.innerHTML=`<div class="modal-box"><div style="position:absolute;top:20px;right:24px;cursor:pointer;font-size:12px;opacity:.6" onclick="closeModal()">Close</div>${contentHtml}</div>`;
  m.classList.add('o');
}
function closeModal(e){
  if(e&&e.target!==$('#global-modal'))return;
  const m=$('#global-modal');if(m)m.classList.remove('o');
}

function openProvenance(k, title, origin, altitude){
  MountainAudio.chime(640,2);
  const d=PROVENANCE_DATA[k]||{
    title: title || 'Pure Mountain Produce',
    origin: origin || 'High Valleys of Uttarakhand',
    altitude: altitude || '2,200 m',
    farmer: 'Pahadi Traditional Growers & Artisans Guild',
    harvest: 'Traditional Small-Batch Harvest',
    soil: 'Glacial Mineral Slate Soil & Oak Forests',
    cert: 'Certified Pure Himalayan Origin'
  };
  openModal(`
    <div class="lab">Provenance & Mountain Traceability</div>
    <h2 style="margin:8px 0 16px;font-size:32px">${d.title}</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin:20px 0;background:rgba(197,168,105,0.08);padding:18px;border-radius:4px;border:1px solid rgba(197,168,105,0.25)">
      <div><div class="lab">Origin Valley</div><p style="font-size:15px;font-weight:600;margin-top:4px">${d.origin}</p></div>
      <div><div class="lab">Harvest Altitude</div><p style="font-size:15px;font-weight:600;margin-top:4px">${d.altitude}</p></div>
      <div><div class="lab">Cooperative / Guild</div><p style="font-size:15px;font-weight:600;margin-top:4px">${d.farmer}</p></div>
      <div><div class="lab">Harvest Period</div><p style="font-size:15px;font-weight:600;margin-top:4px">${d.harvest}</p></div>
    </div>
    <div class="lab">Soil & Processing Integrity</div>
    <p style="font-size:14px;line-height:1.8;margin:8px 0 16px;opacity:.85">Producer-listed growing conditions: ${d.soil}. Certification and sourcing details are verified by the collective; 100% natural processing.</p>
    <button class="btn on" style="width:100%" onclick="closeModal()">Back to Catalog</button>
  `);
}

function openRecipe(rKey){
  MountainAudio.chime(528,2.5);
  const r=RECIPES_DATA[rKey]||RECIPES_DATA['honey'];
  openModal(`
    <div class="lab">Authentic Mountain Kitchen</div>
    <h2 style="margin:8px 0 6px;font-size:32px">${r.name}</h2>
    <p style="font-size:13px;letter-spacing:.15em;color:var(--terra);margin-bottom:14px">${r.time} · Serves ${r.serves}</p>
    <p style="font-size:14px;line-height:1.75;opacity:.85;margin-bottom:20px">${r.desc}</p>
    <div class="lab">Mountain Ingredients</div>
    <ul style="margin:10px 0 20px 20px;font-size:13.5px;line-height:1.8;opacity:.9">${r.items.map(i=>`<li>${i}</li>`).join('')}</ul>
    <div class="lab">Traditional Preparation</div>
    <ol style="margin:10px 0 24px 20px;font-size:13.5px;line-height:1.8;opacity:.9">${r.steps.map(s=>`<li>${s}</li>`).join('')}</ol>
    <button class="btn on" style="width:100%" onclick="closeModal()">Save Mountain Recipe</button>
  `);
}

function openPackingGuide(sKey){
  MountainAudio.chime(792,2);
  const s=sKey||sel.season||'summer';
  const list=PACKING_GUIDES[s]||PACKING_GUIDES['summer'];
  openModal(`
    <div class="lab">Himalayan Expedition Checklist</div>
    <h2 style="margin:8px 0 6px;font-size:32px">Packing for ${s.toUpperCase()} in the Hills</h2>
    <p style="font-size:13px;opacity:.8;margin-bottom:20px">Essential gear vetted by local guides across Garhwal & Kumaon ridges.</p>
    <div style="display:flex;gap:8px;margin-bottom:20px">${['summer','winter','monsoon','autumn'].map(k=>`<span class="chip ${s===k?'on':''}" onclick="openPackingGuide('${k}')">${k}</span>`).join('')}</div>
    <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:24px">${list.map((item,i)=>`<label style="display:flex;align-items:center;gap:12px;background:rgba(0,0,0,0.03);padding:10px 14px;border-radius:4px;border:1px solid #1a1b1810;font-size:13.5px"><input type="checkbox" checked style="width:16px;height:16px;accent-color:var(--gold)"><span>${item}</span></label>`).join('')}</div>
    <button class="btn on" style="width:100%" onclick="closeModal();alert('Mountain packing list saved to your journey planner.')">Print / Save Checklist</button>
  `);
}

/* Quick Bag Drawer */
function openCartDrawer(){
  MountainAudio.chime(880,1.5);
  const d=$('#cart-drawer'),b=$('#cart-drawer-backdrop');
  if(!d||!b)return;
  const w=sel.weight||'250g',u=w==='500g'?1299:699,count=Math.max(cart,1),tot=u*count;
  const threshold=2000,rem=threshold-tot,pct=Math.min(100,(tot/threshold)*100);
  d.innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #1a1b1818;padding-bottom:18px">
      <div><div class="lab">Mountain Basket</div><h2 style="font-size:26px;margin:2px 0">Your Bag (${count})</h2></div>
      <span style="font-size:12px;cursor:pointer;opacity:.6;padding:4px" onclick="closeCartDrawer()">Close</span>
    </div>
    <div style="background:rgba(197,168,105,0.12);padding:12px 16px;border-radius:4px;margin:16px 0;border:1px solid rgba(197,168,105,0.3)">
      <div style="font-size:11px;font-weight:600;display:flex;justify-content:space-between">
        <span>${rem<=0?'Mountain gift box unlocked.':`Add ₹${rem} more for a free pine-crate gift box.`}</span>
        <span>${Math.round(pct)}%</span>
      </div>
      <div style="background:rgba(0,0,0,0.1);height:6px;border-radius:99px;margin-top:8px;overflow:hidden">
        <div style="background:var(--gold);height:100%;width:${pct}%;transition:width .4s"></div>
      </div>
    </div>
    <div style="flex:1;overflow-y:auto;padding-right:4px">
      <div style="display:flex;gap:14px;padding:14px 0;border-bottom:1px solid #1a1b1812">
        <div style="${U('honey')};width:76px;height:76px;background-size:cover;border-radius:3px;flex-shrink:0"></div>
        <div style="flex:1">
          <div class="lab" style="font-size:9.5px">Chamoli Apiary</div>
          <h3 style="font-size:17px;margin:2px 0">Organic Buransh Honey</h3>
          <div style="display:flex;gap:6px;margin:6px 0">
            <span class="chip ${w==='250g'?'on':''}" style="padding:2px 8px;font-size:9px" onclick="sel.weight='250g';openCartDrawer()">250g</span>
            <span class="chip ${w==='500g'?'on':''}" style="padding:2px 8px;font-size:9px" onclick="sel.weight='500g';openCartDrawer()">500g</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px">
            <div style="display:inline-flex;align-items:center;gap:8px;border:1px solid currentColor;padding:2px 8px;border-radius:4px;font-size:11px">
              <span style="cursor:pointer;font-weight:700" onclick="cart=Math.max(1,cart-1);openCartDrawer()">−</span>
              <span>${count}</span>
              <span style="cursor:pointer;font-weight:700" onclick="cart++;openCartDrawer()">+</span>
            </div>
            <div style="font-weight:600;font-size:15px">₹ ${tot}</div>
          </div>
        </div>
      </div>
    </div>
    <div style="border-top:1px solid #1a1b1818;padding-top:16px;margin-top:auto">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px"><span style="opacity:.8">Subtotal</span><span style="font-weight:600">₹ ${tot}</span></div>
      <div style="display:flex;justify-content:space-between;margin-bottom:16px;font-size:13px"><span style="opacity:.8">Direct Mountain Dispatch</span><span style="color:var(--terra);font-weight:600">FREE</span></div>
      <button class="btn on" style="width:100%;padding:14px;font-size:11.5px" onclick="if(window.EcommerceStore&&window.EcommerceStore.proceedToCheckout){EcommerceStore.proceedToCheckout();}else{closeCartDrawer();go('checkout');}">Proceed to Checkout (₹ ${tot})</button>
      <button class="btn" style="width:100%;padding:8px;font-size:10px;margin-top:6px;border-color:transparent" onclick="closeCartDrawer();go('bazaar')">Continue Exploring Bazaar</button>
    </div>
  `;
  b.classList.add('o');d.classList.add('o');
}
function closeCartDrawer(){
  const d=$('#cart-drawer'),b=$('#cart-drawer-backdrop');
  if(d)d.classList.remove('o');if(b)b.classList.remove('o');
}

function setSeason(s){
  document.body.setAttribute('data-season',s);
  sel.season=s;
  MountainAudio.chime(640,1.5);
  if(cur)render(cur,1);
}

const PLACE_INFO={Almora:{region:'Kumaon · Almora district',elevation:'About 1,638 m',about:'A historic ridge town known for long Himalayan views, old bazaars and Kumaoni culture.',highlights:'Walk the Lala Bazaar; visit Kasar Devi and nearby Katarmal Sun Temple; try Bal Mithai.',character:'A lived-in hill town with stone lanes, pine forests, temples and a strong local food tradition.',season:'March–June and September–November are generally comfortable for exploring.'},Auli:{region:'Garhwal · Chamoli district',elevation:'About 2,500–3,000 m',about:'A high alpine meadow above Joshimath, known for its broad snowfields and views toward Nanda Devi.',highlights:'Ride the ropeway when operating, walk the meadow trails and explore nearby Joshimath.',character:'Open mountain scenery and seasonal snow; winter access and activities depend on weather and operations.',season:'December–March for snow; May–June and September–October for clearer walks.'},Munsiyari:{region:'Kumaon · Pithoragarh district',elevation:'About 2,200 m',about:'A remote mountain town in the Johar valley, facing the Panchachuli peaks.',highlights:'Visit the viewpoint, explore local villages and use the town as a base for longer high-altitude routes.',character:'A quieter, high mountain community with strong links to the Johar region; remote treks need preparation.',season:'April–June and September–October; check road and trail conditions before travelling.'},Mussoorie:{region:'Garhwal · Dehradun district',elevation:'About 2,000 m',about:'A historic hill station on the edge of the Garhwal Himalaya, overlooking the Doon valley.',highlights:'Walk Camel’s Back Road, explore Landour and visit the viewpoints above town.',character:'A busy bazaar town with colonial-era architecture, hillside walks and easy access from Dehradun.',season:'March–June and September–November; expect crowds during summer holidays.'},Rishikesh:{region:'Garhwal · Dehradun district',elevation:'About 340 m',about:'A Ganga-side town at the Himalayan foothills, recognised for yoga, pilgrimage and river journeys.',highlights:'Visit Triveni Ghat, the ashrams and Beatles Ashram; rafting is seasonal and operator-dependent.',character:'A mix of spiritual centres, riverside rituals, cafés and adventure tourism; modest dress is appreciated at religious sites.',season:'October–April for milder weather; check official river and weather advisories before rafting.'},Nainital:{region:'Kumaon · Nainital district',elevation:'About 2,084 m',about:'A lake town set around Naini Lake, surrounded by forested Kumaon hills.',highlights:'Walk the lakefront, visit Naina Devi Temple and seek views from Snow View or Tiffin Top.',character:'A compact, lively hill town; nearby Pangot is known for birdwatching and quieter forest stays.',season:'March–June and September–November; monsoon rain can disrupt hillside travel.'}};

const ED={
  land:['heaven','01 / The Land','Where the mountains keep their stories.','Garhwal · Kumaon · rivers, forests, villages and seasons.',[['urgam','Garhwal','Stone houses above the clouds.','journey'],['kausani','Kumaon','Valleys that fold into silence.','journey'],['devprayag','The Rivers','Where Ganga begins.','map']]],
  craft:['craft','03 / The Craft','Made by hand. Rooted in place.','Who made it? Where does it come from? What does it mean?',[['craft','Wool & Loom','Hand-woven by women of Munsiyari.','bazaar'],['p7','Aipan Art','Ritual patterns, painted in rice paste.','bazaar'],['aipanartisan','The Weaver','Meet the hands behind the thread.','people']]],
  journey:['journey','04 / The Journey','Curated experiences. Unforgettable journeys.','Curated journeys — homestays, treks, retreats, culture.',[['auli','Auli Getaway','3 Days · ₹9,999','dest'],['nandadevi','Nanda Devi Base Camp','7 Days · ₹21,999','dest'],['village','Village Homestay','2 Days · ₹3,999','dest'],['tungnath','Chopta Tungnath Trek','4 Days · ₹12,999','dest']]],
  people:['people','05 / The People','Real people. Real stories.','Farmers, artisans, cooks, guides and families across the ridges.',[['buranshtree','Maya Devi · Chamoli','Beekeeper of the high valleys.','stories'],['aipanartisan','Ramesh Singh · Almora','Third-generation weaver.','stories'],['chholiya','Lata Bisht · Pithoragarh','Keeper of village folk songs.','stories'],['terraces','Gopal Dutt · Uttarkashi','Heirloom apple & grain farmer.','stories']]],
  soul:['kedarnath','06 / The Soul','Traditions. Festivals. Heritage.','Calm, timeless, respected.',[['jageshwar','Temples & Shrines','Stone, silence and temple bells.','stories'],['badrinath','Pahadi Festivals','Harvest, music and the gods.','stories'],['laxmanjhula','Mountain Mythology','Stories older than the roads.','stories'],['devprayag','Sacred Rivers','Where the holy streams unite.','stories']]],
  stories:['village','Stories','The stories of the hills.','Hidden places, food, people, festivals.',[['mana','The Last Village of India','Mana, at the edge of the map.','about'],['honey','A Taste of Tradition','Honey from wild rhododendron.','bazaar'],['chholiya','Women of the Mountains','Hands that hold villages together.','people'],['binsar','Monsoon in Kumaon','When clouds sleep in pine forests.','land']]],
  about:['heaven','About Hillsonwheels','ONE LAND. MANY STORIES.','Hillsonwheels connects India with the land, culture, products, people and journeys of Uttarakhand.',[['kausani','The Hills','Where peaks guard ancient heritage.','land'],['chholiya','The People','Custodians of mountain knowledge.','people'],['taste','The Produce','Pure nectar, grains and wild herbs.','bazaar'],['tungnath','The Journeys','Paths off the standard itinerary.','journey'],['kedarnath','The Spirit','Timeless devotion and reverence.','soul']]],
  dest:['auli','Destination','Auli','Skiing, high alpine meadows, and mountain magic.',[['auli','Auli Getaway','3 Days · ₹9,999','custom'],['tungnath','Chopta Trek','4 Days · ₹12,999','custom'],['nandadevi','Nanda Devi Sanctuary','7 Days · ₹21,999','custom']]]
};

const FOOT=`<footer>
  <!-- 5-Column Structured E-Commerce Directory -->
  <div class="hsw-footer-directory">
    <!-- Col 1: Brand & Heritage -->
    <div class="hsw-footer-col">
      <div class="hsw-footer-brand-title">HILLSONWHEELS</div>
      <div class="hsw-footer-brand-sub">LAND · CULTURE · COMMUNITY</div>
      <p>Dedicated to safeguarding the sacred biodiversity, heirloom agricultural varieties, and living traditions of Uttarakhand.</p>
    </div>

    <!-- Col 2: Pahad Ki Bazaar -->
    <div class="hsw-footer-col">
      <h4>Pahad Ki Bazaar</h4>
      <ul class="hsw-footer-links">
        <li><a onclick="go('bazaar')">Wild Rhododendron Honey <span class="arrow">→</span></a></li>
        <li><a onclick="go('bazaar')">Organic Chamoli Rajma <span class="arrow">→</span></a></li>
        <li><a onclick="go('bazaar')">Himalayan Hemp Seed Oil <span class="arrow">→</span></a></li>
        <li><a onclick="go('bazaar')">Johar Handwoven Shawls <span class="arrow">→</span></a></li>
        <li><a onclick="go('bazaar')">Almora Ritual Aipan Art <span class="arrow">→</span></a></li>
        <li><a onclick="go('bazaar')">Pahadi Timur & Herbal Salt <span class="arrow">→</span></a></li>
        <li><a onclick="go('bazaar')" style="color:var(--gold);font-weight:600">Browse Full Harvest <span class="arrow">↗</span></a></li>
      </ul>
    </div>

    <!-- Col 3: Pahad Ki Sair -->
    <div class="hsw-footer-col">
      <h4>Pahad Ki Sair</h4>
      <ul class="hsw-footer-links">
        <li><a onclick="go('journey')">Nanda Devi Sanctuary Trek <span class="arrow">→</span></a></li>
        <li><a onclick="go('journey')">Chopta Tungnath Expedition <span class="arrow">→</span></a></li>
        <li><a onclick="go('journey')">Auli Alpine Ski Meadows <span class="arrow">→</span></a></li>
        <li><a onclick="go('journey')">Kumaon Heritage Homestays <span class="arrow">→</span></a></li>
        <li><a onclick="openPackingGuide()">Himalayan Packing Checklist <span class="arrow">→</span></a></li>
        <li><a onclick="go('map')">Interactive Uttarakhand Map <span class="arrow">→</span></a></li>
        <li><a onclick="go('stories')">Mountain Journal & Stories <span class="arrow">→</span></a></li>
      </ul>
    </div>

    <!-- Col 4: Care & Policies -->
    <div class="hsw-footer-col">
      <h4>Care & Policies</h4>
      <ul class="hsw-footer-links">
        <li><a onclick="go('orders')">Track Orders & Invoices <span class="arrow">→</span></a></li>
        <li><a onclick="go('footer-delivery')">Delivery & Shipping Terms <span class="arrow">→</span></a></li>
        <li><a onclick="go('footer-returns')">Return & Refund Policy <span class="arrow">→</span></a></li>
        <li><a onclick="go('footer-cancellation')">Cancellation Policy <span class="arrow">→</span></a></li>
        <li><a onclick="go('footer-billing')">Billing & Payment Terms <span class="arrow">→</span></a></li>
        <li><a onclick="go('footer-privacy')">Privacy & Data Security <span class="arrow">→</span></a></li>
        <li><a onclick="go('footer-terms')">Terms of Service <span class="arrow">→</span></a></li>
        <li><a onclick="go('footer-faq')">Frequently Asked Questions <span class="arrow">→</span></a></li>
      </ul>
    </div>

    <!-- Col 5: Hubs & Mountain Concierge -->
    <div class="hsw-footer-col">
      <h4>Contact & Hubs</h4>
      <p style="margin-bottom:8px">
        <span class="hsw-hub-badge">Haldwani Hub (Nainital):</span>
        53/A, Haridutt Vihar, Rampur Rd, Haldwani, UK 263139
      </p>
      <p style="margin-bottom:12px">
        <span class="hsw-hub-badge">Delhi Outreach:</span>
        C-49, Vishwakarma Colony, M.B. Rd, New Delhi 110047
      </p>
      <div>
        <a class="hsw-contact-link" href="mailto:howsmailbox@gmail.com">howsmailbox@gmail.com</a>
        <br>
        <a class="hsw-contact-link" href="tel:+918218359120">+91 8218359120</a>
      </div>
      <div class="hsw-concierge-card" style="padding:10px">
        <a class="hsw-concierge-btn" style="margin-top:0" href="https://wa.me/918218359120?text=Hello%20HillsOnWheels%2C%20I%20would%20like%20assistance%20with%20an%20order%20or%20journey." target="_blank" rel="noopener noreferrer">
          Chat with Us
        </a>
      </div>
    </div>
  </div>

  <!-- Bottom Bar: DIGITRASTUDIO Attribution & Copyright -->
  <div class="hsw-footer-bottom">
    <div class="hsw-digitra-credit">
      Bespoke Architecture by <a href="https://digitrastudio.online" target="_blank" rel="noopener noreferrer" class="hsw-digitra-link">DIGITRASTUDIO</a> &bull; Handcrafted by Yash Pathak
    </div>
    <div class="hsw-bottom-creds">
      <div>© 2024–2026 HillsOnWheels Pvt. Ltd. All rights reserved. &bull; 100% Custom Coded Platform (Zero WordPress / Templates).</div>
      <div class="hsw-devbhoomi-note">Handcrafted with reverence in Devbhoomi Uttarakhand · Empowering 140+ mountain farmer & craft collectives.</div>
    </div>
    <div class="hsw-social-group">
      <span style="font-size:10.5px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(234,229,216,0.6);margin-right:4px">Connect:</span>
      <a class="hsw-social-btn" href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" title="Instagram" aria-label="Instagram">IG</a>
      <a class="hsw-social-btn" href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" title="YouTube" aria-label="YouTube">YT</a>
      <a class="hsw-social-btn" href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" title="Facebook" aria-label="Facebook">FB</a>
    </div>
  </div>
</footer>`;

function copyCouponCode(btn, code){
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(code).then(()=>{
      if(btn){
        const orig = btn.innerText;
        btn.innerText = 'COPIED!';
        setTimeout(()=>{ btn.innerText = orig; }, 2000);
      }
    }).catch(()=>{});
  }
}

function handleFooterNewsletter(event, form){
  if(event)event.preventDefault();
  const input=form.querySelector('.hsw-newsletter-input');
  const email=(input?input.value:'').trim();
  const feedback=form.querySelector('.hsw-newsletter-msg')||document.getElementById('hsw-nl-feedback');
  if(!email||!email.includes('@')){
    if(feedback){
      feedback.className='hsw-newsletter-msg show';
      feedback.style.background='rgba(239, 68, 68, 0.15)';
      feedback.style.border='1px solid rgba(239, 68, 68, 0.4)';
      feedback.style.color='#fca5a5';
      feedback.textContent='Please enter a valid email address to unlock your discount.';
    }
    return false;
  }
  if(input)input.value='';
  if(feedback){
    feedback.className='hsw-newsletter-msg show';
    feedback.style.background='rgba(16, 185, 129, 0.15)';
    feedback.style.border='1px solid rgba(197, 168, 105, 0.5)';
    feedback.style.color='#f4ecd8';
    feedback.innerHTML='<strong style="color:var(--gold)">Welcome to The Mountain Circle!</strong> Use coupon code <strong style="color:#FAF7EE;background:rgba(197,168,105,0.25);padding:2px 8px;border-radius:3px;letter-spacing:0.06em">HIMALAYA10</strong> at checkout for 10% off. <button type="button" onclick="copyCouponCode(this, \'HIMALAYA10\')" style="background:var(--gold);color:#0E100D;border:none;padding:3px 9px;border-radius:2px;font-size:10px;font-weight:700;margin-left:8px;cursor:pointer">COPY CODE</button>';
  }
  return false;
}

const nav=()=>`<div class="nav">
  <div class="nav-brand" onclick="go('home')"><b>HILLSONWHEELS</b></div>
  <div class="nav-links">
    ${WORLDS.map(w=>`<span onclick="go('${w[0]=='taste'?'bazaar':w[0]}')">${w[1].replace('The ','')}</span>`).join('')}
    <span onclick="go('map')">MAP</span>
    <span onclick="go('stories')">STORIES</span>
    <button id="audio-btn" class="audio-toggle ${MountainAudio.mode!=='off'?'on':''}" onclick="MountainAudio.toggle()"><span class="audio-wave"><span></span><span></span><span></span></span> ${MountainAudio.mode==='off'?'Sound: Off':MountainAudio.mode.toUpperCase()}</button>
    <span onclick="openCartDrawer()" style="color:var(--gold);font-weight:600">BAG (${cart})</span>
    <span class="m" style="display:none" onclick="menu(1)">MENU</span>
    <span onclick="menu(1)">MENU</span>
  </div>
</div>`;

const card=(k,t,s,g)=>`<div class="card rv" onclick="go('${g||'home'}')"><div class="im"><i style="${U(k)}"></i></div><h3>${t}</h3><p>${s}</p></div>`;

const hero=(k,a,t,s,x='')=>`<div class="hero" style="${U(k)}"><div class="lab rv">${a}</div><h1 class="rv" style="margin:8px 0 12px">${t}</h1><p class="rv" style="margin-bottom:24px;max-width:560px;font-size:15px;line-height:1.75;opacity:.85">${s}</p>${x}</div>`;

const chips=(a,g)=>`<div class="chips">${a.map(c=>`<span class="chip ${sel[g]==c?'on':''}" onclick="sel['${g}']=sel['${g}']==='${c}'?'':'${c}';go(cur,1)">${c}</span>`).join('')}</div>`;

function menu(o){const m=$('#mn');m.innerHTML=o?`<div class="x lab" onclick="menu(0)">Close</div>`+MENU.map(x=>`<a onclick="menu(0);go('${x[0]}')">${x[1]}</a>`).join(''):m.innerHTML;m.classList.toggle('o',!!o)}

function P(p){
  if(p==='land'){
    const tab=sel.land_tab||'Garhwal';
    const landData={
      Garhwal:{num:'01 / 06',title:'Garhwal · Beyond the Road',desc:'Stone houses built above the clouds, terraced barley fields, and morning mist rising from the Alaknanda. Here, the landscape is not scenery; it is life itself.',cards:[['urgam','Garhwal Valleys','Stone hamlets overlooking terraced fields.','journey'],['nandadevi','Nanda Devi Ridge','Sanctuary of high peaks and silence.','dest'],['devprayag','Alaknanda & Bhagirathi','Where holy Himalayan headwaters merge.','map']]},
      Kumaon:{num:'02 / 06',title:'Kumaon · Valleys of Silence',desc:'Rolling oak and rhododendron forests opening to sweeping views of Trisul and Panchachuli. Old stone trails lead to quiet villages where time moves at the pace of birdsong.',cards:[['munsiyari','Johar Valley','Ancient trade routes to the high passes.','journey'],['almora','Almora Heritage','Aipan painted stone courtyards and shrines.','craft'],['terraces','Pahadi Farms','Heritage pulses and sun-ripened grains.','bazaar']]},
      Rivers:{num:'03 / 06',title:'The Sacred Himalayan Waters',desc:'Born from glacial tongues at Gaumukh and Satopanth, cutting through steep gorges to form the lifeblood of India.',cards:[['gangotri','Gangotri & Ganga','Sacred glacial headwaters.','map'],['laxmanjhula','Rishikesh Foothills','Where mountain rivers meet the plains.','dest'],['osla','Tons & Yamuna','Pristine pine valley riverways.','journey']]},
      Forests:{num:'04 / 06',title:'Oak, Pine & Rhododendron',desc:'From subtropical Sal forests of the Terai to dense Himalayan cedar and vibrant scarlet Buransh groves above 2,000 meters.',cards:[['deodar','Deodar Canopies','Centuries-old Himalayan cedar groves.','journey'],['buranshtree','Buransh Blooms','Wild nectar forests of Chamoli.','product'],['binsar','Pangot Woods','Birdsong in silent oak forests.','dest']]},
      Villages:{num:'05 / 06',title:'Hamlets Carved in Stone',desc:'Slate-roofed houses, carved deodar doorframes (Kholi), and warm mud-plastered hearths where mountain stories are passed down.',cards:[['mana','Mana Village','The last settlement on the mountain edge.','stories'],['village','Village Courtyards','Community life across high terraces.','people'],['aipanartisan','Loom Weavers','Traditions preserved by hand.','craft']]},
      Seasons:{num:'06 / 06',title:'The Six Himalayan Seasons',desc:'Winter snow blankets, scarlet spring Buransh blossoms, lush monsoon waterfalls, and crystalline autumn skies revealing 300 km of snow peaks.',cards:[['auli','Winter Snow','Powder snowfields across alpine slopes.','dest'],['valley','Spring Bloom','Harvest of wild rhododendron nectar.','bazaar'],['kausani','Autumn Clearness','Sharp mountain silhouettes at dawn.','journey']]}
    };
    const d=landData[tab]||landData['Garhwal'];
    return nav()+hero('heaven','01 / The Land','Where the mountains keep their stories.','Garhwal · Kumaon · rivers, forests, villages and seasons.',`<button class="btn on" onclick="go('map')">Explore Map</button>`)+
    `<div class="light"><div class="sidebar-layout">
      <div class="side-nav"><div class="lab" style="margin-bottom:14px">Territories</div>${['Garhwal','Kumaon','Rivers','Forests','Villages','Seasons'].map(c=>`<a class="${tab===c?'on':''}" onclick="sel.land_tab='${c}';go('land',1)">${c}</a>`).join('')}</div>
      <div class="rv"><div class="lab">${d.num} BEYOND THE ROAD - ${tab.toUpperCase()}</div><h2 style="margin:10px 0 16px">${d.title}</h2><p style="font-size:15px;line-height:1.85;opacity:.85;margin-bottom:28px">${d.desc}</p><div class="grid">${d.cards.map(c=>card(c[0],c[1],c[2],c[3])).join('')}</div></div>
    </div></div>`+FOOT;
  }

  if(p==='craft'){
    return nav()+hero('craft','03 / The Craft','Craft traditions, made visible.','Discover handloom work from Munsiyari and Aipan designs from Kumaon, alongside the makers and places behind them.',`<button class="btn on" onclick="go('bazaar')">Shop Handloom & Craft</button>`)+
    `<div class="light">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:32px;margin-bottom:50px">
        <div><div class="lab">01 / Origin</div><h3 style="margin:8px 0 10px">Who made it?</h3><p style="font-size:13px;line-height:1.75;opacity:.8">Generations of mountain weavers, ringal bamboo artisans, and village women who hold traditional knowledge.</p></div>
        <div><div class="lab">02 / Geography</div><h3 style="margin:8px 0 10px">Where does it come from?</h3><p style="font-size:13px;line-height:1.75;opacity:.8">High valleys of Munsiyari, stone streets of Almora, and river settlements across Chamoli and Pithoragarh.</p></div>
        <div><div class="lab">03 / Meaning</div><h3 style="margin:8px 0 10px">What does it mean?</h3><p style="font-size:13px;line-height:1.75;opacity:.8">Patterns, materials, and techniques vary by place and maker. Each object carries its own use and history.</p></div>
      </div>
      <div class="lab" style="margin-bottom:18px">Curated Craft Collections</div>
      <div class="grid">${ED.craft[4].map(c=>card(c[0],c[1],c[2],c[3])).join('')}</div>
    </div>`+FOOT;
  }

  if(p==='journey'){
    const tab=sel.j_tab||'All';
    const jList = LIVE_JOURNEYS.length > 0 ? LIVE_JOURNEYS.map(j => [
      j.photoKey || 'journey',
      j.title,
      j.subtitle || `${j.duration || '3 Days'} · ₹${Number(j.price||0).toLocaleString('en-IN')}`,
      'dest',
      j.category || 'Destinations',
      j.id
    ]) : [
      ['auli','Auli Getaway','3 Days · ₹9,999 · Alpine Meadows','dest','Destinations','auli-getaway'],
      ['tungnath','Chopta Tungnath Trek','4 Days · ₹12,999 · Highest Shiva Temple','dest','Treks','chopta-tungnath-trek'],
      ['nandadevi','Nanda Devi Base Camp','7 Days · ₹21,999 · High Altitude Expedition','dest','Treks','nanda-devi-base-camp'],
      ['village','Village Homestay Chamoli','2 Days · ₹3,999 · Cultural Immersion','dest','Homestays','village-homestay-chamoli'],
      ['munsiyari','Munsiyari Johar Route','5 Days · ₹15,999 · Panchachuli Views','dest','Destinations','munsiyari-johar-route'],
      ['rishikesh','Rishikesh Yoga & Ganga Retreat','4 Days · ₹11,499 · Spiritual Wellness','dest','Retreats','rishikesh-yoga-retreat'],
      ['roopkund','Roopkund Mystery Lake Trek','6 Days · ₹18,500 · Chamoli','dest','Treks','roopkund-mystery-lake-trek']
    ];
    const filtered=tab==='All'?jList:jList.filter(x=>x[4]===tab);
    return nav()+hero('journey','04 / The Journey','Take the slower road.','Plan a stay, a day walk, or a longer trek through the villages and high meadows of Uttarakhand.',`<button class="btn on" onclick="go('custom')">Plan Custom Journey</button>`)+
    `<div class="light">
      <div class="chips">${['All','Destinations','Homestays','Treks','Retreats'].map(c=>`<span class="chip ${tab===c?'on':''}" onclick="sel.j_tab='${c}';go('journey',1)">${c}</span>`).join('')}</div>
      <div class="grid">${filtered.map(c=>`
        <div class="card rv" onclick="openJourneyDetails('${c[5]||''}')" style="cursor:pointer">
          <div class="im" style="aspect-ratio:1.2"><i style="${U(c[0])}"></i></div>
          <div class="lab" style="margin-top:14px">${c[4]||'Expedition'}</div>
          <h3 style="font-size:20px;margin:4px 0">${c[1]}</h3>
          <p style="font-size:12px;opacity:.78;line-height:1.5">${c[2]}</p>
        </div>`).join('')}</div>
    </div>`+FOOT;
  }

  if(p==='dest'){
    const j = sel.activeJourney || {
      title: 'Auli', photoKey: 'auli', category: 'Garhwal',
      description: 'A high meadow above Joshimath, with seasonal snow and views toward Nanda Devi.',
      elevation: '2,500 – 3,050 m', season: 'Dec–Mar (Snow) · May–Oct (Alpine Green)',
      district: 'Chamoli · Garhwal Himalaya', duration: '3 Days', price: 9999,
      highlights: 'Alpine Meadow, Skiing, Ridge Treks'
    };
    return nav()+hero(j.photoKey||'auli',`${j.category||'Expedition'} · ${j.district||'Uttarakhand'}`,j.title,j.description,`<div style="display:flex;gap:12px;flex-wrap:wrap"><button class="btn on" onclick="sel.d='${j.title}';go('custom')">Plan this Journey</button><button class="btn" onclick="openPackingGuide('Winter')">Expedition Packing Guide</button></div>`)+
    `<div class="light">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:18px;margin-bottom:30px;border-bottom:1px solid #1a1b1814;padding-bottom:24px">
        <div><div class="lab">Elevation</div><p style="font-size:16px;font-weight:600;margin-top:4px">${j.elevation||'2,500 m'}</p></div>
        <div><div class="lab">Best Season</div><p style="font-size:16px;font-weight:600;margin-top:4px">${j.season||'All Year Round'}</p></div>
        <div><div class="lab">District / Valley</div><p style="font-size:16px;font-weight:600;margin-top:4px">${j.district||'Garhwal / Kumaon'}</p></div>
        <div><div class="lab">Expedition Fare</div><p style="font-size:16px;font-weight:600;margin-top:4px">${j.duration||'3 Days'} · ₹${Number(j.price||9999).toLocaleString('en-IN')}</p></div>
      </div>

      <!-- Interactive Trek Elevation & Waypoints Profile -->
      <div style="margin:30px 0;background:var(--ivory-card);padding:24px 28px;border:1px solid #1a1b1814;border-radius:4px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:12px">
          <div>
            <div class="lab">Trail Ascent Profile & Waypoints</div>
            <h3 style="margin:4px 0 0;font-size:24px">Joshimath to Kuari Pass Ridge</h3>
          </div>
          <button class="btn" style="padding:8px 16px;font-size:11px" onclick="openPackingGuide('Winter')">View Seasonal Checklist</button>
        </div>
        <div class="elevation-chart" style="height:140px;margin-bottom:16px">
          <svg viewBox="0 0 600 140" preserveAspectRatio="none" style="width:100%;height:100%">
            <defs>
              <linearGradient id="elev-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#C5A869" stop-opacity="0.4"/>
                <stop offset="100%" stop-color="#C5A869" stop-opacity="0.02"/>
              </linearGradient>
            </defs>
            <path d="M 30 115 Q 120 105 200 75 T 380 45 T 560 18 L 560 135 L 30 135 Z" fill="url(#elev-grad)"/>
            <path d="M 30 115 Q 120 105 200 75 T 380 45 T 560 18" fill="none" stroke="#C5A869" stroke-width="2.5"/>
            <circle cx="30" cy="115" r="4.5" fill="#C5A869"/>
            <circle cx="200" cy="75" r="4.5" fill="#C5A869"/>
            <circle cx="380" cy="45" r="4.5" fill="#C5A869"/>
            <circle cx="560" cy="18" r="4.5" fill="#C5A869"/>
            <text x="30" y="132" fill="#1A1B18" font-size="10" font-family="var(--sans)">Joshimath (1,890m)</text>
            <text x="200" y="95" fill="#1A1B18" font-size="10" font-family="var(--sans)" text-anchor="middle">Auli Meadow (2,500m)</text>
            <text x="380" y="36" fill="#1A1B18" font-size="10" font-family="var(--sans)" text-anchor="middle">Gorson Bugyal (3,050m)</text>
            <text x="560" y="14" fill="#1A1B18" font-size="10" font-family="var(--sans)" text-anchor="end">Kuari Pass Summit (3,650m)</text>
          </svg>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px">
          <div class="waypoint-badge"><span class="badge-num">01</span><div><b>Base Valley</b><div class="lab" style="font-size:10px">Joshimath · Ancient Cedar Trail</div></div></div>
          <div class="waypoint-badge"><span class="badge-num">02</span><div><b>Meadow Camp</b><div class="lab" style="font-size:10px">Auli Bugyal · Nanda Devi View</div></div></div>
          <div class="waypoint-badge"><span class="badge-num">03</span><div><b>High Ridge</b><div class="lab" style="font-size:10px">Gorson · Alpine Oak & Rhododendron</div></div></div>
          <div class="waypoint-badge"><span class="badge-num">04</span><div><b>Summit Pass</b><div class="lab" style="font-size:10px">Kuari Pass · 360° Great Himalaya</div></div></div>
        </div>
      </div>

      <div class="sidebar-layout">
        <div><div class="lab">Overview</div><h2 style="margin:10px 0 16px">About Auli</h2><p style="font-size:14px;line-height:1.85;opacity:.85">Auli is a high alpine meadow (Bugyal) situated above Joshimath in Chamoli district. Flanked by coniferous oak and deodar forests, it offers broad panoramic views of Himalayan peaks including Nanda Devi, Kamet, and Dunagiri.</p><br><button class="btn on" onclick="go('custom')">Book Curated Itinerary</button></div>
        <div><div class="lab" style="margin-bottom:14px">Nearby Explorations</div><div class="grid">${ED.dest[4].map(c=>card(c[0],c[1],c[2],c[3])).join('')}</div></div>
      </div>
    </div>`+FOOT;
  }

  if(p==='people'){
    return nav()+hero('people','05 / The People','People and everyday life.','Meet farmers, beekeepers, weavers, folk singers, and guides from communities across Garhwal and Kumaon.')+
    `<div class="light">
      <div class="grid">${ED.people[4].map(c=>card(c[0],c[1],c[2],c[3])).join('')}</div>
    </div>`+FOOT;
  }

  if(p==='soul'){
    return nav()+hero('soul','06 / The Soul','Faith and local traditions.','Learn about village shrines, seasonal festivals, local deities, and songs rooted in the mountain landscape.')+
    `<div class="light">
      <div class="grid">${ED.soul[4].map(c=>card(c[0],c[1],c[2],c[3])).join('')}</div>
    </div>`+FOOT;
  }

  if(p==='stories'){
    return nav()+hero('village','Stories from Uttarakhand','Life across the hills.','Notes on food, work, craft, festivals, and the places people call home.')+
    `<div class="light">
      <div class="grid">${ED.stories[4].map(c=>card(c[0],c[1],c[2],c[3])).join('')}</div>
    </div>`+FOOT;
  }

  if(p==='about'){
    return nav()+hero('about','About Hillsonwheels','ONE LAND. MANY STORIES.','Hillsonwheels is a cultural bridge connecting Uttarakhand’s land, culture, produce, artisans, and journeys with conscious travelers and patrons across India.')+
    `<div class="light">
      <div style="text-align:center;max-width:720px;margin:0 auto 50px">
        <div class="lab">Our Mountain Pillars</div>
        <h2 style="margin:12px 0 20px">Rooted in Place. Built for Community.</h2>
        <p style="font-size:15px;line-height:1.85;opacity:.85">We work directly with mountain beekeepers, organic grain cooperatives, handloom weavers, and homestay families across Garhwal and Kumaon to bring authentic Himalayan produce and curated journeys to life.</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:24px;text-align:center">
        ${ED.about[4].map((c,i)=>`<div><div class="circle-pillar">0${i+1}</div><h3>${c[1]}</h3><p style="font-size:12px;opacity:.75;margin-top:6px">${c[2]}</p></div>`).join('')}
      </div>
    </div>`+FOOT;
  }

  switch(p){
    case 'home':
      return nav()+hero('hero','The World of Uttarakhand','Uttarakhand, as it is lived.','A guide to the villages, landscapes, food, craft, and journeys of Garhwal and Kumaon.',`<button class="btn on" onclick="go('bazaar')">Explore Pahadi Bazaar</button>`)+
      `<div class="six">${WORLDS.map(w=>`<div style="${U(w[0]=='taste'?'taste':w[0])}" onclick="go('${w[0]=='taste'?'bazaar':w[0]}')"><span>${w[2]} / ${w[1].toUpperCase()}</span></div>`).join('')}</div>`+FOOT;

    case 'bazaar':{
      const cat=sel.cat||'All';
      const q=(sel.b_query||'').toLowerCase();
      const filtered=PROD.filter(x=>{
        const matchCat=(cat==='All'||x[4]===cat);
        const matchQ=(!q||x[0].toLowerCase().includes(q)||x[1].toLowerCase().includes(q)||x[4].toLowerCase().includes(q));
        return matchCat&&matchQ;
      });
      return nav()+hero('taste','02 / The Taste · Pahadi Bazaar','Food and craft from the hills.','Browse regional honey, pulses, spices, dried fruit, herbs, and handmade goods.')+
      `<div class="light">
        <div class="sidebar-layout">
          <div>
            <div class="lab" style="margin-bottom:12px">Categories</div>
            <div class="side-nav">
              ${['All','Honey','Pulses','Spices','Dry Fruits','Pickles','Herbs','Handicrafts'].map(c=>`<a class="${cat===c?'on':''}" onclick="sel.cat='${c}';go('bazaar',1)">${c}</a>`).join('')}
            </div>
            <div class="lab" style="margin:24px 0 12px">Search Catalog</div>
            <input placeholder="Search products…" value="${sel.b_query||''}" oninput="sel.b_query=this.value;go('bazaar',1)">
            <div style="margin-top:24px;padding:16px;background:var(--ivory-card);border:1px solid #1a1b1814;border-radius:4px">
              <div class="lab">Heritage Kitchens</div>
              <p style="font-size:12px;opacity:.8;margin:6px 0 12px">Browse recipes built around familiar ingredients from the region.</p>
              <button class="btn" style="padding:6px 12px;font-size:10.5px;width:100%" onclick="openRecipe('honey')">View Mountain Recipes</button>
            </div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px">
              <div><div class="lab">Pahadi Bazaar Catalog</div><h2 style="font-size:32px">From the hills, to your home.</h2></div>
              <div class="lab" style="opacity:.7">${filtered.length} mountain items</div>
            </div>
            <div class="grid">
              ${filtered.map(x=>`
                <div class="card rv" style="display:flex;flex-direction:column;justify-content:space-between">
                  <div onclick="openProductDetail('${x[6]||x[0]}')" style="cursor:pointer">
                    <div class="im" style="aspect-ratio:1"><i style="${U(x[3])}"></i></div>
                    <div class="lab" style="margin-top:14px">From ${x[1]}</div>
                    <h3 style="font-size:20px;margin:4px 0">${x[0]}</h3>
                    <p style="font-size:12px;opacity:.78;line-height:1.5">${x[5]}</p>
                  </div>
                  <div style="margin-top:14px;padding-top:10px;border-top:1px solid #1a1b1814">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
                      <span class="pr" style="font-size:16px;font-weight:600">₹ ${Number(x[2]||0).toLocaleString('en-IN')}</span>
                      <div style="display:flex;gap:6px">
                        <button class="btn" style="padding:5px 10px;font-size:10.5px;letter-spacing:.05em" onclick="event.stopPropagation();openProvenance('${x[3]}','${x[0]}','${x[1]}')">Trace Origin</button>
                        <button class="btn on" style="padding:5px 12px;font-size:10.5px" onclick="event.stopPropagation();handleAddToCart('${x[6]}','${x[7]||x[6]}',1)">+ Bag</button>
                      </div>
                    </div>
                  </div>
                </div>`).join('')}
            </div>
          </div>
        </div>
      </div>`+FOOT;
    }

    case 'product':{
      const prod = sel.activeProd || {
        name: 'Organic Buransh Honey', origin: 'Chamoli · 2,450m', unitPrice: 699, mrp: 850, photoKey: 'honey', category: 'Honey', weight: '250g',
        description: 'Wild rhododendron nectar from Chamoli, gathered in spring. Unheated, raw mountain honey filtered through muslin cloth.',
        sku: 'buransh-honey-250g', id: 'buransh-honey'
      };
      const w=sel.weight||prod.weight||prod.variant||'250g',q=sel.qty||1,pr=prod.unitPrice||699;
      const photo = prod.photoKey || 'honey';
      return nav()+`<div class="light">
        <div class="lab" style="margin-bottom:18px"><span style="cursor:pointer" onclick="go('bazaar')">Pahadi Bazaar</span> / <span>${prod.category||'Produce'}</span> / <span>${prod.name}</span></div>
        <div class="row" style="align-items:flex-start">
          <div class="rv" style="flex:1.1">
            <div class="pimg" style="${U(photo)};min-height:54vh"></div>
            <div style="display:flex;gap:12px;margin-top:14px">
              <div style="${U(photo)};width:70px;height:70px;background-size:cover;border:1px solid var(--tx-dark);cursor:pointer;border-radius:2px"></div>
              <div style="${U('land')};width:70px;height:70px;background-size:cover;opacity:.65;cursor:pointer;border-radius:2px" onclick="go('land')"></div>
              <div style="${U('village')};width:70px;height:70px;background-size:cover;opacity:.65;cursor:pointer;border-radius:2px" onclick="go('stories')"></div>
            </div>
          </div>
          <div class="rv" style="flex:1">
            <div class="lab">From Uttarakhand (${prod.origin||'Chamoli · 2,450m'})</div>
            <h1 style="font-size:clamp(32px,4vw,52px);margin:6px 0 12px">${prod.name}</h1>
            <p style="font-size:12.5px;letter-spacing:.15em;color:var(--terra);margin-bottom:14px">${prod.inStock ? `${prod.inStock} units in mountain inventory` : 'In stock · Small batch'}</p>
            <p style="margin:16px 0;line-height:1.85;font-size:14.5px;opacity:.88">${prod.description||'Pure high altitude harvest from Uttarakhand.'}</p>
            <div class="pr" style="font-size:32px;color:var(--tx-dark);margin:16px 0 8px">₹ ${Number(pr).toLocaleString('en-IN')}</div>
            <div class="lab" style="margin-top:12px">Pack / Size: ${w}</div>
            <div class="lab" style="display:inline-flex;align-items:center;gap:16px;user-select:none;margin:10px 0 24px"><span>QTY</span><span style="cursor:pointer;font-size:16px;font-weight:600;padding:2px 10px;border:1px solid currentColor;border-radius:4px" onclick="sel.qty=Math.max(1,(sel.qty||1)-1);go('product',1)">−</span><span style="font-size:15px;color:inherit;font-weight:600;min-width:18px;text-align:center">${q}</span><span style="cursor:pointer;font-size:16px;font-weight:600;padding:2px 10px;border:1px solid currentColor;border-radius:4px" onclick="sel.qty=(sel.qty||1)+1;go('product',1)">+</span></div><br>
            
            <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px">
              <button class="btn" style="padding:14px 28px" onclick="handleAddToCart('${prod.sku||'buransh-honey-250g'}', '${prod.id||'buransh-honey'}', ${q})">Add to bag</button>
              <button class="btn on" style="padding:14px 28px" onclick="handleAddToCart('${prod.sku||'buransh-honey-250g'}', '${prod.id||'buransh-honey'}', ${q});go('cart')">Buy now</button>
              <button class="btn" style="padding:14px 18px" onclick="openProvenance('${photo}','${prod.name}','${prod.origin}')">Trace Origin & Purity</button>
              <button class="btn" style="padding:14px 18px" onclick="openRecipe('honey')">Mountain Recipe</button>
            </div>

            <div style="display:flex;gap:24px;margin-top:20px;border-top:1px solid #1a1b1814;padding-top:20px;font-size:12px;opacity:.8;flex-wrap:wrap">
              <div>Raw mountain harvest</div>
              <div>${prod.origin||'Chamoli origin, 2,450 m'}</div>
              <div>Direct farmer/artisan sourcing</div>
            </div>
          </div>
        </div>
      </div>`+FOOT;
    }

    case 'custom':
      return nav()+hero('journey','Custom Itinerary Planner','Design Your Uttarakhand.','Personalized mountain journeys crafted around traditional homestays, trekking trails, and cultural retreats.')+
      `<div class="sec">
        <div class="lab">01 / Choose Mountain Destination</div>${chips(['Auli','Almora','Munsiyari','Rishikesh','Chopta','Mana Village'],'d')}
        <div class="lab" style="margin-top:24px">02 / Journey Style</div>${chips(['High Alpine Trek','Culture & Heritage','Forest Relaxation','Village Homestay','Spiritual Retreat'],'s')}
        <div class="lab" style="margin-top:24px">03 / Travelling As</div>${chips(['Solo Explorer','Couple','Family with Kids','Small Group of Friends'],'g')}
        <div class="lab" style="margin-top:24px">04 / Stay Preference</div>${chips(['Traditional Stone Homestay','Forest Wilderness Camp','Mountain Heritage Lodge','Riverside Retreat'],'a')}
        <br><br><button class="btn on" style="padding:16px 36px" onclick="submitTripRequest()">Create My Mountain Journey</button>
      </div>`+FOOT;

    case 'map':{
      const L=[['Almora',60,51],['Auli',43,27],['Munsiyari',76,24],['Mussoorie',24,51],['Rishikesh',27,65],['Nainital',69,67]];
      const a=sel.m||'Almora',d=PLACE_INFO[a];
      return nav()+`<div class="sec" style="padding-top:110px"><div class="lab">Interactive Map</div><h1 class="rv">Explore Uttarakhand through its places.</h1><div class="row" style="align-items:center;margin-top:20px"><div style="position:relative;width:100%;max-width:440px;min-width:260px;aspect-ratio:1.04;background:url('./Label-free%203D%20map.png') center/contain no-repeat">${L.map(l=>`<button aria-label="Learn about ${l[0]}" style="position:absolute;left:${l[1]}%;top:${l[2]}%;transform:translate(-50%,-50%);display:flex;align-items:center;gap:6px;padding:4px;border:0;background:#10110F99;color:#E9E3D5;font:12px var(--sans);white-space:nowrap;cursor:pointer" onclick="sel.m='${l[0]}';go('map',1)"><span style="color:#B59A63;font-size:${l[0]==a?18:13}px;line-height:1">●</span>${l[0]}</button>`).join('')}</div><div style="flex:1;min-width:280px"><div class="lab">${d.region}</div><h2 style="margin:8px 0 10px">${a}</h2><p style="font-size:14px;line-height:1.8;opacity:.82">${d.about}</p><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 24px;margin-top:22px">${[['Elevation',d.elevation],['Highlights',d.highlights],['Local character',d.character],['Best time',d.season]].map(x=>`<div style="padding-top:12px;border-top:1px solid #ffffff24"><div class="lab">${x[0]}</div><p style="margin-top:7px;font-size:13px;line-height:1.7;opacity:.78">${x[1]}</p></div>`).join('')}</div><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:22px"><button class="btn" onclick="go('bazaar')">Shop local products</button><button class="btn on" onclick="go('custom')">Plan a journey</button></div><div class="lab" style="margin-top:22px">Explore nearby</div><div style="display:flex;gap:18px;flex-wrap:wrap;margin-top:10px">${[['Taste','bazaar'],['Craft','craft'],['Journey','journey'],['Stories','stories']].map(x=>`<a style="color:var(--gold);font-size:12px;cursor:pointer" onclick="go('${x[1]}')">${x[0]} →</a>`).join('')}</div></div></div></div>`+FOOT;
    }

    case 'search':
      return nav()+`<div class="light" style="padding-top:120px"><div class="lab">Search the World of Uttarakhand</div><input id="q" placeholder="Search products, journeys, stories, places…" style="font-size:clamp(22px,3.5vw,36px);font-family:var(--serif);margin-top:10px" oninput="sr(this.value)"><div class="chips">${['Honey','Rajma','Auli','Munsiyari','Weave','Tungnath','Chamoli','Almora'].map(c=>`<span class="chip" onclick="$('#q').value='${c}';sr('${c}')">${c}</span>`).join('')}</div><div class="grid" id="sr" style="margin-top:30px"></div></div>`;

    case 'login':
      return nav()+`<main class="auth-page"><div class="auth-image" style="${U('login')}"></div><section class="auth-content">${window.AccountAuth ? window.AccountAuth.render() : ''}</section></main>`;

    case 'orders':case 'account':
      return nav() + (window.EcommerceStore ? `<div id="ecommerce-orders-mount"></div>` : `<div class="light" style="padding-top:120px;text-align:center"><h2>Patron Orders</h2></div>`) + FOOT;

    case 'cart':
      if (window.EcommerceStore && window.EcommerceStore.renderCartPage) {
        return nav() + window.EcommerceStore.renderCartPage() + FOOT;
      }
      return nav()+`<div class="light" style="padding-top:110px"><h1 style="font-size:42px;margin:10px 0 24px">Your Mountain Basket</h1><p>Loading basket…</p></div>`+FOOT;

    case 'checkout':
      if (window.EcommerceStore && window.EcommerceStore.renderCheckout) {
        return nav() + window.EcommerceStore.renderCheckout() + FOOT;
      }
      return nav()+`<div class="light" style="padding-top:110px"><h1 style="font-size:42px;margin:10px 0 24px">Checkout</h1><p>Loading checkout…</p></div>`+FOOT;

    case 'confirm':
      return nav()+hero('about','Order Confirmed','Thank you.','Your order is confirmed. You can follow its dispatch from your account.',`<button class="btn on" onclick="go('orders')">View My Orders & Track</button>`)+FOOT;

    case 'order-success':
      if (window.EcommerceStore && window.EcommerceStore.renderOrderSuccess && sel.orderId) {
        return nav() + window.EcommerceStore.renderOrderSuccess(sel.orderId, sel.orderNumber, sel.orderTracking, sel.orderTotal) + FOOT;
      }
      return nav()+hero('about','Order Received','Thank you.','Your order has been saved. Our team will follow up using your account contact details.',`<p class="lab">Reference ${Security.escapeHTML(sel.orderId||'')}</p><p style="margin:10px 0 22px">${sel.orderEmailSent?'The order team has been notified.':'Team email notifications are waiting for email service configuration.'}</p><button class="btn on" onclick="go('orders')">Track Mountain Order</button>`)+FOOT;
  }
}

function sr(v){
  const term=(v||'').toLowerCase();
  $('#sr').innerHTML=PROD.filter(x=>!term||(x[0]+x[1]+x[4]+x[5]).toLowerCase().includes(term)).map(x=>card(x[3],x[0],'From '+x[1]+' · ₹'+x[2]+'<br><span style="font-size:11px;opacity:.8">'+x[5]+'</span>','product')).join('');
}

async function render(p,still){
  cur=p;
  const a=$('#app');
  a.innerHTML=P(p);
  
  if (p === 'orders' || p === 'account') {
    const mount = document.getElementById('ecommerce-orders-mount');
    if (mount && window.EcommerceStore && window.EcommerceStore.renderOrdersDashboard) {
      mount.innerHTML = await window.EcommerceStore.renderOrdersDashboard();
      if (window._hswPostRender) window._hswPostRender(p);
    }
  }

  a.querySelectorAll('.rv').forEach((e,i)=>e.style.animationDelay=(.12+i*.08)+'s');
  if(!still)a.scrollTop=0;
  if(p==='search')sr($('#q')?$('#q').value:'');
  if (window._hswPostRender) window._hswPostRender(p);
}

function go(p, still, skipHistory){
  if(p==='confirm'&&!still&&cur==='checkout')return submitOrder();
  if(!skipHistory){
    const targetHash = '#' + p;
    if(location.hash !== targetHash){
      history.pushState({ page: p, sel: { ...sel } }, '', targetHash);
    }
  }
  if(still)return render(p,1);
  const c=$('#cu');
  if($('#cl')) $('#cl').textContent=p.toUpperCase();
  if($('#cl-sub') && window.PROVERBS && PROVERBS.length){
    const prv = PROVERBS[Math.floor(Math.random()*PROVERBS.length)];
    $('#cl-sub').textContent = `"${prv.quote}" — ${prv.meaning}`;
  }
  if(c){
    c.className='curtain in';
    setTimeout(()=>{render(p);c.className='curtain out'},400);
  }else{
    render(p);
  }
}

// Seamless Browser Back & Forward Navigation (User Request #7)
window.addEventListener('popstate', (e) => {
  let targetPage = 'open';
  if(e.state && e.state.page){
    targetPage = e.state.page;
    if(e.state.sel) Object.assign(sel, e.state.sel);
  }else if(location.hash){
    targetPage = location.hash.replace(/^#/, '').split('?')[0] || 'open';
  }
  go(targetPage, true, true);
});

async function submitOrder(){
  const address=$('#order-address');
  if(!address||!address.value.trim()){
    if(address)address.reportValidity();
    return;
  }
  sessionStorage.setItem('hsw-order-address',address.value.trim());
  const payment=sel.pay||'Cash on Delivery (COD)';
  const paymentMethod=payment.startsWith('UPI')?'UPI':payment.startsWith('Credit')?'card':payment.startsWith('Net')?'netbanking':'cod';
  try{
    const sku=sel.weight==='500g'?'buransh-honey-500g':'buransh-honey-250g';
    const userToken = localStorage.getItem('hsw_user_token') || '';
    const authHeader = userToken ? { 'Authorization': `Bearer ${userToken}` } : {};

    const response=await fetch('/api/orders',{
      method:'POST',
      credentials:'same-origin',
      headers:{ 'Content-Type':'application/json', ...authHeader },
      body:JSON.stringify({items:[{sku,quantity:Math.max(cart,1)}],address:address.value.trim(),paymentMethod})
    });
    const result=await response.json();
    if(!response.ok)throw new Error(result.error||'Could not place the order.');
    sessionStorage.removeItem('hsw-order-address');
    sel.orderId=result.orderNumber || result.orderId;
    sel.orderEmailSent=result.notificationSent;

    // For online transactions (UPI, Card, Netbanking), initiate Razorpay
    if(['UPI', 'card', 'netbanking'].includes(paymentMethod) && typeof window.Razorpay === 'function'){
      const rzpRes = await fetch('/api/create-order', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          amount: result.total,
          receipt: result.orderNumber,
          notes: { hswOrderNumber: result.orderNumber }
        })
      });
      const rzpData = await rzpRes.json();
      if(rzpRes.ok && (rzpData.order_id || rzpData.id)){
        const rzp = new window.Razorpay({
          key: rzpData.keyId,
          amount: rzpData.amount,
          currency: 'INR',
          name: 'HILLSONWHEELS',
          description: `Uttarakhand Harvest Order ${result.orderNumber}`,
          order_id: rzpData.order_id || rzpData.id,
          handler: async function(resp){
            try {
              await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeader },
                body: JSON.stringify({
                  razorpay_order_id: resp.razorpay_order_id,
                  razorpay_payment_id: resp.razorpay_payment_id,
                  razorpay_signature: resp.razorpay_signature,
                  hswOrderId: result.orderNumber
                })
              });
            } catch (_) {}
            go('order-success');
          }
        });
        rzp.open();
        return;
      }
    }

    go('order-success');
  }catch(error){
    openModal(`<div class="lab">Order could not be placed</div><p style="margin:12px 0 20px">${Security.escapeHTML(error.message)}</p><button class="btn on" onclick="closeModal()">Close</button>`);
  }
}

async function submitTripRequest(){
  const trip={destination:sel.d,journeyStyle:sel.s,travelers:sel.g,stayPreference:sel.a};
  if(Object.values(trip).some(value=>!value)){
    openModal('<div class="lab">Complete your itinerary</div><p style="margin:12px 0 20px">Choose a destination, journey style, group and stay preference first.</p><button class="btn on" onclick="closeModal()">Continue planning</button>');
    return;
  }
  try{
    const response=await fetch('/api/trips',{
      method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(trip)
    });
    const result=await response.json();
    if(response.status===401){sessionStorage.setItem('hsw-auth-return','custom');go('login');return;}
    if(!response.ok)throw new Error(result.error||'Could not submit the trip request.');
    sel.tripRequestId=result.requestId;
    openModal(`<div class="lab">Journey request received</div><h2 style="margin:8px 0 12px">The hills are calling.</h2><p style="margin-bottom:8px">Your request ${Security.escapeHTML(result.requestId)} has been saved. We’ll use your account contact details to follow up.</p><p style="margin-bottom:20px">${result.notificationSent?'Our journey team has been notified.':'Team email notifications are waiting for email service configuration.'}</p><button class="btn on" onclick="closeModal();go('home')">Return to the hills</button>`);
  }catch(error){
    openModal(`<div class="lab">Request could not be submitted</div><p style="margin:12px 0 20px">${Security.escapeHTML(error.message)}</p><button class="btn on" onclick="closeModal()">Close</button>`);
  }
}

function open_(){
  cur='open';
  $('#app').innerHTML=`<div style="min-height:100svh;display:grid;place-items:center;text-align:center;position:relative"><div style="width:min(80vw,520px);position:relative;display:grid;place-items:center"><svg viewBox="0 0 400 200" style="width:100%;display:block"><path id="mt" d="M10 170L90 110 140 130 200 40 250 100 290 80 390 170" fill="none" stroke="#C5A869" stroke-width="1.2" stroke-dasharray="700" stroke-dashoffset="700" style="animation:dr 5s ease forwards"/></svg><div class="dot" style="position:absolute;top:44%;left:50%"></div><div style="position:absolute;inset:0;display:grid;place-items:center"><button class="btn on" id="en" style="opacity:0;animation:up 1.8s 2.4s forwards">Discover</button></div></div></div><style>@keyframes dr{to{stroke-dashoffset:0}}
/* ========== LUXURY $50M AESTHETICS & INTERACTIVE MOTION ========== */
#scroll-progress {
  position: fixed; top: 0; left: 0; height: 3px;
  background: linear-gradient(90deg, var(--gold) 0%, var(--gold-light) 50%, var(--terra) 100%);
  z-index: 99999; width: 0%; transition: width 0.1s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 0 0 12px rgba(197, 168, 105, 0.7);
}

.hero {
  position: relative; overflow: hidden;
}
.hero h1 {
  background: linear-gradient(180deg, #FFFFFF 0%, #E9E3D5 60%, rgba(197, 168, 105, 0.85) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 4px 24px rgba(0,0,0,0.7));
}
.card {
  perspective: 1000px;
  transform-style: preserve-3d;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
}
.card:hover {
  transform: translateY(-8px) scale(1.015);
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.6), 0 0 0 1px rgba(197, 168, 105, 0.35);
}
.card .im {
  position: relative; overflow: hidden;
}
.card .im::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%);
  background-size: 250% 250%; opacity: 0; transition: opacity 0.4s ease;
  pointer-events: none;
}
.card:hover .im::after {
  opacity: 1; animation: cardShimmer 1.8s infinite ease-in-out;
}
@keyframes cardShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.six div {
  position: relative; overflow: hidden;
  transition: flex 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.4s ease;
}
.six div:hover {
  flex: 1.8; filter: brightness(1.1);
}
.six div span {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), letter-spacing 0.4s ease, color 0.4s ease;
}
.six div:hover span {
  transform: translateY(-4px); letter-spacing: 0.36em; color: var(--gold-light);
  text-shadow: 0 2px 12px rgba(0,0,0,0.8);
}
.nav {
  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  background: rgba(13, 14, 12, 0.75); border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.nav-brand b {
  background: linear-gradient(90deg, var(--gold) 0%, #FFF 50%, var(--gold) 100%);
  background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  animation: brandShimmer 6s linear infinite;
}
@keyframes brandShimmer {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}
.btn {
  position: relative; overflow: hidden; transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.btn::before {
  content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(197, 168, 105, 0.25), transparent);
  transition: left 0.6s ease; pointer-events: none;
}
.btn:hover::before {
  left: 100%;
}
.btn.on {
  box-shadow: 0 4px 20px rgba(197, 168, 105, 0.25);
}
.btn.on:hover {
  box-shadow: 0 6px 28px rgba(197, 168, 105, 0.45);
  transform: translateY(-2px);
}
.chip {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.chip:hover {
  border-color: var(--gold); color: var(--gold); transform: translateY(-2px);
}
</style>`;
  $('#en').onclick=reveal;
}

function reveal(){
  const w=['forests','rivers','villages','food','craft','people','temples','roads','journeys'];
  $('#app').innerHTML=`<div style="height:100%;display:grid;place-items:center;text-align:center"><div><div class="lab" id="w" style="height:20px;margin-bottom:36px;letter-spacing:.32em"></div><div style="display:flex;align-items:center;justify-content:center;gap:12px"><h1 class="rv" style="letter-spacing:.32em;font-size:clamp(28px,6vw,76px);animation-delay:2.8s;display:inline-block">HILLSONWHEELS</h1></div><p class="lab rv" style="margin:16px 0 40px;letter-spacing:.35em;animation-delay:3.5s">The world of Uttarakhand</p><button class="btn on rv" style="animation-delay:4.2s" onclick="go('home')">Enter</button></div></div>`;
  let i=0;
  const t=setInterval(()=>{
    if(i>=w.length)return clearInterval(t);
    $('#w').textContent=w[i++];
  },300);
}

// Sync live catalog and journeys from server on boot
syncLiveCatalog();
syncLiveJourneys();

// Check if user entered via a direct hash URL or browser navigation
if (location.hash && location.hash !== '#open') {
  const initTarget = location.hash.replace(/^#/, '').split('?')[0];
  if (initTarget) {
    go(initTarget, true, true);
  } else {
    open_();
  }
} else {
  open_();
}
