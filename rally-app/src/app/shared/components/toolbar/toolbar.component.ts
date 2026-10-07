import { Component, OnDestroy, OnInit, ViewChild, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
// LIBS
import { Subscription } from 'rxjs';
import { MatDrawer } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
// SERVICES
import { Menu } from '@models/menu/Menu';
import { MenuConfigurationService } from '@services/auth/menu-configuration/menu-configuration.service';
import { Section } from '@models/section/Section';
import { SharedModule } from '@shared/shared.module';
import { SidenavService } from '@services/sidenav/sidenav.service';
import { AdminSessionService } from '@services/admin-session/admin-session.service';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';

@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    imports: [SharedModule]
})
export class ToolbarComponent implements OnInit, OnDestroy {
	collapse: boolean = false;
	subscription = new Subscription();
	menu: Menu = { items: [] };
	@ViewChild('drawer', { static: false }) sidenav!: MatDrawer;

	readonly admin = inject(AdminSessionService);
	private readonly dialog = inject(MatDialog);
	private readonly snackBar = inject(MatSnackBar);

	constructor(
		private menuConfiguartionServ: MenuConfigurationService,
		private sidenavServ: SidenavService,
		private router: Router
	) {
		// Avisa cuando la sesión terminó sola (p. ej. venció) y limpia el aviso al cerrarse.
		effect(() => {
			const message = this.admin.notice();
			if (!message) return;
			this.snackBar
				.open(message, 'Entendido', { duration: 8000 })
				.afterDismissed()
				.subscribe(() => this.admin.clearNotice());
		});
	}

	ngOnInit(): void {
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

	openLogin() {
		this.dialog.open(LoginDialogComponent, {
			width: '440px',
			maxWidth: '92vw',
			autoFocus: 'input',
			ariaLabelledBy: 'login-title'
		});
	}

	logout() {
		this.admin.logout();
	}

	goHome() {
		this.router.navigate(['/']);
	}
}
