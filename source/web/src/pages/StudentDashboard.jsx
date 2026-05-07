import React, { useEffect, useMemo, useState } from 'react';
import PageShell from '../components/PageShell';
import Modal from '../components/Modal';
import { QRCodeCanvas } from 'qrcode.react';
import { fetchWorkshops, registerWorkshop, cancelRegistration } from '../api/client';

const formatDateTime = (value) => {
  if (!value) {
    return '';
  }
  return new Date(value).toLocaleString('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const formatPrice = (value) => {
  const numberValue = Number(value);
  if (!numberValue) {
    return 'Miễn phí';
  }
  return `${numberValue.toLocaleString('vi-VN')} VND`;
};

const stripHtml = (value) => {
  if (!value) {
    return '';
  }
  return value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
};

const getSnippet = (value) => {
  const plain = stripHtml(value);
  if (!plain) {
    return 'Chưa có mô tả chi tiết.';
  }
  if (plain.length <= 120) {
    return plain;
  }
  return `${plain.slice(0, 120)}...`;
};

const StudentDashboard = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const [activeFilter, setActiveFilter] = useState('all');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);

  const loadWorkshops = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchWorkshops();
      const nextWorkshops = response.data.workshops || [];
      setWorkshops(nextWorkshops);
      if (selectedWorkshop) {
        const updated = nextWorkshops.find((item) => item.id === selectedWorkshop.id);
        if (updated) {
          setSelectedWorkshop(updated);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách workshop.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkshops();
  }, []);

  const filters = [
    { key: 'all', label: 'Tất cả' },
    { key: 'upcoming', label: 'Sắp diễn ra' },
    { key: 'past', label: 'Đã diễn ra' },
    { key: 'joined', label: 'Đã đăng ký' },
  ];

  const filteredWorkshops = useMemo(() => {
    const now = new Date();
    return workshops.filter((workshop) => {
      const startTime = new Date(workshop.start_time);
      const endTime = new Date(workshop.end_time);
      const isRegistered = workshop.registration_status === 'confirmed';

      if (activeFilter === 'all') {
        return true;
      }
      if (activeFilter === 'upcoming') {
        return startTime >= now;
      }
      if (activeFilter === 'past') {
        return endTime < now;
      }
      if (activeFilter === 'joined') {
        return isRegistered;
      }
      return true;
    });
  }, [workshops, activeFilter]);

  const openDetail = (workshop) => {
    setSelectedWorkshop(workshop);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedWorkshop(null);
  };

  const handleRegister = async (workshopId) => {
    setBusyId(workshopId);
    setError('');
    try {
      const res = await registerWorkshop(workshopId);
      console.log('[handleRegister] Response:', res);
      const payload = res?.data ?? res;
      console.log('[handleRegister] Payload:', payload);

      if (payload.checkout_url) {
        console.log('[handleRegister] Redirecting to:', payload.checkout_url);
        // Store order code in localStorage for cancel handling
        if (payload.order_code) {
          localStorage.setItem('pendingOrderCode', payload.order_code);
          console.log('[handleRegister] Stored order code:', payload.order_code);
        }
        window.location.href = payload.checkout_url;
      } else {
        console.log('[handleRegister] No checkout_url, checking for message...');
        if (payload.message) {
          console.log('[handleRegister] Setting error:', payload.message);
          // Hiển thị popup thông báo ngay
          alert(payload.message);
          setError(payload.message);
        } else {
          console.log('[handleRegister] Closing detail modal');
          closeDetail();
        }
        await loadWorkshops();
      }
    } catch (err) {
      console.error('[handleRegister] Error:', err);
      setError(err.response?.data?.message || 'Đăng ký thất bại.');
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async (registrationId) => {
    setBusyId(registrationId);
    setError('');
    try {
      await cancelRegistration(registrationId);
      await loadWorkshops();
    } catch (err) {
      setError(err.response?.data?.message || 'Hủy đăng ký thất bại.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <PageShell
      title="Bảng điều khiển sinh viên"
      subtitle="Lọc workshop, theo dõi lịch và đăng ký nhanh chóng."
      actions={
        <div className="flex flex-wrap gap-3">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeFilter === filter.key
                  ? 'bg-brand-500 text-white'
                  : 'border border-brand-200 text-brand-700 hover:border-brand-500'
              }`}
            >
              {filter.label}
            </button>
          ))}
          <button
            type="button"
            onClick={loadWorkshops}
            className="rounded-full border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:border-brand-500 hover:text-brand-900"
          >
            Tải lại
          </button>
        </div>
      }
    >
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-3xl border border-brand-200 bg-white/70 p-8 text-sm text-brand-900/70">
          Đang tải workshop...
        </div>
      ) : null}

      {!loading && filteredWorkshops.length === 0 ? (
        <div className="rounded-3xl border border-brand-200 bg-white/70 p-8 text-sm text-brand-900/70">
          Chưa có workshop phù hợp bộ lọc này.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {filteredWorkshops.map((workshop) => {
          const isRegistered = workshop.registration_status === 'confirmed';
          const isFull = Number(workshop.available_seats) <= 0;

          return (
            <button
              key={workshop.id}
              type="button"
              onClick={() => openDetail(workshop)}
              className="group flex w-full flex-col gap-4 rounded-3xl border border-brand-200/80 bg-white/80 p-5 text-left shadow-[0_20px_55px_-45px_rgba(15,76,92,0.45)] transition hover:border-brand-500"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-semibold text-brand-900 text-fade">
                    {workshop.title}
                  </h3>
                  <p className="mt-1 text-sm text-brand-900/70">
                    {formatDateTime(workshop.start_time)}
                  </p>
                </div>
                <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase text-brand-700">
                  {workshop.available_seats}/{workshop.capacity}
                </span>
              </div>

              <p className="text-sm text-brand-900/70">{getSnippet(workshop.description)}</p>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-brand-900/60">
                <span>{workshop.speaker ? `Diễn giả: ${workshop.speaker}` : 'Đang cập nhật diễn giả'}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-brand-900/60">
                <span>{workshop.location || 'Đang cập nhật địa điểm'}</span>
                <span>{formatPrice(workshop.price)}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isRegistered ? (
                  <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-700">
                    Đã đăng ký
                  </span>
                ) : (
                  <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                    {isFull ? 'Hết chỗ' : 'Còn chỗ'}
                  </span>
                )}
                <span className="text-xs text-brand-900/50">Nhấn để xem chi tiết</span>
              </div>
            </button>
          );
        })}
      </div>

      <Modal
        isOpen={detailOpen}
        onClose={closeDetail}
        title={selectedWorkshop?.title || 'Chi tiết workshop'}
        description="Thông tin đầy đủ và thao tác đăng ký."
        size="xl"
      >
        {selectedWorkshop ? (
          <div className="grid gap-5">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}
            <section className="grid gap-3 rounded-3xl border border-brand-200/70 bg-white/80 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-brand-900/70">Thời gian</p>
                  <p className="text-sm text-brand-900">
                    {formatDateTime(selectedWorkshop.start_time)} -
                    {` ${formatDateTime(selectedWorkshop.end_time)}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-brand-900/70">Chỗ trống</p>
                  <p className="text-sm text-brand-900">
                    {selectedWorkshop.available_seats}/{selectedWorkshop.capacity}
                  </p>
                </div>
              </div>
              <div className="grid gap-1 text-sm text-brand-900/70">
                <p>
                  <span className="font-semibold text-brand-900">Diễn giả:</span>{' '}
                  {selectedWorkshop.speaker || 'Đang cập nhật'}
                </p>
                <p>
                  <span className="font-semibold text-brand-900">Địa điểm:</span>{' '}
                  {selectedWorkshop.location || 'Đang cập nhật'}
                </p>
                {selectedWorkshop.room_map_url && (
                  <p>
                    <span className="font-semibold text-brand-900">Sơ đồ phòng:</span>{' '}
                    <a href={selectedWorkshop.room_map_url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                      Xem sơ đồ
                    </a>
                  </p>
                )}
                <p>
                  <span className="font-semibold text-brand-900">Giá vé:</span>{' '}
                  {formatPrice(selectedWorkshop.price)}
                </p>
              </div>
              <div className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                  Mô tả
                </p>
                <div
                  className="mt-2 text-sm text-brand-900/80 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html:
                      selectedWorkshop.description || '<em>Chưa có mô tả chi tiết.</em>',
                  }}
                />
              </div>
            </section>

            {selectedWorkshop.registration_status === 'confirmed' ? (
              <div className="rounded-2xl border border-brand-200/70 bg-brand-50 px-4 py-3 text-xs text-brand-900">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold">Đã đăng ký</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] uppercase tracking-wide text-brand-500">
                    Mã QR Check-in
                  </span>
                </div>
                <div className="flex justify-center bg-white p-4 rounded-xl border border-brand-200">
                  <QRCodeCanvas value={selectedWorkshop.registration_id} size={200} />
                </div>
                <p className="mt-4 text-center break-all font-mono text-[11px] text-brand-700">
                  {selectedWorkshop.registration_id}
                </p>
              </div>
            ) : null}

            {selectedWorkshop.registration_status === 'pending' ? (
              <div className="rounded-2xl border border-yellow-200/70 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Đang chờ thanh toán</span>
                </div>
                <p>Bạn đã đăng ký nhưng chưa hoàn tất thanh toán. Vui lòng thanh toán để xác nhận giữ chỗ.</p>
                <div className="mt-4 text-center">
                  <button
                    onClick={() => handleRegister(selectedWorkshop.id)}
                    disabled={busyId === selectedWorkshop.id}
                    className="rounded-full bg-yellow-500 px-5 py-2 text-white font-semibold hover:bg-yellow-600 transition"
                  >
                    {busyId === selectedWorkshop.id ? 'Đang tải...' : 'Tiếp tục thanh toán'}
                  </button>
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              {selectedWorkshop.registration_status === 'confirmed' || selectedWorkshop.registration_status === 'pending' ? (
                <button
                  type="button"
                  onClick={() => handleCancel(selectedWorkshop.registration_id)}
                  disabled={busyId === selectedWorkshop.registration_id}
                  className="rounded-full border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:border-brand-500 hover:text-brand-900 disabled:opacity-60"
                >
                  {busyId === selectedWorkshop.registration_id
                    ? 'Đang xử lý...'
                    : 'Hủy đăng ký'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleRegister(selectedWorkshop.id)}
                  disabled={
                    Number(selectedWorkshop.available_seats) <= 0 || busyId === selectedWorkshop.id
                  }
                  className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
                >
                  {Number(selectedWorkshop.available_seats) <= 0
                    ? 'Hết chỗ'
                    : busyId === selectedWorkshop.id
                    ? 'Đang đăng ký...'
                    : 'Đăng ký'}
                </button>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </PageShell>
  );
};

export default StudentDashboard;
