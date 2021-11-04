/* Module imports */
import { async, TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockOtherIngredients } from '../../../../../../test-config/mock-models';
import { FormInputComponentStub } from '../../../../../../test-config/component-stubs';

/* Interface imports */
import { OtherIngredients } from '../../../../shared/interfaces';

/* Component imports */
import { OtherIngredientsFormComponent } from './other-ingredients-form.component';


describe('OtherIngredientsFormComponent', () => {
  let component: OtherIngredientsFormComponent;
  let fixture: ComponentFixture<OtherIngredientsFormComponent>;
  let originalAfterViewInit: any;
  let originalOnDestroy: any;
  let originalOnInit: any;
  let _mockOtherIngredients: OtherIngredients[];
  const initDefaultForm: () => FormGroup = (): FormGroup => {
    return new FormGroup({
      description: new FormControl(),
      name: new FormControl(),
      quantity: new FormControl(),
      type: new FormControl(),
      units: new FormControl()
    });
  };
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        OtherIngredientsFormComponent,
        FormInputComponentStub
      ],
      imports: [ ReactiveFormsModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeAll(async((): void => {
    _mockOtherIngredients = mockOtherIngredients();
  }));

  beforeEach((): void => {
    fixture = TestBed.createComponent(OtherIngredientsFormComponent);
    component = fixture.componentInstance;
    originalAfterViewInit = component.ngAfterViewInit;
    component.ngAfterViewInit = jest.fn();
    originalOnDestroy = component.ngOnDestroy;
    component.ngOnDestroy = jest.fn();
    originalOnInit = component.ngOnInit;
    component.ngOnInit = jest.fn();
    component.otherIngredientsForm = initDefaultForm();
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

      component.otherIngredientsForm.updateValueAndValidity();
      expect(emitSpy).toHaveBeenNthCalledWith(1, true);
      component.otherIngredientsForm.controls.quantity.setErrors({ test: true });
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
      const _mockOtherIngredientsInstance: OtherIngredients = mockOtherIngredients()[0];
      _mockOtherIngredientsInstance.description = 'test description';
      _mockOtherIngredientsInstance.name = 'test name';
      _mockOtherIngredientsInstance.quantity = 10;
      _mockOtherIngredientsInstance.type = 'test type';
      _mockOtherIngredientsInstance.units = 'test units';
      component.update = _mockOtherIngredientsInstance;

      fixture.detectChanges();

      component.assignFormValues();
      expect(component.otherIngredientsForm.value).toStrictEqual({
        description: 'test description',
        name: 'test name',
        quantity: 10,
        type: 'test type',
        units: 'test units'
      });
    });

    test('should get form result', (): void => {
      const controls: { [key: string]: AbstractControl } = component.otherIngredientsForm.controls;
      controls.description.setValue('test description');
      controls.name.setValue('test name');
      controls.quantity.setValue(10);
      controls.type.setValue('test type');
      controls.units.setValue('test units');

      fixture.detectChanges();

      const results: object = component.getFormResult();
      expect(results).toStrictEqual({
        description: 'test description',
        name: 'test name',
        quantity: 10,
        type: 'test type',
        units: 'test units'
      });
    });

    test('should init the form', (): void => {
      component.update = _mockOtherIngredients[0];
      component.assignFormValues = jest.fn();
      const assignSpy: jest.SpyInstance = jest.spyOn(component, 'assignFormValues');

      fixture.detectChanges();

      component.initForm();
      expect(component.otherIngredientsForm.controls.description).toBeTruthy();
      expect(component.otherIngredientsForm.controls.name).toBeTruthy();
      expect(component.otherIngredientsForm.controls.quantity).toBeTruthy();
      expect(component.otherIngredientsForm.controls.type).toBeTruthy();
      expect(component.otherIngredientsForm.controls.units).toBeTruthy();
      expect(assignSpy).toHaveBeenCalled();
    });

  });


  describe('Template', (): void => {

    test('should render the template', (): void => {
      component.ngOnInit = originalOnInit;
      component.ngOnDestroy = originalOnDestroy;
      component.ngAfterViewInit = originalAfterViewInit;

      fixture.detectChanges();

      const inputElems: NodeList = fixture.nativeElement.querySelectorAll('app-form-input');
      expect(inputElems.length).toEqual(5);
      const nameElem: HTMLElement = <HTMLElement>inputElems.item(0);
      expect(nameElem.getAttribute('controlName')).toMatch('name');
      const typeElem: HTMLElement = <HTMLElement>inputElems.item(1);
      expect(typeElem.getAttribute('controlName')).toMatch('type');
      const quantityElem: HTMLElement = <HTMLElement>inputElems.item(2);
      expect(quantityElem.getAttribute('controlName')).toMatch('quantity');
      const unitsElem: HTMLElement = <HTMLElement>inputElems.item(3);
      expect(unitsElem.getAttribute('controlName')).toMatch('units');
      const decription: HTMLElement = <HTMLElement>inputElems.item(4);
      expect(decription.getAttribute('controlName')).toMatch('description');
    });

  });

});
