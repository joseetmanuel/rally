import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { CaptureConsultantCertificationComponent } from './capture-consultant-certification.component';
import { ConsultantCertificationService } from '@services/consultant-certifications/consultant-certification.service';
import { CertificationService } from '@services/certifications/certification.service';
import { RallyRulesService } from '@services/rally-rules/rally-rules.service';

describe('CaptureConsultantCertificationComponent · calendario del Rally', () => {
  function setup(prepare?: (rules: RallyRulesService) => void) {
    TestBed.configureTestingModule({
      imports: [CaptureConsultantCertificationComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: { id: 5, full_name: 'Ana', participant_type: 'INTERNO', team_id: 1 } },
        { provide: ConsultantCertificationService, useValue: { createConsultantCertification: jest.fn().mockReturnValue(of({})) } },
        { provide: CertificationService, useValue: { getCertifications: () => of([]) } }
      ]
    });
    prepare?.(TestBed.inject(RallyRulesService));
    const fixture = TestBed.createComponent(CaptureConsultantCertificationComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('does not accept a certification before the start of the rally', () => {
    const component = setup().componentInstance;
    component.form.patchValue({ certification_id: 1, obtained_at: '2025-12-31' });
    expect(component.form.get('obtained_at')?.hasError('beforeStart')).toBe(true);
    expect(component.form.invalid).toBe(true);
  });

  it('accepts the first day of the rally', () => {
    const component = setup().componentInstance;
    component.form.patchValue({ certification_id: 1, obtained_at: '2026-01-01' });
    expect(component.form.get('obtained_at')?.errors).toBeNull();
  });

  it('limits the date picker to the calendar and tells the user the range', () => {
    const fixture = setup();
    const input = fixture.nativeElement.querySelector('input[type=date]') as HTMLInputElement;
    expect(input.min).toBe('2026-01-01');
    expect(input.max <= '2026-12-15').toBe(true);
    expect(fixture.nativeElement.querySelector('mat-hint')?.textContent).toContain('1 ene 2026 – 15 dic 2026');
  });

  it('follows the calendar the server announces', () => {
    const component = setup((rules) =>
      rules['_rules'].set({ start: '2027-01-01', cutoff: '2027-12-15', closed: false })).componentInstance;
    expect(component.minDate).toBe('2027-01-01');
    component.form.patchValue({ obtained_at: '2026-06-01' });
    expect(component.form.get('obtained_at')?.hasError('beforeStart')).toBe(true);
  });
});
