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
      title="Đồng bộ sinh viên"
      subtitle="Quản lý việc đưa danh sách sinh viên từ file CSV vào Database hệ thống UniHub."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-brand-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-brand-900">Upload CSV Mới</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-900 mb-1">
                Chọn file CSV
              </label>
              <input 
                type="file" 
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-brand-900 border border-brand-200 rounded-lg cursor-pointer bg-brand-50 focus:outline-none p-2"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="immediateSync"
                checked={isImmediate}
                onChange={(e) => setIsImmediate(e.target.checked)}
                className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500"
              />
              <label htmlFor="immediateSync" className="text-sm font-medium text-brand-900">
                Chạy đồng bộ ngay lập tức (Sync Now)
              </label>
            </div>
            <p className="text-xs text-brand-600">
              * Nếu không chọn, dữ liệu sẽ được lưu và tự động cập nhật vào ban đêm (Nightly Cron).
            </p>

            <button
              onClick={handleUploadAndSync}
              disabled={loading || !file}
              className={`rounded-xl px-4 py-3 font-semibold text-white transition mt-2 ${
                loading || !file ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'
              }`}
            >
              {loading ? uploadStatus : 'Upload & Tạo Job'}
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-brand-200 bg-white p-6 shadow-sm flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-brand-900">Lịch sử Đồng bộ</h2>
            <button 
              onClick={loadJobs}
              className="text-sm font-semibold text-brand-600 hover:text-brand-900"
            >
              Làm mới
            </button>
          </div>
          
          <div className="flex-1 overflow-auto rounded-xl border border-brand-100">
            <table className="min-w-full text-left text-sm text-brand-900">
              <thead className="sticky top-0 bg-brand-50 text-xs uppercase text-brand-700">
                <tr>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Loại</th>
                  <th className="px-4 py-3">Tạo lúc</th>
                  <th className="px-4 py-3">Hoàn thành</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100 bg-white">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-brand-50/50">
                    <td className="px-4 py-3 font-medium">
                      <span className={`px-2 py-1 rounded text-xs ${
                        job.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        job.status === 'Failed' ? 'bg-red-100 text-red-700' :
                        job.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {job.is_immediate ? 'Tức thời' : 'Cron (Night)'}
                    </td>
                    <td className="px-4 py-3">{new Date(job.created_at).toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-3 text-brand-500">
                      {job.finished_at ? new Date(job.finished_at).toLocaleString('vi-VN') : '-'}
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-brand-500">
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
