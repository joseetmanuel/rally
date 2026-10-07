import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ListConsultantsComponent } from './list-consultants.component';
import { ConsultantService } from '@services/consultants/consultant.service';
import { ConfirmationService } from '@services/confirmation/confirmation.service';
import { provideAdminSession, createAdminSessionMock } from '../../../core/testing/admin-session.mock';
import { AdminSessionService } from '../../../core/services/admin-session/admin-session.service';

describe('ListConsultantsComponent', () => {
  let fixture: ComponentFixture<ListConsultantsComponent>;
  let component: ListConsultantsComponent;
  const items: any[] = [{"id": 1, "full_name": "Ana", "participant_type": "INTERNO", "team_id": 1, "email": "a@x.com", "team": {"id": 1, "name": "Elastic"}}, {"id": 2, "full_name": "Luis", "participant_type": "EXTERNO", "team_id": 2, "team": {"id": 2, "name": "Call"}, "consulting_firm_id": 3, "consulting_firm": {"id": 3, "name": "Antal"}}];
  const service = { getConsultants: jest.fn(), deleteConsultant: jest.fn() };
  const confirmation = { openDeleteConfirmation: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    service.getConsultants.mockReturnValue(of(items));
    await TestBed.configureTestingModule({
      imports: [ListConsultantsComponent, NoopAnimationsModule],
      providers: [
        provideAdminSession(true),
        { provide: ConsultantService, useValue: service },
        { provide: ConfirmationService, useValue: confirmation }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ListConsultantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the records on init', () => {
    expect(service.getConsultants).toHaveBeenCalled();
    expect(component.consultants).toEqual(items);
  });

  it('renders one table row per record', () => {
    expect(fixture.nativeElement.querySelectorAll('tr.mat-mdc-row').length).toBe(items.length);
    expect(fixture.nativeElement.querySelector('.empty-state')).toBeNull();
  });

  it('shows the empty state without records', () => {
    service.getConsultants.mockReturnValue(of([]));
    component.ngOnInit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.empty-state')).not.toBeNull();
  });

  it('reloads after the capture dialog closes with a result', () => {
    const dialog = (component as any).dialog;
    jest.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(true) });
    component.openCaptureDialog();
    expect(dialog.open).toHaveBeenCalled();
    expect(service.getConsultants).toHaveBeenCalledTimes(2);
  });

  it('does not reload when the dialog is dismissed', () => {
    const dialog = (component as any).dialog;
    jest.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(false) });
    component.openCaptureDialog();
    expect(service.getConsultants).toHaveBeenCalledTimes(1);
  });

  it('deletes after the user confirms and reloads the list', () => {
    confirmation.openDeleteConfirmation.mockReturnValue(of(true));
    service.deleteConsultant.mockReturnValue(of(undefined));
    component.deleteConsultant(items[0]);
    expect(service.deleteConsultant).toHaveBeenCalledWith(items[0].id);
    expect(service.getConsultants).toHaveBeenCalledTimes(2);
  });

  it('does not delete when the user cancels', () => {
    confirmation.openDeleteConfirmation.mockReturnValue(of(false));
    component.deleteConsultant(items[0]);
    expect(service.deleteConsultant).not.toHaveBeenCalled();
  });
});

// --- Perfil público vs administrador ---
describe('ListConsultantsComponent según el perfil', () => {
  const items: any[] = [{ id: 1, full_name: "Ana", participant_type: "INTERNO", email: "a@x.com", team: { id: 1, name: "Elastic" } }, { id: 2, full_name: "Luis", participant_type: "EXTERNO", team: null }];
  const svc0: any = { getConsultants: jest.fn(), deleteConsultant: jest.fn() };
  const confirmation = { openDeleteConfirmation: jest.fn() };
  let mock: ReturnType<typeof createAdminSessionMock>;
  let fixture: ComponentFixture<ListConsultantsComponent>;
  let component: any;

  async function setup(isAdmin: boolean) {
    jest.clearAllMocks();
    svc0.getConsultants.mockReturnValue(of(items));
    svc0.deleteConsultant.mockReturnValue(of(undefined));
    mock = createAdminSessionMock(isAdmin);
    await TestBed.configureTestingModule({
      imports: [ListConsultantsComponent, NoopAnimationsModule],
      providers: [
        { provide: AdminSessionService, useValue: mock },
        { provide: ConsultantService, useValue: svc0 },
        { provide: ConfirmationService, useValue: confirmation }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ListConsultantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const addButton = () => Array.from(el().querySelectorAll('button')).find(b => (b.textContent || '').includes('Nuevo Consultor'));

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

    it('conserva la columna de acciones con la acción de lectura "Ver Certificaciones"', () => {
      expect(el().querySelector('th.mat-column-actions')).not.toBeNull();
      expect(el().querySelector('button[title="Ver Certificaciones"]')).not.toBeNull();
    });

    it('no muestra la columna email', () => {
      expect(component.displayedColumns).not.toContain('email');
      expect(el().querySelector('th.mat-column-email')).toBeNull();
    });

    it('los métodos de escritura no abren diálogo ni llaman al servicio', () => {
      const open = jest.spyOn(component.dialog, 'open');
      const loads = svc0.getConsultants.mock.calls.length;
      component.openCaptureDialog();
      component.openCaptureDialog(items[0]);
      component.deleteConsultant(items[0]);
      expect(open).not.toHaveBeenCalled();
      expect(confirmation.openDeleteConfirmation).not.toHaveBeenCalled();
      expect(svc0.deleteConsultant).not.toHaveBeenCalled();
      expect(svc0.getConsultants.mock.calls.length).toBe(loads);
    });

    it('al cambiar a administrador aparecen las acciones', () => {
      mock.setAdmin(true);
      fixture.detectChanges();
      expect(addButton()).toBeDefined();
      expect(el().querySelector('button[title="Editar"]')).not.toBeNull();
      expect(el().querySelector('button[title="Eliminar"]')).not.toBeNull();
      expect(el().querySelector('th.mat-column-email')).not.toBeNull();
    });
  });

  describe('perfil administrador', () => {
    beforeEach(() => setup(true));

    it('muestra alta, edición y eliminación', () => {
      expect(addButton()).toBeDefined();
      expect(el().querySelector('button[title="Editar"]')).not.toBeNull();
      expect(el().querySelector('button[title="Eliminar"]')).not.toBeNull();
      expect(el().querySelector('th.mat-column-actions')).not.toBeNull();
      expect(el().querySelector('th.mat-column-email')).not.toBeNull();
    });

    it('al volver al perfil público se ocultan las acciones', () => {
      mock.setAdmin(false);
      fixture.detectChanges();
      expect(addButton()).toBeUndefined();
      expect(el().querySelector('button[title="Eliminar"]')).toBeNull();
    });
  });
});
