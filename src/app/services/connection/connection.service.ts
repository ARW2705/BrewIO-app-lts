/* Module imports */
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Network } from '@ionic-native/network/ngx';


@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  connection: boolean = false;

  constructor(
    public network: Network,
    public platform: Platform
  ) {
    if (this.platform.is('cordova')) {
      this.monitor();
    } else {
      // only runs outside of cordova in dev
      console.log('Connection in dev mode');
      this.connection = true;
    }
  }

  // For testing purposes only
  // toggleConnection(): void {
  //   this.connection = !this.connection;
  //   if (this.connection) {
  //     this.events.publish('connected');
  //   }
  // }

  /**
   * Check if device is connected to a network
   *
   * @params: none
   *
   * @return: true if connected to a network
   */
  isConnected(): boolean {
    return this.connection;
  }

  /**
   * Set up network connection monitors
   *
   * @params: none
   * @return: none
   */
  monitor(): void {
    console.log('Begin monitoring', this.network.type);
    this.connection = this.network.type !== this.network.Connection.NONE;

    this.network.onConnect()
      .subscribe((): void => {
        console.log('network connection', this.network.type);
        this.connection = true;
      });

    this.network.onDisconnect()
      .subscribe((): void => {
        console.log('network disconnected');
        this.connection = false;
      });
  }

  /**
   * Toggle offline mode
   *
   * @params: offline - true if offline mode should be active
   *
   * @return: none
   */
  setOfflineMode(offline: boolean): void {
    this.connection = !offline;
  }

}
