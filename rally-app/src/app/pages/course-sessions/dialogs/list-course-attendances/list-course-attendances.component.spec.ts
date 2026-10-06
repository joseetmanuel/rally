import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ListCourseAttendancesComponent } from './list-course-attendances.component';
import { CourseAttendanceService } from '@services/course-attendances/course-attendance.service';
import { ConfirmationService } from '@services/confirmation/confirmation.service';

describe('ListCourseAttendancesComponent', () => {
  let fixture: ComponentFixture<ListCourseAttendancesComponent>;
  let component: ListCourseAttendancesComponent;
  const items: any[] = [{"id": 1, "course_session_id": 9, "consultant_id": 3, "points_obtained": 8, "consultant": {"id": 3, "full_name": "Luis"}}, {"id": 2, "course_session_id": 9, "consultant_id": 4, "points_obtained": 0}];
  const service = { getCourseAttendances: jest.fn(), deleteCourseAttendance: jest.fn() };
  const confirmation = { openDeleteConfirmation: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    service.getCourseAttendances.mockReturnValue(of(items));
    await TestBed.configureTestingModule({
      imports: [ListCourseAttendancesComponent, NoopAnimationsModule],
      providers: [
      { provide: MAT_DIALOG_DATA, useValue: {"id": 9, "certification_id": 1, "instructor_consultant_id": 2, "session_date": "2026-10-01"} },
      { provide: MatDialogRef, useValue: { close: jest.fn() } },
        { provide: CourseAttendanceService, useValue: service },
        { provide: ConfirmationService, useValue: confirmation }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ListCourseAttendancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the records on init', () => {
    expect(service.getCourseAttendances).toHaveBeenCalledWith(9);
    expect(component.attendances).toEqual(items);
  });

  it('renders one table row per record', () => {
    expect(fixture.nativeElement.querySelectorAll('tr.mat-mdc-row').length).toBe(items.length);
    expect(fixture.nativeElement.querySelector('.empty-state')).toBeNull();
  });

  it('shows the empty state without records', () => {
    service.getCourseAttendances.mockReturnValue(of([]));
    component.ngOnInit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.empty-state')).not.toBeNull();
  });

  it('reloads after the capture dialog closes with a result', () => {
    const dialog = (component as any).dialog;
    jest.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(true) });
    component.openCaptureDialog();
    expect(dialog.open).toHaveBeenCalled();
    expect(service.getCourseAttendances).toHaveBeenCalledTimes(2);
  });

  it('does not reload when the dialog is dismissed', () => {
    const dialog = (component as any).dialog;
    jest.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(false) });
    component.openCaptureDialog();
    expect(service.getCourseAttendances).toHaveBeenCalledTimes(1);
  });

  it('deletes after the user confirms and reloads the list', () => {
    confirmation.openDeleteConfirmation.mockReturnValue(of(true));
    service.deleteCourseAttendance.mockReturnValue(of(undefined));
    component.deleteAttendance(items[0]);
    expect(service.deleteCourseAttendance).toHaveBeenCalledWith(items[0].id);
    expect(service.getCourseAttendances).toHaveBeenCalledTimes(2);
  });

  it('does not delete when the user cancels', () => {
    confirmation.openDeleteConfirmation.mockReturnValue(of(false));
    component.deleteAttendance(items[0]);
    expect(service.deleteCourseAttendance).not.toHaveBeenCalled();
  });
});
