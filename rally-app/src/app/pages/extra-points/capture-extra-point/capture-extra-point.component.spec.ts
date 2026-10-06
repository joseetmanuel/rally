import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { CaptureExtraPointComponent } from './capture-extra-point.component';
import { ConsultantExtraPointService } from '../../../core/services/consultant-extra-points/consultant-extra-point.service';
import { ConsultantService } from '../../../core/services/consultants/consultant.service';
import { ExtraPointReasonTypeService } from '../../../core/services/extra-point-reason-types/extra-point-reason-type.service';

describe('CaptureExtraPointComponent', () => {
  let component: CaptureExtraPointComponent;
  let fixture: ComponentFixture<CaptureExtraPointComponent>;
  const dialogRef = { close: jest.fn() };
  const extraPointService = { createExtraPoint: jest.fn() };

  beforeEach(async () => {
    dialogRef.close.mockClear();
    extraPointService.createExtraPoint.mockReset();

    await TestBed.configureTestingModule({
      imports: [CaptureExtraPointComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: ConsultantExtraPointService, useValue: extraPointService },
        { provide: ConsultantService, useValue: { getConsultants: () => of([{ id: 1, full_name: 'Ana' }]) } },
        { provide: ExtraPointReasonTypeService, useValue: { getReasonTypes: () => of([{ id: 2, code: 'X', name: 'Motivo' }]) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CaptureExtraPointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load select data', () => {
    expect(component).toBeTruthy();
    expect(component.consultants.length).toBe(1);
    expect(component.reasonTypes.length).toBe(1);
  });

  it('should be invalid when empty and default date is today', () => {
    expect(component.form.valid).toBe(false);
    expect(component.form.value.awarded_at).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should reject negative points', () => {
    component.form.patchValue({ consultant_id: 1, extra_point_reason_type_id: 2, points: -1 });
    expect(component.form.valid).toBe(false);
  });

  it('should be valid with data and call the service on submit', () => {
    extraPointService.createExtraPoint.mockReturnValue(of({}));
    component.form.patchValue({ consultant_id: 1, extra_point_reason_type_id: 2, points: 5, awarded_at: '2026-03-01' });
    expect(component.form.valid).toBe(true);
    component.onSubmit();
    expect(extraPointService.createExtraPoint).toHaveBeenCalledWith({
      consultant_id: 1,
      extra_point_reason_type_id: 2,
      points: 5,
      awarded_at: '2026-03-01'
    });
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should show backend error message', () => {
    extraPointService.createExtraPoint.mockReturnValue(throwError(() => ({ error: { error: 'Motivo inválido' } })));
    component.form.patchValue({ consultant_id: 1, extra_point_reason_type_id: 2, points: 5 });
    component.onSubmit();
    expect(component.errorMessage).toBe('Motivo inválido');
    expect(dialogRef.close).not.toHaveBeenCalled();
  });
});
