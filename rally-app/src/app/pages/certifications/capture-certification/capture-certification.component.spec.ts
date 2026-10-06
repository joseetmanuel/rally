import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { CaptureCertificationComponent } from './capture-certification.component';
import { CertificationService } from '@services/certifications/certification.service';
import { CertificationTypeService } from '@services/certification-types/certification-type.service';

describe('CaptureCertificationComponent', () => {
  let fixture: ComponentFixture<CaptureCertificationComponent>;
  let component: CaptureCertificationComponent;
  const dialogRef = { close: jest.fn() };
  const mainService = { createCertification: jest.fn().mockReturnValue(of({})), updateCertification: jest.fn().mockReturnValue(of({})) };

  async function setup(data: any = null) {
    await TestBed.configureTestingModule({
      imports: [CaptureCertificationComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: CertificationService, useValue: mainService },
        { provide: CertificationTypeService, useValue: { getCertificationTypes: jest.fn().mockReturnValue(of([{"id": 1, "code": "FUNDACIONAL", "points_base": 10, "points_for_course": 5, "points_for_instructor": 1, "points_for_student": 2}])) } },
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(CaptureCertificationComponent);
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
    expect(mainService.createCertification).not.toHaveBeenCalled();
  });

  it('creates and closes the dialog with true when the form is valid', async () => {
    await setup();
    component.form.patchValue({"vendor": "AWS", "name": "SAA", "certification_type_id": 1});
    expect(component.form.valid).toBe(true);
    component.onSubmit();
    expect(mainService.createCertification).toHaveBeenCalledWith(expect.objectContaining({"vendor": "AWS", "name": "SAA", "certification_type_id": 1}));
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('does not close the dialog when the service fails', async () => {
    mainService.createCertification.mockReturnValueOnce(throwError(() => ({ error: { error: 'boom' } })));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await setup();
    component.form.patchValue({"vendor": "AWS", "name": "SAA", "certification_type_id": 1});
    component.onSubmit();
    expect(dialogRef.close).not.toHaveBeenCalledWith(true);
  });

  it('closes with false on cancel', async () => {
    await setup();
    component.onCancel();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('patches the form and updates when editing', async () => {
    await setup({"id": 4, "vendor": "AWS", "name": "SAA", "certification_type_id": 1});
    expect(component.isEditMode).toBe(true);
    component.form.patchValue({"name": "SAA-C03"});
    component.onSubmit();
    expect(mainService.updateCertification).toHaveBeenCalledWith(4, expect.objectContaining({"name": "SAA-C03"}));
    expect(mainService.createCertification).not.toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('loads the certification types for the selector', async () => {
    await setup();
    expect(component.certificationTypes.length).toBe(1);
  });
});
