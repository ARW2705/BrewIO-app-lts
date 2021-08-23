/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange, SimpleChanges } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormControl, ValidationErrors } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockPreferencesSelectOptions } from '../../../../test-config/mock-models';

/* Component imports */
import { FormSelectComponent } from './form-select.component';


describe('FormSelectComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<FormSelectComponent>;
  let component: FormSelectComponent;
  let originalOnChanges: any;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ FormSelectComponent ],
      imports: [
        IonicModule,
        FormsModule,
        ReactiveFormsModule
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(FormSelectComponent);
    component = fixture.componentInstance;
    originalOnChanges = component.ngOnChanges;
    component.ngOnChanges = jest.fn();
    component.options = mockPreferencesSelectOptions();
    component.control = new FormControl();
    component.label = 'test-name';
    component.ionCancelEvent.emit = jest.fn();
    component.ionChangeEvent.emit = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should set defaults on changes', (): void => {
    component.ngOnChanges = originalOnChanges;
    component.setDefault = jest.fn();
    const setSpy: jest.SpyInstance = jest.spyOn(component, 'setDefault');
    const noValueChange: SimpleChange = new SimpleChange(null, undefined, true);
    const simpleChanges: SimpleChanges = {
      none: noValueChange,
      label: undefined
    };

    fixture.detectChanges();

    component.ngOnChanges(simpleChanges);
    expect(setSpy).toHaveBeenNthCalledWith(1, 'compareWithFn');
    expect(setSpy).toHaveBeenNthCalledWith(2, 'confirmText');
    expect(setSpy).toHaveBeenNthCalledWith(3, 'control');
    expect(setSpy).toHaveBeenNthCalledWith(4, 'dismissText');
    expect(setSpy).toHaveBeenNthCalledWith(5, 'labelPosition');
  });

  test('should set control value on changes', (): void => {
    component.ngOnChanges = originalOnChanges;
    component.setDefault = jest.fn();
    const testControl: FormControl = new FormControl();
    component.control = testControl;
    const valueChange: SimpleChange = new SimpleChange(null, 2, true);
    const simpleChanges: SimpleChanges = { value: valueChange };

    fixture.detectChanges();

    component.ngOnChanges(simpleChanges);
    expect(component.control.value).toEqual(2);
  });

  test('should check for errors', (): void => {
    fixture.detectChanges();

    const formError: ValidationErrors = { maxlength: true };
    component.control.setErrors(formError);
    component.control.markAsTouched();
    component.checkForErrors();
    expect(component.controlErrors).toStrictEqual(formError);
    expect(component.showError).toBe(true);
  });

  test('should handle ion cancel event', (): void => {
    component.checkForErrors = jest.fn();
    const checkSpy: jest.SpyInstance = jest.spyOn(component, 'checkForErrors');
    const emitSpy: jest.SpyInstance = jest.spyOn(component.ionCancelEvent, 'emit');

    fixture.detectChanges();

    const event: CustomEvent = new CustomEvent('test');
    component.ionCancel(event);
    expect(emitSpy).toHaveBeenCalledWith(event);
    expect(checkSpy).toHaveBeenCalled();
  });

  test('should handle ion change event', (): void => {
    component.checkForErrors = jest.fn();
    const checkSpy: jest.SpyInstance = jest.spyOn(component, 'checkForErrors');
    const emitSpy: jest.SpyInstance = jest.spyOn(component.ionChangeEvent, 'emit');

    fixture.detectChanges();

    const event: CustomEvent = new CustomEvent('test');
    component.ionChange(event);
    expect(emitSpy).toHaveBeenCalledWith(event);
    expect(checkSpy).toHaveBeenCalled();
  });

  test('should set defaults on required properties', (): void => {
    fixture.detectChanges();

    component.compareWithFn = undefined;
    component.confirmText = undefined;
    component.control = undefined;
    component.dismissText = undefined;
    component.labelPosition = undefined;
    component.setDefault('none');
    expect(component.compareWithFn).toBeUndefined();
    expect(component.confirmText).toBeUndefined();
    expect(component.control).toBeUndefined();
    expect(component.dismissText).toBeUndefined();
    expect(component.labelPosition).toBeUndefined();
    component.setDefault('compareWithFn');
    expect(component.compareWithFn).toBeInstanceOf(Function);
    component.setDefault('confirmText');
    expect(component.confirmText).toMatch('Okay');
    const compareObj: object = {};
    expect(component.compareWithFn(compareObj, compareObj)).toBe(true);
    component.setDefault('control');
    expect(component.control).toBeInstanceOf(FormControl);
    component.setDefault('dismissText');
    expect(component.dismissText).toMatch('Dismiss');
    component.setDefault('labelPosition');
    expect(component.labelPosition).toMatch('floating');
  });

  test('should render the template without errors', (): void => {
    component.confirmText = 'confirm';
    component.control = new FormControl();
    component.dismissText = 'dismiss';
    component.formName = 'form';
    component.labelPosition = 'position';
    component.compareWithFn = (o1: any, o2: any): boolean => o1 === o2;
    component.shouldRequire = false;

    fixture.detectChanges();

    const label: HTMLElement = global.document.querySelector('ion-label');
    expect(label.textContent).toMatch('Test-name');
    const select: HTMLElement = global.document.querySelector('ion-select');
    expect(select['cancelText']).toMatch('dismiss');
    expect(select['okText']).toMatch('confirm');
    const options: NodeList = global.document.querySelectorAll('ion-select-option');
    expect(options.item(0).textContent).toMatch('Label1');
    expect(options.item(1).textContent).toMatch('Label2');
    expect(options.item(2).textContent).toMatch('Label3');
    const error: HTMLElement = global.document.querySelector('app-form-error');
    expect(error).toBeNull();
  });

  test('should render the template without errors', (): void => {
    component.confirmText = 'confirm';
    component.control = new FormControl();
    component.controlName = 'control';
    component.dismissText = 'dismiss';
    component.formName = 'form';
    component.labelPosition = 'position';
    component.compareWithFn = (o1: any, o2: any): boolean => o1 === o2;
    component.shouldRequire = false;
    component.showError = true;
    component.controlErrors = { maxlength: true };

    fixture.detectChanges();

    const error: HTMLElement = global.document.querySelector('app-form-error');
    expect(error['formName']).toMatch('form');
    expect(error['controlName']).toMatch('control');
    expect(error['controlErrors']).toStrictEqual({ maxlength: true });
  });

});
