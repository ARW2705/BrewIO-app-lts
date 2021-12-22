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


describe('DeviceService', (): void => {

  describe('Device in dev mode', (): void => {
    configureTestBed();
    let injector: TestBed;
    let service: DeviceService;

    beforeAll(async((): void => {
      TestBed.configureTestingModule({
        providers: [
          DeviceService,
          { provide: Device, useClass: DeviceStub },
          { provide: Platform, useClass: PlatformDevStub }
        ]
      });
      injector = getTestBed();
      service = injector.get(DeviceService);
    }));

    test('should create the service', (): void => {
      expect(service).toBeTruthy();
    });

    test('should get null when getting service info in dev mode', (): void => {
      expect(service.getDeviceInfo()).toBeNull();
    });

  });


  describe('Device in cordova mode', (): void => {
    configureTestBed();
    let injector: TestBed;
    let service: DeviceService;

    beforeAll(async((): void => {
      TestBed.configureTestingModule({
        providers: [
          DeviceService,
          { provide: Device, useClass: DeviceStub },
          { provide: Platform, useClass: PlatformCordovaStub }
        ]
      });
      injector = getTestBed();
      service = injector.get(DeviceService);
    }));

    test('should get service info', (): void => {
      const _stubDevice: DeviceStub = new DeviceStub();

      expect(service.getDeviceInfo()).toStrictEqual({
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
