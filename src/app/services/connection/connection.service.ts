/* Module imports */
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Network } from '@ionic-native/network/ngx';
import { Observable, EMPTY } from 'rxjs';


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
   * @param: none
   *
   * @return: true if connected to a network
   */
  isConnected(): boolean {
    return this.connection;
  }

  /**
   * Get listener for network on connect event
   *
   * @param: none
   *
   * @return: observable of network connection listener
   */
  listenForConnection(): Observable<any> {
    return this.platform.is('cordova') ? this.network.onConnect() : EMPTY;
  }

  /**
   * Set up network connection monitors
   *
   * @param: none
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
   * @param: offline - true if offline mode should be active
   *
   * @return: none
   */
  setOfflineMode(offline: boolean): void {
    this.connection = !offline;
  }

}
