/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { Network } from '@ionic-native/network/ngx';
import { of } from 'rxjs';

/* Test configuration import */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { NetworkDevStub, NetworkCordovaStub, PlatformDevStub, PlatformCordovaStub } from '@test/ionic-stubs';

/* Provider imports */
import { ConnectionService } from './connection.service';


describe('Connection Provider', (): void => {

  describe('Connection in dev mode', (): void => {
    configureTestBed();
    let injector: TestBed;
    let service: ConnectionService;

    beforeAll(async((): void => {
      TestBed.configureTestingModule({
        providers: [
          ConnectionService,
          { provide: Platform, useClass: PlatformDevStub },
          { provide: Network, useClass: NetworkDevStub }
        ]
      });
    }));

    beforeEach((): void => {
      injector = getTestBed();
      service = injector.get(ConnectionService);
    });

    test('should create the service', () => {
      expect(service).toBeDefined();
    });

    test('should start connection in dev mode', (): void => {
      expect(service.connection).toBe(true);
    });

    test('should activate offline mode', (): void => {
      expect(service.connection).toBe(true);
      service.setOfflineMode(true);
      expect(service.connection).toBe(false);
    });

    test('should get the connection status', (): void => {
      expect(service.isConnected()).toBe(true);
    });

    test('should get empty network listener in dev mode', (done: jest.DoneCallback): void => {
      service.listenForConnection()
        .subscribe(
          (results: any): void => {
            console.log('Should not get any results', results);
            expect(true).toBe(false);
          },
          (errors: any): void => {
            console.log('Should not get any errors', errors);
            expect(true).toBe(false);
          },
          (): void => done()
        );
    });

  });

  describe('Connection in device mode', (): void => {
    configureTestBed();
    let injector: TestBed;
    let service: ConnectionService;
    let consoleSpy: jest.SpyInstance;

    beforeAll(async((): void => {
      TestBed.configureTestingModule({
        providers: [
          ConnectionService,
          { provide: Platform, useClass: PlatformCordovaStub },
          { provide: Network, useClass: NetworkCordovaStub }
        ]
      });
    }));

    beforeEach((): void => {
      injector = getTestBed();
      consoleSpy = jest.spyOn(console, 'log');
      service = injector.get(ConnectionService);
    });

    test('should start in cordova', (): void => {
      const connectSpy: jest.SpyInstance = jest.spyOn(service.network, 'onConnect');
      const disconnSpy: jest.SpyInstance = jest.spyOn(service.network, 'onDisconnect');

      service.monitor();

      expect(consoleSpy.mock.calls[0][0]).toMatch('Begin monitoring');
      expect(connectSpy).toHaveBeenCalled();
      expect(disconnSpy).toHaveBeenCalledWith();
    });

    test('should get connection event in cordova', (done: jest.DoneCallback): void => {
      setTimeout((): void => {
        const callCount: number = consoleSpy.mock.calls.length;
        expect(consoleSpy.mock.calls[callCount - 1][0]).toMatch('network connection');
        expect(service.connection).toBe(true);
        done();
      }, 10);
    });

    test('should get disconnect event in cordova', (done: jest.DoneCallback): void => {
      setTimeout((): void => {
        const callCount: number = consoleSpy.mock.calls.length;
        expect(consoleSpy.mock.calls[callCount - 1][0]).toMatch('network disconnected');
        expect(service.connection).toBe(false);
        done();
      }, 40);
    });

    test('should get empty network listener in dev mode', (done: jest.DoneCallback): void => {
      service.network.onConnect = jest.fn().mockReturnValue(of(null));
      service.listenForConnection()
        .subscribe(
          (): void => done(),
          (errors: any): void => {
            console.log('Should not get any errors', errors);
            expect(true).toBe(false);
          }
        );
    });

  });

});
