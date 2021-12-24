/* Module imports */
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Device } from '@ionic-native/device/ngx';

/* Interface imports */
import { DeviceInfo } from '@shared/interfaces';


@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  constructor(
    public device: Device,
    public platform: Platform
  ) {}

  /**
   * Get various device specs
   *
   * @param: none
   * @return: object of device specs
   */
  getDeviceInfo(): DeviceInfo {
    if (this.platform.is('cordova')) {
      const info: DeviceInfo = {
        model: this.device.model,
        os: this.device.platform,
        version: this.device.version,
        manufacturer: this.device.manufacturer,
        isVirtual: this.device.isVirtual,
        cordova: this.device.cordova,
        uuid: this.device.uuid
      };

      return info;
    }
    return null;
  }

}
