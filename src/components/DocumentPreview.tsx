import { useEffect, useState } from 'react';
import type { ParsedDocumentResult } from '../utils/documentParser';
import { getChapterBlocks } from '../utils/documentContent';

export function DocumentPreview({ document }: { document: ParsedDocumentResult }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const asset = document.assets?.find(asset => document.assetBlobs?.has(asset.id));
  const blob = asset ? document.assetBlobs?.get(asset.id) : undefined;
  useEffect(() => {
    const url = blob ? URL.createObjectURL(blob) : null;
    setImageUrl(url);
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [blob]);
  const blocks = document.chapters[0] ? getChapterBlocks(document.chapters[0]).slice(0, 4) : [];
  return (
    <section aria-label="Pratinjau hasil ekstraksi" className="space-y-3 rounded-2xl border border-stone-700 bg-stone-900 p-4 text-sm">
      <h3 className="font-semibold">Pratinjau hasil ekstraksi</h3>
      <p className="text-xs text-zinc-400">{document.totalPagesOrSections} {document.fileType === '.pdf' ? 'halaman' : 'bagian'} · {document.assets?.length || 0} gambar · {document.diagnostics?.pagesWithoutText || 0} halaman tanpa teks</p>
      {document.diagnostics?.warnings.map(warning => <p key={warning} role="status" className="text-xs leading-relaxed text-amber-300">{warning}</p>)}
      <div className="max-h-48 space-y-2 overflow-auto break-words text-zinc-300">
        {blocks.map(block => 'text' in block ? <p key={block.id} className={block.type === 'heading' ? 'font-bold' : ''}>{block.text}</p>
          : block.type === 'list' ? <ul key={block.id}>{block.items.map((item, index) => <li key={index}>• {item}</li>)}</ul> : null)}
        {imageUrl && <img src={imageUrl} alt={asset?.fileName || 'Ilustrasi pertama'} className="max-h-32 max-w-full rounded-lg" />}
      </div>
    </section>
  );
}
