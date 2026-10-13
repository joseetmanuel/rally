import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OrgStructureService } from '../../core/services/org-structure/org-structure.service';
import { CtoNode, OrgLevel, OrgUnit } from '../../core/models/org-structure/org-structure';
import { EditOrgUnitComponent, EditOrgUnitData } from './edit-org-unit/edit-org-unit.component';

/** Un renglón del árbol, ya aplanado con su sangría para pintarlo */
export interface OrgRow {
  level: OrgLevel;
  label: string;
  depth: number;
  unit: OrgUnit;
  participants?: number;
  /** Cómo agregar un hijo debajo de este renglón (no aplica a las gerencias: debajo van los participantes) */
  addChild?: { level: OrgLevel; label: string; field: string };
}

/**
 * Estructura jerárquica CTO > Dirección > Subdirección > Gerencia (sólo administrador).
 * Se edita el nombre de cada unidad y el de quien la encabeza, y se pueden agregar direcciones, subdirecciones
 * y gerencias. Los participantes se asignan a su gerencia desde Consultores.
 */
@Component({
  selector: 'app-org-structure',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './org-structure.component.html',
  styleUrl: './org-structure.component.scss'
})
export class OrgStructureComponent implements OnInit {
  private service = inject(OrgStructureService);
  private dialog = inject(MatDialog);

  rows: OrgRow[] = [];
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';
    this.service.getTree().subscribe({
      next: (tree) => {
        this.rows = this.flatten(tree);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading org structure', err);
        this.errorMessage = err?.error?.error || 'No se pudo cargar la estructura.';
        this.loading = false;
      }
    });
  }

  edit(row: OrgRow): void {
    this.open({ level: row.level, unit: row.unit });
  }

  add(row: OrgRow): void {
    if (!row.addChild) return;
    this.open({ level: row.addChild.level, parent: { field: row.addChild.field, id: row.unit.id } });
  }

  private open(data: EditOrgUnitData): void {
    this.dialog.open(EditOrgUnitComponent, { width: '460px', maxWidth: '95vw', data, disableClose: true })
      .afterClosed().subscribe((saved) => {
        if (saved) this.load();
      });
  }

  private flatten(tree: CtoNode[]): OrgRow[] {
    const rows: OrgRow[] = [];
    for (const cto of tree) {
      rows.push({ level: 'cto', label: 'CTO', depth: 0, unit: cto,
        addChild: { level: 'direction', label: 'dirección', field: 'cto_id' } });
      for (const direction of cto.directions) {
        rows.push({ level: 'direction', label: 'Dirección', depth: 1, unit: direction,
          addChild: { level: 'subdirection', label: 'subdirección', field: 'direction_id' } });
        for (const subdirection of direction.subdirections) {
          rows.push({ level: 'subdirection', label: 'Subdirección', depth: 2, unit: subdirection,
            addChild: { level: 'management', label: 'gerencia', field: 'subdirection_id' } });
          for (const management of subdirection.managements) {
            rows.push({ level: 'management', label: 'Gerencia', depth: 3, unit: management,
              participants: management.participants });
          }
        }
      }
    }
    return rows;
  }
}
