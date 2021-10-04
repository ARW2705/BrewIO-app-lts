/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockImage } from '../../../../../test-config/mock-models';
import { ErrorReportingServiceStub, ImageServiceStub, LoadingServiceStub } from '../../../../../test-config/service-stubs';
import { HeaderComponentStub } from '../../../../../test-config/component-stubs';
import { ModalControllerStub } from '../../../../../test-config/ionic-stubs';

/* Interface imports */
import { Image } from '../../../shared/interfaces';

/* Service imports */
import { ErrorReportingService, ImageService, LoadingService } from '../../../services/services';

/* Page imports */
import { ImageFormPage } from './image-form.page';


describe('ImageFormPage', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<ImageFormPage>;
  let page: ImageFormPage;
  let originalOnInit: any;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        ImageFormPage,
        HeaderComponentStub,
      ],
      providers: [
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: LoadingService, useClass: LoadingServiceStub },
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
    page = fixture.componentInstance;
    originalOnInit = page.ngOnInit;
    page.ngOnInit = jest.fn();
    page.modalCtrl.dismiss = jest.fn();
    page.errorReporter.handleUnhandledError = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(page).toBeDefined();
  });

  test('should init the component', (): void => {
    page.ngOnInit = originalOnInit;

    fixture.detectChanges();

    expect(page.image).toBeNull();
    const _mockImage: Image = mockImage();
    page.options = { image: _mockImage };
    page.ngOnInit();
    expect(page.image).toStrictEqual(_mockImage);
  });

  test('should dismiss modal with no data', (): void => {
    const dismissSpy: jest.SpyInstance = jest.spyOn(page.modalCtrl, 'dismiss');

    fixture.detectChanges();

    page.dismiss();
    expect(dismissSpy).toHaveBeenCalled();
  });

  test('should open the image gallery', (done: jest.DoneCallback): void => {
    let isDismissed: boolean = false;
    const loadingDismiss: () => Promise<void> = (): Promise<void> => {
      isDismissed = true;
      return Promise.resolve();
    };
    page.loadingService.createLoader = jest.fn()
      .mockReturnValue({ dismiss: loadingDismiss });
    const _mockImage: Image = mockImage();
    page.imageService.importImage = jest.fn()
      .mockReturnValue(of(_mockImage));
    const refSpy: jest.SpyInstance = jest.spyOn(page.cdRef, 'detectChanges');

    fixture.detectChanges();

    page.openGallery();
    setTimeout((): void => {
      expect(page.image).toStrictEqual(_mockImage);
      expect(refSpy).toHaveBeenCalled();
      expect(isDismissed).toBe(true);
      done();
    }, 10);
  });

  test('should handle error on image import', (done: jest.DoneCallback): void => {
    let isDismissed: boolean = false;
    const loadingDismiss: () => Promise<void> = (): Promise<void> => {
      isDismissed = true;
      return Promise.resolve();
    };
    page.loadingService.createLoader = jest.fn()
      .mockReturnValue({ dismiss: loadingDismiss });
    const _mockError: Error = new Error('test-error');
    page.errorReporter.handleUnhandledError = jest.fn();
    page.imageService.importImage = jest.fn()
      .mockReturnValue(throwError(_mockError));
    const errorSpy: jest.SpyInstance = jest.spyOn(page.errorReporter, 'handleUnhandledError');

    fixture.detectChanges();

    page.openGallery();
    setTimeout((): void => {
      expect(errorSpy).toHaveBeenCalledWith(_mockError);
      expect(isDismissed).toBe(true);
      done();
    }, 10);
  });

  test('should dismiss modal with an image', (): void => {
    const _mockImage: Image = mockImage();
    page.image = _mockImage;
    const dismissSpy: jest.SpyInstance = jest.spyOn(page.modalCtrl, 'dismiss');

    fixture.detectChanges();

    page.selectPhoto();
    expect(dismissSpy).toHaveBeenCalledWith(_mockImage);
  });

  test('should render the template', (): void => {
    const _mockImage: Image = mockImage();
    page.image = _mockImage;

    fixture.detectChanges();

    const buttons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');
    expect(buttons.length).toEqual(2);
    const openButton: Element = <Element>buttons.item(0);
    expect(openButton.textContent).toMatch('Open Gallery');
    const selectButton: Element = <Element>buttons.item(1);
    expect(selectButton.textContent).toMatch('Select Photo');
    const image: Element = fixture.nativeElement.querySelector('img');
    expect(image.getAttribute('src')).toMatch(_mockImage.url);
  });

});
