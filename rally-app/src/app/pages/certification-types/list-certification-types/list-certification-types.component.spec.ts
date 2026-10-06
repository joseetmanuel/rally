import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ListCertificationTypesComponent } from './list-certification-types.component';
import { CertificationTypeService } from '@services/certification-types/certification-type.service';
import { ConfirmationService } from '@services/confirmation/confirmation.service';

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
