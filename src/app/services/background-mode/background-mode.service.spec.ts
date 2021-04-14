/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { BackgroundModeMock, PlatformMockDev, PlatformMockCordova } from '../../../../test-config/mocks-ionic';

/* Service imports */
import { BackgroundModeService } from './background-mode.service';


describe('BackgroundModeService', () => {

  describe('\nDev Mode', () => {
    let injector: TestBed;
    let backgroundService: BackgroundModeService;
    configureTestBed();

    beforeAll(async(() => {
      TestBed.configureTestingModule({
        declarations: [],
        imports: [],
        providers: [
          BackgroundModeService,
          { provide: Platform, useClass: PlatformMockDev },
          { provide: BackgroundMode, useClass: BackgroundModeMock }
        ]
      });
    }));

    beforeEach(() => {
      injector = getTestBed();
      backgroundService = injector.get(BackgroundModeService);
    });

    test('should create the service', () => {
      expect(backgroundService).toBeDefined();
    });

    test('should not listen for background mode', () => {
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      backgroundService.initBackgroundMode();

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    test('should not call disable', () => {
      const disableSpy: jest.SpyInstance = jest.spyOn(backgroundService.backgroundMode, 'disable');

      backgroundService.disableBackgroundMode();

      expect(disableSpy).not.toHaveBeenCalled();
    });

    test('should not call enable', () => {
      const enableSpy: jest.SpyInstance = jest.spyOn(backgroundService.backgroundMode, 'enable');

      backgroundService.enableBackgroundMode();

      expect(enableSpy).not.toHaveBeenCalled();
    });

    test('should not be active', () => {
      expect(backgroundService.isActive()).toBe(false);
    });

  });

  describe('\nCordova Mode', () => {
    let injector: TestBed;
    let backgroundService: BackgroundModeService;
    configureTestBed();

    beforeAll(async(() => {
      TestBed.configureTestingModule({
        declarations: [],
        imports: [],
        providers: [
          BackgroundModeService,
          { provide: Platform, useClass: PlatformMockCordova },
          { provide: BackgroundMode, useClass: BackgroundModeMock }
        ]
      });
    }));

    beforeEach(() => {
      injector = getTestBed();
      backgroundService = injector.get(BackgroundModeService);
    });

    test('should listen for background mode', (done: jest.DoneCallback) => {
      const onSpy: jest.SpyInstance = jest.spyOn(backgroundService.backgroundMode, 'on');

      backgroundService.initBackgroundMode();

      setTimeout(() => {
        const caughtCalls = onSpy.mock.calls;
        expect(caughtCalls[0][0]).toMatch('activate');
        expect(caughtCalls[1][0]).toMatch('deactivate');
        done();
      }, 10);
    });

    test('should call background mode disable', () => {
      backgroundService.backgroundMode.isEnabled = jest
        .fn()
        .mockReturnValue(true);

      const disableSpy: jest.SpyInstance = jest.spyOn(backgroundService.backgroundMode, 'disable');

      backgroundService.disableBackgroundMode();

      expect(disableSpy).toHaveBeenCalled();
    });

    test('should not call disable', () => {
      backgroundService.backgroundMode.isEnabled = jest
        .fn()
        .mockReturnValue(false);

      const disableSpy: jest.SpyInstance = jest.spyOn(backgroundService.backgroundMode, 'disable');

      backgroundService.disableBackgroundMode();

      expect(disableSpy).not.toHaveBeenCalled();
    });

    test('should call background mode enable', () => {
      backgroundService.backgroundMode.isEnabled = jest
        .fn()
        .mockReturnValue(false);

      const enableSpy: jest.SpyInstance = jest.spyOn(backgroundService.backgroundMode, 'enable');

      backgroundService.enableBackgroundMode();

      expect(enableSpy).toHaveBeenCalled();
    });

    test('should not call enable', () => {
      backgroundService.backgroundMode.isEnabled = jest
        .fn()
        .mockReturnValue(true);

      const enableSpy: jest.SpyInstance = jest.spyOn(backgroundService.backgroundMode, 'enable');

      backgroundService.enableBackgroundMode();

      expect(enableSpy).not.toHaveBeenCalled();
    });

    test('should check if background mode is active', () => {
      expect(backgroundService.isActive()).toBe(false);

      backgroundService.backgroundMode.isActive = jest
        .fn()
        .mockReturnValue(true);

      expect(backgroundService.isActive()).toBe(true);
    });

    test('should disable web view and battery optimizations on activate', () => {
      const webSpy: jest.SpyInstance = jest
        .spyOn(backgroundService.backgroundMode, 'disableWebViewOptimizations');
      const battSpy: jest.SpyInstance = jest
        .spyOn(backgroundService.backgroundMode, 'disableBatteryOptimizations');

      backgroundService.onActivate();

      expect(webSpy).toHaveBeenCalled();
      expect(battSpy).toHaveBeenCalled();
    });

    test('should log deactivation notice', () => {
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      backgroundService.onDeactivate();

      expect(consoleSpy).toHaveBeenCalledWith('background mode deactivated');
    });

    test('should set a background notification', () => {
      backgroundService.isActive = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      const configSpy: jest.SpyInstance = jest.spyOn(backgroundService.backgroundMode, 'configure');

      backgroundService.setNotification('test title', 'test message');

      expect(configSpy).toHaveBeenCalledWith({
        title: 'test title',
        text: 'test message',
        icon: 'ic_launcher',
        hidden: false,
        silent: false,
        color: '40e0cf'
      });

      backgroundService.setNotification('shouldn\'t', 'set');

      expect(configSpy.mock.calls.length).toEqual(1);
    });

  });

});
