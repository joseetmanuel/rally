import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { RankingComponent } from './ranking.component';
import { RankingService } from '../../core/services/ranking/ranking.service';
import { RankingEntry } from '../../core/models/ranking/ranking-entry';

function entry(position: number, name: string, total: number, extra: Partial<RankingEntry> = {}): RankingEntry {
  return {
    position,
    consultant_id: position,
    full_name: name,
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

describe('RankingComponent', () => {
  let fixture: ComponentFixture<RankingComponent>;
  let component: RankingComponent;
  const service = { getRanking: jest.fn() };

  async function setup(result: any = of(DATA)) {
    service.getRanking.mockReturnValue(result);
    await TestBed.configureTestingModule({
      imports: [RankingComponent, NoopAnimationsModule],
      providers: [{ provide: RankingService, useValue: service }]
    }).compileComponents();
    fixture = TestBed.createComponent(RankingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(() => jest.clearAllMocks());

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
});
