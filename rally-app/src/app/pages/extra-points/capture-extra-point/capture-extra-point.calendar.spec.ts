import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { CaptureExtraPointComponent } from './capture-extra-point.component';
import { ConsultantExtraPointService } from '@services/consultant-extra-points/consultant-extra-point.service';
import { ConsultantService } from '@services/consultants/consultant.service';
import { ExtraPointReasonTypeService } from '@services/extra-point-reason-types/extra-point-reason-type.service';

describe('CaptureExtraPointComponent · calendario del Rally', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [CaptureExtraPointComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
        { provide: ConsultantExtraPointService, useValue: { createExtraPoint: jest.fn().mockReturnValue(of({})) } },
        { provide: ConsultantService, useValue: { getConsultants: () => of([]) } },
        { provide: ExtraPointReasonTypeService, useValue: { getReasonTypes: () => of([]) } }
      ]
    });
    const fixture = TestBed.createComponent(CaptureExtraPointComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('rejects points dated outside the calendar', () => {
    const component = setup().componentInstance;
    component.form.patchValue({ consultant_id: 1, extra_point_reason_type_id: 1, points: 5, awarded_at: '2025-06-01' });
    expect(component.form.get('awarded_at')?.hasError('beforeStart')).toBe(true);
    component.form.patchValue({ awarded_at: '2027-01-01' });
    expect(component.form.get('awarded_at')?.hasError('afterCutoff')).toBe(true);
    expect(component.form.invalid).toBe(true);
  });

  it('accepts the cutoff day itself', () => {
    const component = setup().componentInstance;
    component.form.patchValue({ consultant_id: 1, extra_point_reason_type_id: 1, points: 5, awarded_at: '2026-12-15' });
    expect(component.form.valid).toBe(true);
  });

  it('limits the date picker to the whole calendar', () => {
    const input = setup().nativeElement.querySelector('input[type=date]') as HTMLInputElement;
    expect([input.min, input.max]).toEqual(['2026-01-01', '2026-12-15']);
  });
});
