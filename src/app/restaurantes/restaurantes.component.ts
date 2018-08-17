import { Component, OnInit } from '@angular/core';
import { Restaurante } from '../restaurante';
import { RestauranteFbService } from '../restaurante-fb.service';

@Component({
  selector: 'app-restaurantes',
  templateUrl: './restaurantes.component.html',
  styleUrls: ['./restaurantes.component.css']
})
export class RestaurantesComponent implements OnInit {

  restaurantes: Restaurante[];

  constructor(private restauranteService: RestauranteFbService) { }

  ngOnInit() {
    this.getRestaurantes();
  }

  getRestaurantes(): void {
    this.restauranteService.getRestaurantes()
      .subscribe(restaurantes => this.restaurantes = restaurantes);
  }

  delete(key: string): void {
    this.restauranteService.deleteRestaurante(key);
  }

}
