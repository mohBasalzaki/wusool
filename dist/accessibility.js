let translations = {};
let currentLanguage = 'ar'; // اللغة الافتراضية

/**
 * دالة لجلب ملف الترجمة JSON
 */
async function fetchTranslations() {
    try {
        const response = await fetch('translations.json');
        if (!response.ok) {
            // في بيئة التطوير المحلية، تأكد من تشغيل خادم محلي لتجنب خطأ CORS
            console.warn('Failed to fetch translations.json. Status:', response.status);
            // قد تحتاج إلى تحميل ترجمات افتراضية هنا إذا فشل الجلب
            return;
        }
        translations = await response.json();
        applyTranslations(currentLanguage); // تطبيق الترجمة الافتراضية بعد التحميل
    } catch (error) {
        console.error('Failed to load translations:', error);
    }
}

/**
 * دالة لتطبيق الترجمات على عناصر HTML
 * @param {string} langCode - رمز اللغة (مثل 'ar', 'en')
 */
function applyTranslations(langCode) {
    const langData = translations[langCode];
    if (!langData) {
        console.error(`Translation data for language ${langCode} not found.`);
        return;
    }

    // تغيير اتجاه الصفحة بناءً على اللغة
    document.documentElement.lang = langCode;
    document.body.style.direction = (langCode === 'ar') ? 'rtl' : 'ltr';
    // التأكد من أن اللوحة مفتوحة قبل محاولة الوصول إليها
    const panel = document.querySelector('.a11y-panel');
    if (panel) {
        panel.style.direction = (langCode === 'ar') ? 'rtl' : 'ltr';
    }


    // زر فتح لوحة إمكانية الوصول - تغيير السمة
    document.querySelector('.a11y-widget-btn').setAttribute('aria-label', langData.open_accessibility_options || 'Accessibility Options');

    // تحديث النصوص باستخدام سمة البيانات 'data-i18n'
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = langData[key];
        
        if (translation) {
            // تحديث محتوى النصوص
            if (element.tagName === 'SPAN' || element.tagName === 'H3' || element.tagName === 'LABEL') {
                element.textContent = translation;
            }
            // للأزرار (العناصر التي بداخلها span)
            else if (element.tagName === 'BUTTON' && element.querySelector('span')) {
                element.querySelector('span').textContent = translation;
            }
            // لخيارات الـ <select>
            else if (element.tagName === 'OPTION') {
                element.textContent = translation;
            }
        }
    });
}

/**
 * دالة تُستدعى عند تغيير قائمة اختيار اللغة
 */
function changeLanguage() {
    const select = document.getElementById('a11y-lang');
    if (select && select.value) {
        currentLanguage = select.value;
        applyTranslations(currentLanguage);
    }
}

/**
 * إعداد مُستمع الحدث لعنصر اختيار اللغة
 */
function setupLanguageListener() {
    const langSelect = document.getElementById('a11y-lang');
    if (langSelect) {
        langSelect.removeEventListener('change', changeLanguage); // إزالة أي مستمع سابق لتجنب التكرار
        langSelect.addEventListener('change', changeLanguage);
        // تعيين القيمة الافتراضية لتعكس اللغة الحالية
        langSelect.value = currentLanguage;
    } else {
        console.error("Language select element not found.");
    }
}


document.addEventListener("DOMContentLoaded", function () {
    // 1. تعريف HTML باستخدام مفاتيح i18n
    const a11yHTML = `
    <style>
        :root {
            --primary-color: #f97316;
        }
        /* ... باقي أنماط CSS كما هي ... */
        .a11y-widget-btn {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 50px;
            height: 50px;
            padding: 0;
            border: none;
            cursor: pointer;
            z-index: 9999;
            background: transparent;
            transition: all 0.3s ease;
        }
        .a11y-widget-btn:hover {
            transform: scale(1.1);
        }
        .a11y-widget-btn svg {
            width: 28px;
            height: 28px;
            color: white;
        }
        .a11y-panel {
            position: fixed;
            top: 0;
            right: -400px;
            width: 400px;
            height: 100vh;
            background: white;
            box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            transition: right 0.3s ease;
            overflow-y: auto;
            direction: rtl; /* سيتغير بواسطة JS */
        }
        .a11y-panel.open {
            right: 0;
        }
        .a11y-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9998;
            display: none;
        }
        .a11y-overlay.open {
            display: block;
        }
        .a11y-header {
            padding: 10px 20px;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .a11y-title img {
            width: 100px;
        }
        .a11y-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #6b7280;
        }
        .a11y-content {
            padding: 20px;
        }
        .a11y-section, .a11y-form-section {
            margin-bottom: 20px;
        }
        .a11y-section-title {
            display: flex;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 12px;
            color: #374151;
            gap: 0.25em;
        }
        .a11y-form-section {
            display: flex;
            flex-direction: column;
        }
        .a11y-form-section label {
            margin-bottom: 5px;
        }
        .a11y-form {
            padding: 10px 16px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: white;
            cursor: pointer;
            font-size: 14px;
            color: #374151;
        }
        .a11y-form:focus, .a11y-form:hover {
            border-color: var(--primary-color)
        }
        .a11y-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }
        .a11y-btn {
            display: flex;
            align-items: center;
            flex-direction: column;
            padding: 10px 16px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: white;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s ease;
            color: #374151;
            gap: 5px;
        }
        .a11y-btn:hover {
            background: #f3f4f6;
            border-color: var(--primary-color);
        }
        .a11y-btn.active {
            background: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
        }
        .a11y-btn svg {
            width: 20px;
        }
        
        body.dyslexia, body.dyslexia * { font-family: Arial, sans-serif !important; }
        body.high-contrast { background: #000 !important; color: #fff !important; }
        body.dark-mode { filter: invert(0.9) hue-rotate(180deg) !important; }
        body.hide-images img { display: none !important; }
        body.large-buttons a, body.large-buttons button { transform: scale(1.2) !important; }
        body.line-spacing, body.line-spacing * { line-height: 1.8 !important; }
        body.letter-spacing, body.letter-spacing * { letter-spacing: 0.125rem !important; }
        body.hide-videos video, body.hide-videos iframe { display: none !important; }
        body.sepia { filter: sepia(0.8) !important; }
        body.invert { filter: invert(1) hue-rotate(180deg) !important; }
        body.grayscale { filter: grayscale(1) !important; }
        body.underline-links a { text-decoration: underline !important; }
        body.bold-text, body.bold-text * { font-weight: 700 !important; }
        body.mono-font, body.mono-font * { font-family: monospace !important; }
        body.reduce-motion * { transition: none !important; animation: none !important; }
    </style>

    <button class="a11y-widget-btn" onclick="toggleA11yPanel()" data-i18n-aria="open_accessibility_options">
        <img src="https://wusool.pages.dev/dist/img/icon.svg" alt="">
    </button>

    <div class="a11y-overlay" onclick="toggleA11yPanel()"></div>

    <div class="a11y-panel">
        <div class="a11y-header">
            <a href="https://wusool.pages.dev/" target="_blank" class="a11y-title">
                <img src="https://wusool.pages.dev/dist/img/logo.svg" alt="">
            </a>
            <button class="a11y-close" onclick="toggleA11yPanel()">&times;</button>
        </div>

        <div class="a11y-content">
            <div class="a11y-form-section">
                <label data-i18n="language" for="a11y-lang">اللغة</label>
                <select class="a11y-form" name="a11y-lang" id="a11y-lang">
                    <option data-i18n="select_language" value="">حدد اللغة</option>
                    <option data-i18n="arabic" value="ar">عربي</option>
                    <option data-i18n="english" value="en">English</option>
                    <option data-i18n="french" value="fr">France</option>
                </select>
            </div>

            <div class="a11y-section">
                <h3 class="a11y-section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type h-5 w-5 text-primary"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" x2="15" y1="20" y2="20"></line><line x1="12" x2="12" y1="4" y2="20"></line></svg>
                    <span data-i18n="content_adjustments">تعديلات المحتوى</span>
                </h3>

                <div class="a11y-buttons">
                    <button class="a11y-btn" onclick="changeFontSize(2)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zoom-in h-4 w-4"><circle cx="11" cy="11" r="8"></circle><line x1="21" x2="16.65" y1="21" y2="16.65"></line><line x1="11" x2="11" y1="8" y2="14"></line><line x1="8" x2="14" y1="11" y2="11"></line></svg>
                        <span data-i18n="increase_font">تكبير الخط</span>
                    </button>
                    <button class="a11y-btn" onclick="changeFontSize(-2)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zoom-out h-4 w-4"><circle cx="11" cy="11" r="8"></circle><line x1="21" x2="16.65" y1="21" y2="16.65"></line><line x1="8" x2="14" y1="11" y2="11"></line></svg>
                        <span data-i18n="decrease_font">تصغير الخط</span>
                    </button>
                    <button class="a11y-btn" onclick="toggleClass(this, 'dyslexia')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open h-4 w-4"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>
                        <span data-i18n="readable_font">خط سهل القراءة</span>
                    </button>
                    <button class="a11y-btn" onclick="toggleClass(this, 'line-spacing')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-space h-4 w-4"><path d="M22 17v1c0 .5-.5 1-1 1H3c-.5 0-1-.5-1-1v-1"></path></svg>
                        <span data-i18n="line_spacing">تباعد الأسطر</span>
                    </button>
                    <button class="a11y-btn" onclick="toggleClass(this, 'letter-spacing')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-letter-text h-4 w-4"><path d="M15 12h6"></path><path d="M15 6h6"></path><path d="m3 13 3.553-7.724a.5.5 0 0 1 .894 0L11 13"></path><path d="M3 18h18"></path><path d="M4 11h6"></path></svg>
                        <span data-i18n="letter_spacing">تباعد الحروف</span>
                    </button>
                    <button class="a11y-btn" onclick="toggleClass(this, 'bold-text')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bold h-4 w-4"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"></path></svg>
                        <span data-i18n="bold_text">خط عريض</span>
                    </button>
                    <button class="a11y-btn" onclick="toggleClass(this, 'mono-font')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus h-4 w-4 rotate-90"><path d="M5 12h14"></path></svg>
                        <span data-i18n="mono_font">خط أحادي</span>
                    </button>
                    <button class="a11y-btn" onclick="toggleClass(this, 'underline-links')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-underline h-4 w-4"><path d="M6 4v6a6 6 0 0 0 12 0V4"></path><line x1="4" x2="20" y1="20" y2="20"></line></svg>
                        <span data-i18n="underline_links">تسطير الروابط</span>
                    </button>
                </div>
            </div>

            <div class="a11y-section">
                <h3 class="a11y-section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-palette h-5 w-5 text-primary"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>
                    <span data-i18n="color_adjustments">تعديلات الألوان</span>
                </h3>

                <div class="a11y-buttons">
                    <button class="a11y-btn" onclick="toggleClass(this, 'high-contrast')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-contrast h-4 w-4"><circle cx="12" cy="12" r="10"></circle><path d="M12 18a6 6 0 0 0 0-12v12z"></path></svg>
                        <span data-i18n="high_contrast">تباين عالي</span>
                    </button>
                    <button class="a11y-btn" onclick="toggleClass(this, 'dark-mode')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon h-4 w-4"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
                        <span data-i18n="dark_mode">وضع ليلي</span>
                    </button>
                    <button class="a11y-btn" onclick="toggleClass(this, 'sepia')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun h-4 w-4"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
                        <span data-i18n="sepia_color">لون بني</span>
                    </button>
                    <button class="a11y-btn" onclick="toggleClass(this, 'invert')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-paintbrush h-4 w-4"><path d="m14.622 17.897-10.68-2.913"></path><path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z"></path><path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15"></path></svg>
                        <span data-i18n="invert_colors">عكس الألوان</span>
                    </button>
                    <button class="a11y-btn" onclick="toggleClass(this, 'grayscale')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-palette h-4 w-4"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>
                        <span data-i18n="grayscale">وضع رمادي</span>
                    </button>
                </div>
            </div>

            <div class="a11y-section">
                <h3 class="a11y-section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles h-5 w-5 text-primary"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>
                    <span data-i18n="additional_tools">أدوات إضافية</span>
                </h3>

                <div class="a11y-buttons">
                    <button class="a11y-btn" onclick="toggleClass(this, 'large-buttons')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-maximize2 h-4 w-4"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" x2="14" y1="3" y2="10"></line><line x1="3" x2="10" y1="21" y2="14"></line></svg>
                        <span data-i18n="large_buttons">تكبير الأزرار</span>
                    </button>
                    <button class="a11y-btn" onclick="toggleClass(this, 'hide-images')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-off h-4 w-4"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"></path><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"></path><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"></path><path d="m2 2 20 20"></path></svg>
                        <span data-i18n="hide_images">إخفاء الصور</span>
                    </button>
                    <button class="a11y-btn" onclick="toggleClass(this, 'hide-videos')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-video-off h-4 w-4"><path d="M10.66 6H14a2 2 0 0 1 2 2v2.5l5.248-3.062A.5.5 0 0 1 22 7.87v8.196"></path><path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2"></path><path d="m2 2 20 20"></path></svg>
                        <span data-i18n="hide_videos">إخفاء الفيديو</span>
                    </button>
                    <button class="a11y-btn" onclick="toggleClass(this, 'reduce-motion')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play h-4 w-4"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
                        <span data-i18n="disable_animations">إلغاء الحركات</span>
                    </button>
                    <button class="a11y-btn" onclick="readPage()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume2 h-4 w-4"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"></path><path d="M16 9a5 5 0 0 1 0 6"></path><path d="M19.364 18.364a9 9 0 0 0 0-12.728"></path></svg>
                        <span data-i18n="read_text">قراءة النص</span>
                    </button>
                </div>
            </div>

            <button data-i18n="reset_all" class="a11y-btn" onclick="resetAll()" style="width: 100%; margin-top: 16px; background: var(--primary-color); color: white; border-color: var(--primary-color);">
                <span>إعادة تعيين الكل</span>
            </button>
        </div>
    </div>
    `;
    
    // 2. إضافة الـ HTML إلى الـ DOM
    document.body.insertAdjacentHTML("beforeend", a11yHTML);
    
    // 3. استدعاء الدوال بعد إضافة العناصر:
    fetchTranslations(); // جلب الترجمات وتطبيقها
    setupLanguageListener(); // إعداد مستمع اللغة الآن بعد وجود العنصر
});

let currentFontSize = 16;

function toggleA11yPanel() {
    document.querySelector('.a11y-panel').classList.toggle('open');
    document.querySelector('.a11y-overlay').classList.toggle('open');
}

/**
 * دالة تبديل الفئة (Class) على جسم الصفحة
 * تم تعديلها لتمرير العنصر الذي تم النقر عليه (this) والفئة المطلوبة.
 * @param {HTMLElement} element - العنصر الذي تم النقر عليه (عادةً 'this')
 * @param {string} className - اسم الفئة المراد تبديلها على body
 */
function toggleClass(element, className) {
    document.body.classList.toggle(className);
    if (element) {
        element.classList.toggle('active');
    }
}

function changeFontSize(change) {
    currentFontSize += change;
    if (currentFontSize >= 12 && currentFontSize <= 32) {
    document.body.style.fontSize = currentFontSize + 'px';
    } else {
    currentFontSize -= change;
    }
}

function readPage() {
    // يجب استهداف المحتوى الرئيسي بدلاً من body.innerText لتجنب قراءة القائمة الجانبية بالكامل
    const mainContent = document.body.innerText.replace(document.querySelector('.a11y-panel').innerText, '');
    const utterance = new SpeechSynthesisUtterance(mainContent);
    utterance.lang = (currentLanguage === 'ar') ? 'ar-SA' : 'en-US';
    speechSynthesis.speak(utterance);
}

function resetAll() {
    document.body.className = '';
    document.body.style.fontSize = '16px';
    currentFontSize = 16;
    document.querySelectorAll('.a11y-btn.active').forEach(btn => {
    btn.classList.remove('active');
    });

    // إعادة تعيين اللغة إلى القيمة الافتراضية وتطبيق الترجمة
    currentLanguage = 'ar';
    const langSelect = document.getElementById('a11y-lang');
    if(langSelect) {
        langSelect.value = currentLanguage;
    }
    applyTranslations(currentLanguage);
}
