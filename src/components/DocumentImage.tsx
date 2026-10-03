import { useEffect, useState } from 'react';
import { createDocumentAssetObjectUrl } from '../lib/documentAssetStore';
import type { DocumentAsset } from '../types';

interface DocumentImageProps {
  bookId: string;
  assetId: string;
  asset?: DocumentAsset;
  alt: string;
  caption?: string;
}

export function DocumentImage({ bookId, assetId, asset, alt, caption }: DocumentImageProps) {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    let active = true;
    let revoke: (() => void) | undefined;
    setSourceUrl(null);
    setHasError(false);

    createDocumentAssetObjectUrl(bookId, assetId)
      .then(async resolved => {
        if (resolved || !asset?.storagePath || !active) return resolved;
        const [{ resolveAssetBlob }, { downloadDocumentAsset }] = await Promise.all([
          import('../lib/documentAssetCloud'), import('../lib/firebaseStorage'),
        ]);
        await resolveAssetBlob(bookId, asset, downloadDocumentAsset);
        return createDocumentAssetObjectUrl(bookId, assetId);
      })
      .then((resolved) => {
        if (!active) {
          resolved?.revoke();
          return;
        }
        if (!resolved) {
          setHasError(true);
          return;
        }
        revoke = resolved.revoke;
        setSourceUrl(resolved.url);
      })
      .catch(() => {
        if (active) setHasError(true);
      });

    return () => {
      active = false;
      revoke?.();
    };
  }, [assetId, bookId, asset]);

  return (
    <figure className="my-8 overflow-hidden rounded-2xl border border-black/10 bg-black/5 p-2">
      {sourceUrl ? (
        <button type="button" className="block w-full cursor-zoom-in" onClick={() => setIsLightboxOpen(true)} aria-label={`Perbesar ${alt}`}>
          <img src={sourceUrl} alt={alt} loading="lazy" className="mx-auto max-h-[34rem] w-auto max-w-full rounded-xl object-contain" />
        </button>
      ) : hasError ? (
        <div role="status" className="flex min-h-40 items-center justify-center rounded-xl bg-black/10 px-5 text-center text-sm opacity-70">
          Ilustrasi tidak dapat dimuat dari penyimpanan lokal.
        </div>
      ) : (
        <div role="status" className="flex min-h-40 items-center justify-center rounded-xl bg-black/10 text-sm opacity-70">Memuat ilustrasi…</div>
      )}
      {(caption || alt) && <figcaption className="px-2 pt-2 text-center text-xs opacity-65">{caption || alt}</figcaption>}

      {isLightboxOpen && sourceUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" role="dialog" aria-modal="true" aria-label={alt} onClick={() => setIsLightboxOpen(false)}>
          <img src={sourceUrl} alt={alt} className="max-h-full max-w-full rounded-xl object-contain" />
        </div>
      )}
    </figure>
  );
}
