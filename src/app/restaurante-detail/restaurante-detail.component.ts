import { Restaurante } from '../restaurante';
import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { RestauranteFbService } from '../restaurante-fb.service';

@Component({
  selector: 'app-restaurante-detail',
  templateUrl: './restaurante-detail.component.html',
  styleUrls: ['./restaurante-detail.component.css']
})
export class RestauranteDetailComponent implements OnInit {

  @Input() restaurante : Restaurante;

  constructor(
    private route: ActivatedRoute,
    private restauranteService: RestauranteFbService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.getRestaurante();
  }

  getRestaurante(): void {
    const id = this.route.snapshot.paramMap.get('key');
    this.restauranteService.getRestaurante(id)
      .subscribe(restaurante => this.restaurante = restaurante);
  }

  goBack(): void{
    this.location.back();
  }

}
