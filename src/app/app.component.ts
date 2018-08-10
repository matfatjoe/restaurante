import { Component } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Restaurantes';

  public isLoggedIn: boolean;

  constructor(public authenticationService: AuthenticationService, private router: Router) {
 // O método subscribe vai verificar de forma assíncrona
 // se o usuário está logado e então decidir para onde
 // redirecioná-lo. Se o usuário não estiver logado vai
 // redirecioná-lo para a página de login. Caso contrário
 // vai redirecioná-lo para a página principal.
 // Essa funcionalidade é fornecida pelo Firebase para reduzir a
 // complexidade de nossa aplicação.
    this.authenticationService.user.subscribe((user) => {

      if(user == null) {
        console.log("Usuário não logado.");
        this.router.navigate(['login']);
        this.isLoggedIn = false;
      } else {
        console.log("Usuário logado com sucesso: " + user.email);
        this.isLoggedIn = true;
        this.router.navigate(['restaurantes']);
        }
      }
    );
  }


  logout() {
    this.authenticationService.logout();
  }
}
