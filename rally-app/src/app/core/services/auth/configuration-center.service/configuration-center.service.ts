import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlertService } from '@services/alert/alert.service';
import { AuthenticationConfigurationService } from '@services/auth/authentication-configuration/authentication-configuration-service.service';
import { MenuConfigurationService } from '@services/auth/menu-configuration/menu-configuration.service';

@Injectable({
	providedIn: 'root'
})
export class ConfigurationCenterService {
	constructor(
		private authenticationConfigurationService: AuthenticationConfigurationService,
		private menuConfigurationService: MenuConfigurationService,
		private alertService: AlertService,
		private dialogRef: MatDialog,
		private router: Router
	) {}

	reset() {
		this.authenticationConfigurationService.resetConfiguration();
		this.menuConfigurationService.resetConfiguration();
	}

	closeSesion() {
		this.reset();
		this.dialogRef.closeAll();
		this.alertService.showSuccesAlert('Sesión finalizada');
		this.router.navigate(['/auth/login']);
	}
}
