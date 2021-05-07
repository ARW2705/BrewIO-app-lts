/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { ToastController } from '@ionic/angular';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockToastButtons, mockToastElement } from '../../../../test-config/mock-models';
import { ToastControllerStub } from '../../../../test-config/ionic-stubs';

/* Interface imports */
import { ToastButton } from '../../shared/interfaces/toast-button';

/* Default imports */
import { defaultDismissButton } from '../../shared/defaults/default-dismiss-button';

/* Service imports */
import { ToastService } from './toast.service';


describe('ToastService', (): void => {
  let injector: TestBed;
  let toastService: ToastService;
  let toastCtrl: ToastController;
  configureTestBed();

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        ToastService,
        { provide: ToastController, useClass: ToastControllerStub }
      ]
    });

    injector = getTestBed();
    toastService = injector.get(ToastService);
    toastCtrl = injector.get(ToastController);
  }));

  test('should create the service', (): void => {
    expect(toastService).toBeDefined();
  });

  test('should present basic toast', (done: jest.DoneCallback): void => {
    const _mockToastElement = mockToastElement();

    toastCtrl.create = jest
      .fn()
      .mockReturnValue(Promise.resolve(_mockToastElement));

    const createSpy: jest.SpyInstance = jest.spyOn(toastCtrl, 'create');
    const presentSpy: jest.SpyInstance = jest.spyOn(_mockToastElement, 'present');

    toastService.presentToast('test-message');

    setTimeout((): void => {
      expect(createSpy).toHaveBeenCalledWith({
        message: 'test-message',
        cssClass: 'toast-main',
        buttons: [ defaultDismissButton ]
      });
      expect(presentSpy).toHaveBeenCalled();
      done();
    }, 10);
  });

  test('should present toast with options', (done: jest.DoneCallback): void => {
    const _mockToastElement = mockToastElement();
    const _mockToastButtons: ToastButton[] = mockToastButtons();
    const _mockDismissFn = (): void => { console.log('dismiss'); };

    const toast = Promise.resolve(_mockToastElement);

    toastCtrl.create = jest
      .fn()
      .mockReturnValue(toast);

    _mockToastElement.onDidDismiss = jest
      .fn()
      .mockReturnValue(Promise.resolve());

    const createSpy: jest.SpyInstance = jest.spyOn(toastCtrl, 'create');
    const presentSpy: jest.SpyInstance = jest.spyOn(_mockToastElement, 'present');
    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    toastService.presentToast(
      'test-message',
      1000,
      'bottom',
      'custom-class',
      _mockToastButtons,
      'toast-header',
      _mockDismissFn
    );

    setTimeout((): void => {
      expect(createSpy).toHaveBeenCalledWith({
        message: 'test-message',
        cssClass: 'toast-main custom-class',
        buttons: _mockToastButtons,
        duration: 1000,
        position: 'bottom',
        header: 'toast-header',
      });
      expect(presentSpy).toHaveBeenCalled();
      toast.then((_toast) => _toast.onDidDismiss());
      setTimeout((): void => {
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('dismiss');
        done();
      }, 10);
    }, 10);
  });

  test('should present a basic error toast', (): void => {
    toastService.presentToast = jest
      .fn();

    const toastSpy: jest.SpyInstance = jest.spyOn(toastService, 'presentToast');

    toastService.presentErrorToast('test-message');

    expect(toastSpy).toHaveBeenCalledWith(
      'test-message',
      null,
      'middle',
      'toast-error',
      null,
      null,
      undefined
    );
  });

  test('should present an error toast with optional dismiss function', (): void => {
    const _mockDismissFn = (): void => { console.log('dismiss'); };

    toastService.presentToast = jest
      .fn();

    const toastSpy: jest.SpyInstance = jest.spyOn(toastService, 'presentToast');

    toastService.presentErrorToast('test-message', _mockDismissFn);

    expect(toastSpy).toHaveBeenCalledWith(
      'test-message',
      null,
      'middle',
      'toast-error',
      null,
      null,
      _mockDismissFn
    );
  });

});
