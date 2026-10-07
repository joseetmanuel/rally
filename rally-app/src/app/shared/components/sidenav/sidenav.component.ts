import { AfterViewInit, Component, ElementRef, ViewChild, effect, untracked } from '@angular/core';

// SERVICES
import { MenuConfigurationService } from '@services/auth/menu-configuration/menu-configuration.service';
import { SharedModule } from '@shared/shared.module';
import { SidenavService } from '@services/sidenav/sidenav.service';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { DisclaimerComponent } from '../disclaimer/disclaimer.component';
import { Section } from '@models/section/Section';
import { Menu } from '@models/menu/Menu';
import { Router } from '@angular/router';
import { MenuFilter } from '@utils/filters';
import { AdminSessionService } from '@services/admin-session/admin-session.service';
import { isAdminOnlyUrl } from '@constants/AdminOnlyPaths';

@Component({
	selector: 'app-sidenav',
	templateUrl: './sidenav.component.html',
	styleUrls: ['./sidenav.component.scss'],
	standalone: true,
	imports: [
		SharedModule,
		ToolbarComponent,
		BreadcrumbComponent,
		DisclaimerComponent
	]
})
export class SidenavComponent implements AfterViewInit {
	@ViewChild('appDrawer') appDrawer!: ElementRef;
	menu: Menu = { items: [] };
	// expanded: boolean = false;

	constructor(
		private navServ: SidenavService,
		private menuServ: MenuConfigurationService,
		public router: Router,
		private filter: MenuFilter,
		public admin: AdminSessionService
	) {
		// Al salir del perfil administrador (cierre de sesión o sesión vencida) no se puede seguir en sus pantallas
		effect(() => {
			if (!this.admin.isAdmin() && untracked(() => isAdminOnlyUrl(this.router.url))) {
				this.router.navigateByUrl('/app/home');
			}
		});
	}

	ngAfterViewInit() {
		this.navServ.appDrawer = this.appDrawer;
		this.getMenu()
	}

	getMenu(){
		this.menuServ.getMenu().subscribe({
			next: (x: Section[]) => {
				this.menu.items = this.filter.filterItems(x);

			}
		});
	}
	/** Cierra el cajón después de elegir una opción (la navegación la hace el routerLink) */
	closeNav() {
		this.navServ.closeNav();
	}
}
