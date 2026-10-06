import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ListCertificationsComponent } from './list-certifications.component';
import { CertificationService } from '@services/certifications/certification.service';
import { ConfirmationService } from '@services/confirmation/confirmation.service';

describe('ListCertificationsComponent', () => {
  let fixture: ComponentFixture<ListCertificationsComponent>;
  let component: ListCertificationsComponent;
  const items: any[] = [{"id": 1, "vendor": "AWS", "name": "SAA", "certification_type_id": 1, "type": {"id": 1, "code": "PROFESIONAL", "points_base": 30}}, {"id": 2, "vendor": "MS", "name": "AZ-900", "certification_type_id": 2, "type": null}];
  const service = { getCertifications: jest.fn(), deleteCertification: jest.fn() };
  const confirmation = { openDeleteConfirmation: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    service.getCertifications.mockReturnValue(of(items));
    await TestBed.configureTestingModule({
      imports: [ListCertificationsComponent, NoopAnimationsModule],
      providers: [
        { provide: CertificationService, useValue: service },
        { provide: ConfirmationService, useValue: confirmation }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ListCertificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the records on init', () => {
    expect(service.getCertifications).toHaveBeenCalled();
    expect(component.certifications).toEqual(items);
  });

  it('renders one table row per record', () => {
    expect(fixture.nativeElement.querySelectorAll('tr.mat-mdc-row').length).toBe(items.length);
    expect(fixture.nativeElement.querySelector('.empty-state')).toBeNull();
  });

  it('shows the empty state without records', () => {
    service.getCertifications.mockReturnValue(of([]));
    component.ngOnInit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.empty-state')).not.toBeNull();
  });

  it('reloads after the capture dialog closes with a result', () => {
    const dialog = (component as any).dialog;
    jest.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(true) });
    component.openCaptureDialog();
    expect(dialog.open).toHaveBeenCalled();
    expect(service.getCertifications).toHaveBeenCalledTimes(2);
  });

  it('does not reload when the dialog is dismissed', () => {
    const dialog = (component as any).dialog;
    jest.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(false) });
    component.openCaptureDialog();
    expect(service.getCertifications).toHaveBeenCalledTimes(1);
  });

  it('deletes after the user confirms and reloads the list', () => {
    confirmation.openDeleteConfirmation.mockReturnValue(of(true));
    service.deleteCertification.mockReturnValue(of(undefined));
    component.deleteCertification(items[0]);
    expect(service.deleteCertification).toHaveBeenCalledWith(items[0].id);
    expect(service.getCertifications).toHaveBeenCalledTimes(2);
  });

  it('does not delete when the user cancels', () => {
    confirmation.openDeleteConfirmation.mockReturnValue(of(false));
    component.deleteCertification(items[0]);
    expect(service.deleteCertification).not.toHaveBeenCalled();
  });
});
