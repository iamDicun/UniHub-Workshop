import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { clearSession, getHomeForRole, getStoredUser } from '../utils/auth';

const Profile = () => {
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleLogout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <PageShell
      title="Hồ sơ tài khoản"
      subtitle="Thông tin cơ bản và thao tác đăng xuất."
      actions={
        <button
          type="button"
          onClick={() => navigate(getHomeForRole(user.role))}
          className="rounded-full border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:border-brand-500 hover:text-brand-900"
        >
          Về bảng điều khiển
        </button>
      }
    >
      <section className="rounded-3xl border border-brand-200/80 bg-white/80 p-6 shadow-[0_24px_60px_-48px_rgba(15,76,92,0.45)] backdrop-blur">
        <h2 className="font-display text-xl font-semibold text-brand-900">Thông tin tài khoản</h2>
        <div className="mt-4 grid gap-2 text-sm text-brand-900/70">
          <p>
            <span className="font-semibold text-brand-900">Tên:</span> {user.name}
          </p>
          <p>
            <span className="font-semibold text-brand-900">Email:</span> {user.email}
          </p>
          <p>
            <span className="font-semibold text-brand-900">Vai trò:</span> {user.role}
          </p>
          {user.student_code ? (
            <p>
              <span className="font-semibold text-brand-900">Mã SV:</span> {user.student_code}
            </p>
          ) : null}
        </div>
        <div className="mt-6">
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:border-red-300"
          >
            Đăng xuất
          </button>
        </div>
      </section>
    </PageShell>
  );
};

export default Profile;
