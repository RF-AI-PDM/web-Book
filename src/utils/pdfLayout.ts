export interface PdfTextItem { str: string; width: number; height: number; transform: number[] }
interface Fragment { text: string; x: number; y: number; width: number; height: number }
interface Line { text: string; x: number; y: number; right: number; height: number }
const median = (values: number[]) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)] || 10;

/** Conservative coordinate-based reconstruction; complex/rotated layouts remain flagged. */
export function reconstructPdfPage(items: unknown[]): { text: string; warnings: string[]; hasColumns: boolean } {
  const warnings: string[] = [];
  const fragments: Fragment[] = [];
  for (const value of items) {
    const item = value as Partial<PdfTextItem>;
    if (!item?.str?.trim() || !Array.isArray(item.transform) || item.transform.length < 6) continue;
    if (Math.abs(item.transform[1]) > Math.abs(item.transform[0]) * 0.1) {
      if (!warnings.length) warnings.push('Teks berotasi terdeteksi; urutan baca perlu diperiksa.');
    }
    fragments.push({ text: item.str.trim(), x: item.transform[4], y: item.transform[5],
      width: Math.abs(item.width || 0), height: Math.abs(item.height || item.transform[3] || 10) });
  }
  if (!fragments.length) return { text: '', warnings, hasColumns: false };
  const typicalHeight = median(fragments.map(item => item.height));
  fragments.sort((a, b) => b.y - a.y || a.x - b.x);
  const rows: Fragment[][] = [];
  for (const fragment of fragments) {
    const previous = rows.at(-1);
    if (previous && Math.abs(previous[0].y - fragment.y) <= typicalHeight * 0.35) previous.push(fragment);
    else rows.push([fragment]);
  }
  const lines: Line[] = [];
  const gutters: { left: number; right: number }[] = [];
  for (const row of rows) {
    row.sort((a, b) => a.x - b.x);
    let line: Line | undefined;
    for (const item of row) {
      if (line && item.x - line.right > typicalHeight * 4) {
        gutters.push({ left: line.right, right: item.x });
        lines.push(line);
        line = undefined;
      }
      if (!line) line = { text: item.text, x: item.x, y: item.y, right: item.x + item.width, height: item.height };
      else {
        line.text += ` ${item.text}`;
        line.right = Math.max(line.right, item.x + item.width);
        line.height = Math.max(line.height, item.height);
      }
    }
    if (line) lines.push(line);
  }
  const gutterLeft = median(gutters.map(gap => gap.left));
  const gutterRight = median(gutters.map(gap => gap.right));
  const split = (gutterLeft + gutterRight) / 2;
  const hasColumns = gutters.length >= 3 && gutterRight - gutterLeft > typicalHeight * 4
    && gutters.filter(gap => gap.left < split && gap.right > split).length >= gutters.length * 0.75;
  const paragraphs = (column: Line[]): string => {
    const output: string[] = [];
    let previous: Line | undefined;
    for (const line of column.sort((a, b) => b.y - a.y || a.x - b.x)) {
      const heading = line.height > typicalHeight * 1.3;
      const newParagraph = !previous || heading || previous.height > typicalHeight * 1.3
        || previous.y - line.y > typicalHeight * 1.65 || line.x - previous.x > typicalHeight * 1.5;
      if (newParagraph) output.push(`${heading ? '# ' : ''}${line.text}`);
      else output[output.length - 1] += ` ${line.text}`;
      previous = line;
    }
    return output.join('\n\n');
  };
  if (!hasColumns) return { text: paragraphs(lines), warnings, hasColumns };
  const fullWidth = lines.filter(line => line.x < split && line.right > split).sort((a, b) => b.y - a.y);
  const narrow = lines.filter(line => !fullWidth.includes(line));
  const output: string[] = [];
  let upper = Infinity;
  for (const boundary of [...fullWidth, undefined]) {
    const lower = boundary?.y ?? -Infinity;
    const band = narrow.filter(line => line.y < upper && line.y > lower);
    for (const column of [band.filter(line => line.x < split), band.filter(line => line.x >= split)]) {
      if (column.length) output.push(paragraphs(column));
    }
    if (boundary) output.push(paragraphs([boundary]));
    upper = lower;
  }
  return { text: output.join('\n\n'), warnings, hasColumns };
}
