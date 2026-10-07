import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, throwError } from 'rxjs';
import { AdminSessionService } from '@services/admin-session/admin-session.service';
import { createAdminSessionMock } from '../../../core/testing/admin-session.mock';
import { LoginDialogComponent } from './login-dialog.component';

describe('LoginDialogComponent', () => {
	let fixture: ComponentFixture<LoginDialogComponent>;
	let component: LoginDialogComponent;
	let admin: ReturnType<typeof createAdminSessionMock>;
	let dialogRef: { close: jest.Mock };

	const el = (): HTMLElement => fixture.nativeElement;
	const q = <T extends HTMLElement>(sel: string) => el().querySelector(sel) as T;
	const submitBtn = () => q<HTMLButtonElement>('button.submit-btn');
	const alertText = () => q('[role="alert"]')?.textContent?.trim() ?? null;

	function fill(user = 'admin', pass = 'secreto') {
		component.form.setValue({ username: user, password: pass });
		fixture.detectChanges();
	}

	function httpError(status: number, body: unknown = {}) {
		return throwError(() => new HttpErrorResponse({ status, error: body }));
	}

	beforeEach(async () => {
		admin = createAdminSessionMock(false);
		dialogRef = { close: jest.fn() };
		await TestBed.configureTestingModule({
			imports: [LoginDialogComponent, NoopAnimationsModule],
			providers: [
				{ provide: AdminSessionService, useValue: admin },
				{ provide: MatDialogRef, useValue: dialogRef }
			]
		}).compileComponents();
		fixture = TestBed.createComponent(LoginDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('se crea y muestra el encabezado', () => {
		expect(component).toBeTruthy();
		expect(el().textContent).toContain('Acceso de administrador');
		expect(el().textContent).toContain('modo lectura');
	});

	it('el formulario vacío es inválido y el botón está deshabilitado', () => {
		expect(component.form.valid).toBe(false);
		expect(submitBtn().disabled).toBe(true);
	});

	it('envía usuario y contraseña a admin.login', () => {
		fill('admin', 'secreto');
		expect(submitBtn().disabled).toBe(false);
		component.submit();
		expect(admin.login).toHaveBeenCalledWith('admin', 'secreto');
	});

	it('cierra con true si el login es exitoso', () => {
		fill();
		component.submit();
		expect(dialogRef.close).toHaveBeenCalledWith(true);
	});

	it('Cancelar cierra con false', () => {
		q<HTMLButtonElement>('button.cancel-btn').click();
		expect(dialogRef.close).toHaveBeenCalledWith(false);
	});

	it('401 muestra el mensaje, vacía la contraseña y no cierra', () => {
		admin.login.mockReturnValueOnce(httpError(401, { error: 'invalid credentials' }));
		fill('admin', 'mala');
		component.submit();
		fixture.detectChanges();
		expect(alertText()).toContain('Usuario o contraseña incorrectos.');
		expect(component.form.controls.password.value).toBe('');
		expect(component.form.controls.username.value).toBe('admin');
		expect(dialogRef.close).not.toHaveBeenCalled();
	});

	it('429 muestra la cuenta regresiva y rehabilita el botón al llegar a 0', () => {
		jest.useFakeTimers();
		admin.login.mockReturnValueOnce(httpError(429, { error: 'too many attempts', retry_after: 3 }));
		fill();
		component.submit();
		fixture.detectChanges();
		expect(alertText()).toContain('Demasiados intentos. Intenta de nuevo en 3 segundos.');
		expect(submitBtn().disabled).toBe(true);

		jest.advanceTimersByTime(1000);
		fixture.detectChanges();
		expect(alertText()).toContain('en 2 segundos');
		expect(submitBtn().disabled).toBe(true);

		jest.advanceTimersByTime(2000);
		fixture.detectChanges();
		expect(alertText()).toBeNull();
		expect(submitBtn().disabled).toBe(false);
	});

	it('503 muestra que el acceso no está configurado', () => {
		admin.login.mockReturnValueOnce(httpError(503, { error: 'admin login is not configured' }));
		fill();
		component.submit();
		fixture.detectChanges();
		expect(alertText()).toContain('El acceso de administrador no está configurado en el servidor.');
		expect(dialogRef.close).not.toHaveBeenCalled();
	});

	it('un error de red (status 0) muestra el mensaje de conexión', () => {
		admin.login.mockReturnValueOnce(httpError(0));
		fill();
		component.submit();
		fixture.detectChanges();
		expect(alertText()).toContain('No se pudo conectar con el servidor. Intenta de nuevo.');
	});

	it('el botón de ojo alterna el tipo del input y aria-pressed', () => {
		const input = () => q<HTMLInputElement>('input[autocomplete="current-password"]');
		const eye = () => q<HTMLButtonElement>('button.toggle-password');
		expect(input().type).toBe('password');
		expect(eye().getAttribute('aria-pressed')).toBe('false');
		eye().click();
		fixture.detectChanges();
		expect(input().type).toBe('text');
		expect(eye().getAttribute('aria-pressed')).toBe('true');
		eye().click();
		fixture.detectChanges();
		expect(input().type).toBe('password');
	});

	it('durante el envío el botón está deshabilitado y no se reenvía', () => {
		const pending = new Subject<unknown>();
		admin.login.mockReturnValueOnce(pending);
		fill();
		component.submit();
		fixture.detectChanges();
		expect(component.submitting()).toBe(true);
		expect(submitBtn().disabled).toBe(true);
		expect(q('mat-progress-spinner')).toBeTruthy();
		component.submit();
		expect(admin.login).toHaveBeenCalledTimes(1);
	});

	it('limpia el temporizador al destruirse', () => {
		jest.useFakeTimers();
		admin.login.mockReturnValueOnce(httpError(429, { retry_after: 10 }));
		fill();
		const before = jest.getTimerCount();
		component.submit();
		const withLock = jest.getTimerCount();
		expect(withLock).toBeGreaterThan(before);
		fixture.destroy();
		expect(jest.getTimerCount()).toBeLessThan(withLock);
	});
});
