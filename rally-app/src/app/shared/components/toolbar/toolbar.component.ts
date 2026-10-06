import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
// LIBS
import { Subscription } from 'rxjs';
import { MatDrawer } from '@angular/material/sidenav';
// SERVICES
import { SweetAlertService } from '@services/sweet/sweet-alert.service';
import { Menu } from '@models/menu/Menu';
import { MenuConfigurationService } from '@services/auth/menu-configuration/menu-configuration.service';
import { LocalStorageService } from '@services/storage/localstorage/localstorage.service';
import { Section } from '@models/section/Section';
import { SharedModule } from '@shared/shared.module';
import { ConfigurationCenterService } from '@services/auth/configuration-center.service/configuration-center.service';
import { SidenavService } from '@services/sidenav/sidenav.service';

@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    imports: [SharedModule]
})
export class ToolbarComponent implements OnInit, OnDestroy {
	collapse: boolean = false;
	user = '';
	subscription = new Subscription();
	menu: Menu = { items: [] };
	@ViewChild('drawer', { static: false }) sidenav!: MatDrawer;

	constructor(
		private configCenterServ: ConfigurationCenterService,
		private menuConfiguartionServ: MenuConfigurationService,
		private sidenavServ: SidenavService,
		private sweetAlertServ: SweetAlertService,
		private local: LocalStorageService,
		private router: Router
	) {}

	ngOnInit(): void {
		this.user = this.local.getObject('auth')?.name;
		this.menuConfiguartionServ.getMenu().subscribe({
			next: (x: Section[]) => {
				this.menu.items = x;
			}
		});
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}

	toggleRightSidenav() {
		this.sidenavServ.openNav();
		this.collapse = !this.collapse;
	}

	async closeSession() {
		const data = {
			title: 'Cerrar sesión',
			text: '¿Desea cerrar la sesión?'
		};
		if (await this.sweetAlertServ.showActionConfirmationAlert(data)) {
			this.configCenterServ.closeSesion();
		}
	}

	goHome() {
		this.router.navigate(['/']);
	}
}
