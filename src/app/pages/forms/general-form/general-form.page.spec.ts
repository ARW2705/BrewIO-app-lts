/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

/* Test configuration imports */
import { configureTestBed } from '../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockEnglishUnits, mockMetricUnits, mockImage, mockStyles } from '../../../../../test-config/mock-models';
import { CalculationsServiceStub, PreferencesServiceStub, ToastServiceStub, UtilityServiceStub } from '../../../../../test-config/service-stubs';
import { HeaderComponentStub } from '../../../../../test-config/component-stubs';
import { ActivatedRouteStub, ModalControllerStub, ModalStub } from '../../../../../test-config/ionic-stubs';

/* Default imports */
import { defaultImage } from '../../../shared/defaults';

/* Interface imports */
import { Image, SelectedUnits, Style } from '../../../shared/interfaces';

/* Service imports */
import { CalculationsService, PreferencesService, ToastService, UtilityService } from '../../../services/services';

/* Page imports */
import { GeneralFormPage } from './general-form.page';


describe('GeneralFormPage', (): void => {
  let fixture: ComponentFixture<GeneralFormPage>;
  let genformPage: GeneralFormPage;
  let originalOnInit: any;
  const formBuilder: FormBuilder = new FormBuilder();
  const defaultForm: object = {
    name: '',
    variantName: '',
    style: '',
    brewingType: '',
    efficiency: 70,
    mashDuration: 60,
    boilDuration: 60,
    batchVolume: 5,
    boilVolume: 5,
    mashVolume: 5,
    isFavorite: false,
    isMaster: false
  };
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        GeneralFormPage,
        HeaderComponentStub,
      ],
      imports: [
        IonicModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        { provide: CalculationsService, useClass: CalculationsServiceStub },
        { provide: ModalController, useClass: ModalControllerStub },
        { provide: PreferencesService, useClass: PreferencesServiceStub },
        { provide: ToastService, useClass: ToastServiceStub },
        { provide: UtilityService, useClass: UtilityServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(GeneralFormPage);
    genformPage = fixture.componentInstance;
    originalOnInit = genformPage.ngOnInit;
    genformPage.ngOnInit = jest
      .fn();
    genformPage.toastService.presentToast = jest
      .fn();
    genformPage.toastService.presentErrorToast = jest
      .fn();
    genformPage.modalCtrl.dismiss = jest
      .fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(genformPage).toBeDefined();
  });

  describe('Form Methods', (): void => {

    test('should init the component', (): void => {
      const _mockMetricUnits: SelectedUnits = mockMetricUnits();

      genformPage.ngOnInit = originalOnInit;

      genformPage.preferenceService.getSelectedUnits = jest
        .fn()
        .mockReturnValue(_mockMetricUnits);

      genformPage.initForm = jest
        .fn();

      fixture.detectChanges();

      expect(genformPage.units).toStrictEqual(_mockMetricUnits);
    });

    test('should add a name control based on form type', (): void => {
      fixture.detectChanges();

      genformPage.generalForm = formBuilder.group({});
      genformPage.formType = 'none';

      genformPage.addNameControl();
      expect(genformPage.generalForm.controls.variantName).toBeDefined();
    });

    test('should run conversions of form values to prepare submission', (): void => {
      let shouldRequire: boolean = false;
      genformPage.requiresConversion = jest
        .fn()
        .mockImplementation((key: string): boolean => {
          shouldRequire = !shouldRequire;
          return shouldRequire;
        });

      genformPage.calculator.convertVolume = jest
        .fn()
        .mockImplementation((value: number, ...options: any[]): number => value);

      fixture.detectChanges();

      genformPage.generalForm = formBuilder.group(defaultForm);

      const submissionValues: object = genformPage.convertForSubmission();

      genformPage.controlsToConvertToNumber.forEach((key: string): void => {
        expect(typeof submissionValues[key] === 'number').toBe(true);
      });
    });

    test('should dismiss modal with no data', (): void => {
      genformPage.modalCtrl.dismiss = jest
        .fn();

      const dismissSpy: jest.SpyInstance = jest.spyOn(genformPage.modalCtrl, 'dismiss');

      fixture.detectChanges();

      genformPage.dismiss();

      expect(dismissSpy).toHaveBeenCalled();
    });

    test('should check if given key should be mapped to form', (): void => {
      fixture.detectChanges();

      expect(genformPage.hasMappableValue('labelImage')).toBe(false);
      expect(genformPage.hasMappableValue('isFavorite')).toBe(false);
      expect(genformPage.hasMappableValue('isMaster')).toBe(false);
      expect(genformPage.hasMappableValue('mappable')).toBe(true);
    });

    test('should init the form', (): void => {
      genformPage.addNameControl = jest
        .fn();

      genformPage.mapDataToForm = jest
        .fn();

      fixture.detectChanges();

      genformPage.initForm();

      expect(genformPage.generalForm.value).toStrictEqual({
        style: '',
        brewingType: '',
        efficiency: 70,
        mashDuration: 60,
        boilDuration: 60,
        batchVolume: null,
        boilVolume: null,
        mashVolume: null,
        isFavorite: false,
        isMaster: false
      });
    });

    test('should map nav data to form', (): void => {
      const _mockImage: Image = mockImage();
      const _mockStyle: Style = mockStyles()[0];

      const data: object = {
        style: _mockStyle,
        brewingType: 'test-type',
        efficiency: 80,
        mashDuration: 90,
        boilDuration: 90,
        batchVolume: 5,
        boilVolume: 5,
        mashVolume: 5,
        labelImage: _mockImage
      };

      genformPage.data = data;

      genformPage.hasMappableValue = jest
        .fn()
        .mockImplementation((key: string): boolean => key !== 'labelImage');

      let shouldRequire: boolean = false;
      genformPage.calculator.requiresConversion = jest
        .fn()
        .mockImplementation((key: string): boolean => {
          shouldRequire = !shouldRequire;
          return shouldRequire;
        });

      genformPage.utilService.roundToDecimalPlace = jest
        .fn()
        .mockImplementation((value: number, places: number): number => {
          if (places < 0) {
            return -1;
          }
          return Math.round(value * Math.pow(10, places)) / Math.pow(10, places);
        });

      genformPage.calculator.convertVolume = jest
        .fn()
        .mockImplementation((value: number, ...options: any[]): number => value);

      fixture.detectChanges();

      genformPage.generalForm = formBuilder.group(defaultForm);

      genformPage.mapDataToForm();

      expect(genformPage.generalForm.value).toStrictEqual({
        name: '',
        variantName: '',
        style: _mockStyle,
        brewingType: 'test-type',
        efficiency: 80,
        mashDuration: 90,
        boilDuration: 90,
        batchVolume: 5,
        boilVolume: 5,
        mashVolume: 5,
        isFavorite: false,
        isMaster: false
      });
      expect(genformPage.styleSelection).toStrictEqual(_mockStyle);
      expect(genformPage.labelImage).toStrictEqual(_mockImage);
    });

    test('should handle image modal error', (): void => {
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
      const toastSpy: jest.SpyInstance = jest.spyOn(genformPage.toastService, 'presentErrorToast');

      fixture.detectChanges();

      const handler: (error: string) => void = genformPage.onImageModalError();
      handler('test-error');

      const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
      expect(consoleCalls[0]).toMatch('modal dismiss error');
      expect(consoleCalls[1]).toMatch('test-error');
      expect(toastSpy).toHaveBeenCalledWith('Error selecting image');
    });

    test('should handle image modal success', (): void => {
      const _defaultImage: Image = defaultImage();
      const _mockImage: Image = mockImage();
      const _mockImage2: Image = mockImage();
      _mockImage2.cid = 'image-2';

      fixture.detectChanges();

      expect(genformPage.labelImage).toStrictEqual(_defaultImage);

      const handler: (data: object) => void = genformPage.onImageModalSuccess();

      handler({ data: _mockImage });
      expect(genformPage.labelImage).toStrictEqual(_mockImage);

      handler({ data: _mockImage2 });
      expect(genformPage.labelImage).toStrictEqual(_mockImage2);
    });

    test('should open image modal', (done: jest.DoneCallback): void => {
      const _stubModal: ModalStub = new ModalStub();

      genformPage.modalCtrl.create = jest
        .fn()
        .mockReturnValue(_stubModal);

      genformPage.onImageModalSuccess = jest
        .fn();

      _stubModal.onDidDismiss = jest
        .fn()
        .mockReturnValue(Promise.resolve());

      const successSpy: jest.SpyInstance = jest.spyOn(genformPage, 'onImageModalSuccess');

      fixture.detectChanges();

      genformPage.openImageModal();

      _stubModal.onDidDismiss();

      setTimeout((): void => {
        expect(successSpy).toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should set brewingType field touched flag', (): void => {
      fixture.detectChanges();

      genformPage.generalForm = formBuilder.group(defaultForm);

      genformPage.onBrewingSelect();
      expect(genformPage.brewingTouched).toBe(true);

      genformPage.generalForm.controls.brewingType.setValue('biab');
      genformPage.onBrewingSelect();
      expect(genformPage.brewingTouched).toBe(false);
    });

    test('should set style field touched flag', (): void => {
      fixture.detectChanges();

      const _mockStyle: Style = mockStyles()[0];
      genformPage.generalForm = formBuilder.group(defaultForm);

      genformPage.onStyleSelect();
      expect(genformPage.styleTouched).toBe(true);

      genformPage.generalForm.controls.style.setValue(_mockStyle);
      genformPage.onStyleSelect();
      expect(genformPage.styleTouched).toBe(false);
    });

    test('should set style selection', (): void => {
      fixture.detectChanges();

      const _mockStyles: Style[] = mockStyles();

      expect(genformPage.styleSelection).toBeUndefined();

      genformPage.onStyleSelection(_mockStyles[0]);

      expect(genformPage.styleSelection).toStrictEqual(_mockStyles[0]);

      genformPage.onStyleSelection(_mockStyles[1]);

      expect(genformPage.styleSelection).toStrictEqual(_mockStyles[1]);
    });

    test('should submit the form', (): void => {
      genformPage.modalCtrl.dismiss = jest
        .fn();

      genformPage.convertForSubmission = jest
        .fn()
        .mockReturnValue({});

      const dismissSpy: jest.SpyInstance = jest.spyOn(genformPage.modalCtrl, 'dismiss');

      fixture.detectChanges();

      genformPage.onSubmit();

      expect(dismissSpy).toHaveBeenCalledWith({});
    });

    test('should check if key requires conversion', (): void => {
      genformPage.calculator.requiresConversion = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      fixture.detectChanges();

      expect(genformPage.requiresConversion('boilVolume')).toBe(true);
      expect(genformPage.requiresConversion('boilVolume')).toBe(false);
      expect(genformPage.requiresConversion('other')).toBe(false);
    });

  });


  describe('Render Template', (): void => {
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();

    beforeEach((): void => {
      genformPage.ngOnInit = originalOnInit;

      genformPage.preferenceService.getSelectedUnits = jest
        .fn()
        .mockReturnValue(_mockEnglishUnits);
    });

    test('should render name field', (): void => {
      genformPage.formType = 'master';
      genformPage.docMethod = 'create';
      genformPage.data = {
        name: 'test-name'
      };

      fixture.detectChanges();

      const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');
      const field: HTMLElement = <HTMLElement>items.item(0);

      expect(field.children[0].textContent).toMatch('Enter Recipe Name');
      expect(field.children[1]['value']).toMatch('test-name');

      genformPage.generalForm.controls.name.setValue('a');
      genformPage.generalForm.controls.name.markAllAsTouched();
      genformPage.generalForm.updateValueAndValidity();

      fixture.detectChanges();

      const error: HTMLElement = fixture.nativeElement.querySelector('form-error');
      expect(error.getAttribute('controlname')).toBe('name');
      expect(error['controlErrors'].hasOwnProperty('minlength')).toBe(true);
    });

    test('should render variantName field', (): void => {
      genformPage.formType = 'variant';
      genformPage.docMethod = 'create';
      genformPage.data = {
        variantName: 'test-name'
      };

      fixture.detectChanges();

      const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');
      const field: HTMLElement = <HTMLElement>items.item(0);

      expect(field.children[0].textContent).toMatch('Enter Variant Name');
      expect(field.children[1]['value']).toMatch('test-name');

      genformPage.generalForm.controls.variantName.setValue('a');
      genformPage.generalForm.controls.variantName.markAllAsTouched();
      genformPage.generalForm.updateValueAndValidity();

      fixture.detectChanges();

      const error: HTMLElement = fixture.nativeElement.querySelector('form-error');
      expect(error.getAttribute('controlname')).toBe('variantName');
      expect(error['controlErrors'].hasOwnProperty('minlength')).toBe(true);
    });

    test('should render label image field', (): void => {
      const _mockImage: Image = mockImage();

      genformPage.formType = 'master';
      genformPage.docMethod = 'create';
      genformPage.labelImage = _mockImage;

      fixture.detectChanges();

      const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');
      const field: HTMLElement = <HTMLElement>items.item(1);

      expect(field.children[0].textContent).toMatch('Label Image');
      expect(field.children[1].children[0].children[0].getAttribute('src')).toMatch(_mockImage.url);
    });

    test('should render select style field', (): void => {
      const _mockStyles: Style[] = mockStyles();

      genformPage.formType = 'master';
      genformPage.docMethod = 'create';
      genformPage.styles = _mockStyles;

      fixture.detectChanges();

      const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');
      const field: HTMLElement = <HTMLElement>items.item(2);

      expect(field.children[0].textContent).toMatch('Select Style');
      expect(field.children[1]['value'].length).toEqual(0);
      expect(field.children[1].children.length).toEqual(_mockStyles.length);

      genformPage.generalForm.controls.style.setValue(_mockStyles[1]);
      genformPage.generalForm.updateValueAndValidity();

      fixture.detectChanges();

      expect(field.children[1]['value']).toStrictEqual(_mockStyles[1]);

      genformPage.styleTouched = true;
      genformPage.generalForm.controls.style.setValue(null);
      genformPage.generalForm.updateValueAndValidity();

      fixture.detectChanges();

      const error: HTMLElement = fixture.nativeElement.querySelector('form-error');
      expect(error.getAttribute('controlname')).toBe('style');
      expect(error['controlErrors'].hasOwnProperty('required')).toBe(true);
    });

    test('should render select brewing type field', (): void => {
      genformPage.formType = 'master';
      genformPage.docMethod = 'create';

      fixture.detectChanges();

      const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');
      const field: HTMLElement = <HTMLElement>items.item(3);

      expect(field.children[0].textContent).toMatch('Brewing Type');
      expect(field.children[1]['value'].length).toEqual(0);

      genformPage.generalForm.controls.brewingType.setValue('allgrain');
      genformPage.generalForm.updateValueAndValidity();

      fixture.detectChanges();

      expect(field.children[1]['value']).toMatch('allgrain');

      genformPage.brewingTouched = true;
      genformPage.generalForm.controls.brewingType.setValue('');
      genformPage.generalForm.updateValueAndValidity();

      fixture.detectChanges();

      const error: HTMLElement = fixture.nativeElement.querySelector('form-error');
      expect(error.getAttribute('controlname')).toBe('brewingType');
      expect(error['controlErrors'].hasOwnProperty('required')).toBe(true);
    });

    test('should render efficiency field', (): void => {
      genformPage.formType = 'master';
      genformPage.docMethod = 'create';

      fixture.detectChanges();

      const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');
      const field: HTMLElement = <HTMLElement>items.item(4);

      expect(field.children[0].textContent).toMatch('Efficiency (%)');
      expect(field.children[1]['value']).toEqual(70);

      genformPage.generalForm.controls.efficiency.setValue(-1);
      genformPage.generalForm.controls.efficiency.markAsTouched();
      genformPage.generalForm.updateValueAndValidity();

      fixture.detectChanges();

      const error: HTMLElement = fixture.nativeElement.querySelector('form-error');
      expect(error.getAttribute('controlname')).toBe('efficiency');
      expect(error['controlErrors'].hasOwnProperty('min')).toBe(true);
    });

    test('should render mash duration field', (): void => {
      genformPage.formType = 'master';
      genformPage.docMethod = 'create';

      fixture.detectChanges();

      const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');
      const field: HTMLElement = <HTMLElement>items.item(5);

      expect(field.children[0].textContent).toMatch('Mash Duration (minutes)');
      expect(field.children[1]['value']).toEqual(60);

      genformPage.generalForm.controls.mashDuration.setValue(-1);
      genformPage.generalForm.controls.mashDuration.markAsTouched();
      genformPage.generalForm.updateValueAndValidity();

      fixture.detectChanges();

      const error: HTMLElement = fixture.nativeElement.querySelector('form-error');
      expect(error.getAttribute('controlname')).toBe('mashDuration');
      expect(error['controlErrors'].hasOwnProperty('min')).toBe(true);
    });

    test('should render mash duration field', (): void => {
      genformPage.formType = 'master';
      genformPage.docMethod = 'create';

      fixture.detectChanges();

      const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');
      const field: HTMLElement = <HTMLElement>items.item(6);

      expect(field.children[0].textContent).toMatch('Boil Duration (minutes)');
      expect(field.children[1]['value']).toEqual(60);

      genformPage.generalForm.controls.boilDuration.setValue(-1);
      genformPage.generalForm.controls.boilDuration.markAsTouched();
      genformPage.generalForm.updateValueAndValidity();

      fixture.detectChanges();

      const error: HTMLElement = fixture.nativeElement.querySelector('form-error');
      expect(error.getAttribute('controlname')).toBe('boilDuration');
      expect(error['controlErrors'].hasOwnProperty('min')).toBe(true);
    });

    test('should render batch volume field', (): void => {
      genformPage.formType = 'master';
      genformPage.docMethod = 'create';

      fixture.detectChanges();

      const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');
      const field: HTMLElement = <HTMLElement>items.item(7);

      expect(field.children[0].textContent).toMatch('Batch Volume (gallons)');
      expect(field.children[1]['value'].length).toEqual(0);

      genformPage.generalForm.controls.batchVolume.setValue(-1);
      genformPage.generalForm.controls.batchVolume.markAsTouched();
      genformPage.generalForm.updateValueAndValidity();

      fixture.detectChanges();

      const error: HTMLElement = fixture.nativeElement.querySelector('form-error');
      expect(error.getAttribute('controlname')).toBe('batchVolume');
      expect(error['controlErrors'].hasOwnProperty('min')).toBe(true);
    });

    test('should render mash volume field', (): void => {
      genformPage.formType = 'master';
      genformPage.docMethod = 'create';

      fixture.detectChanges();

      const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');
      const field: HTMLElement = <HTMLElement>items.item(8);

      expect(field.children[0].textContent).toMatch('Mash Volume (gallons)');
      expect(field.children[1]['value'].length).toEqual(0);

      genformPage.generalForm.controls.mashVolume.setValue(-1);
      genformPage.generalForm.controls.mashVolume.markAsTouched();
      genformPage.generalForm.updateValueAndValidity();

      fixture.detectChanges();

      const error: HTMLElement = fixture.nativeElement.querySelector('form-error');
      expect(error.getAttribute('controlname')).toBe('mashVolume');
      expect(error['controlErrors'].hasOwnProperty('min')).toBe(true);
    });

    test('should render boil volume field', (): void => {
      genformPage.formType = 'master';
      genformPage.docMethod = 'create';

      fixture.detectChanges();

      const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');
      const field: HTMLElement = <HTMLElement>items.item(9);

      expect(field.children[0].textContent).toMatch('Boil Volume (gallons)');
      expect(field.children[1]['value'].length).toEqual(0);

      genformPage.generalForm.controls.boilVolume.setValue(-1);
      genformPage.generalForm.controls.boilVolume.markAsTouched();
      genformPage.generalForm.updateValueAndValidity();

      fixture.detectChanges();

      const error: HTMLElement = fixture.nativeElement.querySelector('form-error');
      expect(error.getAttribute('controlname')).toBe('boilVolume');
      expect(error['controlErrors'].hasOwnProperty('min')).toBe(true);
    });

    test('should render favorite toggle', (): void => {
      genformPage.formType = 'variant';

      fixture.detectChanges();

      const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');
      const field: HTMLElement = <HTMLElement>items.item(8);

      expect(field.children[0].textContent).toMatch('Set as Favorite');
      expect(field.children[1]['checked']).toBe(false);

      genformPage.generalForm.controls.isFavorite.setValue(true);
      genformPage.generalForm.updateValueAndValidity();

      fixture.detectChanges();

      expect(field.children[1]['checked']).toBe(true);
    });

    test('should render master toggle', (): void => {
      genformPage.formType = 'variant';

      fixture.detectChanges();

      const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');
      const field: HTMLElement = <HTMLElement>items.item(9);

      expect(field.children[0].textContent).toMatch('Set as Master');
      expect(field.children[1]['checked']).toBe(false);

      genformPage.generalForm.controls.isMaster.setValue(true);
      genformPage.generalForm.updateValueAndValidity();

      fixture.detectChanges();

      expect(field.children[1]['checked']).toBe(true);
    });

    test('should render form buttons', (): void => {
      const _mockStyle: Style = mockStyles()[0];
      genformPage.formType = 'master';
      genformPage.docMethod = 'update';

      fixture.detectChanges();

      const buttons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');

      const cancelButton: HTMLElement = <HTMLElement>buttons.item(buttons.length - 2);
      expect(cancelButton.textContent).toMatch('Cancel');

      const submitButton: HTMLElement = <HTMLElement>buttons.item(buttons.length - 1);
      expect(submitButton.textContent).toMatch('Submit');

      expect(submitButton.getAttribute('ng-reflect-disabled')).toMatch('true');

      genformPage.generalForm.controls.name.setValue('test');
      genformPage.generalForm.controls.style.setValue(_mockStyle);
      genformPage.generalForm.controls.brewingType.setValue('allgrain');
      genformPage.generalForm.controls.batchVolume.setValue(1);
      genformPage.generalForm.controls.boilVolume.setValue(1);
      genformPage.generalForm.controls.mashVolume.setValue(1);
      genformPage.generalForm.updateValueAndValidity();

      fixture.detectChanges();

      expect(submitButton.getAttribute('ng-reflect-disabled')).toMatch('false');
    });

  });

});
