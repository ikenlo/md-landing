/* ==========================================================================
   M&D — api.js
   Thin client for the studio's internal systems:
     • MDs Connect  — booking:  GET  /api/connect/slots
                                POST /api/connect/bookings
     • MDs Manager  — AI chat:  POST /api/manager/chat   (local Ollama LLM)

   The widgets only ever call MD.api.*, and every call goes through request(),
   which uses the real fetch() — unless MOCK is on. While the backends aren't
   deployed on this domain, MOCK answers those exact URLs with fake data after
   a setTimeout, wrapped in a real Response, so the widget code (res.ok,
   res.json()) stays exactly what production will run.

   GOING LIVE: set MOCK = false (and API_BASE if the APIs live elsewhere).
   ========================================================================== */
(function () {
  'use strict';

  var MD = (window.MD = window.MD || {});

  var MOCK = true;
  var API_BASE = '';                               // e.g. 'https://api.md-studio.com.ua'

  function request(path, options) {
    var opts = options || {};
    if (MOCK) return mockFetch(path, opts);
    return fetch(API_BASE + path, opts);
  }

  function json(res) {
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }

  function postJSON(path, body) {
    return request(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(json);
  }

  MD.api = {
    /** → { days: [{ date: 'YYYY-MM-DD', slots: ['10:00', …] }] } */
    getSlots: function () {
      return request('/api/connect/slots').then(json);
    },

    /** { date, time, name, phone, service? } → { id, status: 'pending' } */
    createBooking: function (data) {
      return postJSON('/api/connect/bookings', data);
    },

    /** { message, history: [{ role, text }] } → { reply } */
    askAssistant: function (message, history) {
      return postJSON('/api/manager/chat', { message: message, history: history || [] });
    }
  };

  /* ==========================================================================
     MOCK BACKEND — delete this section once the real APIs are live.
     ========================================================================== */
  function respond(data, delay) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve(new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }));
      }, delay);
    });
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  // Next 10 working days (Mon–Sat), a fixed grid with some times "taken".
  function mockSlots() {
    var grid = ['09:00', '10:00', '11:30', '12:30', '14:00', '15:00', '16:30', '18:00'];
    var days = [];
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    var nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

    for (var i = 0; days.length < 10 && i < 21; i++) {
      var day = new Date(d.getTime() + i * 86400000);
      if (day.getDay() === 0) continue;            // Sunday: closed
      var seed = day.getDate() * 7 + day.getMonth();
      var slots = grid.filter(function (t, k) {
        var minutes = +t.slice(0, 2) * 60 + +t.slice(3);
        if (i === 0 && minutes <= nowMinutes + 60) return false;  // past or too soon today
        return (seed + k * 3) % 4 !== 0;                          // ~¼ already booked
      });
      // one fully booked day, to exercise the empty state
      if (days.length === 3) slots = [];
      days.push({
        date: day.getFullYear() + '-' + pad(day.getMonth() + 1) + '-' + pad(day.getDate()),
        slots: slots
      });
    }
    return { days: days };
  }

  var REPLIES = [
    { test: /ботокс/i, reply: 'Наші майстри рекомендують зачекати 2 тижні після ботоксу перед фарбуванням: так склад рівномірно ляже, а ефект ботоксу збережеться довше.' },
    { test: /фарб|колор|відтін/i, reply: 'Фарбування підбираємо після консультації: майстер оцінить стан волосся й запропонує відтінок і техніку. Запишіться — і обговоримо деталі на місці.' },
    { test: /цін|скільки|вартіст|коштує/i, reply: 'Жіночі стрижки — від 400 до 650 грн залежно від довжини, чоловічі — від 350 грн, миття голови — 50 грн. Повний прайс є в розділі «Послуги».' },
    { test: /де |адрес|знаход|як дістат/i, reply: 'Ми в Нових Петрівцях: провулок Першого Травня, 20. Посилання на карту є в розділі «Контакти».' },
    { test: /запис|вільн|час|коли/i, reply: 'Записатися можна прямо тут: натисніть «Записатися», оберіть день і час — підтвердження прийде в Telegram.' },
    { test: /догляд|сух|ламк|випада|маск/i, reply: 'Для домашнього догляду радимо м’який безсульфатний шампунь і маску раз на тиждень. Майстер підбере засоби під ваш тип волосся під час візиту.' },
    { test: /привіт|добр|вітаю|hello|hi/i, reply: 'Вітаю! Чим можу допомогти: послуги, ціни, догляд чи запис?' }
  ];

  function mockReply(message) {
    for (var i = 0; i < REPLIES.length; i++) {
      if (REPLIES[i].test.test(message)) return REPLIES[i].reply;
    }
    return 'Гарне запитання! Точну відповідь краще дасть майстер під час консультації. Можу допомогти із записом або розповісти про послуги та ціни.';
  }

  function mockFetch(path, opts) {
    var method = (opts.method || 'GET').toUpperCase();
    var body = opts.body ? JSON.parse(opts.body) : {};

    if (path === '/api/connect/slots' && method === 'GET') {
      return respond(mockSlots(), 700);
    }
    if (path === '/api/connect/bookings' && method === 'POST') {
      return respond({ id: 'mock-' + Date.now(), status: 'pending' }, 1400);
    }
    if (path === '/api/manager/chat' && method === 'POST') {
      return respond({ reply: mockReply(body.message || '') }, 1500);
    }
    return Promise.resolve(new Response('Not found', { status: 404 }));
  }
})();
