import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ListConsultantCertificationsComponent } from './list-consultant-certifications.component';
import { ConsultantCertificationService } from '@services/consultant-certifications/consultant-certification.service';
import { ConfirmationService } from '@services/confirmation/confirmation.service';
import { provideAdminSession, createAdminSessionMock } from '../../../../core/testing/admin-session.mock';
import { AdminSessionService } from '../../../../core/services/admin-session/admin-session.service';

describe('ListConsultantCertificationsComponent', () => {
  let fixture: ComponentFixture<ListConsultantCertificationsComponent>;
  let component: ListConsultantCertificationsComponent;
  const items: any[] = [{"id": 1, "consultant_id": 5, "certification_id": 1, "obtained_at": "2026-01-01", "paid_with_own_resources": true, "certification": {"id": 1, "vendor": "AWS", "name": "SAA"}}, {"id": 2, "consultant_id": 5, "certification_id": 2, "obtained_at": "2026-02-01", "paid_with_own_resources": false}];
  const service = { getConsultantCertifications: jest.fn() };
  const confirmation = { openDeleteConfirmation: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    service.getConsultantCertifications.mockReturnValue(of(items));
    await TestBed.configureTestingModule({
      imports: [ListConsultantCertificationsComponent, NoopAnimationsModule],
      providers: [
        provideAdminSession(true),
      { provide: MAT_DIALOG_DATA, useValue: {"id": 5, "full_name": "Ana", "participant_type": "INTERNO", "team_id": 1} },
      { provide: MatDialogRef, useValue: { close: jest.fn() } },
        { provide: ConsultantCertificationService, useValue: service },
        { provide: ConfirmationService, useValue: confirmation }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ListConsultantCertificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the records on init', () => {
    expect(service.getConsultantCertifications).toHaveBeenCalledWith(5);
    expect(component.certifications).toEqual(items);
  });

  it('renders one table row per record', () => {
    expect(fixture.nativeElement.querySelectorAll('tr.mat-mdc-row').length).toBe(items.length);
    expect(fixture.nativeElement.querySelector('.empty-state')).toBeNull();
  });

  it('shows the empty state without records', () => {
    service.getConsultantCertifications.mockReturnValue(of([]));
    component.ngOnInit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.empty-state')).not.toBeNull();
  });

  it('reloads after the capture dialog closes with a result', () => {
    const dialog = (component as any).dialog;
    jest.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(true) });
    component.openCaptureDialog();
    expect(dialog.open).toHaveBeenCalled();
    expect(service.getConsultantCertifications).toHaveBeenCalledTimes(2);
  });

  it('does not reload when the dialog is dismissed', () => {
    const dialog = (component as any).dialog;
    jest.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(false) });
    component.openCaptureDialog();
    expect(service.getConsultantCertifications).toHaveBeenCalledTimes(1);
  });
});

// --- Perfil público vs administrador ---
describe('ListConsultantCertificationsComponent según el perfil', () => {
  const items: any[] = [{ id: 1, consultant_id: 5, certification_id: 1, obtained_at: "2026-01-01", paid_with_own_resources: true, certification: { id: 1, vendor: "AWS", name: "SAA" } }];
  const svc0: any = { getConsultantCertifications: jest.fn() };
  const confirmation = { openDeleteConfirmation: jest.fn() };
  let mock: ReturnType<typeof createAdminSessionMock>;
  let fixture: ComponentFixture<ListConsultantCertificationsComponent>;
  let component: any;

  async function setup(isAdmin: boolean) {
    jest.clearAllMocks();
    svc0.getConsultantCertifications.mockReturnValue(of(items));
    mock = createAdminSessionMock(isAdmin);
    await TestBed.configureTestingModule({
      imports: [ListConsultantCertificationsComponent, NoopAnimationsModule],
      providers: [
        { provide: AdminSessionService, useValue: mock },
        { provide: MAT_DIALOG_DATA, useValue: { id: 5, full_name: "Ana", participant_type: "INTERNO", team_id: 1 } },
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
        { provide: ConsultantCertificationService, useValue: svc0 },
        { provide: ConfirmationService, useValue: confirmation }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ListConsultantCertificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const addButton = () => Array.from(el().querySelectorAll('button')).find(b => (b.textContent || '').includes('Asignar Certificación'));

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

    it('no muestra la columna paid_with_own_resources', () => {
      expect(component.displayedColumns).not.toContain('paid_with_own_resources');
      expect(el().querySelector('th.mat-column-paid_with_own_resources')).toBeNull();
    });

    it('los métodos de escritura no abren diálogo ni llaman al servicio', () => {
      const open = jest.spyOn(component.dialog, 'open');
      const loads = svc0.getConsultantCertifications.mock.calls.length;
      component.openCaptureDialog();
      expect(open).not.toHaveBeenCalled();
      expect(confirmation.openDeleteConfirmation).not.toHaveBeenCalled();
      expect(svc0.getConsultantCertifications.mock.calls.length).toBe(loads);
    });

    it('al cambiar a administrador aparecen las acciones', () => {
      mock.setAdmin(true);
      fixture.detectChanges();
      expect(addButton()).toBeDefined();
      expect(el().querySelector('th.mat-column-paid_with_own_resources')).not.toBeNull();
    });
  });

  describe('perfil administrador', () => {
    beforeEach(() => setup(true));

    it('muestra alta, edición y eliminación', () => {
      expect(addButton()).toBeDefined();
      expect(el().querySelector('th.mat-column-paid_with_own_resources')).not.toBeNull();
    });

    it('al volver al perfil público se ocultan las acciones', () => {
      mock.setAdmin(false);
      fixture.detectChanges();
      expect(addButton()).toBeUndefined();
      expect(el().querySelector('button[title="Eliminar"]')).toBeNull();
    });
  });
});
