import React, { useEffect, useMemo, useState } from 'react';
import PageShell from '../components/PageShell';
import Modal from '../components/Modal';
import HtmlEditor from '../components/HtmlEditor';
import {
  fetchWorkshops,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
  fetchWorkshopRegistrations,
  fetchWorkshopStaff,
  addWorkshopStaff,
  removeWorkshopStaff,
} from '../api/client';
import { uploadWithPresigned } from '../utils/upload';

const formatDateTime = (value) => {
  if (!value) {
    return '';
  }
  return new Date(value).toLocaleString('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const toDateTimeLocal = (value) => {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
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
  if (plain.length <= 140) {
    return plain;
  }
  return `${plain.slice(0, 140)}...`;
};

const emptyForm = {
  title: '',
  description: '',
  capacity: '',
  price: '0',
  start_time: '',
  end_time: '',
  location: '',
  speaker: '',
  room_map_url: '',
  staffEmails: '',
};

const AdminWorkshops = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [registrationsError, setRegistrationsError] = useState('');

  const [workshopStaff, setWorkshopStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [newStaffEmail, setNewStaffEmail] = useState('');

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    isConfirm: false,
  });

  const showAlert = (message, title = 'Thông báo') => {
    setAlertConfig({
      isOpen: true,
      title,
      message,
      onConfirm: null,
      isConfirm: false,
    });
  };

  const showConfirm = (message, onConfirm, title = 'Xác nhận') => {
    setAlertConfig({
      isOpen: true,
      title,
      message,
      onConfirm,
      isConfirm: true,
    });
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, isOpen: false }));
  };

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

  const sortedWorkshops = useMemo(() => {
    return [...workshops].sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
  }, [workshops]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEditModal = (workshop) => {
    setEditingId(workshop.id);
    setForm({
      title: workshop.title || '',
      description: workshop.description || '',
      capacity: workshop.capacity || '',
      price: workshop.price ?? '0',
      start_time: toDateTimeLocal(workshop.start_time),
      end_time: toDateTimeLocal(workshop.end_time),
      location: workshop.location || '',
      speaker: workshop.speaker || '',
      room_map_url: workshop.room_map_url || '',
      staffEmails: workshop.staff_emails || '',
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const loadRegistrations = async (workshopId) => {
    setRegistrationsLoading(true);
    setRegistrationsError('');
    try {
      const response = await fetchWorkshopRegistrations(workshopId);
      setRegistrations(response.data.registrations || []);
    } catch (err) {
      setRegistrationsError(
        err.response?.data?.message || 'Không thể tải danh sách sinh viên đăng ký.'
      );
    } finally {
      setRegistrationsLoading(false);
    }
  };

  const loadStaff = async (workshopId) => {
    setStaffLoading(true);
    try {
      const response = await fetchWorkshopStaff(workshopId);
      setWorkshopStaff(response.data || []);
    } catch (err) {
      console.error('Failed to load staff:', err);
    } finally {
      setStaffLoading(false);
    }
  };

  const handleAddStaff = async () => {
    if (!newStaffEmail.trim()) return;
    try {
      await addWorkshopStaff(selectedWorkshop.id, newStaffEmail.trim());
      setNewStaffEmail('');
      await loadStaff(selectedWorkshop.id);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Không thể thêm nhân sự.', 'Lỗi');
    }
  };

  const handleRemoveStaff = async (staffId) => {
    try {
      await removeWorkshopStaff(selectedWorkshop.id, staffId);
      await loadStaff(selectedWorkshop.id);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Không thể xóa nhân sự.', 'Lỗi');
    }
  };

  const openDetailModal = async (workshop) => {
    setSelectedWorkshop(workshop);
    setDetailOpen(true);
    await loadRegistrations(workshop.id);
    await loadStaff(workshop.id);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedWorkshop(null);
    setRegistrations([]);
    setRegistrationsError('');
  };

  const handleChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleDescriptionChange = (value) => {
    setForm((prev) => ({
      ...prev,
      description: value,
    }));
  };

  const handlePdfUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const loadingMessage = '<p><em>Đang tải PDF lên và phân tích AI...</em></p>';
    setForm((prev) => ({ ...prev, description: (prev.description || '') + loadingMessage }));

    try {
      const { cdnUrl, cdnProcessed } = await uploadWithPresigned(file, (pct) => {
        const progressMsg = `<p><em>Đang tải PDF lên (${pct}%)...</em></p>`;
        setForm((prev) => {
          const cleaned = prev.description.replace(/<p><em>.*PDF.*<\/em><\/p>/g, '');
          return { ...prev, description: cleaned + progressMsg };
        });
      });

      setForm((prev) => {
        const cleaned = prev.description.replace(/<p><em>.*PDF.*<\/em><\/p>/g, '');
        const fileLink = `<p><a href="${cdnUrl}" target="_blank" rel="noreferrer">📄 Xem PDF gốc</a></p>`;
        const summary = `<p><strong>Tóm tắt AI (${file.name}):</strong> Dựa trên nội dung tài liệu, workshop này sẽ cung cấp kiến thức nền tảng và kỹ năng thực chiến cho sinh viên. Bao gồm các bài tập thực hành trực tiếp và thảo luận nhóm.</p>`;
        return {
          ...prev,
          description: cleaned + fileLink + summary,
        };
      });
    } catch (err) {
      setForm((prev) => {
        const cleaned = prev.description.replace(/<p><em>.*PDF.*<\/em><\/p>/g, '');
        return {
          ...prev,
          description: cleaned + `<p><em style="color:red;">Lỗi upload PDF: ${err.message}</em></p>`,
        };
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        price: form.price === '' ? 0 : Number(form.price),
        start_time: form.start_time ? new Date(form.start_time).toISOString() : undefined,
        end_time: form.end_time ? new Date(form.end_time).toISOString() : undefined,
        location: form.location.trim() || null,
        speaker: form.speaker?.trim() || null,
        room_map_url: form.room_map_url?.trim() || null,
        staff_emails: form.staffEmails?.trim() || null,
      };

      if (editingId) {
        await updateWorkshop(editingId, payload);
      } else {
        await createWorkshop(payload);
      }

      await loadWorkshops();
      closeForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu workshop.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (workshopId) => {
    showConfirm('Bạn chắc chắn muốn xóa workshop này? Hành động này không thể hoàn tác.', async () => {
      setError('');
      try {
        await deleteWorkshop(workshopId);
        await loadWorkshops();
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể xóa workshop.');
      }
    });
  };

  return (
    <PageShell
      title="Quản trị Workshop"
      subtitle="Tạo, cập nhật và theo dõi danh sách đăng ký."
      actions={
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Tạo workshop
          </button>
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
        <div className="rounded-xl border border-border bg-surface p-6 text-sm text-text-secondary shadow-soft">
          Đang tải workshop...
        </div>
      ) : null}

      {!loading && sortedWorkshops.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-6 text-sm text-text-secondary shadow-soft">
          Chưa có workshop nào.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {sortedWorkshops.map((workshop) => (
          <article
            key={workshop.id}
            className="rounded-xl border border-border bg-surface p-5 shadow-soft"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-base font-semibold text-primary text-fade">
                  {workshop.title}
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  {formatDateTime(workshop.start_time)}
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  {workshop.location || 'Đang cập nhật'}
                </p>
              </div>
              <div className="text-right">
                <span className="rounded-lg bg-hover px-2.5 py-1 text-xs font-medium text-text-secondary">
                  {workshop.available_seats}/{workshop.capacity}
                </span>
                <p className="mt-2 text-xs text-text-secondary">{formatPrice(workshop.price)}</p>
              </div>
            </div>

            <p className="mt-3 text-sm text-text-secondary">{getSnippet(workshop.description)}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => openDetailModal(workshop)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-hover hover:text-primary"
              >
                Xem chi tiết
              </button>
              <button
                type="button"
                onClick={() => openEditModal(workshop)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-hover hover:text-primary"
              >
                Chỉnh sửa
              </button>
              <button
                type="button"
                onClick={() => handleDelete(workshop.id)}
                className="rounded-lg border border-error/20 px-3 py-1.5 text-xs font-medium text-error transition-colors hover:bg-error-container"
              >
                Xóa
              </button>
            </div>
          </article>
        ))}
      </div>

      <Modal
        isOpen={formOpen}
        onClose={closeForm}
        title={editingId ? 'Chỉnh sửa workshop' : 'Tạo workshop mới'}
        description="Mô tả hỗ trợ định dạng HTML và có thanh công cụ định dạng."
        size="xl"
      >
        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-primary">
              Tiêu đề
            </label>
            <input
              value={form.title}
              onChange={handleChange('title')}
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/10 transition-colors duration-150"
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-primary">
                Mô tả
              </label>
              <label className="cursor-pointer rounded-lg bg-hover px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-border">
                Upload PDF Tóm Tắt AI
                <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
              </label>
            </div>
            <HtmlEditor value={form.description} onChange={handleDescriptionChange} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-primary">
                Sức chứa
              </label>
              <input
                type="number"
                min="1"
                value={form.capacity}
                onChange={handleChange('capacity')}
                required
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/10 transition-colors duration-150"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-primary">
                Giá vé (VND)
              </label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange('price')}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/10 transition-colors duration-150"
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-primary">
                Bắt đầu
              </label>
              <input
                type="datetime-local"
                value={form.start_time}
                onChange={handleChange('start_time')}
                required
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/10 transition-colors duration-150"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-primary">
                Kết thúc
              </label>
              <input
                type="datetime-local"
                value={form.end_time}
                onChange={handleChange('end_time')}
                required
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/10 transition-colors duration-150"
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-primary">
                Địa điểm
              </label>
              <input
                value={form.location}
                onChange={handleChange('location')}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/10 transition-colors duration-150"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-primary">
                Diễn giả
              </label>
              <input
                value={form.speaker}
                onChange={handleChange('speaker')}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/10 transition-colors duration-150"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-primary">
                Sơ đồ phòng (URL)
              </label>
              <label className="cursor-pointer rounded-lg bg-hover px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-border">
                Tải ảnh lên (S3)
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  console.log('[RoomMap] File selected:', file.name, file.type, file.size);
                  try {
                    const { cdnProcessed } = await uploadWithPresigned(file);
                    const displayUrl = cdnProcessed ? cdnProcessed.large : '';
                    console.log('[RoomMap] Upload done, URL:', displayUrl);
                    setForm(prev => ({ ...prev, room_map_url: displayUrl }));
                    alert('Upload thành công!');
                  } catch (err) {
                    console.error('[RoomMap] Upload error:', err);
                    alert('Lỗi upload ảnh: ' + err.message);
                  }
                }} />
              </label>
            </div>
            <input
              value={form.room_map_url}
              onChange={handleChange('room_map_url')}
              placeholder="Nhập link sơ đồ phòng hoặc bấm tải ảnh lên..."
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/10 transition-colors duration-150"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-primary">
              Danh sách Staff Check-in (Email, cách nhau bằng dấu phẩy)
            </label>
            <input
              value={form.staffEmails}
              onChange={handleChange('staffEmails')}
              placeholder="Ví dụ: staff1@unihub.com, staff2@unihub.com"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/10 transition-colors duration-150"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {saving ? 'Đang lưu...' : editingId ? 'Cập nhật workshop' : 'Tạo workshop'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-hover hover:text-primary"
            >
              Hủy
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={detailOpen}
        onClose={closeDetail}
        title={selectedWorkshop?.title || 'Chi tiết workshop'}
        description="Danh sách sinh viên đã đăng ký và thông tin đầy đủ."
        size="xl"
      >
        {selectedWorkshop ? (
          <div className="grid gap-6">
            <section className="grid gap-4 rounded-xl border border-border bg-surface p-5">
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

            <section className="grid gap-3">
              <h3 className="font-display text-lg font-semibold text-primary">
                Danh sách sinh viên đăng ký
              </h3>

              {registrationsError ? (
                <div className="rounded-lg border border-error/20 bg-error-container px-4 py-3 text-sm text-error">
                  {registrationsError}
                </div>
              ) : null}

              {registrationsLoading ? (
                <div className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
                  Đang tải danh sách đăng ký...
                </div>
              ) : null}

              {!registrationsLoading && registrations.length === 0 ? (
                <div className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
                  Chưa có sinh viên đăng ký.
                </div>
              ) : null}

              <div className="grid gap-2">
                {registrations.map((item) => (
                  <div
                    key={item.registration_id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-primary">{item.student_name}</p>
                      <p className="text-xs text-text-secondary">
                        {item.student_email} · {item.student_code || 'Chưa có mã SV'}
                      </p>
                    </div>
                    <div className="text-right text-xs text-text-secondary">
                      <p className="font-medium text-primary">
                        {item.registration_status === 'confirmed' ? 'Đã xác nhận' : 'Đã hủy'}
                      </p>
                      <p>
                        {item.checkin_time
                          ? `Đã check-in: ${formatDateTime(item.checkin_time)}`
                          : 'Chưa check-in'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-3 border-t border-border pt-5">
              <h3 className="font-display text-lg font-semibold text-primary">
                Nhân sự Check-in (Staff)
              </h3>

              <div className="flex gap-2">
                <input
                  type="email"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  placeholder="Nhập email nhân viên..."
                  className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm outline-none focus:border-accent transition-colors duration-150"
                />
                <button
                  type="button"
                  onClick={handleAddStaff}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Thêm
                </button>
              </div>

              {staffLoading ? (
                <div className="text-sm text-text-secondary">Đang tải danh sách staff...</div>
              ) : (
                <div className="grid gap-2 mt-2">
                  {workshopStaff.length === 0 ? (
                    <div className="text-sm text-text-secondary">Chưa có staff nào được phân công.</div>
                  ) : (
                    workshopStaff.map((staff) => (
                      <div key={staff.id} className="flex items-center justify-between rounded-lg bg-background px-4 py-2 border border-border">
                        <div>
                          <p className="text-sm font-medium text-primary">{staff.name}</p>
                          <p className="text-xs text-text-secondary">{staff.email}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveStaff(staff.id)}
                          className="text-xs font-medium text-error transition-colors hover:underline"
                        >
                          Xóa
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </section>
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={alertConfig.isOpen}
        onClose={closeAlert}
        title={alertConfig.title}
        size="sm"
      >
        <div className="grid gap-6">
          <p className="text-sm text-text-secondary leading-relaxed">
            {alertConfig.message}
          </p>
          <div className="flex justify-end gap-3">
            {alertConfig.isConfirm && (
              <button
                type="button"
                onClick={closeAlert}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-hover"
              >
                Hủy
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (alertConfig.onConfirm) {
                  alertConfig.onConfirm();
                }
                closeAlert();
              }}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {alertConfig.isConfirm ? 'Xác nhận' : 'Đóng'}
            </button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
};

export default AdminWorkshops;
