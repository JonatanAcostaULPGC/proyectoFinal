import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { User } from '../models/user.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, setDoc, doc, getDoc, addDoc, collection, collectionData, query, updateDoc } from '@angular/fire/firestore';
import { UtilsService } from './utils.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { deleteDoc } from 'firebase/firestore';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  utilSvc = inject(UtilsService);
  storage = inject(AngularFireStorage);


  //==== Autenticaciones =====

  getAuth() { return getAuth(); }

  signIn(user: User) {
    return signInWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  signUp(user: User) {
    return createUserWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  updateUser(displayName: string) {
    return updateProfile(getAuth().currentUser, { displayName });
  }

  sendRecoveryEmail(email: string) {
    return sendPasswordResetEmail(getAuth(), email);
  }

  signOut() {
    getAuth().signOut();
    localStorage.removeItem('user');
    this.utilSvc.routerLink('/auth');
  }


  //==== Base de datos =====

  getCollectionData(path: string, collectionQuery?: any){
    const ref = collection(getFirestore(), path);
    return collectionData(query(ref, collectionQuery),{idField: 'id'});
  }

  setDocument(path: string, data: any) {
    return setDoc(doc(getFirestore(), path), data);
  }

  updateDocument(path: string, data: any) {
    return updateDoc(doc(getFirestore(), path), data);
  }

  deleteDocument(path: string) {
    return deleteDoc(doc(getFirestore(), path));
  }

  async getDocument(path: string) {
    return (await getDoc(doc(getFirestore(), path))).data();
  }

  addDocument(path: string, data: any) {
    return addDoc(collection(getFirestore(), path), data);
  }

  // Almacenamiento

  async uploadImage(path : string, dataUrl: string) {
    return uploadString(ref(getStorage(), path), dataUrl, 'data_url').then(() => {
      return getDownloadURL(ref(getStorage(), path));
    })

  }

  async getFilePath(path: string) {
    return ref(getStorage(), path).fullPath;
  }

  async deleteFile(path: string) {
    return deleteObject(ref(getStorage(), path));
  }

  

}
