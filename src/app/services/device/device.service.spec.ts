/* Module imports */
import { TestBed, async, getTestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { Device } from '@ionic-native/device/ngx';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { DeviceStub, PlatformDevStub, PlatformCordovaStub } from '../../../../test-config/ionic-stubs';

/* Service imports */
import { DeviceService } from './device.service';


describe('DeviceService', () => {

  describe('Device in dev mode', (): void => {
    let injector: TestBed;
    let device: DeviceService;
    configureTestBed();

    beforeAll(async((): void => {
      TestBed.configureTestingModule({
        providers: [
          DeviceService,
          { provide: Device, useClass: DeviceStub },
          { provide: Platform, useClass: PlatformDevStub }
        ]
      });

      injector = getTestBed();
      device = injector.get(DeviceService);
    }));

    test('should create the service', (): void => {
      expect(device).toBeTruthy();
    });

    test('should get null when getting device info in dev mode', (): void => {
      expect(device.getDeviceInfo()).toBeNull();
    });

  });


  describe('Device in cordova mode', (): void => {
    let injector: TestBed;
    let device: DeviceService;
    configureTestBed();

    beforeAll(async((): void => {
      TestBed.configureTestingModule({
        providers: [
          DeviceService,
          { provide: Device, useClass: DeviceStub },
          { provide: Platform, useClass: PlatformCordovaStub }
        ]
      });

      injector = getTestBed();
      device = injector.get(DeviceService);
    }));

    test('should get device info', (): void => {
      const _stubDevice: DeviceStub = new DeviceStub();

      expect(device.getDeviceInfo()).toStrictEqual({
        model: _stubDevice.model,
        os: _stubDevice.platform,
        version: _stubDevice.version,
        manufacturer: _stubDevice.manufacturer,
        isVirtual: _stubDevice.isVirtual,
        cordova: _stubDevice.cordova,
        uuid: _stubDevice.uuid
      });
    });

  });

});
