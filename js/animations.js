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

  if (available && window.ScrollTrigger) {
    // Address-bar show/hide on phones resizes 100dvh; don't re-measure on every one.
    window.ScrollTrigger.config({ ignoreMobileResize: true });
  }

  /* ---------- Hero ---------------------------------------------------------
     Initial states are set immediately (the preloader is covering the page),
     so there is no flash of un-animated content when the curtain lifts. */
  function prepareHero() {
    if (!available || reducedMotion) return;
    gsap.set('[data-hero-fade]', { autoAlpha: 0, y: 32 });
    gsap.set('#nav', { autoAlpha: 0, y: -16 });
    var logo = document.querySelector('.hero [data-logo]');
    if (logo) resetLogo(logo);
  }

  // Pen draws the logo while the copy fades up around it: eyebrow → logo
  // (stroke → ink → wordmark) → subhead → CTA → scroll hint.
  function heroIntro() {
    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    if (reducedMotion) return tl;

    var logo = document.querySelector('.hero [data-logo]');
    tl.to('[data-hero-fade]', { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.14 })
      .to('#nav', { autoAlpha: 1, y: 0, duration: 0.8, clearProps: 'transform' }, 0.3);
    if (logo) tl.add(drawLogo(logo, { draw: 1.6 }), 0.05);
    return tl;
  }

  // Slow "breathing" scale on the hero image; sleeps while the hero is off-screen.
  function heroBreathing() {
    var img = document.querySelector('.hero__img');
    if (!img || reducedMotion) return;

    var breathe = gsap.fromTo(img,
      { scale: 1 },
      { scale: 1.07, duration: 9, ease: 'sine.inOut', repeat: -1, yoyo: true });

    if (window.ScrollTrigger) {
      window.ScrollTrigger.create({
        trigger: '.hero',
        start: 'top bottom',
        end: 'bottom top',
        onToggle: function (self) {
          if (self.isActive) breathe.play(); else breathe.pause();
        }
      });
    }
  }

  /* ---------- Scroll reveals -----------------------------------------------
     Every [data-reveal] fades up as it enters. batch() groups elements that
     cross the line together, so a desktop row staggers left→right while a
     mobile stack reveals one by one as you scroll. */
  function scrollReveals() {
    if (reducedMotion || !window.ScrollTrigger) return;

    gsap.set('[data-reveal]', { autoAlpha: 0, y: 40 });

    window.ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%',
      once: true,
      onEnter: function (batch) {
        // A jump (anchor link, restored scroll position) can enter dozens of
        // elements at once. Whatever is already above the viewport just
        // appears; only what's on screen takes part in the stagger.
        var onScreen = [];
        batch.forEach(function (el) {
          if (el.getBoundingClientRect().bottom < 0) gsap.set(el, { autoAlpha: 1, y: 0 });
          else onScreen.push(el);
        });

        gsap.to(onScreen, {
          autoAlpha: 1,
          y: 0,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.12,
          overwrite: true
        });
      }
    });

    // Gentle drift of an image inside its frame while it crosses the viewport
    gsap.utils.toArray('[data-parallax]').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -5 }, {
        yPercent: 5,
        ease: 'none',
        scrollTrigger: {
          trigger: img.parentNode,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  }

  /* ---------- Visit timeline -----------------------------------------------
     The gold rail is an SVG path with pathLength="1", scrubbed by scroll.
     Mobile draws the vertical rail, desktop the horizontal one; a step's dot
     lights up once the tip of the line has passed it. */
  function visitTimeline() {
    var timeline = document.querySelector('.visit__timeline');
    if (!timeline) return;

    var list = timeline.querySelector('.visit__steps');
    var steps = gsap.utils.toArray('.step', timeline);

    if (reducedMotion || !window.ScrollTrigger) {
      steps.forEach(function (step) { step.classList.add('is-active'); });
      return;
    }

    gsap.matchMedia().add({
      mobile: '(max-width: 63.999rem)',
      desktop: '(min-width: 64rem)'
    }, function (context) {
      var desktop = context.conditions.desktop;
      var path = timeline.querySelector((desktop ? '.visit__line--h' : '.visit__line--v') + ' .visit__progress');

      function lightDots(progress) {
        steps.forEach(function (step) {
          var at = desktop
            ? step.offsetLeft / list.offsetWidth
            : step.offsetTop / list.offsetHeight;
          step.classList.toggle('is-active', progress > at + 0.01);
        });
      }

      gsap.fromTo(path, { strokeDashoffset: 1 }, {
        strokeDashoffset: 0,
        ease: 'none',
        autoRound: false,                          // fractional offsets, or the line snaps on
        scrollTrigger: {
          trigger: list,
          start: desktop ? 'top 78%' : 'top 62%',
          end: desktop ? 'top 34%' : 'bottom 62%',
          scrub: 0.5,
          onUpdate: function (self) { lightDots(self.progress); },
          onRefresh: function (self) { lightDots(self.progress); }
        }
      });
    });
  }

  /* ---------- Lightbox slide -----------------------------------------------
     Current photo leaves in the swipe direction, `swap` changes the source,
     the next one arrives from the opposite side. dir: 1 = next, -1 = prev. */
  var slideTl = null;

  function lightboxSlide(img, dir, swap) {
    if (slideTl) slideTl.progress(1);              // finish an in-flight slide first

    if (reducedMotion) {
      swap();
      gsap.set(img, { x: 0, autoAlpha: 1 });
      return;
    }

    slideTl = gsap.timeline({ onComplete: function () { slideTl = null; } })
      .to(img, { x: -dir * 120, autoAlpha: 0, duration: 0.22, ease: 'power2.in' })
      .add(swap)
      .fromTo(img,
        { x: dir * 120, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: 0.5, ease: 'expo.out', immediateRender: false });
  }

  // Finger-follow while dragging, and the snap back when a swipe is abandoned.
  // Reduced motion: the photo stays put under the finger; the swipe still navigates.
  function lightboxDrag(img, x) {
    if (slideTl || reducedMotion) return;
    gsap.set(img, { x: x, autoAlpha: 1 - Math.min(Math.abs(x) / 600, 0.4) });
  }

  function lightboxReset(img, instant) {
    if (slideTl) { slideTl.progress(1); }
    gsap.to(img, { x: 0, autoAlpha: 1, duration: instant || reducedMotion ? 0 : 0.4, ease: 'expo.out', overwrite: true });
  }

  /* ---------- Calligraphy logo ----------------------------------------------
     Markup contract (index.html, preloader + hero):
       <div data-logo>
         <svg> <path class="logo-path" d="…"/> … </svg>   (any number of paths)
         <span data-logo-wordmark>Beauty Salon</span>
       </div>
     Paths draw one after another in DOM order, each for a time proportional
     to its real length, so the "pen" keeps a constant speed: swirls take
     longer than short strokes. pathLength="1" is set here, so the dash maths
     is 0–1 (100% → 0%) whatever the path. Then the ink fills in, the outline
     fades, and the wordmark arrives.

     Placeholder paths carry data-placeholder: they're open strokes, so they
     skip the fill step (filling an open curve would draw a blob). Real logo
     outlines are closed shapes and get the full stroke → fill sequence. */
  // Every <path class="logo-path"> inside this logo, in DOM order — that order
  // is the drawing sequence (e.g. swirl → M → D). Scoped to the container so
  // the preloader and hero copies animate independently.
  function logoPaths(logo) {
    return gsap.utils.toArray('.logo-path', logo);
  }

  function resetLogo(logo) {
    var paths = logoPaths(logo);
    paths.forEach(function (p) { p.setAttribute('pathLength', '1'); });
    gsap.set(paths, { strokeDasharray: '1 2', strokeDashoffset: 1, fillOpacity: 0, strokeOpacity: 1 });
    gsap.set(logo.querySelectorAll('[data-logo-wordmark]'), { autoAlpha: 0, y: 10 });
  }

  function drawLogo(logo, opts) {
    var total = (opts && opts.draw) || 1.5;      // seconds for the whole pen stroke
    var paths = logoPaths(logo);
    var wordmark = logo.querySelectorAll('[data-logo-wordmark]');
    var lengths = paths.map(function (p) {
      try { return p.getTotalLength() || 1; } catch (e) { return 1; }
    });
    var sum = lengths.reduce(function (a, b) { return a + b; }, 0) || 1;
    var filled = paths.filter(function (p) { return !p.hasAttribute('data-placeholder'); });

    var tl = gsap.timeline({ defaults: { autoRound: false } });
    var at = 0;
    paths.forEach(function (p, i) {
      var d = Math.max(0.12, total * lengths[i] / sum);
      // the first stroke enters slowly from the edge; the rest flow on, overlapping slightly
      tl.to(p, { strokeDashoffset: 0, duration: d, ease: i === 0 ? 'sine.in' : 'sine.inOut' }, at);
      at += d * 0.92;
    });

    tl.addLabel('ink', '>-0.1');
    if (filled.length) {
      tl.to(filled, { fillOpacity: 1, duration: 0.6, ease: 'power1.out' }, 'ink')
        .to(filled, { strokeOpacity: 0, duration: 0.6, ease: 'power1.out' }, 'ink+=0.2');
    }
    tl.fromTo(wordmark,
      { autoAlpha: 0, y: 10, letterSpacing: '0.6em' },
      { autoAlpha: 1, y: 0, letterSpacing: '0.32em', duration: 1, ease: 'expo.out' }, 'ink+=0.1');
    return tl;
  }

  /* ---------- Preloader ----------------------------------------------------
     0.00–1.50s  calligraphy logo: pen draws every stroke
     then        ink fills, "BEAUTY SALON" fades in → curtain slides up →
                 hero intro (which draws the hero logo) overlaps the exit */
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

    var logo = el.querySelector('[data-logo]');

    if (reducedMotion) {
      // finished logo, no drawing: the CSS end state
      gsap.set(logoPaths(logo), { strokeDashoffset: 0, fillOpacity: 1 });
      gsap.set(logo.querySelectorAll('[data-logo-wordmark]'), { autoAlpha: 1 });
      return gsap.to(el, { autoAlpha: 0, duration: 0.3, delay: 0.5, ease: 'none', onComplete: done });
    }

    resetLogo(logo);
    // autoRound off: GSAP otherwise snaps px values to whole numbers, and a
    // dashoffset that can only be 1 or 0 pops in instead of drawing.
    var tl = gsap.timeline({ defaults: { autoRound: false } });
    tl.add(drawLogo(logo, { draw: DRAW }), 0);

    // — exit, once the wordmark has settled
    tl.addLabel('exit', '>-0.3')
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
    menu: menu,
    heroBreathing: heroBreathing,
    scrollReveals: scrollReveals,
    visitTimeline: visitTimeline,
    lightboxSlide: lightboxSlide,
    lightboxDrag: lightboxDrag,
    lightboxReset: lightboxReset
  };
})();
