import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ListConsultantsComponent } from './list-consultants.component';
import { ConsultantService } from '@services/consultants/consultant.service';
import { ConfirmationService } from '@services/confirmation/confirmation.service';

describe('ListConsultantsComponent', () => {
  let fixture: ComponentFixture<ListConsultantsComponent>;
  let component: ListConsultantsComponent;
  const items: any[] = [{"id": 1, "full_name": "Ana", "participant_type": "INTERNO", "team_number": 1, "email": "a@x.com"}, {"id": 2, "full_name": "Luis", "participant_type": "EXTERNO", "team_number": 2, "consulting_firm_name": "Firma"}];
  const service = { getConsultants: jest.fn(), deleteConsultant: jest.fn() };
  const confirmation = { openDeleteConfirmation: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    service.getConsultants.mockReturnValue(of(items));
    await TestBed.configureTestingModule({
      imports: [ListConsultantsComponent, NoopAnimationsModule],
      providers: [
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
