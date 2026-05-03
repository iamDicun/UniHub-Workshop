import React, { useState, useEffect } from 'react';
import { getFailedJobs, retryFailedJob } from '../api/client';

export default function AdminFailedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await getFailedJobs();
      setJobs(res.data);
    } catch (error) {
      console.error('Lỗi khi tải DLQ:', error);
      alert('Không thể tải danh sách Failed Jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleRetry = async (jobId) => {
    try {
      setActionLoading(jobId);
      await retryFailedJob(jobId);
      alert('Đã đưa vào hàng đợi để thử lại thành công!');
      fetchJobs(); // Refresh danh sách
    } catch (error) {
      alert('Thử lại thất bại!');
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải danh sách lỗi...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Dead Letter Queue (Email Lỗi)</h1>
        <button 
          onClick={fetchJobs}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Làm mới
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lỗi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dữ liệu</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobs.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Không có job nào bị lỗi.</td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className={job.status === 'retried' ? 'bg-green-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{job.id}</td>
                  <td className="px-6 py-4 text-sm text-red-600 font-medium max-w-xs truncate" title={job.error_message}>
                    {job.error_message}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={JSON.stringify(job.payload)}>
                    {JSON.stringify(job.payload.data)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(job.failed_at).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${job.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {job.status === 'failed' ? 'Thất bại' : 'Đã Retry'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {job.status === 'failed' && (
                      <button
                        onClick={() => handleRetry(job.id)}
                        disabled={actionLoading === job.id}
                        className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 font-semibold"
                      >
                        {actionLoading === job.id ? 'Đang gửi...' : 'Thử lại (Retry)'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
