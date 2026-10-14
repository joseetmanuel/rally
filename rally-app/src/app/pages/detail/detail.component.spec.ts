import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { DetailComponent } from './detail.component';
import { RankingService } from '../../core/services/ranking/ranking.service';
import { StatementService } from '../../core/services/statement/statement.service';
import { RankingEntry } from '../../core/models/ranking/ranking-entry';
import { Statement } from '../../core/models/statement/statement';

function participant(position: number, name: string, total: number): RankingEntry {
  return {
    position, consultant_id: position * 10, full_name: name, team: 'LC/GR', certifications: 1, courses_given: 0,
    courses_taken: 0, total_points: total, last_certification_date: null,
    breakdown: { certifications: total, courses_given: 0, student_bonus: 0, instructor_bonus: 0, extra: 0 }
  };
}

const PARTICIPANTS = [participant(1, 'Silvino Martinez Soto', 110), participant(2, 'Marco Quintero', 70)];

const STATEMENT: Statement = {
  consultant: { id: 10, full_name: 'Silvino Martinez Soto', participant_type: 'EXTERNO', team: 'LC/GR', consulting_firm: 'Wayssen' },
  position: 1,
  participants: 26,
  total_points: 118,
  certifications: 2,
  courses_given: 1,
  courses_taken: 0,
  last_certification_date: '2026-02-19',
  breakdown: { certifications: 40, courses_given: 15, student_bonus: 0, instructor_bonus: 3, extra: 60 },
  entries: [
    { date: '2026-01-13', kind: 'certification', points: 10, title: 'PCEP', detail: 'Python Institute · Fundacional', balance: 10 },
    { date: '2026-02-19', kind: 'certification', points: 30, title: 'PCAP', detail: 'Python Institute · Profesional', balance: 40 },
    { date: '2026-02-20', kind: 'course_given', points: 15, title: 'Taller', detail: 'PCAP · 3 asistentes', balance: 55 },
    { date: '2026-02-25', kind: 'instructor_bonus', points: 3, title: 'PCAP', detail: 'Ana se certificó tras tu curso', balance: 58 },
    { date: '2026-04-01', kind: 'extra', points: 60, title: 'Dinámica especial', detail: '', balance: 118 }
  ]
};

describe('DetailComponent', () => {
  let fixture: ComponentFixture<DetailComponent>;
  let component: DetailComponent;
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let router: Router;
  const ranking = { getRanking: jest.fn() };
  const statements = { getStatement: jest.fn() };

  async function setup(id: string | null = '10', rankingResult: any = of(PARTICIPANTS)) {
    params = new BehaviorSubject(convertToParamMap(id === null ? {} : { id }));
    ranking.getRanking.mockReturnValue(rankingResult);
    await TestBed.configureTestingModule({
      imports: [DetailComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: RankingService, useValue: ranking },
        { provide: StatementService, useValue: statements },
        { provide: ActivatedRoute, useValue: { paramMap: params.asObservable() } }
      ]
    }).compileComponents();
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const text = (selector: string) => el().querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();

  beforeEach(() => {
    jest.clearAllMocks();
    statements.getStatement.mockReturnValue(of(STATEMENT));
  });

  it('should create and load the statement of the participant in the URL', async () => {
    await setup('10');
    expect(component).toBeTruthy();
    expect(statements.getStatement).toHaveBeenCalledWith(10);
    expect(component.selectedId).toBe(10);
    expect(component.loading).toBe(false);
  });

  it('shows the face of the participant when there is a photo', async () => {
    await setup('10');
    const avatar = el().querySelector('.avatar') as HTMLElement;
    expect(avatar.querySelector('img')?.getAttribute('src')).toBe('assets/imgs/faces/silvino-martinez-soto.webp');
    expect(avatar.querySelector('img')?.getAttribute('alt')).toBe('');
  });

  it('shows who the participant is, the position and the total', async () => {
    await setup();
    expect(text('h1')).toBe('Silvino Martinez Soto');
    expect(text('.chip--rank')).toContain('Lugar 1 de 26');
    expect(text('.hero__total-value')).toBe('118');
    expect(text('.chips')).toContain('LC/GR');
    expect(text('.chips')).toContain('Externo · Wayssen');
    expect(Array.from(el().querySelectorAll('.kpi dd')).map((n) => n.textContent?.trim())).toEqual(['2', '1', '0']);
  });

  it('lists every movement with its points and running balance', async () => {
    await setup();
    const moves = Array.from(el().querySelectorAll('.move'));
    expect(moves.length).toBe(5);
    expect(moves[0].querySelector('.move__title')?.textContent?.trim()).toBe('PCEP');
    expect(moves[0].querySelector('.move__kind')?.textContent?.trim()).toBe('Certificación');
    expect(moves[0].querySelector('.move__points')?.textContent).toContain('+10');
    expect(moves[4].querySelector('.move__balance')?.textContent).toContain('118');
    expect(moves[2].querySelector('.move__kind')?.textContent?.trim()).toBe('Curso impartido');
    expect(moves[3].querySelector('.move__kind')?.textContent?.trim()).toBe('Bono de expositor');
  });

  it('groups the movements by month with the points earned in each', async () => {
    await setup();
    expect(component.groups.map((g) => [g.label, g.points])).toEqual([
      ['Enero 2026', 10], ['Febrero 2026', 48], ['Abril 2026', 60]
    ]);
    expect(Array.from(el().querySelectorAll('.month__head h3')).map((n) => n.textContent?.trim()))
      .toEqual(['Enero 2026', 'Febrero 2026', 'Abril 2026']);
    expect(text('.total-row')).toContain('118 pts');
  });

  it('formats dates in Spanish without timezone shifts', async () => {
    await setup();
    expect(component.shortDate('2026-02-19')).toBe('19 feb');
    expect(component.shortDate('2026-01-01')).toBe('1 ene');
    expect(component.shortDate('2026-12-31')).toBe('31 dic');
    expect(component.monthLabel('2026-09')).toBe('Septiembre 2026');
  });

  it('shows the breakdown of the score, including the components with zero', async () => {
    await setup();
    const rows = Array.from(el().querySelectorAll('.breakdown li'));
    expect(rows.length).toBe(5);
    expect(rows[0].textContent).toContain('Certificaciones');
    expect(rows[0].textContent).toContain('40');
    expect(rows[2].classList.contains('breakdown__item--zero')).toBe(true);
    expect(component.segmentWidth('extra')).toBeCloseTo((60 / 118) * 100);
  });

  it('lets the user pick another participant', async () => {
    await setup();
    component.select(20);
    expect(router.navigate).toHaveBeenCalledWith(['/app/detail', 20]);
  });

  it('reloads the statement when the participant in the URL changes', async () => {
    await setup('10');
    params.next(convertToParamMap({ id: '20' }));
    expect(statements.getStatement).toHaveBeenLastCalledWith(20);
    expect(component.selectedId).toBe(20);
  });

  it('opens the leader when no participant is chosen', async () => {
    await setup(null);
    expect(router.navigate).toHaveBeenCalledWith(['/app/detail', 10], { replaceUrl: true });
    expect(statements.getStatement).not.toHaveBeenCalled();
  });

  it('explains there are no participants when the ranking is empty', async () => {
    await setup(null, of([]));
    expect(component.loading).toBe(false);
    expect(text('.state')).toContain('Aún no hay participantes');
  });

  it('shows a friendly message when the participant does not exist', async () => {
    statements.getStatement.mockReturnValue(throwError(() => ({ status: 404 })));
    await setup('999');
    expect(component.notFound).toBe(true);
    expect(text('.state')).toContain('No encontramos a ese participante');
  });

  it('treats a non numeric id as not found without calling the API', async () => {
    await setup('abc');
    expect(component.notFound).toBe(true);
    expect(statements.getStatement).not.toHaveBeenCalled();
  });

  it('shows an error with retry when the server fails and recovers on retry', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    statements.getStatement.mockReturnValue(throwError(() => ({ status: 500 })));
    await setup('10');
    expect(component.error).toBe(true);
    expect(el().querySelector('.state--error')).not.toBeNull();
    statements.getStatement.mockReturnValue(of(STATEMENT));
    component.retry();
    fixture.detectChanges();
    expect(component.error).toBe(false);
    expect(text('h1')).toBe('Silvino Martinez Soto');
  });

  it('shows the ranking error when the participants cannot be loaded', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await setup('10', throwError(() => new Error('down')));
    expect(component.error).toBe(true);
  });

  it('explains when the participant has no points yet', async () => {
    statements.getStatement.mockReturnValue(of({
      ...STATEMENT, total_points: 0, entries: [],
      breakdown: { certifications: 0, courses_given: 0, student_bonus: 0, instructor_bonus: 0, extra: 0 }
    }));
    await setup('10');
    expect(component.hasPoints).toBe(false);
    expect(text('.empty')).toContain('Aún no suma puntos');
    expect(el().querySelector('.bar-stack')).toBeNull();
    expect(el().querySelector('.total-row')).toBeNull();
  });
});
