import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Table, 
  Mail, 
  MessageSquare, 
  Check, 
  ExternalLink, 
  AlertTriangle, 
  Loader2 
} from 'lucide-react';
import { Book, Annotation } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  exportToGoogleDocs, 
  exportToGoogleSheets, 
  sendDigestViaGmail, 
  shareToGoogleChat,
  WorkspaceExportResult
} from '../lib/workspace';

interface WorkspaceExportModalProps {
  book: Book;
  specificAnnotation?: Annotation;
  onClose: () => void;
}

type ExportService = 'docs' | 'sheets' | 'gmail' | 'chat';

export const WorkspaceExportModal: React.FC<WorkspaceExportModalProps> = ({
  book,
  specificAnnotation,
  onClose
}) => {
  const { user, accessToken, signIn, annotations } = useAuth();

  const [selectedService, setSelectedService] = useState<ExportService>('docs');
  const [recipientEmail, setRecipientEmail] = useState<string>(user?.email || '');
  const [chatSpaceId, setChatSpaceId] = useState<string>('AAAA123456');

  // Confirmation dialog state (Mandatory per Workspace integration guidelines)
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [exportResult, setExportResult] = useState<WorkspaceExportResult | null>(null);

  const relevantAnnotations = specificAnnotation 
    ? [specificAnnotation]
    : annotations.filter(a => a.bookId === book.id);

  const getConfirmationDetails = () => {
    switch (selectedService) {
      case 'docs':
        return {
          title: 'Konfirmasi Pembuatan Google Docs',
          description: `Aplikasi akan membuat dokumen baru di Google Drive Anda berjudul "[F15 Library] Catatan Baca: ${book.title}" yang berisi ringkasan buku dan ${relevantAnnotations.length} anotasi/highlight Anda.`,
          resource: `Google Drive (${user?.email || 'Akun Anda'})`,
          actionType: 'Membuat dokumen baru'
        };
      case 'sheets':
        return {
          title: 'Konfirmasi Pembuatan Google Sheets',
          description: `Aplikasi akan membuat lembar spreadsheet baru di Google Drive berjudul "[F15 Library] Jurnal Bacaan - ${book.title}" dan menambahkan ${relevantAnnotations.length} baris riwayat kutipan.`,
          resource: `Google Drive (${user?.email || 'Akun Anda'})`,
          actionType: 'Membuat dan mengisi lembar kerja spreadsheet'
        };
      case 'gmail':
        return {
          title: 'Konfirmasi Pengiriman Email via Gmail',
          description: `Aplikasi akan mengirimkan email ringkasan bacaan digital dan catatan dari akun Gmail Anda ke alamat penerima ${recipientEmail}.`,
          resource: `Gmail (${recipientEmail})`,
          actionType: 'Mengirim email keluar (Gmail messages.send)'
        };
      case 'chat':
        return {
          title: 'Konfirmasi Pembagian ke Google Chat',
          description: `Aplikasi akan memposting kartu wawasan buku "${book.title}" ke Google Chat space "${chatSpaceId}". Anggota ruang obrolan dapat membaca kutipan tersebut.`,
          resource: `Google Chat Space (${chatSpaceId})`,
          actionType: 'Mengirim pesan obrolan ke grup ruang kerja'
        };
    }
  };

  const executeExport = async () => {
    if (!accessToken) {
      await signIn();
      return;
    }

    setIsProcessing(true);
    setExportResult(null);

    try {
      let res: WorkspaceExportResult;

      switch (selectedService) {
        case 'docs':
          res = await exportToGoogleDocs(book, relevantAnnotations, accessToken);
          break;
        case 'sheets':
          res = await exportToGoogleSheets(book, relevantAnnotations, accessToken);
          break;
        case 'gmail':
          res = await sendDigestViaGmail(recipientEmail || user?.email || '', book, relevantAnnotations, accessToken);
          break;
        case 'chat':
          res = await shareToGoogleChat(chatSpaceId, book, relevantAnnotations, accessToken);
          break;
      }

      setExportResult(res);
      setShowConfirmation(false);
    } catch (e: any) {
      setExportResult({
        success: false,
        message: e.message || 'Terjadi kesalahan saat memproses ekspor.'
      });
      setShowConfirmation(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmInfo = getConfirmationDetails();

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#15161c] border border-stone-700 rounded-2xl shadow-2xl p-6 text-zinc-100 space-y-5 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div>
            <h3 className="font-serif font-bold text-lg text-zinc-100">
              Integrasi Google Workspace
            </h3>
            <p className="text-xs text-zinc-400">
              Ekspor catatan buku <strong className="text-zinc-200">{book.title}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Workspace Account Status */}
        {!user || !accessToken ? (
          <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-500/30 space-y-2">
            <p className="text-xs text-orange-200">
              Diperlukan otorisasi Google Workspace untuk menyinkronkan data dengan Google Docs, Sheets, Gmail, dan Chat.
            </p>
            <button
              onClick={signIn}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm"
            >
              Hubungkan Akun Google Anda
            </button>
          </div>
        ) : null}

        {/* Results Banner */}
        {exportResult && (
          <div className={`p-4 rounded-xl text-xs space-y-2 border ${
            exportResult.success
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
          }`}>
            <div className="flex items-center gap-2 font-semibold">
              {exportResult.success ? <Check size={16} className="text-emerald-400" /> : <AlertTriangle size={16} className="text-rose-400" />}
              <span>{exportResult.message}</span>
            </div>
            {exportResult.details && (
              <p className="text-[11px] opacity-80">{exportResult.details}</p>
            )}
            {exportResult.url && (
              <a
                href={exportResult.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-orange-400 hover:underline font-medium pt-1"
              >
                <span>Buka Berkas di Google Drive</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        )}

        {/* Service Selector Grid */}
        {!showConfirmation && (
          <div className="space-y-4">
            <label className="text-xs font-semibold text-zinc-300 block">
              Pilih Layanan Google Workspace:
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedService('docs')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                  selectedService === 'docs'
                    ? 'bg-orange-600/10 border-orange-500 text-orange-400'
                    : 'bg-stone-900 border-stone-800 text-zinc-300 hover:bg-stone-800'
                }`}
              >
                <FileText size={20} className="text-blue-400" />
                <div>
                  <span className="text-xs font-bold block">Google Docs</span>
                  <span className="text-[10px] text-zinc-400">Dokumen ringkasan & anotasi</span>
                </div>
              </button>

              <button
                onClick={() => setSelectedService('sheets')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                  selectedService === 'sheets'
                    ? 'bg-orange-600/10 border-orange-500 text-orange-400'
                    : 'bg-stone-900 border-stone-800 text-zinc-300 hover:bg-stone-800'
                }`}
              >
                <Table size={20} className="text-emerald-400" />
                <div>
                  <span className="text-xs font-bold block">Google Sheets</span>
                  <span className="text-[10px] text-zinc-400">Tabel jurnal bacaan rapi</span>
                </div>
              </button>

              <button
                onClick={() => setSelectedService('gmail')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                  selectedService === 'gmail'
                    ? 'bg-orange-600/10 border-orange-500 text-orange-400'
                    : 'bg-stone-900 border-stone-800 text-zinc-300 hover:bg-stone-800'
                }`}
              >
                <Mail size={20} className="text-red-400" />
                <div>
                  <span className="text-xs font-bold block">Gmail</span>
                  <span className="text-[10px] text-zinc-400">Kirim intisari ke email</span>
                </div>
              </button>

              <button
                onClick={() => setSelectedService('chat')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                  selectedService === 'chat'
                    ? 'bg-orange-600/10 border-orange-500 text-orange-400'
                    : 'bg-stone-900 border-stone-800 text-zinc-300 hover:bg-stone-800'
                }`}
              >
                <MessageSquare size={20} className="text-teal-400" />
                <div>
                  <span className="text-xs font-bold block">Google Chat</span>
                  <span className="text-[10px] text-zinc-400">Bagikan ke ruang diskusi</span>
                </div>
              </button>
            </div>

            {/* Config inputs for Gmail or Chat */}
            {selectedService === 'gmail' && (
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-semibold text-zinc-400">
                  Email Tujuan:
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="nama@gmail.com"
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
                />
              </div>
            )}

            {selectedService === 'chat' && (
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-semibold text-zinc-400">
                  ID Space Google Chat:
                </label>
                <input
                  type="text"
                  value={chatSpaceId}
                  onChange={(e) => setChatSpaceId(e.target.value)}
                  placeholder="Contoh: spaces/AAAA123456 atau AAAA123456"
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
                />
              </div>
            )}

            {/* Advance to confirmation button */}
            <div className="pt-2">
              <button
                onClick={() => setShowConfirmation(true)}
                disabled={!accessToken}
                className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-md"
              >
                Lanjutkan Ekspor ke {selectedService === 'docs' ? 'Google Docs' : selectedService === 'sheets' ? 'Google Sheets' : selectedService === 'gmail' ? 'Gmail' : 'Google Chat'}
              </button>
            </div>
          </div>
        )}

        {/* MANDATORY CONFIRMATION DIALOG */}
        {showConfirmation && (
          <div className="p-5 rounded-2xl bg-[#191a24] border border-amber-500/40 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2.5 text-amber-400">
              <AlertTriangle size={20} />
              <h4 className="font-semibold text-sm text-zinc-100">
                {confirmInfo.title}
              </h4>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {confirmInfo.description}
            </p>

            <div className="p-3 rounded-lg bg-stone-900/90 text-[11px] text-zinc-400 space-y-1">
              <div>
                <strong className="text-zinc-300">Tindakan:</strong> {confirmInfo.actionType}
              </div>
              <div>
                <strong className="text-zinc-300">Target Sumber Daya:</strong> {confirmInfo.resource}
              </div>
              <div>
                <strong className="text-zinc-300">Catatan:</strong> Tindakan ini akan menulis data ke akun Google Workspace Anda dengan izin eksplisit.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-zinc-300 text-xs font-medium cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={executeExport}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Konfirmasi &amp; Ekspor</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
