/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { TestBed } from '@angular/core/testing';
import { BreadcrumbService } from './breadcrumb.service';
import { Breadcrumb } from '@models/breadcrumb/Breadcrumb';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter, of } from 'rxjs';

describe('BreadcrumbService', () => {
	let breadcrumbService: BreadcrumbService;
	let router: Router;
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule],
			providers: [BreadcrumbService, Router]
		});
	});

	beforeEach(() => {
		breadcrumbService = TestBed.inject(BreadcrumbService);
		router = TestBed.inject(Router);
	});

	it('should be created', () => {
		expect(breadcrumbService).toBeTruthy();
	});

	it('should exist breadcrumbs observable', () => {
		breadcrumbService.breadcrumbs$.subscribe((x) => {
			expect(x).toEqual([]);
		});
	});

	it('should exist breadcrumbs observable', () => {
		jest.spyOn<any, any>(breadcrumbService, 'addBreadcrumb');
		const root: any = {
			url: [{ path: 'test' }],
			data: { breadcrumb: 'Test breadcrumb' }
		};
		const breadcrumbs: Breadcrumb[] = [];
		breadcrumbService['addBreadcrumb'](root, [], breadcrumbs);
		expect(breadcrumbService['addBreadcrumb']).toHaveBeenCalled();
	});

	it('should getLabel() return breadcrumb', () => {
		jest.spyOn<any, any>(breadcrumbService, 'getLabel');
		const respExpect = 'test';
		const resp = breadcrumbService['getLabel']({ breadcrumb: 'test' });
		expect(resp).toEqual(respExpect);
		expect(breadcrumbService['getLabel']).toHaveBeenCalled();
	});

	it('should watchRoute() ', () => {
		jest.spyOn<any, any>(breadcrumbService, 'watchRoute');
		const resp = breadcrumbService['watchRoute']();
		expect(breadcrumbService['watchRoute']).toHaveBeenCalled();
	});
	it('should call watchRoute', () => {
		const routerEventsSpy = jest
			.spyOn(router.events, 'pipe')
			.mockReturnValue(of(new NavigationEnd(0, '', '')));
		jest.spyOn<any, any>(breadcrumbService, 'watchRoute');
		const resp = breadcrumbService['watchRoute']();
		expect(breadcrumbService['watchRoute']).toHaveBeenCalled();
		expect(routerEventsSpy).toHaveBeenCalled();
	});
});
