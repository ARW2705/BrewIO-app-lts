import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  constructor(public loadingCtrl: LoadingController) { }

  /**
   * Create and display an ion-loading element
   *
   * @param: none
   * @return: loading element Promise
   */
  async createLoader(): Promise<HTMLIonLoadingElement> {
    const loading: HTMLIonLoadingElement = await this.loadingCtrl.create({
      cssClass: 'loading-custom',
      spinner: 'lines'
    });
    await loading.present();
    return loading;
  }
}
