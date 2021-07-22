/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockImage } from '../../../../../test-config/mock-models';
import { ErrorReportingServiceStub, ImageServiceStub } from '../../../../../test-config/service-stubs';
import { HeaderComponentStub } from '../../../../../test-config/component-stubs';
import { LoadingControllerStub, LoadingStub, ModalControllerStub } from '../../../../../test-config/ionic-stubs';

/* Interface imports */
import { Image } from '../../../shared/interfaces';

/* Service imports */
import { ErrorReportingService, ImageService } from '../../../services/services';

/* Page imports */
import { ImageFormPage } from './image-form.page';


describe('ImageFormPage', (): void => {
  let fixture: ComponentFixture<ImageFormPage>;
  let imageFormPage: ImageFormPage;
  let originalOnInit: any;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        ImageFormPage,
        HeaderComponentStub,
      ],
      providers: [
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: LoadingController, useClass: LoadingControllerStub },
        { provide: ModalController, useClass: ModalControllerStub },
        { provide: ImageService, useClass: ImageServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ImageFormPage);
    imageFormPage = fixture.componentInstance;
    originalOnInit = imageFormPage.ngOnInit;
    imageFormPage.ngOnInit = jest
      .fn();
    imageFormPage.modalCtrl.dismiss = jest
      .fn();
    imageFormPage.errorReporter.handleUnhandledError = jest
      .fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(imageFormPage).toBeDefined();
  });

  describe('Form Methods', (): void => {

    test('should init the component', (): void => {
      const _mockImage: Image = mockImage();

      imageFormPage.options = { image: _mockImage };

      imageFormPage.ngOnInit = originalOnInit;

      fixture.detectChanges();

      expect(imageFormPage.image).toStrictEqual(_mockImage);
    });

    test('should dismiss modal with no data', (): void => {
      imageFormPage.modalCtrl.dismiss = jest
        .fn();

      const dismissSpy: jest.SpyInstance = jest.spyOn(imageFormPage.modalCtrl, 'dismiss');

      fixture.detectChanges();

      imageFormPage.dismiss();

      expect(dismissSpy).toHaveBeenCalled();
    });

    test('should open image gallery', (done: jest.DoneCallback): void => {
      const _mockImage: Image = mockImage();
      const _stubLoading: LoadingStub = new LoadingStub();

      imageFormPage.cdRef.detectChanges = jest
        .fn();

      imageFormPage.imageService.importImage = jest
        .fn()
        .mockReturnValue(of(_mockImage));

      imageFormPage.loadingCtrl.create = jest
        .fn()
        .mockReturnValue(_stubLoading);

      const dismissSpy: jest.SpyInstance = jest.spyOn(_stubLoading, 'dismiss');

      fixture.detectChanges();

      imageFormPage.openGallery();

      setTimeout((): void => {
        expect(imageFormPage.image).toStrictEqual(_mockImage);
        expect(dismissSpy).toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should handle error from image gallery', (done: jest.DoneCallback): void => {
      const _stubLoading: LoadingStub = new LoadingStub();
      const _mockError: Error = new Error('test-error');

      imageFormPage.imageService.importImage = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      imageFormPage.loadingCtrl.create = jest
        .fn()
        .mockReturnValue(_stubLoading);

      const dismissSpy: jest.SpyInstance = jest.spyOn(_stubLoading, 'dismiss');
      const errorSpy: jest.SpyInstance = jest.spyOn(imageFormPage.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      imageFormPage.openGallery();

      setTimeout((): void => {
        expect(dismissSpy).toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should submit a photo', (): void => {
      const _mockImage: Image = mockImage();

      imageFormPage.image = _mockImage;

      imageFormPage.modalCtrl.dismiss = jest
        .fn();

      const dismissSpy: jest.SpyInstance = jest.spyOn(imageFormPage.modalCtrl, 'dismiss');

      fixture.detectChanges();

      imageFormPage.selectPhoto();

      expect(dismissSpy).toHaveBeenCalledWith(_mockImage);
    });

  });


  describe('Render Template', (): void => {

    test('should render page without image', (): void => {
      fixture.detectChanges();

      const buttons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');

      expect(buttons.item(0).textContent).toMatch('Open Gallery');
      expect(buttons.item(1).textContent).toMatch('Select Photo');
      expect(buttons.item(1)['disabled']).toBe(true);

      const image: HTMLElement = fixture.nativeElement.querySelector('ion-img');
      expect(image).toBeNull();
    });

    test('should render page with image', (): void => {
      const _mockImage: Image = mockImage();

      imageFormPage.image = _mockImage;

      fixture.detectChanges();

      const buttons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');

      expect(buttons.item(0).textContent).toMatch('Open Gallery');
      expect(buttons.item(1).textContent).toMatch('Select Photo');
      expect(buttons.item(1)['disabled']).toBe(false);

      const image: HTMLElement = fixture.nativeElement.querySelector('ion-img');
      expect(image['src']).toMatch(_mockImage.url);
    });

  });

});
