/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FormControl } from '@angular/forms';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Component imports */
import { FormInputComponent } from './form-input.component';


describe('FormInputComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<FormInputComponent>;
  let component: FormInputComponent;
  let originalOnChanges: any;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ FormInputComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(FormInputComponent);
    component = fixture.componentInstance;
    originalOnChanges = component.ngOnChanges;
    component.ngOnChanges = jest.fn();
    component.ngOnChanges = originalOnChanges;
    component.control = new FormControl();
    component.controlName = 'control';
    component.formName = 'form';
    component.label = 'label';
    component.shouldAutocapitalize = false;
    component.shouldAutocomplete = false;
    component.shouldAutocorrect = false;
    component.shouldRequire = false;
    component.shouldSpellcheck = false;
    component.type = 'text';
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  test('should handle default changes', (): void => {
    component.ngOnChanges = originalOnChanges;
    component.control = undefined
    component.shouldAutocapitalize = undefined;
    component.shouldAutocomplete = undefined;
    component.shouldAutocorrect = undefined;
    component.shouldRequire = undefined;
    component.shouldSpellcheck = undefined;
    component.type = undefined;
    const setSpy: jest.SpyInstance = jest.spyOn(component, 'setDefault');

    fixture.detectChanges();

    const defaultChange: SimpleChange = new SimpleChange({}, {}, true);
    component.ngOnChanges({ test: defaultChange });
    expect(setSpy).toHaveBeenCalledTimes(7);
    for (let i = 0; i < 7; i++) {
      expect(setSpy.mock.calls[i][0]).toMatch(component.requiredPropertyKeys[i]);
    }
  });

  test('should set form control value on first change', (): void => {
    fixture.detectChanges();

    const valueChange: SimpleChange = new SimpleChange('prev', 'curr', true);
    component.ngOnChanges({ value: valueChange });
    expect(component.control.value).toMatch('curr');
  });

  test('should check for errors', (): void => {
    const formError: ValidationErrors = { maxlength: true };
    component.control.setErrors(formError);
    component.control.markAsTouched();

    fixture.detectChanges();

    component.checkForErrors();
    expect(component.controlErrors).toStrictEqual(formError);
    expect(component.showError).toBe(true);
  });

  test('should handle input change', (): void => {
    component.checkForErrors = jest.fn();
    const checkSpy: jest.SpyInstance = jest.spyOn(component, 'checkForErrors');
    component.showError = false;

    fixture.detectChanges();

    component.onInputChange();
    expect(checkSpy).not.toHaveBeenCalled();
    component.showError = true;
    component.onInputChange();
    expect(checkSpy).toHaveBeenCalled();
  });

  test('should handle input blur', (): void => {
    component.checkForErrors = jest.fn();
    const checkSpy: jest.SpyInstance = jest.spyOn(component, 'checkForErrors');

    fixture.detectChanges();

    component.onInputBlur();
    expect(checkSpy).toHaveBeenCalled();
  });

  test('should set default value', (): void => {
    component.control = undefined
    component.shouldAutocapitalize = undefined;
    component.shouldAutocomplete = undefined;
    component.shouldAutocorrect = undefined;
    component.shouldRequire = undefined;
    component.shouldSpellcheck = undefined;
    component.type = undefined;

    fixture.detectChanges();

    component.setDefault('none');
    expect(component.control).toBeUndefined();
    expect(component.shouldAutocapitalize).toBeUndefined();
    expect(component.shouldAutocomplete).toBeUndefined();
    expect(component.shouldAutocorrect).toBeUndefined();
    expect(component.shouldRequire).toBeUndefined();
    expect(component.shouldSpellcheck).toBeUndefined();
    expect(component.type).toBeUndefined();
    component.setDefault('shouldAutocapitalize');
    expect(component.shouldAutocapitalize).toBe(false);
    component.setDefault('shouldAutocomplete');
    expect(component.shouldAutocomplete).toBe(false);
    component.setDefault('shouldAutocorrect');
    expect(component.shouldAutocorrect).toBe(false);
    component.setDefault('control');
    expect(component.control).toBeDefined();
    expect(component.control instanceof FormControl).toBe(true);
    component.setDefault('shouldRequire');
    expect(component.shouldRequire).toBe(false);
    component.setDefault('shouldSpellcheck');
    expect(component.shouldSpellcheck).toBe(false);
    component.setDefault('type');
    expect(component.type).toBe('text');
  });

  test('should render the template without an error', (): void => {
    fixture.detectChanges();

    const label: HTMLElement = global.document.querySelector('ion-label');
    expect(label.textContent).toMatch('Label');
    const input: HTMLElement = global.document.querySelector('ion-input');
    expect(input['autocapitalize']).toMatch('off');
    expect(input['autocomplete']).toMatch('off');
    expect(input['autocorrect']).toMatch('off');
    expect(input['formControl']).toBe(component.control);
    expect(input['spellcheck']).toBe(false);
    expect(input['type']).toMatch('text');
    const error: HTMLElement = global.document.querySelector('app-form-error');
    expect(error).toBeNull();
  });

  test('should render the template with an error', (): void => {
    component.showError = true;
    component.controlErrors = { maxlength: true };

    fixture.detectChanges();

    const error: HTMLElement = global.document.querySelector('app-form-error');
    expect(error['formName']).toMatch('form');
    expect(error['controlName']).toMatch('control');
    expect(error['controlErrors']).toStrictEqual({ maxlength: true });
  });

});
