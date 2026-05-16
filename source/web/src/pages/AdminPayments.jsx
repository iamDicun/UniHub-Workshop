import React, { useEffect, useState } from 'react';
import PageShell from '../components/PageShell';
import { fetchAdminPayments } from '../api/client';

const formatDateTime = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleString('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = async () => {
    try {
      const res = await fetchAdminPayments();
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
    <PageShell title="Quản lý Giao dịch" subtitle="Theo dõi toàn bộ giao dịch thanh toán trên hệ thống">
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-soft">
        {loading ? (
          <div className="p-8 text-center text-sm text-text-secondary">Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-background">
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Mã ĐH</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Sinh viên</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Workshop</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Số tiền</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Cập nhật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-sm text-text-secondary">Không có giao dịch nào.</td>
                  </tr>
                ) : (
                  payments.map(payment => (
                    <tr key={payment.id} className="hover:bg-hover transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-primary">
                        {payment.order_code}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-primary">
                        <div className="font-medium">{payment.student_name}</div>
                        <div className="text-xs text-text-secondary">{payment.student_email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary max-w-xs truncate">
                        {payment.workshop_title}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-primary">
                        {Number(payment.amount).toLocaleString('vi-VN')} VND
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {payment.status === 'paid' && <span className="inline-flex rounded-lg bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Thành công</span>}
                        {payment.status === 'pending' && <span className="inline-flex rounded-lg bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">Chờ thanh toán</span>}
                        {payment.status === 'failed' && <span className="inline-flex rounded-lg bg-error/10 px-2 py-0.5 text-xs font-medium text-error">Thất bại</span>}
                        {payment.status === 'expired' && <span className="inline-flex rounded-lg bg-hover px-2 py-0.5 text-xs font-medium text-text-secondary">Hết hạn</span>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">
                        {formatDateTime(payment.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default AdminPayments;
