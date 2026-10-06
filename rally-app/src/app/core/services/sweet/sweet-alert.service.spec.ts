/* eslint-disable  */

import { TestBed, inject } from '@angular/core/testing';
import { SweetAlertService } from './sweet-alert.service';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { DIALOG_RESPONSE_TYPE } from '@constants/DialogResponseType';

describe('Service: SweetAlert', () => {
  let alert: SweetAlertService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SweetAlertService],
    });
  });

  beforeEach(() => {
    alert = TestBed.inject(SweetAlertService);
  });

  it('should created SweetAlertService', () => {
    expect(alert).toBeTruthy();
  });

  it('should called showDeleteConfirmationAlert', async () => {
    jest.spyOn(Swal, 'fire').mockResolvedValue({
      isConfirmed: true,
    } as SweetAlertResult<any>);
    jest.spyOn(alert, 'showDeleteConfirmationAlert');
    const result = await alert.showDeleteConfirmationAlert();
    expect(result).toBe(true);
    expect(Swal.fire).toHaveBeenCalled();
    expect(alert.showDeleteConfirmationAlert).toHaveBeenCalled();
  });

  it('should called showActionConfirmationAlert', async () => {
    jest.spyOn(Swal, 'fire').mockResolvedValue({
      isConfirmed: true,
    } as SweetAlertResult<any>);
    jest.spyOn(alert, 'showActionConfirmationAlert');
    const result = await alert.showActionConfirmationAlert();
    expect(result).toBe(true);
    expect(Swal.fire).toHaveBeenCalled();
    expect(alert.showActionConfirmationAlert).toHaveBeenCalled();
  });

  it('should called showDoubleActionAlert', async () => {
    jest.spyOn(Swal, 'fire').mockResolvedValue({
      isConfirmed: true,
    } as SweetAlertResult<any>);
    jest.spyOn(alert, 'showDoubleActionAlert');
    const result = await alert.showDoubleActionAlert();
    expect(result).toBe(DIALOG_RESPONSE_TYPE.primaryAction);
    expect(Swal.fire).toHaveBeenCalled();
    expect(alert.showDoubleActionAlert).toHaveBeenCalled();
  });

  it('should called showDoubleActionAlert', async () => {
    jest.spyOn(Swal, 'fire').mockResolvedValue({
      isDenied: true,
    } as SweetAlertResult<any>);
    jest.spyOn(alert, 'showDoubleActionAlert');
    const result = await alert.showDoubleActionAlert();
    expect(result).toBe(DIALOG_RESPONSE_TYPE.secondaryAction);
    expect(Swal.fire).toHaveBeenCalled();
    expect(alert.showDoubleActionAlert).toHaveBeenCalled();
  });

  it('should called showDoubleActionAlert', async () => {
    jest.spyOn(Swal, 'fire').mockResolvedValue({
      isDenied: false,
    } as SweetAlertResult<any>);
    jest.spyOn(alert, 'showDoubleActionAlert');
    const result = await alert.showDoubleActionAlert();
    expect(result).toBe(DIALOG_RESPONSE_TYPE.cancelAction);
    expect(Swal.fire).toHaveBeenCalled();
    expect(alert.showDoubleActionAlert).toHaveBeenCalled();
  });
});
