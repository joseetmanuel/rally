import { TemplateRef, ViewContainerRef, Renderer2 } from '@angular/core';
import { LocalStorageService } from '@services/storage/localstorage/localstorage.service';
import { PermissionInputDirective } from './inputs.directive';

describe('PermissionInputDirective', () => {
  let directive: PermissionInputDirective;
  let mockTemplateRef: jest.Mocked<TemplateRef<any>>;
  let mockViewContainerRef: jest.Mocked<ViewContainerRef>;
  let mockLocalStorage: jest.Mocked<LocalStorageService>;
  let mockRenderer: jest.Mocked<Renderer2>;

  beforeEach(() => {
    mockTemplateRef = {
      elementRef: {} as any,
    } as jest.Mocked<TemplateRef<any>>;

    mockViewContainerRef = {
      createEmbeddedView: jest.fn(),
      clear: jest.fn(),
    } as jest.Mocked<any>;

    mockLocalStorage = {
      getObject: jest.fn(),
    } as jest.Mocked<any>;

    mockRenderer = {} as jest.Mocked<Renderer2>;

    directive = new PermissionInputDirective(
      mockTemplateRef,
      mockViewContainerRef,
      mockLocalStorage,
      mockRenderer,
    );
  });

  it('debería crearse correctamente', () => {
    expect(directive).toBeTruthy();
  });

  describe('appInputPermission setter', () => {
    it('debería configurar el módulo y llamar a checkPermission si validar es 2', () => {
      const checkPermissionSpy = jest.spyOn(
        directive as any,
        'checkPermission',
      );
      directive.appInputPermission = [
        '/acg-frontend/module',
        'somePermission',
        2,
      ];

      expect(directive.modulo).toBe('/acg-frontend/module');
      expect(directive.permission).toBe('somePermission');
      expect(checkPermissionSpy).toHaveBeenCalled();
    });

    it('no debería llamar a checkPermission si validar no es 2', () => {
      const checkPermissionSpy = jest.spyOn(
        directive as any,
        'checkPermission',
      );
      directive.appInputPermission = [
        '/acg-frontend/module',
        'somePermission',
        1,
      ];

      expect(directive.modulo).toBe('/acg-frontend/module');
      expect(directive.permission).toBe('somePermission');
      expect(checkPermissionSpy).not.toHaveBeenCalled();
    });
  });

  describe('checkPermission', () => {
    it('debería limpiar el contenedor y crear una vista si el permiso es válido', () => {
      const permissions = [
        {
          route: 'module',
          children: [{ route: 'somePermission', typeSectionId: 2 }],
        },
      ];
      mockLocalStorage.getObject.mockReturnValue(permissions);

      directive.modulo = 'module';
      directive.permission = 'somePermission';
      directive['checkPermission']();

      expect(mockViewContainerRef.clear).toHaveBeenCalled();
      expect(mockViewContainerRef.createEmbeddedView).toHaveBeenCalledWith(
        mockTemplateRef,
      );
    });

    it('debería limpiar el contenedor y no crear una vista si el permiso no es válido', () => {
      const permissions = [
        {
          route: 'module',
          children: [{ route: 'otherPermission', typeSectionId: 2 }],
        },
      ];
      mockLocalStorage.getObject.mockReturnValue(permissions);

      directive.modulo = 'module';
      directive.permission = 'somePermission';
      directive['checkPermission']();

      expect(mockViewContainerRef.clear).toHaveBeenCalled();
      expect(mockViewContainerRef.createEmbeddedView).not.toHaveBeenCalled();
    });
  });
});
