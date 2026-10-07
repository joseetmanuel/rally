import { Injectable } from '@angular/core';
import type { jsPDF } from 'jspdf';
import type { RowInput } from 'jspdf-autotable';
import { RankingEntry } from '../../models/ranking/ranking-entry';
import { KIND_LABELS } from '../../models/statement/statement';
import { shortDate } from '../../utils/dates';

type Rgb = [number, number, number];

// Colores de marca (los mismos de la pantalla del ranking)
const BRAND: Rgb = [0, 105, 144];
const MEDAL_FILL: Record<number, Rgb> = {
  1: [255, 233, 168], // oro
  2: [227, 232, 236], // plata
  3: [246, 217, 191]  // bronce
};
const MAIN_ROW_FILL: Rgb = [231, 238, 243];
const SUB_ROW_TEXT: Rgb = [70, 80, 86];
const POINTS_GREEN: Rgb = [27, 107, 47];

/** Cuerpo de la tabla: una fila por participante seguida de un sub-renglón por cada movimiento */
export interface PdfBody {
  body: RowInput[];
  /** índice de fila -> posición del participante (sólo las filas principales) */
  mainRows: Map<number, number>;
}

@Injectable({
  providedIn: 'root'
})
export class RankingPdfService {
  /** Nombre del archivo: ranking-rally-AAAA-MM-DD.pdf (fecha local) */
  fileName(date: Date = new Date()): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `ranking-rally-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.pdf`;
  }

  /** Fila principal de un participante, en el orden de las columnas del PDF */
  tableRows(entries: RankingEntry[]): string[][] {
    return entries.map((e) => this.mainRow(e));
  }

  private mainRow(e: RankingEntry): string[] {
    return [
      String(e.position),
      e.full_name,
      e.team ?? '—',
      String(e.certifications),
      String(e.courses_given),
      String(e.courses_taken),
      String(e.total_points)
    ];
  }

  /**
   * Sub-renglón de un movimiento. Ocupa las 7 columnas de la tabla:
   * [sangría][fecha · tipo: asunto][detalle en 4 columnas][+puntos]
   */
  subRow(entry: NonNullable<RankingEntry['entries']>[number]): RowInput {
    return [
      { content: '' },
      { content: `${shortDate(entry.date)} · ${KIND_LABELS[entry.kind]}: ${entry.title}` },
      { content: entry.detail, colSpan: 4 },
      { content: `+${entry.points}`, styles: { halign: 'right' } }
    ];
  }

  /** Cuerpo completo de la tabla; los participantes sin movimientos sólo llevan su fila principal */
  bodyRows(entries: RankingEntry[]): PdfBody {
    const body: RowInput[] = [];
    const mainRows = new Map<number, number>();
    for (const entry of entries) {
      mainRows.set(body.length, entry.position);
      body.push(this.mainRow(entry));
      for (const movement of entry.entries ?? []) {
        body.push(this.subRow(movement));
      }
    }
    return { body, mainRows };
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

    const { body, mainRows } = this.bodyRows(entries);
    autoTable(doc, {
      startY: 47,
      head: [['#', 'Consultor', 'Equipo', 'Cert.', 'Dados', 'Tomados', 'Puntos']],
      body,
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 2.2, lineColor: [192, 199, 205], lineWidth: 0.1 },
      headStyles: { fillColor: BRAND, textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        2: { cellWidth: 30 },
        3: { halign: 'center', cellWidth: 16 },
        4: { halign: 'center', cellWidth: 16 },
        5: { halign: 'center', cellWidth: 20 },
        6: { halign: 'right', cellWidth: 20 }
      },
      margin: { left: 14, right: 14, bottom: 16 },
      rowPageBreak: 'avoid',
      didParseCell: (data) => {
        if (data.section !== 'body') return;
        const position = mainRows.get(data.row.index);
        if (position !== undefined) {
          // Fila principal: el podio en oro, plata y bronce; el resto en gris azulado
          data.cell.styles.fillColor = MEDAL_FILL[position] ?? MAIN_ROW_FILL;
          data.cell.styles.fontStyle = 'bold';
        } else {
          // Sub-renglón de un movimiento: más pequeño y discreto, con los puntos en verde
          data.cell.styles.fontSize = 7.5;
          data.cell.styles.cellPadding = { top: 1.2, bottom: 1.2, left: 2.2, right: 2.2 };
          data.cell.styles.textColor = data.column.index === 6 ? POINTS_GREEN : SUB_ROW_TEXT;
          data.cell.styles.fontStyle = data.column.index === 6 ? 'bold' : 'normal';
          data.cell.styles.fillColor = [255, 255, 255];
          data.cell.styles.lineColor = [225, 230, 234];
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
