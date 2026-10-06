import { Component, HostBinding, input, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { SidenavService } from '@services/sidenav/sidenav.service';
import { SharedModule } from '@shared/shared.module';
import { Section } from '@models/section/Section';

@Component({
  selector: 'app-menu-list-item',
  templateUrl: './menu-list-item.component.html',
  styleUrls: ['./menu-list-item.component.scss'],
  imports: [SharedModule],
  animations: [
    trigger('indicatorRotate', [
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      state('expanded', style({ transform: 'rotate(180deg)' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4,0.0,0.2,1)'),
      ),
    ]),
  ],
})
export class MenuListItemComponent implements OnInit {
  expanded: boolean = false;
  data: any;
  @HostBinding('attr.aria-expanded') ariaExpanded = this.expanded;
  item = input.required<Section>();
  depth = input.required<number>();

  constructor(
    public navService: SidenavService,
    public router: Router,
  ) {
  }

  ngOnInit() {
    const currentItem = this.item();
    const childs = currentItem.children ? currentItem.children.filter((child: any) => child.inMenu == 1) : [];
    this.data = currentItem;
    this.data.children = childs;

    this.navService.currentUrl.subscribe((url: string) => {
      if (currentItem.route && url) {
        this.expanded = url.indexOf(`/${currentItem.route}`) === 0;
        this.ariaExpanded = this.expanded;
      }
    });
  }

  onItemSelected(item: Section) {
    if (!item.children || !item.children.length) {
      this.router.navigate([item.route]);
      this.navService.closeNav();
    }
    if (item.children && item.children.length) {
      this.expanded = !this.expanded;
    }
  }
}
