# Persian Markdown Preview · پیش‌نمایش Markdown فارسی

یک ابزار استاتیک و سبک برای نمایش فایل‌های Markdown با تجربه‌ی خواندن بهتر برای فارسی و راست‌چین (RTL). همه‌ی پردازش داخل مرورگر انجام می‌شود و هیچ فایلی به سرور ارسال نمی‌شود.

> A privacy-friendly, in-browser Markdown viewer with first-class RTL/Persian support, extended syntax, and Mermaid diagrams. Everything runs client-side — no file ever leaves your browser.

![پیش‌نمایش برنامه](demo.png)

## ویژگی‌ها

- **سه روش ورودی**: بارگذاری فایل `.md`/`.markdown`، پیست کردن مستقیم متن، یا لینک عمومی با پارامتر `?url=`
- **راست‌چین واقعی**: متن فارسی به‌صورت `rtl` و بلوک‌های کد به‌صورت `ltr` نمایش داده می‌شوند
- **سازگار با موبایل**: خواندن فایل بدون وابستگی به `FileReader` (پشتیبانی از مرورگرهای داخل‌برنامه‌ای اندروید/iOS)
- **پردازش کاملاً داخل مرورگر**: بدون آپلود واقعی فایل به سرور
- **امنیت**: خروجی HTML با DOMPurify پاک‌سازی می‌شود تا ریسک XSS کاهش یابد
- فونت Vazirmatn به‌صورت self-host از npm
- محدودیت حجم فایل تا ۲ مگابایت برای جلوگیری از کندی مرورگر
- آماده برای deploy روی Cloudflare Pages، Netlify، Vercel یا GitHub Pages

## سینتکس‌های پشتیبانی‌شده

علاوه بر Markdown پایه، این موارد از [سینتکس گسترده](https://www.markdownguide.org/extended-syntax/) پشتیبانی می‌شوند:

- جدول‌ها، بلوک کد با تشخیص زبان (highlight.js)
- فهرست کارها `- [ ]` / `- [x]`
- پانویس `[^1]` و شناسه‌ی خودکار سرتیترها (برای anchor و فهرست مطالب، حتی با متن فارسی)
- کال‌اوت‌های سبک GitHub: `> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]`
- های‌لایت `==متن==`، زیرنویس `H~2~O`، بالانویس `E=mc^2^`
- خط‌خورده `~~متن~~` و فهرست تعریف (`Term` / `: definition`)
- ایموجی با شورت‌کد مثل `:rocket:`
- زیرخط `<ins>`، تصویر با اندازه/کپشن (`<figure>`)
- **نمودارهای Mermaid** (دایره‌ای/pie، فلوچارت، گانت و ...) که فقط هنگام نیاز به‌صورت تنبل بارگذاری می‌شوند:

  ````markdown
  ```mermaid
  pie title سهم زبان‌ها
      "فارسی" : 70
      "انگلیسی" : 30
  ```
  ````

## نصب

```bash
npm install
```

## اجرای لوکال

```bash
npm run dev
```

## ساخت نسخه production

```bash
npm run build
```

خروجی داخل پوشه `dist` ساخته می‌شود.

## پیشنهاد Deploy روی Cloudflare Pages

```txt
Framework preset: Vite
Build command: npm run build
Build output directory: dist
```

## نکته امنیتی

این پروژه فایل را به سرور ارسال نمی‌کند. با این حال، چون Markdown می‌تواند HTML تولید کند، خروجی با DOMPurify (به‌همراه پروفایل SVG برای آیکون‌ها و نمودارها) sanitize می‌شود. اگر در آینده قابلیت ذخیره، اشتراک‌گذاری لینک یا API اضافه شد، باید اعتبارسنجی و sanitize سمت سرور هم اضافه شود.

## مشارکت

Issue و Pull Request خوش‌آمد است. پیش از ارسال PR، از سبز بودن این دو مطمئن شوید:

```bash
npm run lint
npm run build
```

## لایسنس

این پروژه تحت لایسنس [MIT](LICENSE) منتشر شده است.
