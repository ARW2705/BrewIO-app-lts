/* Module imports */
import { Injectable } from '@angular/core';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';


@Injectable({
  providedIn: 'root'
})
export class LocalNotificationService {

  constructor(public localNotifications: LocalNotifications) { }

  /**
   * Display a notification immediately
   *
   * @params: title - title of notification
   * @params: [text] - optional additional text
   *
   * @return: none
   */
  setLocalNotification(title: string, text?: string): void {
    const notification: object = {
      title: title,
      foreground: true,
      color: '40e0cf'
    };

    if (text) {
      notification[text] = text;
    }

    this.localNotifications.schedule(notification);
  }
}
