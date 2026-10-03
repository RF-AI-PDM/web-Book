import JSZip from 'jszip';
import { mkdir, writeFile } from 'node:fs/promises';

const zip = new JSZip();
zip.file('mimetype', 'application/epub+zip');
zip.file('META-INF/container.xml', '<container><rootfiles><rootfile full-path="OPS/content.opf" /></rootfiles></container>');
zip.file('OPS/content.opf', '<package><metadata><title>Reader Smoke Fixture</title><creator>F15 Test</creator></metadata><manifest><item id="chapter" href="chapter.xhtml" media-type="application/xhtml+xml"/><item id="image" href="diagram.png" media-type="image/png"/></manifest><spine><itemref idref="chapter"/></spine></package>');
zip.file('OPS/chapter.xhtml', '<html><body><h1>Bab Pengujian</h1><p>Kutipan identik untuk menguji posisi sorotan.</p><p>Kutipan identik untuk menguji posisi sorotan.</p><p>Paragraf ketiga harus tetap tersedia setelah simpan dan reload browser.</p><figure><img src="diagram.png" alt="Diagram pengujian"/><figcaption>Gambar tersimpan offline</figcaption></figure><ul><li>Butir pertama</li><li>Butir kedua</li></ul></body></html>');
zip.file('OPS/diagram.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1cAAAAASUVORK5CYII=', 'base64'));
await mkdir('artifacts/reader-verification', { recursive: true });
await writeFile('artifacts/reader-verification/reader-smoke.epub', await zip.generateAsync({ type: 'nodebuffer' }));
console.log('Created artifacts/reader-verification/reader-smoke.epub');
