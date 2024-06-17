import { Component, OnInit, inject } from '@angular/core';
import { User } from 'firebase/auth';
import { Product } from 'src/app/models/product.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateProductComponent } from 'src/app/shared/components/add-update-product/add-update-product.component';
import { orderBy } from 'firebase/firestore';
import { Subscription, isEmpty } from 'rxjs';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading: boolean = false;
  productSubscription: Subscription;


  ngOnInit() {
    this.getProduct();
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
    let path = `users/${this.user().uid}/products`;
    this.loading = true;
    let query = orderBy('date', 'asc');
    this.productSubscription = this.firebaseSvc.getCollectionData(path, query).subscribe({
      next: (res: any) => {
        this.products = res.filter(product =>
          (product.showInList && (this.isExpired(product.date) || product.priority))
        );
        this.loading = false;
      }
    });
  }

  unsubscribeFromProductSubscription() {
    if (this.productSubscription) {
      this.productSubscription.unsubscribe();
    }
  }

  isExpired(date: string): boolean {
    const dateParts = date.split('-');
    const formattedDate = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`;
    
    let dateFromString = new Date(formattedDate);
    return dateFromString < new Date(); 
  }
  

  async addFavourite(product: Product) {
    product.priority = !product.priority;
    if (product.priority) product.showInList = true;
    let path = `users/${this.user().uid}/products/${product.id}`
    let update = await this.firebaseSvc.updateDocument(path, product);
    this.getProduct();
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

    this.getProduct();
  }

  async listFavExpiredProducts() {
    let success = await this.utilsSvc.presentModal({
      component: AddUpdateProductComponent,
      cssClass: 'add-update-modal'
    });

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

  async alertDeleteFromList(product: Product) {
    this.utilsSvc.presentAlert({
      header: 'Quitar producto',
      message: '¿Está seguro de quitar de esta lista el producto?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar'
        }, {
          text: 'Quitar',
          handler: () => {
            this.deleteProductFromList(product);
          }
        }
      ]
    });
    this.getProduct();
  }

  async deleteProductFromList(product: Product) {
    product.showInList = !product.showInList;
    if (product.priority) product.priority = false;
    let path = `users/${this.user().uid}/products/${product.id}`
    let updateShowInList = await this.firebaseSvc.updateDocument(path, product);
    this.getProduct();
  }
}
