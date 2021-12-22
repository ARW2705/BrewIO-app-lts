/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockImage } from '../../../../../../test-config/mock-models';
import { ErrorReportingServiceStub, ImageServiceStub, ModalServiceStub } from '../../../../../../test-config/service-stubs';
import { HeaderComponentStub } from '../../../../../../test-config/component-stubs';

/* Constant imports */
import { MISSING_IMAGE_URL } from '../../../../shared/constants';

/* Interface imports */
import { Image } from '../../../../shared/interfaces';

/* Service imports */
import { ErrorReportingService, ImageService, ModalService } from '../../../../services/services';

/* Page imports */
import { FormImageComponent } from './form-image.component';


describe('FormImageComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<FormImageComponent>;
  let component: FormImageComponent;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        FormImageComponent,
        HeaderComponentStub,
      ],
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
    component.errorReporter.handleUnhandledError = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  test('should get image modal options', (): void => {
    component.imageService.hasDefaultImage = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    const _mockImage: Image = mockImage();
    component.overrideTitleCase = true;
    component.label = 'test-label';

    fixture.detectChanges();

    const optionsWithoutImage: object = component.getImageModalOptions();
    expect(optionsWithoutImage).toStrictEqual({
      overrideTitleCase: true,
      label: 'test-label'
    });
    component.image = _mockImage;
    const optionsWithImage: object = component.getImageModalOptions();
    expect(optionsWithImage).toStrictEqual({
      overrideTitleCase: true,
      label: 'test-label',
      image: _mockImage
    });
  });

  test('should open the image modal and handle returned image', (done: jest.DoneCallback): void => {
    const _mockImage: Image = mockImage();
    component.modalService.openModal = jest.fn()
      .mockReturnValue(of(_mockImage));
    component.getImageModalOptions = jest.fn()
      .mockReturnValue({});
    component.imageModalEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.imageModalEvent, 'emit');

    fixture.detectChanges();

    expect(component.image).toBeUndefined();
    component.openImageModal();
    setTimeout((): void => {
      expect(emitSpy).toHaveBeenCalledWith(_mockImage);
      done();
    }, 10);
  });

  test('should open the image modal and replace image', (done: jest.DoneCallback): void => {
    const _mockImage: Image = mockImage();
    _mockImage.serverFilename = 'old-name';
    component.image = _mockImage;
    const _mockImageUpdate: Image = mockImage();
    _mockImageUpdate.cid += '1';
    _mockImageUpdate.serverFilename = '';
    component.modalService.openModal = jest.fn()
      .mockReturnValue(of(_mockImageUpdate));
    component.getImageModalOptions = jest.fn()
      .mockReturnValue({});
    component.imageModalEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.imageModalEvent, 'emit');

    fixture.detectChanges();

    component.openImageModal();
    setTimeout((): void => {
      const _mockExpectedImage: Image = mockImage();
      _mockExpectedImage.cid += '1';
      _mockExpectedImage.serverFilename = 'old-name';
      expect(emitSpy).toHaveBeenCalledWith(_mockExpectedImage);
      done();
    }, 10);
  });

  test('should open the image modal and handle dismissal without image', (done: jest.DoneCallback): void => {
    component.modalService.openModal = jest.fn()
      .mockReturnValue(of(null));
    component.getImageModalOptions = jest.fn()
      .mockReturnValue({});
    component.imageModalEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.imageModalEvent, 'emit');

    fixture.detectChanges();

    expect(component.image).toBeUndefined();
    component.openImageModal();
    setTimeout((): void => {
      expect(emitSpy).not.toHaveBeenCalled();
      done();
    }, 10);
  });

  test('should handle error from image modal', (done: jest.DoneCallback) => {
    const _mockError: Error = new Error('test-error');
    component.modalService.openModal = jest.fn()
      .mockReturnValue(throwError(_mockError));
    component.errorReporter.handleUnhandledError = jest.fn();
    const errorSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');

    fixture.detectChanges();

    component.openImageModal();
    setTimeout((): void => {
      expect(errorSpy).toHaveBeenCalledWith(_mockError);
      done();
    }, 10);
  });

  test('should render the template', (): void => {
    component.label = 'test-label';
    const _mockImage: Image = mockImage();
    component.image = _mockImage;
    component.overrideTitleCase = false;

    fixture.detectChanges();

    const label: HTMLElement = fixture.nativeElement.querySelector('ion-label');
    expect(label.textContent).toMatch('Test-label');
    const img: HTMLElement = fixture.nativeElement.querySelector('img');
    expect(img.getAttribute('src')).toMatch(_mockImage.url);
    component.image = null;

    fixture.detectChanges();

    const missingImage: HTMLElement = fixture.nativeElement.querySelector('img');
    expect(missingImage.getAttribute('src')).toMatch(MISSING_IMAGE_URL);
  });

});
