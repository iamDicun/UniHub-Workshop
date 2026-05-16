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
      title="Hồ sơ Tài khoản"
      subtitle="Thông tin cơ bản và thao tác đăng xuất."
      actions={
        <button
          type="button"
          onClick={() => navigate(getHomeForRole(user.role))}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-hover hover:text-primary"
        >
          Về bảng điều khiển
        </button>
      }
    >
      <section className="rounded-xl border border-border bg-surface p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold text-primary">Thông tin tài khoản</h2>
        <div className="mt-4 grid gap-2 text-sm text-text-secondary">
          <p>
            <span className="font-medium text-primary">Tên:</span> {user.name}
          </p>
          <p>
            <span className="font-medium text-primary">Email:</span> {user.email}
          </p>
          <p>
            <span className="font-medium text-primary">Vai trò:</span> {user.role}
          </p>
          {user.student_code ? (
            <p>
              <span className="font-medium text-primary">Mã SV:</span> {user.student_code}
            </p>
          ) : null}
        </div>
        <div className="mt-6">
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-error/20 px-4 py-2 text-sm font-medium text-error transition-colors hover:bg-error-container"
          >
            Đăng xuất
          </button>
        </div>
      </section>
    </PageShell>
  );
};

export default Profile;
