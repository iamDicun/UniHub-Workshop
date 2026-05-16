import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PageShell from '../components/PageShell';
import { getSyncJobs, triggerSyncUsers, getPresignedUrl, confirmUpload } from '../api/client';

const AdminSyncUsers = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [isImmediate, setIsImmediate] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const loadJobs = async () => {
    try {
      const res = await getSyncJobs();
      setJobs(res.data);
    } catch (err) {
      console.error(err);
      alert('Không thể tải danh sách sync jobs');
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadAndSync = async () => {
    if (!file) {
      alert('Vui lòng chọn file CSV');
      return;
    }

    setLoading(true);
    setUploadStatus('Đang tạo presigned URL...');
    try {
      const { name, type, size } = file;
      const mimeType = type || 'text/csv';

      const uploadData = await getPresignedUrl(name, mimeType, size);

      setUploadStatus('Đang upload file lên S3...');
      await axios.put(uploadData.uploadUrl, file, {
        headers: { 'Content-Type': mimeType },
      });

      setUploadStatus('Xác nhận upload...');
      await confirmUpload(uploadData.fileId);

      setUploadStatus('Đang trigger sync job...');
      await triggerSyncUsers(uploadData.objectKey, isImmediate);

      setUploadStatus('Hoàn thành!');
      setFile(null);
      await loadJobs();

      setTimeout(() => setUploadStatus(''), 3000);
    } catch (err) {
      console.error(err);
      alert(`Lỗi upload/sync: ${err.message || 'Unknown'}`);
      setUploadStatus('Lỗi!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title="Đồng bộ Sinh viên"
      subtitle="Quản lý việc đưa danh sách sinh viên từ file CSV vào Database."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-6 shadow-soft">
          <h2 className="font-display text-lg font-semibold text-primary mb-4">Upload CSV Mới</h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-primary">
                Chọn file CSV
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full rounded-lg border border-border bg-background p-2 text-sm text-text-secondary file:mr-4 file:rounded-lg file:border-0 file:bg-hover file:px-4 file:py-1.5 file:text-sm file:font-medium file:text-primary hover:file:bg-border transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="immediateSync"
                checked={isImmediate}
                onChange={(e) => setIsImmediate(e.target.checked)}
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
              />
              <label htmlFor="immediateSync" className="text-sm font-medium text-primary">
                Chạy đồng bộ ngay lập tức (Sync Now)
              </label>
            </div>
            <p className="text-xs text-text-secondary">
              * Nếu không chọn, dữ liệu sẽ được lưu và tự động cập nhật vào ban đêm (Nightly Cron).
            </p>

            <button
              onClick={handleUploadAndSync}
              disabled={loading || !file}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-opacity ${
                loading || !file ? 'cursor-not-allowed opacity-50 bg-text-secondary' : 'bg-primary hover:opacity-90'
              }`}
            >
              {loading ? uploadStatus : 'Upload & Tạo Job'}
            </button>
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-border bg-surface p-6 shadow-soft h-[500px]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-primary">Lịch sử Đồng bộ</h2>
            <button
              onClick={loadJobs}
              className="text-sm font-medium text-accent transition-colors hover:text-primary"
            >
              Làm mới
            </button>
          </div>

          <div className="flex-1 overflow-auto rounded-lg border border-border">
            <table className="min-w-full text-left text-sm text-primary">
              <thead className="sticky top-0 bg-background text-xs text-text-secondary">
                <tr>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium">Loại</th>
                  <th className="px-4 py-3 font-medium">Tạo lúc</th>
                  <th className="px-4 py-3 font-medium">Hoàn thành</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-hover transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-medium ${
                        job.status === 'Completed' ? 'bg-success/10 text-success' :
                        job.status === 'Failed' ? 'bg-error/10 text-error' :
                        job.status === 'Processing' ? 'bg-accent/10 text-accent' :
                        'bg-warning/10 text-warning'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {job.is_immediate ? 'Tức thời' : 'Cron (Night)'}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{new Date(job.created_at).toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {job.finished_at ? new Date(job.finished_at).toLocaleString('vi-VN') : '-'}
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-sm text-text-secondary">
                      Chưa có dữ liệu đồng bộ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default AdminSyncUsers;
