import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MenuConfigurationService } from '@services/auth/menu-configuration/menu-configuration.service';
import { BehaviorSubject, filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SidenavService {
  public appDrawer: any;
  public currentUrl = new BehaviorSubject<string>('');

  constructor(
    private router: Router,
    private menuConfiguartion: MenuConfigurationService,
  ) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((ev: NavigationEnd) => {
        this.currentUrl.next(ev.urlAfterRedirects);
      });
  }

  public closeNav() {
    this.appDrawer.close();
  }

  public openNav() {
    this.appDrawer.open();
  }
  public toggle(): void {
    this.appDrawer ? this.appDrawer.toggle() : null;
  }
}
