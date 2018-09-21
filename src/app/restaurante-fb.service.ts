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

  pushUpload(upload: Upload) {
    let storageRef = firebase.storage().ref();
    let uploadTask = storageRef.child(`${this.basePath}/${upload.file.name}`).put(upload.file);



    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot) =>  {
        // upload in progress
        upload.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
            const imageUrl = downloadURL;
            console.log('URL:' + imageUrl);
        });
      },
      (error) => {
        // upload failed
        console.log(error)

      },
      () => {
        // upload success
        console.log('aaa', uploadTask);
        upload.url = uploadTask.uploadUrl_
        upload.name = upload.file.name
        this.saveFileData(upload)

      }
    );

  }

  // Writes the file details to the realtime db
  private saveFileData(upload: Upload) {
    this.db.list(`${this.basePath}/`).push(upload);
  }

}
