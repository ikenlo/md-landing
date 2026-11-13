# M&D Beauty Studio — лендинг

Статичний односторінковий сайт перукарської студії M&D у Нових Петрівцях.
Бекенду немає: запис відбувається в Telegram-боті, усі кнопки «Записатися»
ведуть на `https://t.me/Mdstudioobot`.

## Структура

```
index.html            розмітка; тексти підставляються з js/content.js
css/style.css         стилі (mobile-first, токени кольорів і типографіки)
js/content.js         УСІ тексти, прайс, контакти, шляхи до фото (ES-модуль)
js/ui-text.js         службові тексти: підписи для скрінрідерів, надзаголовки
js/animations.js      анімації GSAP / ScrollTrigger
js/main.js            логіка: меню, лайтбокс, плавний скрол (Lenis)
assets/img/           зображення (зараз — заглушки)
robots.txt, sitemap.xml
```

GSAP, ScrollTrigger, Lenis і шрифти Google Fonts підключаються з CDN,
тож збирати нічого не потрібно.

## Локальний запуск

`js/content.js` — це ES-модуль, а браузери не завантажують модулі з
`file://`. Тому подвійний клік по `index.html` покаже порожню сторінку.
Запускайте через будь-який локальний сервер у папці проєкту:

```bash
python3 -m http.server 8000
# або
npx serve .
```

і відкрийте `http://localhost:8000`. У VS Code підійде розширення Live Server.

## Деплой

Збірки немає: публікується сама папка проєкту як є.

### Vercel

1. Завантажте репозиторій на GitHub (якщо ще не там).
2. На [vercel.com](https://vercel.com) → **Add New… → Project** → оберіть репозиторій.
3. Налаштування:
   - **Framework Preset:** `Other`
   - **Build Command:** залиште порожнім
   - **Output Directory:** `.` (корінь репозиторію)
4. **Deploy**. Кожен наступний push у вибрану гілку публікується автоматично.

Без GitHub: встановіть CLI (`npm i -g vercel`) і в папці проєкту виконайте
`vercel` (тестовий деплой) або `vercel --prod` (продакшн).

### Netlify

1. На [netlify.com](https://app.netlify.com) → **Add new site → Import an existing project** → GitHub → оберіть репозиторій.
2. Налаштування:
   - **Build command:** залиште порожнім
   - **Publish directory:** `.`
3. **Deploy site**.

Найшвидший варіант без GitHub: **Add new site → Deploy manually** і перетягніть
папку проєкту у вікно браузера.

### Власний домен

У Vercel: **Project → Settings → Domains**. У Netlify: **Site configuration →
Domain management**. Сервіс покаже, які DNS-записи додати у реєстратора домену.
HTTPS вмикається автоматично.

## Перед запуском: що замінити

**1. Домен.** `md-studio.com.ua` — тимчасовий. Замініть на справжній у:
- `index.html` — `<link rel="canonical">`, `og:url`, `og:image`
- `robots.txt` — рядок `Sitemap:`
- `sitemap.xml` — `<loc>`

`og:image` має бути повною адресою з `https://`, інакше Telegram, Viber і
Facebook не покажуть картинку в прев'ю посилання.

**2. Фото.** Зараз усі зображення — абстрактні заглушки. Замініть файли,
зберігаючи імена (або змініть шляхи в `js/content.js` для галереї):

| Файл | Розмір | Де |
|---|---|---|
| `assets/img/hero-mobile.jpg` | 900×1600 | фон першого екрана на телефоні |
| `assets/img/hero-desktop.jpg` | 1920×1200 | фон першого екрана на комп'ютері |
| `assets/img/about.jpg` | 1200×1500 (4:5) | блок «Про студію» |
| `assets/img/gallery/work1.jpg … work6.jpg` | квадрат, ~1100×1100 | «Наші роботи» |
| `assets/img/og-preview.jpg` | 1200×630 | картинка в прев'ю посилання |

Стискайте JPEG до якості ~75–80 % (наприклад, у [squoosh.app](https://squoosh.app)),
щоб сторінка швидко відкривалась на мобільному інтернеті.

**3. Рік у копірайті.** У `js/content.js` → `footer.copyright` зараз стоїть 2027.

## Як змінити тексти й ціни

Усе редагується в `js/content.js`: прайс — `services.categories`, контакти —
`contacts`, кроки візиту — `visit.steps`. HTML чіпати не потрібно. Після
змін просто зробіть push — Vercel/Netlify оновлять сайт самі.

Посилання Telegram-бота задається в одному місці — `contacts.telegramLink` —
і використовується всіма кнопками «Записатися».

## Перевірка після деплою

- Відкрийте сайт на телефоні й натисніть кожну кнопку «Записатися» — має відкритись бот.
- Перевірте прев'ю посилання: надішліть адресу сайту собі в Telegram або
  скористайтесь [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/).
- У консолі браузера (F12) не має бути помилок.
