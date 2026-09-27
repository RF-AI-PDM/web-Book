import { Annotation, Book } from '../types';

export interface WorkspaceExportResult {
  success: boolean;
  message: string;
  url?: string;
  details?: string;
}

/**
 * Creates a formatted Google Doc with the book's overview, key insights, and user annotations.
 */
export async function exportToGoogleDocs(
  book: Book,
  annotations: Annotation[],
  accessToken: string
): Promise<WorkspaceExportResult> {
  try {
    // 1. Create a blank document
    const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `[F15 Library] Catatan Baca: ${book.title}`,
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      throw new Error(err.error?.message || 'Gagal membuat dokumen Google Docs');
    }

    const docData = await createRes.json();
    const documentId = docData.documentId;

    // 2. Prepare text content to insert
    const textLines: string[] = [
      `F15 LIBRARY - JURNAL & ANOTASI BUKU DIGITAL\n`,
      `Judul: ${book.title}\n`,
      `Penulis: ${book.author}\n`,
      `Kategori: ${book.category} | Waktu Baca: ${book.readTimeMinutes} menit\n`,
      `Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}\n\n`,
      `INTISARI BUKU:\n`,
      `${book.subtitle}\n`,
      `${book.description}\n\n`,
      `------------------------------------------------------------\n`,
      `DAFTAR ANOTASI & KUTIPAN PENTING (${annotations.length} catatan):\n\n`
    ];

    if (annotations.length === 0) {
      textLines.push(`(Belum ada anotasi tersimpan untuk buku ini. Anda dapat membaca dan menambahkan highlight langsung di F15 Library).\n`);
    } else {
      annotations.forEach((ann, index) => {
        textLines.push(`[${index + 1}] Bab: ${ann.chapterTitle}\n`);
        textLines.push(`"${ann.selectedText}"\n`);
        if (ann.note) {
          textLines.push(`Catatan Saya: ${ann.note}\n`);
        }
        textLines.push(`Waktu: ${new Date(ann.createdAt).toLocaleString('id-ID')}\n\n`);
      });
    }

    textLines.push(`------------------------------------------------------------\n`);
    textLines.push(`Dibuat otomatis dari F15 Library - Web Book & Anotasi Cloud.\n`);

    const fullContent = textLines.join('');

    // 3. Insert text into the Google Doc
    const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: fullContent,
            },
          },
        ],
      }),
    });

    if (!updateRes.ok) {
      const err = await updateRes.json();
      throw new Error(err.error?.message || 'Gagal mengisi konten Google Docs');
    }

    const docUrl = `https://docs.google.com/document/d/${documentId}/edit`;
    return {
      success: true,
      message: 'Berhasil membuat Google Docs dengan catatan bacaan!',
      url: docUrl,
      details: `Dokumen "${book.title}" tersimpan di Google Drive Anda.`,
    };
  } catch (error: any) {
    console.error('Docs export error:', error);
    return {
      success: false,
      message: error.message || 'Terjadi kesalahan saat mengekspor ke Google Docs.',
    };
  }
}

/**
 * Creates a Google Spreadsheet for reading journal tracking.
 */
export async function exportToGoogleSheets(
  book: Book,
  annotations: Annotation[],
  accessToken: string
): Promise<WorkspaceExportResult> {
  try {
    // 1. Create a spreadsheet with headers
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: `[F15 Library] Jurnal Bacaan - ${book.title}`,
        },
        sheets: [
          {
            properties: {
              title: 'Anotasi & Refleksi',
              gridProperties: { rowCount: 100, columnCount: 6 },
            },
          },
        ],
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      throw new Error(err.error?.message || 'Gagal membuat Google Sheets');
    }

    const sheetData = await createRes.json();
    const spreadsheetId = sheetData.spreadsheetId;

    // 2. Prepare rows
    const rows = [
      ['No', 'Judul Buku', 'Bab', 'Kutipan / Teks Pilihan', 'Catatan Refleksi', 'Waktu Dibuat'],
    ];

    if (annotations.length === 0) {
      rows.push(['1', book.title, 'Semua Bab', 'Belum ada kutipan', 'Buku dibaca di F15 Library', new Date().toISOString()]);
    } else {
      annotations.forEach((ann, idx) => {
        rows.push([
          String(idx + 1),
          book.title,
          ann.chapterTitle,
          ann.selectedText,
          ann.note || '-',
          new Date(ann.createdAt).toLocaleString('id-ID'),
        ]);
      });
    }

    // 3. Append rows
    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: rows,
        }),
      }
    );

    if (!appendRes.ok) {
      const err = await appendRes.json();
      throw new Error(err.error?.message || 'Gagal menulis baris data ke Google Sheets');
    }

    const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    return {
      success: true,
      message: 'Berhasil membuat lembar Google Sheets Jurnal Bacaan!',
      url: sheetUrl,
      details: `${rows.length - 1} baris catatan berhasil disinkronkan.`,
    };
  } catch (error: any) {
    console.error('Sheets export error:', error);
    return {
      success: false,
      message: error.message || 'Terjadi kesalahan saat mengekspor ke Google Sheets.',
    };
  }
}

/**
 * Sends reading summary digest to user's email via Gmail API.
 */
export async function sendDigestViaGmail(
  recipientEmail: string,
  book: Book,
  annotations: Annotation[],
  accessToken: string
): Promise<WorkspaceExportResult> {
  try {
    const subject = `[F15 Library] Intisari Buku: ${book.title}`;
    const dateStr = new Date().toLocaleDateString('id-ID', { dateStyle: 'full' });

    let bodyText = `Halo,\n\nBerikut ringkasan bacaan digital dan catatan Anda dari F15 Library:\n\n`;
    bodyText += `BUKU: ${book.title}\n`;
    bodyText += `PENULIS: ${book.author}\n`;
    bodyText += `KATEGORI: ${book.category} (${book.readTimeMinutes} menit baca)\n`;
    bodyText += `TANGGAL: ${dateStr}\n\n`;
    bodyText += `DESKRIPSI:\n${book.description}\n\n`;

    if (annotations.length > 0) {
      bodyText += `CATATAN & HIGHLIGHT ANDA (${annotations.length}):\n`;
      annotations.forEach((ann, idx) => {
        bodyText += `\n${idx + 1}. [${ann.chapterTitle}]\n"${ann.selectedText}"\n`;
        if (ann.note) {
          bodyText += `Catatan: ${ann.note}\n`;
        }
      });
      bodyText += `\n`;
    }

    bodyText += `\nSalam hangat,\nF15 Library Team - Baca Tuntas dalam 15 Menit`;

    // Construct raw MIME email
    const emailLines = [
      `To: ${recipientEmail}`,
      `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset=utf-8`,
      `Content-Transfer-Encoding: 7bit`,
      ``,
      bodyText,
    ];

    const rawEmail = emailLines.join('\r\n');
    // Base64URL encode
    const base64Encoded = btoa(unescape(encodeURIComponent(rawEmail)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: base64Encoded,
      }),
    });

    if (!sendRes.ok) {
      const err = await sendRes.json();
      throw new Error(err.error?.message || 'Gagal mengirim email via Gmail');
    }

    return {
      success: true,
      message: `Email intisari berhasil dikirimkan ke ${recipientEmail}!`,
      details: 'Periksa kotak masuk Gmail Anda.',
    };
  } catch (error: any) {
    console.error('Gmail send error:', error);
    return {
      success: false,
      message: error.message || 'Gagal mengirim pesan via Gmail.',
    };
  }
}

/**
 * Shares book reflection and key takeaways to Google Chat space.
 */
export async function shareToGoogleChat(
  spaceId: string,
  book: Book,
  annotations: Annotation[],
  accessToken: string
): Promise<WorkspaceExportResult> {
  try {
    const quote = book.chapters[0]?.keyQuote || book.subtitle;
    const highlightSummary = annotations.length > 0 
      ? `\n*Highlight Terpilih:* "${annotations[0].selectedText}"`
      : '';

    const text = `📚 *Rekomendasi Bacaan F15 Library*\n*Buku:* ${book.title} (${book.author})\n*Topik:* ${book.category} • ${book.readTimeMinutes} menit\n\n💡 *Poin Kunci:* "${quote}"${highlightSummary}\n\n_Dibagikan dari F15 Library Web Book._`;

    // Clean spaceId format
    const formattedSpace = spaceId.startsWith('spaces/') ? spaceId : `spaces/${spaceId}`;

    const res = await fetch(`https://chat.googleapis.com/v1/${formattedSpace}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Gagal membagikan ke Google Chat space');
    }

    return {
      success: true,
      message: 'Berhasil membagikan intisari buku ke Google Chat!',
      details: `Terkirim ke ${formattedSpace}`,
    };
  } catch (error: any) {
    console.error('Chat share error:', error);
    return {
      success: false,
      message: error.message || 'Gagal membagikan ke Google Chat.',
    };
  }
}
