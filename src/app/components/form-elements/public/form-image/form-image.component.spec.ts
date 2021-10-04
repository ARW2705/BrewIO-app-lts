/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockImage } from '../../../../../../test-config/mock-models';
import { ImageServiceStub, ModalServiceStub, ErrorReportingServiceStub } from '../../../../../../test-config/service-stubs';

/* Constant imports */
import { MISSING_IMAGE_URL } from '../../../../shared/constants';

/* Interface imports */
import { Image } from '../../../../shared/interfaces';

/* Component imports */
import { ImageFormPage } from '../../../../pages/forms/image-form/image-form.page';

/* Service imports */
import { ImageService, ModalService, ErrorReportingService } from '../../../../services/services';

/* Component imports */
import { FormImageComponent } from './form-image.component';


describe('FormImageComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<FormImageComponent>;
  let component: FormImageComponent;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ FormImageComponent ],
      providers: [
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: ImageService, useClass: ImageServiceStub },
        { provide: ModalService, useClass: ModalServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(FormImageComponent);
    component = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should open image modal and handle cancelled modal', (done: jest.DoneCallback): void => {
    const _mockImage: Image = mockImage();
    const _mockOriginalImage: Image = mockImage();
    component.image = _mockImage;
    component.modalService.openModal = jest.fn()
      .mockReturnValue(of(null));
    component.imageService.hasDefaultImage = jest.fn()
      .mockReturnValue(true);
    const openSpy: jest.SpyInstance = jest.spyOn(component.modalService, 'openModal');
    const emitSpy: jest.SpyInstance = jest.spyOn(component.imageModalEvent, 'emit');

    fixture.detectChanges();

    component.openImageModal();
    setTimeout((): void => {
      expect(openSpy).toHaveBeenCalledWith(ImageFormPage, null);
      expect(emitSpy).not.toHaveBeenCalled();
      expect(component.image).toStrictEqual(_mockOriginalImage);
      done();
    }, 10);
  });

  test('should open image modal and handle new image', (done: jest.DoneCallback): void => {
    const _mockImage: Image = mockImage();
    const _mockNewImage: Image = mockImage();
    _mockNewImage.cid = 'new';
    _mockNewImage.serverFilename = 'other name';
    component.image = _mockImage;
    component.modalService.openModal = jest.fn()
      .mockReturnValue(of(_mockNewImage));
    component.imageService.hasDefaultImage = jest.fn()
      .mockReturnValue(false);
    const openSpy: jest.SpyInstance = jest.spyOn(component.modalService, 'openModal');
    const emitSpy: jest.SpyInstance = jest.spyOn(component.imageModalEvent, 'emit');

    fixture.detectChanges();

    component.openImageModal();
    setTimeout((): void => {
      expect(openSpy).toHaveBeenCalledWith(ImageFormPage, { image: _mockImage });
      expect(emitSpy).toHaveBeenCalledWith(_mockNewImage);
      done();
    }, 10);
  });

  test('should open image and catch error', (done: jest.DoneCallback): void => {
    const _mockError: Error = new Error('test-error');
    component.modalService.openModal = jest.fn()
      .mockReturnValue(throwError(_mockError));
    component.imageService.hasDefaultImage = jest.fn()
      .mockReturnValue(false);
    component.errorReporter.handleUnhandledError = jest.fn();
    const errorSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');

    fixture.detectChanges();

    component.openImageModal();
    setTimeout((): void => {
      expect(errorSpy).toHaveBeenCalledWith(_mockError);
      done();
    }, 10);
  });

  test('should render the template with an image', (): void => {
    const _mockImage: Image = mockImage();
    component.image = _mockImage;
    component.label = 'test label';

    fixture.detectChanges();

    const label: HTMLElement = global.document.querySelector('ion-label');
    expect(label.textContent).toMatch('Test Label');
    const image: HTMLElement = global.document.querySelector('img');
    expect(image['src']).toMatch(_mockImage.url);
  });

  test('should render the template with an image', (): void => {
    component.label = 'test label';

    fixture.detectChanges();

    const label: HTMLElement = global.document.querySelector('ion-label');
    expect(label.textContent).toMatch('Test Label');
    const image: HTMLElement = global.document.querySelector('img');
    expect(image['src']).toMatch(MISSING_IMAGE_URL);
  });

});
