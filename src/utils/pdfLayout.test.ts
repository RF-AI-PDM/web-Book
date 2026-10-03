import { describe, expect, it } from 'vitest';
import { reconstructPdfPage } from './pdfLayout';

const item = (str: string, x: number, y: number, width = 100, height = 10) => ({ str, width, height, transform: [height, 0, 0, height, x, y] });
describe('PDF reading order', () => {
  it('groups fragments into lines and preserves paragraph gaps', () => {
    const result = reconstructPdfPage([item('Halo', 10, 100, 25), item('dunia.', 40, 100, 30), item('Baris berikut.', 10, 88), item('Paragraf baru.', 10, 55)]);
    expect(result.text).toBe('Halo dunia. Baris berikut.\n\nParagraf baru.');
  });
  it('reads a two-column page down the left column before the right column', () => {
    const result = reconstructPdfPage([
      item('Kiri 1', 10, 100), item('Kanan 1', 250, 100),
      item('Kiri 2', 10, 88), item('Kanan 2', 250, 88),
      item('Kiri 3', 10, 76), item('Kanan 3', 250, 76),
    ]);
    expect(result.text).toBe('Kiri 1 Kiri 2 Kiri 3\n\nKanan 1 Kanan 2 Kanan 3');
    expect(result.hasColumns).toBe(true);
  });
  it('keeps a full-width heading above both columns', () => {
    const result = reconstructPdfPage([
      item('Judul Utama', 10, 140, 400, 20),
      item('Kiri 1', 10, 100), item('Kanan 1', 250, 100),
      item('Kiri 2', 10, 88), item('Kanan 2', 250, 88),
      item('Kiri 3', 10, 76), item('Kanan 3', 250, 76),
    ]);
    expect(result.text).toBe('# Judul Utama\n\nKiri 1 Kiri 2 Kiri 3\n\nKanan 1 Kanan 2 Kanan 3');
  });
  it('reports empty and rotated text instead of silently assuming high fidelity', () => {
    expect(reconstructPdfPage([]).text).toBe('');
    const result = reconstructPdfPage([{ str: 'Rotasi', width: 50, height: 10, transform: [0, 10, -10, 0, 10, 100] }]);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.text).toContain('Rotasi');
  });
});
