import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ListCertificationTypesComponent } from './list-certification-types.component';
import { CertificationTypeService } from '@services/certification-types/certification-type.service';
import { ConfirmationService } from '@services/confirmation/confirmation.service';
import { provideAdminSession, createAdminSessionMock } from '../../../core/testing/admin-session.mock';
import { AdminSessionService } from '../../../core/services/admin-session/admin-session.service';

describe('ListCertificationTypesComponent', () => {
  let fixture: ComponentFixture<ListCertificationTypesComponent>;
  let component: ListCertificationTypesComponent;
  const items: any[] = [{"id": 1, "code": "FUNDACIONAL", "points_base": 10, "points_for_course": 5, "points_for_instructor": 1, "points_for_student": 2}, {"id": 2, "code": "PROFESIONAL", "points_base": 30, "points_for_course": 15, "points_for_instructor": 3, "points_for_student": 6}];
  const service = { getCertificationTypes: jest.fn(), deleteCertificationType: jest.fn() };
  const confirmation = { openDeleteConfirmation: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    service.getCertificationTypes.mockReturnValue(of(items));
    await TestBed.configureTestingModule({
      imports: [ListCertificationTypesComponent, NoopAnimationsModule],
      providers: [
        provideAdminSession(true),
        { provide: CertificationTypeService, useValue: service },
        { provide: ConfirmationService, useValue: confirmation }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ListCertificationTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the records on init', () => {
    expect(service.getCertificationTypes).toHaveBeenCalled();
    expect(component.certificationTypes).toEqual(items);
  });

  it('renders one table row per record', () => {
    expect(fixture.nativeElement.querySelectorAll('tr.mat-mdc-row').length).toBe(items.length);
    expect(fixture.nativeElement.querySelector('.empty-state')).toBeNull();
  });

  it('shows the empty state without records', () => {
    service.getCertificationTypes.mockReturnValue(of([]));
    component.ngOnInit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.empty-state')).not.toBeNull();
  });

  it('reloads after the capture dialog closes with a result', () => {
    const dialog = (component as any).dialog;
    jest.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(true) });
    component.openCaptureDialog();
    expect(dialog.open).toHaveBeenCalled();
    expect(service.getCertificationTypes).toHaveBeenCalledTimes(2);
  });

  it('does not reload when the dialog is dismissed', () => {
    const dialog = (component as any).dialog;
    jest.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(false) });
    component.openCaptureDialog();
    expect(service.getCertificationTypes).toHaveBeenCalledTimes(1);
  });

  it('deletes after the user confirms and reloads the list', () => {
    confirmation.openDeleteConfirmation.mockReturnValue(of(true));
    service.deleteCertificationType.mockReturnValue(of(undefined));
    component.deleteCertificationType(items[0]);
    expect(service.deleteCertificationType).toHaveBeenCalledWith(items[0].id);
    expect(service.getCertificationTypes).toHaveBeenCalledTimes(2);
  });

  it('does not delete when the user cancels', () => {
    confirmation.openDeleteConfirmation.mockReturnValue(of(false));
    component.deleteCertificationType(items[0]);
    expect(service.deleteCertificationType).not.toHaveBeenCalled();
  });
});

// --- Perfil público vs administrador ---
describe('ListCertificationTypesComponent según el perfil', () => {
  const items: any[] = [{ id: 1, code: "FUNDACIONAL", points_base: 10, points_for_course: 5, points_for_instructor: 1, points_for_student: 2 }];
  const svc0: any = { getCertificationTypes: jest.fn(), deleteCertificationType: jest.fn() };
  const confirmation = { openDeleteConfirmation: jest.fn() };
  let mock: ReturnType<typeof createAdminSessionMock>;
  let fixture: ComponentFixture<ListCertificationTypesComponent>;
  let component: any;

  async function setup(isAdmin: boolean) {
    jest.clearAllMocks();
    svc0.getCertificationTypes.mockReturnValue(of(items));
    svc0.deleteCertificationType.mockReturnValue(of(undefined));
    mock = createAdminSessionMock(isAdmin);
    await TestBed.configureTestingModule({
      imports: [ListCertificationTypesComponent, NoopAnimationsModule],
      providers: [
        { provide: AdminSessionService, useValue: mock },
        { provide: CertificationTypeService, useValue: svc0 },
        { provide: ConfirmationService, useValue: confirmation }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ListCertificationTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const addButton = () => Array.from(el().querySelectorAll('button')).find(b => (b.textContent || '').includes('Nuevo Tipo'));

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
      const loads = svc0.getCertificationTypes.mock.calls.length;
      component.openCaptureDialog();
      component.openCaptureDialog(items[0]);
      component.deleteCertificationType(items[0]);
      expect(open).not.toHaveBeenCalled();
      expect(confirmation.openDeleteConfirmation).not.toHaveBeenCalled();
      expect(svc0.deleteCertificationType).not.toHaveBeenCalled();
      expect(svc0.getCertificationTypes.mock.calls.length).toBe(loads);
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
