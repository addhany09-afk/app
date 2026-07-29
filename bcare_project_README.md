# بي كير (BCare) - Supabase & React/TypeScript Project

تم تحويل قاعدة البيانات والمشروع بالكامل إلى PostgreSQL/Supabase و React + TypeScript + Tailwind CSS.

## 📁 محتويات المشروع:

1. `schema.sql`: ملف SQL يحتوي على جداول PostgreSQL، الفهارس (Indexes)، وتفعيل Realtime.
2. `src/lib/supabaseClient.ts`: تهيئة العميل وتوصيله بـ Supabase.
3. `src/pages/Step1Vehicle.tsx`: واجهة ادخال بيانات المركبة متضمنة الـ Captcha و Heartbeat والتحكم المباشر.
4. `src/pages/Dashboard.tsx`: لوحة التحكم التفاعلية للادارة بالـ Realtime.
5. `package.json` & `.env.example`: إعدادات البيئة والحزم.

## 🚀 طريقة التشغيل:

1. قم بإنشاء مشروع جديد على **Supabase**.
2. افتح **SQL Editor** في Supabase وقم بتشغيل الكود الموجود في `schema.sql`.
3. قم بإنشاء مشروع React جديد أو انسخ الملفات لقالبك في Lovable.
4. اضف مفاتيح الربط في ملف `.env` الخاص بك.
