import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const QrGenerator = () => {
  const [qrValue, setQrValue] = useState('sv123_ws1'); // Giá trị mặc định

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-center text-2xl font-bold text-slate-800">
          Công Cụ Tạo QR Check-in
        </h1>
        <p className="mb-6 text-center text-sm text-slate-500">
          Dùng để tạo nhanh mã QR cho điện thoại quét thử nghiệm.
        </p>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Nội dung mã QR (ID sinh viên, mã vé...)
          </label>
          <input
            type="text"
            className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={qrValue}
            onChange={(e) => setQrValue(e.target.value)}
            placeholder="Nhập nội dung mã QR"
          />
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl bg-indigo-50 p-6">
          {qrValue ? (
            <div className="rounded-xl border border-indigo-200 bg-white p-4 shadow-sm">
              <QRCodeCanvas value={qrValue} size={250} level="H" />
            </div>
          ) : (
            <div className="flex h-[250px] w-[250px] items-center justify-center rounded-xl border border-dashed border-indigo-300 bg-white">
              <span className="text-sm text-indigo-400">Chưa có nội dung</span>
            </div>
          )}
          <p className="mt-4 break-all text-center font-mono text-xs text-indigo-600">
            {qrValue || '---'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QrGenerator;
