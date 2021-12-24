/* Module imports */
import { async, TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockGrains, mockGrainBill, mockEnglishUnits } from '@test/mock-models';
import { CalculationsServiceStub, UtilityServiceStub } from '@test/service-stubs';
import { FormInputComponentStub } from '@test/component-stubs';

/* Interface imports */
import { FormSelectOption, GrainBill, Grains, SelectedUnits } from '@shared/interfaces';

/* Service imports */
import { CalculationsService, UtilityService } from '@services/public';

/* Component imports */
import { FormInputComponent } from '@components/form-elements/public';
import { GrainFormComponent } from './grain-form.component';


describe('GrainFormComponent', () => {
  let component: GrainFormComponent;
  let fixture: ComponentFixture<GrainFormComponent>;
  let originalAfterViewInit: any;
  let originalOnDestroy: any;
  let originalOnInit: any;
  let _mockGrainBill: GrainBill[];
  let _mockGrains: Grains[];
  let _mockFormSelectOptions: FormSelectOption[];
  let _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
  const initDefaultForm: () => FormGroup = (): FormGroup => {
    return new FormGroup({
      quantity: new FormControl(),
      subQuantity: new FormControl(),
      type: new FormControl(),
      mill: new FormControl()
    });
  };
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        GrainFormComponent,
        FormInputComponentStub
      ],
      imports: [ ReactiveFormsModule ],
      providers: [
        { provide: CalculationsService, useClass: CalculationsServiceStub },
        { provide: UtilityService, useClass: UtilityServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeAll(async((): void => {
    _mockGrainBill = mockGrainBill();
    _mockGrains = mockGrains();
    _mockFormSelectOptions = _mockGrains.map((grains: Grains): FormSelectOption => {
      return { label: grains.name, value: grains };
    });
  }));

  beforeEach((): void => {
    fixture = TestBed.createComponent(GrainFormComponent);
    component = fixture.componentInstance;
    originalAfterViewInit = component.ngAfterViewInit;
    component.ngAfterViewInit = jest.fn();
    originalOnDestroy = component.ngOnDestroy;
    component.ngOnDestroy = jest.fn();
    originalOnInit = component.ngOnInit;
    component.ngOnInit = jest.fn();
    component.grainFormOptions = _mockFormSelectOptions;
    component.units = _mockEnglishUnits;
    component.grainForm = initDefaultForm();
    component.utilService.roundToDecimalPlace = jest
      .fn()
      .mockImplementation((value: number, places: number): number => {
        if (places < 0) {
          return -1;
        }
        return Math.round(value * Math.pow(10, places)) / Math.pow(10, places);
      });
    component.calculator.convertWeight = jest
      .fn()
      .mockImplementation((value: number, ignore: any, toEn: boolean): number => {
        return toEn ? value * 2 : value / 2;
      });
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Lifecycle', (): void => {

    test('should init the component', (): void => {
      component.ngOnInit = originalOnInit;
      component.update = undefined;
      component.calculator.requiresConversion = jest.fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      component.initForm = jest.fn();
      const calcSpy: jest.SpyInstance = jest.spyOn(component.calculator, 'requiresConversion');
      const initSpy: jest.SpyInstance = jest.spyOn(component, 'initForm');

      fixture.detectChanges();

      expect(component.requiresConversionLarge).toBe(false);
      expect(component.requiresConversionSmall).toBe(true);
      expect(calcSpy).toHaveBeenNthCalledWith(1, 'weightLarge', _mockEnglishUnits);
      expect(calcSpy).toHaveBeenNthCalledWith(2, 'weightSmall', _mockEnglishUnits);
      expect(initSpy).toHaveBeenCalled();
    });

    test('should listen for form changes', (): void => {
      component.ngAfterViewInit = originalAfterViewInit;
      component.formStatusEvent.emit = jest.fn();
      const emitSpy: jest.SpyInstance = jest.spyOn(component.formStatusEvent, 'emit');

      fixture.detectChanges();

      component.grainForm.updateValueAndValidity();
      expect(emitSpy).toHaveBeenNthCalledWith(1, true);
      component.grainForm.controls.quantity.setErrors({ test: true });
      expect(emitSpy).toHaveBeenNthCalledWith(2, false);
    });

    test('should destroy the component', (): void => {
      component.ngOnDestroy = originalOnDestroy;
      component.destroy$.next = jest.fn();
      component.destroy$.complete = jest.fn();
      const nextSpy: jest.SpyInstance = jest.spyOn(component.destroy$, 'next');
      const completeSpy: jest.SpyInstance = jest.spyOn(component.destroy$, 'complete');

      fixture.detectChanges();

      component.ngOnDestroy();
      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });

  });

  describe('Other Methods', (): void => {

    test('should assign form values', (): void => {
      const _mockGrainBillInstance: GrainBill = mockGrainBill()[0];
      _mockGrainBillInstance.quantity = 10;
      component.update = _mockGrainBillInstance;
      component.calculator.requiresConversion = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      fixture.detectChanges();

      // converts english large weight to metric - will not have subQuantity
      component.requiresConversionLarge = true;
      component.assignFormValues();
      expect(component.grainForm.value).toStrictEqual({
        quantity: 5,
        subQuantity: null,
        type: _mockGrainBillInstance.grainType,
        mill: _mockGrainBillInstance.mill
      });
      // converts mixed english large weight / metric large weight to metric
      component.grainForm = initDefaultForm();
      component.requiresConversionLarge = false;
      _mockGrainBillInstance.quantity = 1.5;
      component.assignFormValues();
      expect(component.grainForm.value).toStrictEqual({
        quantity: 1,
        subQuantity: 0.25,
        type: _mockGrainBillInstance.grainType,
        mill: _mockGrainBillInstance.mill
      });
      // no unit conversions necessary
      component.grainForm = initDefaultForm();
      component.requiresConversionLarge = false;
      _mockGrainBillInstance.quantity = 1.5;
      component.assignFormValues();
      expect(component.grainForm.value).toStrictEqual({
        quantity: 1,
        subQuantity: 8,
        type: _mockGrainBillInstance.grainType,
        mill: _mockGrainBillInstance.mill
      });
    });

    test('should check if quantity or subQuantity is valid', (): void => {
      fixture.detectChanges();

      const qCmp: FormInputComponent = new FormInputComponentStub;
      const sqCmp: FormInputComponent = new FormInputComponentStub;
      qCmp.checkForErrors = jest.fn();
      sqCmp.checkForErrors = jest.fn();
      component.quantityField = qCmp;
      component.subQuantityField = sqCmp;
      const qCheckSpy: jest.SpyInstance = jest.spyOn(component.quantityField, 'checkForErrors');
      const sqCheckSpy: jest.SpyInstance = jest.spyOn(sqCmp, 'checkForErrors');
      expect(component.grainForm.controls.quantity.touched).toBe(false);
      expect(component.grainForm.controls.subQuantity.touched).toBe(false);
      component.checkCompanionInput();
      expect(component.grainForm.controls.quantity.touched).toBe(true);
      expect(component.grainForm.controls.subQuantity.touched).toBe(true);
      expect(qCheckSpy).toHaveBeenCalled();
      expect(sqCheckSpy).toHaveBeenCalled();
    });

    test('should get form result', (): void => {
      const controls: { [key: string]: AbstractControl } = component.grainForm.controls;
      controls.type.setValue(_mockGrains[0]);
      controls.mill.setValue(0.0035);
      component.getCombinedQuantity = jest.fn()
        .mockReturnValue(1.5);

      fixture.detectChanges();

      const results: object = component.getFormResult();
      expect(results).toStrictEqual({
        grainType: _mockGrains[0],
        quantity: 1.5,
        mill: 0.0035
      });
    });

    test('should get combined quantity', (): void => {
      const v1: object = {};
      const v2: object = { quantity: 1 };
      const v3: object = { subQuantity: 10 };
      const v4: object = { quantity: 1, subQuantity: 8 };
      component.getQuantity = jest.fn()
        .mockImplementation((value: number): number => value || 0);
      component.getSubQuantity = jest.fn()
        .mockImplementation((value: number): number => value || 0);
      const qSpy: jest.SpyInstance = jest.spyOn(component, 'getQuantity');
      const sqSpy: jest.SpyInstance = jest.spyOn(component, 'getSubQuantity');

      fixture.detectChanges();

      expect(component.getCombinedQuantity(v1)).toEqual(0);
      expect(qSpy).toHaveBeenCalledWith(undefined);
      expect(sqSpy).toHaveBeenCalledWith(undefined);
      expect(component.getCombinedQuantity(v2)).toEqual(1);
      expect(qSpy).toHaveBeenCalledWith(1);
      expect(sqSpy).toHaveBeenCalledWith(undefined);
      expect(component.getCombinedQuantity(v3)).toEqual(10);
      expect(qSpy).toHaveBeenCalledWith(undefined);
      expect(sqSpy).toHaveBeenCalledWith(10);
      expect(component.getCombinedQuantity(v4)).toEqual(9);
      expect(qSpy).toHaveBeenCalledWith(1);
      expect(sqSpy).toHaveBeenCalledWith(8);
    });

    test('should get quantity (with conversion if necessary)', (): void => {
      fixture.detectChanges();

      component.requiresConversionLarge = true;
      expect(component.getQuantity(10)).toEqual(20);
      component.requiresConversionLarge = false;
      expect(component.getQuantity(10)).toEqual(10);
      expect(component.getQuantity(undefined)).toEqual(0);
    });

    test('should get subQuantity (with conversion if necessary)', (): void => {
      fixture.detectChanges();

      component.requiresConversionSmall = true;
      expect(component.getSubQuantity(16)).toEqual(32);
      component.requiresConversionSmall = false;
      expect(component.getSubQuantity(16)).toEqual(1);
      expect(component.getSubQuantity(undefined)).toEqual(0);
    });

    test('should init the form', (): void => {
      component.update = _mockGrainBill[0];
      component.assignFormValues = jest.fn();
      const assignSpy: jest.SpyInstance = jest.spyOn(component, 'assignFormValues');

      fixture.detectChanges();

      component.initForm();
      expect(component.grainForm.controls.mill).toBeTruthy();
      expect(component.grainForm.controls.quantity).toBeTruthy();
      expect(component.grainForm.controls.subQuantity).toBeTruthy();
      expect(component.grainForm.controls.type).toBeTruthy();
      expect(assignSpy).toHaveBeenCalled();
    });

  });

  describe('Template', (): void => {

    test('should render the template', (): void => {
      component.ngOnInit = originalOnInit;
      component.ngOnDestroy = originalOnDestroy;
      component.ngAfterViewInit = originalAfterViewInit;
      component.requiresConversionLarge = false;

      fixture.detectChanges();

      const selectElem: HTMLElement = fixture.nativeElement.querySelector('app-form-select');
      expect(selectElem).toBeTruthy();
      const inputElems: NodeList = fixture.nativeElement.querySelectorAll('app-form-input');
      expect(inputElems.length).toEqual(3);
      const quantityElem: HTMLElement = <HTMLElement>inputElems.item(0);
      expect(quantityElem.getAttribute('controlName')).toMatch('quantity');
      const subQuantityElem: HTMLElement = <HTMLElement>inputElems.item(1);
      expect(subQuantityElem.getAttribute('controlName')).toMatch('subQuantity');
      const millElem: HTMLElement = <HTMLElement>inputElems.item(2);
      expect(millElem.getAttribute('controlName')).toMatch('mill');
    });

  });

});
