/* ==========================================================================
   M&D — main.js
   App logic: content binding, smooth scroll, preloader boot, sticky nav
   state, mobile menu. Copy comes from content.js (window.MD.content),
   timelines from animations.js (window.MD.animations).
   ========================================================================== */
(function () {
  'use strict';

  var SCROLL_THRESHOLD = 80;                       // px before the nav turns solid
  var DESKTOP = window.matchMedia('(min-width: 64rem)');

  var anim = (window.MD && window.MD.animations) || { available: false };
  var content = (window.MD && window.MD.content) || {};
  var root = document.documentElement;
  var nav = document.getElementById('nav');
  var burger = document.getElementById('navBurger');
  var menu = document.getElementById('menu');
  var main = document.getElementById('main');
  var lenis = null;

  /* ---------- Content binding (content.js → DOM) ---------- */
  function lookup(ctx, path) {
    if (path === '.') return ctx;
    return path.split('.').reduce(function (obj, key) {
      return obj == null ? undefined : obj[key];
    }, ctx);
  }

  // Plain text, except *word* becomes <em>word</em>. Built with DOM nodes — no innerHTML.
  function setText(el, value) {
    el.textContent = '';
    String(value).split(/\*(.+?)\*/g).forEach(function (part, i) {
      if (!part) return;
      if (i % 2) {
        var em = document.createElement('em');
        em.textContent = part;
        el.appendChild(em);
      } else {
        el.appendChild(document.createTextNode(part));
      }
    });
  }

  function bind(scope, ctx, index) {
    scope.querySelectorAll('[data-t]').forEach(function (el) {
      var value = lookup(ctx, el.getAttribute('data-t'));
      if (value == null) console.warn('[content] missing key:', el.getAttribute('data-t'));
      else setText(el, value);
      el.removeAttribute('data-t');
    });

    scope.querySelectorAll('[data-t-attr]').forEach(function (el) {
      el.getAttribute('data-t-attr').split(';').forEach(function (pair) {
        var at = pair.indexOf(':');
        var value = lookup(ctx, pair.slice(at + 1).trim());
        if (value == null) console.warn('[content] missing key:', pair);
        else el.setAttribute(pair.slice(0, at).trim(), value);
      });
      el.removeAttribute('data-t-attr');
    });

    if (index != null) {
      scope.querySelectorAll('[data-index]').forEach(function (el) {
        el.textContent = (index < 9 ? '0' : '') + (index + 1);
      });
    }
  }

  function renderContent() {
    // Lists first: stamp the <template> once per item, bound to that item…
    document.querySelectorAll('[data-list]').forEach(function (list) {
      var items = lookup(content, list.getAttribute('data-list'));
      var tpl = list.querySelector('template');
      if (!tpl || !Array.isArray(items)) {
        console.warn('[content] bad list:', list.getAttribute('data-list'));
        return;
      }
      items.forEach(function (item, i) {
        var node = tpl.content.cloneNode(true);
        bind(node, item, i);
        list.appendChild(node);
      });
    });

    // …then everything else against the root.
    bind(document, content);
  }

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
    var labels = content.a11y || {};
    burger.setAttribute('aria-label', open ? labels.menuClose : labels.menuOpen);
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
    renderContent();                              // before anything measures or animates
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
    anim.scrollReveals();
    anim.preloader(function () {
      unlockScroll();
      anim.heroBreathing();
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });

    // Web fonts change text height → trigger positions need one re-measure.
    if (document.fonts && document.fonts.ready && window.ScrollTrigger) {
      document.fonts.ready.then(function () { window.ScrollTrigger.refresh(); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
