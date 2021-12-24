/* Module imports */
import { async, getTestBed, TestBed } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';
import { Observable, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { ErrorReportingServiceStub } from '@test/service-stubs';
import { ModalControllerStub, ModalStub } from '@test/ionic-stubs';

/* Service imports */
import { ErrorReportingService } from '@services/error-reporting/error-reporting.service';
import { ModalService } from './modal.service';


describe('ModalService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: ModalService;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot()],
      providers: [
        ModalService,
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: ModalController, useClass: ModalControllerStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(ModalService);
    service.errorReporter.handleGenericCatchError = jest.fn()
      .mockReturnValue((error: Error): Observable<never> => throwError({}));
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  test('should get default modal success handler', (done: jest.DoneCallback): void => {
    const _mockEvent: OverlayEventDetail<any> = { data: { test: true} };

    service.defaultSuccessHandler()(_mockEvent)
      .subscribe(
        (result: any): void => {
          expect(result).toStrictEqual({ test: true });
          done();
        },
        (error: any): void => {
          console.log('error in should get default modal success handler', error);
          expect(true).toBe(false);
        }
      );
  });

  test('should open a modal with default handlers', (done: jest.DoneCallback): void => {
    service.defaultSuccessHandler = jest.fn()
      .mockReturnValue((event: OverlayEventDetail<any>): Observable<any> => of({}));
    service.openModalHelper = jest.fn()
      .mockReturnValue(Promise.resolve({}));
    const modalSpy: jest.SpyInstance = jest.spyOn(service, 'openModalHelper');
    const _mockComponent: any = { component: true };
    const _mockProps: any = { test: true, prop: 'test' };

    service.openModal(_mockComponent, _mockProps);
    setTimeout((): void => {
      expect(modalSpy).toHaveBeenCalledWith(_mockComponent, _mockProps);
      done();
    }, 10);
  });

  test('should open a modal with override success and error handlers', (done: jest.DoneCallback): void => {
    const defaultSuccessSpy: jest.SpyInstance = jest.spyOn(service, 'defaultSuccessHandler');
    const defaultErrorSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'handleGenericCatchError');
    service.openModalHelper = jest.fn().mockReturnValue(Promise.resolve({}));
    const modalSpy: jest.SpyInstance = jest.spyOn(service, 'openModalHelper');
    const _mockComponent: any = { component: true };
    const _mockProps: any = { test: true, prop: 'test' };
    const _mockSuccessHandler: (event: OverlayEventDetail<any>) => Observable<any> = (event:OverlayEventDetail<any>) => of({});
    const _mockErrorHandler: (error: Error) => Observable<never> = (error: Error): Observable<never> => throwError({});

    service.openModal(_mockComponent, _mockProps, _mockSuccessHandler, _mockErrorHandler);
    setTimeout((): void => {
      expect(defaultSuccessSpy).not.toHaveBeenCalled();
      expect(defaultErrorSpy).not.toHaveBeenCalled();
      expect(modalSpy).toHaveBeenCalledWith(_mockComponent, _mockProps);
      done();
    }, 10);
  });

  test('should open an ion-modal', (done: jest.DoneCallback): void => {
    const _stubModal: ModalStub = new ModalStub();
    _stubModal.onDidDismiss = jest.fn().mockReturnValue(Promise.resolve({}));
    service.modalCtrl.create = jest.fn().mockReturnValue(_stubModal);
    const createSpy: jest.SpyInstance = jest.spyOn(service.modalCtrl, 'create');
    const presentSpy: jest.SpyInstance = jest.spyOn(_stubModal, 'present');
    const dismissSpy: jest.SpyInstance = jest.spyOn(_stubModal, 'onDidDismiss');
    const _mockComponent: any = { component: true };
    const _mockProps: any = { test: true, prop: 'test' };

    service.openModalHelper(_mockComponent, _mockProps);
    setTimeout((): void => {
      expect(createSpy).toHaveBeenCalledWith({
        component: _mockComponent,
        componentProps: _mockProps
      });
      expect(presentSpy).toHaveBeenCalled();
      expect(dismissSpy).toHaveBeenCalled();
      done();
    }, 10);
  });

});
