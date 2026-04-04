import React, { useState } from 'react';
import { X, ChevronRight, ShieldCheck } from 'lucide-react';
import API from '../api';

const BillPaymentModal = ({ isOpen, onClose, service, onPaymentSuccess }) => {
  const [consumerNumber, setConsumerNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !service) return null;

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await API.post('/payments/pay-bill', {
        serviceProvider: service.label,
        consumerNumber,
        amount: Number(amount),
        category: service.label 
      });

      if (response.status === 200 || response.data.success) {
        // Update global state (balance) before closing
        if (onPaymentSuccess) await onPaymentSuccess(); 
        
        alert(`${service.label} Payment Successful!`);
        setConsumerNumber('');
        setAmount('');
        onClose();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Payment Failed. Check balance.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${service.bg} ${service.color}`}>{service.icon}</div>
            <h3 className="font-bold text-white">{service.label} Payment</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400"><X size={20}/></button>
        </div>

        <form onSubmit={handlePayment} className="p-8 space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Consumer Number / ID</label>
            <input 
              type="text" required placeholder={`Enter ${service.label} ID`}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none transition-all"
              value={consumerNumber}
              onChange={(e) => setConsumerNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Amount (₹)</label>
            <input 
              type="number" required min="1" placeholder="0.00"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-2xl font-bold focus:border-blue-500 outline-none"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 text-green-500 bg-green-500/10 p-3 rounded-xl text-xs font-medium border border-green-500/20">
            <ShieldCheck size={16} /> Secure BBPS Verified Payment
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? "Processing..." : <>Pay {service.label} Bill <ChevronRight size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BillPaymentModal;