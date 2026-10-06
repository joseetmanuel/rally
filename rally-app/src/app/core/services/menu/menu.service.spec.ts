import { TestBed } from '@angular/core/testing';
import { MenuService } from './menu.service';
import { ToolbarComponent } from '@shared/components/toolbar/toolbar.component';

describe('MenuService', () => {
  let service: MenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MenuService],
    });
    service = TestBed.inject(MenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setMenu', () => {
    it('should set the menu instance', () => {
      const mockMenu = { collapse: true } as ToolbarComponent;
      service.setMenu(mockMenu);
      expect((service as any).menu).toBe(mockMenu); // Accede a la propiedad privada
    });
  });

  describe('setCloseIcon', () => {
    it('should set menu.collapse to false if menu is defined', () => {
      const mockMenu = { collapse: true } as ToolbarComponent;
      service.setMenu(mockMenu);

      service.setCloseIcon();
      expect(mockMenu.collapse).toBe(false);
    });

    it('should not throw an error if menu is undefined', () => {
      expect(() => service.setCloseIcon()).not.toThrow();
    });
  });

  describe('setOpenIcon', () => {
    it('should set menu.collapse to true if menu is defined', () => {
      const mockMenu = { collapse: false } as ToolbarComponent;
      service.setMenu(mockMenu);

      service.setOpenIcon();
      expect(mockMenu.collapse).toBe(true);
    });

    it('should not throw an error if menu is undefined', () => {
      expect(() => service.setOpenIcon()).not.toThrow();
    });
  });
});
