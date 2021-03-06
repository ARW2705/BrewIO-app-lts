/* Module imports */
import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss'],
})
export class ConfirmationComponent {
  @Input() message: string = '';
  @Input() subMessage: string = null;
  onBackClick: () => void;

  constructor(public modalCtrl: ModalController) {
    this.onBackClick = this.submit.bind(this, false);
  }

  /**
   * Confirm by calling modal controller dismiss
   *
   * @params: confirm - true if confirmed, false to cancel
   *
   * @return: none
   */
  submit(confirm: boolean): void {
    this.modalCtrl.dismiss(confirm);
  }

}
