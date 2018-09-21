import { Component, OnInit } from '@angular/core';
import { RestauranteFbService } from '../restaurante-fb.service';
import { Restaurante } from '../restaurante';
import { Router } from '@angular/router';
import { Upload } from '../upload';

@Component({
  selector: 'app-restaurante-add',
  templateUrl: './restaurante-add.component.html',
  styleUrls: ['./restaurante-add.component.css']
})
export class RestauranteAddComponent implements OnInit {

  private selectedFiles: FileList;
  private currentUpload: Upload;
  private restaurante: Restaurante;

  constructor(private restauranteService: RestauranteFbService, private router: Router) {
    this.restaurante = new Restaurante();
  }

  ngOnInit() {
  }

  add(){
    if ( this.restaurante.nome == null || this.restaurante.valor == null || this.restaurante.endereco == null || this.restaurante.imagem == null ) {
      alert("Preencha os campos!");
    } else {
      // this.restaurante.imagem = 'teste.jpg';
      // this.restauranteService.addRestaurante(this.restaurante);
      this.uploadSingle()
      this.limparCampos();
      this.voltar();
    }
  }

  detectFiles(event) {
      this.selectedFiles = event.target.files;
  }

  uploadSingle() {
      let file = this.selectedFiles.item(0);
      this.currentUpload = new Upload(file);
      this.restauranteService.pushUpload(this.currentUpload, this.restaurante, this.restaurante.nome, this.restaurante.valor, this.restaurante.endereco);
    }

  limparCampos() {
    this.restaurante.nome = null;
    this.restaurante.valor = null;
    this.restaurante.endereco = null;
  }

  voltar() {
    this.router.navigate(['restaurantes']);
  }

}
