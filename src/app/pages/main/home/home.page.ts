import { Component, OnInit, inject } from '@angular/core';
import { User } from 'firebase/auth';
import { UserModel } from 'src/app/models/user.model';
import { Product } from 'src/app/models/product.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateProductComponent } from 'src/app/shared/components/add-update-product/add-update-product.component';
import { orderBy } from 'firebase/firestore';
import { ProductListComponent } from 'src/app/shared/components/product-list/product-list.component';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  PushNotificationToken,
  Token,
} from '@capacitor/push-notifications';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading: boolean = false;

  ngOnInit() {
    this.updateUserToken();
  }


  async updateUserToken() {
    const user = await this.utilsSvc.getFromLocalStorage('user') as UserModel;
    console.log(user);

    if (user) {
      const permission = await PushNotifications.requestPermissions();
      console.log(permission);
      if (permission.receive === 'granted') {
        await PushNotifications.register();

        PushNotifications.addListener('registration',
          async (token: PushNotificationToken) => {
            const userToken = token.value;
            user.userToken = userToken;

            // Actualizar el token del usuario en Firestore
            const path = `users/${user.uid}`;
            await this.firebaseSvc.updateDocument(path, { userToken: userToken });

            // Guardar el usuario actualizado en el almacenamiento local
            await this.utilsSvc.saveInLocalStorage('user', user);
          }
        );

        PushNotifications.addListener('registrationError',
          (error: any) => {
            console.error('Error on registration: ', error);
          }
        );
      }
    }
  }

  doRefresh(event) {
    setTimeout(() => {
      this.getProduct();
      event.target.complete();
    }, 1000);
  }

  ionViewWillEnter() {
    this.getProduct();
  }

  getProduct() {
    let path = `users/${this.user().uid}/products`

    this.loading = true;

    let query = orderBy('date', 'asc');

    let sub = this.firebaseSvc.getCollectionData(path, query).subscribe({
      next: (res: any) => {
        console.log(res);
        this.products = res;
        this.filteredProducts = res;
        this.loading = false;
        sub.unsubscribe();
      }
    })
  }




  filterProducts(selectedFilter: string) {

    const today = new Date();

    if (selectedFilter === 'allProducts') {
      this.filteredProducts = this.products;
    } else if (selectedFilter === 'expiredProducts') {
      this.filteredProducts = this.products.filter(product => product.date <= today);
    } else if (selectedFilter === 'nearlyExpiredProducts') {
      const sevenDaysFromNow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
      this.filteredProducts = this.products.filter(product => product.date > today && product.date <= sevenDaysFromNow);
    } else if (selectedFilter === 'nonExpiredProducts') {
      const sevenDaysFromNow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
      this.filteredProducts = this.products.filter(product => product.date > sevenDaysFromNow);
    }
    console.log(selectedFilter, this.filteredProducts);
  }

  addFavourite(product: Product) {
    product.priority = !product.priority;
    if (!product.showInList) product.showInList = true
    let path = `users/${this.user().uid}/products/${product.id}`
    this.firebaseSvc.updateDocument(path, product);
  }

  user(): User {
    return this.utilsSvc.getFromLocalStorage('user');
  }

  async addUpdateProduct(product?: Product) {
    let success = await this.utilsSvc.presentModal({
      component: AddUpdateProductComponent,
      cssClass: 'add-update-modal',
      componentProps: { product }
    });

    if (success) this.getProduct();
  }

  async listFavExpiredProducts() {
    let success = await this.utilsSvc.presentModal({
      component: ProductListComponent,
      cssClass: 'add-update-modal'
    });

    if (success) this.getProduct();
    this.getProduct();
  }


  async listProducts(product?: Product) {
    let success = await this.utilsSvc.presentModal({
      component: AddUpdateProductComponent,
      cssClass: 'add-update-modal',
      componentProps: { product }
    });

    if (success) this.getProduct();
  }
  getDateDifference(date: Date) {
    const today = new Date();
    const storeDate = new Date(date);
    const daysDifference = Math.floor((today.getTime() - storeDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDifference >= 0 ? "expiredProduct" : daysDifference >= -7 ? 'warningProduct' : 'okProduct';

  }

  signOut() {
    this.firebaseSvc.signOut();
  }

  async alertConfirmProduct(product: Product) {
    this.utilsSvc.presentAlert({
      header: 'Eliminar producto',
      message: '¿Estás seguro de querer eliminar el producto?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',


        }, {
          text: 'Eliminar',
          handler: () => {
            this.deleteProduct(product);
          }
        }
      ]
    });
  }

  async deleteProduct(product: Product) {

    let path = `users/${this.user().uid}/products/${product.id}`

    const loading = await this.utilsSvc.loading();
    await loading.present();

    let imagePath = await this.firebaseSvc.getFilePath(product.image);
    await this.firebaseSvc.deleteFile(imagePath);

    this.firebaseSvc.deleteDocument(path).then(async res => {

      this.products = this.products.filter(p => p.id !== product.id);

      this.utilsSvc.presentToast({
        message: "Producto eliminado",
        duration: 3000,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline'
      });
      this.getProduct();

    }).catch(err => {

      console.log(err);

      this.utilsSvc.presentToast({
        message: err.message,
        duration: 3000,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline'
      });

    }).finally(() => {
      loading.dismiss();
    })

  }
}
