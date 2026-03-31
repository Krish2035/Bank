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
      // API call to process the bill payment
      const response = await API.post('/payments/pay-bill', {
        serviceProvider: service.label,
        consumerNumber,
        amount: Number(amount),
        category: service.label 
      });

      // Check if the backend returned success
      if (response.status === 200 || response.data.success) {
        // IMPORTANT: Call this first to trigger the Dashboard/AuthContext refresh
        // This ensures the balance and history update instantly in the UI
        await onPaymentSuccess(); 
        
        alert(`${service.label} Payment Successful!`);
        
        // Reset local form state
        setConsumerNumber('');
        setAmount('');
        
        // Close the modal
        onClose();
      }
    } catch (err) {
      console.error("Payment Error:", err);
      // Displays the specific error from the backend (e.g., "Insufficient balance")
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Payment Failed";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${service.bg} ${service.color}`}>
              {service.icon}
            </div>
            <h3 className="font-bold text-white">{service.label} Payment</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
          >
            <X size={20}/>
          </button>
        </div>

        <form onSubmit={handlePayment} className="p-8 space-y-6">
          {/* Consumer ID Field */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
              Consumer Number / ID
            </label>
            <input 
              type="text"
              required
              placeholder={`Enter your ${service.label} ID`}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
              value={consumerNumber}
              onChange={(e) => setConsumerNumber(e.target.value)}
            />
          </div>

          {/* Amount Field */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
              Amount (₹)
            </label>
            <input 
              type="number"
              required
              min="1"
              placeholder="0.00"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-2xl font-bold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Verification Badge */}
          <div className="flex items-center gap-2 text-green-500 bg-green-500/10 p-3 rounded-xl text-xs font-medium border border-green-500/20">
            <ShieldCheck size={16} /> Secure BBPS Verified Payment
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <>
                Pay {service.label} Bill
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BillPaymentModal;