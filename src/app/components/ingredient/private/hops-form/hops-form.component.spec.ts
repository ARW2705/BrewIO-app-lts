/* Module imports */
import { async, TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockHops, mockHopsSchedule, mockEnglishUnits } from '@test/mock-models';
import { CalculationsServiceStub, UtilityServiceStub } from '@test/service-stubs';
import { FormInputComponentStub } from '@test/component-stubs';

/* Interface imports */
import { FormSelectOption, HopsSchedule, Hops, SelectedUnits } from '@shared/interfaces';

/* Service imports */
import { CalculationsService, UtilityService } from '@services/public';

/* Component imports */
import { HopsFormComponent } from './hops-form.component';


describe('HopsFormComponent', () => {
  let component: HopsFormComponent;
  let fixture: ComponentFixture<HopsFormComponent>;
  let originalAfterViewInit: any;
  let originalOnDestroy: any;
  let originalOnInit: any;
  let _mockHopsSchedule: HopsSchedule[];
  let _mockHops: Hops[];
  let _mockFormSelectOptions: FormSelectOption[];
  let _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
  const initDefaultForm: () => FormGroup = (): FormGroup => {
    return new FormGroup({
      dryHop: new FormControl(),
      duration: new FormControl(),
      quantity: new FormControl(),
      type: new FormControl()
    });
  };
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        HopsFormComponent,
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
    _mockHopsSchedule = mockHopsSchedule();
    _mockHops = mockHops();
    _mockFormSelectOptions = _mockHops.map((hops: Hops): FormSelectOption => {
      return { label: hops.name, value: hops };
    });
  }));

  beforeEach((): void => {
    fixture = TestBed.createComponent(HopsFormComponent);
    component = fixture.componentInstance;
    originalAfterViewInit = component.ngAfterViewInit;
    component.ngAfterViewInit = jest.fn();
    originalOnDestroy = component.ngOnDestroy;
    component.ngOnDestroy = jest.fn();
    originalOnInit = component.ngOnInit;
    component.ngOnInit = jest.fn();
    component.hopsFormOptions = _mockFormSelectOptions;
    component.units = _mockEnglishUnits;
    component.hopsForm = initDefaultForm();
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

      component.hopsForm.updateValueAndValidity();
      expect(emitSpy).toHaveBeenNthCalledWith(1, true);
      component.hopsForm.controls.quantity.setErrors({ test: true });
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
      const _mockHopsScheduleInstance: HopsSchedule = mockHopsSchedule()[0];
      _mockHopsScheduleInstance.duration = 55;
      _mockHopsScheduleInstance.quantity = 10;
      component.update = _mockHopsScheduleInstance;
      component.calculator.requiresConversion = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      fixture.detectChanges();

      // converts english to metric
      component.requiresConversionLarge = true;
      component.assignFormValues();
      expect(component.hopsForm.value).toStrictEqual({
        dryHop: false,
        duration: 55,
        quantity: 5,
        type: _mockHopsScheduleInstance.hopsType
      });
      // no unit conversions necessary
      component.hopsForm = initDefaultForm();
      component.requiresConversionLarge = false;
      _mockHopsScheduleInstance.quantity = 1.5;
      component.assignFormValues();
      expect(component.hopsForm.value).toStrictEqual({
        dryHop: false,
        duration: 55,
        quantity: 1.5,
        type: _mockHopsScheduleInstance.hopsType
      });
    });

    test('should get form result', (): void => {
      const controls: { [key: string]: AbstractControl } = component.hopsForm.controls;
      controls.type.setValue(_mockHops[0]);
      controls.quantity.setValue(1.5);
      controls.duration.setValue(50);
      controls.dryHop.setValue(false);
      component.requiresConversionSmall = true;

      fixture.detectChanges();

      const results: object = component.getFormResult();
      expect(results).toStrictEqual({
        hopsType: _mockHops[0],
        dryHop: false,
        duration: 50,
        quantity: 3
      });
    });

    test('should init the form', (): void => {
      component.assignFormValues = jest.fn();
      const assignSpy: jest.SpyInstance = jest.spyOn(component, 'assignFormValues');
      component.update = _mockHopsSchedule[0];

      fixture.detectChanges();

      component.initForm();
      expect(component.hopsForm).toBeDefined();
      expect(assignSpy).toHaveBeenCalled();
    });

    test('should handle on dry hop change event', (): void => {
      const _mockHopsSchedule: HopsSchedule = mockHopsSchedule()[0];
      _mockHopsSchedule.dryHop = false;
      const mockEventTrue: CustomEvent = new CustomEvent('', { detail: { checked: true } });
      const mockEventFalse: CustomEvent = new CustomEvent('', { detail: { checked: false } });
      const formBuilder: FormBuilder = new FormBuilder();
      component.hopsForm = formBuilder.group({
        quantity: _mockHopsSchedule.quantity,
        subQuantity: null,
        type: _mockHopsSchedule.hopsType,
        duration: [
          _mockHopsSchedule.duration,
          [Validators.required, Validators.min(0), Validators.max(this.boilTime || 60)]
        ],
        dryHop: _mockHopsSchedule.dryHop
      });

      fixture.detectChanges();

      expect(component.hopsForm.controls.duration).not.toBeNull();
      component.onDryHopChange(mockEventTrue);
      expect(component.hopsForm.controls.duration.validator).toBeNull();
      component.onDryHopChange(mockEventFalse);
      expect(component.hopsForm.controls.duration).not.toBeNull();
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
      expect(inputElems.length).toEqual(2);
      const quantityElem: HTMLElement = <HTMLElement>inputElems.item(0);
      expect(quantityElem.getAttribute('controlName')).toMatch('quantity');
      const durationElem: HTMLElement = <HTMLElement>inputElems.item(1);
      expect(durationElem.getAttribute('controlName')).toMatch('duration');
      const toggleElem: HTMLElement = fixture.nativeElement.querySelector('app-form-toggle');
      expect(toggleElem.getAttribute('toggleName')).toMatch('dry hop');
    });

  });

});
