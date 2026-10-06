import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { CaptureConsultantComponent } from './capture-consultant.component';
import { ConsultantService } from '@services/consultants/consultant.service';

describe('CaptureConsultantComponent', () => {
  let fixture: ComponentFixture<CaptureConsultantComponent>;
  let component: CaptureConsultantComponent;
  const dialogRef = { close: jest.fn() };
  const mainService = { createConsultant: jest.fn().mockReturnValue(of({})), updateConsultant: jest.fn().mockReturnValue(of({})) };

  async function setup(data: any = null) {
    await TestBed.configureTestingModule({
      imports: [CaptureConsultantComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: ConsultantService, useValue: mainService },
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(CaptureConsultantComponent);
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
    expect(mainService.createConsultant).not.toHaveBeenCalled();
  });

  it('creates and closes the dialog with true when the form is valid', async () => {
    await setup();
    component.form.patchValue({"full_name": "Ana", "participant_type": "INTERNO", "team_number": 2});
    expect(component.form.valid).toBe(true);
    component.onSubmit();
    expect(mainService.createConsultant).toHaveBeenCalledWith(expect.objectContaining({"full_name": "Ana", "participant_type": "INTERNO", "team_number": 2, "email": null, "consulting_firm_name": null, "teams_contact": null}));
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('does not close the dialog when the service fails', async () => {
    mainService.createConsultant.mockReturnValueOnce(throwError(() => ({ error: { error: 'boom' } })));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await setup();
    component.form.patchValue({"full_name": "Ana", "participant_type": "INTERNO", "team_number": 2});
    component.onSubmit();
    expect(dialogRef.close).not.toHaveBeenCalledWith(true);
  });

  it('closes with false on cancel', async () => {
    await setup();
    component.onCancel();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('patches the form and updates when editing', async () => {
    await setup({"id": 5, "full_name": "Ana", "participant_type": "INTERNO", "team_number": 2, "email": "a@x.com"});
    expect(component.isEditMode).toBe(true);
    component.form.patchValue({"full_name": "Ana Maria"});
    component.onSubmit();
    expect(mainService.updateConsultant).toHaveBeenCalledWith(5, expect.objectContaining({"full_name": "Ana Maria"}));
    expect(mainService.createConsultant).not.toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('keeps the firm name only for external participants', async () => {
    await setup();
    component.form.patchValue({ full_name: 'Luis', participant_type: 'EXTERNO', team_number: 1, consulting_firm_name: 'Firma X' });
    component.onSubmit();
    expect(mainService.createConsultant).toHaveBeenCalledWith(expect.objectContaining({ consulting_firm_name: 'Firma X' }));
  });

  it('rejects a team number below 1', async () => {
    await setup();
    component.form.patchValue({ full_name: 'Ana', team_number: 0 });
    expect(component.form.get('team_number')?.invalid).toBe(true);
  });
});
