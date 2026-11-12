/* ==========================================================================
   M&D — ui-text.js
   Interface strings that content.js doesn't carry: accessibility labels,
   section eyebrows, form placeholders and validation messages, row labels.
   Business copy (services, prices, contacts…) lives in content.js only.

   Bound under the "ui." prefix, e.g. data-t="ui.a11y.close".
   ========================================================================== */
(function () {
  'use strict';

  var MD = (window.MD = window.MD || {});

  MD.ui = {
    brand: {
      tagline: 'Студія краси'
    },

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
      nextPhoto: 'Наступне фото'
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

    contacts: {
      phone: 'Телефон',
      address: 'Адреса',
      instagram: 'Instagram',
      telegram: 'Telegram'
    },

    form: {
      eyebrow: 'Онлайн-запис',
      namePlaceholder: 'Як до вас звертатися',
      phonePlaceholder: '+380',
      servicePlaceholder: 'Оберіть послугу',
      nameError: 'Вкажіть, будь ласка, ім’я',
      phoneError: 'Вкажіть номер телефону повністю',
      serviceError: 'Оберіть послугу',
      done: 'Гаразд'
    }
  };
})();
