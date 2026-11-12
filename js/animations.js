/* ==========================================================================
   M&D — animations.js
   Every GSAP timeline lives here. main.js decides *when* they run.
   Exposes window.MD.animations; if GSAP failed to load, `available` is false
   and main.js falls back to plain CSS states.
   ========================================================================== */
(function () {
  'use strict';

  var MD = (window.MD = window.MD || {});
  var gsap = window.gsap;
  var available = typeof gsap !== 'undefined';
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (available && window.ScrollTrigger) {
    gsap.registerPlugin(window.ScrollTrigger);
  }

  /* ---------- Hero intro ---------------------------------------------------
     Initial states are set immediately (the preloader is covering the page),
     so there is no flash of un-animated content when the curtain lifts. */
  function prepareHero() {
    if (!available || reducedMotion) return;
    gsap.set('.hero__title .line__inner', { yPercent: 115 });
    gsap.set('[data-hero-fade]', { autoAlpha: 0, y: 24 });
    gsap.set('#nav', { autoAlpha: 0, y: -16 });
  }

  function heroIntro() {
    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    if (reducedMotion) return tl;

    tl.to('.hero__title .line__inner', { yPercent: 0, duration: 1.2, stagger: 0.12 })
      .to('[data-hero-fade]', { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.25)
      .to('#nav', { autoAlpha: 1, y: 0, duration: 0.8, clearProps: 'transform' }, 0.35);
    return tl;
  }

  /* ---------- Preloader ----------------------------------------------------
     0.00–1.50s  monogram stroke-draw (ring + M, &, D overlap inside 1.5s)
     then        short hold → curtain slides up → hero intro overlaps the exit */
  var DRAW = 1.5;

  function preloader(onComplete) {
    var el = document.getElementById('preloader');
    var done = function () {
      if (el && el.parentNode) el.parentNode.removeChild(el);
      if (typeof onComplete === 'function') onComplete();
    };

    if (!el) {
      done();
      return null;
    }

    // The CSS failsafe is only for a page whose scripts never ran.
    el.style.animation = 'none';

    var ring = el.querySelector('.monogram__ring');
    var letters = el.querySelectorAll('.monogram__letter');
    var amp = el.querySelector('.monogram__amp');
    var caption = el.querySelector('.preloader__caption');

    if (reducedMotion) {
      gsap.set([ring, letters, amp], { strokeDashoffset: 0 });
      gsap.set(caption, { opacity: 1 });
      return gsap.to(el, { autoAlpha: 0, duration: 0.3, delay: 0.5, ease: 'none', onComplete: done });
    }

    var tl = gsap.timeline();

    // — draw: exactly DRAW seconds end to end
    tl.to(ring, { strokeDashoffset: 0, duration: DRAW, ease: 'power2.inOut' }, 0)
      .to(letters[0], { strokeDashoffset: 0, duration: 0.95, ease: 'power2.inOut' }, 0.1)
      .to(amp, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, 0.4)
      .to(letters[1], { strokeDashoffset: 0, duration: 0.95, ease: 'power2.inOut' }, 0.55)
      .to(caption, { opacity: 1, duration: 0.6, ease: 'power1.out' }, 0.9);

    // — exit
    tl.addLabel('exit', DRAW + 0.3)
      .to(el.querySelector('.preloader__inner'), { autoAlpha: 0, y: -24, duration: 0.5, ease: 'power2.in' }, 'exit')
      .to(el, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, 'exit+=0.2')
      .add(heroIntro(), 'exit+=0.65')
      .add(done, 'exit+=1.1');

    return tl;
  }

  /* ---------- Mobile menu --------------------------------------------------
     One paused timeline: play() to open, reverse() to close. */
  function menu(el) {
    var links = el.querySelectorAll('.menu__link-inner');
    var footer = el.querySelector('.menu__footer');

    if (reducedMotion) {
      return gsap.timeline({ paused: true }).fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'none' });
    }

    gsap.set(el, { clipPath: 'inset(0% 0% 100% 0%)' });
    gsap.set(links, { yPercent: 120 });
    gsap.set(footer, { autoAlpha: 0, y: 24 });

    return gsap.timeline({ paused: true })
      .to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'expo.inOut' }, 0)
      .to(links, { yPercent: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06 }, 0.3)
      .to(footer, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out' }, 0.5);
  }

  MD.animations = {
    available: available,
    reducedMotion: reducedMotion,
    prepareHero: prepareHero,
    preloader: preloader,
    menu: menu
  };
})();
