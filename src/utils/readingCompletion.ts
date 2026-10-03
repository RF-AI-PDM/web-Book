/** Returns true only for the first completed reading of this book. */
export function recordCompletedBook(completed: Set<string>, bookId: string, progress: number): boolean {
  if (progress < 100 || completed.has(bookId)) return false;
  completed.add(bookId);
  return true;
}
