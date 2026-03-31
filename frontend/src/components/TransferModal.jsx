import React, { useState } from 'react';
import { X, Send, User } from 'lucide-react';
import API from '../api';

const TransferModal = ({ isOpen, onClose, onTransferSuccess }) => {
  const [formData, setFormData] = useState({ recipientEmail: '', amount: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await API.post('/transactions/transfer', formData);
      alert("Transfer Successful!");
      onTransferSuccess(); // Refresh balance
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Transfer failed. Check balance or recipient.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Send size={20} className="text-blue-400" /> Send Money
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-xs uppercase mb-1 ml-1">Recipient Email</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-500" size={18} />
              <input 
                type="email"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="receiver@example.com"
                onChange={(e) => setFormData({...formData, recipientEmail: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs uppercase mb-1 ml-1">Amount (₹)</label>
            <input 
              type="number"
              required
              min="1"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-lg font-semibold outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="0.00"
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg shadow-blue-500/20 
              ${loading ? 'bg-blue-800 opacity-70' : 'bg-blue-600 hover:bg-blue-500'}`}
          >
            {loading ? 'Processing...' : 'Confirm Transfer'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;