import { describe, expect, it } from 'vitest';
import { locateAnnotation, captureAnnotationLocator } from './annotationLocator';
import type { Annotation } from '../types';

const ann = (selectedText: string, locator?: Annotation['locator']) => ({ selectedText, locator } as Annotation);
describe('annotation locators', () => {
  it('targets only the chosen block when identical quotes appear in several blocks', () => {
    const text = 'Kutipan identik';
    const units = [{ id: 'first', text }, { id: 'second', text }];
    const annotation = ann(text, captureAnnotationLocator('second', text, 0, text.length));
    expect(locateAnnotation(annotation, units[0], units)).toBeNull();
    expect(locateAnnotation(annotation, units[1], units)).toEqual({ start: 0, end: text.length });
  });
  it('retains the second repeated occurrence and recovers it after text shifts using context', () => {
    const text = 'awal kata tengah kata akhir';
    const annotation = ann('kata', captureAnnotationLocator('p', text, 17, 21));
    expect(locateAnnotation(annotation, { id: 'p', text }, [{ id: 'p', text }])).toEqual({ start: 17, end: 21 });
    const changed = `tambahan ${text}`;
    expect(locateAnnotation(annotation, { id: 'p', text: changed }, [{ id: 'p', text: changed }])).toEqual({ start: 26, end: 30 });
  });
  it('renders a legacy quote only if it is unambiguous across the chapter', () => {
    const units = [{ id: 'first', text: 'satu kutipan' }, { id: 'second', text: 'kutipan dua' }];
    expect(locateAnnotation(ann('kutipan'), units[0], units)).toBeNull();
    expect(locateAnnotation(ann('satu'), units[0], units)).toEqual({ start: 0, end: 4 });
  });
  it('does not jump to another block if the original block is removed', () => {
    const annotation = ann('kata', captureAnnotationLocator('removed', 'kata', 0, 4));
    expect(locateAnnotation(annotation, { id: 'other', text: 'kata' }, [{ id: 'other', text: 'kata' }])).toBeNull();
  });
});
