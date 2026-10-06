import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

// SERVICES
import { MenuConfigurationService } from '@services/auth/menu-configuration/menu-configuration.service';
import { SharedModule } from '@shared/shared.module';
import { SidenavService } from '@services/sidenav/sidenav.service';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { Section } from '@models/section/Section';
import { Menu } from '@models/menu/Menu';
import { Router } from '@angular/router';
import { MenuFilter } from '@utils/filters';

@Component({
	selector: 'app-sidenav',
	templateUrl: './sidenav.component.html',
	styleUrls: ['./sidenav.component.scss'],
	standalone: true,
	imports: [
		SharedModule,
		ToolbarComponent,
		BreadcrumbComponent
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
		private filter: MenuFilter
	) {

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
	onItemSelected(item: Section) {
			this.router.navigate([item.route]);
			this.navServ.closeNav();

	}
}
