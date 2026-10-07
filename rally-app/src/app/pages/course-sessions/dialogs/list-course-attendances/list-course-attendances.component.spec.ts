import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ListCourseAttendancesComponent } from './list-course-attendances.component';
import { CourseAttendanceService } from '@services/course-attendances/course-attendance.service';
import { ConfirmationService } from '@services/confirmation/confirmation.service';
import { provideAdminSession, createAdminSessionMock } from '../../../../core/testing/admin-session.mock';
import { AdminSessionService } from '../../../../core/services/admin-session/admin-session.service';

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
        provideAdminSession(true),
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

// --- Perfil público vs administrador ---
describe('ListCourseAttendancesComponent según el perfil', () => {
  const items: any[] = [{ id: 1, course_session_id: 9, consultant_id: 3, points_obtained: 8, consultant: { id: 3, full_name: "Luis" } }];
  const svc0: any = { getCourseAttendances: jest.fn(), deleteCourseAttendance: jest.fn() };
  const confirmation = { openDeleteConfirmation: jest.fn() };
  let mock: ReturnType<typeof createAdminSessionMock>;
  let fixture: ComponentFixture<ListCourseAttendancesComponent>;
  let component: any;

  async function setup(isAdmin: boolean) {
    jest.clearAllMocks();
    svc0.getCourseAttendances.mockReturnValue(of(items));
    svc0.deleteCourseAttendance.mockReturnValue(of(undefined));
    mock = createAdminSessionMock(isAdmin);
    await TestBed.configureTestingModule({
      imports: [ListCourseAttendancesComponent, NoopAnimationsModule],
      providers: [
        { provide: AdminSessionService, useValue: mock },
        { provide: MAT_DIALOG_DATA, useValue: { id: 9, title: "Taller" } },
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
        { provide: CourseAttendanceService, useValue: svc0 },
        { provide: ConfirmationService, useValue: confirmation }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ListCourseAttendancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const addButton = () => Array.from(el().querySelectorAll('button')).find(b => (b.textContent || '').includes('Registrar Asistente'));

  describe('perfil público', () => {
    beforeEach(() => setup(false));

    it('no muestra el botón de alta', () => {
      expect(addButton()).toBeUndefined();
    });

    it('no muestra botones de escritura', () => {
      expect(el().querySelector('button[title="Editar"]')).toBeNull();
      expect(el().querySelector('button[title="Eliminar"]')).toBeNull();
    });

    it('sigue mostrando los registros', () => {
      expect(el().querySelectorAll('tr.mat-mdc-row').length).toBe(items.length);
    });

    it('quita la columna de acciones', () => {
      expect(component.displayedColumns).not.toContain('actions');
      expect(el().querySelector('th.mat-column-actions')).toBeNull();
    });

    it('los métodos de escritura no abren diálogo ni llaman al servicio', () => {
      const open = jest.spyOn(component.dialog, 'open');
      const loads = svc0.getCourseAttendances.mock.calls.length;
      component.openCaptureDialog();
      component.deleteAttendance(items[0]);
      expect(open).not.toHaveBeenCalled();
      expect(confirmation.openDeleteConfirmation).not.toHaveBeenCalled();
      expect(svc0.deleteCourseAttendance).not.toHaveBeenCalled();
      expect(svc0.getCourseAttendances.mock.calls.length).toBe(loads);
    });

    it('al cambiar a administrador aparecen las acciones', () => {
      mock.setAdmin(true);
      fixture.detectChanges();
      expect(addButton()).toBeDefined();
      expect(el().querySelector('button[title="Eliminar"]')).not.toBeNull();
    });
  });

  describe('perfil administrador', () => {
    beforeEach(() => setup(true));

    it('muestra alta, edición y eliminación', () => {
      expect(addButton()).toBeDefined();
      expect(el().querySelector('button[title="Eliminar"]')).not.toBeNull();
      expect(el().querySelector('th.mat-column-actions')).not.toBeNull();
    });

    it('al volver al perfil público se ocultan las acciones', () => {
      mock.setAdmin(false);
      fixture.detectChanges();
      expect(addButton()).toBeUndefined();
      expect(el().querySelector('button[title="Eliminar"]')).toBeNull();
    });
  });
});
