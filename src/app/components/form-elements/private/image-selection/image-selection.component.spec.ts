/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockImage } from '@test/mock-models';
import { ErrorReportingServiceStub, ImageServiceStub, LoadingServiceStub } from '@test/service-stubs';
import { LoadingStub, ModalControllerStub } from '@test/ionic-stubs';

/* Interface imports */
import { Image } from '@shared/interfaces';

/* Service imports */
import { ErrorReportingService, ImageService, LoadingService } from '@services/public';

/* Component imports */
import { ImageSelectionComponent } from './image-selection.component';


describe('ImageSelectionComponent', (): void => {
  let fixture: ComponentFixture<ImageSelectionComponent>;
  let component: ImageSelectionComponent;
  let originalOnInit: () => void;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ ImageSelectionComponent ],
      providers: [
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: ImageService, useClass: ImageServiceStub },
        { provide: LoadingService, useClass: LoadingServiceStub },
        { provide: ModalController, useClass: ModalControllerStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ImageSelectionComponent);
    component = fixture.componentInstance;
    component.modalCtrl.dismiss = jest.fn();
    originalOnInit = component.ngOnInit;
    component.ngOnInit = jest.fn();
    component.errorReporter.handleUnhandledError = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should init the component with no options', (): void => {
    component.ngOnInit = originalOnInit;

    fixture.detectChanges();

    component.ngOnInit();
    expect(component.image).toBeNull();
    expect(component.label.length).toEqual(0);
    expect(component.overrideTitleCase).toBe(false);
  });

  test('should init the component with options', (): void => {
    component.ngOnInit = originalOnInit;

    fixture.detectChanges();

    const _mockImage: Image = mockImage();
    const mockOptions: { label: string, overrideTitleCase: boolean, image?: Image } = {
      label: 'test-label',
      overrideTitleCase: true,
      image: _mockImage
    };
    component.options = mockOptions;
    component.ngOnInit();
    expect(component.image).toStrictEqual(_mockImage);
    expect(component.label).toMatch('test-label');
    expect(component.overrideTitleCase).toBe(true);
  });

  test('should dismiss the modal', (): void => {
    const dismissSpy: jest.SpyInstance = jest.spyOn(component.modalCtrl, 'dismiss');

    fixture.detectChanges();

    component.dismiss();
    expect(dismissSpy).toHaveBeenCalled();
  });

  test('should open the image gallery', (done: jest.DoneCallback) => {
    const _mockLoading: any = new LoadingStub();
    component.loadingService.createLoader = jest.fn()
      .mockReturnValue(Promise.resolve(_mockLoading));
    const _mockImage: Image = mockImage();
    component.imageService.importImage = jest.fn()
      .mockReturnValue(of(_mockImage));
    const createSpy: jest.SpyInstance = jest.spyOn(component.loadingService, 'createLoader');
    const importSpy: jest.SpyInstance = jest.spyOn(component.imageService, 'importImage');
    const cdSpy: jest.SpyInstance = jest.spyOn(component.cdRef, 'detectChanges');
    const dismissSpy: jest.SpyInstance = jest.spyOn(_mockLoading, 'dismiss');

    fixture.detectChanges();

    component.openGallery();
    setTimeout((): void => {
      expect(createSpy).toHaveBeenCalled();
      expect(importSpy).toHaveBeenCalled();
      expect(cdSpy).toHaveBeenCalled();

      setTimeout((): void => {
        expect(dismissSpy).toHaveBeenCalled();
        done();
      }, 10);
    }, 10);
  });

  test('should get an error on image gallery error', (done: jest.DoneCallback) => {
    const _mockLoading: any = new LoadingStub();
    component.loadingService.createLoader = jest.fn()
      .mockReturnValue(Promise.resolve(_mockLoading));
    const _mockError: Error = new Error('test-error');
    component.imageService.importImage = jest.fn()
      .mockReturnValue(throwError(_mockError));
    const createSpy: jest.SpyInstance = jest.spyOn(component.loadingService, 'createLoader');
    const importSpy: jest.SpyInstance = jest.spyOn(component.imageService, 'importImage');
    const cdSpy: jest.SpyInstance = jest.spyOn(component.cdRef, 'detectChanges');
    const dismissSpy: jest.SpyInstance = jest.spyOn(_mockLoading, 'dismiss');
    const errorSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');

    fixture.detectChanges();

    component.openGallery();
    setTimeout((): void => {
      expect(createSpy).toHaveBeenCalled();
      expect(importSpy).toHaveBeenCalled();
      expect(cdSpy).not.toHaveBeenCalled();
      expect(component.image).toBeNull();
      expect(errorSpy).toHaveBeenCalledWith(_mockError);

      setTimeout((): void => {
        expect(dismissSpy).toHaveBeenCalled();
        done();
      }, 10);
    }, 10);
  });

  test('should dismiss modal with an image', (): void => {
    const _mockImage: Image = mockImage();
    component.image = _mockImage;
    const dismissSpy: jest.SpyInstance = jest.spyOn(component.modalCtrl, 'dismiss');

    fixture.detectChanges();

    component.selectPhoto();
    expect(dismissSpy).toHaveBeenCalledWith(_mockImage);
  });

  test('should render the template', (): void => {
    component.ngOnInit = originalOnInit;
    const _mockImage: Image = mockImage();
    const mockOptions: { label: string, overrideTitleCase: boolean, image?: Image } = {
      label: 'test-label',
      overrideTitleCase: true,
      image: _mockImage
    };
    component.options = mockOptions;

    fixture.detectChanges();

    component.ngOnInit();
    const header: HTMLElement = fixture.nativeElement.querySelector('header');
    expect(header.textContent).toMatch('Select test-label');
    const button: HTMLElement = fixture.nativeElement.querySelector('ion-button');
    expect(button.textContent).toMatch('Open Gallery');
    const img: HTMLElement = fixture.nativeElement.querySelector('img');
    expect(img.getAttribute('src')).toMatch(_mockImage.url);
    const formButtons: HTMLElement = fixture.nativeElement.querySelector('app-form-buttons');
    expect(formButtons).toBeTruthy();
  });

});
