/* Module imports */
import { async, TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockYeast, mockYeastBatch, mockEnglishUnits } from '../../../../../../test-config/mock-models';
import { UtilityServiceStub } from '../../../../../../test-config/service-stubs';
import { FormInputComponentStub } from '../../../../../../test-config/component-stubs';

/* Interface imports */
import { FormSelectOption, YeastBatch, Yeast, SelectedUnits } from '../../../../shared/interfaces';

/* Service imports */
import { UtilityService } from '../../../../services/services';

/* Component imports */
import { YeastFormComponent } from './yeast-form.component';


describe('YeastFormComponent', () => {
  let component: YeastFormComponent;
  let fixture: ComponentFixture<YeastFormComponent>;
  let originalAfterViewInit: any;
  let originalOnDestroy: any;
  let originalOnInit: any;
  let _mockYeastBatch: YeastBatch[];
  let _mockYeast: Yeast[];
  let _mockFormSelectOptions: FormSelectOption[];
  let _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
  const initDefaultForm: () => FormGroup = (): FormGroup => {
    return new FormGroup({
      quantity: new FormControl(),
      requiresStarter: new FormControl(),
      type: new FormControl(),
    });
  };
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        YeastFormComponent,
        FormInputComponentStub
      ],
      imports: [ ReactiveFormsModule ],
      providers: [
        { provide: UtilityService, useClass: UtilityServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeAll(async((): void => {
    _mockYeastBatch = mockYeastBatch();
    _mockYeast = mockYeast();
    _mockFormSelectOptions = _mockYeast.map((grains: Yeast): FormSelectOption => {
      return { label: grains.name, value: grains };
    });
  }));

  beforeEach((): void => {
    fixture = TestBed.createComponent(YeastFormComponent);
    component = fixture.componentInstance;
    originalAfterViewInit = component.ngAfterViewInit;
    component.ngAfterViewInit = jest.fn();
    originalOnDestroy = component.ngOnDestroy;
    component.ngOnDestroy = jest.fn();
    originalOnInit = component.ngOnInit;
    component.ngOnInit = jest.fn();
    component.yeastFormOptions = _mockFormSelectOptions;
    component.units = _mockEnglishUnits;
    component.yeastForm = initDefaultForm();
    component.utilService.roundToDecimalPlace = jest
      .fn()
      .mockImplementation((value: number, places: number): number => {
        if (places < 0) {
          return -1;
        }
        return Math.round(value * Math.pow(10, places)) / Math.pow(10, places);
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
      component.initForm = jest.fn();
      const initSpy: jest.SpyInstance = jest.spyOn(component, 'initForm');

      fixture.detectChanges();

      expect(initSpy).toHaveBeenCalled();
    });

    test('should listen for form changes', (): void => {
      component.ngAfterViewInit = originalAfterViewInit;
      component.formStatusEvent.emit = jest.fn();
      const emitSpy: jest.SpyInstance = jest.spyOn(component.formStatusEvent, 'emit');

      fixture.detectChanges();

      component.yeastForm.updateValueAndValidity();
      expect(emitSpy).toHaveBeenNthCalledWith(1, true);
      component.yeastForm.controls.quantity.setErrors({ test: true });
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
      const _mockYeastBatchInstance: YeastBatch = mockYeastBatch()[0];
      _mockYeastBatchInstance.quantity = 10;
      component.update = _mockYeastBatchInstance;

      fixture.detectChanges();

      component.assignFormValues();
      expect(component.yeastForm.value).toStrictEqual({
        quantity: _mockYeastBatchInstance.quantity,
        requiresStarter: _mockYeastBatchInstance.requiresStarter,
        type: _mockYeastBatchInstance.yeastType
      });
    });

    test('should get form result', (): void => {
      const controls: { [key: string]: AbstractControl } = component.yeastForm.controls;
      controls.quantity.setValue(1);
      controls.requiresStarter.setValue(true);
      controls.type.setValue(_mockYeast[0]);

      fixture.detectChanges();

      const results: object = component.getFormResult();
      expect(results).toStrictEqual({
        yeastType: _mockYeast[0],
        quantity: 1,
        requiresStarter: true
      });
    });

    test('should init the form', (): void => {
      component.update = _mockYeastBatch[0];
      component.assignFormValues = jest.fn();
      const assignSpy: jest.SpyInstance = jest.spyOn(component, 'assignFormValues');

      fixture.detectChanges();

      component.initForm();
      expect(component.yeastForm.controls.quantity).toBeTruthy();
      expect(component.yeastForm.controls.requiresStarter).toBeTruthy();
      expect(component.yeastForm.controls.type).toBeTruthy();
      expect(assignSpy).toHaveBeenCalled();
    });

  });


  describe('Template', (): void => {

    test('should render the template', (): void => {
      component.ngOnInit = originalOnInit;
      component.ngOnDestroy = originalOnDestroy;
      component.ngAfterViewInit = originalAfterViewInit;

      fixture.detectChanges();

      const selectElem: HTMLElement = fixture.nativeElement.querySelector('app-form-select');
      expect(selectElem).toBeTruthy();
      const inputElem: HTMLElement = fixture.nativeElement.querySelector('app-form-input');
      expect(inputElem.getAttribute('controlName')).toMatch('quantity');
      const toggleElem: HTMLElement = fixture.nativeElement.querySelector('app-form-toggle');
      expect(toggleElem.getAttribute('toggleName')).toMatch('starter');
    });

  });

});
