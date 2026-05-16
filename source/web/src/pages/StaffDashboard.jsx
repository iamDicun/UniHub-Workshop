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
      title="Check-in Nhân sự"
      subtitle="Quét mã QR và theo dõi lịch workshop."
      actions={
        <button
          type="button"
          onClick={loadWorkshops}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-hover hover:text-primary"
        >
          Tải lại
        </button>
      }
    >
      {error ? (
        <div className="rounded-lg border border-error/20 bg-error-container px-4 py-3 text-sm text-error">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <form
          onSubmit={handleCheckin}
          className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6 shadow-soft"
        >
          <div>
            <h2 className="font-display text-lg font-semibold text-primary">
              Check-in nhanh
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Nhập mã đăng ký (registration_id) từ QR.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-primary">
              Mã đăng ký
            </label>
            <input
              value={registrationId}
              onChange={(event) => setRegistrationId(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/10 transition-colors duration-150"
              placeholder="VD: 8b1a..."
            />
          </div>

          <button
            type="submit"
            disabled={checking}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {checking ? 'Đang check-in...' : 'Xác nhận check-in'}
          </button>

          {result ? (
            <div className="rounded-lg border border-success/20 bg-success/5 px-4 py-3 text-sm text-primary">
              <p className="font-semibold text-success">Đã check-in thành công</p>
              <p className="mt-2 text-text-secondary">
                {result.registration.student_name} - {result.registration.workshop_title}
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                {formatDateTime(result.checkin.checkin_time)}
              </p>
            </div>
          ) : null}
        </form>

        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="rounded-xl border border-border bg-surface p-6 text-sm text-text-secondary shadow-soft">
              Đang tải workshop...
            </div>
          ) : null}

          {!loading && workshops.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface p-6 text-sm text-text-secondary shadow-soft">
              Chưa có workshop nào.
            </div>
          ) : null}

          {workshops.map((workshop) => (
            <article
              key={workshop.id}
              className="rounded-xl border border-border bg-surface p-5 shadow-soft"
            >
              <h3 className="font-display text-base font-semibold text-primary">
                {workshop.title}
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                {formatDateTime(workshop.start_time)}
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                {workshop.location || 'Đang cập nhật'}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-text-secondary">
                <span>Chỗ trống</span>
                <span className="font-medium text-primary">
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
