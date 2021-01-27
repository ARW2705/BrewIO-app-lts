/* Module imports */
import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'page-confirmation',
  templateUrl: './confirmation.page.html',
  styleUrls: ['./confirmation.page.scss']
})
export class ConfirmationPage {
  @Input() message: string = '';
  @Input() subMessage: string = null;
  @Input() title: string = '';
  onBackClick: () => void;

  constructor(public modalCtrl: ModalController) {
    this.onBackClick = this.dismiss.bind(this);
  }

  /**
   * Confirm by calling modal controller dismiss with true
   *
   * @params: none
   * @return: none
   */
  confirm(): void {
    this.modalCtrl.dismiss(true);
  }

  /**
   * Cancel confirmation by calling modal controller dismiss with false
   *
   * @params: none
   * @return: none
   */
  dismiss(): void {
    this.modalCtrl.dismiss(false);
  }

}
