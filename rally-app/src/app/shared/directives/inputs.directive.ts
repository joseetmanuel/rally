import {
  Directive,
  EmbeddedViewRef,
  Injectable,
  Input,
  Renderer2,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { KEYS_STORAGE } from '@constants/KeysStorage';
import { Section } from '@models/section/Section';
import { LocalStorageService } from '@services/storage/localstorage/localstorage.service';

@Directive({
  selector: `[appInputPermission]`,
  standalone: true,
})
@Injectable({ providedIn: `root` })
export class PermissionInputDirective {
  permission!: string;
  modulo: string = '';
  view!: EmbeddedViewRef<any>;
  childrens: any;
  constructor(
    public templateRef: TemplateRef<any>,
    public viewContainer: ViewContainerRef,
    public localStorage: LocalStorageService,
    private _renderer: Renderer2,
  ) {}

  @Input()
  set appInputPermission([modulo, permission, validar]: [
    string,
    string,
    number,
  ]) {
    this.view = this.viewContainer.createEmbeddedView(this.templateRef);
    this.permission = permission;

    //this.modulo = modulo.replace('/acg-frontend', '');
    this.modulo = modulo.replace('', '');
    if (validar == 2) this.checkPermission();
  }

  private checkPermission() {
    this.viewContainer.clear();
    const permissions =
      (this.localStorage.getObject(KEYS_STORAGE.menu) as Section[]) || [];

    console.log('permisions', permissions);
    console.log('modulo', this.modulo);
    const modulePermissions = permissions.filter(
      (x: Section) => x.route === this.modulo,
    )[0];
    console.log('modulePermissions', modulePermissions);
    this.childrens = this.flatPermissions(modulePermissions?.children || []);
    console.log('childrens', this.childrens);
    console.log('permision', this.permission);

    const hasPermissions = this.childrens.some(
      (x: any) => x.route === this.permission,
    );
    console.log('hasPermissions', hasPermissions);
    if (hasPermissions) this.viewContainer.createEmbeddedView(this.templateRef);
  }

  flatPermissions(items: Section[]): Section[] {
    return items.reduce((acc: Section[], curr: Section) => {
      let permissions: Section[] = [curr];
      if (curr?.children) {
        permissions.push(...this.flatPermissions(curr.children!));
      }

      permissions = permissions.filter((x) =>
        [2, 4, 5].includes(x.typeSectionId),
      );
      permissions = permissions.map((x) => ({
        expanded: x.expanded,
        id: x.id,
        inMenu: x.inMenu,
        name: x.name,
        order: x.order,
        route: x.route,
        sectionFatherId: x.sectionFatherId,
        status: x.status,
        systemId: x.systemId,
        typeSectionId: x.typeSectionId,
      }));

      return [...acc, ...permissions];
    }, []);
  }
}
