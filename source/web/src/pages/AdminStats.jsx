import React, { useEffect, useState } from 'react';
import PageShell from '../components/PageShell';
import { fetchAdminStats } from '../api/client';
import { Users, BookOpen, CheckCheck, DollarSign } from 'lucide-react';

const formatDate = (v) => {
  if (!v) return '';
  return new Date(v).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });
};

const formatVND = (v) => `${Number(v || 0).toLocaleString('vi-VN')} VND`;

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAdminStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const kpis = stats
    ? [
        { label: 'Tổng Workshop', value: stats.total_workshops, sub: `${stats.upcoming_workshops} sắp diễn ra`, icon: BookOpen },
        { label: 'Lượt Đăng ký', value: stats.total_registrations, sub: `${stats.confirmed_registrations} đã xác nhận`, icon: Users },
        { label: 'Check-in', value: stats.total_checkins, sub: 'tổng lượt', icon: CheckCheck },
        { label: 'Doanh thu', value: formatVND(stats.total_revenue), sub: 'đã thanh toán', icon: DollarSign },
      ]
    : [];

  return (
    <PageShell title="Thống kê" subtitle="Số liệu tổng quan hệ thống workshop.">
      {loading ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-sm text-text-secondary text-center shadow-soft">
          Đang tải thống kê...
        </div>
      ) : stats ? (
        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={kpi.label}
                  className="rounded-xl border border-border bg-surface p-5 shadow-soft"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-text-secondary">{kpi.label}</span>
                    <Icon size={18} className="text-accent" strokeWidth={1.5} />
                  </div>
                  <p className="font-display text-2xl font-semibold text-primary">{kpi.value}</p>
                  <p className="mt-1 text-xs text-text-secondary">{kpi.sub}</p>
                </div>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-border bg-surface shadow-soft">
              <div className="border-b border-border px-5 py-4">
                <h3 className="font-display text-base font-semibold text-primary">Tỉ lệ lấp đầy</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-background text-xs text-text-secondary">
                      <th className="px-5 py-2.5 font-medium">Workshop</th>
                      <th className="px-5 py-2.5 font-medium text-right">Đã đăng ký</th>
                      <th className="px-5 py-2.5 font-medium text-right">% Lấp đầy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {stats.occupancy?.map((w) => (
                      <tr key={w.id} className="hover:bg-hover transition-colors">
                        <td className="px-5 py-3 text-primary font-medium max-w-xs truncate">{w.title}</td>
                        <td className="px-5 py-3 text-right text-text-secondary">
                          {w.registered}/{w.capacity}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-hover">
                              <div
                                className="h-full rounded-full bg-accent"
                                style={{ width: `${Math.min(w.occupancy_pct, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-primary">
                              {w.occupancy_pct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(!stats.occupancy || stats.occupancy.length === 0) && (
                      <tr>
                        <td colSpan="3" className="px-5 py-6 text-center text-sm text-text-secondary">
                          Chưa có dữ liệu.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-surface shadow-soft">
              <div className="border-b border-border px-5 py-4">
                <h3 className="font-display text-base font-semibold text-primary">Check-in gần đây</h3>
              </div>
              <div className="divide-y divide-border">
                {stats.recentCheckins?.map((c) => (
                  <div key={c.id} className="flex items-start gap-3 px-5 py-3 hover:bg-hover transition-colors">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success/10">
                      <CheckCheck size={14} className="text-success" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-primary">{c.student_name}</p>
                      <p className="text-xs text-text-secondary">{c.workshop_title}</p>
                    </div>
                    <span className="text-xs text-text-secondary whitespace-nowrap">{formatDate(c.checkin_time)}</span>
                  </div>
                ))}
                {(!stats.recentCheckins || stats.recentCheckins.length === 0) && (
                  <div className="px-5 py-6 text-center text-sm text-text-secondary">
                    Chưa có check-in nào.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
};

export default AdminStats;
