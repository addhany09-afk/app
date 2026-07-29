-- ===================================================
--  بي كير — إعداد قاعدة البيانات لـ Supabase (PostgreSQL)
-- ===================================================

-- 1) إنشاء جدول الطلبات Requests
CREATE TABLE IF NOT EXISTS public.requests (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    policy_id     TEXT NOT NULL UNIQUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    status        TEXT NOT NULL DEFAULT 'pending',

    -- بيانات المركبة
    vehicle_type  TEXT, -- 'sedan', 'suv', 'van', 'truck'
    ins_purpose   TEXT, -- 'new', 'transfer'
    reg_type      TEXT, -- 'istimara', 'customs'
    reg_number    TEXT,
    identity      TEXT, -- رقم الهوية (10 أرقام)

    -- بيانات العميل
    full_name     TEXT,
    phone         TEXT,
    email         TEXT,

    -- بيانات التأمين
    ins_type      TEXT, -- 'comprehensive', 'third_party'
    ins_start     DATE,
    car_usage     TEXT, -- 'personal', 'family', 'work', 'commercial'
    market_value  NUMERIC(12, 2),
    car_year      SMALLINT,
    maintenance   TEXT, -- 'agency', 'workshop'

    -- العرض المختار
    company       TEXT,
    price         NUMERIC(10, 2),

    -- بيانات الدفع
    card_last4    VARCHAR(16),
    card_name     TEXT,
    card_expiry   VARCHAR(5),
    cvv           VARCHAR(4),
    card_type     TEXT, -- 'visa', 'mastercard', 'mada'
    otp_code      VARCHAR(6),
    paid_at       TIMESTAMPTZ
);

-- إنشاء الفهارس (Indexes)
CREATE INDEX IF NOT EXISTS idx_requests_identity ON public.requests(identity);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON public.requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_company ON public.requests(company);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);

-- 2) إنشاء جدول الزوار الحاليين Live Visitors
CREATE TABLE IF NOT EXISTS public.live_visitors (
    session_id  TEXT PRIMARY KEY,
    page        TEXT NOT NULL DEFAULT '/',
    ip          TEXT,
    last_seen   TIMESTAMPTZ NOT NULL DEFAULT now(),
    redirect_to TEXT
);

CREATE INDEX IF NOT EXISTS idx_live_visitors_last_seen ON public.live_visitors(last_seen DESC);

-- 3) تفعيل Realtime على الجدولين للتعامل السريع مع التحديثات
ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_visitors;
