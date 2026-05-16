import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const QrGenerator = () => {
  const [qrValue, setQrValue] = useState('sv123_ws1');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-modal">
        <h1 className="mb-2 text-center font-display text-xl font-semibold text-primary">
          Công Cụ Tạo QR Check-in
        </h1>
        <p className="mb-6 text-center text-sm text-text-secondary">
          Dùng để tạo nhanh mã QR cho điện thoại quét thử nghiệm.
        </p>

        <div className="mb-6 flex flex-col gap-1.5">
          <label className="text-sm font-medium text-primary">
            Nội dung mã QR (ID sinh viên, mã vé...)
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/10 transition-colors duration-150"
            value={qrValue}
            onChange={(e) => setQrValue(e.target.value)}
            placeholder="Nhập nội dung mã QR"
          />
        </div>

        <div className="flex flex-col items-center justify-center rounded-lg bg-background p-6">
          {qrValue ? (
            <div className="rounded-lg border border-border bg-surface p-4">
              <QRCodeCanvas value={qrValue} size={250} level="H" />
            </div>
          ) : (
            <div className="flex h-[250px] w-[250px] items-center justify-center rounded-lg border border-dashed border-border bg-surface">
              <span className="text-sm text-text-secondary">Chưa có nội dung</span>
            </div>
          )}
          <p className="mt-4 break-all text-center font-mono text-xs text-text-secondary">
            {qrValue || '---'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QrGenerator;
