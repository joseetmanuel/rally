import { Injectable } from '@angular/core';
import type { jsPDF } from 'jspdf';
import { RankingEntry } from '../../models/ranking/ranking-entry';

type Rgb = [number, number, number];

// Colores de marca (los mismos de la pantalla del ranking)
const BRAND: Rgb = [0, 105, 144];
const MEDAL_FILL: Record<number, Rgb> = {
  1: [255, 233, 168], // oro
  2: [227, 232, 236], // plata
  3: [246, 217, 191]  // bronce
};

@Injectable({
  providedIn: 'root'
})
export class RankingPdfService {
  /** Nombre del archivo: ranking-rally-AAAA-MM-DD.pdf (fecha local) */
  fileName(date: Date = new Date()): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `ranking-rally-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.pdf`;
  }

  /** Filas de la tabla, en el orden de las columnas del PDF */
  tableRows(entries: RankingEntry[]): string[][] {
    return entries.map((e) => [
      String(e.position),
      e.full_name,
      e.team ?? '—',
      String(e.certifications),
      String(e.courses_given),
      String(e.courses_taken),
      String(e.total_points)
    ]);
  }

  /** Resumen mostrado bajo el título */
  summary(entries: RankingEntry[]): string {
    const certifications = entries.reduce((sum, e) => sum + e.certifications, 0);
    const points = entries.reduce((sum, e) => sum + e.total_points, 0);
    return `${entries.length} participantes · ${certifications} certificaciones · ${points} puntos en juego`;
  }

  /** Construye el documento. jsPDF y autoTable se cargan bajo demanda (no pesan en el arranque). */
  async build(entries: RankingEntry[], generatedAt: Date = new Date()): Promise<jsPDF> {
    const [{ jsPDF: JsPdf }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);

    const doc = new JsPdf({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const dateText = generatedAt.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

    // Encabezado de marca (sólo en la primera página)
    doc.setFillColor(...BRAND);
    doc.rect(0, 0, pageWidth, 34, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('Ranking del Rally', 14, 17);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Rally de Certificaciones', 14, 25);
    doc.text(`Actualizado al ${dateText}`, pageWidth - 14, 25, { align: 'right' });

    doc.setTextColor(64, 72, 77);
    doc.setFontSize(10);
    doc.text(this.summary(entries), 14, 42);

    autoTable(doc, {
      startY: 47,
      head: [['#', 'Consultor', 'Equipo', 'Cert.', 'Dados', 'Tomados', 'Puntos']],
      body: this.tableRows(entries),
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 2.2, lineColor: [192, 199, 205], lineWidth: 0.1 },
      headStyles: { fillColor: BRAND, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [246, 250, 254] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        2: { cellWidth: 30 },
        3: { halign: 'center', cellWidth: 16 },
        4: { halign: 'center', cellWidth: 16 },
        5: { halign: 'center', cellWidth: 20 },
        6: { halign: 'right', cellWidth: 20, fontStyle: 'bold' }
      },
      margin: { left: 14, right: 14, bottom: 16 },
      didParseCell: (data) => {
        // Resalta el podio en la fila de los tres primeros lugares
        const position = Number(data.row.raw && (data.row.raw as string[])[0]);
        if (data.section === 'body' && MEDAL_FILL[position]) {
          data.cell.styles.fillColor = MEDAL_FILL[position];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    // Pie de página con numeración (se escribe al final, cuando ya se conoce el total)
    const pages = doc.getNumberOfPages();
    const pageHeight = doc.internal.pageSize.getHeight();
    for (let page = 1; page <= pages; page++) {
      doc.setPage(page);
      doc.setFontSize(8);
      doc.setTextColor(120, 130, 136);
      doc.text('Rally de Certificaciones', 14, pageHeight - 8);
      doc.text(`Página ${page} de ${pages}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
    }

    return doc;
  }

  /** Genera y descarga el PDF. Devuelve el nombre del archivo. */
  async export(entries: RankingEntry[], generatedAt: Date = new Date()): Promise<string> {
    const doc = await this.build(entries, generatedAt);
    const name = this.fileName(generatedAt);
    doc.save(name);
    return name;
  }
}
