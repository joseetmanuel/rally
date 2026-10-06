// ANGULAR
import { Injectable } from '@angular/core';
// LIBS
import { BehaviorSubject, Observable, of } from 'rxjs';
// MODELS
import { Section } from '@models/section/Section';

@Injectable({
        providedIn: 'root'
})
export class MenuConfigurationService {
        constructor() {
        }

        startConfiguration(sections: Section[]) {
        }

        resetConfiguration() {
        }

        getMenu(): Observable<Section[]> {
                return of([
                        {
                                id: 1,
                                name: 'Inicio',
                                icon: 'home',
                                route: 'home',
                                inMenu: 1,
                                children: []
                        },
                        {
                                id: 7,
                                name: 'Ranking',
                                icon: 'emoji_events',
                                route: 'ranking',
                                inMenu: 1,
                                children: []
                        },
                        {
                                id: 2,
                                name: 'Consultores',
                                icon: 'people',
                                route: 'consultants',
                                inMenu: 1,
                                children: []
                        },
                        {
                                id: 3,
                                name: 'Tipos Cert.',
                                icon: 'category',
                                route: 'certification-types',
                                inMenu: 1,
                                children: []
                        },
                        {
                                id: 4,
                                name: 'Certificaciones',
                                icon: 'workspace_premium',
                                route: 'certifications',
                                inMenu: 1,
                                children: []
                        },
                        {
                                id: 5,
                                name: 'Cursos',
                                icon: 'school',
                                route: 'course-sessions',
                                inMenu: 1,
                                children: []
                        },
                        {
                                id: 6,
                                name: 'Puntos Extra',
                                icon: 'stars',
                                route: 'extra-points',
                                inMenu: 1,
                                children: []
                        }
                ] as unknown as Section[]);
        }

        get validatePermissions() {
                return false;
        }
}
