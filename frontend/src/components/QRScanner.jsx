import React, { useState } from 'react';
import QrScanner from 'react-qr-scanner';
import { X, Camera, AlertCircle } from 'lucide-react';

const QRScanner = ({ onScanSuccess, onClose }) => {
  const [error, setError] = useState(null);

  const handleScan = (data) => {
    if (data && data.text) {
      try {
        // Expected Data Format: novabank://pay?phone=9100000000
        const rawText = data.text;
        
        let phone = '';

        // Robust parsing: Check if it's a URL or just a plain phone number
        if (rawText.includes('phone=')) {
          const urlParams = new URLSearchParams(rawText.split('?')[1]);
          phone = urlParams.get('phone');
        } else if (/^\d{10}$/.test(rawText)) {
          // If the QR is just a 10-digit number
          phone = rawText;
        }

        if (phone) {
          onScanSuccess(phone);
          // onClose is usually handled inside onScanSuccess in the Dashboard, 
          // but calling it here ensures the modal shuts immediately.
        } else {
          console.warn("Invalid QR Format scanned:", rawText);
        }
      } catch (err) {
        console.error("QR Parsing error:", err);
        setError("Invalid QR Code format.");
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
    setError("Camera access denied. Please check permissions.");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-lg p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-slate-900 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
        
        {/* Header */}
        <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Camera size={20} className="text-blue-400" /> Scan to Pay
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 bg-white/10 rounded-full text-white hover:bg-red-500/20 hover:text-red-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scanner Viewport */}
        <div className="aspect-square bg-black flex items-center justify-center relative overflow-hidden">
          <QrScanner
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            constraints={{
              video: { facingMode: 'environment' } // Ensures mobile uses back camera
            }}
          />
          
          {/* Scanner Overlay UI (Animated Scan Line) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-blue-500/30 rounded-3xl relative">
              {/* Corner Accents */}
              <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
              <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
              <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
              <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
              
              {/* Animated Scan Line */}
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent absolute top-0 animate-scan shadow-[0_0_15px_rgba(96,165,250,0.8)]"></div>
            </div>
          </div>
        </div>

        {/* Status Area */}
        <div className="p-8 bg-slate-900 border-t border-white/5">
          {error ? (
            <div className="flex items-center justify-center gap-2 text-red-400">
              <AlertCircle size={18} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-white font-medium mb-1">Scanning for Nova QR...</p>
              <p className="text-slate-500 text-xs tracking-wide uppercase">Align code within the frame</p>
            </div>
          )}
        </div>
      </div>

      {/* Global CSS for the Scan Animation */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          position: absolute;
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default QRScanner;