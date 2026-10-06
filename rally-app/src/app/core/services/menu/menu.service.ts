import { Injectable } from '@angular/core';
import { ToolbarComponent } from '@shared/components/toolbar/toolbar.component';

@Injectable({ providedIn: 'root' })
export class MenuService {
	private menu: ToolbarComponent | undefined;

	public setMenu(menu: ToolbarComponent) {
		this.menu = menu;
	}

	public setCloseIcon() {
		if (this.menu) this.menu.collapse = false;
	}
	public setOpenIcon() {
		if (this.menu) this.menu.collapse = true;
	}
}
