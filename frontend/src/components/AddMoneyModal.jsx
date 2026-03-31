import React, { useState } from 'react';
import { X, Wallet, ArrowUpRight, ShieldCheck, Loader2 } from 'lucide-react';
import API from '../api';

const AddMoneyModal = ({ isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddMoney = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      return setError("Please enter a valid amount");
    }

    setLoading(true);
    setError('');

    try {
      // Note: Ensure your backend has a POST /transactions/add-money route
      // or whatever endpoint you use to increase user balance.
      await API.post('/transactions/add-money', { amount: parseFloat(amount) });
      
      onSuccess(); // Refresh dashboard data
      onClose();   // Close modal
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add money. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [500, 1000, 2000, 5000];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-blue-600/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <Wallet size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Add Money</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleAddMoney} className="p-8 space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Enter Amount</label>
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-blue-400">₹</span>
              <input
                autoFocus
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-6 text-2xl font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-700"
              />
            </div>
          </div>

          {/* Quick Select */}
          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(amt.toString())}
                className="py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all"
              >
                +{amt}
              </button>
            ))}
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20">
              {error}
            </p>
          )}

          {/* Security Note */}
          <div className="flex items-center gap-2 justify-center text-slate-500 text-xs">
            <ShieldCheck size={14} className="text-green-500" />
            <span>Secured via Nova Gateway 256-bit encryption</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Confirm Top-up <ArrowUpRight size={20} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMoneyModal;