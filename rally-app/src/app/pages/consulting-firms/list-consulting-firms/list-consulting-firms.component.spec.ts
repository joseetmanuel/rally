import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { ListConsultingFirmsComponent } from './list-consulting-firms.component';
import { ConsultingFirmService } from '../../../core/services/consulting-firms/consulting-firm.service';
import { ConfirmationService } from '../../../core/services/confirmation/confirmation.service';
import { provideAdminSession, createAdminSessionMock } from '../../../core/testing/admin-session.mock';
import { AdminSessionService } from '../../../core/services/admin-session/admin-session.service';

describe('ListConsultingFirmsComponent', () => {
  let fixture: ComponentFixture<ListConsultingFirmsComponent>;
  let component: ListConsultingFirmsComponent;
  const items = [{ id: 1, name: 'Alfa' }, { id: 2, name: 'Beta' }];
  const service = { getConsultingFirms: jest.fn(), deleteConsultingFirm: jest.fn() };
  const confirmation = { openDeleteConfirmation: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    service.getConsultingFirms.mockReturnValue(of(items));
    await TestBed.configureTestingModule({
      imports: [ListConsultingFirmsComponent, NoopAnimationsModule],
      providers: [
        provideAdminSession(true),
        { provide: ConsultingFirmService, useValue: service },
        { provide: ConfirmationService, useValue: confirmation }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ListConsultingFirmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the records on init', () => {
    expect(service.getConsultingFirms).toHaveBeenCalled();
    expect(component.consultingFirms).toEqual(items);
  });

  it('renders one table row per record', () => {
    expect(fixture.nativeElement.querySelectorAll('tr.mat-mdc-row').length).toBe(items.length);
    expect(fixture.nativeElement.querySelector('.empty-state')).toBeNull();
  });

  it('shows the empty state without records', () => {
    service.getConsultingFirms.mockReturnValue(of([]));
    component.ngOnInit();
    fixture.detectChanges();
    const empty = fixture.nativeElement.querySelector('.empty-state');
    expect(empty).not.toBeNull();
    expect(empty.textContent).toContain('No hay consultoras registradas.');
  });

  it('reloads after the capture dialog closes with a result', () => {
    const dialog = (component as any).dialog;
    jest.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(true) });
    component.openCaptureDialog();
    expect(dialog.open).toHaveBeenCalled();
    expect(service.getConsultingFirms).toHaveBeenCalledTimes(2);
  });

  it('does not reload when the dialog is dismissed', () => {
    const dialog = (component as any).dialog;
    jest.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(false) });
    component.openCaptureDialog(items[0]);
    expect(service.getConsultingFirms).toHaveBeenCalledTimes(1);
  });

  it('deletes after the user confirms and reloads the list', () => {
    confirmation.openDeleteConfirmation.mockReturnValue(of(true));
    service.deleteConsultingFirm.mockReturnValue(of(undefined));
    component.deleteConsultingFirm(items[0]);
    expect(service.deleteConsultingFirm).toHaveBeenCalledWith(1);
    expect(service.getConsultingFirms).toHaveBeenCalledTimes(2);
  });

  it('does not delete when the user cancels', () => {
    confirmation.openDeleteConfirmation.mockReturnValue(of(false));
    component.deleteConsultingFirm(items[0]);
    expect(service.deleteConsultingFirm).not.toHaveBeenCalled();
  });

  it('shows the backend error when the delete fails with 409', () => {
    const msg = 'Cannot delete: it is in use by consultants';
    confirmation.openDeleteConfirmation.mockReturnValue(of(true));
    service.deleteConsultingFirm.mockReturnValue(throwError(() => ({ status: 409, error: { error: msg } })));
    component.deleteConsultingFirm(items[0]);
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('p.error-message');
    expect(el).not.toBeNull();
    expect(el.textContent).toContain(msg);
    expect(service.getConsultingFirms).toHaveBeenCalledTimes(1);
  });

  it('uses a generic message when the error has no body and clears it on reload', () => {
    confirmation.openDeleteConfirmation.mockReturnValue(of(true));
    service.deleteConsultingFirm.mockReturnValue(throwError(() => ({ status: 0 })));
    component.deleteConsultingFirm(items[0]);
    expect(component.errorMessage).not.toBe('');
    component.loadConsultingFirms();
    expect(component.errorMessage).toBe('');
  });
});

// --- Perfil público vs administrador ---
describe('ListConsultingFirmsComponent según el perfil', () => {
  const items: any[] = [{ id: 1, name: "Alfa" }, { id: 2, name: "Beta" }];
  const svc0: any = { getConsultingFirms: jest.fn(), deleteConsultingFirm: jest.fn() };
  const confirmation = { openDeleteConfirmation: jest.fn() };
  let mock: ReturnType<typeof createAdminSessionMock>;
  let fixture: ComponentFixture<ListConsultingFirmsComponent>;
  let component: any;

  async function setup(isAdmin: boolean) {
    jest.clearAllMocks();
    svc0.getConsultingFirms.mockReturnValue(of(items));
    svc0.deleteConsultingFirm.mockReturnValue(of(undefined));
    mock = createAdminSessionMock(isAdmin);
    await TestBed.configureTestingModule({
      imports: [ListConsultingFirmsComponent, NoopAnimationsModule],
      providers: [
        { provide: AdminSessionService, useValue: mock },
        { provide: ConsultingFirmService, useValue: svc0 },
        { provide: ConfirmationService, useValue: confirmation }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ListConsultingFirmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const addButton = () => Array.from(el().querySelectorAll('button')).find(b => (b.textContent || '').includes('Nueva Consultora'));

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
      const loads = svc0.getConsultingFirms.mock.calls.length;
      component.openCaptureDialog();
      component.openCaptureDialog(items[0]);
      component.deleteConsultingFirm(items[0]);
      expect(open).not.toHaveBeenCalled();
      expect(confirmation.openDeleteConfirmation).not.toHaveBeenCalled();
      expect(svc0.deleteConsultingFirm).not.toHaveBeenCalled();
      expect(svc0.getConsultingFirms.mock.calls.length).toBe(loads);
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
