/* Module imports */
import { Component } from '@angular/core';
import { IonList } from '@ionic/angular';

@Component({
  selector: 'ion-list',
  template: '',
  providers: [
    { provide: IonList, useClass: IonListStub }
  ]
})
export class IonListStub {
  z: any;
  el: any;
  inset: any;
  public closeSlidingItems() {}
}
