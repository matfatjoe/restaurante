import { Injectable } from '@angular/core';
import { Restaurante } from './restaurante';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Upload } from './upload';
import * as firebase from 'firebase';
import * as jsPDF from 'jspdf';

declare var jsPDF: any; // Important

@Injectable()
export class RestauranteFbService {

  private restaurantes: Observable<Restaurante[]>;
  private restaurantesFireList: AngularFireList<Restaurante>;
  private fotosFireList: AngularFireList<Upload>;
  private restaurante: Observable<Restaurante>;
  private uploadTask: firebase.storage.UploadTask;
  private basePath: string = '/uploads';
  private restaurantesList: Restaurante[];

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

    gerarPdf() {

      this.getRestaurantes().subscribe(restaurantes => this.restaurantesList = restaurantes);
      var doc = new jsPDF();
      doc.setFontSize(32);
      doc.text(60, 20, 'Restaurantes');
      var imgData =  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGIAAABkCAYAAAB9/OUTAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADImlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4wLWMwNjEgNjQuMTQwOTQ5LCAyMDEwLzEyLzA3LTEwOjU3OjAxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1LjEgV2luZG93cyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo5M0UyNTIwM0U3QjQxMUUxQThDMkNFRjFCNTY3RUJCQSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo5M0UyNTIwNEU3QjQxMUUxQThDMkNFRjFCNTY3RUJCQSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjkzRTI1MjAxRTdCNDExRTFBOEMyQ0VGMUI1NjdFQkJBIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjkzRTI1MjAyRTdCNDExRTFBOEMyQ0VGMUI1NjdFQkJBIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwv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';
      doc.addImage(imgData, 'JPEG', 13, 5, 30, 30);
      doc.setFontSize(16);
      var columns = [
      {title: "ID", dataKey: "id"},
      {title: "Nome", dataKey: "nome"},
      {title: "Endereço", dataKey: "endereco"},
      {title: "Preço", dataKey: "preco"}];
      var rows;
      rows = new Array<String>();
      for(var i=0; i<this.restaurantesList.length; i++){
        rows[i] = {
          "id": i+1 ,
          "nome": this.restaurantesList[i].nome,
          "endereco": this.restaurantesList[i].endereco,
          "preco": this.restaurantesList[i].valor
        };
      }

      doc.autoTable(columns, rows, {
          theme: 'grid',
          styles: {fillColor: 255},
          headerStyles: {fillColor: [212, 167, 106]},
          margin: {top: 35},
          pageBreak: 'auto',
          showHeader: 'everyPage',
          addPageContent: function(data) {
            var page = "Página "+data.pageCount;
            doc.setFontSize(12);
            doc.text(175, 290, page);

          }
      });

      doc.save('Restaurantes.pdf');

    }

}
