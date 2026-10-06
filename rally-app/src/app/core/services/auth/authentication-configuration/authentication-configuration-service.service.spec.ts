import { TestBed } from '@angular/core/testing';

import { AuthenticationConfigurationService } from './authentication-configuration-service.service';
import { LoginItem } from '@models/authentication/LoginComparrnet';
import { Response } from '@models/response-api/ResponseApi';
describe('AuthenticationConfigurationServiceService', () => {
    let service: AuthenticationConfigurationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AuthenticationConfigurationService);
        const user: LoginItem = {
            name: "test",
            positionDescription: "test",
            user: "test"
        };
        const response :Response ={
            data:user,
            message:"",
            success:true
        }
        service.startConfiguration(response);
    });
    it('should be created', () => {
        service.isUserAuthenticated;
        expect(service).toBeTruthy();
    });
});
