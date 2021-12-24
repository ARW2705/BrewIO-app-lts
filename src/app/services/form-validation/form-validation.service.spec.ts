/* Module imports */
import { TestBed, getTestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Provider imports */
import { FormValidationService } from './form-validation.service';


describe('Custom form validator service', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: FormValidationService;

  beforeAll((): void => {
    TestBed.configureTestingModule({
      providers: [ FormValidationService ]
    });
    injector = getTestBed();
    service = injector.get(FormValidationService);
  });


  test('should match password and confirmation', (): void => {
    const formGroup: FormGroup = new FormGroup({
      password: new FormControl('abcDEF123!@#'),
      passwordConfirmation: new FormControl('abcDEF123!@#')
    });
    expect(service.passwordMatch()(formGroup)).toBeNull();
  });

  test('should fail matching: missing confirmation', (): void => {
    const formGroup: FormGroup = new FormGroup({
      password: new FormControl('abcDEF123!@#'),
      passwordConfirmation: new FormControl('')
    });
    service.passwordMatch()(formGroup);
    expect(formGroup.controls.passwordConfirmation.getError('required')).toBe(true);
  });

  test('should fail matching: mismatch', (): void => {
    const formGroup: FormGroup = new FormGroup({
      password: new FormControl('abcDEF123!@#'),
      passwordConfirmation: new FormControl('abc')
    });
    service.passwordMatch()(formGroup);
    expect(formGroup.controls.passwordConfirmation.getError('mismatch')).toBe(true);
  });

  test('should match the required password pattern', (): void => {
    const formControl: FormControl = new FormControl('abcDEF123');
    expect(service.passwordPattern()(formControl)).toBeNull();
  });

  test('should fail to match the required password pattern', (): void => {
    const formControl: FormControl = new FormControl('abcdef123');
    expect(service.passwordPattern()(formControl)).toStrictEqual({ passwordInvalid: true });
  });

  test('should pass eitherOr validation with no additional validators', (): void => {
    const control1: FormControl = new FormControl('');
    const control2: FormControl = new FormControl('5');
    const control3: FormControl = new FormControl('');
    const formGroup: FormGroup = new FormGroup({
      control1: control1,
      control2: control2,
      control3: control3
    });

    service.eitherOr(['control1', 'control2', 'control3'])(formGroup);

    expect(control1.errors).toBeNull();
    expect(control2.errors).toBeNull();
    expect(control3.errors).toBeNull();
  });

  test('should pass eitherOr validation with additional validators', (): void => {
    const control1: FormControl = new FormControl('10');
    const control2: FormControl = new FormControl('5');
    const control3: FormControl = new FormControl('1');
    const formGroup: FormGroup = new FormGroup({
      control1: control1,
      control2: control2,
      control3: control3
    });

    service.eitherOr(['control1', 'control2', 'control3'], { required: true, min: 0 })(formGroup);

    expect(control1.errors).toBeNull();
    expect(control2.errors).toBeNull();
    expect(control3.errors).toBeNull();
  });

  test('should fail eitherOr due to no controls having a value', (): void => {
    const control1: FormControl = new FormControl('');
    const control2: FormControl = new FormControl('');
    const control3: FormControl = new FormControl('');
    const formGroup: FormGroup = new FormGroup({
      control1: control1,
      control2: control2,
      control3: control3
    });

    service.eitherOr(['control1', 'control2', 'control3'])(formGroup);

    expect(control1.errors).toStrictEqual({ eitherOr: true });
    expect(control2.errors).toStrictEqual({ eitherOr: true });
    expect(control3.errors).toStrictEqual({ eitherOr: true });
  });

  test('should fail eitherOr due to failed additional min validation', (): void => {
    const control1: FormControl = new FormControl('0');
    const control2: FormControl = new FormControl('1');
    const control3: FormControl = new FormControl('2');
    const formGroup: FormGroup = new FormGroup({
      control1: control1,
      control2: control2,
      control3: control3
    });

    service.eitherOr(['control1', 'control2', 'control3'], { min: 3 })(formGroup);

    expect(control1.errors).toStrictEqual({ eitherOr: true, min: { min: 3, actual: 0 } });
    expect(control2.errors).toStrictEqual({ eitherOr: true, min: { min: 3, actual: 1 } });
    expect(control3.errors).toStrictEqual({ eitherOr: true, min: { min: 3, actual: 2 } });
  });

  test('should pass required validation if selected as such', (): void => {
    const formControl: FormControl = new FormControl('content');
    service.requiredIfValidator(true)(formControl);
    expect(formControl.errors).toBeNull();
  });

  test('should pass validation if not required', (): void => {
    const formControl: FormControl = new FormControl('');
    service.requiredIfValidator(false)(formControl);
    expect(formControl.errors).toBeNull();
  });

  test('should fail required validation', (): void => {
    const formControl: FormControl = new FormControl(null);
    expect(service.requiredIfValidator(true)(formControl)).toStrictEqual({ required: true });
  });

});
