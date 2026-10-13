import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { EditOrgUnitComponent, EditOrgUnitData } from './edit-org-unit.component';
import { OrgStructureService } from '../../../core/services/org-structure/org-structure.service';

describe('EditOrgUnitComponent', () => {
  const service = { update: jest.fn(), create: jest.fn() };
  const dialogRef = { close: jest.fn() };

  const create = async (data: EditOrgUnitData) => {
    await TestBed.configureTestingModule({
      imports: [EditOrgUnitComponent, NoopAnimationsModule],
      providers: [
        { provide: OrgStructureService, useValue: service },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data }
      ]
    }).compileComponents();
    const fixture = TestBed.createComponent(EditOrgUnitComponent);
    fixture.detectChanges();
    return fixture;
  };

  beforeEach(() => jest.clearAllMocks());

  it('edits an existing unit by id with the trimmed values', async () => {
    service.update.mockReturnValue(of({}));
    const fixture = await create({
      level: 'direction', unit: { id: 2, name: 'Core Bancario', head_name: 'Karla', head_consultant_id: null } });
    const c = fixture.componentInstance;
    expect(c.isEdit).toBe(true);
    expect(c.form.value).toEqual({ name: 'Core Bancario', head_name: 'Karla' });
    c.form.setValue({ name: '  Core Nuevo ', head_name: ' Karla Nueva ' });
    c.onSubmit();
    expect(service.update).toHaveBeenCalledWith('direction', 2, { name: 'Core Nuevo', head_name: 'Karla Nueva' });
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('creates a unit under its parent', async () => {
    service.create.mockReturnValue(of({}));
    const fixture = await create({ level: 'subdirection', parent: { field: 'direction_id', id: 2 } });
    const c = fixture.componentInstance;
    expect(c.isEdit).toBe(false);
    c.form.setValue({ name: 'Arquitectura', head_name: '' });
    c.onSubmit();
    expect(service.create).toHaveBeenCalledWith('subdirection', { name: 'Arquitectura', head_name: '', direction_id: 2 });
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('does not submit a blank name', async () => {
    const fixture = await create({ level: 'cto', parent: undefined });
    const c = fixture.componentInstance;
    c.form.setValue({ name: '   ', head_name: 'x' });
    expect(c.form.invalid).toBe(true);
    c.onSubmit();
    expect(service.create).not.toHaveBeenCalled();
    expect(service.update).not.toHaveBeenCalled();
  });

  it('explains a name that already exists under the same parent', async () => {
    service.update.mockReturnValue(throwError(() => ({ status: 409 })));
    const fixture = await create({
      level: 'management', unit: { id: 4, name: 'A', head_name: '', head_consultant_id: null } });
    fixture.componentInstance.onSubmit();
    expect(fixture.componentInstance.errorMessage).toContain('Ya existe');
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('closes with false when cancelled', async () => {
    const fixture = await create({ level: 'cto' });
    fixture.componentInstance.onCancel();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });
});
