import React, { useState, useEffect } from 'react';
import { X, Send, User, Phone } from 'lucide-react';
import API from '../api';

const TransferModal = ({ isOpen, onClose, onTransferSuccess, defaultPhone }) => {
  const [transferMode, setTransferMode] = useState('phone'); // 'phone' or 'email'
  const [formData, setFormData] = useState({ 
    recipientEmail: '', 
    phone: '', 
    amount: '',
    description: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill phone if provided (e.g. from QR scanner)
  useEffect(() => {
    if (defaultPhone) {
      setFormData(prev => ({ ...prev, phone: defaultPhone }));
      setTransferMode('phone');
    }
  }, [defaultPhone]);

  if (!isOpen) return null;

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use the generic /transfer endpoint which handles both phone and email
      const payload = transferMode === 'phone' 
        ? { phone: formData.phone, amount: formData.amount, description: formData.description }
        : { recipientEmail: formData.recipientEmail, amount: formData.amount, description: formData.description };

      const { data } = await API.post('/transactions/transfer', payload);
      
      alert(data.message || "Transfer Successful!");
      if (onTransferSuccess) await onTransferSuccess(); 
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Transfer failed. Check balance or recipient.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><Send size={20} /></div>
              Send Money
            </h2>
            <p className="text-slate-500 text-xs mt-1 ml-11">Instant peer-to-peer transfer</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-white/5 p-1 rounded-2xl mb-8">
          <button 
            type="button"
            onClick={() => setTransferMode('phone')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${transferMode === 'phone' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Phone size={16} /> Phone
          </button>
          <button 
            type="button"
            onClick={() => setTransferMode('email')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${transferMode === 'email' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <User size={16} /> Email
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm text-center font-medium animate-in fade-in zoom-in duration-300">
            {error}
          </div>
        )}

        <form onSubmit={handleTransfer} className="space-y-6">
          <div>
            <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">
              {transferMode === 'phone' ? 'Recipient Phone' : 'Recipient Email'}
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                {transferMode === 'phone' ? <Phone size={18} /> : <User size={18} />}
              </div>
              <input 
                type={transferMode === 'phone' ? 'tel' : 'email'}
                required
                value={transferMode === 'phone' ? formData.phone : formData.recipientEmail}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-white/10 font-medium"
                placeholder={transferMode === 'phone' ? 'Enter Phone Number' : 'Enter Email Address'}
                onChange={(e) => setFormData({...formData, [transferMode === 'phone' ? 'phone' : 'recipientEmail']: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">Amount (₹)</label>
            <div className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-blue-400 group-focus-within:scale-110 transition-transform">₹</span>
                <input 
                type="number"
                required
                min="1"
                value={formData.amount}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-5 text-white text-3xl font-black outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="0.00"
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-black text-white transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-3
              ${loading ? 'bg-blue-800 opacity-70 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-600/40'}`}
          >
            {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
                <>Confirm & Send <Send size={20} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;