import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ListCourseSessionsComponent } from './list-course-sessions.component';
import { CourseSessionService } from '@services/course-sessions/course-session.service';
import { ConfirmationService } from '@services/confirmation/confirmation.service';

describe('ListCourseSessionsComponent', () => {
  let fixture: ComponentFixture<ListCourseSessionsComponent>;
  let component: ListCourseSessionsComponent;
  const items: any[] = [{"id": 1, "certification_id": 1, "instructor_consultant_id": 2, "session_date": "2026-10-01", "title": "Taller", "certification": {"id": 1, "vendor": "AWS", "name": "SAA"}, "instructor": {"id": 2, "full_name": "Ana"}}, {"id": 2, "certification_id": 1, "instructor_consultant_id": 3, "session_date": "2026-10-02"}];
  const service = { getCourseSessions: jest.fn(), deleteCourseSession: jest.fn() };
  const confirmation = { openDeleteConfirmation: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    service.getCourseSessions.mockReturnValue(of(items));
    await TestBed.configureTestingModule({
      imports: [ListCourseSessionsComponent, NoopAnimationsModule],
      providers: [
        { provide: CourseSessionService, useValue: service },
        { provide: ConfirmationService, useValue: confirmation }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ListCourseSessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the records on init', () => {
    expect(service.getCourseSessions).toHaveBeenCalled();
    expect(component.sessions).toEqual(items);
  });

  it('renders one table row per record', () => {
    expect(fixture.nativeElement.querySelectorAll('tr.mat-mdc-row').length).toBe(items.length);
    expect(fixture.nativeElement.querySelector('.empty-state')).toBeNull();
  });

  it('shows the empty state without records', () => {
    service.getCourseSessions.mockReturnValue(of([]));
    component.ngOnInit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.empty-state')).not.toBeNull();
  });

  it('reloads after the capture dialog closes with a result', () => {
    const dialog = (component as any).dialog;
    jest.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(true) });
    component.openCaptureDialog();
    expect(dialog.open).toHaveBeenCalled();
    expect(service.getCourseSessions).toHaveBeenCalledTimes(2);
  });

  it('does not reload when the dialog is dismissed', () => {
    const dialog = (component as any).dialog;
    jest.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(false) });
    component.openCaptureDialog();
    expect(service.getCourseSessions).toHaveBeenCalledTimes(1);
  });

  it('deletes after the user confirms and reloads the list', () => {
    confirmation.openDeleteConfirmation.mockReturnValue(of(true));
    service.deleteCourseSession.mockReturnValue(of(undefined));
    component.deleteSession(items[0]);
    expect(service.deleteCourseSession).toHaveBeenCalledWith(items[0].id);
    expect(service.getCourseSessions).toHaveBeenCalledTimes(2);
  });

  it('does not delete when the user cancels', () => {
    confirmation.openDeleteConfirmation.mockReturnValue(of(false));
    component.deleteSession(items[0]);
    expect(service.deleteCourseSession).not.toHaveBeenCalled();
  });
});
