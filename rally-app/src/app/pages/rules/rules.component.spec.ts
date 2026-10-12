import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RulesComponent } from './rules.component';
import { BASES_SECTIONS, BASES_TABLE } from '../../core/constants/RallyBases';

describe('RulesComponent (bases del Rally)', () => {
  let fixture: ComponentFixture<RulesComponent>;
  let text: string;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RulesComponent],
      providers: [provideRouter([])]
    }).compileComponents();
    fixture = TestBed.createComponent(RulesComponent);
    fixture.detectChanges();
    text = fixture.nativeElement.textContent;
  });

  it('shows the title, the calendar and the cutoff', () => {
    expect(text).toContain('Bases del Rally 2026 de certificaciones');
    expect(text).toContain('2026');
    expect(fixture.nativeElement.querySelector('.hero__dates').textContent).toContain('dic');
  });

  it('shows the points table with the four certification types', () => {
    const rows = fixture.nativeElement.querySelectorAll('.points tbody tr');
    expect(rows.length).toBe(4);
    const values = Array.from(rows).map((r: any) => Array.from(r.querySelectorAll('td')).map((c: any) => c.textContent.trim()));
    expect(values).toEqual([
      ['10', '5', '2', '1'],
      ['30', '15', '6', '3'],
      ['60', '30', '12', '6'],
      ['70', '35', '14', '7']
    ]);
    expect(BASES_TABLE.map((r) => r.type)).toEqual(['Fundacional', 'Profesional', 'Experto', 'Opcional']);
  });

  it('lists bases 1 to 14, in order, numbered as in the original document', () => {
    const numbers = BASES_SECTIONS.flatMap((s) => s.items.map((i) => i[0]));
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
    const rendered = Array.from(fixture.nativeElement.querySelectorAll('.items li')).map((li: any) => li.getAttribute('value'));
    expect(rendered).toEqual(numbers.map(String));
  });

  it('never mentions the company nor an internal e-mail address', () => {
    expect(text.toLowerCase()).not.toContain(['gen', 'tera'].join(''));
    expect(text).not.toMatch(/@/);
  });

  it('opens the study resources in a new tab safely', () => {
    const links = Array.from(fixture.nativeElement.querySelectorAll('.resources a')) as HTMLAnchorElement[];
    expect(links.length).toBe(4);
    for (const a of links) {
      expect(a.getAttribute('target')).toBe('_blank');
      expect(a.getAttribute('rel')).toContain('noopener');
    }
  });
});
