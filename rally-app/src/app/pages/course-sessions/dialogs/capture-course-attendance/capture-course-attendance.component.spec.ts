import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { CaptureCourseAttendanceComponent } from './capture-course-attendance.component';
import { CourseAttendanceService } from '@services/course-attendances/course-attendance.service';
import { ConsultantService } from '@services/consultants/consultant.service';

describe('CaptureCourseAttendanceComponent', () => {
  let fixture: ComponentFixture<CaptureCourseAttendanceComponent>;
  let component: CaptureCourseAttendanceComponent;
  const dialogRef = { close: jest.fn() };
  const session = { id: 9, certification_id: 1, instructor_consultant_id: 1, session_date: '2026-10-01' };
  const consultants = [
    { id: 1, full_name: 'Instructor', participant_type: 'INTERNO', team_number: 1 },
    { id: 2, full_name: 'Ya registrado', participant_type: 'INTERNO', team_number: 1 },
    { id: 3, full_name: 'Disponible', participant_type: 'INTERNO', team_number: 1 }
  ];
  const attendanceService = {
    getCourseAttendances: jest.fn(),
    createCourseAttendance: jest.fn()
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    attendanceService.getCourseAttendances.mockReturnValue(of([{ id: 1, course_session_id: 9, consultant_id: 2 }]));
    attendanceService.createCourseAttendance.mockReturnValue(of({}));
    await TestBed.configureTestingModule({
      imports: [CaptureCourseAttendanceComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: session },
        { provide: CourseAttendanceService, useValue: attendanceService },
        { provide: ConsultantService, useValue: { getConsultants: () => of(consultants) } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(CaptureCourseAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('excludes the instructor and consultants already registered', () => {
    expect(component.availableConsultants.map((c) => c.id)).toEqual([3]);
    expect(attendanceService.getCourseAttendances).toHaveBeenCalledWith(9);
  });

  it('requires a consultant', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('rejects a negative quiz score', () => {
    component.form.patchValue({ consultant_id: 3, points_obtained: -2 });
    expect(component.form.invalid).toBe(true);
  });

  it('creates the attendance for the session and closes with true', () => {
    component.form.patchValue({ consultant_id: 3, points_obtained: 8, notes: 'ok' });
    component.onSubmit();
    expect(attendanceService.createCourseAttendance).toHaveBeenCalledWith({
      course_session_id: 9, consultant_id: 3, points_obtained: 8, notes: 'ok'
    });
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('sends 0 when the quiz score is empty', () => {
    component.form.patchValue({ consultant_id: 3 });
    component.onSubmit();
    expect(attendanceService.createCourseAttendance).toHaveBeenCalledWith(
      expect.objectContaining({ points_obtained: 0 })
    );
  });

  it('shows the backend error and keeps the dialog open', () => {
    attendanceService.createCourseAttendance.mockReturnValue(
      throwError(() => ({ error: { error: 'This consultant is already registered for this session' } }))
    );
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    component.form.patchValue({ consultant_id: 3 });
    component.onSubmit();
    expect(component.errorMessage).toBe('This consultant is already registered for this session');
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('closes with false on cancel', () => {
    component.onCancel();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });
});
