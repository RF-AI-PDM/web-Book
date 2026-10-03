import type { ContentBlock, DocumentAsset } from '../types';
import { DocumentImage } from './DocumentImage';

interface DocumentBlockRendererProps {
  bookId: string;
  blocks: ContentBlock[];
  assets?: DocumentAsset[];
  renderText?: (block: Exclude<ContentBlock, { type: 'image' } | { type: 'pageBreak' }>, text: string, textId: string) => React.ReactNode;
}

export function DocumentBlockRenderer({ bookId, blocks, assets, renderText }: DocumentBlockRendererProps) {
  const text = (block: Exclude<ContentBlock, { type: 'image' } | { type: 'pageBreak' }>, value: string, textId = block.id) => renderText?.(block, value, textId) ?? value;

  return (
    <>
      {blocks.map((block) => {
        switch (block.type) {
          case 'heading': {
            const Heading = `h${block.level}` as 'h1' | 'h2' | 'h3';
            return <Heading key={block.id} data-reader-text-id={block.id} className="mt-10 font-serif text-2xl font-bold leading-tight first:mt-0">{text(block, block.text)}</Heading>;
          }
          case 'paragraph':
            return <p key={block.id} data-reader-text-id={block.id} className="leading-relaxed" style={{ textAlign: block.align || 'justify' }}>{text(block, block.text)}</p>;
          case 'quote':
            return <blockquote key={block.id} className="border-l-4 border-orange-500 pl-4 font-serif italic leading-relaxed"><p data-reader-text-id={block.id}>{text(block, block.text)}</p>{block.attribution && <footer className="mt-2 text-sm not-italic opacity-65">— {block.attribution}</footer>}</blockquote>;
          case 'list': {
            const List = block.ordered ? 'ol' : 'ul';
            return <List key={block.id} className={`space-y-2 pl-6 leading-relaxed ${block.ordered ? 'list-decimal' : 'list-disc'}`}>{block.items.map((item, index) => <li key={`${block.id}-${index}`} data-reader-text-id={`${block.id}:item:${index}`}>{text(block, item, `${block.id}:item:${index}`)}</li>)}</List>;
          }
          case 'image':
            return <DocumentImage key={block.id} bookId={bookId} assetId={block.assetId} asset={assets?.find(asset => asset.id === block.assetId)} alt={block.alt} caption={block.caption} />;
          case 'pageBreak':
            return <div key={block.id} className="my-10 flex items-center gap-3 text-xs opacity-55" aria-label={block.pageNumber ? `Halaman ${block.pageNumber}` : 'Pemisah halaman'}><span className="h-px flex-1 bg-current" />{block.pageNumber && <span>Halaman {block.pageNumber}</span>}<span className="h-px flex-1 bg-current" /></div>;
        }
      })}
    </>
  );
}
