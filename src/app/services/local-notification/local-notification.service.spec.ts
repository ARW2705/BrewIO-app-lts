/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';

/* TestBed configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { LocalNotificationsStub } from '@test/ionic-stubs';

/* Service imports */
import { LocalNotificationService } from './local-notification.service';


describe('LocalNotificationService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: LocalNotificationService;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        LocalNotificationService,
        { provide: LocalNotifications, useClass: LocalNotificationsStub }
      ]
    });

    injector = getTestBed();
    service = injector.get(LocalNotificationService);
  }));

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  test('should set a local notification', (): void => {
    const localSpy: jest.SpyInstance = jest.spyOn(service.localNotifications, 'schedule');

    service.setLocalNotification('test-title', 'optional-text');

    expect(localSpy).toHaveBeenCalledWith({
      title: 'test-title',
      foreground: true,
      color: '40e0cf',
      text: 'optional-text'
    });
  });
});
