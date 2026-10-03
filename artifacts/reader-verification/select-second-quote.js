(() => {
  const paragraphs = [...document.querySelectorAll('p[data-reader-text-id]')].filter(p => p.textContent.includes('Kutipan identik'));
  if (paragraphs.length !== 2) throw new Error('Expected two repeated quote paragraphs');
  const range = document.createRange();
  range.selectNodeContents(paragraphs[1]);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  paragraphs[1].dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  return { selectedParagraph: paragraphs[1].dataset.readerTextId, text: selection.toString() };
})();
