import React, { useEffect, useMemo, useState } from 'react';
import PageShell from '../components/PageShell';
import Modal from '../components/Modal';
import { QRCodeCanvas } from 'qrcode.react';
import { fetchWorkshops, registerWorkshop, cancelRegistration, fetchWorkshopImages } from '../api/client';

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
  const [workshopImages, setWorkshopImages] = useState([]);

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

  const openDetail = async (workshop) => {
    setSelectedWorkshop(workshop);
    setDetailOpen(true);
    try {
      const images = await fetchWorkshopImages(workshop.id);
      setWorkshopImages(images || []);
    } catch {
      setWorkshopImages([]);
    }
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedWorkshop(null);
    setWorkshopImages([]);
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
        if (payload.order_code) {
          localStorage.setItem('pendingOrderCode', payload.order_code);
          console.log('[handleRegister] Stored order code:', payload.order_code);
        }
        window.location.href = payload.checkout_url;
      } else {
        console.log('[handleRegister] No checkout_url, checking for message...');
        if (payload.message) {
          console.log('[handleRegister] Setting error:', payload.message);
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
      title="Khám phá Workshop"
      subtitle="Lọc, theo dõi lịch và đăng ký nhanh chóng."
      actions={
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
                activeFilter === filter.key
                  ? 'bg-primary text-white'
                  : 'border border-border text-text-secondary hover:bg-hover hover:text-primary'
              }`}
            >
              {filter.label}
            </button>
          ))}
          <button
            type="button"
            onClick={loadWorkshops}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-hover hover:text-primary"
          >
            Tải lại
          </button>
        </div>
      }
    >
      {error ? (
        <div className="rounded-lg border border-error/20 bg-error-container px-4 py-3 text-sm text-error">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-sm text-text-secondary shadow-soft">
          Đang tải workshop...
        </div>
      ) : null}

      {!loading && filteredWorkshops.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-sm text-text-secondary shadow-soft">
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
              className="flex w-full flex-col rounded-xl border border-border bg-surface text-left shadow-soft transition-colors hover:border-accent overflow-hidden"
            >
              {workshop.thumbnail ? (
                <img
                  src={workshop.thumbnail}
                  alt={workshop.title}
                  className="h-20 w-full object-cover shrink-0"
                />
              ) : null}
              <div className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-base font-semibold text-primary text-fade">
                    {workshop.title}
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    {formatDateTime(workshop.start_time)}
                  </p>
                </div>
                <span className="rounded-lg bg-hover px-2.5 py-1 text-xs font-medium text-text-secondary">
                  {workshop.available_seats}/{workshop.capacity}
                </span>
              </div>

              <p className="text-sm text-text-secondary">{getSnippet(workshop.description)}</p>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-text-secondary">
                <span>{workshop.speaker ? `Diễn giả: ${workshop.speaker}` : 'Đang cập nhật diễn giả'}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-text-secondary">
                <span>{workshop.location || 'Đang cập nhật địa điểm'}</span>
                <span>{formatPrice(workshop.price)}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isRegistered ? (
                  workshop.is_checked_in ? (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Đã Check-in
                    </span>
                  ) : (
                    <span className="rounded-lg bg-accent/10 px-2.5 py-1 text-xs font-medium text-text-secondary">
                      Đã đăng ký
                    </span>
                  )
                ) : (
                  <span className="rounded-lg bg-hover px-2.5 py-1 text-xs font-medium text-text-secondary">
                    {isFull ? 'Hết chỗ' : 'Còn chỗ'}
                  </span>
                )}
                <span className="text-xs text-text-secondary">Nhấn để xem chi tiết</span>
              </div>
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
              <div className="rounded-lg border border-error/20 bg-error-container px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}
            {workshopImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {workshopImages.map((img, idx) => (
                  <img
                    key={img.id || idx}
                    src={img.cdn_medium || img.cdn_url}
                    alt={`Ảnh ${idx + 1}`}
                    className="h-32 w-full rounded-lg border border-border object-cover"
                  />
                ))}
              </div>
            ) : null}
            <section className="grid gap-3 rounded-xl border border-border bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-text-secondary">Thời gian</p>
                  <p className="text-sm text-primary">
                    {formatDateTime(selectedWorkshop.start_time)} -
                    {` ${formatDateTime(selectedWorkshop.end_time)}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text-secondary">Chỗ trống</p>
                  <p className="text-sm text-primary">
                    {selectedWorkshop.available_seats}/{selectedWorkshop.capacity}
                  </p>
                </div>
              </div>
              <div className="grid gap-1 text-sm text-text-secondary">
                <p>
                  <span className="font-medium text-primary">Diễn giả:</span>{' '}
                  {selectedWorkshop.speaker || 'Đang cập nhật'}
                </p>
                <p>
                  <span className="font-medium text-primary">Địa điểm:</span>{' '}
                  {selectedWorkshop.location || 'Đang cập nhật'}
                </p>
                {selectedWorkshop.room_map_url && (
                  <p>
                    <span className="font-medium text-primary">Sơ đồ phòng:</span>{' '}
                    <a href={selectedWorkshop.room_map_url} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                      Xem sơ đồ
                    </a>
                  </p>
                )}
                <p>
                  <span className="font-medium text-primary">Giá vé:</span>{' '}
                  {formatPrice(selectedWorkshop.price)}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background px-4 py-3">
                <p className="text-sm font-medium text-primary">
                  Mô tả
                </p>
                <div
                  className="mt-2 text-sm text-text-secondary leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html:
                      selectedWorkshop.description || '<em>Chưa có mô tả chi tiết.</em>',
                  }}
                />
              </div>
            </section>

            {selectedWorkshop.registration_status === 'confirmed' ? (
              selectedWorkshop.is_checked_in ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-success/20 bg-success/5 px-4 py-5 text-sm text-primary">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-success"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-base font-semibold">Đã Check-in Thành Công</span>
                  <p className="mt-1 text-text-secondary text-center">Chúc bạn có một buổi workshop thú vị và bổ ích!</p>
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-primary">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-medium">Đã đăng ký</span>
                    <span className="rounded-lg bg-surface px-2 py-0.5 text-xs text-accent border border-border">
                      Mã QR Check-in
                    </span>
                  </div>
                  <div className="flex justify-center rounded-lg border border-border bg-surface p-4">
                    <QRCodeCanvas value={`${selectedWorkshop.id}|${selectedWorkshop.registration_id}`} size={200} />
                  </div>
                  <p className="mt-4 text-center break-all font-mono text-xs text-text-secondary">
                    {selectedWorkshop.registration_id}
                  </p>
                </div>
              )
            ) : null}

            {selectedWorkshop.registration_status === 'pending' ? (
              <div className="rounded-lg border border-warning/20 bg-warning/5 px-4 py-3 text-sm text-primary">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold text-warning">Đang chờ thanh toán</span>
                </div>
                <p className="text-text-secondary">Bạn đã đăng ký nhưng chưa hoàn tất thanh toán. Vui lòng thanh toán để xác nhận giữ chỗ.</p>
                <div className="mt-4 text-center">
                  <button
                    onClick={() => handleRegister(selectedWorkshop.id)}
                    disabled={busyId === selectedWorkshop.id}
                    className="rounded-lg bg-warning px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
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
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-hover hover:text-primary disabled:opacity-60"
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
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
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
