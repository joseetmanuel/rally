import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DisclaimerComponent } from './disclaimer.component';
import { RALLY_DISCLAIMER } from '@constants/Disclaimer';

describe('DisclaimerComponent', () => {
  let fixture: ComponentFixture<DisclaimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DisclaimerComponent] }).compileComponents();
    fixture = TestBed.createComponent(DisclaimerComponent);
    fixture.detectChanges();
  });

  const note = () => fixture.nativeElement.querySelector('p[role="note"]') as HTMLElement;

  it('shows the rally disclaimer', () => {
    expect(note().textContent?.trim()).toBe(RALLY_DISCLAIMER);
  });

  it('uses the wording of the rally rules', () => {
    expect(RALLY_DISCLAIMER).toContain('exclusiva de la gerencia de reingeniería de software');
    expect(RALLY_DISCLAIMER).toContain('la participación de los colaboradores es completamente opcional');
  });

  it('never names the company', () => {
    // el nombre se arma por partes para que ningún archivo de la app lo contenga
    expect(RALLY_DISCLAIMER.toLowerCase()).not.toContain(['gen', 'tera'].join(''));
  });

  it('can be shown in light text for dark backgrounds', () => {
    expect(note().classList.contains('disclaimer--light')).toBe(false);
    fixture.componentRef.setInput('light', true);
    fixture.detectChanges();
    expect(note().classList.contains('disclaimer--light')).toBe(true);
  });
});
