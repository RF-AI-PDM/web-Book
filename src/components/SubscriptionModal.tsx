import React, { useState } from 'react';
import { 
  Crown, 
  Check, 
  Sparkles, 
  X, 
  ShieldCheck, 
  Zap, 
  BookOpen, 
  UploadCloud, 
  Bot, 
  Share2, 
  QrCode, 
  CreditCard, 
  Wallet, 
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SubscriptionTier, PaymentMethodType } from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: SubscriptionTier;
  reason?: string;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  defaultPlan = 'vip_monthly',
  reason
}) => {
  const { subscription, isVip, upgradeSubscription, cancelSubscription } = useAuth();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>(
    subscription.tier !== 'free' ? subscription.tier : defaultPlan
  );
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('qris');
  const [paymentStep, setPaymentStep] = useState<'select' | 'pay' | 'success'>('select');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const plans = [
    {
      id: 'vip_monthly' as SubscriptionTier,
      name: 'VIP Bulanan',
      price: 'Rp 49.000',
      period: '/ bulan',
      billing: 'Ditagih setiap bulan, batalkan kapan saja',
      badge: 'Paling Fleksibel',
      popular: false
    },
    {
      id: 'vip_yearly' as SubscriptionTier,
      name: 'VIP Tahunan',
      price: 'Rp 399.000',
      period: '/ tahun',
      equivalent: 'Setara Rp 33.250 / bulan',
      billing: 'Hemat 32% dibanding paket bulanan',
      badge: 'Paling Hemat ⭐',
      popular: true
    }
  ];

  const benefits = [
    {
      icon: <BookOpen className="w-4 h-4 text-amber-400" />,
      title: 'Akses Penuh Semua Buku Katalog',
      desc: 'Baca seluruh bab buku premium tanpa terkunci paywall.'
    },
    {
      icon: <UploadCloud className="w-4 h-4 text-orange-400" />,
      title: 'Upload Buku Sendiri Tanpa Batas',
      desc: 'Impor file PDF, DOCX, dan EPUB koleksi pribadi sebanyak mungkin.'
    },
    {
      icon: <Bot className="w-4 h-4 text-sky-400" />,
      title: 'AI Mentor Gemini Tanpa Batas',
      desc: 'Diskusikan bab, minta analogi praktis, dan bedah konsep dengan AI kapan saja.'
    },
    {
      icon: <Share2 className="w-4 h-4 text-emerald-400" />,
      title: 'Ekspor ke Google Workspace',
      desc: 'Kirim rangkuman & anotasi langsung ke Google Docs, Sheets, dan Gmail.'
    },
    {
      icon: <Zap className="w-4 h-4 text-purple-400" />,
      title: 'Fitur Reader Premium & Offline',
      desc: 'Pengalaman membaca nyaman tanpa iklan dan dukungan multi-tema eksklusif.'
    }
  ];

  const paymentMethods = [
    { id: 'qris' as PaymentMethodType, name: 'QRIS', icon: <QrCode className="w-4 h-4 text-rose-400" />, desc: 'GoPay, OVO, Dana, ShopeePay, BCA' },
    { id: 'gopay' as PaymentMethodType, name: 'GoPay / GoPay Later', icon: <Wallet className="w-4 h-4 text-sky-400" />, desc: 'Instan via aplikasi Gojek' },
    { id: 'ovo' as PaymentMethodType, name: 'OVO', icon: <Wallet className="w-4 h-4 text-purple-400" />, desc: 'Konfirmasi via nomor ponsel' },
    { id: 'bca_va' as PaymentMethodType, name: 'BCA Virtual Account', icon: <CreditCard className="w-4 h-4 text-blue-400" />, desc: 'Transfer dari m-BCA / KlikBCA' },
    { id: 'mandiri_va' as PaymentMethodType, name: 'Mandiri Virtual Account', icon: <CreditCard className="w-4 h-4 text-amber-400" />, desc: 'Transfer dari Livin by Mandiri' },
    { id: 'bri_va' as PaymentMethodType, name: 'BRI Virtual Account (BRIVA)', icon: <CreditCard className="w-4 h-4 text-blue-500" />, desc: 'Transfer dari BRImo' }
  ];

  const handleStartPayment = () => {
    setPaymentStep('pay');
  };

  const handleConfirmSuccess = async () => {
    setIsProcessing(true);
    try {
      await upgradeSubscription(selectedPlan, selectedMethod);
      setPaymentStep('success');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setPaymentStep('select');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#121319] border border-stone-800 rounded-3xl shadow-2xl overflow-hidden text-zinc-100 max-h-[92vh] flex flex-col">
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-stone-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold font-serif text-white tracking-wide">
                  F15 VIP Premium
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Akses Tanpa Batas
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Tingkatkan wawasan setiap hari tanpa hambatan
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {reason && paymentStep === 'select' && (
            <div className="p-3.5 rounded-2xl bg-orange-950/40 border border-orange-800/60 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <div className="text-xs text-orange-200">
                <span className="font-semibold block text-orange-300">Fitur Membutuhkan VIP:</span>
                {reason}
              </div>
            </div>
          )}

          {/* Current VIP Status Banner if already VIP */}
          {isVip && paymentStep === 'select' && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-300">Status Langganan Anda Aktif!</h4>
                  <p className="text-[11px] text-zinc-400">
                    Paket: {subscription.tier === 'vip_yearly' ? 'VIP Tahunan' : 'VIP Bulanan'} · 
                    {subscription.expiresAt ? ` Aktif s.d ${new Date(subscription.expiresAt).toLocaleDateString('id-ID')}` : ' Akses Aktif'}
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  if (confirm('Yakin ingin membatalkan langganan VIP Anda?')) {
                    await cancelSubscription();
                  }
                }}
                className="px-3 py-1.5 bg-stone-900 hover:bg-rose-950 border border-stone-800 hover:border-rose-800 text-zinc-400 hover:text-rose-300 text-xs rounded-xl transition-colors cursor-pointer"
              >
                Batalkan Langganan
              </button>
            </div>
          )}

          {/* STEP 1: SELECT PLAN */}
          {paymentStep === 'select' && (
            <>
              {/* Plans Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {plans.map((plan) => {
                  const isSelected = selectedPlan === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-orange-950/20 border-orange-500 shadow-lg shadow-orange-500/10'
                          : 'bg-[#181920] border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      {plan.badge && (
                        <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500 text-black shadow-sm">
                          {plan.badge}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-sm text-zinc-200">{plan.name}</h3>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'bg-orange-500 border-orange-500 text-black' : 'border-stone-700'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        <div className="flex items-baseline space-x-1 my-1">
                          <span className="text-2xl font-extrabold text-white font-serif tracking-tight">
                            {plan.price}
                          </span>
                          <span className="text-xs text-zinc-400">{plan.period}</span>
                        </div>

                        {plan.equivalent && (
                          <div className="text-[11px] font-medium text-emerald-400 mb-1">
                            {plan.equivalent}
                          </div>
                        )}

                        <p className="text-xs text-zinc-400 mt-2">
                          {plan.billing}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Benefits Checklist */}
              <div className="bg-[#161720] border border-stone-800/80 rounded-2xl p-4.5 space-y-3">
                <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Keuntungan Eksklusif Member VIP
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {benefits.map((b, idx) => (
                    <div key={idx} className="flex items-start space-x-2.5">
                      <div className="mt-0.5 p-1 rounded-lg bg-stone-800/80 shrink-0">
                        {b.icon}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-zinc-200">{b.title}</div>
                        <div className="text-[11px] text-zinc-400 leading-relaxed">{b.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Pilih Metode Pembayaran
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {paymentMethods.map((m) => {
                    const isSelected = selectedMethod === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMethod(m.id)}
                        className={`p-3 rounded-xl border flex items-center space-x-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-stone-800 border-orange-500/80 text-white'
                            : 'bg-stone-900/60 border-stone-800 text-zinc-300 hover:border-stone-700'
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-stone-950 border border-stone-800 shrink-0">
                          {m.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold truncate">{m.name}</div>
                          <div className="text-[10px] text-zinc-400 truncate">{m.desc}</div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-orange-500 border-orange-500 text-black' : 'border-stone-700'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* STEP 2: SIMULATED PAYMENT INVOICE / QRIS */}
          {paymentStep === 'pay' && (
            <div className="space-y-6 text-center py-2 animate-fadeIn">
              <div className="max-w-md mx-auto bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800 text-xs text-zinc-400">
                  <span>Order ID: F15-VIP-{Date.now().toString().slice(-6)}</span>
                  <span className="flex items-center text-amber-400 gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" /> Selesaikan dalam 14:59
                  </span>
                </div>

                <div>
                  <div className="text-xs text-zinc-400 uppercase font-semibold">Total Pembayaran</div>
                  <div className="text-3xl font-extrabold text-white font-serif mt-1">
                    {selectedPlan === 'vip_yearly' ? 'Rp 399.000' : 'Rp 49.000'}
                  </div>
                  <div className="text-xs text-orange-400 mt-0.5">
                    Paket {selectedPlan === 'vip_yearly' ? 'VIP Tahunan (1 Tahun)' : 'VIP Bulanan (1 Bulan)'}
                  </div>
                </div>

                {/* QRIS / VA Display */}
                {selectedMethod === 'qris' ? (
                  <div className="p-4 bg-white rounded-2xl mx-auto w-56 shadow-md space-y-2">
                    <div className="text-[10px] font-bold text-zinc-900 tracking-wider">QRIS STANDAR NASIONAL</div>
                    {/* SVG QR Code Simulation */}
                    <div className="w-48 h-48 mx-auto bg-zinc-100 border-2 border-dashed border-zinc-300 rounded-xl flex flex-col items-center justify-center p-2 relative overflow-hidden">
                      <div className="grid grid-cols-6 gap-1 w-full h-full p-2 opacity-85">
                        {Array.from({ length: 36 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`rounded-xs ${
                              (i % 2 === 0 || i % 7 === 0 || i === 0 || i === 5 || i === 30) 
                                ? 'bg-zinc-900' 
                                : 'bg-transparent'
                            }`} 
                          />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="px-2 py-1 bg-orange-600 text-white rounded text-[10px] font-bold shadow">
                          F15 VIP
                        </div>
                      </div>
                    </div>
                    <div className="text-[9px] text-zinc-600">Scan dengan GoPay, OVO, Dana, BCA Mobile, dll</div>
                  </div>
                ) : (
                  <div className="p-5 bg-stone-950 border border-stone-800 rounded-2xl text-left space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Nomor Virtual Account:</span>
                      <span className="font-mono text-orange-400 font-bold text-sm tracking-wider">
                        88019 0812 {Math.floor(1000 + Math.random() * 9000)}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 leading-relaxed">
                      Lakukan transfer dari menu Virtual Account di m-Banking atau ATM Anda dengan nominal yang sesuai.
                    </div>
                  </div>
                )}

                <div className="text-[11px] text-zinc-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Transaksi simulasi instan untuk pengalaman membaca Anda.
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS CELEBRATION */}
          {paymentStep === 'success' && (
            <div className="text-center py-8 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/10">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-xl font-bold font-serif text-white">
                Selamat! Anda Sekarang Member F15 VIP 🎉
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                Akses penuh ke seluruh buku katalog, fitur unggah dokumen PDF/DOCX/EPUB tanpa batas, dan AI Mentor telah diaktifkan secara instan untuk akun Anda.
              </p>
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 inline-flex items-center gap-2 text-xs text-amber-300">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Status VIP Aktif hingga {subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '1 Bulan ke Depan'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-stone-800 bg-[#0e0f14] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[11px] text-zinc-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Garansi kepuasan membaca 100%</span>
          </div>

          <div className="flex items-center space-x-3">
            {paymentStep === 'select' && (
              <>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Nanti Saja
                </button>
                <button
                  onClick={handleStartPayment}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-orange-600/20 transition-all cursor-pointer"
                >
                  <span>Lanjutkan ke Pembayaran</span>
                  <ArrowRight size={14} />
                </button>
              </>
            )}

            {paymentStep === 'pay' && (
              <>
                <button
                  onClick={() => setPaymentStep('select')}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Ubah Paket
                </button>
                <button
                  onClick={handleConfirmSuccess}
                  disabled={isProcessing}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Memverifikasi...</span>
                  ) : (
                    <>
                      <span>Saya Sudah Bayar (Konfirmasi)</span>
                      <Check size={14} />
                    </>
                  )}
                </button>
              </>
            )}

            {paymentStep === 'success' && (
              <button
                onClick={handleClose}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-orange-600/20 transition-all cursor-pointer"
              >
                <span>Mulai Eksplorasi Buku VIP</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

