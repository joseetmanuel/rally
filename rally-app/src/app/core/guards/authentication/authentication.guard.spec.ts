import { TestBed } from '@angular/core/testing';
import { AuthenticationGuard } from './authentication.guard';
import { AuthenticationConfigurationService } from '@services/auth/authentication-configuration/authentication-configuration-service.service';
import { LoginItem } from '@models/authentication/LoginComparrnet';
import { Response } from '@models/response-api/ResponseApi';
const login: LoginItem = {
	name: 'dhmorales',
    positionDescription: '',
	user: 'dhmorales'
};
const datas:Response = {
    data:login,
    message:"",
    success:true
}
describe('authentication guard', () => {
	let authGuard: AuthenticationGuard;
	let authService: AuthenticationConfigurationService;
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [AuthenticationGuard, AuthenticationConfigurationService]
		});
	});
	beforeEach(() => {
		authGuard = TestBed.inject(AuthenticationGuard);
		authService = TestBed.inject(AuthenticationConfigurationService);
	});
	it('should call canActivate false', () => {
		expect(authGuard.canActivate()).toBe(false);
	});
	it('should call canLoad false', () => {
		expect(authGuard.canLoad()).toBe(false);
	});
	it('should call validateAuthentication', () => {
		expect(authGuard.validateAuthentication()).toBe(false);
	});

	it('should call canActivate true', () => {
		authService.startConfiguration(datas);
		expect(authGuard.canActivate()).toBe(true);
	});

	it('should call canLoad true', () => {
		authService.startConfiguration(datas);
		expect(authGuard.canLoad()).toBe(true);
	});

	it('should call validateAuthentication true', () => {
		authService.startConfiguration(datas);
		expect(authGuard.validateAuthentication()).toBe(true);
	});
});
