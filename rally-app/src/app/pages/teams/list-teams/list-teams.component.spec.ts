import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { ListTeamsComponent } from './list-teams.component';
import { TeamService } from '../../../core/services/teams/team.service';
import { ConfirmationService } from '../../../core/services/confirmation/confirmation.service';
import { provideAdminSession, createAdminSessionMock } from '../../../core/testing/admin-session.mock';
import { AdminSessionService } from '../../../core/services/admin-session/admin-session.service';

describe('ListTeamsComponent', () => {
  let fixture: ComponentFixture<ListTeamsComponent>;
  let component: ListTeamsComponent;
  const items = [{ id: 1, name: 'Alfa' }, { id: 2, name: 'Beta' }];
  const service = { getTeams: jest.fn(), deleteTeam: jest.fn() };
  const confirmation = { openDeleteConfirmation: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    service.getTeams.mockReturnValue(of(items));
    await TestBed.configureTestingModule({
      imports: [ListTeamsComponent, NoopAnimationsModule],
      providers: [
        provideAdminSession(true),
        { provide: TeamService, useValue: service },
        { provide: ConfirmationService, useValue: confirmation }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ListTeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the records on init', () => {
    expect(service.getTeams).toHaveBeenCalled();
    expect(component.teams).toEqual(items);
  });

  it('renders one table row per record', () => {
    expect(fixture.nativeElement.querySelectorAll('tr.mat-mdc-row').length).toBe(items.length);
    expect(fixture.nativeElement.querySelector('.empty-state')).toBeNull();
  });

  it('shows the empty state without records', () => {
    service.getTeams.mockReturnValue(of([]));
    component.ngOnInit();
    fixture.detectChanges();
    const empty = fixture.nativeElement.querySelector('.empty-state');
    expect(empty).not.toBeNull();
    expect(empty.textContent).toContain('No hay equipos registrados.');
  });

  it('reloads after the capture dialog closes with a result', () => {
    const dialog = (component as any).dialog;
    jest.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(true) });
    component.openCaptureDialog();
    expect(dialog.open).toHaveBeenCalled();
    expect(service.getTeams).toHaveBeenCalledTimes(2);
  });

  it('does not reload when the dialog is dismissed', () => {
    const dialog = (component as any).dialog;
    jest.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(false) });
    component.openCaptureDialog(items[0]);
    expect(service.getTeams).toHaveBeenCalledTimes(1);
  });

  it('deletes after the user confirms and reloads the list', () => {
    confirmation.openDeleteConfirmation.mockReturnValue(of(true));
    service.deleteTeam.mockReturnValue(of(undefined));
    component.deleteTeam(items[0]);
    expect(service.deleteTeam).toHaveBeenCalledWith(1);
    expect(service.getTeams).toHaveBeenCalledTimes(2);
  });

  it('does not delete when the user cancels', () => {
    confirmation.openDeleteConfirmation.mockReturnValue(of(false));
    component.deleteTeam(items[0]);
    expect(service.deleteTeam).not.toHaveBeenCalled();
  });

  it('shows the backend error when the delete fails with 409', () => {
    const msg = 'Cannot delete: it is in use by consultants';
    confirmation.openDeleteConfirmation.mockReturnValue(of(true));
    service.deleteTeam.mockReturnValue(throwError(() => ({ status: 409, error: { error: msg } })));
    component.deleteTeam(items[0]);
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('p.error-message');
    expect(el).not.toBeNull();
    expect(el.textContent).toContain(msg);
    expect(service.getTeams).toHaveBeenCalledTimes(1);
  });

  it('uses a generic message when the error has no body and clears it on reload', () => {
    confirmation.openDeleteConfirmation.mockReturnValue(of(true));
    service.deleteTeam.mockReturnValue(throwError(() => ({ status: 0 })));
    component.deleteTeam(items[0]);
    expect(component.errorMessage).not.toBe('');
    component.loadTeams();
    expect(component.errorMessage).toBe('');
  });
});

// --- Perfil público vs administrador ---
describe('ListTeamsComponent según el perfil', () => {
  const items: any[] = [{ id: 1, name: "Alfa" }, { id: 2, name: "Beta" }];
  const svc0: any = { getTeams: jest.fn(), deleteTeam: jest.fn() };
  const confirmation = { openDeleteConfirmation: jest.fn() };
  let mock: ReturnType<typeof createAdminSessionMock>;
  let fixture: ComponentFixture<ListTeamsComponent>;
  let component: any;

  async function setup(isAdmin: boolean) {
    jest.clearAllMocks();
    svc0.getTeams.mockReturnValue(of(items));
    svc0.deleteTeam.mockReturnValue(of(undefined));
    mock = createAdminSessionMock(isAdmin);
    await TestBed.configureTestingModule({
      imports: [ListTeamsComponent, NoopAnimationsModule],
      providers: [
        { provide: AdminSessionService, useValue: mock },
        { provide: TeamService, useValue: svc0 },
        { provide: ConfirmationService, useValue: confirmation }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ListTeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const addButton = () => Array.from(el().querySelectorAll('button')).find(b => (b.textContent || '').includes('Nuevo Equipo'));

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
      const loads = svc0.getTeams.mock.calls.length;
      component.openCaptureDialog();
      component.openCaptureDialog(items[0]);
      component.deleteTeam(items[0]);
      expect(open).not.toHaveBeenCalled();
      expect(confirmation.openDeleteConfirmation).not.toHaveBeenCalled();
      expect(svc0.deleteTeam).not.toHaveBeenCalled();
      expect(svc0.getTeams.mock.calls.length).toBe(loads);
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
