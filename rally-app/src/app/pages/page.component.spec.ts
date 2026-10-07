import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PagesComponent } from './pages.component';
import { MenuService } from '@services/menu/menu.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ConfigurationCenterService } from '@services/auth/configuration-center.service/configuration-center.service';
import { provideAdminSession } from '../core/testing/admin-session.mock';
import { RALLY_DISCLAIMER } from '@constants/Disclaimer';

describe('PagesComponent', () => {
  let component: PagesComponent;
  let fixture: ComponentFixture<PagesComponent>;
  let menuServiceMock: jest.Mocked<MenuService>;
  const adminSession = provideAdminSession(false);
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
        adminSession,
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

  it('recreates the current screen when the profile changes so it reloads its data', () => {
    const before = fixture.nativeElement.querySelector('router-outlet');
    expect(before).not.toBeNull();
    adminSession.useValue.setAdmin(true); // inicia sesión
    fixture.detectChanges(false);
    const afterLogin = fixture.nativeElement.querySelector('router-outlet');
    expect(afterLogin).not.toBe(before);
    adminSession.useValue.setAdmin(false); // cierra sesión
    fixture.detectChanges(false);
    expect(fixture.nativeElement.querySelector('router-outlet')).not.toBe(afterLogin);
  });

  it('shows the rally disclaimer at the end of every page', () => {
    const note = fixture.nativeElement.querySelector('app-disclaimer p[role="note"]');
    expect(note?.textContent?.trim()).toBe(RALLY_DISCLAIMER);
  });
});
