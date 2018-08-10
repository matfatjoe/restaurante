import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth } from 'firebase';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthenticationService {
  user: Observable<firebase.User>;

  constructor(private afAuth: AngularFireAuth) {
   this.user = afAuth.authState;
  }

  login() {
    this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
  }
  logout() {
    this.afAuth.auth.signOut();
  }
}
