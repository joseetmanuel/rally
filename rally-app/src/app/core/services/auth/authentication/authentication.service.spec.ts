import { TestBed } from '@angular/core/testing';

import { AuthenticationService } from './authentication.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { Credential } from '@models/authentication/Credential';
import { LocalStorageService } from '@services/storage/localstorage/localstorage.service';
import { KEYS_STORAGE } from '@constants/KeysStorage';
import { Response } from '@models/response-api/ResponseApi';
import { AuthenticationMapper } from '@mappers/authentication/authentication';
import { of } from 'rxjs';

describe('AuthenticationService', () => {
	let service: AuthenticationService;
	let localStorageService: LocalStorageService;
	let httpClient: HttpClient;
	let mapper: AuthenticationMapper;
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				HttpClient,
				HttpHandler,
				LocalStorageService,
				AuthenticationMapper
			]
		});
	});
	beforeEach(() => {
		service = TestBed.inject(AuthenticationService);
		localStorageService = TestBed.inject(LocalStorageService);
		httpClient = TestBed.inject(HttpClient);
		mapper = TestBed.inject(AuthenticationMapper);
	});
	it('should be created', () => {
		expect(service).toBeTruthy();
		localStorageService.setObject(
			KEYS_STORAGE.config,
			'https://example.com/api/v1-0/'
		);
	});
	it('should call login', () => {
		const credential: Credential = { user: 'test', password: 'test' };
		const response: Response = { data: {}, message: '', success: true };
		jest.spyOn(httpClient, 'post').mockReturnValue(of(response));
		const spy = jest.spyOn(mapper, 'toAutenticacion');
		service.login(credential).subscribe();
		expect(spy).toHaveBeenCalledWith(response);
	});

	/*it('should call logout', () => {
		service.();
	});*/
	it('chould call encrypt', () => {
		const value = 'a'.repeat(255);
		const expectedUrl = `${service.getUrl()}User/Encrypt`;
		const expectedData = { data: { element: { word: value } } };
		const expectedResponse = {
			data: { elements: [], element: undefined, message: '' }
		};
		jest.spyOn(httpClient, 'post').mockReturnValue(of(expectedResponse));
		service.encrypt(value).subscribe((response) => {
			expect(response).toEqual(expectedResponse);
			expect(httpClient.post).toHaveBeenCalledWith(expectedUrl, expectedData);
		});
	});
	it('should call verifyUserInDirectory', () => {
		service.verifyUserInDirectory('userMock');
	});
});
