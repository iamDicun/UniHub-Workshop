import React, { useEffect, useState } from 'react';
import PageShell from '../components/PageShell';
import { fetchMyPayments } from '../api/client';
import api from '../api/client';

const formatDateTime = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleString('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const StudentPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const markPaymentAsFailed = async (orderCode) => {
    try {
      console.log('[StudentPayments] Marking as failed:', orderCode);
      await api.post('/payments/cancel', { orderCode });
      console.log('[StudentPayments] Payment marked as failed');
    } catch (err) {
      console.error('[StudentPayments] Error marking payment as failed:', err);
    }
  };

  const loadPayments = async () => {
    try {
      // Check if user came back from PayOS cancel
      const pendingOrderCode = localStorage.getItem('pendingOrderCode');
      if (pendingOrderCode) {
        console.log('[StudentPayments] Found pending order code:', pendingOrderCode);
        await markPaymentAsFailed(pendingOrderCode);
        localStorage.removeItem('pendingOrderCode');
      }

      const res = await fetchMyPayments();
      setPayments(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  return (
    <PageShell title="Lịch sử thanh toán" subtitle="Theo dõi các khoản thanh toán workshop của bạn">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-brand-200">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã ĐH</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Workshop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Không có giao dịch nào.</td>
                </tr>
              ) : (
                payments.map(payment => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.order_code}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {payment.workshop_title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Number(payment.amount).toLocaleString('vi-VN')} VND
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(payment.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {payment.status === 'paid' && <span className="text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">Thành công</span>}
                      {payment.status === 'pending' && <span className="text-yellow-600 font-semibold bg-yellow-50 px-2 py-1 rounded-full">Chờ thanh toán</span>}
                      {payment.status === 'failed' && <span className="text-red-600 font-semibold bg-red-50 px-2 py-1 rounded-full">Thất bại</span>}
                      {payment.status === 'expired' && <span className="text-gray-600 font-semibold bg-gray-100 px-2 py-1 rounded-full">Hết hạn</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {payment.status === 'pending' && payment.checkout_url && (
                        <a href={payment.checkout_url} className="text-brand-600 hover:text-brand-900">Thanh toán ngay</a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </PageShell>
  );
};

export default StudentPayments;
