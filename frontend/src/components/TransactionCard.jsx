import React from 'react';
import { 
  Send, 
  ReceiptText, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Zap, 
  Smartphone, 
  Wifi, 
  Tv, 
  Flame, 
  Droplets,
  PlusCircle
} from 'lucide-react';

const TransactionCard = ({ transaction, currentUserId }) => {
  // Check if current user is the sender
  const isSender = transaction.sender?._id === currentUserId || transaction.sender === currentUserId;
  
  // A "Credit" happens if:
  // 1. It's a deposit (Add Money)
  // 2. You are the receiver of a transfer
  const isCredit = transaction.type === 'deposit' || (!isSender && transaction.type === 'transfer');

  // Icons logic
  const getIcon = () => {
    if (transaction.type === 'deposit') return <PlusCircle size={18} />;
    
    if (transaction.type === 'bill_pay') {
      const provider = transaction.metadata?.serviceProvider?.toLowerCase() || '';
      if (provider.includes('elect')) return <Zap size={18} />;
      if (provider.includes('mobile')) return <Smartphone size={18} />;
      if (provider.includes('wifi')) return <Wifi size={18} />;
      if (provider.includes('dth')) return <Tv size={18} />;
      if (provider.includes('gas')) return <Flame size={18} />;
      if (provider.includes('water')) return <Droplets size={18} />;
      return <ReceiptText size={18} />;
    }
    
    return isSender ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />;
  };

  // Icon Background and Text Color
  const getThemeColor = () => {
    if (transaction.status === 'failed') return 'text-red-500 bg-red-500/10';
    return isCredit ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10';
  };

  // Amount Text Color Logic
  const getAmountColor = () => {
    if (transaction.status === 'failed') return 'text-slate-500 line-through';
    return isCredit ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-2xl transition-all group">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl transition-colors ${getThemeColor()}`}>
          {getIcon()}
        </div>
        <div>
          <h4 className="font-bold text-white text-sm">
            {transaction.type === 'deposit' 
              ? 'Money Added to Wallet'
              : transaction.type === 'bill_pay' 
                ? transaction.metadata?.serviceProvider 
                : isSender 
                  ? `Sent to ${transaction.receiver?.firstName || 'User'}` 
                  : `Received from ${transaction.sender?.firstName || 'User'}`
            }
          </h4>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">
            {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className={`font-bold text-sm ${getAmountColor()}`}>
          {isCredit ? '+' : '-'} ₹{transaction.amount.toLocaleString('en-IN')}
        </p>
        <div className="flex items-center justify-end gap-1.5 mt-1">
          <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 text-slate-500 font-bold uppercase tracking-wider">
            {transaction.type.replace('_', ' ')}
          </span>
          {transaction.status === 'failed' && (
             <span className="text-[8px] text-red-500 font-bold uppercase">Failed</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;