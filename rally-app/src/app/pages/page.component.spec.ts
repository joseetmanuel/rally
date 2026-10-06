import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PagesComponent } from './pages.component';
import { MenuService } from '@services/menu/menu.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ConfigurationCenterService } from '@services/auth/configuration-center.service/configuration-center.service';

describe('PagesComponent', () => {
  let component: PagesComponent;
  let fixture: ComponentFixture<PagesComponent>;
  let menuServiceMock: jest.Mocked<MenuService>;
  let configurationService: ConfigurationCenterService;

  beforeEach(async () => {
    menuServiceMock = {
      setMenu: jest.fn(),
    } as unknown as jest.Mocked<MenuService>;
    configurationService =
      {} as unknown as jest.Mocked<ConfigurationCenterService>;

    await TestBed.configureTestingModule({
      declarations: [],
      imports: [PagesComponent, BrowserAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: MenuService, useValue: menuServiceMock },
        { provide: ConfigurationCenterService, useValue: configurationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PagesComponent);
    component = fixture.componentInstance;
    // El sidenav del arquetipo actualiza su título tras el primer chequeo; se omite checkNoChanges
    fixture.detectChanges(false);
  });

  it('should create the component', () => {
    localStorage.setItem(
      'auth',
      '{"name":"Diego Alejandro Meza Santamaria (Externo)","user":"e-dmeza"}',
    );
    expect(component).toBeTruthy();
  });
});
