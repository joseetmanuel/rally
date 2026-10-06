import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { CaptureCertificationTypeComponent } from './capture-certification-type.component';
import { CertificationTypeService } from '@services/certification-types/certification-type.service';

describe('CaptureCertificationTypeComponent', () => {
  let fixture: ComponentFixture<CaptureCertificationTypeComponent>;
  let component: CaptureCertificationTypeComponent;
  const dialogRef = { close: jest.fn() };
  const mainService = { createCertificationType: jest.fn().mockReturnValue(of({})), updateCertificationType: jest.fn().mockReturnValue(of({})) };

  async function setup(data: any = null) {
    await TestBed.configureTestingModule({
      imports: [CaptureCertificationTypeComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: CertificationTypeService, useValue: mainService },
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(CaptureCertificationTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => jest.clearAllMocks());

  it('should create', async () => {
    await setup();
    expect(component).toBeTruthy();
  });

  it('is invalid when the required fields are empty', async () => {
    await setup();
    component.form.reset();
    expect(component.form.invalid).toBe(true);
    component.onSubmit();
    expect(mainService.createCertificationType).not.toHaveBeenCalled();
  });

  it('creates and closes the dialog with true when the form is valid', async () => {
    await setup();
    component.form.patchValue({"code": "EXPERTO", "points_base": 60, "points_for_course": 30, "points_for_instructor": 6, "points_for_student": 12});
    expect(component.form.valid).toBe(true);
    component.onSubmit();
    expect(mainService.createCertificationType).toHaveBeenCalledWith(expect.objectContaining({"code": "EXPERTO", "points_base": 60, "points_for_course": 30, "points_for_instructor": 6, "points_for_student": 12}));
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('does not close the dialog when the service fails', async () => {
    mainService.createCertificationType.mockReturnValueOnce(throwError(() => ({ error: { error: 'boom' } })));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await setup();
    component.form.patchValue({"code": "EXPERTO", "points_base": 60, "points_for_course": 30, "points_for_instructor": 6, "points_for_student": 12});
    component.onSubmit();
    expect(dialogRef.close).not.toHaveBeenCalledWith(true);
  });

  it('closes with false on cancel', async () => {
    await setup();
    component.onCancel();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('patches the form and updates when editing', async () => {
    await setup({"id": 3, "code": "EXPERTO", "points_base": 60, "points_for_course": 30, "points_for_instructor": 6, "points_for_student": 12});
    expect(component.isEditMode).toBe(true);
    component.form.patchValue({"points_base": 65});
    component.onSubmit();
    expect(mainService.updateCertificationType).toHaveBeenCalledWith(3, expect.objectContaining({"points_base": 65}));
    expect(mainService.createCertificationType).not.toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('rejects negative points', async () => {
    await setup();
    component.form.patchValue({ code: 'X', points_base: -1, points_for_course: 0, points_for_instructor: 0, points_for_student: 0 });
    expect(component.form.invalid).toBe(true);
  });
});
