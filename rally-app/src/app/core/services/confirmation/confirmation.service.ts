import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, DialogData } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  private dialog = inject(MatDialog);

  /**
   * Abre un diálogo de confirmación genérico.
   * @param data La configuración para el diálogo.
   * @returns Un Observable que emite 'true' si se confirma, 'false' si se cancela.
   */
  open(data: DialogData): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: data,
      disableClose: true,
    });

    return dialogRef.afterClosed();
  }

  /**
   * Abre un diálogo pre-configurado para acciones de borrado.
   * @returns Un Observable con el resultado.
   */
  openDeleteConfirmation(): Observable<boolean> {
    return this.open({
      title: '¿Estás seguro de que deseas eliminar?',
      message:
        'Esta acción no se puede deshacer. Toda la información asociada se perderá permanentemente.',
      icon: 'warning',
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: 'warn', // Botón rojo
    });
  }
}
