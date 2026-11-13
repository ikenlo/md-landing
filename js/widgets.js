/* ==========================================================================
   M&D — widgets.js
   Interactive layer on top of the showcase:
     1. Booking widget   (MDs Connect)  — day/time → contacts → confirmation
     2. Service details  — bottom sheet with time, materials, description
     3. AI chat          (MDs Manager)  — chat panel with typing indicator

   Data goes through MD.api (js/api.js, currently mocked). Dialogs open and
   close through main.js's overlay manager, which keeps them mutually
   exclusive, locks scroll, makes the page inert and restores focus.
   Copy: content.js (business data) and ui-text.js (interface strings).
   ========================================================================== */
(function () {
  'use strict';

  var MD = (window.MD = window.MD || {});
  var api = MD.api;
  var overlay;                                     // { open(el, focusTarget), close() }
  var content;                                     // CONTENT + { ui }
  var ui;

  /* ---------- helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  function findService(name) {
    var cats = (content.services && content.services.categories) || [];
    for (var i = 0; i < cats.length; i++) {
      for (var j = 0; j < cats[i].items.length; j++) {
        if (cats[i].items[j].name === name) return { category: cats[i], item: cats[i].items[j] };
      }
    }
    return null;
  }

  /* ==========================================================================
     1. BOOKING WIDGET (MDs Connect)
     ========================================================================== */
  var booking = {};

  function initBooking() {
    var dialog = document.getElementById('booking');
    if (!dialog) return;

    var t = ui.booking;
    var panel = $('.dialog__panel', dialog);
    var body = $('.dialog__body', dialog);
    var stepLabel = $('.dialog__step', dialog);
    var views = {};
    $all('[data-view]', dialog).forEach(function (v) { views[v.getAttribute('data-view')] = v; });
    var foots = $all('[data-foot]', dialog);

    var dateBox = $('.booking__dates', dialog);
    var timeBox = $('.booking__times', dialog);
    var status = $('.booking__status', dialog);
    var monthLabel = $('.booking__month', dialog);
    var legend = $('.booking__legend', dialog);
    var serviceChip = $('.booking__service', dialog);
    var summaryService = $('[data-summary="service"]', dialog);
    var summaryServiceRow = summaryService.closest('div');
    var summaryWhen = $('[data-summary="when"]', dialog);
    var form = $('#bookingForm', dialog);
    var submitBtn = $('[data-foot="form"] button', dialog);
    var formError = $('.booking__form-error', dialog);

    var state = { days: null, date: null, time: null, service: null, sending: false };
    var loadPromise = null;

    var weekday = new Intl.DateTimeFormat('uk-UA', { weekday: 'short' });
    var monthYear = new Intl.DateTimeFormat('uk-UA', { month: 'long', year: 'numeric' });
    var longDate = new Intl.DateTimeFormat('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' });

    function parseDate(iso) {
      var p = iso.split('-');
      return new Date(+p[0], +p[1] - 1, +p[2]);
    }

    function show(view) {
      Object.keys(views).forEach(function (k) { views[k].hidden = k !== view; });
      foots.forEach(function (f) { f.hidden = f.getAttribute('data-foot') !== view; });
      var title = $('.dialog__title', views[view]);
      dialog.setAttribute('aria-labelledby', title.id);
      stepLabel.textContent = view === 'success' ? '' : t.step.replace('{n}', view === 'slots' ? 1 : 2);
      panel.setAttribute('data-step', view);
      body.scrollTop = 0;
    }

    /* --- step 1: days & times --- */
    function setStatus(kind) {
      status.textContent = '';
      status.hidden = !kind;
      if (!kind) return;

      if (kind === 'loading') {
        status.appendChild(el('span', 'spinner'));
        status.appendChild(el('span', null, t.loading));
      } else if (kind === 'empty') {
        status.appendChild(el('span', null, t.noSlots));
      } else if (kind === 'error') {
        status.appendChild(el('p', null, t.error));
        var actions = el('div', 'booking__status-actions');
        var retry = el('button', 'btn btn--ghost', t.retry);
        retry.type = 'button';
        retry.addEventListener('click', function () { loadPromise = null; loadSlots(); });
        var tg = el('a', 'btn btn--ghost', t.telegram);
        tg.href = content.contacts.telegramLink;
        tg.target = '_blank';
        tg.rel = 'noopener noreferrer';
        actions.appendChild(retry);
        actions.appendChild(tg);
        status.appendChild(actions);
      }
      status.className = 'booking__status booking__status--' + kind;
    }

    // Accept both the current shape ({ time, available }) and a bare "10:00".
    function normalise(days) {
      return (days || []).map(function (day) {
        return {
          date: day.date,
          slots: (day.slots || []).map(function (sl) {
            return typeof sl === 'string' ? { time: sl, available: true } : sl;
          })
        };
      });
    }

    function freeCount(day) {
      return day.slots.filter(function (sl) { return sl.available; }).length;
    }

    function renderDays() {
      dateBox.textContent = '';
      var active = null;
      state.days.forEach(function (day) {
        var d = parseDate(day.date);
        var free = freeCount(day);
        var b = el('button', 'date-chip');
        b.type = 'button';
        b.setAttribute('aria-pressed', String(day.date === state.date));
        b.setAttribute('aria-label', longDate.format(d) + (free ? '' : ' — ' + t.noSlots));
        b.appendChild(el('span', 'date-chip__dow', weekday.format(d)));
        b.appendChild(el('span', 'date-chip__num', String(d.getDate())));
        // a gold dot = there is free time that day
        var dot = el('span', 'date-chip__dot');
        dot.setAttribute('aria-hidden', 'true');
        b.appendChild(dot);
        if (!free) b.classList.add('is-full');
        if (day.date === state.date) active = b;
        b.addEventListener('click', function () {
          state.date = day.date;
          state.time = null;
          renderDays();
          renderTimes();
        });
        dateBox.appendChild(b);
      });

      if (state.date) monthLabel.textContent = monthYear.format(parseDate(state.date)).replace(/\s*р\.?$/, '');  // «листопад 2026», without « р.»
      // keep the chosen day in view without jolting the page
      if (active) {
        var left = active.offsetLeft - (dateBox.clientWidth - active.offsetWidth) / 2;
        dateBox.scrollTo({ left: Math.max(0, left), behavior: dateBox.dataset.ready ? 'smooth' : 'auto' });
        dateBox.dataset.ready = '1';
      }
    }

    function renderTimes() {
      timeBox.textContent = '';
      var day = state.days.filter(function (d) { return d.date === state.date; })[0];
      if (!day || !day.slots.length) {
        legend.hidden = true;
        setStatus('empty');
        return;
      }
      var free = freeCount(day);
      setStatus(free ? null : 'empty');
      legend.hidden = free === day.slots.length;   // only explain strikethrough when some are taken

      day.slots.forEach(function (slot) {
        var b = el('button', 'time-chip', slot.time);
        b.type = 'button';
        if (!slot.available) {
          // taken: shown so the day's rhythm is visible, but inert
          b.disabled = true;
          b.classList.add('is-taken');
          b.setAttribute('aria-label', slot.time + ' — ' + t.taken);
          timeBox.appendChild(b);
          return;
        }
        b.setAttribute('aria-pressed', String(slot.time === state.time));
        b.addEventListener('click', function () {
          state.time = slot.time;
          $all('.time-chip', timeBox).forEach(function (x) {
            if (!x.disabled) x.setAttribute('aria-pressed', String(x === b));
          });
          // brief confirmation of the tap, then on to the form
          setTimeout(goToForm, 220);
        });
        timeBox.appendChild(b);
      });
    }

    function loadSlots() {
      if (loadPromise) return loadPromise;
      dateBox.textContent = '';
      timeBox.textContent = '';
      legend.hidden = true;
      setStatus('loading');

      loadPromise = api.getSlots().then(function (data) {
        state.days = normalise(data && data.days);
        var firstOpen = state.days.filter(function (d) { return freeCount(d); })[0];
        state.date = firstOpen ? firstOpen.date : (state.days[0] && state.days[0].date);
        renderDays();
        renderTimes();
      }).catch(function () {
        setStatus('error');
        loadPromise = null;                        // allow a retry
      });
      return loadPromise;
    }

    /* --- step 2: contacts --- */
    function goToForm() {
      var d = parseDate(state.date);
      summaryWhen.textContent = longDate.format(d) + ', ' + state.time;
      summaryServiceRow.hidden = !state.service;
      summaryService.textContent = state.service || '';
      formError.hidden = true;
      show('form');
      // keyboard users land in the first field; touch users aren't ambushed by the keyboard
      if (finePointer.matches) form.elements.namedItem('name').focus();
      else panel.focus({ preventScroll: true });
    }

    var rules = {
      name: function (v) { return v.length >= 2; },
      phone: function (v) { return v.replace(/\D/g, '').length >= 10; }
    };

    function setValidity(input, ok) {
      input.closest('.field').classList.toggle('is-invalid', !ok);
      if (ok) input.removeAttribute('aria-invalid');
      else input.setAttribute('aria-invalid', 'true');
    }

    form.addEventListener('input', function (e) {
      var rule = rules[e.target.name];
      if (rule && e.target.closest('.field').classList.contains('is-invalid')) {
        setValidity(e.target, rule(e.target.value.trim()));
      }
    });

    function setSending(on) {
      state.sending = on;
      submitBtn.disabled = on;
      submitBtn.setAttribute('aria-busy', String(on));
      submitBtn.querySelector('.btn__label').textContent = on ? t.sending : t.confirm;
      submitBtn.classList.toggle('is-loading', on);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (state.sending) return;

      var name = form.elements.namedItem('name');
      var phone = form.elements.namedItem('phone');
      var firstInvalid = null;
      [name, phone].forEach(function (input) {
        var ok = rules[input.name](input.value.trim());
        setValidity(input, ok);
        if (!ok && !firstInvalid) firstInvalid = input;
      });
      if (firstInvalid) { firstInvalid.focus(); return; }

      formError.hidden = true;
      setSending(true);
      api.createBooking({
        date: state.date,
        time: state.time,
        service: state.service,
        name: name.value.trim(),
        phone: phone.value.trim()
      }).then(function () {
        setSending(false);
        form.reset();
        show('success');
        $('[data-view="success"] .dialog__title', dialog).focus({ preventScroll: true });
        loadPromise = null;                        // the taken slot should refresh next time
      }).catch(function () {
        setSending(false);
        formError.hidden = false;
      });
    });

    $('.booking__back', dialog).addEventListener('click', function () {
      show('slots');
      var pressed = $('.time-chip[aria-pressed="true"]', timeBox);
      (pressed || panel).focus({ preventScroll: true });
    });

    $('.booking__telegram', dialog).href = content.contacts.telegramLink;

    booking.open = function (opts) {
      state.service = (opts && opts.service) || null;
      serviceChip.hidden = !state.service;
      serviceChip.textContent = state.service || '';
      state.time = null;
      show('slots');
      overlay.open(dialog, panel);
      loadSlots().then(function () {
        if (state.days) { renderDays(); renderTimes(); }
      });
    };

    // Every "Записатися" button in the page opens the widget.
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest && e.target.closest('[data-open-booking]');
      if (!trigger) return;
      e.preventDefault();
      booking.open();
    });
  }

  /* ==========================================================================
     2. SERVICE DETAILS (bottom sheet / centred card)
     ========================================================================== */
  function initServiceDetails() {
    var dialog = document.getElementById('serviceSheet');
    if (!dialog) return;

    var panel = $('.dialog__panel', dialog);
    var current = null;

    document.addEventListener('click', function (e) {
      var row = e.target.closest && e.target.closest('[data-service]');
      if (!row) return;
      var found = findService(row.getAttribute('data-service'));
      if (!found) return;
      current = found;

      var d = found.item.details || {};
      $('[data-sheet="category"]', dialog).textContent = found.category.name;
      $('[data-sheet="name"]', dialog).textContent = found.item.name;
      $('[data-sheet="price"]', dialog).textContent = found.item.price;
      $('[data-sheet="time"]', dialog).textContent = d.time || '—';
      $('[data-sheet="materials"]', dialog).textContent = d.materials || '—';
      var desc = $('[data-sheet="description"]', dialog);
      desc.textContent = d.description || '';
      desc.hidden = !d.description;
      $('.dialog__body', dialog).scrollTop = 0;

      overlay.open(dialog, panel);
    });

    $('[data-book-service]', dialog).addEventListener('click', function () {
      // the overlay manager swaps the sheet for the booking dialog
      if (booking.open) booking.open({ service: current && current.item.name });
    });
  }

  /* ==========================================================================
     3. AI CHAT (MDs Manager)
     ========================================================================== */
  function initChat() {
    var dialog = document.getElementById('chat');
    var fab = document.getElementById('chatFab');
    if (!dialog || !fab) return;

    var t = ui.chat;
    var panel = $('.dialog__panel', dialog);
    var body = $('.chat__body', dialog);
    var log = $('.chat__log', dialog);
    var suggestions = $('.chat__suggestions', dialog);
    var form = $('.chat__form', dialog);
    var input = $('#chatInput', dialog);
    var sendBtn = $('.chat__send', dialog);
    var history = [];
    var busy = false;

    function scrollToEnd() {
      body.scrollTop = body.scrollHeight;
    }

    function addMessage(role, text) {
      var li = el('li', 'chat__msg chat__msg--' + role);
      var who = el('span', 'visually-hidden', role === 'bot' ? t.title + ': ' : '');
      li.appendChild(who);
      li.appendChild(document.createTextNode(text));
      log.appendChild(li);
      history.push({ role: role === 'bot' ? 'assistant' : 'user', text: text });
      scrollToEnd();
      return li;
    }

    function addTyping() {
      var li = el('li', 'chat__msg chat__msg--bot chat__typing');
      li.appendChild(el('span', 'visually-hidden', t.typing));
      var dots = el('span', 'chat__dots');
      dots.setAttribute('aria-hidden', 'true');
      dots.appendChild(el('span'));
      dots.appendChild(el('span'));
      dots.appendChild(el('span'));
      li.appendChild(dots);
      log.appendChild(li);
      scrollToEnd();
      return li;
    }

    function setBusy(on) {
      busy = on;
      sendBtn.disabled = on;
    }

    function send(text) {
      text = text.trim();
      if (!text || busy) return;
      suggestions.hidden = true;
      addMessage('user', text);
      input.value = '';
      setBusy(true);
      var typing = addTyping();

      api.askAssistant(text, history.slice(0, -1)).then(function (data) {
        typing.remove();
        addMessage('bot', (data && data.reply) || t.error);
      }).catch(function () {
        typing.remove();
        addMessage('bot', t.error).classList.add('chat__msg--error');
      }).then(function () {
        setBusy(false);
        if (finePointer.matches) input.focus();
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      send(input.value);
    });

    t.suggestions.forEach(function (q) {
      var b = el('button', 'chat__suggestion', q);
      b.type = 'button';
      b.addEventListener('click', function () { send(q); });
      suggestions.appendChild(b);
    });

    addMessage('bot', t.greeting);
    history = [];                                  // the greeting isn't part of the conversation

    fab.addEventListener('click', function () {
      overlay.open(dialog, finePointer.matches ? input : panel);
      scrollToEnd();
    });
  }

  /* ---------- shared: dialog header separates from scrolled content ---------- */
  function initDialogScrollState() {
    $all('.dialog').forEach(function (dialog) {
      var panel = $('.dialog__panel', dialog);
      var body = $('.dialog__body', dialog);
      if (!panel || !body) return;
      var ticking = false;
      body.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          panel.classList.toggle('is-scrolled', body.scrollTop > 4);
          ticking = false;
        });
      }, { passive: true });
    });
  }

  /* ---------- entry point (called by main.js after content is rendered) ---------- */
  MD.widgets = {
    init: function (deps) {
      if (!api) {
        console.warn('[widgets] api.js did not load');
        return;
      }
      overlay = deps.overlay;
      content = deps.content;
      ui = content.ui;
      initDialogScrollState();
      initBooking();
      initServiceDetails();
      initChat();
    },
    openBooking: function (opts) { if (booking.open) booking.open(opts); }
  };
})();
