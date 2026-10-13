import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { CaptureConsultantComponent } from './capture-consultant.component';
import { ConsultantService } from '@services/consultants/consultant.service';
import { TeamService } from '@services/teams/team.service';
import { ConsultingFirmService } from '@services/consulting-firms/consulting-firm.service';
import { OrgStructureService } from '@services/org-structure/org-structure.service';

const SUBDIRECTIONS = [{ id: 10, name: 'Ingeniería de Software', head_name: 'Teodoro' }, { id: 11, name: 'Infraestructura', head_name: '' }];
const MANAGEMENTS = [
  { id: 100, name: 'Reingeniería de Software', head_name: 'José', subdirection_id: 10 },
  { id: 101, name: 'Desarrollo', head_name: 'Ana', subdirection_id: 10 },
  { id: 200, name: 'Redes', head_name: 'Luis', subdirection_id: 11 }
];
const LOC = { subdirection_id: 10, management_id: 100 };

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
        { provide: TeamService, useValue: { getTeams: jest.fn().mockReturnValue(of([{"id": 2, "name": "Elastic"}, {"id": 3, "name": "Call"}])) } },
        { provide: ConsultingFirmService, useValue: { getConsultingFirms: jest.fn().mockReturnValue(of([{"id": 7, "name": "Antal"}])) } },
        { provide: OrgStructureService, useValue: { getSubdirections: jest.fn().mockReturnValue(of(SUBDIRECTIONS)), getManagements: jest.fn().mockReturnValue(of(MANAGEMENTS)) } },
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
    component.form.patchValue({"full_name": "Ana", "participant_type": "INTERNO", "team_id": 2, ...LOC });
    expect(component.form.valid).toBe(true);
    component.onSubmit();
    expect(mainService.createConsultant).toHaveBeenCalledWith(expect.objectContaining({"full_name": "Ana", "participant_type": "INTERNO", "team_id": 2, "email": null, "consulting_firm_id": null, "teams_contact": null}));
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('does not close the dialog when the service fails', async () => {
    mainService.createConsultant.mockReturnValueOnce(throwError(() => ({ error: { error: 'boom' } })));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await setup();
    component.form.patchValue({"full_name": "Ana", "participant_type": "INTERNO", "team_id": 2, ...LOC });
    component.onSubmit();
    expect(dialogRef.close).not.toHaveBeenCalledWith(true);
  });

  it('closes with false on cancel', async () => {
    await setup();
    component.onCancel();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('patches the form and updates when editing', async () => {
    await setup({"id": 5, "full_name": "Ana", "participant_type": "INTERNO", "team_id": 2, "email": "a@x.com", "subdirection_id": 10, "management_id": 100});
    expect(component.isEditMode).toBe(true);
    component.form.patchValue({"full_name": "Ana Maria"});
    component.onSubmit();
    expect(mainService.updateConsultant).toHaveBeenCalledWith(5, expect.objectContaining({"full_name": "Ana Maria"}));
    expect(mainService.createConsultant).not.toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('loads the team and consulting firm catalogs for the selectors', async () => {
    await setup();
    expect(component.teams.map((t) => t.name)).toEqual(['Elastic', 'Call']);
    expect(component.consultingFirms.map((f) => f.name)).toEqual(['Antal']);
  });

  it('keeps the consulting firm only for external participants', async () => {
    await setup();
    component.form.patchValue({ full_name: 'Luis', participant_type: 'EXTERNO', team_id: 3, ...LOC, consulting_firm_id: 7 });
    component.onSubmit();
    expect(mainService.createConsultant).toHaveBeenCalledWith(expect.objectContaining({ consulting_firm_id: 7 }));
  });

  it('drops the consulting firm when the participant is internal', async () => {
    await setup();
    component.form.patchValue({ full_name: 'Luis', participant_type: 'INTERNO', team_id: 3, ...LOC, consulting_firm_id: 7 });
    component.onSubmit();
    expect(mainService.createConsultant).toHaveBeenCalledWith(expect.objectContaining({ consulting_firm_id: null }));
  });

  it('requires a team', async () => {
    await setup();
    component.form.patchValue({ full_name: 'Ana', participant_type: 'INTERNO', team_id: null });
    expect(component.form.get('team_id')?.hasError('required')).toBe(true);
    expect(component.form.invalid).toBe(true);
  });

  it('shows the backend error message and keeps the dialog open', async () => {
    mainService.createConsultant.mockReturnValueOnce(throwError(() => ({ error: { error: 'Email already exists' } })));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await setup();
    component.form.patchValue({ full_name: 'Ana', participant_type: 'INTERNO', team_id: 2, ...LOC });
    component.onSubmit();
    expect(component.errorMessage).toBe('Email already exists');
    expect(dialogRef.close).not.toHaveBeenCalledWith(true);
  });

  describe('ubicación en la estructura', () => {
    const base = { full_name: 'Ana', participant_type: 'INTERNO', team_id: 2 };

    it('loads the subdirection and management catalogs', async () => {
      await setup();
      expect(component.subdirections.length).toBe(2);
      expect(component.managements.length).toBe(3);
    });

    it('shows the unit name with its head in parentheses', async () => {
      await setup();
      expect(component.unitLabel(SUBDIRECTIONS[0] as any)).toBe('Ingeniería de Software (Teodoro)');
      expect(component.unitLabel(SUBDIRECTIONS[1] as any)).toBe('Infraestructura');
    });

    it('disables management until a subdirection is chosen', async () => {
      await setup();
      expect(component.form.get('management_id')?.disabled).toBe(true);
      component.form.patchValue({ subdirection_id: 10 });
      expect(component.form.get('management_id')?.enabled).toBe(true);
    });

    it('filters managements by the chosen subdirection', async () => {
      await setup();
      component.form.patchValue({ subdirection_id: 10 });
      expect(component.filteredManagements.map((m) => m.id)).toEqual([100, 101]);
      component.form.patchValue({ subdirection_id: 11 });
      expect(component.filteredManagements.map((m) => m.id)).toEqual([200]);
    });

    it('clears the management when the subdirection changes', async () => {
      await setup();
      component.form.patchValue({ subdirection_id: 10 });
      component.form.patchValue({ management_id: 100 });
      component.form.patchValue({ subdirection_id: 11 });
      expect(component.form.get('management_id')?.value).toBeNull();
    });

    it('requires subdirection and management', async () => {
      await setup();
      component.form.patchValue(base);
      expect(component.form.invalid).toBe(true);
      component.form.patchValue({ subdirection_id: 10 });
      expect(component.form.invalid).toBe(true);
      component.onSubmit();
      expect(mainService.createConsultant).not.toHaveBeenCalled();
      component.form.patchValue({ management_id: 100 });
      expect(component.form.valid).toBe(true);
    });

    it('sends management_id but not subdirection_id', async () => {
      await setup();
      component.form.patchValue({ ...base, ...LOC });
      component.onSubmit();
      const sent = mainService.createConsultant.mock.calls[0][0];
      expect(sent.management_id).toBe(100);
      expect('subdirection_id' in sent).toBe(false);
    });

    it('preselects subdirection and management when editing', async () => {
      await setup({ id: 5, ...base, email: null, subdirection_id: 11, management_id: 200 });
      expect(component.form.get('subdirection_id')?.value).toBe(11);
      expect(component.form.get('management_id')?.value).toBe(200);
      component.onSubmit();
      expect(mainService.updateConsultant).toHaveBeenCalledWith(5, expect.objectContaining({ management_id: 200 }));
    });

    it('requires a management for an existing participant without one', async () => {
      await setup({ id: 5, ...base, email: null, subdirection_id: 10, management_id: null });
      expect(component.form.get('subdirection_id')?.value).toBe(10);
      expect(component.form.get('management_id')?.value).toBeNull();
      expect(component.form.invalid).toBe(true);
      component.onSubmit();
      expect(mainService.updateConsultant).not.toHaveBeenCalled();
      component.form.patchValue({ management_id: 101 });
      component.onSubmit();
      expect(mainService.updateConsultant).toHaveBeenCalledWith(5, expect.objectContaining({ management_id: 101 }));
    });
  });
});
