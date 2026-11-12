/* ==========================================================================
   M&D — main.js
   App logic: smooth scroll, preloader boot, sticky nav state, mobile menu.
   Timelines come from animations.js (window.MD.animations).
   ========================================================================== */
(function () {
  'use strict';

  var SCROLL_THRESHOLD = 80;                       // px before the nav turns solid
  var DESKTOP = window.matchMedia('(min-width: 64rem)');

  var anim = (window.MD && window.MD.animations) || { available: false };
  var root = document.documentElement;
  var nav = document.getElementById('nav');
  var burger = document.getElementById('navBurger');
  var menu = document.getElementById('menu');
  var main = document.getElementById('main');
  var lenis = null;

  /* ---------- Scroll lock ---------- */
  function lockScroll() {
    root.classList.add('is-locked');
    if (lenis) lenis.stop();
  }

  function unlockScroll() {
    root.classList.remove('is-locked');
    if (lenis) lenis.start();
  }

  /* ---------- Smooth scroll (Lenis + ScrollTrigger on one clock) ---------- */
  function initLenis() {
    if (!window.Lenis || !anim.available || anim.reducedMotion) return;

    lenis = new window.Lenis({
      duration: 1.1,
      smoothWheel: true
      // Touch keeps native momentum scrolling — the right feel on phones.
    });

    if (window.ScrollTrigger) lenis.on('scroll', window.ScrollTrigger.update);
    window.gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    window.gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Sticky nav: transparent → green-800 + blur past 80px ---------- */
  function initNavScroll() {
    var ticking = false;

    function update() {
      nav.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    update();                                     // correct state on reload mid-page
  }

  /* ---------- Mobile menu ---------- */
  var menuTl = null;
  var menuOpen = false;

  function setMenuState(open) {
    menuOpen = open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
    nav.classList.toggle('is-menu-open', open);
    main.inert = open;                            // focus stays in header + menu
  }

  function openMenu() {
    if (menuOpen) return;
    setMenuState(true);
    menu.inert = false;
    menu.classList.add('is-open');
    lockScroll();
    if (menuTl) menuTl.timeScale(1).play();
  }

  function closeMenu(opts) {
    if (!menuOpen) return;
    var instant = opts && opts.instant;
    setMenuState(false);
    menu.inert = true;
    unlockScroll();

    var hide = function () {
      if (!menuOpen) menu.classList.remove('is-open');
    };

    if (menuTl && !instant) {
      menuTl.timeScale(1.6).reverse();            // closing is snappier than opening
    } else {
      if (menuTl) menuTl.pause(0);
      hide();
    }
  }

  function initMenu() {
    if (anim.available) {
      menuTl = anim.menu(menu);
      menuTl.eventCallback('onReverseComplete', function () {
        if (!menuOpen) menu.classList.remove('is-open');
      });
    }

    burger.addEventListener('click', function () {
      if (menuOpen) closeMenu(); else openMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuOpen) {
        closeMenu();
        burger.focus();
      }
    });

    // Crossing into the desktop layout with the menu open: reset cleanly.
    var onBreakpoint = function (e) {
      if (e.matches) closeMenu({ instant: true });
    };
    if (DESKTOP.addEventListener) DESKTOP.addEventListener('change', onBreakpoint);
    else DESKTOP.addListener(onBreakpoint);
  }

  /* ---------- In-page anchors ---------- */
  function initAnchors() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest && e.target.closest('a[href^="#"]');
      if (!link) return;

      var id = link.getAttribute('href');
      var target = id.length > 1 ? document.querySelector(id) : null;
      if (!target) return;

      e.preventDefault();
      var fromMenu = menu.contains(link);
      if (fromMenu) closeMenu();

      var offset = target.id === 'top' ? 0 : -nav.offsetHeight;
      if (lenis) {
        lenis.scrollTo(target, { offset: offset, duration: 1.4 });
      } else {
        var y = target.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({ top: y, behavior: anim.reducedMotion ? 'auto' : 'smooth' });
      }

      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', id === '#top' ? window.location.pathname + window.location.search : id);
      }
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    initLenis();
    initNavScroll();
    initMenu();
    initAnchors();

    var preloader = document.getElementById('preloader');

    if (!anim.available) {
      // GSAP didn't load (offline / blocked CDN): CSS fade, page stays usable.
      if (preloader) preloader.classList.add('is-done');
      return;
    }

    lockScroll();
    anim.prepareHero();
    anim.preloader(function () {
      unlockScroll();
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
