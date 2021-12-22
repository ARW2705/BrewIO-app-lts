/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { LoadingController } from '@ionic/angular';

/* Test bed configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { LoadingControllerStub, LoadingStub } from '../../../../test-config/ionic-stubs';

/* Service imports */
import { LoadingService } from './loading.service';


describe('LoadingService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: LoadingService;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        LoadingService,
        { provide: LoadingController, useClass: LoadingControllerStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(LoadingService);
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  test('should create a loader', (done: jest.DoneCallback): void => {
    const _stubLoading: LoadingStub = new LoadingStub();
    _stubLoading.present = jest.fn()
    .mockReturnValue(Promise.resolve());
    const presentSpy: jest.SpyInstance = jest.spyOn(_stubLoading, 'present');
    service.loadingCtrl.create = jest.fn()
      .mockReturnValue(_stubLoading);
    const createSpy: jest.SpyInstance = jest.spyOn(service.loadingCtrl, 'create');

    service.createLoader();
    setTimeout((): void => {
      expect(createSpy).toHaveBeenCalledWith({
        cssClass: 'loading-custom',
        spinner: 'lines'
      });
      expect(presentSpy).toHaveBeenCalled();
      done();
    }, 10);
  });

});
