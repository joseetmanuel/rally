import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { CaptureCourseSessionComponent } from './capture-course-session.component';
import { CourseSessionService } from '@services/course-sessions/course-session.service';
import { ConsultantService } from '@services/consultants/consultant.service';
import { CertificationService } from '@services/certifications/certification.service';

describe('CaptureCourseSessionComponent', () => {
  let fixture: ComponentFixture<CaptureCourseSessionComponent>;
  let component: CaptureCourseSessionComponent;
  const dialogRef = { close: jest.fn() };
  const mainService = { createCourseSession: jest.fn().mockReturnValue(of({})), updateCourseSession: jest.fn().mockReturnValue(of({})) };

  async function setup(data: any = null) {
    await TestBed.configureTestingModule({
      imports: [CaptureCourseSessionComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: CourseSessionService, useValue: mainService },
        { provide: ConsultantService, useValue: { getConsultants: jest.fn().mockReturnValue(of([{"id": 2, "full_name": "Ana", "participant_type": "INTERNO", "team_id": 1}])) } },
        { provide: CertificationService, useValue: { getCertifications: jest.fn().mockReturnValue(of([{"id": 1, "vendor": "AWS", "name": "SAA", "certification_type_id": 1}])) } },
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(CaptureCourseSessionComponent);
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
    expect(mainService.createCourseSession).not.toHaveBeenCalled();
  });

  it('creates and closes the dialog with true when the form is valid', async () => {
    await setup();
    component.form.patchValue({"certification_id": 1, "instructor_consultant_id": 2, "session_date": "2026-10-01"});
    expect(component.form.valid).toBe(true);
    component.onSubmit();
    expect(mainService.createCourseSession).toHaveBeenCalledWith(expect.objectContaining({"certification_id": 1, "instructor_consultant_id": 2, "session_date": "2026-10-01"}));
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('does not close the dialog when the service fails', async () => {
    mainService.createCourseSession.mockReturnValueOnce(throwError(() => ({ error: { error: 'boom' } })));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await setup();
    component.form.patchValue({"certification_id": 1, "instructor_consultant_id": 2, "session_date": "2026-10-01"});
    component.onSubmit();
    expect(dialogRef.close).not.toHaveBeenCalledWith(true);
  });

  it('closes with false on cancel', async () => {
    await setup();
    component.onCancel();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('patches the form and updates when editing', async () => {
    await setup({"id": 8, "certification_id": 1, "instructor_consultant_id": 2, "session_date": "2026-10-01", "title": "Taller"});
    expect(component.isEditMode).toBe(true);
    component.form.patchValue({"title": "Taller 2"});
    component.onSubmit();
    expect(mainService.updateCourseSession).toHaveBeenCalledWith(8, expect.objectContaining({"title": "Taller 2"}));
    expect(mainService.createCourseSession).not.toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('loads consultants and certifications for the selectors', async () => {
    await setup();
    expect(component.consultants.length).toBe(1);
    expect(component.certifications.length).toBe(1);
  });
});
