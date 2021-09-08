/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FormControl } from '@angular/forms';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { FormAttributeServiceStub } from '../../../../test-config/service-stubs';

/* Interface imports */
import { FormInputChanges } from '../../shared/interfaces';

/* Service imports */
import { FormAttributeService } from '../../services/services';

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
      providers: [ { provide: FormAttributeService, useClass: FormAttributeServiceStub } ],
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

  test('should handle component changes', (): void => {
    component.ngOnChanges = originalOnChanges;
    const control: FormControl = new FormControl();
    component.control = control;
    component.assignFormChanges = jest.fn();
    component.formAttributeService.handleFormChange = jest.fn();
    const handleSpy: jest.SpyInstance = jest.spyOn(component.formAttributeService, 'handleFormChange');
    const change: SimpleChange = new SimpleChange(null, 'test', false);

    fixture.detectChanges();

    component.ngOnChanges({ label: change });
    expect(handleSpy).toHaveBeenCalledWith('input', control, { label: change });
  });

  test('should assign changes to component', (): void => {
    fixture.detectChanges();

    const control: FormControl = new FormControl();
    const shouldAutocapitalize: boolean = true;
    const shouldAutocomplete: boolean = true;
    const shouldAutocorrect: boolean = true;
    const shouldRequire: boolean = true;
    const shouldSpellcheck: boolean = true;
    const type: string = 'text';
    const changes: FormInputChanges = {
      control             : control,
      shouldAutocapitalize: shouldAutocapitalize,
      shouldAutocomplete  : shouldAutocomplete,
      shouldAutocorrect   : shouldAutocorrect,
      shouldRequire       : shouldRequire,
      shouldSpellcheck    : shouldSpellcheck,
      type                : type
    };
    component.assignFormChanges(changes);
    expect(component.control).toStrictEqual(control);
    expect(component.shouldAutocapitalize).toBe(shouldAutocapitalize);
    expect(component.shouldAutocomplete).toBe(shouldAutocomplete);
    expect(component.shouldAutocorrect).toBe(shouldAutocorrect);
    expect(component.shouldRequire).toBe(shouldRequire);
    expect(component.shouldSpellcheck).toBe(shouldSpellcheck);
    expect(component.type).toMatch(type);
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

  test('should handle input blur event', (): void => {
    component.ionBlurEvent.emit = jest.fn();
    const blurSpy: jest.SpyInstance = jest.spyOn(component.ionBlurEvent, 'emit');
    component.checkForErrors = jest.fn();
    const checkSpy: jest.SpyInstance = jest.spyOn(component, 'checkForErrors');
    const event: CustomEvent = new CustomEvent('test');
    component.showError = true;

    fixture.detectChanges();

    component.onInputBlur(event);
    expect(blurSpy).toHaveBeenCalledWith(event);
    expect(checkSpy).toHaveBeenCalled();
  });

  test('should handle input change event', (): void => {
    component.ionChangeEvent.emit = jest.fn();
    const changeSpy: jest.SpyInstance = jest.spyOn(component.ionChangeEvent, 'emit');
    component.checkForErrors = jest.fn();
    const checkSpy: jest.SpyInstance = jest.spyOn(component, 'checkForErrors');
    const event: CustomEvent = new CustomEvent('test');
    component.showError = true;

    fixture.detectChanges();

    component.onInputChange(event);
    expect(changeSpy).toHaveBeenCalledWith(event);
    expect(checkSpy).toHaveBeenCalled();
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
