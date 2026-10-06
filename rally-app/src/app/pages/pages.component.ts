import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MenuService } from '@services/menu/menu.service';
import { SidenavComponent } from '@shared/components/sidenav/sidenav.component';
import { ToolbarComponent } from '@shared/components/toolbar/toolbar.component';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss'],
  imports: [SidenavComponent],
})
export class PagesComponent implements AfterViewInit {
  @ViewChild('menu') menu!: ToolbarComponent;

  constructor(public menuServ: MenuService) {}

  ngAfterViewInit(): void {
    this.menuServ.setMenu(this.menu);
  }
}
