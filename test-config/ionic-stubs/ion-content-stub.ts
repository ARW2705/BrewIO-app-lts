/* Module imports */
import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'ion-content',
  template: '',
  providers: [
    { provide: IonContent, useClass: IonContentStub }
  ]
})
export class IonContentStub {
  z: any;
  el: any;
  inset: any;
  ionScrollStart() {}
  ionScroll() {}
  ionScrollEnd() {}
  fullscreen;
  getScrollElement() {}
  scrollByPoint() {}
  scrollEvents;
  scrollToBottom() {}
  scrollToTop() {}
  scrollToPoint() {}
  scrollX;
  scrollY;
}
