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
      menuClose: 'Закрити меню'
    },

    nav: {
      links: [
        { label: 'Про студію', href: '#about' },
        { label: 'Принципи', href: '#principles' },
        { label: 'Послуги', href: '#services' }
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

    booking: {
      eyebrow: 'Запис',
      title: 'Записатися'
    }
  };
})();
