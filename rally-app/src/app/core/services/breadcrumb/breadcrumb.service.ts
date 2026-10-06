/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { NavigationEnd, Router, ActivatedRouteSnapshot } from '@angular/router';
// RXJS
import { filter, BehaviorSubject } from 'rxjs';
// MODELOS
import { Breadcrumb } from '@models/breadcrumb/Breadcrumb';

@Injectable({
	providedIn: 'root'
})
export class BreadcrumbService {
	private readonly _breadcrumbs$ = new BehaviorSubject<Breadcrumb[]>([]);
	readonly breadcrumbs$ = this._breadcrumbs$.asObservable();

	constructor(private router: Router) {
		this.watchRoute();
	}

	private watchRoute() {
		this.router.events
			.pipe(filter((event) => event instanceof NavigationEnd))
			.subscribe(() => {
				const root = this.router.routerState.snapshot.root;
				const breadcrumbs: any[] = [];
				this.addBreadcrumb(root, [], breadcrumbs);
				this._breadcrumbs$.next(breadcrumbs);
			});
	}

	private addBreadcrumb(
		route: ActivatedRouteSnapshot,
		parentUrl: string[],
		breadcrumbs: Breadcrumb[]
	) {
		if (route) {
			const routeUrl = parentUrl.concat(route.url.map((url) => url.path));
			if (route.data?.['breadcrumb']) {
				const preventRedirect = route.data?.['preventRedirect'] || false;
				const urlRedirect = route.data?.['redirect'];
				const breadcrumb = {
					label: this.getLabel(route.data),
					url: urlRedirect || '/' + routeUrl.join('/'),
					preventRedirect
				};
				breadcrumbs.push(breadcrumb);
			}
			this.addBreadcrumb(route.firstChild!, routeUrl, breadcrumbs);
		}
	}

	private getLabel(data: any): string {
		return typeof data.breadcrumb === 'function'
			? data.breadcrumb(data)
			: data.breadcrumb;
	}
}
