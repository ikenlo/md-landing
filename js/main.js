/* ==========================================================================
   M&D — main.js
   App logic: content binding, smooth scroll, preloader boot, sticky nav,
   mobile menu, floating CTA and gallery lightbox. Booking happens in the
   Telegram bot: every "Записатися" is a plain link, no form on this page.
   Copy comes from content.js (window.MD.content) plus ui-text.js
   (window.MD.ui, bound under "ui."); timelines from animations.js.
   ========================================================================== */
(function () {
  'use strict';

  var SCROLL_THRESHOLD = 80;                       // px before the nav turns solid
  var FAB_THRESHOLD = 600;                         // px before the floating CTA appears
  var SWIPE_THRESHOLD = 50;                        // px of horizontal travel that counts as a swipe
  var DESKTOP = window.matchMedia('(min-width: 64rem)');

  var anim = (window.MD && window.MD.animations) || { available: false };
  var MD = window.MD || {};
  var ui = MD.ui || {};
  // One lookup root: business copy at the top level, interface strings under "ui".
  var content = Object.assign({}, MD.content || {}, { ui: ui });
  var root = document.documentElement;
  var nav = document.getElementById('nav');
  var burger = document.getElementById('navBurger');
  var menu = document.getElementById('menu');
  var main = document.getElementById('main');
  var footer = document.getElementById('footer');
  var fab = document.getElementById('fab');
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

  // Stamp each [data-list] <template> once per item. Recurses into the clone,
  // so a template may hold its own list (categories → items).
  function renderLists(scope, ctx) {
    scope.querySelectorAll('[data-list]').forEach(function (list) {
      if (!list.hasAttribute('data-list')) return;  // already stamped by an outer pass
      var path = list.getAttribute('data-list');
      var items = lookup(ctx, path);
      var tpl = list.querySelector(':scope > template');
      list.removeAttribute('data-list');
      if (!tpl || !Array.isArray(items)) {
        console.warn('[content] bad list:', path);
        return;
      }
      items.forEach(function (item, i) {
        var node = tpl.content.cloneNode(true);
        renderLists(node, item);
        bind(node, item, i);
        list.appendChild(node);
      });
    });
  }

  function renderContent() {
    if (!MD.content) console.warn('[content] content.js did not load');
    renderLists(document, content);
    bind(document, content);                       // everything outside lists
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

  /* ---------- Scroll state ------------------------------------------------
     Nav: transparent → green-800 + blur past 80px.
     Floating CTA: shows past 600px, steps aside once the contacts section
     (which has its own button and tappable rows) is on screen. */
  function initScrollState() {
    var ticking = false;
    var contactsInView = false;

    function update() {
      var y = window.scrollY;
      nav.classList.toggle('is-scrolled', y > SCROLL_THRESHOLD);
      if (fab) fab.classList.toggle('is-visible', y > FAB_THRESHOLD && !contactsInView);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    var contacts = document.getElementById('contacts');
    if (contacts && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        contactsInView = entries[0].isIntersecting;
        update();
      }, { rootMargin: '0px 0px -25% 0px' }).observe(contacts);
    }

    update();                                     // correct state on reload mid-page
  }

  // Everything behind a full-screen layer leaves the tab order and the a11y tree.
  function setPageInert(on) {
    [main, footer, fab].forEach(function (el) {
      if (el) el.inert = on;
    });
  }

  /* ---------- Mobile menu ---------- */
  var menuTl = null;
  var menuOpen = false;

  function setMenuState(open) {
    menuOpen = open;
    burger.setAttribute('aria-expanded', String(open));
    var labels = ui.a11y || {};
    burger.setAttribute('aria-label', open ? labels.menuClose : labels.menuOpen);
    nav.classList.toggle('is-menu-open', open);
    setPageInert(open);                           // focus stays in header + menu
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

    // The menu's CTA opens Telegram in a new tab; close the menu so the page
    // is in a normal state when the visitor comes back.
    menu.querySelector('.menu__cta').addEventListener('click', function () {
      closeMenu({ instant: true });
    });

    // Crossing into the desktop layout with the menu open: reset cleanly.
    var onBreakpoint = function (e) {
      if (e.matches) closeMenu({ instant: true });
    };
    if (DESKTOP.addEventListener) DESKTOP.addEventListener('change', onBreakpoint);
    else DESKTOP.addListener(onBreakpoint);
  }

  /* ---------- Overlays (lightbox) ---------------------------------------------
     One at a time. Opening locks scroll, makes the page behind inert and moves
     focus in; closing puts focus back on whatever opened it. */
  var activeOverlay = null;
  var returnFocus = null;

  function openOverlay(el, focusTarget) {
    if (activeOverlay) return;

    returnFocus = document.activeElement;
    if (menuOpen) {
      closeMenu();
      returnFocus = burger;                       // the menu button that was tapped is gone
    }

    activeOverlay = el;
    el.inert = false;
    el.classList.add('is-open');
    setPageInert(true);
    nav.inert = true;
    lockScroll();
    (focusTarget || el).focus({ preventScroll: true });
  }

  function closeOverlay() {
    if (!activeOverlay) return;

    var el = activeOverlay;
    activeOverlay = null;
    el.classList.remove('is-open');
    el.inert = true;
    setPageInert(false);
    nav.inert = false;
    unlockScroll();

    if (returnFocus && returnFocus.focus) returnFocus.focus({ preventScroll: true });
    returnFocus = null;
  }

  function initOverlays() {
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[data-close-overlay]')) closeOverlay();
    });
  }

  /* ---------- Gallery lightbox ------------------------------------------------
     Tap a tile to open. Navigate with a swipe (touch), ← → (keyboard) or the
     arrow buttons; Esc, ✕ or a tap on the empty area closes. */
  var lightbox = null;

  function initLightbox() {
    var el = document.getElementById('lightbox');
    var tiles = Array.prototype.slice.call(document.querySelectorAll('.gallery__item'));
    if (!el || !tiles.length) return;

    var stage = el.querySelector('.lightbox__stage');
    var img = el.querySelector('.lightbox__img');
    var counter = el.querySelector('.lightbox__counter');
    var animated = anim.available;
    var index = 0;

    var photos = tiles.map(function (tile) {
      var thumb = tile.querySelector('img');
      return { src: thumb.getAttribute('src'), alt: thumb.getAttribute('alt') || '' };
    });

    function show(i) {
      index = (i + photos.length) % photos.length;  // wraps at both ends
      img.src = photos[index].src;
      img.alt = photos[index].alt;
      counter.textContent = (index + 1) + ' / ' + photos.length;
    }

    function go(dir) {
      if (photos.length < 2) return;
      var next = index + dir;
      if (animated) anim.lightboxSlide(img, dir, function () { show(next); });
      else show(next);
    }

    tiles.forEach(function (tile, i) {
      tile.addEventListener('click', function () {
        show(i);
        if (animated) anim.lightboxReset(img, true);
        openOverlay(el);
      });
    });

    el.querySelector('.lightbox__prev').addEventListener('click', function () { go(-1); });
    el.querySelector('.lightbox__next').addEventListener('click', function () { go(1); });

    // Tap on the empty area around the photo closes.
    stage.addEventListener('click', function (e) {
      if (e.target === stage) closeOverlay();
    });

    // --- Swipe: touchstart → (touchmove follows the finger) → touchend decides
    var startX = 0;
    var startY = 0;
    var tracking = false;
    var axis = null;

    stage.addEventListener('touchstart', function (e) {
      tracking = e.touches.length === 1;          // ignore pinch
      if (!tracking) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      axis = null;
    }, { passive: true });

    stage.addEventListener('touchmove', function (e) {
      if (!tracking || e.touches.length !== 1) return;
      var dx = e.touches[0].clientX - startX;
      var dy = e.touches[0].clientY - startY;
      if (!axis && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      }
      if (axis === 'x' && animated) anim.lightboxDrag(img, dx);
    }, { passive: true });

    stage.addEventListener('touchend', function (e) {
      if (!tracking) return;
      tracking = false;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;

      if (Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        go(dx < 0 ? 1 : -1);                      // swipe left → next photo
      } else if (animated) {
        anim.lightboxReset(img);
      }
    }, { passive: true });

    stage.addEventListener('touchcancel', function () {
      tracking = false;
      if (animated) anim.lightboxReset(img);
    }, { passive: true });

    lightbox = { el: el, go: go };
  }

  /* ---------- Keyboard ---------- */
  function initKeyboard() {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (activeOverlay) {
          closeOverlay();
        } else if (menuOpen) {
          closeMenu();
          burger.focus();
        }
        return;
      }

      if (lightbox && activeOverlay === lightbox.el) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); lightbox.go(-1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); lightbox.go(1); }
      }
    });
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
    initScrollState();
    initMenu();
    initOverlays();
    initLightbox();
    initKeyboard();
    initAnchors();

    var preloader = document.getElementById('preloader');

    if (!anim.available) {
      // GSAP didn't load (offline / blocked CDN): CSS fade, page stays usable.
      // The visit rail is drawn by CSS default, so light every step to match.
      if (preloader) preloader.classList.add('is-done');
      document.querySelectorAll('.step').forEach(function (step) { step.classList.add('is-active'); });
      return;
    }

    lockScroll();
    anim.prepareHero();
    anim.scrollReveals();
    anim.visitTimeline();
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
