(() => {
  const button = [...document.querySelectorAll('button')].find(button => button.textContent.trim() === 'Buku Saya');
  if (!button) throw new Error('Buku Saya button missing');
  button.click();
})();
