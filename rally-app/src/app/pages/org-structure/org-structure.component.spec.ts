import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { OrgStructureComponent } from './org-structure.component';
import { OrgStructureService } from '../../core/services/org-structure/org-structure.service';

const TREE: any[] = [{
  id: 1, name: 'Tecnología', head_name: 'Óscar', head_consultant_id: null,
  directions: [{
    id: 2, name: 'Core Bancario', head_name: 'Karla', head_consultant_id: null, cto_id: 1,
    subdirections: [{
      id: 3, name: 'Ingeniería de Software', head_name: 'Teodoro', head_consultant_id: null, direction_id: 2, cto_id: 1,
      managements: [{
        id: 4, name: 'Reingeniería de Software', head_name: 'José', head_consultant_id: null,
        subdirection_id: 3, direction_id: 2, cto_id: 1, participants: 26
      }]
    }]
  }]
}];

describe('OrgStructureComponent', () => {
  let fixture: ComponentFixture<OrgStructureComponent>;
  let component: OrgStructureComponent;
  const service = { getTree: jest.fn() };
  const dialog = { open: jest.fn() };

  const create = async (tree: any) => {
    service.getTree.mockReturnValue(tree);
    await TestBed.configureTestingModule({
      imports: [OrgStructureComponent, NoopAnimationsModule],
      providers: [{ provide: OrgStructureService, useValue: service }]
    }).overrideProvider(MatDialog, { useValue: dialog }).compileComponents();
    fixture = TestBed.createComponent(OrgStructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(() => {
    jest.clearAllMocks();
    dialog.open.mockReturnValue({ afterClosed: () => of(false) });
  });

  it('shows the four levels in order, with who heads each one and the participants of the management', async () => {
    await create(of(TREE));
    const text = (fixture.nativeElement as HTMLElement).textContent!;
    const nodes = Array.from(fixture.nativeElement.querySelectorAll('.node')) as HTMLElement[];
    expect(nodes.map((n) => n.querySelector('.node__name')?.textContent?.trim())).toEqual([
      'Tecnología', 'Core Bancario', 'Ingeniería de Software', 'Reingeniería de Software']);
    expect(nodes.map((n) => n.querySelector('.node__level')?.textContent?.trim())).toEqual([
      'CTO', 'Dirección', 'Subdirección', 'Gerencia']);
    expect(text).toContain('Óscar');
    expect(text).toContain('Karla');
    expect(text).toContain('Teodoro');
    expect(text).toContain('26 participantes');
  });

  it('indents each level a bit more than the previous one', async () => {
    await create(of(TREE));
    const margins = Array.from(fixture.nativeElement.querySelectorAll('.node') as NodeListOf<HTMLElement>)
      .map((n) => parseInt(n.style.marginLeft, 10));
    expect(margins).toEqual([0, 20, 40, 60]);
  });

  it('offers to add a child under CTO, Dirección and Subdirección, but not under a Gerencia', async () => {
    await create(of(TREE));
    const adds = Array.from(fixture.nativeElement.querySelectorAll('.node__add')) as HTMLElement[];
    expect(adds.map((b) => b.textContent?.replace('add', '').trim())).toEqual([
      'Agregar dirección', 'Agregar subdirección', 'Agregar gerencia']);
  });

  it('opens the dialog to edit a unit by id and reloads when it was saved', async () => {
    await create(of(TREE));
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    service.getTree.mockClear();
    component.edit(component.rows[1]);
    const config = dialog.open.mock.calls[0][1];
    expect(config.data.level).toBe('direction');
    expect(config.data.unit.id).toBe(2);
    expect(service.getTree).toHaveBeenCalledTimes(1);
  });

  it('does not reload when the dialog is cancelled', async () => {
    await create(of(TREE));
    service.getTree.mockClear();
    component.edit(component.rows[0]);
    expect(service.getTree).not.toHaveBeenCalled();
  });

  it('adds a child with the parent field the server expects', async () => {
    await create(of(TREE));
    component.add(component.rows[2]); // subdirección -> gerencia
    expect(dialog.open.mock.calls[0][1].data).toEqual({
      level: 'management', parent: { field: 'subdirection_id', id: 3 } });
    component.add(component.rows[3]); // una gerencia no tiene hijos
    expect(dialog.open).toHaveBeenCalledTimes(1);
  });

  it('shows a message when the structure cannot be loaded', async () => {
    await create(throwError(() => ({ error: { error: 'authentication required' } })));
    expect(fixture.nativeElement.querySelector('.error-message').textContent).toContain('authentication required');
    expect(component.loading).toBe(false);
  });
});
