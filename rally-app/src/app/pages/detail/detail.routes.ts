import { Routes } from '@angular/router';
import { DetailComponent } from './detail.component';

export const ROUTES_DETAIL: Routes = [
  // /detail abre al líder; /detail/:id abre a un participante concreto
  { path: '', component: DetailComponent },
  { path: ':id', component: DetailComponent }
];
