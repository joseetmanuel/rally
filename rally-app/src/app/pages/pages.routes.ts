import { Routes } from '@angular/router';
import { PagesComponent } from './pages.component';
import { HomeComponent } from './home/home.component';
import { ROUTES_CONSULTANTS } from './consultants/consultants.routes';
import { ROUTES_CERTIFICATIONS } from './certifications/certifications.routes';
import { ROUTES_CERTIFICATION_TYPES } from './certification-types/certification-types.routes';
import { ROUTES_COURSE_SESSIONS } from './course-sessions/course-sessions.routes';
import { ROUTES_EXTRA_POINTS } from './extra-points/extra-points.routes';
import { ROUTES_RANKING } from './ranking/ranking.routes';
import { ROUTES_TEAMS } from './teams/teams.routes';
import { ROUTES_CONSULTING_FIRMS } from './consulting-firms/consulting-firms.routes';

export const ROUTES: Routes = [
	{
		path: '',
		component: PagesComponent,
		data: { breadcrumb: 'Inicio' },
		children: [
			{
				path: 'home',
				component: HomeComponent
			},
			{
				path: 'ranking',
				data: { breadcrumb: 'Ranking' },
				loadChildren: () => ROUTES_RANKING
			},
			{
				path: 'consultants',
				data: { breadcrumb: 'Consultores' },
				loadChildren: () => ROUTES_CONSULTANTS
			},
			{
				path: 'certifications',
				data: { breadcrumb: 'Certificaciones' },
				loadChildren: () => ROUTES_CERTIFICATIONS
			},
			{
				path: 'certification-types',
				data: { breadcrumb: 'Tipos de Certificación' },
				loadChildren: () => ROUTES_CERTIFICATION_TYPES
			},
			{
				path: 'course-sessions',
				data: { breadcrumb: 'Cursos Impartidos' },
				loadChildren: () => ROUTES_COURSE_SESSIONS
			},
			{
				path: 'teams',
				data: { breadcrumb: 'Equipos' },
				loadChildren: () => ROUTES_TEAMS
			},
			{
				path: 'consulting-firms',
				data: { breadcrumb: 'Consultoras' },
				loadChildren: () => ROUTES_CONSULTING_FIRMS
			},
			{
				path: 'extra-points',
				data: { breadcrumb: 'Puntos Extra' },
				loadChildren: () => ROUTES_EXTRA_POINTS
			},
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'ranking'
			},
			{
				path: '**',
				redirectTo: 'ranking'
			}
		]
	}
];
