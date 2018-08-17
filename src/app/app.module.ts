import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { RestaurantesComponent } from './restaurantes/restaurantes.component';
import { RestauranteDetailComponent } from './restaurante-detail/restaurante-detail.component';
import { RestauranteService } from './restaurante.service';
import { RestauranteFbService } from './restaurante-fb.service';
import { AuthenticationService } from './authentication.service';
import { AppRoutingModule } from './/app-routing.module';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { HomePageComponent } from './home-page/home-page.component';
import { RestauranteAddComponent } from './restaurante-add/restaurante-add.component';

const config = {
    apiKey: "AIzaSyCp4yTKMviZ97dl7tRHqu4qK-5rXcBEZEs",
    authDomain: "restaurantetopzera.firebaseapp.com",
    databaseURL: "https://restaurantetopzera.firebaseio.com",
    projectId: "restaurantetopzera",
    storageBucket: "restaurantetopzera.appspot.com",
    messagingSenderId: "127547096806"
  };


@NgModule({
  declarations: [
    AppComponent,
    RestaurantesComponent,
    RestauranteDetailComponent,
    HomePageComponent,
    RestauranteAddComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(config),
    AngularFireDatabaseModule,
    AngularFireAuthModule
  ],
  providers: [
    RestauranteService,
    RestauranteFbService,
    AuthenticationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
