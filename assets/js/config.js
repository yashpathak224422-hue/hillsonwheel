/**
 * HILLSONWHEELS - CONFIGURATION & PHOTO REGISTRY
 * Curated authentic, glorifying photography of Uttarakhand & the Himalayas.
 */
(function(window) {
  'use strict';

  const Config = {
    brand: 'HILLSONWHEELS',
    tagline: 'The World of Uttarakhand',
    year: 2026,
    version: '2.4.0',

    // Authentic High-Resolution Photography
    photos: {
      hero: './assets/images/local/hero-banner.png',
      land: './assets/images/places/kausani-panorama.jpg',
      taste: './assets/images/local/taste-banner.png',
      craft: './assets/images/local/craft-banner.png',
      journey: './assets/images/places/chopta-tungnath.jpg',
      people: './assets/images/local/people-banner.png',
      soul: './assets/images/places/kedarnath-temple.jpg',
      village: './assets/images/places/village-homestay.jpg',
      valley: './assets/images/places/valley-of-flowers.jpg',
      auli: './assets/images/places/auli-getaway.jpg',
      river: './assets/images/places/devprayag-sangam.jpg',
      about: './assets/images/places/kumaon-panorama.jpg',
      login: './assets/images/local/hero-banner.png',
      honey: './assets/images/products/buransh-honey.jpg',
      map: './assets/images/maps/uttarakhand-3d-map.png',
      p0: './assets/images/products/chamoli-rajma.jpg',
      p1: './assets/images/products/buransh-honey.jpg',
      p2: './assets/images/products/pahadi-pulses.jpg',
      p3: './assets/images/products/mixed-spices.jpg',
      p4: './assets/images/products/garhwal-walnuts.jpg',
      p5: './assets/images/products/chilli-pickle.jpg',
      p6: './assets/images/products/himalayan-herbs.jpg',
      p7: './assets/images/products/aipan-weave.jpg',
      p8: './assets/images/products/dry-apricot.jpg',
      p9: './assets/images/products/wild-timur.jpg',
      'buransh-honey': './assets/images/products/buransh-honey.jpg',
      'chamoli-rajma': './assets/images/products/chamoli-rajma.jpg',
      'pahadi-pulses': './assets/images/products/pahadi-pulses.jpg',
      'mixed-spices': './assets/images/products/mixed-spices.jpg',
      'garhwal-walnuts': './assets/images/products/garhwal-walnuts.jpg',
      'chilli-pickle': './assets/images/products/chilli-pickle.jpg',
      'himalayan-herbs': './assets/images/products/himalayan-herbs.jpg',
      'aipan-weave': './assets/images/products/aipan-weave.jpg',
      'dry-apricot': './assets/images/products/dry-apricot.jpg',
      'wild-timur': './assets/images/products/wild-timur.jpg',

      // Places & Landscapes (Unique, Authenticated, Zero Repetition)
      heaven: './assets/images/places/heaven-redefined.jpg',
      kausani: './assets/images/places/kausani-panorama.jpg',
      devprayag: './assets/images/places/devprayag-sangam.jpg',
      mana: './assets/images/places/mana-village.jpg',
      jageshwar: './assets/images/places/jageshwar-dham.jpg',
      kedarnath: './assets/images/places/kedarnath-temple.jpg',
      badrinath: './assets/images/places/badrinath-temple.jpg',
      nainital: './assets/images/places/nainital-lake.jpg',
      mussoorie: './assets/images/places/mussoorie-ridge.jpg',
      laxmanjhula: './assets/images/places/laxman-jhula.jpg',
      gangotri: './assets/images/places/gangotri-bhagirathi.jpg',
      bednibugyal: './assets/images/places/bedni-bugyal.jpg',
      terraces: './assets/images/places/terrace-fields.jpg',
      deodar: './assets/images/places/deodar-canopy.jpg',
      buranshtree: './assets/images/places/buransh-bloom.jpg',
      chholiya: './assets/images/places/chholiya-dance.jpg',
      aipanartisan: './assets/images/places/aipan-artisan.jpg',
      binsar: './assets/images/places/binsar-oak.jpg',
      almora: './assets/images/places/almora-kasar.jpg',
      osla: './assets/images/places/osla-timber-village.jpg',
      urgam: './assets/images/places/urgam-valley-peaks.jpg',
      tungnath: './assets/images/places/chopta-tungnath.jpg',
      nandadevi: './assets/images/places/nanda-devi.jpg',
      munsiyari: './assets/images/places/munsiyari-panchachuli.jpg',
      rishikesh: './assets/images/places/rishikesh-ganga-aarti.jpg',
      roopkund: './assets/images/places/roopkund-lake.jpg',
      panchachuli: './assets/images/places/munsiyari-panchachuli.jpg',
      kumaon: './assets/images/places/kumaon-panorama.jpg',
      solar: './assets/images/places/solar-renewable-energy.jpg',
      water: './assets/images/places/pure-drinking-water.jpg',
      circular: './assets/images/places/circular-economy.jpg',
      green: './assets/images/places/green-living.jpg',
      'renewable-energy': './assets/images/places/solar-renewable-energy.jpg',
      'water-solutions': './assets/images/places/pure-drinking-water.jpg',
      'circular-economy': './assets/images/places/circular-economy.jpg',
      'green-living': './assets/images/places/green-living.jpg'
    }
  };

  window.Config = Object.freeze(Config);
  window.PHOTO = Object.assign({}, Config.photos, window.PHOTO || {});
  window.IM = window.PHOTO;
})(window);
