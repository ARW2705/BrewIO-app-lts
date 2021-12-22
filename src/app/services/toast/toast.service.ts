/* Module imports */
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

/* Interface imports */
import { ToastButton } from '../../shared/interfaces';

/* Default imports */
import { defaultDismissButton } from '../../shared/defaults';


@Injectable({
  providedIn: 'root'
})
export class ToastService {
  shortDuration: number = 1000;
  mediumDuration: number = 1500;
  longDuration: number = 2000;

  constructor(public toastCtrl: ToastController) { }

  /**
   * Construct an error toast to present
   *
   * @param: message - error message text
   * @param: [dismissFn] - optional function to call on toast dismiss
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
   * @param: message - message text
   * @param: [duration] - time toast is shown in ms
   * @param: [position] - position on screen of toast, options: 'top', 'bottom', or 'middle'
   * @param: [customClass] - css class name to add to toast
   * @param: [buttons] - array of toast buttons to display
   * @param: [header] - header text
   * @param: [dismissFn] - callback function when toast dismiss button is clicked
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
      message,
      cssClass: 'toast-main',
      buttons: [ defaultDismissButton() ]
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
      toast.onDidDismiss().then((): void => dismissFn());
    }
    return await toast.present();
  }

}
