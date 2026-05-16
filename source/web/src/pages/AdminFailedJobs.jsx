import React, { useState, useEffect } from 'react';
import PageShell from '../components/PageShell';
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
      fetchJobs();
    } catch (error) {
      alert('Thử lại thất bại!');
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <PageShell
      title="System Status"
      subtitle="Quản lý Dead Letter Queue và theo dõi lỗi hệ thống."
      actions={
        <button
          onClick={fetchJobs}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-hover hover:text-primary"
        >
          Làm mới
        </button>
      }
    >
      {loading ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-sm text-text-secondary text-center shadow-soft">
          Đang tải danh sách lỗi...
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-soft">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-background">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Lỗi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Dữ liệu</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Thời gian</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Trạng thái</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-sm text-text-secondary">Không có job nào bị lỗi.</td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className={job.status === 'retried' ? 'bg-success/5' : 'hover:bg-hover transition-colors'}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-primary font-medium">#{job.id}</td>
                    <td className="px-4 py-3 text-sm text-error font-medium max-w-xs truncate" title={job.error_message}>
                      {job.error_message}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary max-w-xs truncate" title={JSON.stringify(job.payload)}>
                      {JSON.stringify(job.payload.data)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">
                      {new Date(job.failed_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-medium ${job.status === 'failed' ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>
                        {job.status === 'failed' ? 'Thất bại' : 'Đã Retry'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      {job.status === 'failed' && (
                        <button
                          onClick={() => handleRetry(job.id)}
                          disabled={actionLoading === job.id}
                          className="text-accent transition-colors hover:text-primary disabled:opacity-50"
                        >
                          {actionLoading === job.id ? 'Đang gửi...' : 'Thử lại'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
