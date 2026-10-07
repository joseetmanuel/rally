import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { CaptureConsultantCertificationComponent } from './capture-consultant-certification.component';
import { ConsultantCertificationService } from '@services/consultant-certifications/consultant-certification.service';
import { CertificationService } from '@services/certifications/certification.service';

describe('CaptureConsultantCertificationComponent', () => {
  let fixture: ComponentFixture<CaptureConsultantCertificationComponent>;
  let component: CaptureConsultantCertificationComponent;
  const dialogRef = { close: jest.fn() };
  const mainService = { createConsultantCertification: jest.fn().mockReturnValue(of({})) };

  async function setup(data: any = { id: 5, full_name: 'Ana', participant_type: 'INTERNO', team_id: 1 }) {
    await TestBed.configureTestingModule({
      imports: [CaptureConsultantCertificationComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: ConsultantCertificationService, useValue: mainService },
        { provide: CertificationService, useValue: { getCertifications: jest.fn().mockReturnValue(of([{"id": 1, "vendor": "AWS", "name": "SAA", "certification_type_id": 1}])) } },
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(CaptureConsultantCertificationComponent);
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
    expect(mainService.createConsultantCertification).not.toHaveBeenCalled();
  });

  it('creates and closes the dialog with true when the form is valid', async () => {
    await setup();
    component.form.patchValue({"certification_id": 1, "obtained_at": "2026-03-01"});
    expect(component.form.valid).toBe(true);
    component.onSubmit();
    expect(mainService.createConsultantCertification).toHaveBeenCalledWith(expect.objectContaining({"certification_id": 1, "obtained_at": "2026-03-01", "consultant_id": 5}));
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('does not close the dialog when the service fails', async () => {
    mainService.createConsultantCertification.mockReturnValueOnce(throwError(() => ({ error: { error: 'boom' } })));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await setup();
    component.form.patchValue({"certification_id": 1, "obtained_at": "2026-03-01"});
    component.onSubmit();
    expect(dialogRef.close).not.toHaveBeenCalledWith(true);
  });

  it('closes with false on cancel', async () => {
    await setup();
    component.onCancel();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });
});
