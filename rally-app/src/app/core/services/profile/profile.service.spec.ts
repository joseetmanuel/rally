/* eslint-disable  */

import { TestBed } from '@angular/core/testing';
import { ProfileService } from './profile.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { ProfileMapper } from '@mappers/profile/profile';
import { LocalStorageService } from '@services/storage/localstorage/localstorage.service';
import { KEYS_STORAGE } from '@constants/KeysStorage';
import { Response } from '@models/response-api/ResponseApi';

describe('ProfileService', () => {
  let service: ProfileService;
  let localService: LocalStorageService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpClient, HttpHandler, ProfileMapper, LocalStorageService],
    });
    service = TestBed.inject(ProfileService);
    localService = TestBed.inject(LocalStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be created localstorage', () => {
    localService.setObject(KEYS_STORAGE.config, 'test');
    expect(service).toBeTruthy();
  });

  it('should getSystemProfiles', () => {
    const profileId = 14;
    const expectedResponse = {
      data: [{ id: 1, name: 'Profile 1' }],
      message: 'Success',
      success: true,
    };
    jest.spyOn(service['http'], 'get').mockReturnValue(of(expectedResponse));
    /*service.getAllPermissionsByProfile(profileId).subscribe((response) => {
			expect(response).toEqual(expectedResponse);
		});*/
  });
  it('should getSystemProfiles', () => {
    const systemId = 1;
    const expectedResponse = {
      data: [{ id: 1, name: 'Profile 1' }],
      message: 'Success',
      success: true,
    };
    jest.spyOn(service['http'], 'get').mockReturnValue(of(expectedResponse));
    service.getSystemProfiles(systemId).subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });
  });

  it('should handle an invalid or non-existent systemId gracefully', () => {
    const httpClientMock = {
      get: jest
        .fn()
        .mockReturnValue(throwError({ status: 404, message: 'Not Found' })),
    };
    const mapperMock = {
      transform: jest.fn(),
    };
    const service = new ProfileService(
      httpClientMock as any,
      mapperMock as any,
      localService,
    );
    const systemId = 999;

    service.getSystemProfiles(systemId).subscribe({
      next: () => fail('Expected an error, but got a response'),
      error: (error) => {
        expect(error.status).toBe(404);
        expect(error.message).toBe('Not Found');
      },
    });

    expect(httpClientMock.get).toHaveBeenCalledWith(
      `Catalogs/Profiles/${systemId}`,
    );
    expect(mapperMock.transform).not.toHaveBeenCalled();
  });

  it('should return profiles with the specified systemId', () => {
    const httpClientMock = {
      get: jest.fn().mockReturnValue(
        of({
          data: {
            elements: [
              { profileId: 1, name: 'test', systemId: 1 },
              { profileId: 2, name: 'test', systemId: 2 },
            ],
            message: 'Profiles retrieved successfully',
          },
        }),
      ),
    };
    const mapperMock = {
      transform: jest.fn(),
    };
    const service = new ProfileService(
      httpClientMock as any,
      mapperMock as any,
      localService,
    );
    service.getAllBySystem(1).subscribe((response) => {
      expect(response.data).toEqual([
        { profileId: 1, name: 'test', systemId: 1 },
      ]);
      expect(response.message).toBe('Profiles retrieved successfully');
      expect(response.success).toBe(true);
    });
  });

  it('should return profiles that match the given systemId', () => {
    const httpClientMock = {
      get: jest.fn().mockReturnValue(
        of({
          data: {
            elements: [
              { profileId: 1, name: 'test', systemId: 123 },
              { profileId: 2, name: 'test', systemId: 456 },
            ],
            message: 'Profiles retrieved successfully',
          },
        }),
      ),
    };
    const mapperMock = {
      transform: jest.fn(),
    };
    const service = new ProfileService(
      httpClientMock as any,
      mapperMock as any,
      localService,
    );
    service.getAllBySystem(123).subscribe((response) => {
      expect(response.data.length).toBe(1);
      expect(response.data[0].systemId).toBe(123);
      expect(response.success).toBe(true);
    });
  });
});
