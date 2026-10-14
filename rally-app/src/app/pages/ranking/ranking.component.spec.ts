import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RankingComponent } from './ranking.component';
import { RankingService } from '../../core/services/ranking/ranking.service';
import { RankingPdfService } from '../../core/services/ranking/ranking-pdf.service';
import { RankingEntry } from '../../core/models/ranking/ranking-entry';
import { OrgStructureService } from '../../core/services/org-structure/org-structure.service';
import { AdminSessionService } from '../../core/services/admin-session/admin-session.service';
import { createAdminSessionMock } from '../../core/testing/admin-session.mock';

function entry(position: number, name: string, total: number, extra: Partial<RankingEntry> = {}): RankingEntry {
  return {
    position,
    consultant_id: position,
    full_name: name,
    team: 'LC/GR',
    certifications: 0,
    courses_given: 0,
    courses_taken: 0,
    total_points: total,
    last_certification_date: null,
    breakdown: { certifications: total, courses_given: 0, student_bonus: 0, instructor_bonus: 0, extra: 0 },
    ...extra
  };
}

const DATA: RankingEntry[] = [
  entry(1, 'Ana García', 100, { certifications: 3 }),
  entry(2, 'Luis Pérez', 80, { certifications: 2 }),
  entry(3, 'Carlos Ruiz', 60),
  entry(4, 'María Soto', 40, { breakdown: { certifications: 30, courses_given: 0, student_bonus: 6, instructor_bonus: 0, extra: 4 } }),
  entry(5, 'Pedro Gil', 0)
];

const unit = { head_name: '', head_consultant_id: null, cto_id: 1 };
const DIRECTIONS = [
  { id: 1, name: 'Dir A', ...unit },
  { id: 2, name: 'Dir B', ...unit }
];
const SUBDIRECTIONS = [
  { id: 10, name: 'Sub A1', direction_id: 1, ...unit },
  { id: 11, name: 'Sub A2', direction_id: 1, ...unit },
  { id: 20, name: 'Sub B1', direction_id: 2, ...unit }
];
const MANAGEMENTS = [
  { id: 100, name: 'Ger A1a', subdirection_id: 10, direction_id: 1, ...unit },
  { id: 110, name: 'Ger A2a', subdirection_id: 11, direction_id: 1, ...unit },
  { id: 200, name: 'Ger B1a', subdirection_id: 20, direction_id: 2, ...unit }
];

describe('RankingComponent', () => {
  let fixture: ComponentFixture<RankingComponent>;
  let component: RankingComponent;
  const service = { getRanking: jest.fn() };
  const pdf = { export: jest.fn() };
  const org = { getDirections: jest.fn(), getSubdirections: jest.fn(), getManagements: jest.fn() };
  let session: ReturnType<typeof createAdminSessionMock>;

  async function setup(result: any = of(DATA), admin = false) {
    service.getRanking.mockReturnValue(result);
    session = createAdminSessionMock(admin);
    await TestBed.configureTestingModule({
      imports: [RankingComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: RankingService, useValue: service },
        { provide: RankingPdfService, useValue: pdf },
        { provide: OrgStructureService, useValue: org },
        { provide: AdminSessionService, useValue: session }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(RankingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(() => {
    jest.clearAllMocks();
    pdf.export.mockResolvedValue('ranking-rally.pdf');
    org.getDirections.mockReturnValue(of(DIRECTIONS));
    org.getSubdirections.mockReturnValue(of(SUBDIRECTIONS));
    org.getManagements.mockReturnValue(of(MANAGEMENTS));
  });

  it('should create and load the ranking on init', async () => {
    await setup();
    expect(component).toBeTruthy();
    expect(service.getRanking).toHaveBeenCalledTimes(1);
    expect(component.loading).toBe(false);
  });

  it('shows the top three on the podium, with the first place in the centre', async () => {
    await setup();
    expect(component.podium.map((e) => e.position)).toEqual([2, 1, 3]);
    const names = Array.from(el().querySelectorAll('.podium__name')).map((n) => n.textContent?.trim());
    expect(names).toEqual(['Luis Pérez', 'Ana García', 'Carlos Ruiz']);
  });

  it('puts the points and the counts inside each pedestal, not the place number', async () => {
    await setup();
    const blocks = Array.from(el().querySelectorAll('.podium__block')) as HTMLElement[];
    expect(blocks.length).toBe(3);
    // orden en pantalla: 2.º, 1.º, 3.º
    expect(blocks.map((b) => b.querySelector('.podium__points-value')?.textContent?.trim())).toEqual(['80', '100', '60']);
    for (const block of blocks) {
      expect(block.querySelector('.podium__points-unit')?.textContent?.trim()).toBe('pts');
      expect(block.querySelector('.podium__stats')).not.toBeNull();
    }
    // arriba del pedestal sólo quedan medalla, avatar y nombre
    for (const place of Array.from(el().querySelectorAll('.podium__place'))) {
      expect(place.querySelector(':scope > .podium__link > .podium__points, :scope > .podium__link > .podium__stats')).toBeNull();
    }
  });

  it('writes the counts as "impartido(s)" and "tomado(s)", never "dados", with the right plural', async () => {
    await setup();
    const stats = Array.from(el().querySelectorAll('.podium__stats')).map((s) => s.textContent?.replace(/\s+/g, ' ').trim());
    expect(stats.join(' | ')).not.toContain('dados');
    for (const text of stats) expect(text).toMatch(/^\d+ cert\. \d+ impartidos? \d+ tomados?$/);
    // las bases traen ceros: 0 impartidos / 0 tomados (plural)
    expect(stats[0]).toContain('0 impartidos');
    expect(stats[0]).toContain('0 tomados');
  });

  it('shows the face of who has a photo (podium and table) and the initials of who does not', async () => {
    const withPhoto = [
      entry(1, 'Silvino Martinez Soto', 100), entry(2, 'Marco Uriel Quintero Díaz', 80),
      entry(3, 'Persona Sin Foto', 60), entry(4, 'Ángel César Gasca Martínez', 40), entry(5, 'Otra Sin Foto', 20)
    ];
    await setup(of(withPhoto));
    const podium = Array.from(el().querySelectorAll('.podium__place .avatar')) as HTMLElement[];
    // orden en pantalla: 2.º, 1.º, 3.º
    expect(podium[0].querySelector('img')?.getAttribute('src')).toBe('assets/imgs/faces/marco-uriel-quintero-diaz.webp');
    expect(podium[1].querySelector('img')?.getAttribute('src')).toBe('assets/imgs/faces/silvino-martinez-soto.webp');
    expect(podium[1].textContent?.trim()).toBe('');
    // la foto es decorativa: el nombre ya está al lado
    expect(podium[1].querySelector('img')?.getAttribute('alt')).toBe('');
    // sin foto: iniciales y ninguna imagen
    expect(podium[2].querySelector('img')).toBeNull();
    expect(podium[2].textContent?.trim()).toBe('PF');
    const rows = Array.from(el().querySelectorAll('.row .avatar')) as HTMLElement[];
    expect(rows[0].querySelector('img')?.getAttribute('src')).toBe('assets/imgs/faces/angel-cesar-gasca-martinez.webp');
    expect(rows[1].querySelector('img')).toBeNull();
    expect(rows[1].textContent?.trim()).toBe('OF');
  });

  it('lists everyone after the podium', async () => {
    await setup();
    expect(component.rows.map((e) => e.position)).toEqual([4, 5]);
    expect(el().querySelectorAll('.row').length).toBe(2);
  });

  it('computes the header indicators', async () => {
    await setup();
    expect(component.totalCertifications).toBe(5);
    expect(component.totalPoints).toBe(280);
    const kpis = Array.from(el().querySelectorAll('.kpi dd')).map((n) => n.textContent?.trim());
    expect(kpis).toEqual(['5', '5', '280']);
  });

  it('filters by name across the whole ranking, case-insensitively and hides the podium', async () => {
    await setup();
    component.onSearch({ target: { value: 'ana' } } as unknown as Event);
    fixture.detectChanges();
    expect(component.rows.map((e) => e.full_name)).toEqual(['Ana García']);
    expect(el().querySelector('.podium')).toBeNull();
  });

  it('tells the user when the search has no matches', async () => {
    await setup();
    component.onSearch({ target: { value: 'zzz' } } as unknown as Event);
    fixture.detectChanges();
    expect(el().querySelector('.board__empty')?.textContent).toContain('Ningún consultor');
  });

  it('builds initials from the first and last name', async () => {
    await setup();
    expect(component.initials('Ana García')).toBe('AG');
    expect(component.initials('Ana María de la Cruz')).toBe('AC');
    expect(component.initials('Ana')).toBe('A');
    expect(component.initials('   ')).toBe('?');
  });

  it('scales the bar against the leader and splits it by component', async () => {
    await setup();
    const maria = DATA[3];
    expect(component.barWidth(DATA[0])).toBe(100);
    expect(component.barWidth(maria)).toBe(40);
    expect(component.barWidth(DATA[4])).toBe(0);
    expect(component.segmentWidth(maria, 'certifications')).toBeCloseTo(75);
    expect(component.segmentWidth(maria, 'student_bonus')).toBeCloseTo(15);
    expect(component.segmentWidth(DATA[4], 'extra')).toBe(0);
  });

  it('describes the breakdown for assistive technology', async () => {
    await setup();
    expect(component.breakdownSummary(DATA[3])).toBe('Certificaciones: 30 · Bono alumno: 6 · Puntos extra: 4');
    expect(component.breakdownSummary(DATA[4])).toBe('Sin puntos todavía');
  });

  it('handles fewer than three participants', async () => {
    await setup(of([entry(1, 'Solo Uno', 10)]));
    expect(component.podium.length).toBe(1);
    expect(component.rows.length).toBe(0);
    expect(el().querySelector('.board__empty')?.textContent).toContain('podio');
  });

  it('shows the empty state when nobody is registered', async () => {
    await setup(of([]));
    expect(el().querySelector('.state')?.textContent).toContain('Aún no hay consultores');
  });

  it('shows an error with a retry that reloads', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await setup(throwError(() => new Error('down')));
    expect(component.error).toBe(true);
    expect(el().querySelector('.state--error')).not.toBeNull();
    service.getRanking.mockReturnValue(of(DATA));
    component.load();
    fixture.detectChanges();
    expect(component.error).toBe(false);
    expect(component.ranking.length).toBe(5);
  });

  describe('without any points yet', () => {
    const ZEROS = [entry(1, 'Ana García', 0), entry(2, 'Luis Pérez', 0), entry(3, 'Carlos Ruiz', 0), entry(4, 'María Soto', 0)];

    it('does not award medals and lists everyone with an explanation', async () => {
      await setup(of(ZEROS));
      expect(component.hasPoints).toBe(false);
      expect(component.podium).toEqual([]);
      expect(el().querySelector('.podium')).toBeNull();
      expect(el().querySelectorAll('.row').length).toBe(4);
      expect(el().querySelector('.notice')?.textContent).toContain('Aún nadie suma puntos');
      expect(el().querySelector('.board__toolbar h2')?.textContent).toContain('Clasificación');
    });

    it('brings the podium back as soon as someone scores', async () => {
      await setup(of([entry(1, 'Ana García', 5), ...ZEROS.slice(1)]));
      expect(component.hasPoints).toBe(true);
      expect(component.podium.length).toBe(3);
      expect(el().querySelector('.notice')).toBeNull();
    });
  });

  describe('points cutoff', () => {
    it('shows the cutoff date of the rally in the header', async () => {
      await setup();
      expect(el().querySelector('.hero__cutoff')?.textContent).toContain('Corte de puntos: 15 dic 2026');
      expect(el().querySelector('.hero__cutoff--closed')).toBeNull();
    });

    it('says the rally is closed once the cutoff has passed', async () => {
      await setup();
      component.rules['_rules'].set({ start: '2026-01-01', cutoff: '2026-12-15', closed: true });
      fixture.detectChanges();
      expect(component.cutoffText).toBe('Rally cerrado el 15 dic 2026');
      expect(el().querySelector('.hero__cutoff--closed')?.textContent).toContain('Rally cerrado el 15 dic 2026');
    });
  });

  describe('link to the statement', () => {
    it('opens the statement of a participant from the list rows', async () => {
      await setup();
      const links = Array.from(el().querySelectorAll('a.row__link')) as HTMLAnchorElement[];
      expect(links.map((a) => a.getAttribute('href'))).toEqual(['/app/detail/4', '/app/detail/5']);
      expect(links[0].getAttribute('aria-label')).toBe('Ver el detalle de María Soto');
    });

    it('opens the statement from the podium', async () => {
      await setup();
      const links = Array.from(el().querySelectorAll('a.podium__link')) as HTMLAnchorElement[];
      expect(links.map((a) => a.getAttribute('href'))).toEqual(['/app/detail/2', '/app/detail/1', '/app/detail/3']);
    });
  });

  describe('structure filters', () => {
    const selects = () => Array.from(el().querySelectorAll('.filters select')) as HTMLSelectElement[];
    const optionTexts = (i: number) => Array.from(selects()[i].options).map((o) => o.textContent?.trim());
    function choose(i: number, value: string) {
      selects()[i].value = value;
      selects()[i].dispatchEvent(new Event('change'));
      fixture.detectChanges();
    }

    it('hides the bar from the public and never asks for the options', async () => {
      await setup(of(DATA), false);
      expect(el().querySelector('.filters')).toBeNull();
      expect(org.getDirections).not.toHaveBeenCalled();
      expect(org.getSubdirections).not.toHaveBeenCalled();
      expect(org.getManagements).not.toHaveBeenCalled();
    });

    it('shows the bar to the admin, with labelled selects and all the options', async () => {
      await setup(of(DATA), true);
      expect(selects().length).toBe(3);
      expect(Array.from(el().querySelectorAll('.filters__field span')).map((s) => s.textContent)).toEqual(['Dirección', 'Subdirección', 'Gerencia']);
      expect(optionTexts(0)).toEqual(['Todas', 'Dir A', 'Dir B']);
      expect(optionTexts(1)).toEqual(['Todas', 'Sub A1', 'Sub A2', 'Sub B1']);
      expect(optionTexts(2)).toEqual(['Todas', 'Ger A1a', 'Ger A2a', 'Ger B1a']);
      expect(el().querySelector('.filters__clear')).toBeNull();
    });

    it('cascades: a direction narrows subdirections and managements, and resets the lower levels', async () => {
      await setup(of(DATA), true);
      choose(0, '1');
      expect(optionTexts(1)).toEqual(['Todas', 'Sub A1', 'Sub A2']);
      expect(optionTexts(2)).toEqual(['Todas', 'Ger A1a', 'Ger A2a']);
      choose(1, '10');
      expect(optionTexts(2)).toEqual(['Todas', 'Ger A1a']);
      choose(2, '100');
      expect(component.managementId).toBe(100);
      choose(0, '2');
      expect(component.subdirectionId).toBeNull();
      expect(component.managementId).toBeNull();
      expect(optionTexts(1)).toEqual(['Todas', 'Sub B1']);
    });

    it('asks for the ranking again with the right filter at each change', async () => {
      await setup(of(DATA), true);
      choose(0, '1');
      expect(service.getRanking).toHaveBeenLastCalledWith(false, { direction_id: 1, subdirection_id: null, management_id: null });
      choose(1, '10');
      expect(service.getRanking).toHaveBeenLastCalledWith(false, { direction_id: 1, subdirection_id: 10, management_id: null });
      choose(2, '100');
      expect(service.getRanking).toHaveBeenLastCalledWith(false, { direction_id: 1, subdirection_id: 10, management_id: 100 });
    });

    it('describes the active filter and the number of participants', async () => {
      await setup(of(DATA), true);
      choose(0, '1');
      choose(1, '10');
      expect(el().querySelector('.filters__summary')?.textContent).toContain('Mostrando: Subdirección Sub A1 · 5 participantes');
    });

    it('clears the filters and reloads the full ranking', async () => {
      await setup(of(DATA), true);
      choose(0, '1');
      (el().querySelector('.filters__clear') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(component.directionId).toBeNull();
      expect(service.getRanking).toHaveBeenLastCalledWith();
      expect(el().querySelector('.filters__clear')).toBeNull();
      expect(el().querySelector('.filters__summary')).toBeNull();
    });

    it('exports the PDF with the same filter', async () => {
      await setup(of(DATA), true);
      choose(0, '1');
      choose(1, '10');
      await component.exportPdf();
      expect(service.getRanking).toHaveBeenLastCalledWith(true, { direction_id: 1, subdirection_id: 10, management_id: null });
    });

    it('shows a clear empty state when the filter matches nobody', async () => {
      await setup(of(DATA), true);
      service.getRanking.mockReturnValue(of([]));
      choose(0, '2');
      expect(el().querySelector('.state--filtered')?.textContent).toContain('Ningún participante pertenece a este filtro');
      (el().querySelector('.state--filtered button') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(component.hasFilter).toBe(false);
    });

    it('clears the filter and reloads everything when the profile becomes public', async () => {
      await setup(of(DATA), true);
      choose(0, '1');
      service.getRanking.mockClear();
      session.setAdmin(false);
      fixture.detectChanges();
      expect(el().querySelector('.filters')).toBeNull();
      expect(component.directionId).toBeNull();
      expect(service.getRanking).toHaveBeenCalledTimes(1);
      expect(service.getRanking).toHaveBeenCalledWith();
    });

    it('reloads and loads the options when the profile becomes admin', async () => {
      await setup(of(DATA), false);
      service.getRanking.mockClear();
      session.setAdmin(true);
      fixture.detectChanges();
      expect(org.getDirections).toHaveBeenCalledTimes(1);
      expect(service.getRanking).toHaveBeenCalledTimes(1);
      expect(el().querySelector('.filters')).toBeTruthy();
      expect(optionTexts(0)).toEqual(['Todas', 'Dir A', 'Dir B']);
    });
  });

  describe('PDF export', () => {
    const pdfButton = () => el().querySelector('button[aria-label*="PDF"]') as HTMLButtonElement;

    it('shows a visible export button in the header', async () => {
      await setup();
      expect(pdfButton()).toBeTruthy();
      expect(pdfButton().disabled).toBe(false);
    });

    it('exports the whole ranking, not just what the search shows', async () => {
      await setup();
      component.onSearch({ target: { value: 'ana' } } as unknown as Event);
      await component.exportPdf();
      // pide el ranking con los movimientos de cada participante y exporta eso
      expect(service.getRanking).toHaveBeenLastCalledWith(true);
      expect(pdf.export).toHaveBeenCalledWith(DATA);
    });

    it('exports when the button is clicked', async () => {
      await setup();
      pdfButton().click();
      await fixture.whenStable();
      expect(pdf.export).toHaveBeenCalledTimes(1);
    });

    it('is disabled while there is nothing to export', async () => {
      await setup(of([]));
      expect(pdfButton().disabled).toBe(true);
      await component.exportPdf();
      expect(pdf.export).not.toHaveBeenCalled();
    });

    it('shows a generating state and ignores repeated clicks', async () => {
      await setup();
      let finish!: (v: string) => void;
      pdf.export.mockReturnValue(new Promise<string>((resolve) => (finish = resolve)));
      const first = component.exportPdf();
      expect(component.exporting).toBe(true);
      fixture.detectChanges();
      expect(pdfButton().textContent).toContain('Generando');
      await component.exportPdf();
      await new Promise((resolve) => setTimeout(resolve));
      expect(pdf.export).toHaveBeenCalledTimes(1);
      finish('ok');
      await first;
      expect(component.exporting).toBe(false);
    });

    it('reports a failure without leaving the button locked', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      await setup();
      pdf.export.mockRejectedValue(new Error('boom'));
      await component.exportPdf();
      fixture.detectChanges();
      expect(component.exporting).toBe(false);
      expect(component.exportError).toBe(true);
      expect(el().querySelector('.export-error')?.textContent).toContain('No se pudo generar el PDF');
    });
  });
});
