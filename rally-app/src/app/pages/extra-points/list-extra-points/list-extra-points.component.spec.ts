import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { ListExtraPointsComponent } from './list-extra-points.component';
import { ConsultantExtraPointService } from '../../../core/services/consultant-extra-points/consultant-extra-point.service';
import { ConsultantService } from '../../../core/services/consultants/consultant.service';
import { ConfirmationService } from '../../../core/services/confirmation/confirmation.service';
import { provideAdminSession, createAdminSessionMock } from '../../../core/testing/admin-session.mock';
import { AdminSessionService } from '../../../core/services/admin-session/admin-session.service';

describe('ListExtraPointsComponent', () => {
  let component: ListExtraPointsComponent;
  let fixture: ComponentFixture<ListExtraPointsComponent>;

  const points = [
    { id: 1, consultant_id: 1, extra_point_reason_type_id: 1, points: 3, awarded_at: '2026-02-10T00:00:00',
      notes: 'nota', consultant: { id: 1, full_name: 'Ana' }, reason_type: { id: 1, code: 'A', name: 'Mentoría' } },
    { id: 2, consultant_id: 2, extra_point_reason_type_id: 1, points: 1, awarded_at: '2026-02-11',
      notes: null, consultant: null, reason_type: null }
  ];
  const extraPointService = {
    getExtraPoints: jest.fn(() => of(points)),
    deleteExtraPoint: jest.fn(() => of(undefined))
  };
  const confirmation = { openDeleteConfirmation: jest.fn(() => of(true)) };

  beforeEach(async () => {
    extraPointService.deleteExtraPoint.mockClear();
    await TestBed.configureTestingModule({
      imports: [ListExtraPointsComponent, NoopAnimationsModule],
      providers: [
        provideAdminSession(true),
        { provide: ConsultantExtraPointService, useValue: extraPointService },
        { provide: ConsultantService, useValue: { getConsultants: () => of([{ id: 1, full_name: 'Ana' }]) } },
        { provide: ConfirmationService, useValue: confirmation }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListExtraPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a row per extra point', () => {
    const rows = fixture.nativeElement.querySelectorAll('tr[mat-row]');
    expect(rows.length).toBe(2);
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Ana');
    expect(text).toContain('Mentoría');
    expect(text).toContain('2026-02-10');
    expect(text).toContain('ID: 2');
  });

  it('should filter by consultant on the client', () => {
    component.onFilterChange(1);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tr[mat-row]').length).toBe(1);
    component.onFilterChange(null);
    expect(component.filteredPoints.length).toBe(2);
  });

  it('should delete after confirmation', () => {
    component.deleteExtraPoint(points[0]);
    expect(extraPointService.deleteExtraPoint).toHaveBeenCalledWith(1);
  });
});

// --- Perfil público vs administrador ---
describe('ListExtraPointsComponent según el perfil', () => {
  const items: any[] = [{ id: 1, consultant_id: 1, points: 3, awarded_at: "2026-02-10T00:00:00", notes: "nota", consultant: { id: 1, full_name: "Ana" }, reason_type: { id: 1, name: "Mentoría" } }];
  const svc0: any = { getExtraPoints: jest.fn(), deleteExtraPoint: jest.fn() };
  const svc1: any = { getConsultants: jest.fn() };
  const confirmation = { openDeleteConfirmation: jest.fn() };
  let mock: ReturnType<typeof createAdminSessionMock>;
  let fixture: ComponentFixture<ListExtraPointsComponent>;
  let component: any;

  async function setup(isAdmin: boolean) {
    jest.clearAllMocks();
    svc0.getExtraPoints.mockReturnValue(of(items));
    svc0.deleteExtraPoint.mockReturnValue(of(undefined));
    svc1.getConsultants.mockReturnValue(of([]));
    mock = createAdminSessionMock(isAdmin);
    await TestBed.configureTestingModule({
      imports: [ListExtraPointsComponent, NoopAnimationsModule],
      providers: [
        { provide: AdminSessionService, useValue: mock },
        { provide: ConsultantExtraPointService, useValue: svc0 },
        { provide: ConsultantService, useValue: svc1 },
        { provide: ConfirmationService, useValue: confirmation }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ListExtraPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const addButton = () => Array.from(el().querySelectorAll('button')).find(b => (b.textContent || '').includes('Nuevo Punto Extra'));

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
      const loads = svc0.getExtraPoints.mock.calls.length;
      component.openCaptureDialog();
      component.deleteExtraPoint(items[0]);
      expect(open).not.toHaveBeenCalled();
      expect(confirmation.openDeleteConfirmation).not.toHaveBeenCalled();
      expect(svc0.deleteExtraPoint).not.toHaveBeenCalled();
      expect(svc0.getExtraPoints.mock.calls.length).toBe(loads);
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
