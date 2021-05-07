/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';

/* TestBed configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { LocalNotificationsStub } from '../../../../test-config/ionic-stubs';

/* Service imports */
import { LocalNotificationService } from './local-notification.service';


describe('LocalNotificationService', (): void => {
  let injector: TestBed;
  let localNotificationService: LocalNotificationService;
  configureTestBed();

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        LocalNotificationService,
        { provide: LocalNotifications, useClass: LocalNotificationsStub }
      ]
    });

    injector = getTestBed();
    localNotificationService = injector.get(LocalNotificationService);
  }));

  test('should create the service', (): void => {
    expect(localNotificationService).toBeDefined();
  });

  test('should set a local notification', (): void => {
    const localSpy: jest.SpyInstance = jest.spyOn(localNotificationService.localNotifications, 'schedule');

    localNotificationService.setLocalNotification('test-title', 'optional-text');

    expect(localSpy).toHaveBeenCalledWith({
      title: 'test-title',
      foreground: true,
      color: '40e0cf',
      text: 'optional-text'
    });
  });
});
