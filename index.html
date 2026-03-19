<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#0f172a">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="QA Factory">
    <title>نظام إدارة الجودة | QA System</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    <!-- Chart.js for Analytics -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- Day.js for date manipulation in charts -->
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Heebo:wght@400;700&display=swap');
        
        body { 
            font-family: 'Cairo', 'Heebo', sans-serif; 
            -webkit-tap-highlight-color: transparent; /* Remove tap highlight on mobile */
        }
        .hebrew-text { font-family: 'Heebo', sans-serif; }
        
        /* Transitions */
        .fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        /* Form Element Styling */
        input:focus, select:focus, textarea:focus { 
            outline: none; 
            border-color: #10b981; 
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2); 
        }
        
        /* Card Hover Effects */
        .form-card:active { transform: scale(0.98); } /* Mobile feedback */
        @media (min-width: 768px) {
            .form-card:hover { transform: translateY(-3px); }
        }

        /* Custom Scrollbar for horizontal tables */
        .overflow-x-auto::-webkit-scrollbar { height: 4px; } /* Thinner for mobile */
        .overflow-x-auto::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
        
        /* Safe Area for iPhones */
        .safe-pb { padding-bottom: env(safe-area-inset-bottom); }
    </style>
</head>
<body class="bg-slate-100 min-h-screen pb-24 safe-pb">

    <!-- Navbar -->
    <nav class="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4">
            <div class="flex items-center justify-between h-16">
                <div class="flex items-center gap-3 cursor-pointer" onclick="app.showDashboard()">
                    <i class="fa-solid fa-industry text-emerald-400 text-xl"></i>
                    <div>
                        <span class="font-bold text-lg block leading-none">מערכת איכות</span>
                        <span class="text-xs text-slate-400">Smart Factory System</span>
                    </div>
                </div>
                <!-- Navigation Tabs (Desktop) -->
                <div class="hidden md:flex gap-4 text-sm items-center">
                    <button onclick="app.showDashboard()" class="hover:text-emerald-400 transition flex items-center gap-2">
                        <i class="fa-solid fa-home"></i> <span>الرئيسية</span>
                    </button>
                    <button onclick="app.showLog()" class="hover:text-emerald-400 transition flex items-center gap-2">
                        <i class="fa-solid fa-table"></i> <span>السجل</span>
                    </button>
                    <button onclick="app.showAnalytics()" class="hover:text-emerald-400 transition flex items-center gap-2">
                        <i class="fa-solid fa-chart-pie"></i> <span>التحليل</span>
                    </button>
                    <button onclick="app.showSettings()" class="hover:text-emerald-400 transition flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 ml-2">
                        <i class="fa-solid fa-gear"></i>
                    </button>
                </div>
                <!-- Mobile Settings Button (Only visible on mobile) -->
                <button onclick="app.showSettings()" class="md:hidden text-slate-400 hover:text-white">
                    <i class="fa-solid fa-gear text-xl"></i>
                </button>
            </div>
        </div>
    </nav>

    <!-- Bottom Navigation Bar (Mobile Only) -->
    <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 pb-[env(safe-area-inset-bottom)]">
        <div class="flex justify-around items-center h-16">
            <button onclick="app.showDashboard()" class="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-emerald-600 focus:text-emerald-600">
                <i class="fa-solid fa-home text-xl mb-1"></i>
                <span class="text-[10px]">الرئيسية</span>
            </button>
            <button onclick="app.showLog()" class="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-emerald-600 focus:text-emerald-600">
                <i class="fa-solid fa-table text-xl mb-1"></i>
                <span class="text-[10px]">السجل</span>
            </button>
            <button onclick="app.showAnalytics()" class="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-emerald-600 focus:text-emerald-600">
                <i class="fa-solid fa-chart-pie text-xl mb-1"></i>
                <span class="text-[10px]">التحليل</span>
            </button>
        </div>
    </div>

    <!-- Main Container -->
    <main class="max-w-7xl mx-auto p-4 md:p-6" id="main-container">
        <!-- Content injected by JS -->
    </main>

    <!-- JavaScript Application Logic -->
    <script>
        // ==========================================
        // 1. CONFIGURATION (All Forms)
        // ==========================================
        const FORMS_CONFIG = [
            // --- PRODUCTION (ייצור) ---
            {
                id: "form_1",
                title: "בקרת יצור מנתי (טופס 1)",
                subtitle: "Batch Production (Mayonnaise/Salads)",
                category: "production",
                icon: "fa-blender",
                color: "blue",
                fields: [
                    { name: "time", label: "שעת בדיקה", type: "time", required: true },
                    { name: "product", label: "שם מוצר", type: "text", required: true, placeholder: "הכנס שם מוצר..." },
                    { name: "machine", label: "מכונה/מיקסר", type: "text" },
                    { name: "ph", label: "pH (CCP2)", type: "number", step: "0.01", required: true, isCCP: true },
                    { name: "temp", label: "טמפרטורה (CCP1)", type: "number", step: "0.1", required: true, isCCP: true },
                    { name: "texture", label: "מרקם", type: "select", options: ["תקין", "לא תקין"] },
                    { name: "taste", label: "טעם וריח", type: "select", options: ["תקין", "לא תקין"] },
                    { name: "preservative", label: "הוספת חומר משמר", type: "checkbox" },
                    { name: "operator", label: "אחראי מכונה", type: "text" }
                ],
                limits: { 
                    "מיונז": { temp: 25, ph: 4.2 },
                    "סלטים": { temp: 17, ph: 4.8 }
                }
            },
            {
                id: "form_2",
                title: "בקרת יצור רציף (טופס 2)",
                subtitle: "Continuous Production (Hummus/Tahini)",
                category: "production",
                icon: "fa-infinity",
                color: "indigo",
                fields: [
                    { name: "time", label: "שעת בדיקה", type: "time", required: true },
                    { name: "product", label: "שם מוצר", type: "text", placeholder: "חומוס / טחינה" },
                    { name: "mixer", label: "מס' מיקסר", type: "text" },
                    { name: "ph", label: "pH (CCP1)", type: "number", step: "0.01", required: true, isCCP: true, max: 4.8 },
                    { name: "temp", label: "טמפרטורה (CCP1)", type: "number", step: "0.1", required: true, isCCP: true, max: 15 },
                    { name: "texture", label: "מרקם", type: "select", options: ["תקין", "לא תקין"] },
                    { name: "taste", label: "טעם וריח", type: "select", options: ["תקין", "לא תקין"] },
                    { name: "operator", label: "אחראי מכונה", type: "text" }
                ]
            },
            {
                id: "form_6",
                title: "בקרת בישולים (טופס 6)",
                subtitle: "Cooking Room Control",
                category: "production",
                icon: "fa-fire-burner",
                color: "orange",
                fields: [
                    { name: "product", label: "שם המוצר", type: "text", required: true },
                    { name: "treatment", label: "טיפול תרמי", type: "select", options: ["בישול", "אפיה", "טיגון"] },
                    { name: "temp", label: "טמפ' אחרי טיפול (>85°C)", type: "number", step: "0.1", required: true, isCCP: true, min: 85 },
                    { name: "inspector", label: "שם המבקר", type: "text" }
                ]
            },
            {
                id: "form_28",
                title: "החלפת שמן מטגנת (טופס 28)",
                subtitle: "Fryer Oil Change Control",
                category: "production",
                icon: "fa-bottle-droplet",
                color: "yellow",
                fields: [
                    { name: "oil_type", label: "סוג השמן", type: "select", options: ["סויה", "קנולה", "חמניות"] },
                    { name: "action_date", label: "תאריך סינון/החלפה", type: "date", required: true },
                    { name: "expiry", label: "פג תוקף השמן", type: "date" },
                    { name: "employee", label: "שם העובד", type: "text" },
                    { name: "comments", label: "הערות", type: "text" }
                ]
            },
            {
                id: "form_27",
                title: "בקרת ירקות (טופס 27)",
                subtitle: "Vegetable Processing Control",
                category: "production",
                icon: "fa-carrot",
                color: "green",
                fields: [
                    { name: "veg_name", label: "שם הירק", type: "text", required: true },
                    { name: "treat_date", label: "תאריך טיפול", type: "date" },
                    { name: "visual_check", label: "נראות (V/X)", type: "checkbox" },
                    { name: "treated_check", label: "עבר טיפול (V/X)", type: "checkbox" },
                    { name: "approved", label: "אישור להמשיך (V/X)", type: "checkbox" },
                    { name: "corrective", label: "פעולה מתקנת", type: "text" }
                ]
            },

            // --- PACKAGING & STORAGE (אריזה ואחסון) ---
            {
                id: "form_3",
                title: "ביקורת איכות באריזה (טופס 3)",
                subtitle: "Packaging Quality Control",
                category: "packaging",
                icon: "fa-box-open",
                color: "purple",
                fields: [
                    { name: "product", label: "שם המוצר", type: "text", required: true },
                    { name: "product_date", label: "תאריך ייצור (Product Date)", type: "date" },
                    { name: "weight_target", label: "משקל מוצר (גרם)", type: "number" },
                    { name: "label_check", label: "בקרת תווית", type: "checkbox" },
                    { name: "expiry_check", label: "פג תוקף/קוד", type: "checkbox" },
                    { name: "sealing", label: "הלחמה/אינג'קט", type: "select", options: ["תקין", "לא תקין"] },
                    { name: "weight_samples", label: "שקילת 10 יחידות (Weighing 10 units)", type: "weight_samples" },
                    { name: "changeover_clean", label: "ניקיון בהחלפת מוצר", type: "checkbox" }
                ]
            },
            {
                id: "form_16",
                title: "חומר גלם בקירור (טופס 16)",
                subtitle: "Raw Materials in Cooling",
                category: "packaging",
                icon: "fa-snowflake",
                color: "sky",
                fields: [
                    { name: "time", label: "שעת בדיקה", type: "time" },
                    { name: "product_pail", label: "שם מוצר בפיילה", type: "text", placeholder: "חומוס/חציל/טחינה..." },
                    { name: "qty_pails", label: "כמות הפיילות", type: "number" },
                    { name: "fridge_num", label: "מס' מקרר/קומה", type: "text" },
                    { name: "prod_date", label: "תאריך ייצור", type: "date" },
                    { name: "corrective", label: "פעולה מתקנת", type: "text" },
                    { name: "comments", label: "הערות", type: "text" }
                ]
            },
            {
                id: "form_13",
                title: "עקיבות חדר קיטים (טופס 13)",
                subtitle: "Kits Room Traceability",
                category: "packaging",
                icon: "fa-tags",
                color: "slate",
                fields: [
                    { name: "item_name", label: "שם חומר גלם/תבלין", type: "text", required: true },
                    { name: "supplier", label: "ספק", type: "text" },
                    { name: "batch_expiry", label: "תאריך ייצור/אצווה", type: "text" },
                    { name: "signature", label: "חתימה", type: "text" }
                ]
            },

            // --- SOLUTIONS & CHEMICALS (תמיסות) ---
            {
                id: "form_4",
                title: "בקרת תמיסות שימור (טופס 4)",
                subtitle: "Preservative Solutions Prep",
                category: "chemical",
                icon: "fa-flask",
                color: "yellow",
                fields: [
                    { name: "tank", label: "מס' מיכל", type: "text" },
                    { name: "solution", label: "שם התמיסה", type: "select", options: ["סורבאט (Sorbate)", "חומצת לימון (Citric Acid)"] },
                    { name: "water_qty", label: "כמות מים (ליטר)", type: "number" },
                    { name: "bags_qty", label: "מס' שקים", type: "number" },
                    { name: "preparer", label: "חתימת המכין", type: "text" }
                ]
            },
            {
                id: "form_5",
                title: "בקרת ריכוז כלור (טופס 5)",
                subtitle: "Chlorine Concentration",
                category: "chemical",
                icon: "fa-vial",
                color: "teal",
                fields: [
                    { name: "product", label: "שם המוצר/קו", type: "text" },
                    { name: "ppm_result", label: "תוצאה (PPM)", type: "number", placeholder: "Target: 50-100" },
                    { name: "status", label: "סטטוס", type: "select", options: ["תקין", "לא תקין"] },
                    { name: "inspector", label: "שם המבקר", type: "text" }
                ]
            },
            {
                id: "form_60",
                title: "חומצה פראצטית (טופס 60)",
                subtitle: "Peracetic Acid Control",
                category: "chemical",
                icon: "fa-vials",
                color: "pink",
                fields: [
                    { name: "time", label: "שעת בדיקה", type: "time" },
                    { name: "ppm_result", label: "תוצאה (PPM)", type: "number", placeholder: "Target: 100-200" },
                    { name: "status", label: "סטטוס", type: "select", options: ["תקין", "לא תקין"] }
                ]
            },

            // --- MAINTENANCE & CALIBRATION (אחזקה וכיולים) ---
            {
                id: "calib_temp",
                title: "אימות כיול מד טמפ'",
                subtitle: "Thermometer Calibration",
                category: "calibration",
                icon: "fa-temperature-high",
                color: "red",
                fields: [
                    { name: "barcode", label: "ברקוד מכשיר נבדק", type: "text" },
                    { name: "hot_master", label: "אמבט חם (מאסטר)", type: "number", step: "0.1" },
                    { name: "hot_test", label: "אמבט חם (נבדק)", type: "number", step: "0.1" },
                    { name: "cold_master", label: "אמבט קר (מאסטר)", type: "number", step: "0.1" },
                    { name: "cold_test", label: "אמבט קר (נבדק)", type: "number", step: "0.1" },
                    { name: "signature", label: "חתימת המבצע", type: "text" }
                ]
            },
            {
                id: "form_7",
                title: "כיול מד חומציות (טופס 7)",
                subtitle: "pH Meter Calibration",
                category: "calibration",
                icon: "fa-battery-half",
                color: "lime",
                fields: [
                    { name: "device_id", label: "מספר מכשיר", type: "text" },
                    { name: "result", label: "תוצאה", type: "select", options: ["תקין", "לא תקין"] },
                    { name: "comments", label: "הערות", type: "text" }
                ]
            },
            {
                id: "filter_change",
                title: "בקרת החלפת פילטרים",
                subtitle: "Filter Replacement Log",
                category: "maintenance",
                icon: "fa-filter",
                color: "gray",
                fields: [
                    { name: "filter_name", label: "שם הפילטר/מיקום", type: "text" },
                    { name: "date_change", label: "תאריך החלפה", type: "date" },
                    { name: "comments", label: "הערות", type: "text" }
                ]
            },

            // --- INFRASTRUCTURE (תשתיות) ---
            {
                id: "form_33",
                title: "בקרת שבר (טופס 33)",
                subtitle: "Glass & Hard Plastic Control",
                category: "infrastructure",
                icon: "fa-wine-glass-crack",
                color: "rose",
                fields: [
                    { name: "area", label: "אזור במפעל", type: "select", options: ["מעבדה", "קומת הכנות", "חדר בישול", "אולם אריזות", "חדר מיקסרים", "מחסנים"] },
                    { name: "item_check", label: "פריט נבדק", type: "select", options: ["מנורות/פלורוסנט", "מגיני מנורות", "חלונות", "פלסטיק קשיח", "מתקני סבון", "שעונים/צגים"] },
                    { name: "status", label: "מצב תקינות", type: "select", options: ["תקין (V)", "לא תקין (X)"] },
                    { name: "comments", label: "פירוט ליקוי", type: "text" }
                ]
            },

            // --- HYGIENE & SAFETY (היגיינה) ---
            {
                id: "form_61",
                title: "בדיקת אלרגן דגים (טופס 61)",
                subtitle: "Fish Allergen Check",
                category: "hygiene",
                icon: "fa-fish",
                color: "cyan",
                fields: [
                    { name: "stick_result", label: "תוצאה של סטיק", type: "select", options: ["שלילי - תקין (1 Line)", "חיובי - לא תקין (2 Lines)", "פסול (No Lines)"] },
                    { name: "corrective", label: "פעולה מתקנת (אם נדרש)", type: "text" },
                    { name: "inspector", label: "שם המבקר", type: "text" }
                ]
            },
            {
                id: "form_8",
                title: "הצהרת בריאות (טופס 8)",
                subtitle: "Health Declaration",
                category: "hygiene",
                icon: "fa-user-doctor",
                color: "red",
                fields: [
                    { name: "visitor_name", label: "שם המבקר/עובד", type: "text", required: true },
                    { name: "declarations", label: "אני מצהיר שאין לי:", type: "checkbox_group", options: ["צהבת", "שחפת", "שלשול/הקאות", "פצעים מוגלתיים"] },
                    { name: "attire_check", label: "לבוש תקין (חלוק/כובע)", type: "checkbox" },
                    { name: "signature_check", label: "אני מאשר את ההצהרה", type: "checkbox", required: true }
                ]
            },

            // --- R&D (פיתוח) ---
            {
                id: "form_20",
                title: "נסיונות פיתוח (טופס 20)",
                subtitle: "R&D Experiments",
                category: "rnd",
                icon: "fa-flask-vial",
                color: "slate",
                fields: [
                    { name: "exp_no", label: "מס' ניסוי", type: "text" },
                    { name: "product_name", label: "שם המוצר", type: "text" },
                    { name: "type", label: "סוג ניסוי", type: "radio", options: ["פיילוט מעבדה", "פיילוט ייצור"] },
                    { name: "ingredients", label: "רכיבים וכמויות (טקסט חופשי)", type: "textarea", placeholder: "הכנס רשימת רכיבים..." },
                    { name: "results", label: "תוצאות ומסקנות", type: "textarea" }
                ]
            }
        ];

        // ==========================================
        // 2. APP ENGINE
        // ==========================================
        const app = {
            container: document.getElementById('main-container'),
            DB_KEY: 'factory_full_db_v2',
            // Hardcoded URL as requested by the user
            CLOUD_URL: 'https://script.googleusercontent.com/macros/echo?user_content_key=AY5xjrR_LgpZpUHklNlcr-RV1RYnKJPX9L6sgK8sSc6r1vVjrLhxz0X-ROZrWoCN-xBeXaJiZE_6eQNuDbujk5vcTn_9fq9Ez5h_hywFFvnoaWiRYxddycBj5fEjVxeWn0ZHcAzM8knPFJDcQ05wpKC8AuX7N0Tm9umZVKd6EUvVvAouowoer3gzNcGWk-f3C0Mepb28Yk68GnsVipSyIE9jvjgwJKAQgXPtcsVhn_Se5eX6LFgdOXFUS6Kgo-_IQ02IP6eDO4sE-9ggd3PH2xpNMYcSMhd1Hw&lib=MGkLdVriL1zXFMJY7eo9D2DsN0njFdvY1',

            // --- Views ---

            showDashboard: () => {
                const categories = {
                    production: "ייצור (Production)",
                    packaging: "אריזה ואחסון (Packaging & Storage)",
                    chemical: "תמיסות (Solutions)",
                    calibration: "כיולים (Calibration)",
                    maintenance: "אחזקה (Maintenance)",
                    infrastructure: "תשתיות (Infrastructure)",
                    hygiene: "היגיינה (Hygiene)",
                    rnd: "פיתוח (R&D)"
                };

                let html = `<div class="fade-in space-y-8">`;
                
                for (const [catKey, catTitle] of Object.entries(categories)) {
                    const catForms = FORMS_CONFIG.filter(f => f.category === catKey);
                    if(catForms.length === 0) continue;

                    html += `
                        <div>
                            <h3 class="text-lg font-bold text-slate-500 mb-3 border-b pb-1 flex items-center gap-2">
                                <i class="fa-solid fa-folder-open"></i> ${catTitle}
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                ${catForms.map(form => app.createCardHtml(form)).join('')}
                            </div>
                        </div>
                    `;
                }
                
                html += `</div>`;
                app.container.innerHTML = html;
                window.scrollTo(0,0);
            },

            showSettings: () => {
                const currentUrl = app.CLOUD_URL; // Using Hardcoded URL
                const html = `
                    <div class="fade-in max-w-2xl mx-auto">
                        <div class="bg-white rounded-xl shadow-lg border-t-4 border-slate-700 overflow-hidden">
                            <div class="p-6 border-b bg-slate-50">
                                <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                    <i class="fa-solid fa-cloud-arrow-up text-slate-700"></i> إعدادات الربט السحابي (Cloud Sync)
                                </h2>
                                <p class="text-sm text-slate-500 mt-1">اربط النظام بـ Google Sheets لحفظ البيانات تلقائياً</p>
                            </div>
                            
                            <div class="p-6 space-y-4">
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-2">Google Apps Script Web App URL</label>
                                    <input type="text" id="gsheet_url" value="${currentUrl}" class="w-full p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-500" placeholder="https://script.google.com/macros/s/...">
                                    <p class="text-xs text-gray-500 mt-1">تم تثبيت الرابط في النظام (Hardcoded).</p>
                                </div>
                                <div class="bg-blue-50 p-4 rounded border border-blue-200 text-sm text-blue-800">
                                    <i class="fa-solid fa-circle-check"></i> <b>الرابط مثبت:</b> لا حاجة لإدخاله مرة أخرى. النظام متصل تلقائياً.
                                </div>
                            </div>

                            <div class="p-6 bg-gray-50 flex justify-end gap-3">
                                <button onclick="app.showDashboard()" class="text-gray-500 hover:text-gray-800 px-4 py-3">عودة</button>
                                <button onclick="app.saveSettings()" class="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-6 rounded-lg shadow transition">
                                    <i class="fa-solid fa-save"></i> حفظ مؤقت (لهذه الجلسة)
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                app.container.innerHTML = html;
            },

            saveSettings: () => {
                const url = document.getElementById('gsheet_url').value.trim();
                app.CLOUD_URL = url; // Update instance variable temporarily
                alert('تم تحديث الرابط لهذه الجلسة فقط.');
                app.showDashboard();
            },

            // --- Analytics View (Updated) ---
            showAnalytics: async (selectedFormId = 'all') => {
                // Show loading
                app.container.innerHTML = `<div class="text-center p-12"><i class="fa-solid fa-spinner fa-spin text-4xl text-emerald-600"></i><p class="mt-4">جاري سحب البيانات وتحليلها...</p></div>`;
                
                const url = app.CLOUD_URL;
                try {
                    const response = await fetch(url);
                    const rawData = await response.json();
                    
                    const records = rawData.map(row => {
                        let dataObj = {};
                        try { dataObj = JSON.parse(row[2]); } catch(e) {}
                        return {
                            timestamp: row[0],
                            formTitle: row[1],
                            data: dataObj,
                            alerts: row[3] || ""
                        };
                    });

                    // Build Filter Options
                    // Map generic titles to IDs roughly or just use titles
                    const uniqueForms = [...new Set(records.map(r => r.formTitle))];
                    let filterOptions = `<option value="all" ${selectedFormId === 'all' ? 'selected' : ''}>جميع النماذج (All)</option>`;
                    uniqueForms.forEach(title => {
                        filterOptions += `<option value="${title}" ${selectedFormId === title ? 'selected' : ''}>${title}</option>`;
                    });

                    // Filter Logic
                    const filteredRecords = selectedFormId === 'all' 
                        ? records 
                        : records.filter(r => r.formTitle === selectedFormId);

                    // --- KPI Calculation ---
                    const totalChecks = filteredRecords.length;
                    const totalAlerts = filteredRecords.filter(r => r.alerts.length > 0).length;
                    const passRate = totalChecks > 0 ? Math.round(((totalChecks - totalAlerts) / totalChecks) * 100) : 0;

                    // --- Chart Data Preparation ---
                    let chartCanvas = '';
                    let chartScript = '';

                    // Technical Analysis based on selected Form
                    let techAnalysisHtml = '';

                    if (selectedFormId !== 'all') {
                        // 1. CCP Analysis (Temp/pH) for Production Forms
                        if (selectedFormId.includes("בקרת יצור") || selectedFormId.includes("בישול")) {
                            // Extract Temp & pH Data over time
                            const tempData = filteredRecords.map(r => ({ x: r.timestamp, y: parseFloat(r.data.temp) || null })).filter(p => p.y !== null);
                            const phData = filteredRecords.map(r => ({ x: r.timestamp, y: parseFloat(r.data.ph) || null })).filter(p => p.y !== null);
                            
                            techAnalysisHtml = `
                                <div class="bg-white p-4 rounded-xl shadow-sm col-span-2">
                                    <h3 class="font-bold mb-4 text-slate-800"><i class="fa-solid fa-temperature-arrow-up"></i> تحليل اتجاهات CCP (Trend Analysis)</h3>
                                    <div class="relative h-64 w-full">
                                        <canvas id="ccpChart"></canvas>
                                    </div>
                                </div>
                            `;
                            
                            // Determine limits based on form title (simple logic)
                            let tempLimit = selectedFormId.includes("בישול") ? 85 : 25; // Example limits

                            chartScript = `
                                new Chart(document.getElementById('ccpChart'), {
                                    type: 'line',
                                    data: {
                                        labels: ${JSON.stringify(tempData.map(d => d.x.split(',')[0]))}, // Simplify date
                                        datasets: [
                                            { label: 'Temp (°C)', data: ${JSON.stringify(tempData.map(d => d.y))}, borderColor: '#ef4444', tension: 0.1 },
                                            { label: 'pH', data: ${JSON.stringify(phData.map(d => d.y))}, borderColor: '#3b82f6', tension: 0.1, yAxisID: 'y1' }
                                        ]
                                    },
                                    options: {
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: { title: {display: true, text: 'Temp'}, beginAtZero: false },
                                            y1: { type: 'linear', position: 'right', title: {display: true, text: 'pH'}, grid: {drawOnChartArea: false} }
                                        },
                                        plugins: {
                                            annotation: {
                                                annotations: {
                                                    line1: { type: 'line', yMin: ${tempLimit}, yMax: ${tempLimit}, borderColor: 'red', borderWidth: 2, borderDash: [5, 5], label: { content: 'Limit', enabled: true } }
                                                }
                                            }
                                        }
                                    }
                                });
                            `;
                        }
                        
                        // 2. Weight Analysis for Packaging
                        else if (selectedFormId.includes("אריזה")) {
                            // Extract weights from summary string "Avg: 500g [500, 501...]"
                            let allWeights = [];
                            filteredRecords.forEach(r => {
                                if(r.data.Weights_Summary) {
                                    const match = r.data.Weights_Summary.match(/\[(.*?)\]/);
                                    if(match) {
                                        allWeights.push(...match[1].split(',').map(n => parseFloat(n)));
                                    }
                                }
                            });

                            // Create Histogram Data (Bins)
                            const bins = {};
                            allWeights.forEach(w => {
                                const bin = Math.floor(w); // Group by integer weight
                                bins[bin] = (bins[bin] || 0) + 1;
                            });

                            techAnalysisHtml = `
                                <div class="bg-white p-4 rounded-xl shadow-sm col-span-2">
                                    <h3 class="font-bold mb-4 text-slate-800"><i class="fa-solid fa-scale-balanced"></i> توزيع الأوزان (Weight Distribution)</h3>
                                    <div class="relative h-64 w-full">
                                        <canvas id="weightChart"></canvas>
                                    </div>
                                </div>
                            `;

                            chartScript = `
                                new Chart(document.getElementById('weightChart'), {
                                    type: 'bar',
                                    data: {
                                        labels: ${JSON.stringify(Object.keys(bins))},
                                        datasets: [{
                                            label: 'عدد العينات (Frequency)',
                                            data: ${JSON.stringify(Object.values(bins))},
                                            backgroundColor: '#8b5cf6'
                                        }]
                                    },
                                    options: { responsive: true, maintainAspectRatio: false }
                                });
                            `;
                        }
                        
                        // 3. Chlorine/Chemical Analysis
                        else if (selectedFormId.includes("כלור") || selectedFormId.includes("חומצה")) {
                             const ppmData = filteredRecords.map(r => parseFloat(r.data.ppm_result) || 0);
                             techAnalysisHtml = `
                                <div class="bg-white p-4 rounded-xl shadow-sm col-span-2">
                                    <h3 class="font-bold mb-4 text-slate-800"><i class="fa-solid fa-flask"></i> تركيز المحاليل (PPM Level)</h3>
                                    <div class="relative h-64 w-full">
                                        <canvas id="chemChart"></canvas>
                                    </div>
                                </div>
                            `;
                            chartScript = `
                                new Chart(document.getElementById('chemChart'), {
                                    type: 'line',
                                    data: {
                                        labels: ${JSON.stringify(filteredRecords.map((_, i) => i+1))},
                                        datasets: [{
                                            label: 'PPM',
                                            data: ${JSON.stringify(ppmData)},
                                            borderColor: '#10b981',
                                            backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                            fill: true
                                        }]
                                    },
                                    options: { responsive: true, maintainAspectRatio: false }
                                });
                            `;
                        }
                    } else {
                        // General Overview Charts
                        const formCounts = {};
                        records.forEach(r => { formCounts[r.formTitle] = (formCounts[r.formTitle] || 0) + 1; });
                        
                        techAnalysisHtml = `
                            <div class="bg-white p-4 rounded-xl shadow-sm">
                                <h3 class="font-bold mb-4 text-center">توزيع النماذج (Forms Usage)</h3>
                                <div class="relative h-64 w-full">
                                    <canvas id="overviewChart"></canvas>
                                </div>
                            </div>
                            <div class="bg-white p-4 rounded-xl shadow-sm overflow-y-auto max-h-80">
                                <h3 class="font-bold mb-2 text-slate-800">آخر 5 تجاوزات (Recent Alerts)</h3>
                                <ul class="space-y-2">
                                    ${records.filter(r => r.alerts).slice(0, 5).map(r => `
                                        <li class="text-xs p-2 bg-red-50 border-r-4 border-red-500 rounded">
                                            <div class="font-bold text-slate-700">${r.formTitle}</div>
                                            <div class="text-red-600">${r.alerts}</div>
                                            <div class="text-gray-400 text-[10px]">${r.timestamp}</div>
                                        </li>
                                    `).join('') || '<li class="text-center text-gray-400 py-4">سجل نظيف (No Alerts)</li>'}
                                </ul>
                            </div>
                        `;

                        chartScript = `
                            new Chart(document.getElementById('overviewChart'), {
                                type: 'doughnut',
                                data: {
                                    labels: ${JSON.stringify(Object.keys(formCounts))},
                                    datasets: [{
                                        data: ${JSON.stringify(Object.values(formCounts))},
                                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
                                    }]
                                },
                                options: { responsive: true, maintainAspectRatio: false }
                            });
                        `;
                    }

                    // --- Build UI ---
                    const html = `
                        <div class="fade-in space-y-6">
                            <div class="flex flex-col md:flex-row justify-between items-center gap-4 border-b pb-4">
                                <h2 class="text-2xl font-bold text-slate-800 border-r-4 border-emerald-500 pr-3">لوحة التحكم الفنية</h2>
                                <div class="flex items-center gap-2 w-full md:w-auto">
                                    <label class="text-sm font-bold text-slate-600 whitespace-nowrap">فلتر:</label>
                                    <select onchange="app.showAnalytics(this.value)" class="p-3 rounded-lg border border-slate-300 text-sm w-full md:w-64 bg-white shadow-sm">
                                        ${filterOptions}
                                    </select>
                                </div>
                            </div>
                            
                            <!-- KPIs -->
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div class="bg-white p-4 rounded-xl shadow-sm border-t-4 border-blue-500">
                                    <div class="text-slate-500 text-xs">عدد الفحوصات</div>
                                    <div class="text-2xl font-bold text-slate-800">${totalChecks}</div>
                                </div>
                                <div class="bg-white p-4 rounded-xl shadow-sm border-t-4 border-green-500">
                                    <div class="text-slate-500 text-xs">نسبة المطابقة</div>
                                    <div class="text-2xl font-bold text-green-600">${passRate}%</div>
                                </div>
                                <div class="bg-white p-4 rounded-xl shadow-sm border-t-4 border-red-500">
                                    <div class="text-slate-500 text-xs">التجاوزات (Fail)</div>
                                    <div class="text-2xl font-bold text-red-600">${totalAlerts}</div>
                                </div>
                                <div class="bg-white p-4 rounded-xl shadow-sm border-t-4 border-purple-500">
                                    <div class="text-slate-500 text-xs">آخر تحديث</div>
                                    <div class="text-sm font-bold text-slate-800 dir-ltr text-right">${new Date().toLocaleTimeString()}</div>
                                </div>
                            </div>

                            <!-- Technical Charts Area -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                ${techAnalysisHtml}
                            </div>

                            <!-- Detailed Deviations Table (Only if specific form selected) -->
                            ${selectedFormId !== 'all' && totalAlerts > 0 ? `
                                <div class="bg-white rounded-xl shadow overflow-hidden">
                                    <div class="bg-red-50 p-3 border-b border-red-100 flex justify-between items-center">
                                        <h3 class="font-bold text-red-800">سجل الانحرافات (Deviations Log)</h3>
                                    </div>
                                    <div class="overflow-x-auto">
                                        <table class="w-full text-sm text-right whitespace-nowrap">
                                            <thead class="bg-slate-50">
                                                <tr>
                                                    <th class="p-3">الوقت</th>
                                                    <th class="p-3">تفاصيل التجاوز</th>
                                                    <th class="p-3">البيانات</th>
                                                </tr>
                                            </thead>
                                            <tbody class="divide-y divide-gray-100">
                                                ${filteredRecords.filter(r => r.alerts).map(r => `
                                                    <tr class="hover:bg-red-50">
                                                        <td class="p-3 text-gray-500">${r.timestamp}</td>
                                                        <td class="p-3 font-bold text-red-600">${r.alerts}</td>
                                                        <td class="p-3 text-xs text-gray-600 font-mono">${JSON.stringify(r.data).substring(0, 50)}...</td>
                                                    </tr>
                                                `).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    `;
                    
                    app.container.innerHTML = html;

                    // Execute Chart Script
                    if (chartScript) {
                        const scriptEl = document.createElement('script');
                        scriptEl.textContent = chartScript;
                        document.body.appendChild(scriptEl);
                    }

                } catch (err) {
                    console.error(err);
                    app.container.innerHTML = `<div class="text-center p-8 text-red-500">فشل سحب البيانات. تأكد من إعدادات الرابط.</div>`;
                }
            },

            createCardHtml: (form) => {
                return `
                    <div onclick="app.renderForm('${form.id}')" class="form-card bg-white p-5 rounded-xl shadow-sm cursor-pointer border-t-4 border-${form.color}-500 group relative overflow-hidden hover:shadow-md transition">
                        <div class="flex justify-between items-start mb-3">
                            <div class="bg-${form.color}-50 p-3 rounded-lg text-${form.color}-600 text-xl group-hover:bg-${form.color}-600 group-hover:text-white transition">
                                <i class="fa-solid ${form.icon}"></i>
                            </div>
                            <span class="text-xs font-mono text-slate-300">${form.id.toUpperCase()}</span>
                        </div>
                        <h3 class="text-lg font-bold text-slate-800 leading-tight hebrew-text">${form.title}</h3>
                        <p class="text-xs text-slate-500 mt-1">${form.subtitle}</p>
                    </div>
                `;
            },

            // --- Form Renderer ---

            renderForm: (formId) => {
                const formDef = FORMS_CONFIG.find(f => f.id === formId);
                if (!formDef) return;

                let fieldsHtml = '';
                
                formDef.fields.forEach(field => {
                    let inputHtml = '';
                    const reqAttr = field.required ? 'required' : '';
                    const paddingClass = "p-4"; // Larger touch target for mobile
                    
                    if (field.type === 'select') {
                        const opts = field.options.map(o => `<option value="${o}">${o}</option>`).join('');
                        inputHtml = `<select name="${field.name}" ${reqAttr} class="w-full ${paddingClass} rounded-lg border bg-gray-50 border-gray-300 focus:bg-white transition appearance-none">${opts}</select>`;
                    
                    } else if (field.type === 'radio') {
                        inputHtml = `<div class="flex flex-wrap gap-3 mt-2">`;
                        field.options.forEach(opt => {
                            inputHtml += `
                                <label class="flex-1 min-w-[120px] flex items-center justify-center gap-2 cursor-pointer bg-white px-4 py-3 rounded border hover:bg-gray-50 shadow-sm active:bg-gray-100 transition">
                                    <input type="radio" name="${field.name}" value="${opt}" ${reqAttr} class="text-${formDef.color}-600 focus:ring-${formDef.color}-500 w-5 h-5">
                                    <span class="text-sm font-bold text-gray-700">${opt}</span>
                                </label>`;
                        });
                        inputHtml += `</div>`;

                    } else if (field.type === 'checkbox_group') {
                        inputHtml = `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 bg-red-50 p-4 rounded border border-red-100">`;
                        field.options.forEach(opt => {
                            inputHtml += `
                                <label class="flex items-center gap-3 p-2 bg-white rounded border border-red-100">
                                    <input type="checkbox" name="${field.name}" value="${opt}" class="text-red-600 rounded w-5 h-5">
                                    <span class="text-sm text-gray-700">${opt}</span>
                                </label>`;
                        });
                        inputHtml += `</div>`;
                    
                    } else if (field.type === 'checkbox') {
                        inputHtml = `
                            <label class="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer bg-white shadow-sm active:bg-gray-100 transition">
                                <div class="bg-${formDef.color}-100 p-2 rounded text-${formDef.color}-600">
                                    <input type="checkbox" name="${field.name}" class="w-6 h-6 rounded accent-${formDef.color}-600">
                                </div>
                                <span class="font-bold text-gray-700 text-lg">${field.label}</span>
                            </label>`;
                    
                    } else if (field.type === 'weight_samples') {
                        inputHtml = `<div class="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2 bg-gray-50 p-4 rounded-lg border">`;
                        for(let i=1; i<=10; i++) {
                            inputHtml += `
                                <div>
                                    <label class="text-xs text-gray-400 block mb-1 text-center">#${i}</label>
                                    <input type="number" inputmode="decimal" step="0.1" name="${field.name}_${i}" class="w-full p-3 border rounded text-center focus:ring-2 focus:ring-${formDef.color}-500 text-lg" placeholder="0.0">
                                </div>`;
                        }
                        inputHtml += `</div>`;
                    
                    } else if (field.type === 'textarea') {
                        inputHtml = `<textarea name="${field.name}" ${reqAttr} rows="4" class="w-full ${paddingClass} rounded-lg border bg-gray-50 border-gray-300 focus:bg-white text-lg" placeholder="${field.placeholder || ''}"></textarea>`;
                    
                    } else {
                        // Standard inputs (Text, Number, Date)
                        // Add mobile keyboard optimizations
                        let extraAttrs = '';
                        if (field.type === 'number') {
                            extraAttrs = 'inputmode="decimal" pattern="[0-9]*"'; 
                        }
                        
                        const isCCP = field.isCCP ? `border-red-300 bg-red-50 text-red-900 font-bold text-xl text-center` : `bg-gray-50 border-gray-300 focus:bg-white text-lg`;
                        inputHtml = `<input type="${field.type}" name="${field.name}" step="${field.step || 'any'}" ${reqAttr} ${extraAttrs} class="w-full ${paddingClass} rounded-lg border transition ${isCCP}" placeholder="${field.placeholder || ''}">`;
                    }

                    // Render wrapper
                    if (field.type !== 'checkbox') {
                        fieldsHtml += `
                            <div class="mb-6">
                                <label class="block text-sm font-bold text-gray-700 mb-2 flex items-center justify-between">
                                    <span>${field.label} ${field.required ? '<span class="text-red-500">*</span>' : ''}</span>
                                    ${field.isCCP ? '<span class="animate-pulse bg-red-600 text-white text-xs px-2 py-0.5 rounded font-bold shadow">CCP CRITICAL</span>' : ''}
                                </label>
                                ${inputHtml}
                            </div>
                        `;
                    } else {
                        fieldsHtml += `<div class="mb-6">${inputHtml}</div>`;
                    }
                });

                const html = `
                    <div class="fade-in max-w-2xl mx-auto pb-24">
                        <button onclick="app.showDashboard()" class="mb-4 text-slate-500 hover:text-slate-800 flex items-center gap-2 font-bold p-2 active:bg-slate-200 rounded transition">
                            <i class="fa-solid fa-arrow-right"></i> חזרה לתפריט (Back)
                        </button>
                        
                        <div class="bg-white rounded-xl shadow-lg border-t-8 border-${formDef.color}-500 overflow-hidden">
                            <div class="p-6 border-b bg-slate-50 flex justify-between items-center">
                                <div>
                                    <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                        <i class="fa-solid ${formDef.icon} text-${formDef.color}-500"></i> ${formDef.title}
                                    </h2>
                                    <p class="text-sm text-slate-500 mt-1">${formDef.subtitle}</p>
                                </div>
                            </div>
                            
                            <form onsubmit="app.handleSubmit(event, '${formId}')" class="p-6 bg-white">
                                <div class="bg-blue-50 text-blue-800 p-4 rounded mb-6 text-sm flex gap-2 items-center">
                                    <i class="fa-solid fa-calendar-day text-lg"></i>
                                    <span>التاريخ: <b>${new Date().toLocaleDateString('ar-IL')}</b></span>
                                </div>

                                ${fieldsHtml}
                                
                                <div class="pt-6 mt-6 border-t border-gray-100 sticky bottom-0 bg-white pb-4">
                                    <button type="submit" class="w-full bg-${formDef.color}-600 hover:bg-${formDef.color}-700 text-white font-bold py-5 rounded-xl shadow-lg hover:shadow-xl transition transform active:scale-95 flex justify-center items-center gap-3 text-xl">
                                        <i class="fa-solid fa-paper-plane"></i> <span>שמור ושלח (Submit)</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                `;

                app.container.innerHTML = html;
                window.scrollTo(0,0);
            },

            // --- Logic & Validation ---

            handleSubmit: (e, formId) => {
                e.preventDefault();
                const formDef = FORMS_CONFIG.find(f => f.id === formId);
                const formData = new FormData(e.target);
                const record = {
                    id: Date.now(),
                    timestamp: new Date().toLocaleString('he-IL'),
                    formId: formId,
                    formTitle: formDef.title,
                    data: {},
                    alerts: []
                };

                // Extract data & Check Limits
                formData.forEach((value, key) => {
                    record.data[key] = value;
                });

                // --- Special Logic: Aggregate Weight Samples ---
                if (formDef.fields.some(f => f.type === 'weight_samples')) {
                    const weights = [];
                    // Find all keys starting with weight_samples_
                    for(let i=1; i<=10; i++) {
                        const key = `weight_samples_${i}`;
                        if(record.data[key]) {
                            weights.push(parseFloat(record.data[key]));
                            delete record.data[key]; // Clean up individual fields from record
                        }
                    }
                    if(weights.length > 0) {
                        const sum = weights.reduce((a, b) => a + b, 0);
                        const avg = (sum / weights.length).toFixed(1);
                        record.data['Weights_Summary'] = `Avg: ${avg}g [${weights.join(', ')}]`;
                    }
                }

                // Specific Validation Logic
                if (formDef.limits) {
                    const productType = record.data['product'];
                    const limitKey = Object.keys(formDef.limits).find(k => productType && productType.includes(k.split(' ')[0]));
                    
                    if (limitKey) {
                        const limits = formDef.limits[limitKey];
                        if (record.data['temp'] && parseFloat(record.data['temp']) > limits.temp) {
                            record.alerts.push(`CCP Deviation: Temp ${record.data['temp']}°C > Limit ${limits.temp}°C`);
                        }
                        if (record.data['ph'] && parseFloat(record.data['ph']) > limits.ph) {
                            record.alerts.push(`CCP Deviation: pH ${record.data['ph']} > Limit ${limits.ph}`);
                        }
                    }
                }
                
                // Generic Min/Max Validation
                formDef.fields.forEach(f => {
                    if (f.max && record.data[f.name] && parseFloat(record.data[f.name]) > f.max) {
                        record.alerts.push(`Alert: ${f.label} (${record.data[f.name]}) exceeds limit (${f.max})`);
                    }
                    if (f.min && record.data[f.name] && parseFloat(record.data[f.name]) < f.min) {
                        record.alerts.push(`Alert: ${f.label} (${record.data[f.name]}) below limit (${f.min})`);
                    }
                });

                // Alert Check
                if (record.alerts.length > 0) {
                    const msg = "⚠️ تحذيرات جودة (Quality Alerts):\n\n" + record.alerts.join("\n") + "\n\nهل تريد الحفظ رغم التجاوز؟";
                    if(!confirm(msg)) return;
                }

                // --- 1. Save Locally ---
                app.saveRecord(record);

                // --- 2. Save to Cloud (Google Sheets) ---
                const btn = e.target.querySelector('button[type="submit"]');
                const originalText = btn.innerHTML;
                
                btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up fa-fade"></i> جاري المزامنة مع Drive...';
                
                app.syncToGoogle(record).then(success => {
                    if(success) {
                        btn.innerHTML = '<i class="fa-solid fa-check-circle"></i> تم الحفظ والمزامنة! ✅';
                        btn.classList.replace(`bg-${formDef.color}-600`, 'bg-green-600');
                    } else {
                        btn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> تم الحفظ محلياً فقط (خطأ بالمزامنة)';
                        btn.classList.replace(`bg-${formDef.color}-600`, 'bg-amber-500');
                    }
                    setTimeout(() => app.showLog(), 1500);
                });
            },

            syncToGoogle: async (record) => {
                const url = app.CLOUD_URL;
                if(!url) return false; // No URL configured

                try {
                    // We use no-cors mode because Apps Script doesn't support CORS headers easily.
                    // This means we can't read the response, but the POST works.
                    await fetch(url, {
                        method: 'POST',
                        mode: 'no-cors', 
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(record)
                    });
                    return true;
                } catch (err) {
                    console.error('Sync Error:', err);
                    return false;
                }
            },

            saveRecord: (record) => {
                let data = JSON.parse(localStorage.getItem(app.DB_KEY) || '[]');
                data.unshift(record);
                localStorage.setItem(app.DB_KEY, JSON.stringify(data));
            },

            getRecords: () => {
                return JSON.parse(localStorage.getItem(app.DB_KEY) || '[]');
            },

            clearData: () => {
                if(confirm('هل أنت متأكد من مسح جميع السجلات؟')) {
                    localStorage.removeItem(app.DB_KEY);
                    app.showLog();
                }
            },

            // --- Log View ---

            showLog: () => {
                const data = app.getRecords();
                let rowsHtml = '';

                if (data.length === 0) {
                    rowsHtml = `<tr><td colspan="5" class="p-12 text-center text-slate-400 flex flex-col items-center justify-center"><i class="fa-solid fa-clipboard-list text-4xl mb-4"></i><br>لا توجد سجلات محفوظة</td></tr>`;
                } else {
                    data.forEach(row => {
                        // Create chips for data
                        let details = Object.entries(row.data)
                            .filter(([k,v]) => v && v !== 'on') // Filter empty
                            .map(([k, v]) => `<span class="inline-block bg-white border border-gray-200 rounded px-2 py-1 text-xs mr-1 mb-1 text-gray-600"><b>${k}:</b> ${v}</span>`)
                            .join('');
                        
                        const hasAlerts = row.alerts && row.alerts.length > 0;
                        const rowClass = hasAlerts ? 'bg-red-50' : 'hover:bg-slate-50';
                        const statusIcon = hasAlerts 
                            ? `<span class="text-red-600 font-bold text-xs bg-red-100 px-2 py-1 rounded-full"><i class="fa-solid fa-triangle-exclamation"></i> Deviation</span>` 
                            : `<span class="text-green-600 font-bold text-xs bg-green-100 px-2 py-1 rounded-full"><i class="fa-solid fa-check"></i> OK</span>`;

                        rowsHtml += `
                            <tr class="${rowClass} border-b border-gray-100 transition">
                                <td class="p-4 text-xs font-mono text-gray-400 whitespace-nowrap align-top">${row.timestamp}</td>
                                <td class="p-4 text-sm font-bold text-gray-800 whitespace-nowrap align-top">${row.formTitle}</td>
                                <td class="p-4 align-top">${details}</td>
                                <td class="p-4 align-top whitespace-nowrap">${statusIcon}</td>
                            </tr>
                        `;
                    });
                }

                const html = `
                    <div class="fade-in">
                        <div class="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
                            <div>
                                <h2 class="text-xl font-bold text-slate-800">ספר דוחות (Log Book)</h2>
                                <p class="text-xs text-slate-400">سجل عمليات المصنع</p>
                            </div>
                            <div class="flex gap-2">
                                <button onclick="app.downloadExcel()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow text-sm transition flex items-center gap-2">
                                    <i class="fa-solid fa-file-excel"></i> <span>Excel</span>
                                </button>
                                <button onclick="app.clearData()" class="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm transition">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </div>
                        </div>

                        <div class="bg-white rounded-xl shadow overflow-hidden border border-slate-200">
                            <div class="overflow-x-auto">
                                <table class="w-full text-right">
                                    <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-bold">
                                        <tr>
                                            <th class="p-4 w-32">الوقت</th>
                                            <th class="p-4 w-48">النموذج</th>
                                            <th class="p-4">البيانات المسجلة</th>
                                            <th class="p-4 w-32">الحالة</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-100">${rowsHtml}</tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                `;
                app.container.innerHTML = html;
            },

            downloadExcel: () => {
                const data = app.getRecords();
                if(data.length === 0) return alert('لا توجد بيانات');
                
                const flatData = data.map(r => {
                    const row = { Time: r.timestamp, Form: r.formTitle, Status: r.alerts?.length > 0 ? 'FAIL' : 'PASS' };
                    // Merge dynamic fields
                    Object.assign(row, r.data);
                    if(r.alerts?.length) row.Alerts = r.alerts.join(' | ');
                    return row;
                });
                
                const ws = XLSX.utils.json_to_sheet(flatData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "QA_Logs");
                XLSX.writeFile(wb, "Factory_QA_Full_Export.xlsx");
            }
        };

        // Initialize App
        app.showDashboard();
    </script>
</body>
</html>
