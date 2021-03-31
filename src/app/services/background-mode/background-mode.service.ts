/* Module imports */
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';


@Injectable({
  providedIn: 'root'
})
export class BackgroundModeService {
  color: string = '40e0cf';
  hidden: boolean = false;
  icon: string = 'ic_launcher';
  silent: boolean = false;

  constructor(
    public backgroundMode: BackgroundMode,
    public platform: Platform
  ) {
    this.initBackgroundMode();
  }

  /**
   * Disable background mode
   *
   * @params: none
   * @return: none
   */
  disableBackgroundMode(): void {
    if (this.platform.is('cordova') && this.backgroundMode.isEnabled()) {
      this.backgroundMode.disable();
      console.log('background mode disabled');
    }
  }

  /**
   * Enable background mode; override back button to move app to background
   * instead of closing
   *
   * @params: none
   * @return: none
   */
  enableBackgroundMode(): void {
    if (this.platform.is('cordova') && !this.backgroundMode.isEnabled()) {
      this.backgroundMode.enable();
      this.backgroundMode.overrideBackButton();
      console.log('background mode enabled');
    }
  }

  /**
   * Set up initial background mode event subscriptions
   *
   * @params: none
   * @return: none
   */
  initBackgroundMode(): void {
    if (this.platform.is('cordova')) {
      this.backgroundMode.on('activate').subscribe(this.onActivate.bind(this));
      this.backgroundMode.on('deactivate').subscribe(this.onDeactivate.bind(this));
      console.log('init background mode');
    }
  }

  /**
   * Check if background mode is active
   *
   * @params: none
   *
   * @return: true if backgroud mode is active
   */
  isActive(): boolean {
    if (this.platform.is('cordova')) {
      return this.backgroundMode.isActive();
    }
    return false;
  }

  /**
   * Perform additional actions when background mode is activated
   *
   * @params: none
   * @return: none
   */
  onActivate(): void {
    this.backgroundMode.disableWebViewOptimizations();
    this.backgroundMode.disableBatteryOptimizations();
    console.log('background mode activated');
  }

  /**
   * Perform additional actions when background mode is deactivated
   *
   * @params: none
   * @return: none
   */
  onDeactivate(): void {
    console.log('background mode deactivated');
  }

  /**
   * Display a notification
   *
   * @params: title - title of notification
   * @params: text - additional text of notification
   *
   * @return: none
   */
  setNotification(title: string, text: string): void {
    if (this.platform.is('cordova') && this.isActive()) {
      this.backgroundMode.configure({
        title: title,
        text: text,
        icon: this.icon,
        hidden: this.hidden,
        silent: this.silent,
        color: this.color
      });
    }
  }
}
