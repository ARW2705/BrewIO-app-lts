/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { Network } from '@ionic-native/network/ngx';

/* Test configuration import */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { NetworkMockDev, NetworkMockCordova, PlatformMockDev, PlatformMockCordova } from '../../../../test-config/mocks-ionic';

/* Provider imports */
import { ConnectionService } from './connection.service';


describe('Connection Provider', (): void => {

  describe('Connection in dev mode', (): void => {
    let injector: TestBed;
    let connectionService: ConnectionService;
    configureTestBed();

    beforeAll(async((): void => {
      TestBed.configureTestingModule({
        providers: [
          ConnectionService,
          { provide: Platform, useClass: PlatformMockDev },
          { provide: Network, useClass: NetworkMockDev }
        ]
      });
    }));

    beforeEach((): void => {
      injector = getTestBed();
      connectionService = injector.get(ConnectionService);
    });

    test('should create the service', () => {
      expect(connectionService).toBeDefined();
    });

    test('should start connection in dev mode', (): void => {
      expect(connectionService.connection).toBe(true);
    }); // end 'should start conneciton in dev mode' test

    test('should activate offline mode', (): void => {
      expect(connectionService.connection).toBe(true);
      connectionService.setOfflineMode(true);
      expect(connectionService.connection).toBe(false);
    }); // end 'should activate offline mode' test

    test('should get the connection status', (): void => {
      expect(connectionService.isConnected()).toBe(true);
    }); // end 'should get the connection status' test

  }); // end 'Connection in dev mode' section

  describe('Connection in device mode', (): void => {
    let injector: TestBed;
    let connectionService: ConnectionService;
    let consoleSpy: jest.SpyInstance;
    configureTestBed();

    beforeAll(async((): void => {
      TestBed.configureTestingModule({
        declarations: [],
        imports: [],
        providers: [
          ConnectionService,
          { provide: Platform, useClass: PlatformMockCordova },
          { provide: Network, useClass: NetworkMockCordova }
        ]
      });
    }));

    beforeEach((): void => {
      injector = getTestBed();
      consoleSpy = jest.spyOn(console, 'log');
      connectionService = injector.get(ConnectionService);
    });

    test('should start in cordova', (): void => {
      const connectSpy: jest.SpyInstance = jest.spyOn(connectionService.network, 'onConnect');
      const disconnSpy: jest.SpyInstance = jest.spyOn(connectionService.network, 'onDisconnect');

      connectionService.monitor();

      expect(consoleSpy.mock.calls[0][0]).toMatch('Begin monitoring');
      expect(connectSpy).toHaveBeenCalled();
      expect(disconnSpy).toHaveBeenCalledWith();
    }); // end 'should start in cordova' test

    test('should get connection event in cordova', (done: jest.DoneCallback): void => {
      setTimeout((): void => {
        const callCount: number = consoleSpy.mock.calls.length;
        expect(consoleSpy.mock.calls[callCount - 1][0]).toMatch('network connection');
        expect(connectionService.connection).toBe(true);
        done();
      }, 10);
    }); // end 'should get connection event in cordova' test

    test('should get disconnect event in cordova', (done: jest.DoneCallback): void => {
      setTimeout((): void => {
        const callCount: number = consoleSpy.mock.calls.length;
        expect(consoleSpy.mock.calls[callCount - 1][0]).toMatch('network disconnected');
        expect(connectionService.connection).toBe(false);
        done();
      }, 40);
    }); // end 'should get disconnect event in cordova' test

  }); // end 'Connection in device mode' section

});
