import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { SidenavComponent } from './sidenav.component';
import { SidenavService } from '@services/sidenav/sidenav.service';
import { provideAdminSession } from '../../../core/testing/admin-session.mock';

describe('SidenavComponent (cajón de navegación del móvil)', () => {
  let fixture: ComponentFixture<SidenavComponent>;
  const sidenavService = { closeNav: jest.fn(), openNav: jest.fn(), toggle: jest.fn(), appDrawer: null as any };

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [SidenavComponent, NoopAnimationsModule],
      providers: [provideRouter([{ path: '**', children: [] }]), provideAdminSession(false), { provide: SidenavService, useValue: sidenavService }]
    }).compileComponents();
    fixture = TestBed.createComponent(SidenavComponent);
    fixture.detectChanges(false);
    fixture.componentInstance.ngAfterViewInit?.();
    fixture.detectChanges(false);
  });

  const links = () => Array.from(fixture.nativeElement.querySelectorAll('.sidebar-nav a')) as HTMLAnchorElement[];

  it('lists every screen of the menu as a link', () => {
    const names = links().map((a) => a.textContent?.trim());
    expect(names).toEqual(['Inicio', 'Detalle', 'Consultores', 'Cursos', 'Puntos Extra',
      'Equipos', 'Consultoras', 'Tipos de certificación', 'Certificaciones']);
  });

  it('points every link inside the app (/app/...), never to a bare route', () => {
    // Regresión: antes navegaba a "consultants" sin /app/, que no existe y regresaba a la pantalla de bienvenida
    const hrefs = links().map((a) => a.getAttribute('href'));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(href).toMatch(/^\/app\/[a-z-]+$/);
    expect(hrefs).toContain('/app/consultants');
    expect(hrefs).toContain('/app/home');
  });

  it('shows the Catálogos group open, with its screens, and the title is not a link', () => {
    const title = fixture.nativeElement.querySelector('.group-title') as HTMLElement;
    expect(title.textContent?.trim()).toBe('Catálogos');
    expect(title.closest('a')).toBeNull();
    const group = Array.from(fixture.nativeElement.querySelectorAll('.sub-list a') as NodeListOf<HTMLAnchorElement>);
    expect(group.map((a) => a.getAttribute('href'))).toEqual([
      '/app/teams', '/app/consulting-firms', '/app/certification-types', '/app/certifications']);
  });

  it('closes the drawer after choosing an option', () => {
    links()[2].click();
    expect(sidenavService.closeNav).toHaveBeenCalledTimes(1);
  });

  it('does not close the drawer when only the group title is tapped', () => {
    (fixture.nativeElement.querySelector('.group-title') as HTMLElement).click();
    expect(sidenavService.closeNav).not.toHaveBeenCalled();
  });
});
