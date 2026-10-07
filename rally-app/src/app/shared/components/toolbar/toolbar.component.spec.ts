import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { AdminSessionService } from '@services/admin-session/admin-session.service';
import { createAdminSessionMock } from '../../../core/testing/admin-session.mock';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { ToolbarComponent } from './toolbar.component';

describe('ToolbarComponent', () => {
	let fixture: ComponentFixture<ToolbarComponent>;
	let component: ToolbarComponent;
	let admin: ReturnType<typeof createAdminSessionMock>;

	function setup(isAdmin: boolean) {
		admin = createAdminSessionMock(isAdmin);
		TestBed.configureTestingModule({
			imports: [ToolbarComponent, NoopAnimationsModule],
			providers: [provideRouter([]), { provide: AdminSessionService, useValue: admin }]
		});
		fixture = TestBed.createComponent(ToolbarComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}

	const el = (): HTMLElement => fixture.nativeElement;

	it('perfil público: botón con person_outline, aria-label y clic abre el diálogo', () => {
		setup(false);
		const open = jest.spyOn((component as any).dialog as MatDialog, 'open').mockReturnValue({} as any);
		const btn = el().querySelector('button.login-btn') as HTMLButtonElement;
		expect(btn).toBeTruthy();
		expect(btn.getAttribute('aria-label')).toBe('Acceso de administrador');
		expect(btn.textContent).toContain('person_outline');
		expect(el().querySelector('.admin-chip')).toBeNull();
		btn.click();
		expect(open).toHaveBeenCalledTimes(1);
		expect((open.mock.calls[0] as any[])[0]).toBe(LoginDialogComponent);
	});

	it('administrador: muestra la insignia Admin y el nombre', () => {
		setup(true);
		expect(el().querySelector('button.login-btn')).toBeNull();
		expect(el().querySelector('.admin-chip')?.textContent?.trim()).toBe('Admin');
		expect(el().querySelector('.username')?.textContent).toContain('Etmanuel');
		expect(el().textContent).toContain('admin_panel_settings');
	});

	it('administrador: el menú tiene cabecera y "Cerrar sesión" llama a logout', () => {
		setup(true);
		(el().querySelector('button.admin-btn') as HTMLButtonElement).click();
		fixture.detectChanges();
		const overlay = document.querySelector('.cdk-overlay-container') as HTMLElement;
		expect(overlay.textContent).toContain('Administrador · Etmanuel');
		const items = Array.from(overlay.querySelectorAll('button[mat-menu-item]')) as HTMLButtonElement[];
		const logout = items.find((b) => b.textContent?.includes('Cerrar sesión'));
		expect(logout).toBeTruthy();
		expect(logout!.textContent).toContain('logout');
		logout!.click();
		expect(admin.logout).toHaveBeenCalledTimes(1);
	});

	it('notice muestra el snackbar y luego llama a clearNotice una sola vez', () => {
		setup(false);
		const dismissed = new Subject<void>();
		const open = jest
			.spyOn((component as any).snackBar as MatSnackBar, 'open')
			.mockReturnValue({ afterDismissed: () => dismissed } as any);
		admin.setNotice('Tu sesión expiró.');
		fixture.detectChanges();
		expect(open).toHaveBeenCalledWith('Tu sesión expiró.', 'Entendido', { duration: 8000 });
		expect(admin.clearNotice).not.toHaveBeenCalled();
		dismissed.next();
		expect(admin.clearNotice).toHaveBeenCalledTimes(1);
		fixture.detectChanges();
		expect(open).toHaveBeenCalledTimes(1);
	});
});
