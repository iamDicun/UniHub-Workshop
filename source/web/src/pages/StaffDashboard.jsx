import React, { useEffect, useState } from 'react';
import PageShell from '../components/PageShell';
import { checkIn, fetchWorkshops } from '../api/client';

const formatDateTime = (value) => {
  if (!value) {
    return '';
  }
  return new Date(value).toLocaleString('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const StaffDashboard = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registrationId, setRegistrationId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const loadWorkshops = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchWorkshops();
      setWorkshops(response.data.workshops || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách workshop.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkshops();
  }, []);

  const handleCheckin = async (event) => {
    event.preventDefault();
    if (!registrationId.trim()) {
      setError('Vui lòng nhập mã đăng ký.');
      return;
    }

    setChecking(true);
    setError('');
    try {
      const response = await checkIn(registrationId.trim());
      setResult(response.data);
      setRegistrationId('');
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in thất bại.');
      setResult(null);
    } finally {
      setChecking(false);
    }
  };

  return (
    <PageShell
      title="Bảng điều khiển nhân sự"
      subtitle="Quét mã QR (chuỗi đăng ký) và theo dõi lịch workshop."
      actions={
        <button
          type="button"
          onClick={loadWorkshops}
          className="rounded-full border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:border-brand-500 hover:text-brand-900"
        >
          Tải lại
        </button>
      }
    >
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
        <form
          onSubmit={handleCheckin}
          className="flex flex-col gap-4 rounded-3xl border border-brand-200/80 bg-white/80 p-6 shadow-[0_24px_60px_-48px_rgba(15,76,92,0.45)] backdrop-blur"
        >
          <div>
            <h2 className="font-display text-xl font-semibold text-brand-900">
              Check-in nhanh
            </h2>
            <p className="mt-1 text-sm text-brand-900/70">
              Nhập mã đăng ký (registration_id) từ QR.
            </p>
          </div>

          <label className="text-xs font-semibold uppercase tracking-wide text-brand-700">
            Mã đăng ký
            <input
              value={registrationId}
              onChange={(event) => setRegistrationId(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-brand-200 bg-white px-4 py-3 text-sm text-brand-900 outline-none focus:border-brand-500"
              placeholder="VD: 8b1a..."
            />
          </label>

          <button
            type="submit"
            disabled={checking}
            className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {checking ? 'Đang check-in...' : 'Xác nhận check-in'}
          </button>

          {result ? (
            <div className="rounded-2xl border border-brand-200/70 bg-brand-50 px-4 py-3 text-xs text-brand-900">
              <p className="font-semibold">Đã check-in thành công</p>
              <p className="mt-2 text-brand-900/70">
                {result.registration.student_name} - {result.registration.workshop_title}
              </p>
              <p className="mt-1 text-[11px] text-brand-900/60">
                {formatDateTime(result.checkin.checkin_time)}
              </p>
            </div>
          ) : null}
        </form>

        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="rounded-3xl border border-brand-200 bg-white/70 p-6 text-sm text-brand-900/70">
              Đang tải workshop...
            </div>
          ) : null}

          {!loading && workshops.length === 0 ? (
            <div className="rounded-3xl border border-brand-200 bg-white/70 p-6 text-sm text-brand-900/70">
              Chưa có workshop nào.
            </div>
          ) : null}

          {workshops.map((workshop) => (
            <article
              key={workshop.id}
              className="rounded-3xl border border-brand-200/80 bg-white/80 p-5 shadow-[0_24px_60px_-48px_rgba(15,76,92,0.45)] backdrop-blur"
            >
              <h3 className="font-display text-lg font-semibold text-brand-900">
                {workshop.title}
              </h3>
              <p className="mt-1 text-sm text-brand-900/70">
                {formatDateTime(workshop.start_time)}
              </p>
              <p className="mt-1 text-xs text-brand-900/60">
                {workshop.location || 'Đang cập nhật'}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-brand-900/70">
                <span>Chỗ trống</span>
                <span className="text-brand-900">
                  {workshop.available_seats}/{workshop.capacity}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
};

export default StaffDashboard;
