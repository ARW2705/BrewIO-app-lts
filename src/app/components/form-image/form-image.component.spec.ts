/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockImage } from '../../../../test-config/mock-models';
import { ModalControllerStub, ModalStub } from '../../../../test-config/ionic-stubs';
import { ImageServiceStub, ToastServiceStub } from '../../../../test-config/service-stubs';

/* Constant imports */
import { MISSING_IMAGE_URL } from '../../shared/constants';

/* Default imports */
import { defaultImage } from '../../shared/defaults';

/* Interface imports */
import { Image } from '../../shared/interfaces';

/* Component imports */
import { ImageFormPage } from '../../pages/forms/image-form/image-form.page';

/* Service imports */
import { ImageService, ToastService } from '../../services/services';

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
        { provide: ImageService, useClass: ImageServiceStub },
        { provide: ModalController, useClass: ModalControllerStub },
        { provide: ToastService, useClass: ToastServiceStub }
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

    expect(component).toBeDefined();
  });

  test('should get image modal options', (): void => {
    component.imageService.hasDefaultImage = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    const _mockImage: Image = mockImage();
    component.image = _mockImage;

    fixture.detectChanges();

    const defaultOption: object = component.getImageModalOptions();
    expect(defaultOption).toBeNull();
    const nonDefaultOption: object = component.getImageModalOptions();
    expect(nonDefaultOption).toStrictEqual({image: _mockImage});
  });

  test('should handle image modal error', (): void => {
    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
    const toastSpy: jest.SpyInstance = jest.spyOn(component.toastService, 'presentErrorToast');

    fixture.detectChanges();

    const handler: (error: string) => void = component.onImageModalError();
    handler('test-error');
    const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
    expect(consoleCalls[0]).toMatch('modal dismiss error');
    expect(consoleCalls[1]).toMatch('test-error');
    expect(toastSpy).toHaveBeenCalledWith('Error selecting image');
  });

  test('should handle image modal success', (): void => {
    const _mockPreviousImage: Image = mockImage();
    _mockPreviousImage.serverFilename = `${_mockPreviousImage}-test`;
    const _mockNewImage: Image = mockImage();
    _mockNewImage.cid = 'image-2';
    component.image = _mockPreviousImage;
    component.imageModalEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.imageModalEvent, 'emit');

    fixture.detectChanges();

    const handler: (data: object) => void = component.onImageModalSuccess();
    handler({ data: _mockNewImage });
    const emitCall: Image = emitSpy.mock.calls[0][0];
    expect(emitCall.serverFilename).toMatch(_mockPreviousImage.serverFilename);
    expect(emitCall.cid).toMatch(_mockNewImage.cid);
  });

  test('should open image modal', (done: jest.DoneCallback): void => {
    const _stubModal: ModalStub = new ModalStub();
    component.getImageModalOptions = jest.fn()
      .mockReturnValue({});
    component.modalCtrl.create = jest.fn()
      .mockReturnValue(_stubModal);
    component.onImageModalSuccess = jest.fn();
    _stubModal.onDidDismiss = jest.fn()
      .mockReturnValue(Promise.resolve());
    const successSpy: jest.SpyInstance = jest.spyOn(component, 'onImageModalSuccess');

    fixture.detectChanges();

    component.openImageModal();
    _stubModal.onDidDismiss();
    setTimeout((): void => {
      expect(successSpy).toHaveBeenCalled();
      done();
    }, 10);
  });

  test('should perform no actions if modal was cancelled', (): void => {
    const emitSpy: jest.SpyInstance = jest.spyOn(component.imageModalEvent, 'emit');

    fixture.detectChanges();

    const handler: (data: object) => void = component.onImageModalSuccess();
    handler({ data: null });
    expect(emitSpy).not.toHaveBeenCalled();
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
