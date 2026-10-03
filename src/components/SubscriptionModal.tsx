import { Crown, X, Check, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { SubscriptionTier } from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: SubscriptionTier;
  reason?: string;
}

export function SubscriptionModal({ isOpen, onClose, reason }: SubscriptionModalProps) {
  const { subscription, isVip, user } = useAuth();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <section role="dialog" aria-modal="true" aria-labelledby="subscription-title" className="w-full max-w-lg space-y-6 rounded-3xl border border-stone-800 bg-[#121319] p-6 text-zinc-100">
        <div className="flex items-center justify-between">
          <h2 id="subscription-title" className="flex items-center gap-2 font-serif text-xl font-bold"><Crown className="text-amber-400" /> F15 VIP</h2>
          <button aria-label="Tutup informasi VIP" onClick={onClose} className="rounded-lg p-2 hover:bg-stone-800"><X size={20} /></button>
        </div>
        {reason && <p className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-3 text-sm text-amber-200">{reason}</p>}
        {isVip ? (
          <p role="status" className="rounded-xl bg-emerald-950/40 p-4 text-sm text-emerald-200">
            VIP aktif hingga {new Date(subscription.expiresAt!).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.
          </p>
        ) : (
          <p role="status" className="rounded-xl border border-stone-700 bg-stone-900 p-4 text-sm leading-relaxed text-zinc-300">
            Pembayaran VIP belum tersedia. Tidak ada tagihan atau transfer yang perlu dilakukan. Aktivasi VIP akan tersedia setelah layanan pembayaran resmi terhubung.
            {!user && ' Masuk untuk melihat status langganan akun Anda.'}
          </p>
        )}
        <ul className="space-y-3 text-sm text-zinc-300">
          {['Akses seluruh bab buku premium', 'Unggah buku pribadi tanpa batas kuota jumlah buku', 'Sinkronisasi koleksi dan anotasi'].map(benefit => (
            <li key={benefit} className="flex items-center gap-2"><Check size={16} className="shrink-0 text-amber-400" />{benefit}</li>
          ))}
        </ul>
        <p className="flex items-center gap-2 text-xs text-zinc-400"><ShieldCheck size={16} />Status VIP mengikuti verifikasi akun.</p>
        <button onClick={onClose} className="w-full rounded-xl bg-orange-600 py-3 text-sm font-semibold hover:bg-orange-500">Kembali Membaca</button>
      </section>
    </div>
  );
}
