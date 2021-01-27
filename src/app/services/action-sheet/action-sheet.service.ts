/* Module imports */
import { Injectable } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';

/* Interface imports */
import { ActionSheetButton } from '../../shared/interfaces/action-sheet-buttons';


@Injectable({
  providedIn: 'root'
})
export class ActionSheetService {

  constructor(public actionCtrl: ActionSheetController) { }

  /**
   * Open an action sheet
   *
   * @params: title - action sheet title
   * @params: buttons - array of action sheet buttons
   * @params: [customClass] - css class to apply to action sheet
   *
   * @return: none
   */
  openActionSheet(
    header: string,
    buttons: ActionSheetButton[],
    customClass?: string
  ): void {
    buttons.push({
      text: 'Cancel',
      role: 'cancel',
      handler: () => {
        console.log('Action Sheet cancelled');
      }
    });

    this.actionCtrl.create({
      header: header,
      buttons: buttons,
      cssClass: customClass || 'action-sheet-main'
    })
    .then((actionSheet) => actionSheet.present());
  }

}
