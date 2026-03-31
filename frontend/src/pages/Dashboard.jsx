import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Wallet, LogOut, CreditCard, Plus, Send, 
  Camera, Zap, Wifi, Flame, Droplets, ChevronRight,
  Smartphone, Tv, ReceiptText, ShieldCheck, Mail, Phone, Hash, Edit2, Check, X,
  Eye, EyeOff, Menu
} from 'lucide-react';
import TransferModal from '../components/TransferModal';
import QRScanner from '../components/QRScanner';
import BillPaymentModal from '../components/BillPaymentModal';
import TransactionCard from '../components/TransactionCard';
import AddMoneyModal from '../components/AddMoneyModal'; 
import API from '../api';

const Dashboard = () => {
  const { user, logout, checkUser } = useAuth();
  
  // Navigation & UI State
  const [currentView, setCurrentView] = useState('overview'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modal & Interaction States
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false); 
  const [selectedBill, setSelectedBill] = useState(null);
  const [scannedPhone, setScannedPhone] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [showCardDetails, setShowCardDetails] = useState(false);

  // Profile Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '', lastName: '', phoneNumber: '', email: '' 
  });

  useEffect(() => {
    if (user) {
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        email: user.email || '' 
      });
    }
  }, [user]);

  const refreshData = useCallback(async () => {
    try {
      await checkUser(); 
      const { data } = await API.get('/transactions/history');
      setTransactions(data);
    } catch (err) {
      console.error("Failed to refresh dashboard data", err);
    }
  }, [checkUser]);

  useEffect(() => {
    refreshData();
  }, [currentView, refreshData]);

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      await API.put('/auth/update-profile', editForm);
      await refreshData(); 
      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const billServices = [
    { icon: <Zap size={22} />, label: 'Electricity', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { icon: <Smartphone size={22} />, label: 'Mobile', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { icon: <Wifi size={22} />, label: 'WiFi', color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { icon: <Tv size={22} />, label: 'DTH', color: 'text-pink-400', bg: 'bg-pink-400/10' },
    { icon: <Flame size={22} />, label: 'Gas', color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { icon: <Droplets size={22} />, label: 'Water', color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  ];

  const NavItems = [
    { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Overview' }, 
    { id: 'accounts', icon: <Wallet size={20} />, label: 'Accounts' }, 
    { id: 'cards', icon: <CreditCard size={20} />, label: 'Cards' }, 
    { id: 'history', icon: <ReceiptText size={20} />, label: 'History' }
  ];

  const renderAccountView = () => (
    <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between p-6 md:p-8 bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[2.5rem] backdrop-blur-md gap-6">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
          <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-2xl md:text-3xl font-bold text-white uppercase shadow-xl">
            {user?.firstName?.charAt(0)}
          </div>
          <div className="space-y-1">
            {isEditing ? (
              <div className="flex flex-col md:flex-row gap-2">
                <input className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white outline-none w-full md:w-32" value={editForm.firstName} onChange={(e) => setEditForm({...editForm, firstName: e.target.value})} />
                <input className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white outline-none w-full md:w-32" value={editForm.lastName} onChange={(e) => setEditForm({...editForm, lastName: e.target.value})} />
              </div>
            ) : (
              <h3 className="text-2xl md:text-3xl font-bold text-white">{user?.firstName} {user?.lastName}</h3>
            )}
            <p className="text-slate-400 flex items-center justify-center md:justify-start gap-2 text-sm">
              <ShieldCheck size={16} className="text-blue-400" /> Verified Elite Member
            </p>
          </div>
        </div>
        <button onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)} className={`w-full md:w-auto px-6 py-3 rounded-2xl font-bold flex justify-center items-center gap-2 ${isEditing ? 'bg-green-600 text-white' : 'bg-white/5 text-blue-400 border border-white/10'}`}>
          {isUpdating ? "Saving..." : isEditing ? <><Check size={20}/> Save</> : <><Edit2 size={20}/> Edit</>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="p-6 bg-white/[0.02] border border-white/10 rounded-[2rem] space-y-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Banking</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm md:text-base">
              <span className="text-slate-400 flex items-center gap-2"><Hash size={16}/> Account</span>
              <span className="text-white font-mono font-bold">{user?.accountNumber}</span>
            </div>
            <div className="flex justify-between items-center text-sm md:text-base">
              <span className="text-slate-400 flex items-center gap-2"><Wallet size={16}/> IFSC</span>
              <span className="text-blue-400 font-mono font-bold text-xs md:text-base">NOVA000402</span>
            </div>
          </div>
        </div>
        <div className="p-6 bg-white/[0.02] border border-white/10 rounded-[2rem] space-y-4">
          <div className="flex justify-between items-center">
             <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contact</h4>
             {isEditing && <button onClick={() => setIsEditing(false)} className="text-red-400"><X size={18}/></button>}
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm md:text-base">
              <span className="text-slate-400 flex items-center gap-2"><Mail size={16}/> Email</span>
              {isEditing ? <input className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-right w-1/2 outline-none" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} /> : <span className="text-white truncate max-w-[150px]">{user?.email}</span>}
            </div>
            <div className="flex justify-between items-center text-sm md:text-base">
              <span className="text-slate-400 flex items-center gap-2"><Phone size={16}/> Phone</span>
              {isEditing ? <input className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-right w-1/2 outline-none" value={editForm.phoneNumber} onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})} /> : <span className="text-white">+91 {user?.phoneNumber}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCardsView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-xl md:text-2xl font-bold text-white">Virtual Cards</h3>
        <button onClick={() => setShowCardDetails(!showCardDetails)} className="flex items-center gap-2 text-xs font-bold text-blue-400 bg-blue-400/10 px-3 py-2 rounded-xl">
          {showCardDetails ? <><EyeOff size={14}/> Hide</> : <><Eye size={14}/> Show</>}
        </button>
      </div>
      <div className="relative w-full max-w-sm aspect-[1.586/1] rounded-[2rem] p-6 md:p-8 overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/20 backdrop-blur-2xl shadow-2xl mx-auto md:mx-0">
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-blue-200 font-bold">Nova Platinum</p>
            <h4 className="italic font-black text-xl md:text-2xl text-white/40">VISA</h4>
          </div>
          <p className="text-lg md:text-2xl font-mono tracking-[0.15em] md:tracking-[0.2em] text-white whitespace-nowrap">
            {showCardDetails ? `4532 8901 ${user?.accountNumber?.toString().slice(0, 4)} ${user?.phoneNumber?.slice(-4)}` : `**** **** **** ${user?.phoneNumber?.slice(-4)}`}
          </p>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[8px] md:text-[10px] uppercase text-slate-400">Card Holder</p>
              <p className="font-bold text-xs md:text-sm uppercase">{user?.firstName} {user?.lastName}</p>
            </div>
            <p className="font-bold text-xs md:text-sm">12/29</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-200">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-slate-950 sticky top-0 z-50">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Nova Bank</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-white/5 rounded-lg text-blue-400">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar - Desktop & Mobile */}
      <aside className={`fixed md:sticky top-0 left-0 z-40 w-64 h-screen transition-transform bg-slate-950 md:bg-white/5 border-r border-white/10 backdrop-blur-xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="hidden md:block p-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent cursor-pointer" onClick={() => setCurrentView('overview')}>Nova Bank</h1>
        </div>
        <nav className="flex-1 px-4 py-20 md:py-0 space-y-1">
          {NavItems.map((item) => (
            <button key={item.id} onClick={() => { setCurrentView(item.id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
              {item.icon} <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl">
            <LogOut size={20} /> <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 w-full max-w-full overflow-x-hidden">
        <header className="flex justify-between items-center mb-6 md:mb-10">
          <div className="hidden md:block">
            <h2 className="text-3xl font-bold text-white">Hello, {user?.firstName}!</h2>
            <p className="text-slate-400 mt-1">Managing your wealth made simple.</p>
          </div>
          <div className="flex md:hidden">
             <h2 className="text-xl font-bold text-white truncate">Hi, {user?.firstName}</h2>
          </div>
          <div className="flex gap-2 md:gap-4">
             <button onClick={() => setIsScannerOpen(true)} className="p-2 md:p-3 bg-white/5 border border-white/10 rounded-xl text-blue-400"><Camera size={20} /></button>
             <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-600/20 border border-blue-500/50 flex items-center justify-center text-blue-400 font-bold uppercase">{user?.firstName?.charAt(0)}</div>
          </div>
        </header>

        {currentView === 'overview' && (
          <div className="animate-in fade-in duration-700 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Balance Card */}
              <div className="p-6 md:p-8 rounded-[2rem] bg-gradient-to-br from-blue-600 to-blue-800 shadow-2xl relative overflow-hidden group">
                <p className="text-blue-100/70 text-xs font-bold uppercase tracking-widest mb-2">Balance</p>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 md:mb-8">₹{user?.balance?.toLocaleString('en-IN')}</h3>
                <div className="flex gap-3">
                  <button onClick={() => setIsTransferModalOpen(true)} className="flex-1 flex items-center justify-center gap-2 bg-white text-blue-700 py-3 rounded-xl text-xs md:text-sm font-bold shadow-lg"><Send size={16} /> Send</button>
                  <button onClick={() => setIsAddMoneyModalOpen(true)} className="flex-1 flex items-center justify-center gap-2 bg-blue-500/20 border border-white/30 text-white py-3 rounded-xl text-xs md:text-sm font-bold"><Plus size={16} /> Add</button>
                </div>
              </div>

              <div className="lg:col-span-2 grid grid-cols-2 gap-4 md:gap-6">
                <button onClick={() => setIsTransferModalOpen(true)} className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all group">
                  <Send size={28} className="text-blue-400 mb-2 md:mb-4 group-hover:scale-110" />
                  <span className="font-bold text-xs md:text-base">Pay</span>
                </button>
                <button onClick={() => setIsScannerOpen(true)} className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all group">
                  <Camera size={28} className="text-green-400 mb-2 md:mb-4 group-hover:scale-110" />
                  <span className="font-bold text-xs md:text-base">Scan</span>
                </button>
              </div>
            </div>

            {/* Bill Services Grid - Responsive 3 cols on mobile, 6 on desktop */}
            <section className="p-6 md:p-8 rounded-[2rem] bg-white/[0.03] border border-white/10">
              <h3 className="text-lg md:text-xl font-bold text-white mb-6">Bills</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
                {billServices.map((service, idx) => (
                  <button key={idx} onClick={() => { setSelectedBill(service); setIsBillModalOpen(true); }} className="flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-xl md:rounded-2xl ${service.bg} ${service.color} border border-transparent hover:border-white/10`}>
                      {service.icon}
                    </div>
                    <span className="text-[10px] md:text-xs font-semibold text-slate-400">{service.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
                <h3 className="text-lg md:text-xl font-bold text-white">Recent Activity</h3>
                <div className="grid gap-3">
                    {transactions.slice(0, 4).map(tx => (
                        <TransactionCard key={tx._id} transaction={tx} currentUserId={user?._id} />
                    ))}
                </div>
            </section>
          </div>
        )}

        {currentView === 'accounts' && renderAccountView()}
        {currentView === 'cards' && renderCardsView()}
        {currentView === 'history' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h3 className="text-xl md:text-2xl font-bold text-white">Transaction History</h3>
            <div className="grid gap-3 md:gap-4">
              {transactions.length > 0 ? transactions.map((tx) => <TransactionCard key={tx._id} transaction={tx} currentUserId={user?._id} />) 
              : <div className="p-12 text-center bg-white/[0.02] border border-white/5 rounded-[2rem] text-slate-500">No transactions.</div>}
            </div>
          </div>
        )}

        {/* MODAL CONTROLS */}
        {isScannerOpen && <QRScanner onScanSuccess={(phone) => {setScannedPhone(phone); setIsScannerOpen(false); setIsTransferModalOpen(true);}} onClose={() => setIsScannerOpen(false)} />}
        {isTransferModalOpen && <TransferModal isOpen={isTransferModalOpen} defaultPhone={scannedPhone} onClose={() => { setIsTransferModalOpen(false); setScannedPhone(''); }} onTransferSuccess={refreshData} />}
        {isAddMoneyModalOpen && <AddMoneyModal isOpen={isAddMoneyModalOpen} onClose={() => setIsAddMoneyModalOpen(false)} onSuccess={refreshData} />}
        {isBillModalOpen && <BillPaymentModal isOpen={isBillModalOpen} service={selectedBill} onClose={() => { setIsBillModalOpen(false); setSelectedBill(null); }} onPaymentSuccess={refreshData} />}
      </main>
    </div>
  );
};

export default Dashboard;