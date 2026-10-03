(() => {
  const paragraphs = [...document.querySelectorAll('p[data-reader-text-id]')].filter(p => p.textContent.includes('Kutipan identik'));
  if (paragraphs.length !== 2) throw new Error('Paragraphs lost or duplicated');
  if (!document.body.textContent.includes('Paragraf ketiga harus tetap tersedia')) throw new Error('Third paragraph missing');
  const image = document.querySelector('img[alt="Diagram pengujian"]');
  if (!image || !image.complete || !image.naturalWidth) throw new Error('Image not available');
  const highlights = paragraphs.map(p => p.querySelectorAll('mark').length);
  if (highlights[0] !== 0 || highlights[1] !== 1) throw new Error(`Highlight placed incorrectly: ${highlights}`);
  return { paragraphs: paragraphs.length, imageLoaded: true, highlights, completedCount: localStorage.getItem('f15_reading_stats') };
})();
