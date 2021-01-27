/* Module imports */
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

/* Interface imports */
import { ToastButton } from '../../shared/interfaces/toast-button';

/* Default imports */
import { defaultDismissButton } from '../../shared/defaults/default-dismiss-button';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastCtrl: ToastController) { }

  /**
   * Construct an error toast to present
   *
   * @params: message - error message text
   * @params: [dismissFn] - optional function to call on toast dismiss
   *
   * @return: none
   */
  presentErrorToast(message: string, dismissFn?: any): void {
    this.presentToast(
      message,
      null,
      'middle',
      'toast-error',
      null,
      null,
      dismissFn
    );
  }

  /**
   * Construct and present toast
   *
   * @params: message - message text
   * @params: [duration] - time toast is shown in ms
   * @params: [position] - position on screen of toast, options: 'top', 'bottom', or 'middle'
   * @params: [customClass] - css class name to add to toast
   * @params: [buttons] - array of toast buttons to display
   * @params: [header] - header text
   * @params: [dismissFn] - callback function when toast dismiss button is clicked
   *
   * @return: none
   */
  async presentToast(
    message: string,
    duration?: number,
    position?: string,
    customClass?: string,
    buttons?: ToastButton[],
    header?: string,
    dismissFn?: any
  ): Promise<void> {
    const toastOptions: object = {
      message: message,
      cssClass: 'toast-main',
      buttons: [ defaultDismissButton ]
    };

    if (duration) {
      toastOptions['duration'] = duration;
    }

    if (position) {
      toastOptions['position'] = position;
    }

    if (customClass) {
      toastOptions['cssClass'] += ` ${customClass}`;
    }

    if (header) {
      toastOptions['header'] = header;
    }

    if (buttons) {
      toastOptions['buttons'] = buttons;
    }

    const toast: HTMLIonToastElement = await this.toastCtrl.create(toastOptions);

    if (dismissFn) {
      toast.onDidDismiss().then(() => dismissFn());
    }

    return await toast.present();
  }

}
