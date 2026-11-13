/* ==========================================================================
   M&D — ui-text.js
   Interface strings that content.js doesn't carry: accessibility labels,
   section eyebrows, contact row labels, and the copy of the booking,
   service-details and AI-chat widgets.
   Business copy (services, prices, contacts…) lives in content.js only.

   Bound under the "ui." prefix, e.g. data-t="ui.a11y.close".
   ========================================================================== */
(function () {
  'use strict';

  var MD = (window.MD = window.MD || {});

  MD.ui = {
    a11y: {
      skip: 'Перейти до змісту',
      loading: 'Завантаження',
      logo: 'M&D — на початок сторінки',
      navMain: 'Основна навігація',
      navMobile: 'Мобільна навігація',
      menu: 'Меню',
      menuOpen: 'Відкрити меню',
      menuClose: 'Закрити меню',
      close: 'Закрити',
      lightbox: 'Перегляд фото',
      prevPhoto: 'Попереднє фото',
      nextPhoto: 'Наступне фото',
      serviceDetails: 'Деталі послуги',
      chatOpen: 'Відкрити чат з AI-помічником'
    },

    eyebrow: {
      about: 'Про студію',
      principles: 'Наш підхід',
      services: 'Прайс',
      gallery: 'Портфоліо',
      visit: 'Процес',
      contacts: 'Контакти'
    },

    about: {
      imageAlt: 'Інтер’єр студії M&D'
    },

    booking: {
      eyebrow: 'Онлайн-запис',
      titleSlot: 'Оберіть день і час',
      titleForm: 'Ваші контакти',
      dateLabel: 'День',
      timeLabel: 'Час',
      loading: 'Завантажуємо вільний час…',
      noSlots: 'На цей день вільного часу немає. Оберіть інший день.',
      error: 'Не вдалося завантажити розклад. Спробуйте ще раз або запишіться в Telegram.',
      retry: 'Спробувати ще раз',
      telegram: 'Записатися в Telegram',
      next: 'Далі',
      back: 'Змінити час',
      summaryService: 'Послуга',
      summaryWhen: 'Коли',
      name: 'Ім’я',
      namePlaceholder: 'Як до вас звертатися',
      nameError: 'Вкажіть, будь ласка, ім’я',
      phone: 'Телефон',
      phonePlaceholder: '+380',
      phoneError: 'Вкажіть номер телефону повністю',
      confirm: 'Підтвердити',
      sending: 'Надсилаємо…',
      submitError: 'Не вдалося надіслати заявку. Спробуйте ще раз.',
      successTitle: 'Вас записано!',
      successText: 'Очікуйте на підтвердження у Telegram.',
      openTelegram: 'Відкрити Telegram',
      done: 'Готово',
      step: 'Крок {n} з 2'
    },

    service: {
      time: 'Тривалість',
      materials: 'Матеріали',
      price: 'Вартість',
      book: 'Записатися на послугу',
      more: 'Деталі'
    },

    chat: {
      title: 'M&D AI-Помічник',
      status: 'Онлайн',
      greeting: 'Вітаю! Я AI-помічник студії M&D. Запитайте про послуги, ціни, догляд за волоссям чи запис.',
      placeholder: 'Напишіть повідомлення…',
      send: 'Надіслати',
      typing: 'Помічник друкує',
      disclaimer: 'Відповіді генерує ШІ й можуть бути неточними. Деталі уточнюйте в майстра.',
      error: 'Помічник зараз недоступний. Спробуйте пізніше або напишіть нам у Telegram.',
      suggestions: [
        'Чи можна фарбувати волосся після ботоксу?',
        'Скільки коштує жіноча стрижка?',
        'Де ви знаходитесь?'
      ]
    },

    contacts: {
      phone: 'Телефон',
      address: 'Адреса',
      instagram: 'Instagram',
      telegram: 'Telegram'
    }
  };
})();
