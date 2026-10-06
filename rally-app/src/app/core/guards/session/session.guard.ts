// ANGULAR
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
// SERVICES
import { AuthenticationConfigurationService } from '@services/auth/authentication-configuration/authentication-configuration-service.service';

@Injectable({
	providedIn: 'root'
})
export class SessionGuard {
	constructor(
		private router: Router,
		private authenticationConfigurationService: AuthenticationConfigurationService
	) {}

	canActivate() {
		return this.validateAuthentication();
	}

	canLoad() {
		return this.validateAuthentication();
	}

	validateAuthentication() {
		if (this.authenticationConfigurationService.isUserAuthenticated) {
			this.router.navigate(['/app/home']);
			return false;
		}
		return true;
	}
}
