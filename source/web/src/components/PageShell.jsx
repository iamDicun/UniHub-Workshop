import React from 'react';
import { Link } from 'react-router-dom';
import { getStoredUser, getHomeForRole, getRoleLabel } from '../utils/auth';

const PageShell = ({ title, subtitle, actions, children }) => {
  const user = getStoredUser();
  const roleLabel = user ? getRoleLabel(user.role) : 'Khách';
  const homeLink = user ? getHomeForRole(user.role) : '/login';

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="animate-rise flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-brand-200/70 bg-white/80 p-6 shadow-[0_24px_60px_-48px_rgba(15,76,92,0.5)] backdrop-blur">
          <div className="flex flex-col gap-2">
            <Link to={homeLink} className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">
              UniHub Workshop
            </Link>
            <div>
              <h1 className="font-display text-3xl font-semibold text-brand-900 md:text-4xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-2 text-sm text-brand-900/70 md:text-base">{subtitle}</p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
              {roleLabel}
            </span>
            <Link
              to="/profile"
              className="rounded-full border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:border-brand-500 hover:text-brand-900"
            >
              Hồ sơ
            </Link>
          </div>
        </header>

        {actions ? (
          <div className="flex flex-wrap items-center justify-between gap-3">{actions}</div>
        ) : null}

        <main className="grid gap-6">{children}</main>
      </div>
    </div>
  );
};

export default PageShell;
