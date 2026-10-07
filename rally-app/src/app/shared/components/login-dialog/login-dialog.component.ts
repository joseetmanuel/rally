import { Component, ElementRef, OnDestroy, ViewChild, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminSessionService } from '@services/admin-session/admin-session.service';

@Component({
	selector: 'app-login-dialog',
	templateUrl: './login-dialog.component.html',
	styleUrls: ['./login-dialog.component.scss'],
	imports: [
		ReactiveFormsModule,
		MatDialogModule,
		MatButtonModule,
		MatFormFieldModule,
		MatIconModule,
		MatInputModule,
		MatProgressSpinnerModule
	]
})
export class LoginDialogComponent implements OnDestroy {
	private readonly admin = inject(AdminSessionService);
	private readonly dialogRef = inject<MatDialogRef<LoginDialogComponent, boolean>>(MatDialogRef);
	private readonly fb = inject(FormBuilder);

	@ViewChild('passwordInput') private passwordInput?: ElementRef<HTMLInputElement>;

	readonly form = this.fb.nonNullable.group({
		username: ['', [Validators.required]],
		password: ['', [Validators.required]]
	});

	readonly hidePassword = signal(true);
	readonly submitting = signal(false);
	readonly errorMessage = signal<string | null>(null);
	/** Segundos restantes de bloqueo temporal (0 = sin bloqueo) */
	readonly lockSeconds = signal(0);
	readonly locked = computed(() => this.lockSeconds() > 0);

	private timer: ReturnType<typeof setInterval> | null = null;

	get canSubmit(): boolean {
		return this.form.valid && !this.submitting() && !this.locked();
	}

	togglePassword(): void {
		this.hidePassword.update((v) => !v);
	}

	submit(): void {
		if (!this.canSubmit) return;
		const { username, password } = this.form.getRawValue();
		this.submitting.set(true);
		this.errorMessage.set(null);
		this.form.disable({ emitEvent: false });
		this.admin.login(username.trim(), password).subscribe({
			next: () => {
				this.submitting.set(false);
				this.dialogRef.close(true);
			},
			error: (err: unknown) => {
				this.submitting.set(false);
				this.form.enable({ emitEvent: false });
				this.handleError(err);
			}
		});
	}

	cancel(): void {
		this.dialogRef.close(false);
	}

	ngOnDestroy(): void {
		this.stopTimer();
	}

	private handleError(err: unknown): void {
		// Nunca se registra el error completo: puede contener el cuerpo de la petición.
		const status = err instanceof HttpErrorResponse ? err.status : 0;
		switch (status) {
			case 401:
				this.errorMessage.set('Usuario o contraseña incorrectos.');
				this.form.controls.password.reset('');
				setTimeout(() => this.passwordInput?.nativeElement.focus());
				break;
			case 429: {
				const raw = Number((err as HttpErrorResponse).error?.retry_after);
				this.startLock(Number.isFinite(raw) && raw > 0 ? Math.ceil(raw) : 30);
				break;
			}
			case 503:
				this.errorMessage.set('El acceso de administrador no está configurado en el servidor.');
				break;
			default:
				this.errorMessage.set('No se pudo conectar con el servidor. Intenta de nuevo.');
		}
	}

	private startLock(seconds: number): void {
		this.stopTimer();
		this.lockSeconds.set(seconds);
		this.updateLockMessage();
		this.timer = setInterval(() => {
			this.lockSeconds.update((s) => s - 1);
			if (this.lockSeconds() <= 0) {
				this.stopTimer();
				this.lockSeconds.set(0);
				this.errorMessage.set(null);
			} else {
				this.updateLockMessage();
			}
		}, 1000);
	}

	private updateLockMessage(): void {
		const s = this.lockSeconds();
		this.errorMessage.set(`Demasiados intentos. Intenta de nuevo en ${s} ${s === 1 ? 'segundo' : 'segundos'}.`);
	}

	private stopTimer(): void {
		if (this.timer !== null) {
			clearInterval(this.timer);
			this.timer = null;
		}
	}
}
