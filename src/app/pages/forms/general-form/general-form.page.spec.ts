/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

/* Test configuration imports */
import { configureTestBed } from '../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockEnglishUnits, mockMetricUnits, mockImage, mockStyles } from '../../../../../test-config/mock-models';
import { CalculationsServiceStub, PreferencesServiceStub, UtilityServiceStub } from '../../../../../test-config/service-stubs';
import { HeaderComponentStub } from '../../../../../test-config/component-stubs';
import { ModalControllerStub } from '../../../../../test-config/ionic-stubs';

/* Default imports */
import { defaultImage } from '../../../shared/defaults';

/* Interface imports */
import { FormSelectOption, Image, SelectedUnits, Style } from '../../../shared/interfaces';

/* Service imports */
import { CalculationsService, PreferencesService, UtilityService } from '../../../services/services';

/* Page imports */
import { GeneralFormPage } from './general-form.page';


describe('GeneralFormPage', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<GeneralFormPage>;
  let page: GeneralFormPage;
  let originalOnInit: any;
  const initDefaultForm: (isMaster: boolean) => FormGroup = (isMaster: boolean): FormGroup => {
    const form: FormGroup = new FormGroup({
      style: new FormControl(''),
      brewingType: new FormControl(''),
      efficiency: new FormControl(70),
      mashDuration: new FormControl(60),
      boilDuration: new FormControl(60),
      batchVolume: new FormControl(5),
      boilVolume: new FormControl(5),
      mashVolume: new FormControl(5),
      isFavorite: new FormControl(false),
      isMaster: new FormControl(false)
    });
    if (isMaster) {
      form.setControl('name', new FormControl(''));
    } else {
      form.setControl('variantName', new FormControl(''));
    }
    return form;
  };

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        GeneralFormPage,
        HeaderComponentStub,
      ],
      imports: [
        IonicModule,
        ReactiveFormsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: CalculationsService, useClass: CalculationsServiceStub },
        { provide: ModalController, useClass: ModalControllerStub },
        { provide: PreferencesService, useClass: PreferencesServiceStub },
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
    page = fixture.componentInstance;
    originalOnInit = page.ngOnInit;
    page.ngOnInit = jest.fn();
  });

  test('should create the page', (): void => {
    fixture.detectChanges();

    expect(page).toBeTruthy();
  });

  test('should init the page', (): void => {
    page.initForm = jest.fn();
    const initSpy: jest.SpyInstance = jest.spyOn(page, 'initForm');
    const _mockStyles: Style[] = mockStyles();
    page.styles = _mockStyles;
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
    page.preferenceService.getSelectedUnits = jest.fn()
      .mockReturnValue(_mockEnglishUnits);
    page.ngOnInit = originalOnInit;

    fixture.detectChanges();

    expect(initSpy).toHaveBeenCalled();
    _mockStyles.forEach((style: Style, index: number): void => {
      expect(page.styleSelectOptions[index].value).toStrictEqual(style);
    });
  });

  test('should convert form values for submission', (): void => {
    const _mockImage: Image = mockImage();
    page.labelImage = _mockImage;
    page.generalForm = initDefaultForm(true);
    let requiresCounter: number = 0;
    page.requiresConversion = jest.fn()
      .mockImplementation((key: string): boolean => {
        // alternate requires unit conversion for testing
        return page.controlsToConvertUnits.includes(key) && requiresCounter++ % 2 == 0;
      });
    page.calculator.convertVolume = jest.fn()
      .mockImplementation((value: number): number => value * 2);

    fixture.detectChanges();

    expect(page.convertForSubmission()).toStrictEqual({
      name: '',
      style: '',
      brewingType: '',
      efficiency: 70,
      mashDuration: 60,
      boilDuration: 60,
      batchVolume: 10,
      boilVolume: 5,
      mashVolume: 10,
      isFavorite: false,
      isMaster: false,
      labelImage: _mockImage
    });
  });

  test('should dismiss the modal with no data', (): void => {
    page.modalCtrl.dismiss = jest.fn();
    const dismissSpy: jest.SpyInstance = jest.spyOn(page.modalCtrl, 'dismiss');

    fixture.detectChanges();

    page.dismiss();
    expect(dismissSpy).toHaveBeenCalled();
  });

  test('should init the form', (): void => {
    page.update = undefined;
    page.setNameControl = jest.fn();
    const setSpy: jest.SpyInstance = jest.spyOn(page, 'setNameControl');
    page.mapDataToForm = jest.fn();
    const mapSpy: jest.SpyInstance = jest.spyOn(page, 'mapDataToForm');

    fixture.detectChanges();

    page.initForm();
    expect(setSpy).toHaveBeenCalled();
    expect(mapSpy).not.toHaveBeenCalled();
    page.update = {};
    page.initForm();
    expect(setSpy).toHaveBeenCalledTimes(2);
    expect(mapSpy).toHaveBeenCalledTimes(1);
  });

  test('should map update data to form', (): void => {
    page.generalForm = initDefaultForm(true);
    const _mockStyles: Style[] = mockStyles();
    const _mockImage: Image = mockImage();
    const _mockUpdate: object = {
      name: 'update',
      style: _mockStyles[0],
      brewingType: 'biab',
      efficiency: 80,
      mashDuration: 90,
      boilDuration: 70,
      batchVolume: 6,
      boilVolume: 6,
      mashVolume: 6,
      isFavorite: true,
      isMaster: true,
      labelImage: _mockImage
    };
    page.update = _mockUpdate;
    page.requiresConversion = jest.fn()
      .mockReturnValue(true);
    page.utilService.roundToDecimalPlace = jest.fn()
      .mockImplementation((value: number): number => value);

    fixture.detectChanges();

    page.mapDataToForm();
    expect(page.generalForm.value).toStrictEqual({
      name: 'update',
      style: _mockStyles[0],
      brewingType: 'biab',
      efficiency: 80,
      mashDuration: 90,
      boilDuration: 70,
      batchVolume: 6,
      boilVolume: 6,
      mashVolume: 6,
      isFavorite: true,
      isMaster: true,
    });
    expect(page.labelImage).toStrictEqual(_mockImage);
  });

  test('should handle image modal dismiss', (): void => {
    const _mockImage1: Image = mockImage();
    _mockImage1.cid = '1';
    const _mockImage2: Image = mockImage();
    _mockImage2.cid = '11';
    page.labelImage = _mockImage1;

    fixture.detectChanges();

    page.imageModalDismiss(null);
    expect(page.labelImage).toStrictEqual(_mockImage1);
    page.imageModalDismiss(_mockImage2);
    expect(page.labelImage).toStrictEqual(_mockImage2);
  });

  test('should submit the form', (): void => {
    page.modalCtrl.dismiss = jest.fn();
    const dismissSpy: jest.SpyInstance = jest.spyOn(page.modalCtrl, 'dismiss');
    page.convertForSubmission = jest.fn()
      .mockReturnValue({ test: true });

    fixture.detectChanges();

    page.onSubmit();
    expect(dismissSpy).toHaveBeenCalledWith({ test: true });
  });

  test('should check if value should be converted', (): void => {
    page.calculator.requiresConversion = jest.fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    fixture.detectChanges();

    expect(page.requiresConversion('noConvert')).toBe(false);
    expect(page.requiresConversion('mashVolume')).toBe(false);
    expect(page.requiresConversion('mashVolume')).toBe(true);
  });

  test('should set the name control', (): void => {
    const testForm: FormGroup = new FormGroup({});
    page.generalForm = testForm;
    page.formType = 'master';

    fixture.detectChanges();

    page.setNameControl();
    expect(testForm.controls.name).toBeTruthy();
    page.formType = 'variant';
    page.setNameControl();
    expect(testForm.controls.variantName).toBeTruthy();
  });

  test('should render the template with a create master form', (): void => {
    page.docMethod = 'create';
    page.formType = 'master';
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
    page.preferenceService.getSelectedUnits = jest.fn()
      .mockReturnValue(_mockEnglishUnits);
    const _defaultImage: Image = defaultImage();
    const _mockStyles: Style[] = mockStyles();
    page.styles = _mockStyles;
    page.ngOnInit = originalOnInit;

    fixture.detectChanges();

    const inputs: NodeList = fixture.nativeElement.querySelectorAll('app-form-input');
    expect(inputs.length).toEqual(7);
    const nameInput: Element = <Element>inputs.item(0);
    expect(nameInput.getAttribute('controlName')).toMatch('name');
    const efficiencyInput: Element = <Element>inputs.item(1);
    expect(efficiencyInput.getAttribute('controlName')).toMatch('efficiency');
    const mashDurationInput: Element = <Element>inputs.item(2);
    expect(mashDurationInput.getAttribute('controlName')).toMatch('mashDuration');
    const boilDurationInput: Element = <Element>inputs.item(3);
    expect(boilDurationInput.getAttribute('controlName')).toMatch('boilDuration');
    const batchVolumeInput: Element = <Element>inputs.item(4);
    expect(batchVolumeInput.getAttribute('controlName')).toMatch('batchVolume');
    const mashVolumeInput: Element = <Element>inputs.item(5);
    expect(mashVolumeInput.getAttribute('controlName')).toMatch('mashVolume');
    const boilVolumeInput: Element = <Element>inputs.item(6);
    expect(boilVolumeInput.getAttribute('controlName')).toMatch('boilVolume');
    const image: HTMLElement = fixture.nativeElement.querySelector('app-form-image');
    expect(image['image']).toStrictEqual(_defaultImage);
    const selects: NodeList = fixture.nativeElement.querySelectorAll('app-form-select');
    expect(selects.length).toBe(2);
    const styleSelect: Element = <Element>selects.item(0);
    (<FormSelectOption[]>styleSelect['options']).forEach((option: FormSelectOption, index: number): void => {
      expect(option.value).toStrictEqual(_mockStyles[index]);
    });
    const brewingTypeSelect: Element = <Element>selects.item(1);
    expect(brewingTypeSelect['options']).toStrictEqual([
      { label: 'Extract', value: 'extract' },
      { label: 'Brew in a Bag', value: 'biab' },
      { label: 'All Grain', value: 'allgrain' }
    ]);
    const toggles: NodeList = fixture.nativeElement.querySelectorAll('app-form-toggle');
    expect(toggles.length).toEqual(0);
    const buttons: HTMLElement = fixture.nativeElement.querySelector('app-form-buttons');
    expect(buttons).toBeTruthy();
  });

  test('should render the template with a update master form', (): void => {
    page.docMethod = 'update';
    page.formType = 'master';
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
    page.preferenceService.getSelectedUnits = jest.fn()
      .mockReturnValue(_mockEnglishUnits);
    const _defaultImage: Image = defaultImage();
    const _mockStyles: Style[] = mockStyles();
    page.styles = _mockStyles;
    page.ngOnInit = originalOnInit;

    fixture.detectChanges();

    const inputs: NodeList = fixture.nativeElement.querySelectorAll('app-form-input');
    expect(inputs.length).toEqual(1);
    const nameInput: Element = <Element>inputs.item(0);
    expect(nameInput.getAttribute('controlName')).toMatch('name');
    const image: HTMLElement = fixture.nativeElement.querySelector('app-form-image');
    expect(image['image']).toStrictEqual(_defaultImage);
    const selects: NodeList = fixture.nativeElement.querySelectorAll('app-form-select');
    expect(selects.length).toBe(1);
    const styleSelect: Element = <Element>selects.item(0);
    (<FormSelectOption[]>styleSelect['options']).forEach((option: FormSelectOption, index: number): void => {
      expect(option.value).toStrictEqual(_mockStyles[index]);
    });
    const toggles: NodeList = fixture.nativeElement.querySelectorAll('app-form-toggle');
    expect(toggles.length).toEqual(0);
    const buttons: HTMLElement = fixture.nativeElement.querySelector('app-form-buttons');
    expect(buttons).toBeTruthy();
  });

  test('should render the template with a create variant form', (): void => {
    page.docMethod = 'create';
    page.formType = 'variant';
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
    page.preferenceService.getSelectedUnits = jest.fn()
      .mockReturnValue(_mockEnglishUnits);
    const _mockStyles: Style[] = mockStyles();
    page.styles = _mockStyles;
    page.ngOnInit = originalOnInit;

    fixture.detectChanges();

    const inputs: NodeList = fixture.nativeElement.querySelectorAll('app-form-input');
    expect(inputs.length).toEqual(7);
    const variantNameInput: Element = <Element>inputs.item(0);
    expect(variantNameInput.getAttribute('controlName')).toMatch('variantName');
    const efficiencyInput: Element = <Element>inputs.item(1);
    expect(efficiencyInput.getAttribute('controlName')).toMatch('efficiency');
    const mashDurationInput: Element = <Element>inputs.item(2);
    expect(mashDurationInput.getAttribute('controlName')).toMatch('mashDuration');
    const boilDurationInput: Element = <Element>inputs.item(3);
    expect(boilDurationInput.getAttribute('controlName')).toMatch('boilDuration');
    const batchVolumeInput: Element = <Element>inputs.item(4);
    expect(batchVolumeInput.getAttribute('controlName')).toMatch('batchVolume');
    const mashVolumeInput: Element = <Element>inputs.item(5);
    expect(mashVolumeInput.getAttribute('controlName')).toMatch('mashVolume');
    const boilVolumeInput: Element = <Element>inputs.item(6);
    expect(boilVolumeInput.getAttribute('controlName')).toMatch('boilVolume');
    const image: HTMLElement = fixture.nativeElement.querySelector('app-form-image');
    expect(image).toBeNull();
    const selects: NodeList = fixture.nativeElement.querySelectorAll('app-form-select');
    expect(selects.length).toBe(1);
    const brewingTypeSelect: Element = <Element>selects.item(0);
    expect(brewingTypeSelect['options']).toStrictEqual([
      { label: 'Extract', value: 'extract' },
      { label: 'Brew in a Bag', value: 'biab' },
      { label: 'All Grain', value: 'allgrain' }
    ]);
    const toggles: NodeList = fixture.nativeElement.querySelectorAll('app-form-toggle');
    expect(toggles.length).toEqual(1);
    const favToggle: Element = <Element>toggles.item(0);
    expect(favToggle['control']).toBeTruthy();
    const buttons: HTMLElement = fixture.nativeElement.querySelector('app-form-buttons');
    expect(buttons).toBeTruthy();
  });

  test('should render the template with a update variant form', (): void => {
    page.docMethod = 'update';
    page.formType = 'variant';
    page.update = {
      mashVolume: 3,
      boilVolume: 3,
      batchVolume: 3,
      isMaster: false
    };
    page.calculator.requiresConversion = jest.fn()
      .mockReturnValue(true);
    page.calculator.convertVolume = jest.fn()
      .mockImplementation((value: number): number => value * 2);
    page.utilService.roundToDecimalPlace = jest.fn()
      .mockImplementation((value: number): number => value);
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
    page.preferenceService.getSelectedUnits = jest.fn()
      .mockReturnValue(_mockEnglishUnits);
    const _mockStyles: Style[] = mockStyles();
    page.styles = _mockStyles;
    page.ngOnInit = originalOnInit;

    fixture.detectChanges();

    const inputs: NodeList = fixture.nativeElement.querySelectorAll('app-form-input');
    expect(inputs.length).toEqual(7);
    const variantNameInput: Element = <Element>inputs.item(0);
    expect(variantNameInput.getAttribute('controlName')).toMatch('variantName');
    const efficiencyInput: Element = <Element>inputs.item(1);
    expect(efficiencyInput.getAttribute('controlName')).toMatch('efficiency');
    const mashDurationInput: Element = <Element>inputs.item(2);
    expect(mashDurationInput.getAttribute('controlName')).toMatch('mashDuration');
    const boilDurationInput: Element = <Element>inputs.item(3);
    expect(boilDurationInput.getAttribute('controlName')).toMatch('boilDuration');
    const batchVolumeInput: Element = <Element>inputs.item(4);
    expect(batchVolumeInput.getAttribute('controlName')).toMatch('batchVolume');
    const mashVolumeInput: Element = <Element>inputs.item(5);
    expect(mashVolumeInput.getAttribute('controlName')).toMatch('mashVolume');
    const boilVolumeInput: Element = <Element>inputs.item(6);
    expect(boilVolumeInput.getAttribute('controlName')).toMatch('boilVolume');
    const image: HTMLElement = fixture.nativeElement.querySelector('app-form-image');
    expect(image).toBeNull();
    const selects: NodeList = fixture.nativeElement.querySelectorAll('app-form-select');
    expect(selects.length).toBe(1);
    const brewingTypeSelect: Element = <Element>selects.item(0);
    expect(brewingTypeSelect['options']).toStrictEqual([
      { label: 'Extract', value: 'extract' },
      { label: 'Brew in a Bag', value: 'biab' },
      { label: 'All Grain', value: 'allgrain' }
    ]);
    const toggles: NodeList = fixture.nativeElement.querySelectorAll('app-form-toggle');
    expect(toggles.length).toEqual(2);
    const favToggle: Element = <Element>toggles.item(0);
    expect(favToggle['control']).toBeTruthy();
    const masterToggle: Element = <Element>toggles.item(1);
    expect(masterToggle['control']).toBeTruthy();
    const buttons: HTMLElement = fixture.nativeElement.querySelector('app-form-buttons');
    expect(buttons).toBeTruthy();
  });

});
