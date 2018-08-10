import { Injectable } from '@angular/core';
import { Restaurante } from './restaurante';
import { RESTAURANTES } from './mock-restaurantes';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

@Injectable()
export class RestauranteService {

  constructor() { }

  getRestaurantes(): Observable<Restaurante[]>{
    return of(RESTAURANTES);
  }

  getRestaurante(id: number): Observable<Restaurante>{
    return of(RESTAURANTES.find(restaurante => restaurante.id === id));
  }

}
