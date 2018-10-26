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
    this.getRestaurantes().subscribe(restaurantes => this.restaurantesList = restaurantes);
    
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

      var doc = new jsPDF();
      doc.setFontSize(32);
      doc.text(60, 20, 'Restaurantes');
      var imgData =  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAMAAABOo35HAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABuhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChXaW5kb3dzKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTYtMDYtMDJUMDQ6MDc6MTMtMDM6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMTYtMDYtMTZUMDg6MDg6MzUtMDM6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE2LTA2LTE2VDA4OjA4OjM1LTAzOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpBQjJDQjlCQTMzQjIxMUU2OEVFN0U5NjIxRjdCRkYyNyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpBQjJDQjlCQjMzQjIxMUU2OEVFN0U5NjIxRjdCRkYyNyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjE3RDVGRkExOTAyOEU2MTFBNTc4QjNBREQ4RkREMTUxIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDoxN0Q1RkZBMTkwMjhFNjExQTU3OEIzQUREOEZERDE1MSIgc3RFdnQ6d2hlbj0iMjAxNi0wNi0wMlQwNDowNzoxMy0wMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjE5RDVGRkExOTAyOEU2MTFBNTc4QjNBREQ4RkREMTUxIiBzdEV2dDp3aGVuPSIyMDE2LTA2LTAyVDA0OjE5OjQ4LTAzOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ1M2IChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6QzM4OTkyNzZBRTMzRTYxMTg0NjVDMTJBQjhGMTRCMkEiIHN0RXZ0OndoZW49IjIwMTYtMDYtMTZUMDg6MDM6MzQtMDM6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDMzg5OTI3NkFFMzNFNjExODQ2NUMxMkFCOEYxNEIyQSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoxN0Q1RkZBMTkwMjhFNjExQTU3OEIzQUREOEZERDE1MSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pts3OU0AAABgUExURf+zhv9uGP+MR/+WWP/Hpv/8+v+8lf+FPf/y6v90Iv/t4v+rev+iav/k0//28P95K//Zw//Uu/+cYv/p3P/Qtf/eyv/BnP+lcP/49f/Nr/+odf9+Mf+QTv/gz/9qEv///6nyrBIAABK6SURBVHja7J3pgqK6EoDDvhNEVATE93/LO91NWFSyFgHPTX7O2ChfktpTQU8zuAcyCAwsA8vAMrAMLAPLIDCwDCwDy8AysAwsg8DAMrAMLAPLwDKwDAIDy8AysAwsA8vAMggMLAPLwDKwRIcXF66P0tIOMI6i/mdEUdQGdnlDvlvEnoH1M+KTn3bY6hmj7VL/FP8fwzq7TRf1IiPqGjf+v4PlXXxHjNOMmONfvP8bWPFVGhQZlnON//uwvKJpe5jRNoX3H4blFbf1JRUF3a/qc6uq+BlV5f5TkLeyCyh/o5eXRliP5vNb4y7xqyyn/GWeVX7S4RVej/8crNAPPu2k1C9C/mcUfvrpKYEf/pdgFeWbIWV16JTLUD+h7v1hZfEfgeW5b8shSIpa5Ymn5P2Rrvf9sEKEX7W+C7FrQtd5WWAYhd8NK0ysV1I52MPzV15WEn4vrFdUNiApwsvWiAtpQ4XReRsPc7nPt8S1GSzPX1hVXbWd/PWqbmF5+d6XwbrPnRorzTYWvVk6X8Xt/ZtgZXNJEiEdNmOI5ivZzr4FVj0XVhHKn3pGPsdlJfVXwDrhPVC94cLV8WHF5Wx6taL6xTVf1E54cFj32dyWe0SA55MV3Y8MK09nMvby3GdcZtolzQ8Lq5ikVeQ+dxueOy1vXBwTlodmMxo+9xzhbIUj74CwwsmMbovn3qOYjOIuPBys2RZs1E0cgCc08FsRCpY/qmx8knu57HRNUsduo8iC8Vhm9p5/JFjeJCNK4UVfX9zkQ2ZafTmEkxWReoeBFY7K2hJUgvE9CVbqHFKAH+aOz7bDg8A6j8K0FfFf64qaby1BPPrpp50PAasYt5DDbwKG145ROQNjfefOaPkVB4B1t4TF6D9SzGIGMDXtj4+87w7rOv4WXi14KlfWFLbLBl1/0/cPQDflNH7ddWdY47xhPnH1lhn75Rz8VKptFnfOMJAJoQgLiWmbZfR3yOBfs63To5O2RjvCGlk5PCb3xXkt6ig11fHVDggtBMKKx+Z7RdUmGuv3JqsZ7QRrlFcNxwZc6j+c6I52NQBySwHWlX+y5iGTnxx+tUNNKFLXifKw7txT5SFLe2aMthHu2mGN1gvzCUWruTKItbask2ZYGS+rxQ4MqueeY6SVaYUVY05W82zPzqhmtHCsEVYd8MVR5tke7D73H+T3BLU+WCSq5tAF0Dzbg+oDsHp6jkoASAqWzzc/MyXohM9jjHFP+JpgnYgNHvJFkrYoO5D3E4luPmmBdR5kdnTmc/X7Jn8eaPD9fCBYXsAzNZVqtme7QTZG4G0PK+ExGvxeItSs24BINod14lAnk49vXZ8HHKWk2BKFFUZsRTjq5x5fjshqVIlRuC2sju0w1B18lQHwIM5atykslx3myMcY7o0lQePske3Dk4SX3A1hxcMmdHhYUc2+n7NKf9MbpXuoy0FSRPF2sIavwDmblUUzRJd12H2gH1eOmdOuCMtl1mzUIytK/ncZDOTYsd7lMf1/WIAcaykkNqIILKIJb2w9GFHUYPapwqFbatc6aYPxVMkFz0oVfkCT/Eje/PuULK2buEYUgZUyNyGxryKKsrx/zkc770p3MBrr3x0TzM08f/Yp2fBljYWrdQS+6sI05RDHurquVTfMl0j2t5W9+ff+rYBmpvIXn5J3ey4bwPJs1ky4HKzu8z4WjzCP78Qqs2b7ofr7p3guXeLZ2g3mn5L2p4Z9YG8Ay2Xt8YvFlu1j6N6acjxkXya6YREZ7ILDIrp21RwNMTvT5BHZ3sXv+wF7mmERkRDV0LAQI65BdinVFkWfLYVBMT10wyLRJgQMK7cYJlbCkcoPrc+2R/a6aDXBIo/mNR94YSWMwAxRLZ3HXlj222eilwnWBYsEaxJQWPHfmrDODFlJDct7eO0hwctP1gbrPLxXDAnrxrDdO55Ub7H6kN1gMV9MAlbMmIArV4HKsAuzI8GKRZYWEpFYCSNyU/IEDoPnkWCxXk0cVh692difNiFm/Gy8qi53hDVo6CiHguXT6bMjN39jfavuCIssLR8I1uCfr+1rYtuziiXzdQN/T1iD1MIeDCyX7kEPU4NrPljVwWARf9qFgWWvarG5b8wMDR8VVsYdfEDcD3Po0p1dw3NUWCSzkEHAatZfcnoVDkPlsLAq3gJ1Nqw6ogpAm9txPyyswQ1jWw/sl7xSaVQ9ty45LCziWrjqsDrqNgv4g43HhRVyingmrJgq3k8CpU7HhUVEfKwKy6eK907gzMKBYVV8VjwT1t97RJ+XzpClCp5fDmtQYoEirDPVendE0iMHhkWs+LMaLEQzzwd51npfD+vEZQCxYP2ZURGVJGcp5JFheRGPPkRcL3ijGnP198MawstWqALLpelCbjfhC2BVPNIX8Qg+q1ZzQNVgnef1H2jmtUPCqi2OkhrEs5U/W6RD3pW7rkIW1t+kDD/0N+dmXcBhDRZj5MnDetCMNVewrEIalocC+0re4pwGzlClc4eE5b+WEAjD8mnmh8MjE+VgFVwb3IWEdeYw4umw/rLbmOZ98lewCsB6cAVf/+SX9YQZmB3DpMOKKA9wRY+yC8DKuXy1v6lsgWCVNIuSA9aZZnRSFaUirGfLs2oxZzybb1zZHg/iEAqZsKJUhlVyyMMCtPkhSTW4srBulJV5Ef6pIrDuHL6aw+X8ino8N1lYNuU0EBL+qSKwakaJ08QzeEINh2k2UmFZlKy9IyxdRWCRzG2wahecRatnmSNhKlfElu8uZdGmW8GKrY8nL6b/b4XCQzzDZe4VGqw7Rb5n4vMqBGus1f1MK1Y4Q8+Q8Hc5WIhyguEqLl3FYI3n1j81fRtZpXCsnp7FUiqIaaYFFEWJn5vBGivkevtNbp2xUpeUtRGw7DYk+ce2+Gk9QVjPgpzGsOsVVhi2Y2DJUq+I6ewguSWrDmvqDbFseTP2/MDAl+sglsODmC/nUhTlfVNYU0Oz+f945GQUhr57jBnFQEzt8LH4sRILkkrCmnZi8RY2Auks/dF/ymRgVRSF50sc9ZOANTa5bt8MsBa+w+mZmnynwxqsg49AGonoiAyscW25SzUMLdv/Njgrs4dY8g5TnJ1ue1hEkNgvTuMm9yFjhtaiwGoomjSQMAnlYJHak/OC3TaX5wWM1B5imR22qFUBDatYbI6bYOBfaNgMq5Tyvt36n3pCeXs1WMPENPNPdpuwGpZHJwMrWA+GhTKtZGVhdXNnIZLrfMU3bgwTngKrXd9qmcxtL7KwFvMdgYaSP6q0VgYWRTcUEjapNKx0DqvfHhaWgUWZxIKvBvPbYPkM51AOVjVv4vFtsDJ0u4PDomg8qZKMg8D69c5vNJ9FHpYr5Z8fGFawLm7dLWE9ZWC5O8NSeC05WJlMys5bf1GNsChHRNVhXVfNN+GG/eu1CfphVcAyi2r/3W+JcPDNWS0l0QgrpsDaxnSQG+vny/TDKoBhYehgyFCE+qG/lkZYGaUdm4IF34JHjtK15uIaYRWUYLmCbxgIdGnh3ALWSg5LI6w7xflQiDp0oIV1M6Hw3m1SIyyaxlOIZ5WC7QP5FeI/Wo+9YNEyqQqR0ga4WOxXxgcfaWmElTIzC1IxeMQu35UQWyT3vpDyGmF1lCKNSD67Q8sbyo+xUqHNd4HVrn+VSt6wkonwcdD6cBuUPlgUB5Vq3LNgSQXaRWiddoCVUYCo1Drk0BWur7SmBgf6YN0pNqlKFY1UJpVPykcvcRJ9sGglySr1WeyyQdX5tfXDohW7K1X+lRsYWgsFPjod+mDRjlEo1ZQitX7rtHFaykNtsGhHt9Sqle8yqVS+US8KGPTBctml/ZJ18Oet1OG4D23dsFLKSWi1ExbUszuKo1nE2bTBop1jVDu7I1PsLuf864JFPQiteCrstoUrPY9s6YblU2LKqucN3e0k/D6wOsrsq55kPateFn8wWNS2IKpnpKmn778QFrVhgOrpe2pfhy+E5dA8ZeW+Dj7sme2dYeW0th3qHUMemxXa7QGL2jxHvReNePOGI8P6MxutnLJFVbocibcFOTCsjNYxG6B/Fr0z25fBaji6zCl1Zst78Bz+XrDoDbVvPIWfSt0kvwqWTzsiBdJNkt6n9KtgUS/igOlTeobvn7APLJd6IQJMB1x6b+UvghXQ7hQF6q3M6Nr9NbDu1Pvbobp2x/0mdqluWC1V9kL1g2fcNPAlsFxqs62w5zvyiXi/B30zrKEL9JowgbvDYrhVDX8zLES9pALwdhTGvTvfACumXygLeO8O60anL4BV0t8A8kYnxl1hx4d1ot+BCnpXGOsWuqPDIlcKJtQwFNQtdESXxN8Jq6Hf6xnz30kFcXPmsWENxY+rKwf45szxhFL4hbDIJlyT7sOdrBbYnaxCV+IeDNag6qIY4NX4YIUWtM+jCxbrhutYZNMA3VB+VFjkDtQO5MU4YcXsxtBHhEWOc0RrC+cstGV4/eOkhy170AJrbDx5Ytj2nMKYF1ZuwZ630AKr6RksCsbCk4RFHPcAKL58XdQkbgOLHAW1134z6d/MC4Eb1hCmhirWWtTJ5dSi6tvs5LLIEZk7af4aMlRllEPDIq8XwVimi1BGQi2qRjMB4PNn5kjTTuuyKv5F++/zw/JsSH+a+JvOJc8GT3atwxS5qdoN44Ebj7l9iXoWipQ73CAMi1zxAZRwJc3xp7HmkHgt7yc/sUKsyE1/2QIWmQkMct9UHr0QWLfh3FdY7I6uWcTsrl9j4Z0iAovscRg7/vRC4Mr07/qeV3mN68rxWE6JiAwWStq4PaSx5Vq8BHJ7/kn2Uhhbo3e1dORGGRaZYpiN+LxMwgjTW57WzbRb2TbW3Vq90IE7cgMAixxBBUpeeG73+16BzywtzNLfr8aI7cURW5TGihm5AYDFjHiI88oeGWcRZuxWHPLFu/GwknsP0URzR8+U7D5C4jvT5BU7cgMDi2jEoD4kqwvu2XrwWQdy3ohwCQPR+OURWfmjgr1RWHmlpHktXu+R9JtUikBswXLUmT6P8yCcUhB/ZS/oN6ozVbVyxy1oVTx7QzzaJLE+yGV50flIqOpRC/btY6OfL7OZyNS04XFYVXhys6kmc6hwf52U5PH7g6nE2OH1HIkilKoOlxPTJYd+1jc8NHmZLd1v9RwVZS4Hqw76jerjZRxyPHOyc64ok+SekDQAYnwUA6IKJlQR6wYSpHbXn+zLEodhZ1pzVH0acrKSddak3/W0P63anaNqmVG2kZWshSj/qvdeQa9A2OtoHpi2EFPXjKGb+1M7rDHMscfa8ipnEWdN2SYf6pXDSyovOk5VoxnVJcHLbA/HnXQNwEZQWhXjZKX67C3vlVTvcOSyvBRiG6htoZGWo8eWj93yNYPGg+pZOyAiQ1HejLTsrf1EL7umb9lW68ZlBIQ2jHhVFc6j3MKbBZq9c+GngfWWwe4x4puhDAMpbmVNNupECzC+lT+K4lS5V9SUNu4/Dqvk/b7RIlROs6ir/TFLB2dwIatnjO4aCq996/7cHdZ4fTErkiRu7q6sKQFSM9EeqefRIQzK8yh4WxDBVVJItU0loniz6acBxHVBrO9J21gQfTrTlRUVNHfBaMFUTgGirWFclcnm60v1X1W8cYq6xL0Im3KzbA+M1Qzl100ZO6yuFe8/m8eKcGs7aXI9ZXIW75TtgVI9YE5wMf20Rt2cB3jCVHiDoerR4SIGU5UBR2hp81FM1n4H5lwAhlc8JBQy2TTWNdMRCM7JB41FzbZi5O6HynMj+C0IDuuZz2bUvuzE6mLzZ3v2hPVPkc1CKGW8A6q4FMj27Axr8WMtlGtGlc/dSgdacG4QP5/ZN32kFVc+z2Fg+K6OWyQb6qTfA9cCVZ9sELvdJjPzsBe4dNgRy8yY/djiO7ZKY93nIWAr3bpeN0vnIbD2vs23bJbz8/xFaqGrtksAeVW38Lr9rb5qwwRpmFjLiPk2lYJntAg8W8l2m37TbPILrr5zoYV97na9LlQbw3rHZTmAvHLXsTSi2hzWj5Z6Sc/84wXxSuErKe7M2IFh/fi1wWvkM0gKFTPIOyXvj3S3LyHQUwFTlNZ7jgadZHZkeELd+8NKLRE0XeVCoR98ytXcrgX/3gmLDxn83xN4mqJnGmurLk30MWuDu+RaZbRVlmfVNek+p6ajm75QkNZCNK+4RasZwSjoyhvyXbeqip9RVa7ro1vZBZS/aQqdxeW6q/a8oml7mNHqJbUDrF+b++pEiqAs57rDyaGdao29wpcGFjn+ZZ+THXuWsZ/dphMjFnWNu+NZtN1PSMQnP+0wq8bIwl3qn+Kdf+tBzqN6ceH6yc3pAoyjv9UWRVEb2OUt8d0iPsSBqufxDu8eeBhYBpaBZWAZWAaWGQaWgWVgGVgGloFlhoFlYBlYBpaBZWCZYWAZWAaWgWVgGVhmGFgGloG1+/ifAAMAEMpp+EbxQ1sAAAAASUVORK5CYII=';
      doc.addImage(imgData, 'JPEG', 13, 5, 30, 30);
      doc.setFontSize(16);
      var columns = [
      {title: "ID", dataKey: "id"},
      {title: "Nome", dataKey: "nome"},
      {title: "Preço Médio", dataKey: "preco"},
      {title: "Endereço", dataKey: "endereco"}];
      var rows;
      rows = new Array<String>();
      for(var i=0; i<this.restaurantesList.length; i++){
        rows[i] = {
          "id": i+1 ,
          "nome": this.restaurantesList[i].nome,
          "endereco": this.restaurantesList[i].endereco,
          "preco": this.restaurantesList[i].valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        };
      }

      const totalPages = "{total_pages_count_string}";

      doc.autoTable(columns, rows, {
          // theme: 'grid',
          styles: {fillColor: 255},
          headerStyles: {fillColor: [212, 167, 106]},
          margin: {top: 35},
          pageBreak: 'auto',
          showHeader: 'everyPage',
          addPageContent: function(data) {
            var page = "Página "+ data.pageCount +" de "+ totalPages;
            doc.setFontSize(12);
            doc.text(175, 290, page);

          }
      });
      if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPages);
      }

      doc.save('Restaurantes.pdf');

    }

}
