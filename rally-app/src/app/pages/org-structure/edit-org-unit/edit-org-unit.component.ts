import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OrgStructureService } from '../../../core/services/org-structure/org-structure.service';
import { ORG_LEVELS, OrgLevel, OrgUnit } from '../../../core/models/org-structure/org-structure';

/** Qué abre el diálogo: editar una unidad existente o agregar una nueva debajo de un padre */
export interface EditOrgUnitData {
  level: OrgLevel;
  /** Unidad a editar; si falta, el diálogo da de alta una nueva */
  unit?: OrgUnit;
  /** Sólo en alta: campo del padre que pide el servidor (cto_id, direction_id o subdirection_id) y su id */
  parent?: { field: string; id: number };
}

function notBlank(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  return typeof value === 'string' && value.length > 0 && value.trim().length === 0 ? { required: true } : null;
}

/** Edita (o agrega) el nombre de una unidad y el de quien la encabeza. Sirve para los cuatro niveles. */
@Component({
  selector: 'app-edit-org-unit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatInputModule, MatFormFieldModule],
  templateUrl: './edit-org-unit.component.html',
  styleUrl: './edit-org-unit.component.scss'
})
export class EditOrgUnitComponent {
  private fb = inject(FormBuilder);
  private service = inject(OrgStructureService);

  readonly label: string;
  readonly isEdit: boolean;
  errorMessage = '';

  form = this.fb.group({
    name: ['', [Validators.required, notBlank]],
    head_name: ['']
  });

  constructor(
    public dialogRef: MatDialogRef<EditOrgUnitComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditOrgUnitData
  ) {
    this.label = ORG_LEVELS.find((l) => l.level === data.level)!.label;
    this.isEdit = !!data.unit;
    if (data.unit) {
      this.form.patchValue({ name: data.unit.name, head_name: data.unit.head_name });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.errorMessage = '';
    const body = {
      name: String(this.form.value.name).trim(),
      head_name: String(this.form.value.head_name ?? '').trim()
    };
    const request = this.data.unit
      ? this.service.update(this.data.level, this.data.unit.id, body)
      : this.service.create(this.data.level, { ...body, [this.data.parent!.field]: this.data.parent!.id });
    request.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        console.error('Error saving org unit', err);
        this.errorMessage = err?.status === 409
          ? 'Ya existe una unidad con ese nombre en este nivel.'
          : err?.error?.error || `No se pudo guardar: ${this.label}.`;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
