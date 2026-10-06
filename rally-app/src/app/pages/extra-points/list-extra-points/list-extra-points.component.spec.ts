import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { ListExtraPointsComponent } from './list-extra-points.component';
import { ConsultantExtraPointService } from '../../../core/services/consultant-extra-points/consultant-extra-point.service';
import { ConsultantService } from '../../../core/services/consultants/consultant.service';
import { ConfirmationService } from '../../../core/services/confirmation/confirmation.service';

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
