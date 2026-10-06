import { Routes } from '@angular/router';
import { AuthHomeComponent } from './home/home.component';

export const ROUTES: Routes = [
	{ path: 'home', component: AuthHomeComponent },
	{ path: '', redirectTo: 'home', pathMatch: 'full' }
];
