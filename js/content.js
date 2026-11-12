/* ==========================================================================
   M&D — content.js
   Single source of truth for every piece of copy on the page.

   How it maps to the markup (see renderContent() in main.js):
     data-t="hero.subhead"                 → element text
     data-t-attr="aria-label:a11y.menu"    → element attribute (";" separates several)
     data-list="services.items"            → repeats the inner <template> per item;
                                             inside it, keys are relative to the item
     data-index                            → 01, 02, 03… inside a list

   Wrap a word in *asterisks* to set it in gold italics.

   Not here on purpose: <title> and the meta description stay in index.html,
   because link-preview scrapers read them without running JavaScript.
   ========================================================================== */
(function () {
  'use strict';

  var MD = (window.MD = window.MD || {});

  MD.content = {
    brand: {
      name: 'M&D',
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

    nav: {
      links: [
        { label: 'Про студію', href: '#about' },
        { label: 'Послуги', href: '#services' },
        { label: 'Роботи', href: '#gallery' },
        { label: 'Візит', href: '#visit' },
        { label: 'Контакти', href: '#contacts' }
      ],
      cta: 'Записатися'
    },

    hero: {
      eyebrow: 'Студія краси · Нові Петрівці',
      title: 'M&D — студія краси в Нових Петрівцях',
      subhead: 'Стрижки, фарбування та догляд за волоссям — для вас і всієї родини.',
      cta: 'Записатися'
    },

    about: {
      eyebrow: 'Про студію',
      title: 'Місце, куди хочеться *повертатися*',
      paragraphs: [
        'M&D — невелика студія в Нових Петрівцях, де про волосся дбають уважно й без поспіху. Тут не буває конвеєра: кожен візит починається з розмови і закінчується результатом, який вам пасує.',
        'Ми працюємо з дорослими й дітьми, тож до нас зручно приходити всією родиною.'
      ],
      imageAlt: 'Інтер’єр студії M&D'
    },

    principles: {
      eyebrow: 'Наш підхід',
      title: 'Три *принципи*',
      items: [
        {
          title: 'Слухаємо',
          text: 'Спершу розмова: що вам подобається, як ви вкладаєте волосся і скільки часу маєте на щоденний догляд.'
        },
        {
          title: 'Не поспішаємо',
          text: 'На кожен візит відводимо стільки часу, скільки потрібно, щоб зробити роботу добре — без метушні й черги.'
        },
        {
          title: 'Дбаємо про результат',
          text: 'Стрижка й колір мають добре виглядати не лише в день візиту, а й через тижні після нього.'
        }
      ]
    },

    services: {
      eyebrow: 'Що ми робимо',
      title: 'Послуги',
      items: [
        { name: 'Стрижка' },
        { name: 'Фарбування' },
        { name: 'Догляд' },
        { name: 'Дитяча стрижка' }
      ]
    },

    gallery: {
      eyebrow: 'Портфоліо',
      title: 'Роботи',
      // Swap photos here: square images, ~1100px on the long side.
      items: [
        { src: 'assets/img/gallery/work-01.jpg', alt: 'Робота студії M&D — фото 1' },
        { src: 'assets/img/gallery/work-02.jpg', alt: 'Робота студії M&D — фото 2' },
        { src: 'assets/img/gallery/work-03.jpg', alt: 'Робота студії M&D — фото 3' },
        { src: 'assets/img/gallery/work-04.jpg', alt: 'Робота студії M&D — фото 4' },
        { src: 'assets/img/gallery/work-05.jpg', alt: 'Робота студії M&D — фото 5' },
        { src: 'assets/img/gallery/work-06.jpg', alt: 'Робота студії M&D — фото 6' }
      ]
    },

    visit: {
      eyebrow: 'Процес',
      title: 'Як проходить *візит*',
      steps: [
        {
          title: 'Запис',
          text: 'Телефонуєте або залишаєте заявку — разом підбираємо зручний день і час.'
        },
        {
          title: 'Консультація',
          text: 'Обговорюємо побажання, дивимось на стан волосся і домовляємось про результат.'
        },
        {
          title: 'Робота й поради',
          text: 'Робимо стрижку, фарбування чи догляд і підказуємо, як підтримувати результат удома.'
        }
      ]
    },

    contacts: {
      eyebrow: 'Контакти',
      title: 'Готові до *змін*?',
      lead: 'Запишіться онлайн, зателефонуйте або просто завітайте до нас.',
      cta: 'Записатися',
      // PLACEHOLDERS — replace with the studio's real phone and address.
      phone: {
        label: 'Телефон',
        value: '+380 00 000 00 00',
        href: 'tel:+380000000000'
      },
      address: {
        label: 'Адреса',
        value: 'Нові Петрівці, Київська область',
        href: 'https://www.google.com/maps/search/?api=1&query=%D0%9D%D0%BE%D0%B2%D1%96+%D0%9F%D0%B5%D1%82%D1%80%D1%96%D0%B2%D1%86%D1%96%2C+%D0%9A%D0%B8%D1%97%D0%B2%D1%81%D1%8C%D0%BA%D0%B0+%D0%BE%D0%B1%D0%BB%D0%B0%D1%81%D1%82%D1%8C'
      }
    },

    booking: {
      eyebrow: 'Онлайн-запис',
      title: 'Записатися',
      lead: 'Залиште контакти — ми зателефонуємо, щоб узгодити день і час.',
      name: {
        label: 'Ім’я',
        placeholder: 'Як до вас звертатися',
        error: 'Вкажіть, будь ласка, ім’я'
      },
      phone: {
        label: 'Телефон',
        placeholder: '+380',
        error: 'Вкажіть номер телефону повністю'
      },
      service: {
        label: 'Послуга',
        placeholder: 'Оберіть послугу',
        error: 'Оберіть послугу'
      },
      submit: 'Надіслати заявку',
      success: {
        title: 'Дякуємо!',
        text: 'Заявку прийнято. Ми зателефонуємо вам найближчим часом.',
        button: 'Гаразд'
      }
    },

    footer: {
      copy: '© M&D · Студія краси · Нові Петрівці'
    }
  };
})();
