import { TextDecoder, TextEncoder } from 'util';
import { TestBed } from '@angular/core/testing';
import { RankingPdfService } from './ranking-pdf.service';
import { RankingEntry } from '../../models/ranking/ranking-entry';

// jsdom no incluye TextEncoder/TextDecoder, que jsPDF necesita para generar el archivo
Object.assign(globalThis, { TextEncoder, TextDecoder });

function entry(position: number, name: string, total: number, extra: Partial<RankingEntry> = {}): RankingEntry {
  return {
    position,
    consultant_id: position,
    full_name: name,
    team: 'LC/GR',
    certifications: 1,
    courses_given: 2,
    courses_taken: 3,
    total_points: total,
    last_certification_date: null,
    breakdown: { certifications: total, courses_given: 0, student_bonus: 0, instructor_bonus: 0, extra: 0 },
    ...extra
  };
}

const DATA: RankingEntry[] = [
  entry(1, 'Ana García', 100, {
    entries: [
      { date: '2026-02-19', kind: 'certification', points: 90, title: 'PCAP', detail: 'Python Institute · Profesional', balance: 90 },
      { date: '2026-03-02', kind: 'extra', points: 10, title: 'Punto extra', detail: 'Apoyo en el rally', balance: 100 }
    ]
  }),
  entry(2, 'Luis Pérez', 80, { team: null, entries: [] }),
  entry(3, 'Carlos Ruiz', 60)
];

describe('RankingPdfService', () => {
  let service: RankingPdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RankingPdfService);
  });

  it('names the file with the local date', () => {
    expect(service.fileName(new Date(2026, 9, 7))).toBe('ranking-rally-2026-10-07.pdf');
    expect(service.fileName(new Date(2026, 0, 5))).toBe('ranking-rally-2026-01-05.pdf');
  });

  it('maps every entry to a row in the column order of the PDF', () => {
    expect(service.tableRows(DATA)[0]).toEqual(['1', 'Ana García', 'LC/GR', '1', '2', '3', '100']);
  });

  it('shows a dash when the consultant has no team', () => {
    expect(service.tableRows(DATA)[1][2]).toBe('—');
  });

  it('summarises participants, certifications and points', () => {
    expect(service.summary(DATA)).toBe('3 participantes · 3 certificaciones · 240 puntos en juego');
  });

  it('adds a sub-row for every movement under its participant', () => {
    const { body, mainRows } = service.bodyRows(DATA);
    // Ana + 2 movimientos, Luis, Carlos
    expect(body.length).toBe(5);
    expect([...mainRows.entries()]).toEqual([[0, 1], [3, 2], [4, 3]]);
  });

  it('writes a movement as date, type, subject, detail and points in the 7 columns of the table', () => {
    const row = service.subRow(DATA[0].entries![0]) as any[];
    expect(row.length).toBe(4);
    expect(row[1].content).toBe('19 feb · Certificación: PCAP');
    expect(row[2]).toEqual({ content: 'Python Institute · Profesional', colSpan: 4 });
    expect(row[3].content).toBe('+90');
    // 1 + 1 + 4 + 1 columnas
    expect(1 + 1 + row[2].colSpan + 1).toBe(7);
  });

  it('keeps participants without movements as a single row', () => {
    const { body } = service.bodyRows([DATA[1], DATA[2]]);
    expect(body.length).toBe(2);
  });

  it('prints the movements in the PDF', async () => {
    const content = (await service.build(DATA)).output();
    expect(content).toContain('Certificación: PCAP');
    expect(content).toContain('Python Institute');
    expect(content).toContain('Apoyo en el rally');
    expect(content).toContain('+90');
  });

  it('builds a real A4 document with the ranking', async () => {
    const doc = await service.build(DATA, new Date(2026, 9, 7));
    expect(doc.getNumberOfPages()).toBe(1);
    expect(doc.internal.pageSize.getWidth()).toBeCloseTo(210, 0);
    const content = doc.output();
    expect(content.startsWith('%PDF-')).toBe(true);
    expect(content).toContain('Ranking del Rally');
    expect(content).toContain('Carlos Ruiz');
  });

  it('paginates a long ranking and numbers the pages', async () => {
    const many = Array.from({ length: 80 }, (_, i) => entry(i + 1, `Consultor ${i + 1}`, 100 - i));
    const doc = await service.build(many);
    const pages = doc.getNumberOfPages();
    expect(pages).toBeGreaterThan(1);
    expect(doc.output()).toContain(`Página ${pages} de ${pages}`);
  });

  it('builds a document even with an empty ranking', async () => {
    const doc = await service.build([]);
    expect(doc.getNumberOfPages()).toBe(1);
    expect(doc.output()).toContain('0 participantes');
  });

  it('saves the document under the dated file name', async () => {
    const save = jest.fn();
    jest.spyOn(service, 'build').mockResolvedValue({ save } as any);
    const when = new Date(2026, 9, 7);
    const name = await service.export(DATA, when);
    expect(name).toBe('ranking-rally-2026-10-07.pdf');
    expect(save).toHaveBeenCalledWith('ranking-rally-2026-10-07.pdf');
  });
});
