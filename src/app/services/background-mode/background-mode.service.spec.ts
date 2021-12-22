/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { BackgroundModeStub, PlatformDevStub, PlatformCordovaStub } from '../../../../test-config/ionic-stubs';

/* Service imports */
import { BackgroundModeService } from './background-mode.service';


describe('BackgroundModeService', () => {

  describe('Dev Mode', () => {
    configureTestBed();
    let injector: TestBed;
    let service: BackgroundModeService;

    beforeAll(async((): void => {
      TestBed.configureTestingModule({
        providers: [
          BackgroundModeService,
          { provide: Platform, useClass: PlatformDevStub },
          { provide: BackgroundMode, useClass: BackgroundModeStub }
        ]
      });
    }));

    beforeEach((): void => {
      injector = getTestBed();
      service = injector.get(BackgroundModeService);
    });

    test('should create the service', (): void => {
      expect(service).toBeTruthy();
    });

    test('should not listen for background mode', (): void => {
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      service.initBackgroundMode();

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    test('should not call disable', (): void => {
      const disableSpy: jest.SpyInstance = jest.spyOn(service.backgroundMode, 'disable');

      service.disableBackgroundMode();

      expect(disableSpy).not.toHaveBeenCalled();
    });

    test('should not call enable', (): void => {
      const enableSpy: jest.SpyInstance = jest.spyOn(service.backgroundMode, 'enable');

      service.enableBackgroundMode();

      expect(enableSpy).not.toHaveBeenCalled();
    });

    test('should not be active', (): void => {
      expect(service.isActive()).toBe(false);
    });

  });

  describe('Cordova Mode', () => {
    configureTestBed();
    let injector: TestBed;
    let service: BackgroundModeService;

    beforeAll(async((): void => {
      TestBed.configureTestingModule({
        declarations: [],
        imports: [],
        providers: [
          BackgroundModeService,
          { provide: Platform, useClass: PlatformCordovaStub },
          { provide: BackgroundMode, useClass: BackgroundModeStub }
        ]
      });
    }));

    beforeEach((): void => {
      injector = getTestBed();
      service = injector.get(BackgroundModeService);
    });

    test('should listen for background mode', (done: jest.DoneCallback): void => {
      const onSpy: jest.SpyInstance = jest.spyOn(service.backgroundMode, 'on');

      service.initBackgroundMode();

      setTimeout((): void => {
        const caughtCalls = onSpy.mock.calls;
        expect(caughtCalls[0][0]).toMatch('activate');
        expect(caughtCalls[1][0]).toMatch('deactivate');
        done();
      }, 10);
    });

    test('should call background mode disable', (): void => {
      service.backgroundMode.isEnabled = jest.fn().mockReturnValue(true);
      const disableSpy: jest.SpyInstance = jest.spyOn(service.backgroundMode, 'disable');

      service.disableBackgroundMode();

      expect(disableSpy).toHaveBeenCalled();
    });

    test('should not call disable', (): void => {
      service.backgroundMode.isEnabled = jest.fn().mockReturnValue(false);
      const disableSpy: jest.SpyInstance = jest.spyOn(service.backgroundMode, 'disable');

      service.disableBackgroundMode();

      expect(disableSpy).not.toHaveBeenCalled();
    });

    test('should call background mode enable', (): void => {
      service.backgroundMode.isEnabled = jest.fn().mockReturnValue(false);
      const enableSpy: jest.SpyInstance = jest.spyOn(service.backgroundMode, 'enable');

      service.enableBackgroundMode();

      expect(enableSpy).toHaveBeenCalled();
    });

    test('should not call enable', (): void => {
      service.backgroundMode.isEnabled = jest.fn().mockReturnValue(true);
      const enableSpy: jest.SpyInstance = jest.spyOn(service.backgroundMode, 'enable');

      service.enableBackgroundMode();

      expect(enableSpy).not.toHaveBeenCalled();
    });

    test('should check if background mode is active', (): void => {
      expect(service.isActive()).toBe(false);

      service.backgroundMode.isActive = jest.fn().mockReturnValue(true);

      expect(service.isActive()).toBe(true);
    });

    test('should disable web view and battery optimizations on activate', (): void => {
      const webSpy: jest.SpyInstance = jest
        .spyOn(service.backgroundMode, 'disableWebViewOptimizations');
      const battSpy: jest.SpyInstance = jest
        .spyOn(service.backgroundMode, 'disableBatteryOptimizations');

      service.onActivate();

      expect(webSpy).toHaveBeenCalled();
      expect(battSpy).toHaveBeenCalled();
    });

    test('should log deactivation notice', (): void => {
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      service.onDeactivate();

      expect(consoleSpy).toHaveBeenCalledWith('background mode deactivated');
    });

    test('should set a background notification', (): void => {
      service.isActive = jest.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      const configSpy: jest.SpyInstance = jest.spyOn(service.backgroundMode, 'configure');

      service.setNotification('test title', 'test message');

      expect(configSpy).toHaveBeenCalledWith({
        title: 'test title',
        text: 'test message',
        icon: 'ic_launcher',
        hidden: false,
        silent: false,
        color: '40e0cf'
      });

      service.setNotification('shouldn\'t', 'set');

      expect(configSpy.mock.calls.length).toEqual(1);
    });

  });

});
