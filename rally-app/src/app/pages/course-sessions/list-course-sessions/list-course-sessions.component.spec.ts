import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ListCourseSessionsComponent } from './list-course-sessions.component';
import { CourseSessionService } from '@services/course-sessions/course-session.service';
import { ConfirmationService } from '@services/confirmation/confirmation.service';
import { provideAdminSession, createAdminSessionMock } from '../../../core/testing/admin-session.mock';
import { AdminSessionService } from '../../../core/services/admin-session/admin-session.service';

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
        provideAdminSession(true),
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

// --- Perfil público vs administrador ---
describe('ListCourseSessionsComponent según el perfil', () => {
  const items: any[] = [{ id: 1, certification_id: 1, instructor_consultant_id: 2, session_date: "2026-10-01", title: "Taller", certification: { id: 1, vendor: "AWS", name: "SAA" }, instructor: { id: 2, full_name: "Ana" } }];
  const svc0: any = { getCourseSessions: jest.fn(), deleteCourseSession: jest.fn() };
  const confirmation = { openDeleteConfirmation: jest.fn() };
  let mock: ReturnType<typeof createAdminSessionMock>;
  let fixture: ComponentFixture<ListCourseSessionsComponent>;
  let component: any;

  async function setup(isAdmin: boolean) {
    jest.clearAllMocks();
    svc0.getCourseSessions.mockReturnValue(of(items));
    svc0.deleteCourseSession.mockReturnValue(of(undefined));
    mock = createAdminSessionMock(isAdmin);
    await TestBed.configureTestingModule({
      imports: [ListCourseSessionsComponent, NoopAnimationsModule],
      providers: [
        { provide: AdminSessionService, useValue: mock },
        { provide: CourseSessionService, useValue: svc0 },
        { provide: ConfirmationService, useValue: confirmation }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ListCourseSessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const addButton = () => Array.from(el().querySelectorAll('button')).find(b => (b.textContent || '').includes('Nueva Sesión'));

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

    it('conserva la columna de acciones con la acción de lectura "Lista de Asistencia"', () => {
      expect(el().querySelector('th.mat-column-actions')).not.toBeNull();
      expect(el().querySelector('button[title="Lista de Asistencia"]')).not.toBeNull();
    });

    it('los métodos de escritura no abren diálogo ni llaman al servicio', () => {
      const open = jest.spyOn(component.dialog, 'open');
      const loads = svc0.getCourseSessions.mock.calls.length;
      component.openCaptureDialog();
      component.openCaptureDialog(items[0]);
      component.deleteSession(items[0]);
      expect(open).not.toHaveBeenCalled();
      expect(confirmation.openDeleteConfirmation).not.toHaveBeenCalled();
      expect(svc0.deleteCourseSession).not.toHaveBeenCalled();
      expect(svc0.getCourseSessions.mock.calls.length).toBe(loads);
    });

    it('al cambiar a administrador aparecen las acciones', () => {
      mock.setAdmin(true);
      fixture.detectChanges();
      expect(addButton()).toBeDefined();
      expect(el().querySelector('button[title="Editar"]')).not.toBeNull();
      expect(el().querySelector('button[title="Eliminar"]')).not.toBeNull();
    });
  });

  describe('perfil administrador', () => {
    beforeEach(() => setup(true));

    it('muestra alta, edición y eliminación', () => {
      expect(addButton()).toBeDefined();
      expect(el().querySelector('button[title="Editar"]')).not.toBeNull();
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
