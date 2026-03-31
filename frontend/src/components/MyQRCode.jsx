import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { Download, Share2 } from 'lucide-react';

const MyQRCode = () => {
  const { user } = useAuth();

  // The value inside the QR follows a custom protocol for Nova Bank
  const qrValue = `novabank://pay?phone=${user?.phone}&name=${user?.firstName}`;

  return (
    <div className="flex flex-col items-center p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
      <div className="bg-white p-4 rounded-2xl mb-6 shadow-xl shadow-blue-500/10">
        <QRCodeSVG 
          value={qrValue} 
          size={200}
          bgColor={"#ffffff"}
          fgColor={"#0f172a"} // Slate-900 for high contrast
          level={"H"} // High error correction
          includeMargin={false}
        />
      </div>

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white">{user?.firstName} {user?.lastName}</h3>
        <p className="text-slate-400 font-mono text-sm">{user?.phone}</p>
      </div>

      <div className="flex gap-4 w-full">
        <button className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 py-3 rounded-xl transition-all border border-white/10">
          <Download size={18} />
          <span className="text-sm font-semibold">Save Image</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20">
          <Share2 size={18} />
          <span className="text-sm font-semibold">Share QR</span>
        </button>
      </div>
    </div>
  );
};

export default MyQRCode;