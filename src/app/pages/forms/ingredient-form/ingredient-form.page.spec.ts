/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

/* Test configuration imports */
import { configureTestBed } from '../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockGrains, mockHops, mockOtherIngredients, mockYeast, mockGrainBill, mockHopsSchedule, mockYeastBatch, mockEnglishUnits } from '../../../../../test-config/mock-models';
import { CalculationsServiceStub, PreferencesServiceStub, FormValidationServiceStub } from '../../../../../test-config/service-stubs';
import { HeaderComponentStub } from '../../../../../test-config/component-stubs';
import { ModalControllerStub } from '../../../../../test-config/ionic-stubs';

/* Interface imports */
import {
  Grains,
  GrainBill,
  Hops,
  HopsSchedule,
  OtherIngredients,
  SelectedUnits,
  Yeast,
  YeastBatch
} from '../../../shared/interfaces';

/* Service imports */
import { CalculationsService } from '../../../services/calculations/calculations.service';
import { FormValidationService } from '../../../services/form-validation/form-validation.service';
import { PreferencesService } from '../../../services/preferences/preferences.service';

/* Page imports */
import { IngredientFormPage } from './ingredient-form.page';

const initDefaultForm: (formBuilder: FormBuilder) => FormGroup = (formBuilder: FormBuilder): FormGroup => {
  return formBuilder.group({
    quantity: null,
    subQuantity: null,
    type: ''
  });
};

describe('IngredientFormPage', (): void => {
  let fixture: ComponentFixture<IngredientFormPage>;
  let ingredientFormPage: IngredientFormPage;
  let originalOnInit: any;
  const formBuilder: FormBuilder = new FormBuilder();
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        IngredientFormPage,
        HeaderComponentStub,
      ],
      imports: [
        IonicModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: CalculationsService, useClass: CalculationsServiceStub },
        { provide: ModalController, useClass: ModalControllerStub },
        { provide: PreferencesService, useClass: PreferencesServiceStub },
        { provide: FormValidationService, useClass: FormValidationServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(IngredientFormPage);
    ingredientFormPage = fixture.componentInstance;
    originalOnInit = ingredientFormPage.ngOnInit;
    ingredientFormPage.ngOnInit = jest
      .fn();
    ingredientFormPage.modalCtrl.dismiss = jest
      .fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(ingredientFormPage).toBeDefined();
  });

  describe('Form Methods', (): void => {

    test('should init the component', (): void => {
      ingredientFormPage.ngOnInit = originalOnInit;

      ingredientFormPage.ingredientType = 'grains';

      ingredientFormPage.preferenceService.getSelectedUnits = jest
        .fn();
      ingredientFormPage.calculator.requiresConversion = jest
        .fn();
      ingredientFormPage.initForm = jest
        .fn();

      const initSpy: jest.SpyInstance = jest.spyOn(ingredientFormPage, 'initForm');

      fixture.detectChanges();

      expect(initSpy).toHaveBeenCalled();
    });

    test('should dismiss if missing ingredient type', (): void => {
      ingredientFormPage.ngOnInit = originalOnInit;

      ingredientFormPage.dismissOnError = jest
        .fn();

      const dismissSpy: jest.SpyInstance = jest.spyOn(ingredientFormPage, 'dismissOnError');

      fixture.detectChanges();

      expect(dismissSpy).toHaveBeenCalledWith('Missing ingredient type');
    });

    test('should dismiss modal with no data', (): void => {
      ingredientFormPage.modalCtrl.dismiss = jest
        .fn();

      const dismissSpy: jest.SpyInstance = jest.spyOn(ingredientFormPage.modalCtrl, 'dismiss');

      fixture.detectChanges();

      ingredientFormPage.dismiss();

      expect(dismissSpy).toHaveBeenCalled();
    });

    test('should dismiss modal with error', (): void => {
      ingredientFormPage.modalCtrl.dismiss = jest
        .fn();

      const dismissSpy: jest.SpyInstance = jest.spyOn(ingredientFormPage.modalCtrl, 'dismiss');

      fixture.detectChanges();

      ingredientFormPage.dismissOnError('test-message');

      expect(dismissSpy).toHaveBeenCalledWith({ error: 'test-message' });
    });

    test('should get combined quantity', (): void => {
      ingredientFormPage.requiresConversionLarge = false;
      ingredientFormPage.requiresConversionSmall = false;
      ingredientFormPage.calculator.convertWeight = jest
        .fn()
        .mockReturnValueOnce(5)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(64)
        .mockReturnValueOnce(5)
        .mockReturnValueOnce(16);

      fixture.detectChanges();

      const noValues: number = ingredientFormPage.getCombinedQuantity({});
      expect(noValues).toEqual(0);

      ingredientFormPage.requiresConversionLarge = true;
      ingredientFormPage.requiresConversionSmall = true;

      fixture.detectChanges();

      const largeOnly: number = ingredientFormPage.getCombinedQuantity({ quantity: 10 });
      expect(largeOnly).toEqual(5);

      const smallOnly: number = ingredientFormPage.getCombinedQuantity({ subQuantity: 100 });
      expect(smallOnly).toEqual(4);

      const combined: number = ingredientFormPage.getCombinedQuantity({ quantity: 10, subQuantity: 50 });
      expect(combined).toEqual(6);
    });

    test('should format a grains response', (): void => {
      const _mockGrains: Grains = mockGrains()[0];

      ingredientFormPage.getCombinedQuantity = jest
        .fn()
        .mockReturnValue(10);

      ingredientFormPage.ingredientForm = formBuilder.group({
        type: _mockGrains,
        quantity: 100,
        mill: 0.035
      });

      fixture.detectChanges();

      const formatted: object = ingredientFormPage.formatGrainsResponse();
      expect(formatted).toStrictEqual({
        grainType: _mockGrains,
        quantity: 10,
        mill: 0.035
      });
    });

    test('should format a hops response', (): void => {
      const _mockHops: Hops = mockHops()[0];

      ingredientFormPage.requiresConversionSmall = true;
      ingredientFormPage.calculator.convertWeight = jest
        .fn()
        .mockReturnValue(1);

      ingredientFormPage.ingredientForm = formBuilder.group({
        type: _mockHops,
        quantity: 0,
        subQuantity: 25,
        duration: 60,
        dryHop: false
      });

      fixture.detectChanges();

      const formatted: object = ingredientFormPage.formatHopsResponse();
      expect(formatted).toStrictEqual({
        hopsType: _mockHops,
        quantity: 1,
        duration: 60,
        dryHop: false
      });
    });

    test('should format an \'other\' ingredient response', (): void => {
      const _mockOther: OtherIngredients = mockOtherIngredients()[0];

      ingredientFormPage.ingredientForm = formBuilder.group({
        type: _mockOther.type,
        name: _mockOther.name,
        quantity: _mockOther.quantity,
        units: _mockOther.units,
        description: _mockOther.description
      });

      fixture.detectChanges();

      const formatted: object = ingredientFormPage.formatOtherIngredientsResponse();
      expect(formatted).toStrictEqual({
        type: _mockOther.type,
        name: _mockOther.name,
        quantity: _mockOther.quantity,
        units: _mockOther.units,
        description: _mockOther.description
      });
    });

    test('should format a yeast response', (): void => {
      const _mockYeast: Yeast = mockYeast()[0];

      ingredientFormPage.ingredientForm = formBuilder.group({
        type: _mockYeast,
        quantity: 1,
        requiresStarter: true
      });

      fixture.detectChanges();

      const formatted: object = ingredientFormPage.formatYeastResponse();
      expect(formatted).toStrictEqual({
        yeastType: _mockYeast,
        quantity: 1,
        requiresStarter: true
      });
    });

    test('should init the form', (): void => {
      const _mockGrainBill: GrainBill = mockGrainBill()[0];

      ingredientFormPage.initGrainsFields = jest
        .fn();
      ingredientFormPage.initHopsFields = jest
        .fn();
      ingredientFormPage.initYeastFields = jest
        .fn();
      ingredientFormPage.initOtherIngredientsFields = jest
        .fn();

      ingredientFormPage.formValidator.eitherOr = jest
        .fn()
        .mockReturnValue((group: FormGroup): { [key: string]: any } | null => null);

      ingredientFormPage.update = _mockGrainBill;

      const grainsInitSpy: jest.SpyInstance = jest.spyOn(ingredientFormPage, 'initGrainsFields');
      const hopsInitSpy: jest.SpyInstance = jest.spyOn(ingredientFormPage, 'initHopsFields');
      const otherInitSpy: jest.SpyInstance = jest.spyOn(ingredientFormPage, 'initOtherIngredientsFields');
      const yeastInitSpy: jest.SpyInstance = jest.spyOn(ingredientFormPage, 'initYeastFields');

      fixture.detectChanges();

      ingredientFormPage.initForm();

      expect(ingredientFormPage.ingredientForm.value).toStrictEqual({
        quantity: null,
        subQuantity: null,
        type: ''
      });

      expect(grainsInitSpy).not.toHaveBeenCalled();
      expect(hopsInitSpy).not.toHaveBeenCalled();
      expect(otherInitSpy).not.toHaveBeenCalled();
      expect(yeastInitSpy).not.toHaveBeenCalled();
      expect(ingredientFormPage.formType).toMatch('update');

      ingredientFormPage.ingredientType = 'grains';
      ingredientFormPage.update = null;
      ingredientFormPage.initForm();
      expect(grainsInitSpy).toHaveBeenCalled();

      ingredientFormPage.ingredientType = 'hops';
      ingredientFormPage.initForm();
      expect(hopsInitSpy).toHaveBeenCalled();

      ingredientFormPage.ingredientType = 'otherIngredients';
      ingredientFormPage.initForm();
      expect(otherInitSpy).toHaveBeenCalled();

      ingredientFormPage.ingredientType = 'yeast';
      ingredientFormPage.initForm();
      expect(yeastInitSpy).toHaveBeenCalled();
    });

    test('should init grains form fields', (): void => {
      const _mockGrainBill: GrainBill = mockGrainBill()[0];
      _mockGrainBill.quantity = 1.5;

      ingredientFormPage.calculator.requiresConversion = jest
        .fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);

      ingredientFormPage.calculator.convertWeight = jest
        .fn()
        .mockImplementation((value: number, ignore: any, toEn: boolean): number => {
          return toEn ? value * 2 : value / 2;
        });

      ingredientFormPage.ingredientForm = initDefaultForm(formBuilder);

      ingredientFormPage.initGrainsFields();

      fixture.detectChanges();

      // test no update
      expect(ingredientFormPage.ingredientForm.value).toStrictEqual({
        quantity: null,
        subQuantity: null,
        type: '',
        mill: null
      });


      ingredientFormPage.update = _mockGrainBill;

      ingredientFormPage.ingredientForm = initDefaultForm(formBuilder);

      ingredientFormPage.initGrainsFields();

      fixture.detectChanges();

      // test with update - no conversion
      expect(ingredientFormPage.ingredientForm.value).toStrictEqual({
        quantity: 1,
        subQuantity: 0.25,
        type: _mockGrainBill.grainType,
        mill: _mockGrainBill.mill,
      });


      ingredientFormPage.ingredientForm = initDefaultForm(formBuilder);

      ingredientFormPage.initGrainsFields();

      fixture.detectChanges();

      // test with update - overall conversion
      expect(ingredientFormPage.ingredientForm.value).toStrictEqual({
        quantity: 0.75,
        subQuantity: null,
        type: _mockGrainBill.grainType,
        mill: _mockGrainBill.mill,
      });


      ingredientFormPage.ingredientForm = initDefaultForm(formBuilder);

      ingredientFormPage.initGrainsFields();

      fixture.detectChanges();

      // test with update - overall conversion
      expect(ingredientFormPage.ingredientForm.value).toStrictEqual({
        quantity: 1,
        subQuantity: 8,
        type: _mockGrainBill.grainType,
        mill: _mockGrainBill.mill,
      });
    });

    test('should init hops form fields', (): void => {
      const _mockHopsSchedule: HopsSchedule = mockHopsSchedule()[0];
      _mockHopsSchedule.quantity = 1;

      ingredientFormPage.calculator.requiresConversion = jest
        .fn()
        .mockReturnValueOnce(true);

      ingredientFormPage.calculator.convertWeight = jest
        .fn()
        .mockImplementation((value: number, ...options: any[]): number => value * 2);

      ingredientFormPage.ingredientForm = initDefaultForm(formBuilder);

      fixture.detectChanges();

      ingredientFormPage.initHopsFields();

      // test with no update
      expect(ingredientFormPage.ingredientForm.value).toStrictEqual({
        duration: null,
        dryHop: false,
        quantity: null,
        subQuantity: null,
        type: ''
      });


      ingredientFormPage.update = _mockHopsSchedule;

      ingredientFormPage.ingredientForm = initDefaultForm(formBuilder);

      fixture.detectChanges();

      ingredientFormPage.initHopsFields();

      // test with update and conversion
      expect(ingredientFormPage.ingredientForm.value).toStrictEqual({
        duration: _mockHopsSchedule.duration,
        dryHop: _mockHopsSchedule.dryHop,
        quantity: null,
        subQuantity: _mockHopsSchedule.quantity * 2,
        type: _mockHopsSchedule.hopsType
      });
    });

    test('should init yeast form fields', (): void => {
      const _mockYeastBatch: YeastBatch = mockYeastBatch()[0];

      ingredientFormPage.ingredientForm = initDefaultForm(formBuilder);

      fixture.detectChanges();

      ingredientFormPage.initYeastFields();

      // test with no update
      expect(ingredientFormPage.ingredientForm.value).toStrictEqual({
        quantity: null,
        subQuantity: null,
        type: '',
        requiresStarter: false
      });


      ingredientFormPage.update = _mockYeastBatch;
      ingredientFormPage.ingredientForm = initDefaultForm(formBuilder);

      fixture.detectChanges();

      ingredientFormPage.initYeastFields();

      // test with update
      expect(ingredientFormPage.ingredientForm.value).toStrictEqual({
        quantity: _mockYeastBatch.quantity,
        subQuantity: null,
        type: _mockYeastBatch.yeastType,
        requiresStarter: _mockYeastBatch.requiresStarter
      });
    });

    test('should init other ingredient form fields', (): void => {
      const _mockOtherIngredients: OtherIngredients = mockOtherIngredients()[0];

      ingredientFormPage.ingredientForm = initDefaultForm(formBuilder);

      fixture.detectChanges();

      ingredientFormPage.initOtherIngredientsFields();

      // test with no update
      expect(ingredientFormPage.ingredientForm.value).toStrictEqual({
        quantity: null,
        subQuantity: null,
        type: '',
        name: '',
        description: '',
        units: ''
      });


      ingredientFormPage.update = _mockOtherIngredients;
      ingredientFormPage.ingredientForm = initDefaultForm(formBuilder);

      fixture.detectChanges();

      ingredientFormPage.initOtherIngredientsFields();

      // test with update
      expect(ingredientFormPage.ingredientForm.value).toStrictEqual({
        quantity: _mockOtherIngredients.quantity,
        subQuantity: null,
        type: _mockOtherIngredients.type,
        name: _mockOtherIngredients.name,
        description: _mockOtherIngredients.description,
        units: _mockOtherIngredients.units
      });
    });

    test('should dismiss modal with deletion flag', (): void => {
      ingredientFormPage.modalCtrl.dismiss = jest
        .fn();

      const dismissSpy: jest.SpyInstance = jest.spyOn(ingredientFormPage.modalCtrl, 'dismiss');

      fixture.detectChanges();

      ingredientFormPage.onDeletion();

      expect(dismissSpy).toHaveBeenCalledWith({ delete: true });
    });

    test('should handle dry hop toggle event', (): void => {
      const _mockHopsSchedule: HopsSchedule = mockHopsSchedule()[0];
      _mockHopsSchedule.dryHop = false;

      const mockEventTrue: CustomEvent = new CustomEvent('', { detail: { checked: true } });
      const mockEventFalse: CustomEvent = new CustomEvent('', { detail: { checked: false } });

      ingredientFormPage.ingredientForm = formBuilder.group({
        quantity: _mockHopsSchedule.quantity,
        subQuantity: null,
        type: _mockHopsSchedule.hopsType,
        duration: [
          _mockHopsSchedule.duration,
          [
            Validators.required,
            Validators.min(0),
            Validators.max(this.boilTime || 60)
          ]
        ],
        dryHop: _mockHopsSchedule.dryHop
      });

      fixture.detectChanges();

      expect(ingredientFormPage.ingredientForm.controls.duration).not.toBeNull();

      ingredientFormPage.onDryHopChange(mockEventTrue);

      expect(ingredientFormPage.ingredientForm.controls.duration.validator).toBeNull();

      ingredientFormPage.onDryHopChange(mockEventFalse);

      expect(ingredientFormPage.ingredientForm.controls.duration).not.toBeNull();
    });

    test('should handle ingredient select event', (): void => {
      const _mockGrainBill: GrainBill = mockGrainBill()[0];

      ingredientFormPage.ingredientForm = formBuilder.group({
        quantity: _mockGrainBill.quantity,
        subQuantity: null,
        type: null,
        mill: _mockGrainBill.mill
      });

      fixture.detectChanges();

      ingredientFormPage.onIngredientSelect();

      expect(ingredientFormPage.selectTouched).toBe(true);

      ingredientFormPage.ingredientForm.controls.type.setValue(_mockGrainBill.grainType);

      ingredientFormPage.onIngredientSelect();

      expect(ingredientFormPage.selectTouched).toBe(false);
    });

    test('should handle submission', (): void => {
      ingredientFormPage.formatGrainsResponse = jest
        .fn()
        .mockReturnValue({ type: 'grains' });

      ingredientFormPage.formatHopsResponse = jest
        .fn()
        .mockReturnValue({ type: 'hops' });

      ingredientFormPage.formatYeastResponse = jest
        .fn()
        .mockReturnValue({ type: 'yeast' });

      ingredientFormPage.formatOtherIngredientsResponse = jest
        .fn()
        .mockReturnValue({ type: 'other' });

      ingredientFormPage.modalCtrl.dismiss = jest
        .fn();

      const dismissSpy: jest.SpyInstance = jest.spyOn(ingredientFormPage.modalCtrl, 'dismiss');

      ingredientFormPage.ingredientType = 'none';
      fixture.detectChanges();
      ingredientFormPage.onSubmit();
      expect(dismissSpy).toHaveBeenNthCalledWith(1, {});

      ingredientFormPage.ingredientType = 'grains';
      fixture.detectChanges();
      ingredientFormPage.onSubmit();
      expect(dismissSpy).toHaveBeenNthCalledWith(2, { type: 'grains' });

      ingredientFormPage.ingredientType = 'hops';
      fixture.detectChanges();
      ingredientFormPage.onSubmit();
      expect(dismissSpy).toHaveBeenNthCalledWith(3, { type: 'hops' });

      ingredientFormPage.ingredientType = 'yeast';
      fixture.detectChanges();
      ingredientFormPage.onSubmit();
      expect(dismissSpy).toHaveBeenNthCalledWith(4, { type: 'yeast' });

      ingredientFormPage.ingredientType = 'otherIngredients';
      fixture.detectChanges();
      ingredientFormPage.onSubmit();
      expect(dismissSpy).toHaveBeenNthCalledWith(5, { type: 'other' });
    });

  });


  describe('Render Template', (): void => {

    test('should render a grains form', (): void => {
      const _mockGrains: Grains[] = mockGrains();
      const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();

      ingredientFormPage.units = _mockEnglishUnits;
      ingredientFormPage.ingredientType = 'grains';
      ingredientFormPage.ingredientLibrary = _mockGrains;
      ingredientFormPage.ingredientForm = formBuilder.group({
        quantity: 10,
        subQuantity: 5,
        type: ['', [Validators.required]],
        mill: 0.035
      });
      ingredientFormPage.hasSubQuantity = true;

      fixture.detectChanges();

      const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');
      expect(items.length).toEqual(4);

      const ingredientElem: HTMLElement = <HTMLElement>items.item(0);
      expect(ingredientElem.children[0].textContent).toMatch('Select Grains');

      const selectElem: NodeList = ingredientElem.querySelectorAll('ion-select-option');
      selectElem.forEach((node: Node, index: number): void => {
        expect(node.textContent).toMatch(ingredientFormPage.ingredientLibrary[index].name);
      });

      const quantityElem: HTMLElement = <HTMLElement>items.item(1);
      expect(quantityElem.children[0].textContent).toMatch('Quantity (lb)');
      expect(quantityElem.children[1]['value']).toEqual(10);

      const subQuantityElem: HTMLElement = <HTMLElement>items.item(2);
      expect(subQuantityElem.children[0].textContent).toMatch('Quantity (oz)');
      expect(subQuantityElem.children[1]['value']).toEqual(5);

      const millElem: HTMLElement = <HTMLElement>items.item(3);
      expect(millElem.children[0].textContent).toMatch('Mill Setting');
      expect(millElem.children[1]['value']).toEqual(0.035);
    });

    test('should render errors on grains form', (): void => {
      const _mockGrains: Grains[] = mockGrains();
      const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();

      ingredientFormPage.units = _mockEnglishUnits;
      ingredientFormPage.ingredientType = 'grains';
      ingredientFormPage.ingredientLibrary = _mockGrains;
      ingredientFormPage.ingredientForm = formBuilder.group({
        quantity: null,
        subQuantity: null,
        type: ['', [Validators.required]],
        mill: null
      });
      ingredientFormPage.hasSubQuantity = true;
      ingredientFormPage.selectTouched = true;

      const form: FormGroup = ingredientFormPage.ingredientForm;
      form.controls.quantity.markAsTouched();
      form.controls.subQuantity.markAsTouched();

      fixture.detectChanges();

      const formErrors: NodeList = fixture.nativeElement.querySelectorAll('form-error');

      expect((<HTMLElement>formErrors.item(0)).getAttribute('controlName')).toMatch('type');
      expect((<HTMLElement>formErrors.item(1)).getAttribute('controlName')).toMatch('quantity');
      expect((<HTMLElement>formErrors.item(2)).getAttribute('controlName')).toMatch('subQuantity');
    });

    test('should render a hops form', (): void => {
      const _mockHops: Hops[] = mockHops();
      const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();

      ingredientFormPage.units = _mockEnglishUnits;
      ingredientFormPage.ingredientType = 'hops';
      ingredientFormPage.ingredientLibrary = _mockHops;
      ingredientFormPage.ingredientForm = formBuilder.group({
        quantity: null,
        subQuantity: 1.5,
        type: ['', [Validators.required]],
        duration: 60,
        dryHop: false
      });

      fixture.detectChanges();

      const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');
      expect(items.length).toEqual(4);

      const ingredientElem: HTMLElement = <HTMLElement>items.item(0);
      expect(ingredientElem.children[0].textContent).toMatch('Select Hops');

      const selectElem: NodeList = ingredientElem.querySelectorAll('ion-select-option');
      selectElem.forEach((node: Node, index: number): void => {
        expect(node.textContent).toMatch(ingredientFormPage.ingredientLibrary[index].name);
      });

      const subQuantityElem: HTMLElement = <HTMLElement>items.item(1);
      expect(subQuantityElem.children[0].textContent).toMatch('Quantity (oz)');
      expect(subQuantityElem.children[1]['value']).toEqual(1.5);

      const durationElem: HTMLElement = <HTMLElement>items.item(2);
      expect(durationElem.children[0].textContent).toMatch('Boil time (minutes)');
      expect(durationElem.children[1]['value']).toEqual(60);

      const dryHopElem: HTMLElement = <HTMLElement>items.item(3);
      expect(dryHopElem.children[0].textContent).toMatch('Dry Hop');
      expect(dryHopElem.children[1]['checked']).toBe(false);
    });

    test('should render errors on hops form', (): void => {
      const _mockHops: Hops[] = mockHops();
      const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();

      ingredientFormPage.units = _mockEnglishUnits;
      ingredientFormPage.ingredientType = 'hops';
      ingredientFormPage.ingredientLibrary = _mockHops;
      ingredientFormPage.ingredientForm = formBuilder.group({
        quantity: null,
        subQuantity: null,
        type: ['', [Validators.required]],
        duration: null,
        dryHop: false
      });
      ingredientFormPage.selectTouched = true;

      const form: FormGroup = ingredientFormPage.ingredientForm;
      form.controls.subQuantity.markAsTouched();
      form.controls.duration.markAsTouched();

      fixture.detectChanges();

      const formErrors: NodeList = fixture.nativeElement.querySelectorAll('form-error');
      expect((<HTMLElement>formErrors.item(0)).getAttribute('controlName')).toMatch('type');
      expect((<HTMLElement>formErrors.item(1)).getAttribute('controlName')).toMatch('subQuantity');
      expect((<HTMLElement>formErrors.item(2)).getAttribute('controlName')).toMatch('duration');
    });

    test('should render an other ingredient form', (): void => {
      const _mockOtherIngredients: OtherIngredients = mockOtherIngredients()[0];
      const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();

      ingredientFormPage.units = _mockEnglishUnits;
      ingredientFormPage.ingredientType = 'otherIngredients';
      ingredientFormPage.ingredientForm = formBuilder.group({
        name: _mockOtherIngredients.name,
        description: _mockOtherIngredients.description,
        units: _mockOtherIngredients.units,
        quantity: _mockOtherIngredients.quantity,
        type: _mockOtherIngredients.type
      });

      fixture.detectChanges();

      const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');
      expect(items.length).toEqual(5);

      const nameElem: HTMLElement = <HTMLElement>items.item(0);
      expect(nameElem.children[0].textContent).toMatch('Name');
      expect(nameElem.children[1]['value']).toMatch(_mockOtherIngredients.name);

      const typeElem: HTMLElement = <HTMLElement>items.item(1);
      expect(typeElem.children[0].textContent).toMatch('Type');
      expect(typeElem.children[1]['value']).toMatch(_mockOtherIngredients.type);

      const quantityElem: HTMLElement = <HTMLElement>items.item(2);
      expect(quantityElem.children[0].textContent).toMatch('Quantity');
      expect(quantityElem.children[1]['value']).toEqual(_mockOtherIngredients.quantity);

      const unitsElem: HTMLElement = <HTMLElement>items.item(3);
      expect(unitsElem.children[0].textContent).toMatch('Units');
      expect(unitsElem.children[1]['value']).toMatch(_mockOtherIngredients.units);

      const descriptionElem: HTMLElement = <HTMLElement>items.item(4);
      expect(descriptionElem.children[0].textContent).toMatch('Description');
      expect(descriptionElem.children[1]['value']).toMatch(_mockOtherIngredients.description);
    });

    test('should render errors on an other ingredient form', (): void => {
      const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();

      ingredientFormPage.units = _mockEnglishUnits;
      ingredientFormPage.ingredientType = 'otherIngredients';
      ingredientFormPage.ingredientForm = formBuilder.group({
        name: [null, [Validators.required]],
        description: [null, [Validators.required]],
        units: [null, [Validators.required]],
        quantity: [null, [Validators.required]],
        type: [null, [Validators.required]]
       });

      const form: FormGroup = ingredientFormPage.ingredientForm;
      form.controls.name.markAsTouched();
      form.controls.description.markAsTouched();
      form.controls.units.markAsTouched();
      form.controls.quantity.markAsTouched();
      form.controls.type.markAsTouched();

      fixture.detectChanges();

      const formErrors: NodeList = fixture.nativeElement.querySelectorAll('form-error');
      expect((<HTMLElement>formErrors.item(0)).getAttribute('controlName')).toMatch('name');
      expect((<HTMLElement>formErrors.item(1)).getAttribute('controlName')).toMatch('type');
      expect((<HTMLElement>formErrors.item(2)).getAttribute('controlName')).toMatch('quantity');
      expect((<HTMLElement>formErrors.item(3)).getAttribute('controlName')).toMatch('units');
      expect((<HTMLElement>formErrors.item(4)).getAttribute('controlName')).toMatch('description');
    });

    test('should render a yeast form', (): void => {
      const _mockYeast: Yeast[] = mockYeast();
      const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();

      ingredientFormPage.units = _mockEnglishUnits;
      ingredientFormPage.ingredientType = 'yeast';
      ingredientFormPage.ingredientLibrary = _mockYeast;
      ingredientFormPage.ingredientForm = formBuilder.group({
        quantity: 1,
        subQuantity: null,
        type: ['', [Validators.required]],
        requiresStarter: false
      });

      fixture.detectChanges();

      const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');
      expect(items.length).toEqual(3);

      const ingredientElem: HTMLElement = <HTMLElement>items.item(0);
      expect(ingredientElem.children[0].textContent).toMatch('Select Yeast');

      const selectElem: NodeList = ingredientElem.querySelectorAll('ion-select-option');
      selectElem.forEach((node: Node, index: number): void => {
        expect(node.textContent).toMatch(ingredientFormPage.ingredientLibrary[index].name);
      });

      const quantityElem: HTMLElement = <HTMLElement>items.item(1);
      expect(quantityElem.children[0].textContent).toMatch('Quantity (packs/vials)');
      expect(quantityElem.children[1]['value']).toEqual(1);

      const starterElem: HTMLElement = <HTMLElement>items.item(2);
      expect(starterElem.children[0].textContent).toMatch('Starter');
      expect(starterElem.children[1]['checked']).toBe(false);
    });

    test('should render errors on a yeast form', (): void => {
      const _mockYeast: Yeast[] = mockYeast();
      const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();

      ingredientFormPage.units = _mockEnglishUnits;
      ingredientFormPage.ingredientType = 'yeast';
      ingredientFormPage.ingredientLibrary = _mockYeast;
      ingredientFormPage.ingredientForm = formBuilder.group({
        quantity: null,
        subQuantity: null,
        type: ['', [Validators.required]],
        requiresStarter: false
      });
      ingredientFormPage.selectTouched = true;

      const form: FormGroup = ingredientFormPage.ingredientForm;
      form.controls.quantity.markAsTouched();

      fixture.detectChanges();

      const formErrors: NodeList = fixture.nativeElement.querySelectorAll('form-error');
      expect((<HTMLElement>formErrors.item(0)).getAttribute('controlName')).toMatch('type');
      expect((<HTMLElement>formErrors.item(1)).getAttribute('controlName')).toMatch('quantity');
    });

    test('should render form buttons', (): void => {
      const _mockYeast: Yeast[] = mockYeast();
      const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();

      ingredientFormPage.formType = 'update';
      ingredientFormPage.units = _mockEnglishUnits;
      ingredientFormPage.ingredientType = 'yeast';
      ingredientFormPage.ingredientLibrary = _mockYeast;
      ingredientFormPage.ingredientForm = formBuilder.group({
        quantity: 1,
        subQuantity: null,
        type: ['', [Validators.required]],
        requiresStarter: false
      });

      fixture.detectChanges();

      const buttons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');

      expect(buttons.item(0).textContent).toMatch('Cancel');
      expect(buttons.item(1).textContent).toMatch('Submit');
      expect(buttons.item(2).textContent).toMatch('Delete');
    });

  });

});
