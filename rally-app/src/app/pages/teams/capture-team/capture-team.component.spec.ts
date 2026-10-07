import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { CaptureTeamComponent } from './capture-team.component';
import { TeamService } from '../../../core/services/teams/team.service';

describe('CaptureTeamComponent', () => {
  let fixture: ComponentFixture<CaptureTeamComponent>;
  let component: CaptureTeamComponent;
  const dialogRef = { close: jest.fn() };
  const mainService = { createTeam: jest.fn(), updateTeam: jest.fn() };

  async function setup(data: any = null) {
    await TestBed.configureTestingModule({
      imports: [CaptureTeamComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: TeamService, useValue: mainService },
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(CaptureTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mainService.createTeam.mockReturnValue(of({}));
    mainService.updateTeam.mockReturnValue(of({}));
  });

  it('should create', async () => {
    await setup();
    expect(component).toBeTruthy();
  });

  it('is invalid when the name is empty', async () => {
    await setup();
    expect(component.form.invalid).toBe(true);
    component.onSubmit();
    expect(mainService.createTeam).not.toHaveBeenCalled();
  });

  it('is invalid when the name has only spaces', async () => {
    await setup();
    component.form.patchValue({ name: '   ' });
    expect(component.form.invalid).toBe(true);
    component.onSubmit();
    expect(mainService.createTeam).not.toHaveBeenCalled();
  });

  it('creates with a trimmed name and closes with true', async () => {
    await setup();
    component.form.patchValue({ name: '  Alfa  ' });
    expect(component.form.valid).toBe(true);
    component.onSubmit();
    expect(mainService.createTeam).toHaveBeenCalledWith({ name: 'Alfa' });
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('shows the backend error and does not close on failure', async () => {
    mainService.createTeam.mockReturnValue(throwError(() => ({ status: 409, error: { error: 'Name already exists' } })));
    await setup();
    component.form.patchValue({ name: 'Alfa' });
    component.onSubmit();
    fixture.detectChanges();
    expect(dialogRef.close).not.toHaveBeenCalled();
    const el = fixture.nativeElement.querySelector('p.error-message');
    expect(el).not.toBeNull();
    expect(el.textContent).toContain('Name already exists');
  });

  it('uses a generic message when the error has no body', async () => {
    mainService.createTeam.mockReturnValue(throwError(() => ({ status: 0 })));
    await setup();
    component.form.patchValue({ name: 'Alfa' });
    component.onSubmit();
    expect(component.errorMessage).not.toBe('');
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('closes with false on cancel', async () => {
    await setup();
    component.onCancel();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('patches the form and updates when editing', async () => {
    await setup({ id: 5, name: 'Alfa' });
    expect(component.isEditMode).toBe(true);
    expect(component.form.value.name).toBe('Alfa');
    component.form.patchValue({ name: 'Alfa 2' });
    component.onSubmit();
    expect(mainService.updateTeam).toHaveBeenCalledWith(5, { name: 'Alfa 2' });
    expect(mainService.createTeam).not.toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('shows the backend error when updating fails', async () => {
    mainService.updateTeam.mockReturnValue(throwError(() => ({ status: 409, error: { error: 'Name already exists' } })));
    await setup({ id: 5, name: 'Alfa' });
    component.onSubmit();
    expect(component.errorMessage).toBe('Name already exists');
    expect(dialogRef.close).not.toHaveBeenCalled();
  });
});
