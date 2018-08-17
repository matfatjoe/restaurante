import { Component, OnInit } from '@angular/core';
import { Restaurante } from '../restaurante';
import { RestauranteFbService } from '../restaurante-fb.service';

@Component({
  selector: 'app-restaurante-add',
  templateUrl: './restaurante-add.component.html',
  styleUrls: ['./restaurante-add.component.css']
})
export class RestauranteAddComponent implements OnInit {

  private restaurante: Restaurante;

  constructor(private restauranteService: RestauranteFbService) {
    this.restaurante = new Restaurante();
  }

  ngOnInit() {
  }

  add() {
    this.restaurante.imagem = "default.png";
    this.restauranteService.addRestaurante(this.restaurante);
  }
}
