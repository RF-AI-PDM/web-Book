import type { Annotation, ContentBlock } from '../types';

export interface AnnotationTextUnit { id: string; text: string }
export function getAnnotationTextUnits(blocks: ContentBlock[]): AnnotationTextUnit[] {
  return blocks.flatMap(block => {
    if (block.type === 'list') return block.items.map((text, index) => ({ id: `${block.id}:item:${index}`, text }));
    return 'text' in block ? [{ id: block.id, text: block.text }] : [];
  });
}

export function captureAnnotationLocator(textId: string, text: string, start: number, end: number): NonNullable<Annotation['locator']> {
  return { textId, start, end, prefix: text.slice(Math.max(0, start - 32), start), suffix: text.slice(end, end + 32) };
}

function occurrences(text: string, quote: string): number[] {
  if (!quote) return [];
  const result: number[] = [];
  for (let index = text.indexOf(quote); index !== -1; index = text.indexOf(quote, index + 1)) result.push(index);
  return result;
}

export function locateAnnotation(
  annotation: Annotation, unit: AnnotationTextUnit, chapterUnits: AnnotationTextUnit[],
): { start: number; end: number } | null {
  const { locator, selectedText } = annotation;
  if (locator) {
    if (locator.textId !== unit.id) return null;
    if (unit.text.slice(locator.start, locator.end) === selectedText) return { start: locator.start, end: locator.end };
    const matches = occurrences(unit.text, selectedText).filter(start => {
      const end = start + selectedText.length;
      return unit.text.slice(Math.max(0, start - locator.prefix.length), start) === locator.prefix
        && unit.text.slice(end, end + locator.suffix.length) === locator.suffix;
    });
    return matches.length === 1 ? { start: matches[0], end: matches[0] + selectedText.length } : null;
  }
  const matches = chapterUnits.flatMap(item => occurrences(item.text, selectedText).map(start => ({ id: item.id, start })));
  if (matches.length !== 1 || matches[0].id !== unit.id) return null;
  return { start: matches[0].start, end: matches[0].start + selectedText.length };
}

export function locatorFromSelection(range: Range): Annotation['locator'] | null {
  const element = (node: Node) => node.nodeType === 1 ? node as Element : node.parentElement;
  const startUnit = element(range.startContainer)?.closest<HTMLElement>('[data-reader-text-id]');
  const endUnit = element(range.endContainer)?.closest<HTMLElement>('[data-reader-text-id]');
  if (!startUnit || startUnit !== endUnit) return null;
  const prefixRange = range.cloneRange();
  prefixRange.selectNodeContents(startUnit);
  prefixRange.setEnd(range.startContainer, range.startOffset);
  const raw = range.toString();
  const start = prefixRange.toString().length + (raw.length - raw.trimStart().length);
  const end = start + raw.trim().length;
  return captureAnnotationLocator(startUnit.dataset.readerTextId!, startUnit.textContent || '', start, end);
}
