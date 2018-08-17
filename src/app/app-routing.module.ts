import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RestaurantesComponent } from './restaurantes/restaurantes.component';
import { RestauranteDetailComponent } from './restaurante-detail/restaurante-detail.component';
import { RestauranteAddComponent } from './restaurante-add/restaurante-add.component';

import { HomePageComponent } from './home-page/home-page.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: HomePageComponent },
  { path: 'restaurantes', component: RestaurantesComponent },
  { path: 'restaurantes/detail/:key', component: RestauranteDetailComponent },
  { path: 'add', component: RestauranteAddComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
