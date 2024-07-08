import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {


  pages = [
    {
      title: 'Inicio',
      url: '/main/home',
      icon: 'home-outline'
    },
    {
      title: 'Perfil',
      url: '/main/profile',
      icon: 'person-outline'
    }
  ]

  router = inject(Router);
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  
  currentPath: string = '';

  ngOnInit() {
    this.router.events.subscribe((event: any) => {
      if (event.url) {
        this.currentPath = event.url;
        console.log('Current Path:', this.currentPath);
      }
    }, (error) => {
      console.error('Error en la navegación:', error);
    });
  }

  user(): User {
    const user = this.utilsSvc.getFromLocalStorage('user');
    if (!user) {
      console.error('No user found in local storage');
    }
    return user || { uid: '', email: '', password: '', name: 'Usuario', image: '' };
  }

  signOut() {
    this.firebaseSvc.signOut();
  }

}
