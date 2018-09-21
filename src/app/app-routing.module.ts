import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RestaurantesComponent } from './restaurantes/restaurantes.component';
import { RestauranteDetailComponent } from './restaurante-detail/restaurante-detail.component';
import { HomePageComponent } from './home-page/home-page.component';
import { RestauranteAddComponent } from './restaurante-add/restaurante-add.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: HomePageComponent },
  { path: 'restaurantes', component: RestaurantesComponent },
  { path: 'restaurantes/add', component: RestauranteAddComponent },
  { path: 'restaurantes/detail/:key', component: RestauranteDetailComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
