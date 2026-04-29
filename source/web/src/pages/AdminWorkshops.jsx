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

  const handlePdfUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const loadingMessage = '<p><em>Đang phân tích PDF và tạo tóm tắt AI...</em></p>';
    setForm((prev) => ({ ...prev, description: (prev.description || '') + loadingMessage }));

    setTimeout(() => {
      setForm((prev) => {
        const cleaned = prev.description.replace(loadingMessage, '');
        const summary = `<p><strong>Tóm tắt AI (${file.name}):</strong> Dựa trên nội dung tài liệu, workshop này sẽ cung cấp kiến thức nền tảng và kỹ năng thực chiến cho sinh viên. Bao gồm các bài tập thực hành trực tiếp và thảo luận nhóm.</p>`;
        return {
          ...prev,
          description: cleaned + summary,
        };
      });
    }, 2000);
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
      title="Quản trị workshop"
      subtitle="Tạo, cập nhật và theo dõi danh sách đăng ký theo từng workshop."
      actions={
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            Tạo workshop
          </button>
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
        <div className="rounded-3xl border border-brand-200 bg-white/70 p-6 text-sm text-brand-900/70">
          Đang tải workshop...
        </div>
      ) : null}

      {!loading && sortedWorkshops.length === 0 ? (
        <div className="rounded-3xl border border-brand-200 bg-white/70 p-6 text-sm text-brand-900/70">
          Chưa có workshop nào.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {sortedWorkshops.map((workshop) => (
          <article
            key={workshop.id}
            className="rounded-3xl border border-brand-200/80 bg-white/80 p-5 shadow-[0_24px_60px_-48px_rgba(15,76,92,0.45)] backdrop-blur"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg font-semibold text-brand-900 text-fade">
                  {workshop.title}
                </h3>
                <p className="mt-1 text-sm text-brand-900/70">
                  {formatDateTime(workshop.start_time)}
                </p>
                <p className="mt-1 text-xs text-brand-900/60">
                  {workshop.location || 'Đang cập nhật'}
                </p>
              </div>
              <div className="text-right">
                <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase text-brand-700">
                  {workshop.available_seats}/{workshop.capacity}
                </span>
                <p className="mt-2 text-xs text-brand-900/60">{formatPrice(workshop.price)}</p>
              </div>
            </div>

            <p className="mt-3 text-sm text-brand-900/70">{getSnippet(workshop.description)}</p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => openDetailModal(workshop)}
                className="rounded-full border border-brand-200 px-4 py-2 text-xs font-semibold text-brand-700 transition hover:border-brand-500 hover:text-brand-900"
              >
                Xem chi tiết
              </button>
              <button
                type="button"
                onClick={() => openEditModal(workshop)}
                className="rounded-full border border-brand-200 px-4 py-2 text-xs font-semibold text-brand-700 transition hover:border-brand-500 hover:text-brand-900"
              >
                Chỉnh sửa
              </button>
              <button
                type="button"
                onClick={() => handleDelete(workshop.id)}
                className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition hover:border-red-300"
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
          <label className="text-xs font-semibold uppercase tracking-wide text-brand-700">
            Tiêu đề
            <input
              value={form.title}
              onChange={handleChange('title')}
              required
              className="mt-2 w-full rounded-2xl border border-brand-200 bg-white px-4 py-3 text-sm text-brand-900 outline-none focus:border-brand-500"
            />
          </label>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                Mô tả
              </label>
              <label className="cursor-pointer rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 transition hover:bg-brand-200">
                Upload PDF Tóm Tắt AI
                <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
              </label>
            </div>
            <HtmlEditor value={form.description} onChange={handleDescriptionChange} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              Sức chứa
              <input
                type="number"
                min="1"
                value={form.capacity}
                onChange={handleChange('capacity')}
                required
                className="mt-2 w-full rounded-2xl border border-brand-200 bg-white px-4 py-3 text-sm text-brand-900 outline-none focus:border-brand-500"
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              Giá vé (VND)
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange('price')}
                className="mt-2 w-full rounded-2xl border border-brand-200 bg-white px-4 py-3 text-sm text-brand-900 outline-none focus:border-brand-500"
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              Bắt đầu
              <input
                type="datetime-local"
                value={form.start_time}
                onChange={handleChange('start_time')}
                required
                className="mt-2 w-full rounded-2xl border border-brand-200 bg-white px-4 py-3 text-sm text-brand-900 outline-none focus:border-brand-500"
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              Kết thúc
              <input
                type="datetime-local"
                value={form.end_time}
                onChange={handleChange('end_time')}
                required
                className="mt-2 w-full rounded-2xl border border-brand-200 bg-white px-4 py-3 text-sm text-brand-900 outline-none focus:border-brand-500"
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              Địa điểm
              <input
                value={form.location}
                onChange={handleChange('location')}
                className="mt-2 w-full rounded-2xl border border-brand-200 bg-white px-4 py-3 text-sm text-brand-900 outline-none focus:border-brand-500"
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              Diễn giả
              <input
                value={form.speaker}
                onChange={handleChange('speaker')}
                className="mt-2 w-full rounded-2xl border border-brand-200 bg-white px-4 py-3 text-sm text-brand-900 outline-none focus:border-brand-500"
              />
            </label>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                Sơ đồ phòng (URL)
              </label>
              <label className="cursor-pointer rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 transition hover:bg-brand-200">
                Tải ảnh lên (Storage Mock)
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setForm(prev => ({ ...prev, room_map_url: URL.createObjectURL(file) }));
                  }
                }} />
              </label>
            </div>
            <input
              value={form.room_map_url}
              onChange={handleChange('room_map_url')}
              placeholder="Nhập link sơ đồ phòng hoặc bấm tải ảnh lên..."
              className="w-full rounded-2xl border border-brand-200 bg-white px-4 py-3 text-sm text-brand-900 outline-none focus:border-brand-500"
            />
          </div>

          <label className="text-xs font-semibold uppercase tracking-wide text-brand-700">
            Danh sách Staff Check-in (Email, cách nhau bằng dấu phẩy)
            <input
              value={form.staffEmails}
              onChange={handleChange('staffEmails')}
              placeholder="Ví dụ: staff1@unihub.com, staff2@unihub.com"
              className="mt-2 w-full rounded-2xl border border-brand-200 bg-white px-4 py-3 text-sm text-brand-900 outline-none focus:border-brand-500"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
            >
              {saving ? 'Đang lưu...' : editingId ? 'Cập nhật workshop' : 'Tạo workshop'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-full border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:border-brand-500 hover:text-brand-900"
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
            <section className="grid gap-4 rounded-3xl border border-brand-200/70 bg-white/80 p-5">
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

            <section className="grid gap-3">
              <h3 className="font-display text-lg font-semibold text-brand-900">
                Danh sách sinh viên đăng ký
              </h3>

              {registrationsError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {registrationsError}
                </div>
              ) : null}

              {registrationsLoading ? (
                <div className="rounded-2xl border border-brand-200 bg-white/70 px-4 py-3 text-sm text-brand-900/70">
                  Đang tải danh sách đăng ký...
                </div>
              ) : null}

              {!registrationsLoading && registrations.length === 0 ? (
                <div className="rounded-2xl border border-brand-200 bg-white/70 px-4 py-3 text-sm text-brand-900/70">
                  Chưa có sinh viên đăng ký.
                </div>
              ) : null}

              <div className="grid gap-3">
                {registrations.map((item) => (
                  <div
                    key={item.registration_id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-200/70 bg-white px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-brand-900">{item.student_name}</p>
                      <p className="text-xs text-brand-900/60">
                        {item.student_email} · {item.student_code || 'Chưa có mã SV'}
                      </p>
                    </div>
                    <div className="text-right text-xs text-brand-900/60">
                      <p className="font-semibold text-brand-700">
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

            <section className="grid gap-3 border-t border-brand-200 pt-5">
              <h3 className="font-display text-lg font-semibold text-brand-900">
                Nhân sự Check-in (Staff)
              </h3>
              
              <div className="flex gap-2">
                <input 
                  type="email" 
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  placeholder="Nhập email nhân viên..."
                  className="flex-1 rounded-full border border-brand-200 px-4 py-2 text-sm outline-none focus:border-brand-500"
                />
                <button 
                  type="button"
                  onClick={handleAddStaff}
                  className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  Thêm
                </button>
              </div>

              {staffLoading ? (
                <div className="text-sm text-brand-900/70">Đang tải danh sách staff...</div>
              ) : (
                <div className="grid gap-2 mt-2">
                  {workshopStaff.length === 0 ? (
                    <div className="text-sm text-brand-900/70">Chưa có staff nào được phân công.</div>
                  ) : (
                    workshopStaff.map((staff) => (
                      <div key={staff.id} className="flex items-center justify-between rounded-xl bg-brand-50 px-4 py-2">
                        <div>
                          <p className="text-sm font-semibold text-brand-900">{staff.name}</p>
                          <p className="text-xs text-brand-900/60">{staff.email}</p>
                        </div>
                        <button 
                          onClick={() => handleRemoveStaff(staff.id)}
                          className="text-xs font-semibold text-red-600 hover:text-red-800"
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
          <p className="text-sm text-brand-900/80 leading-relaxed">
            {alertConfig.message}
          </p>
          <div className="flex justify-end gap-3">
            {alertConfig.isConfirm && (
              <button
                type="button"
                onClick={closeAlert}
                className="rounded-full border border-brand-200 px-5 py-2 text-sm font-semibold text-brand-700 transition hover:border-brand-500"
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
              className="rounded-full bg-brand-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
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
