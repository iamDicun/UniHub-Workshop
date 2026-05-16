import React from 'react';
import Sidebar from './Sidebar';

const PageShell = ({ title, subtitle, actions, children }) => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="ml-56 flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface/80 px-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-lg font-semibold tracking-tight text-primary">
              {title}
            </h1>
            {subtitle ? (
              <span className="hidden text-sm text-text-secondary md:inline">
                {subtitle}
              </span>
            ) : null}
          </div>
          {actions ? (
            <div className="flex items-center gap-2">{actions}</div>
          ) : null}
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default PageShell;
