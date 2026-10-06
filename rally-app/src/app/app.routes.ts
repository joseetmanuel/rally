import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: 'auth',
		loadChildren: () =>
			import('src/app/pages/auth/auth.routes').then((m) => m.ROUTES)
	},
	{
		path: 'app',
		loadChildren: () =>
			import('src/app/pages/pages.routes').then((m) => m.ROUTES)
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'auth'
	},
	{
		path: '**',
		redirectTo: 'auth'
	}
];
