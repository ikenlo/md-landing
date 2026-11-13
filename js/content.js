export const CONTENT = {
  brand: {
    // Wordmark under the calligraphy logo (shown in capitals by CSS)
    wordmark: "Beauty Salon"
  },
  nav: {
    about: "Про студію",
    services: "Послуги",
    gallery: "Роботи",
    visit: "Як проходить візит",
    contacts: "Контакти",
    cta: "Записатися"
  },
  hero: {
    eyebrow: "Студія краси · Нові Петрівці",
    title: "M&D",
    subhead: "Перукарська студія, де деталі мають значення",
    cta: "Записатися",
    secondary: "Дізнатися більше"
  },
  about: {
    title: "Не просто стрижка",
    p1: "Ми віримо, що справжня краса починається з турботи. У M&D кожен візит — це не просто процедура, а час, присвячений саме вам.",
    p2: "Маргарита та команда майстрів створюють простір, де ви можете розслабитися, довіритися професіоналам і вийти з відчуттям впевненості."
  },
  principles: {
    title: "Три речі, на яких стоїть M&D",
    items: [
      { title: "Чесні матеріали", desc: "Ми використовуємо ті засоби, у які віримо самі, обираючи найкраще для вашого волосся." },
      { title: "Уважна консультація", desc: "Слухаємо ваші побажання перед тим, як брати до рук ножиці. Ваш комфорт — наш пріоритет." },
      { title: "Стійкий результат", desc: "Створюємо зачіски, які легко повторити вдома і які тримають форму до наступного візиту." }
    ]
  },
  services: {
    title: "Послуги",
    // Each item: name, price, and details { time, materials, description } shown
    // in the bottom sheet. Items marked PLACEHOLDER still carry sample text.
    note: "Ціни вказані за базові послуги. Фінальна вартість залежить від довжини та густоти волосся.",
    categories: [
      {
        name: "Жіночі стрижки",
        items: [
          {
            name: "Коротке волосся",
            price: "400 грн",
            details: {
              time: "45 хв",
              materials: "Шампунь, бальзам, професійний стайлінг",
              description: "Стрижка, що підкреслює риси обличчя та додає легкості."
            }
          },
          {
            name: "До плечей",
            price: "450 грн",
            details: {  // PLACEHOLDER — replace with real data
              time: "60 хв",
              materials: "Професійний шампунь, бальзам",
              description: "Стрижка волосся до плечей з урахуванням типу та густоти. Миття, стрижка й укладка."
            }
          },
          {
            name: "До лопаток",
            price: "500 грн",
            details: {  // PLACEHOLDER — replace with real data
              time: "60–75 хв",
              materials: "Професійний шампунь, бальзам, термозахист",
              description: "Стрижка середньої довжини: каскад, рівний зріз або м’яка філіровка кінчиків."
            }
          },
          {
            name: "Довге волосся",
            price: "від 550 грн",
            details: {  // PLACEHOLDER — replace with real data
              time: "75–90 хв",
              materials: "Професійний шампунь, маска, термозахист",
              description: "Стрижка довгого волосся зі збереженням довжини. Вартість залежить від густоти."
            }
          },
          {
            name: "Дуже довге / густе",
            price: "від 650 грн",
            details: {  // PLACEHOLDER — replace with real data
              time: "90–120 хв",
              materials: "Професійний шампунь, маска, незмивний догляд",
              description: "Для дуже довгого або густого волосся, яке потребує більше часу й уваги майстра."
            }
          }
        ]
      },
      {
        name: "Чоловічі стрижки",
        items: [
          {
            name: "Модельна стрижка",
            price: "450 грн",
            details: {  // PLACEHOLDER — replace with real data
              time: "45 хв",
              materials: "Шампунь, стайлінг-засіб",
              description: "Чоловіча стрижка ножицями й машинкою з оформленням контурів і укладкою."
            }
          },
          {
            name: "Стрижка машинкою",
            price: "350 грн",
            details: {  // PLACEHOLDER — replace with real data
              time: "30 хв",
              materials: "Шампунь",
              description: "Стрижка машинкою з однією або кількома насадками, акуратний контур."
            }
          },
          {
            name: "Машинка + ножиці",
            price: "400 грн",
            details: {  // PLACEHOLDER — replace with real data
              time: "40 хв",
              materials: "Шампунь, стайлінг-засіб",
              description: "Комбінована стрижка: машинка на скронях і потилиці, ножиці зверху."
            }
          }
        ]
      },
      {
        name: "Додаткові послуги",
        items: [
          {
            name: "Миття голови",
            price: "50 грн",
            details: {  // PLACEHOLDER — replace with real data
              time: "10 хв",
              materials: "Професійний шампунь, бальзам",
              description: "Миття з масажем шкіри голови. Додається до будь-якої стрижки."
            }
          }
        ]
      }
    ]
  },
  gallery: {
    title: "Наші роботи",
    images: [
      { src: "assets/img/gallery/work1.jpg", alt: "Жіноча стрижка" },
      { src: "assets/img/gallery/work2.jpg", alt: "Фарбування волосся" },
      { src: "assets/img/gallery/work3.jpg", alt: "Укладка" },
      { src: "assets/img/gallery/work4.jpg", alt: "Чоловіча стрижка" },
      { src: "assets/img/gallery/work5.jpg", alt: "Догляд за волоссям" },
      { src: "assets/img/gallery/work6.jpg", alt: "Результат фарбування" }
    ]
  },
  visit: {
    title: "Як проходить візит",
    steps: [
      { num: "01", title: "Запис", desc: "Обираєте зручний час у Telegram-боті." },
      { num: "02", title: "Консультація", desc: "Слухаємо ваші побажання й пропонуємо рішення." },
      { num: "03", title: "Результат", desc: "Виходите з відчуттям, що вас зрозуміли." }
    ]
  },
  cta: {
    title: "Готові до змін?",
    subhead: "Натисніть, щоб перейти до нашого Telegram-бота та обрати зручний час."
  },
  contacts: {
    title: "Нові Петрівці",
    phone: "+380 68 123 4503",
    phoneLink: "tel:+380681234503",
    address: "провулок Першого Травня, 20",
    addressLink: "https://maps.google.com/?q=Київська+область,+Нові+Петрівці,+провулок+Першого+Травня,+20",
    instagram: "@hairstudio.md",
    instagramLink: "https://www.instagram.com/hairstudio.md",
    telegram: "@Mdstudioobot",
    telegramLink: "https://t.me/Mdstudioobot"
  },
  footer: {
    copyright: "© 2027 ФОП Варченко Маргарита Сергіївна",
    tagline: "Студія краси у Нових Петрівцях"
  }
};
