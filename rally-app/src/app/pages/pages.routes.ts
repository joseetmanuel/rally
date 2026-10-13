import { Routes } from '@angular/router';
import { PagesComponent } from './pages.component';
import { ROUTES_CONSULTANTS } from './consultants/consultants.routes';
import { ROUTES_CERTIFICATIONS } from './certifications/certifications.routes';
import { ROUTES_CERTIFICATION_TYPES } from './certification-types/certification-types.routes';
import { ROUTES_COURSE_SESSIONS } from './course-sessions/course-sessions.routes';
import { ROUTES_EXTRA_POINTS } from './extra-points/extra-points.routes';
import { ROUTES_RANKING } from './ranking/ranking.routes';
import { ROUTES_DETAIL } from './detail/detail.routes';
import { ROUTES_RULES } from './rules/rules.routes';
import { ROUTES_ORG_STRUCTURE } from './org-structure/org-structure.routes';
import { adminGuard } from '../core/guards/admin/admin.guard';
import { ROUTES_TEAMS } from './teams/teams.routes';
import { ROUTES_CONSULTING_FIRMS } from './consulting-firms/consulting-firms.routes';

export const ROUTES: Routes = [
	{
		path: '',
		component: PagesComponent,
		data: { breadcrumb: 'Inicio' },
		children: [
			{
				// El ranking es la página de inicio
				path: 'home',
				data: { breadcrumb: 'Inicio' },
				loadChildren: () => ROUTES_RANKING
			},
			{
				path: 'detail',
				data: { breadcrumb: 'Detalle' },
				loadChildren: () => ROUTES_DETAIL
			},
			{
				path: 'rules',
				data: { breadcrumb: 'Bases' },
				loadChildren: () => ROUTES_RULES
			},
			{
				path: 'org-structure',
				canActivate: [adminGuard],
				data: { breadcrumb: 'Estructura' },
				loadChildren: () => ROUTES_ORG_STRUCTURE
			},
			{
				path: 'ranking',
				redirectTo: 'home',
				pathMatch: 'full'
			},
			{
				path: 'consultants',
				canActivate: [adminGuard],
				data: { breadcrumb: 'Consultores' },
				loadChildren: () => ROUTES_CONSULTANTS
			},
			{
				path: 'certifications',
				canActivate: [adminGuard],
				data: { breadcrumb: 'Certificaciones' },
				loadChildren: () => ROUTES_CERTIFICATIONS
			},
			{
				path: 'certification-types',
				canActivate: [adminGuard],
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
				canActivate: [adminGuard],
				data: { breadcrumb: 'Equipos' },
				loadChildren: () => ROUTES_TEAMS
			},
			{
				path: 'consulting-firms',
				canActivate: [adminGuard],
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
				redirectTo: 'home'
			},
			{
				path: '**',
				redirectTo: 'home'
			}
		]
	}
];
