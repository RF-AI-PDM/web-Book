import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Minus, Sparkles, X, ZoomIn } from 'lucide-react';
import type { Book } from '../types';
import { buildBotDongTranslationRequest, normalizePdfSelection } from '../utils/pdfTranslationSelection';

interface PdfTranslationWorkspaceProps {
  book: Book;
  onClose: () => void;
}

interface TranslationResult {
  analysis: string;
  model: string;
}

export const PdfTranslationWorkspace: React.FC<PdfTranslationWorkspaceProps> = ({ book, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const pageHostRef = useRef<HTMLDivElement>(null);
  const translationRequestRef = useRef<AbortController | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [zoom, setZoom] = useState(1.15);
  const [isPdfLoading, setIsPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translation, setTranslation] = useState<TranslationResult | null>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);

  const captureSelection = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    // Keep PDF selections inside BotDong.read; the parent reader has its own annotation popover.
    event.stopPropagation();
    const selection = window.getSelection();
    const container = textLayerRef.current;
    if (!selection || !container || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const anchor = range.commonAncestorContainer;
    const sourceElement = anchor.nodeType === Node.ELEMENT_NODE ? anchor : anchor.parentElement;
    if (!sourceElement || !container.contains(sourceElement)) return;
    const normalized = normalizePdfSelection(selection.toString());
    translationRequestRef.current?.abort();
    setIsTranslating(false);
    setSelectedText(normalized);
    setTranslation(null);
    setTranslationError(null);
  }, []);

  useEffect(() => {
    translationRequestRef.current?.abort();
    setSelectedText(null);
    setTranslation(null);
    setTranslationError(null);
    setIsTranslating(false);
    return () => translationRequestRef.current?.abort();
  }, [book.sourceUrl, pageNumber]);

  useEffect(() => {
    if (!book.sourceUrl || !canvasRef.current || !textLayerRef.current) return;
    let cancelled = false;
    let destroyLoadingTask: (() => void) | undefined;
    const canvas = canvasRef.current;
    const textLayer = textLayerRef.current;

    const renderPage = async () => {
      setIsPdfLoading(true);
      setPdfError(null);
      try {
        const pdfjs = await import('pdfjs-dist');
        const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
        const loadingTask = pdfjs.getDocument({ url: book.sourceUrl });
        destroyLoadingTask = () => loadingTask.destroy();
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        setPageCount(pdf.numPages);
        const safePageNumber = Math.min(Math.max(pageNumber, 1), pdf.numPages);
        if (safePageNumber !== pageNumber) {
          setPageNumber(safePageNumber);
          return;
        }

        const page = await pdf.getPage(safePageNumber);
        if (cancelled) return;
        const viewport = page.getViewport({ scale: zoom });
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        textLayer.replaceChildren();
        textLayer.style.width = `${viewport.width}px`;
        textLayer.style.height = `${viewport.height}px`;
        textLayer.style.setProperty('--scale-factor', String(zoom));
        textLayer.style.setProperty('--total-scale-factor', String(zoom));

        await page.render({ canvas, viewport, transform: [outputScale, 0, 0, outputScale, 0, 0] }).promise;
        const textContent = await page.getTextContent();
        if (cancelled) return;
        const layer = new pdfjs.TextLayer({ textContentSource: textContent, container: textLayer, viewport });
        await layer.render();
      } catch (error) {
        if (!cancelled) {
          console.error('PDF reader render error:', error);
          setPdfError('PDF asli belum dapat dirender. Anda tetap dapat membukanya di tab baru.');
        }
      } finally {
        if (!cancelled) setIsPdfLoading(false);
      }
    };

    void renderPage();
    return () => {
      cancelled = true;
      destroyLoadingTask?.();
    };
  }, [book.sourceUrl, pageNumber, zoom]);

  const translateSelection = async () => {
    if (!selectedText) return;
    translationRequestRef.current?.abort();
    const controller = new AbortController();
    translationRequestRef.current = controller;
    setIsTranslating(true);
    setTranslation(null);
    setTranslationError(null);
    try {
      const response = await fetch('/api/botdong/translate', {
        signal: controller.signal,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildBotDongTranslationRequest({
          bookTitle: book.title,
          author: book.author,
          category: book.category,
          pageNumber,
          selectedText,
        })),
      });
      const data = await response.json();
      if (controller.signal.aborted) return;
      if (!response.ok) throw new Error(data.error || 'Layanan terjemahan tidak merespons.');
      setTranslation(data as TranslationResult);
    } catch (error) {
      if (controller.signal.aborted) return;
      setTranslationError(error instanceof Error ? error.message : 'Terjemahan gagal dimuat.');
    } finally {
      if (!controller.signal.aborted) setIsTranslating(false);
    }
  };

  return (
    <section className="mb-10 overflow-hidden rounded-3xl border border-slate-700/70 bg-[#0d111b] text-zinc-100 shadow-2xl">
      <style>{`.botdong-pdf-text-layer{position:absolute;inset:0;overflow:clip;line-height:1;text-size-adjust:none;letter-spacing:normal;word-spacing:normal;transform-origin:0 0;--min-font-size:1;--text-scale-factor:calc(var(--total-scale-factor) * var(--min-font-size));--min-font-size-inv:calc(1 / var(--min-font-size))}.botdong-pdf-text-layer :is(span,br){position:absolute;color:transparent;white-space:pre;cursor:text;transform-origin:0 0;user-select:text}.botdong-pdf-text-layer > :not(.markedContent),.botdong-pdf-text-layer .markedContent span:not(.markedContent){--font-height:0;--scale-x:1;--rotate:0deg;font-size:calc(var(--text-scale-factor) * var(--font-height));transform:rotate(var(--rotate)) scaleX(var(--scale-x)) scale(var(--min-font-size-inv))}.botdong-pdf-text-layer ::selection{background:rgba(59,130,246,.42)}.botdong-pdf-text-layer .markedContent{display:contents}`}</style>
      <header className="flex flex-col gap-3 border-b border-slate-700/70 bg-slate-950/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-400">Mode baca paralel</p>
          <h3 className="font-serif text-lg font-bold">PDF asli × BotDong.read</h3>
        </div>
        <button onClick={onClose} className="inline-flex items-center gap-1.5 self-start rounded-lg px-3 py-2 text-xs text-zinc-400 hover:bg-white/10 hover:text-white sm:self-auto">
          <X size={14} /> Tutup mode paralel
        </button>
      </header>

      <div className="grid min-h-[42rem] lg:grid-cols-[minmax(0,1.25fr)_minmax(19rem,.75fr)]">
        <div className="flex min-w-0 flex-col border-b border-slate-700/70 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-2 border-b border-slate-700/70 bg-slate-900/60 px-3 py-2">
            <span className="text-xs font-semibold text-zinc-200">PDF asli — pilih teks untuk diterjemahkan</span>
            <a href={book.sourceUrl} target="_blank" rel="noreferrer" className="text-[11px] font-medium text-sky-400 hover:text-sky-300">Buka asli</a>
          </div>
          <div ref={pageHostRef} className="relative flex min-h-[32rem] flex-1 items-start justify-center overflow-auto bg-slate-950 p-4" onMouseUp={captureSelection}>
            {isPdfLoading && <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-slate-950/75 text-xs text-zinc-300"><Loader2 size={16} className="animate-spin text-sky-400" /> Memuat halaman PDF…</div>}
            {pdfError ? <div className="max-w-sm self-center rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center text-xs leading-relaxed text-amber-100">{pdfError}</div> : <div className="relative h-fit shadow-2xl"><canvas ref={canvasRef} className="block bg-white" /><div ref={textLayerRef} className="botdong-pdf-text-layer" aria-label="Teks PDF yang dapat dipilih" /></div>}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-700/70 bg-slate-900/60 px-3 py-2">
            <div className="flex items-center gap-1">
              <button aria-label="Halaman sebelumnya" onClick={() => setPageNumber(value => Math.max(1, value - 1))} disabled={pageNumber <= 1} className="rounded-md p-1.5 text-zinc-300 hover:bg-white/10 disabled:opacity-30"><ChevronLeft size={16} /></button>
              <span className="min-w-20 text-center text-xs text-zinc-300">Hal. {pageNumber}{pageCount ? ` / ${pageCount}` : ''}</span>
              <button aria-label="Halaman berikutnya" onClick={() => setPageNumber(value => Math.min(pageCount || value + 1, value + 1))} disabled={Boolean(pageCount && pageNumber >= pageCount)} className="rounded-md p-1.5 text-zinc-300 hover:bg-white/10 disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <button aria-label="Perkecil PDF" onClick={() => setZoom(value => Math.max(.75, Number((value - .1).toFixed(2))))} className="rounded-md p-1.5 text-zinc-300 hover:bg-white/10"><Minus size={15} /></button>
              <span className="w-10 text-center text-zinc-400">{Math.round(zoom * 100)}%</span>
              <button aria-label="Perbesar PDF" onClick={() => setZoom(value => Math.min(1.75, Number((value + .1).toFixed(2))))} className="rounded-md p-1.5 text-zinc-300 hover:bg-white/10"><ZoomIn size={15} /></button>
            </div>
          </div>
        </div>

        <aside className="flex min-h-[28rem] flex-col bg-[#111827]">
          <div className="border-b border-slate-700/70 px-5 py-4">
            <div className="flex items-center gap-2 text-sky-300"><Sparkles size={16} /><span className="text-xs font-bold uppercase tracking-wider">BotDong.read</span></div>
            <h4 className="mt-1 font-serif text-xl font-bold">Terjemahan pilihan</h4>
            <p className="mt-1 text-xs leading-relaxed text-zinc-400">Terjemahkan hanya teks yang Anda blok di halaman PDF sebelah kiri.</p>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {selectedText ? <div className="rounded-xl border border-sky-400/20 bg-sky-400/5 p-3"><p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-sky-300">Teks terpilih · Hal. {pageNumber}</p><p className="text-xs leading-relaxed text-zinc-300">“{selectedText}”</p></div> : <div className="rounded-2xl border border-dashed border-slate-600 p-5 text-center text-sm text-zinc-400"><p className="font-semibold text-zinc-200">Pilih teks di PDF</p><p className="mt-2 text-xs leading-relaxed">Sorot bagian yang ingin dipahami. Terjemahan tidak akan memproses satu halaman penuh.</p></div>}
            {translationError && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">{translationError}</p>}
            {translation && <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4"><p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400">Bahasa Indonesia</p><p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-100">{translation.analysis}</p><p className="mt-3 text-[10px] text-zinc-500">{translation.model}</p></div>}
          </div>
          <div className="border-t border-slate-700/70 p-4">
            <button onClick={translateSelection} disabled={!selectedText || isTranslating} className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-xs font-bold text-slate-950 transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40">
              {isTranslating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />} {isTranslating ? 'Menerjemahkan…' : 'Terjemahkan pilihan'}
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
};
