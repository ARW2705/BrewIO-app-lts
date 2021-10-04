/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FormControl, ValidationErrors} from '@angular/forms';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { FormAttributeServiceStub } from '../../../../../../test-config/service-stubs';

/* Interface imports */
import { FormTextAreaChanges } from '../../../../shared/interfaces';

/* Service imports */
import { FormAttributeService } from '../../../../services/services';

/* Component imports */
import { FormTextAreaComponent } from './form-text-area.component';


describe('FormTextAreaComponent', (): void => {
  let fixture: ComponentFixture<FormTextAreaComponent>;
  let component: FormTextAreaComponent;
  let originalOnChanges: any;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ FormTextAreaComponent ],
      providers: [ { provide: FormAttributeService, useClass: FormAttributeServiceStub } ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(FormTextAreaComponent);
    component = fixture.componentInstance;
    originalOnChanges = component.ngOnChanges;
    component.ngOnChanges = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
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
    expect(handleSpy).toHaveBeenCalledWith('textarea', control, { label: change });
  });

  test('should assign changes to component', (): void => {
    fixture.detectChanges();

    const control: FormControl = new FormControl();
    const shouldAutocapitalize: boolean = true;
    const shouldRequire: boolean = true;
    const shouldSpellcheck: boolean = true;
    const rows: number = 5;
    const changes: FormTextAreaChanges = {
      control              : control,
      shouldAutocapitalize : shouldAutocapitalize,
      shouldRequire        : shouldRequire,
      shouldSpellcheck     : shouldSpellcheck,
      rows                 : rows
    };
    component.assignFormChanges(changes);
    expect(component.control).toStrictEqual(control);
    expect(component.shouldAutocapitalize).toBe(shouldAutocapitalize);
    expect(component.rows).toBe(rows);
    expect(component.shouldSpellcheck).toBe(shouldSpellcheck);
    expect(component.shouldRequire).toBe(shouldRequire);
  });

  test('should check for errors', (): void => {
    const control: FormControl = new FormControl();
    component.control = control;
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
    const control: FormControl = new FormControl();
    component.control = control;
    component.label = 'label';

    fixture.detectChanges();

    const label: HTMLElement = global.document.querySelector('ion-label');
    expect(label.textContent).toMatch('Label');
    const textarea: HTMLElement = global.document.querySelector('ion-textarea');
    expect(textarea['autocapitalize']).toMatch('off');
    expect(textarea['formControl']).toBe(component.control);
    expect(textarea['spellcheck']).toBe(false);
    const error: HTMLElement = global.document.querySelector('app-form-error');
    expect(error).toBeNull();
    component.overrideTitleCase = true;
    component.label = 'TEST';

    fixture.detectChanges();

    const newLabel: HTMLElement = global.document.querySelector('ion-label');
    expect(newLabel.textContent).toMatch('TEST');
  });

  test('should render the template with an error', (): void => {
    const control: FormControl = new FormControl();
    component.control = control;
    component.formName = 'form';
    component.controlName = 'control';
    component.showError = true;
    component.controlErrors = { maxlength: true };

    fixture.detectChanges();

    const error: HTMLElement = global.document.querySelector('app-form-error');
    expect(error['formName']).toMatch('form');
    expect(error['controlName']).toMatch('control');
    expect(error['controlErrors']).toStrictEqual({ maxlength: true });
  });

});
