/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange, SimpleChanges } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormControl } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockPreferencesSelectOptions } from '../../../../test-config/mock-models';

/* Interface imports */
import { FormSelectOption } from '../../shared/interfaces';

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
    component.ionChangeEvent = (): void => {};
    component.options = mockPreferencesSelectOptions();
    component.control = new FormControl();
    component.label = 'test-name';
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
    expect(setSpy).toHaveBeenNthCalledWith(1, 'control');
    expect(setSpy).toHaveBeenNthCalledWith(2, 'label');
    expect(setSpy).toHaveBeenNthCalledWith(3, 'ionChangeEvent');
    expect(setSpy).toHaveBeenNthCalledWith(4, 'ionCancelEvent');
    expect(setSpy).toHaveBeenNthCalledWith(5, 'compareWithFn');
    expect(setSpy).toHaveBeenNthCalledWith(6, 'options');
  });

  test('should set control value on changes', (): void => {
    component.ngOnChanges = originalOnChanges;
    component.setDefault = jest.fn();
    const testControl: FormControl = new FormControl();
    component.control = testControl;
    component.options = [
      { label: 'first' , value: 1 },
      { label: 'second', value: 2 },
      { label: 'third' , value: 3 }
    ];
    const valueChange: SimpleChange = new SimpleChange(null, 2, true);
    const simpleChanges: SimpleChanges = { value: valueChange };

    fixture.detectChanges();

    component.ngOnChanges(simpleChanges);
    expect(component.control.value).toEqual(2);
  });

  test('should set defaults on required properties', (): void => {
    fixture.detectChanges();

    component.control = undefined;
    component.label = undefined;
    component.ionChangeEvent = undefined;
    component.ionCancelEvent = undefined;
    component.compareWithFn = undefined;
    component.options = undefined;
    component.setDefault('control');
    expect(component.control).toBeInstanceOf(FormControl);
    component.setDefault('label');
    expect(component.label).toBeDefined();
    expect(component.label.length).toEqual(0);
    component.setDefault('ionChangeEvent');
    expect(component.ionChangeEvent).toBeInstanceOf(Function);
    expect(component.ionChangeEvent()).toBeUndefined();
    component.setDefault('ionCancelEvent');
    expect(component.ionCancelEvent).toBeInstanceOf(Function);
    expect(component.ionCancelEvent()).toBeUndefined();
    component.setDefault('compareWithFn');
    expect(component.compareWithFn).toBeInstanceOf(Function);
    const compareObj: object = {};
    expect(component.compareWithFn(compareObj, compareObj)).toBe(true);
    component.setDefault('options');
    expect(Array.isArray(component.options)).toBe(true);
    component.setDefault('not-covered');
    expect(component.control).toBeInstanceOf(FormControl);
    expect(component.label).toBeDefined();
    expect(component.label.length).toEqual(0);
    expect(component.ionChangeEvent).toBeInstanceOf(Function);
    expect(component.ionCancelEvent).toBeInstanceOf(Function);
    expect(component.compareWithFn).toBeInstanceOf(Function);
    expect(Array.isArray(component.options)).toBe(true);
});

  test('should render the template', (): void => {
    fixture.detectChanges();

    const label: HTMLElement = global.document.querySelector('ion-label');
    expect(label.textContent).toMatch('Test-name');
    const options: NodeList = global.document.querySelectorAll('ion-select-option');
    expect(options.item(0).textContent).toMatch('Label1');
    expect(options.item(1).textContent).toMatch('Label2');
    expect(options.item(2).textContent).toMatch('Label3');
  });

});
