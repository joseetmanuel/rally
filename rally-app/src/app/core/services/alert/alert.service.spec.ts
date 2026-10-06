import { AlertService } from './alert.service';
import { ToastrService } from 'ngx-toastr';

describe('AlertService', () => {
  let service: AlertService;
  let notifyServiceMock: jest.Mocked<ToastrService>; // Usamos un mock de ToastrService

  beforeEach(() => {
    // Creamos un mock de ToastrService
    notifyServiceMock = {
      info: jest.fn(),
      success: jest.fn(),
      warning: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<ToastrService>; // Casting para TypeScript

    // Inyectamos el mock en AlertService
    service = new AlertService(notifyServiceMock);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set app name', () => {
    service.app = 'ACG';
    expect(service.app).toBe('ACG'); // Verificamos que se asigne correctamente
  });

  it('should call ToastrService.info when showInfoAlert is called', () => {
    const message = 'info';
    service.showInfoAlert(message);
    expect(notifyServiceMock.info).toHaveBeenCalledWith(message); // Verificamos que se llame al método correcto
  });

  it('should call ToastrService.success when showSuccesAlert is called', () => {
    const message = 'success';
    service.showSuccesAlert(message);
    expect(notifyServiceMock.success).toHaveBeenCalledWith(message);
  });

  it('should call ToastrService.warning when showWarningAlert is called', () => {
    const message = 'warning';
    service.showWarningAlert(message);
    expect(notifyServiceMock.warning).toHaveBeenCalledWith(message);
  });

  it('should call ToastrService.error when showErrorAlert is called', () => {
    const message = 'error';
    service.showErrorAlert(message);
    expect(notifyServiceMock.error).toHaveBeenCalledWith(message);
  });
});