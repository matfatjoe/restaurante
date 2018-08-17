import { Injectable } from '@angular/core';
import { Restaurante } from './restaurante';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class RestauranteFbService {

  private restaurantes: Observable<Restaurante[]>;
  private restaurantesFireList: AngularFireList<Restaurante>;
  private restaurante: Observable<Restaurante>;

  constructor(private db: AngularFireDatabase) {
    this.restaurantesFireList = db.list<Restaurante>('restaurantes');

    this.restaurantes = this.restaurantesFireList.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );
  }

  addRestaurante(newRestaurante: Restaurante) : void {
    this.restaurantesFireList.push(newRestaurante);
  }

  updatedRestaurante(key: string, updatedRestaurante: Restaurante): void {
    const resturanteRef = this.db.object(`restaurantes/${key}`);
    resturanteRef.update({nome: updatedRestaurante.nome, endereco: updatedRestaurante.endereco, valor: updatedRestaurante.valor, imagem: updatedRestaurante.imagem});
  }

  deleteRestaurante(key: string) {
    const resturanteRef = this.db.object(`restaurantes/${key}`);
    resturanteRef.remove();
  }

  getRestaurantes(): Observable<Restaurante[]> {
    return this.restaurantes;
  }

  getRestaurante(key: string): Observable<Restaurante> {
    this.restaurante = <Observable<Restaurante>>this.db.object(`restaurantes/${key}`).valueChanges();
    return this.restaurante;
  }



}
