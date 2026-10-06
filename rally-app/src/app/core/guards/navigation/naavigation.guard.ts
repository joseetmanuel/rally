// ANGULAR
import { Injectable } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	Router,
	RouterStateSnapshot
} from '@angular/router';
import { Section } from '@models/section/Section';
import { AuthenticationConfigurationService } from '@services/auth/authentication-configuration/authentication-configuration-service.service';
// SERVICES
import { MenuConfigurationService } from '@services/auth/menu-configuration/menu-configuration.service';
import { firstValueFrom, map } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class NavegationGuard {
	menu!: Section[];
	constructor(
		private router: Router,
		private menuConfiguartionService: MenuConfigurationService,
		private authenticationConfigurationService: AuthenticationConfigurationService
	) {}

	async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		let _url = '';
		state.url.split('/').forEach((element) => {
			if (_url === '') if (element !== '') _url = element;
		});
		const routes = await this.validateAccesToMenu(state.url || '');
		if (routes.length === 0) {
			this.router.navigate(['/auth/login']);
			return false;
		}
		return true;
	}

	canLoad() {
		return this.validateAuthentication();
	}

	validateAuthentication() {
		if (!this.authenticationConfigurationService.isUserAuthenticated) {
			this.router.navigate(['/auth/login']);
			return false;
		}
		return true;
	}

	flatPermissions(items: Section[]): Section[] {
		return items.reduce((acc: Section[], curr: Section) => {
			let permissions: Section[] = [curr];
			if (curr?.children) {
				permissions.push(...this.flatPermissions(curr.children!));
			}

			permissions = permissions.filter((x) => [2, 4].includes(x.typeSectionId));
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
				typeSectionId: x.typeSectionId
			}));

			return [...acc, ...permissions];
		}, []);
	}

	validateAccesToMenu(url: string) {
		return firstValueFrom(
			this.menuConfiguartionService.getMenu().pipe(
				map((x: Section[]) => this.flatPermissions(x)),
				map((x: Section[]) => x.filter((r: Section) => url.includes(r.route)))
			)
		);
	}
}
