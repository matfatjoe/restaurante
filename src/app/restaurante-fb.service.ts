import { Injectable } from '@angular/core';
import { Restaurante } from './restaurante';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Upload } from './upload';
import * as firebase from 'firebase';

@Injectable()
export class RestauranteFbService {

  private restaurantes: Observable<Restaurante[]>;
  private restaurantesFireList: AngularFireList<Restaurante>;
  private fotosFireList: AngularFireList<Upload>;
  private restaurante: Observable<Restaurante>;
  private uploadTask: firebase.storage.UploadTask;
  private basePath: string = '/uploads';

  constructor(private db: AngularFireDatabase) {
    this.restaurantesFireList = db.list<Restaurante>('restaurantes');
    this.fotosFireList = db.list<Upload>('photos');

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
    resturanteRef.update({
      nome: updatedRestaurante.nome,
      valor: updatedRestaurante.valor,
      endereco: updatedRestaurante.endereco
    });
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

  pushUpload(upload: Upload, restaurante: Restaurante, nome: string, valor: number, endereco: string) {
      let storageRef = firebase.storage().ref();
      let uploadTask = storageRef.child(`${this.basePath}/${upload.file.name}+${this.dataHoje()}`).put(upload.file);

      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
        (snapshot) =>  {
        },
        (error) => {
          // upload failed
          console.log(error)

        },
        () => {
          // upload success
          uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                const imageUrl = downloadURL;
                upload.url = imageUrl
                upload.name = upload.file.name
                // this.saveFileData(upload)

                restaurante.imagem = imageUrl;
                restaurante.nome = nome;
                restaurante.endereco = endereco;
                restaurante.valor = valor;

                console.log("restaurante", restaurante);
                this.addRestaurante(restaurante);
            });
          }
      );

    }

  // Writes the file details to the realtime db
  private saveFileData(upload: Upload) {
    this.db.list(`${this.basePath}/`).push(upload);
  }

  dataHoje() {
      const dateTime = Date.now();
      const timestamp = Math.floor(dateTime / 1000);
      return timestamp;
    }
}
