import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ListConsultantCertificationsComponent } from './list-consultant-certifications.component';
import { ConsultantCertificationService } from '@services/consultant-certifications/consultant-certification.service';
import { ConfirmationService } from '@services/confirmation/confirmation.service';

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
