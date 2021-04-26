/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Constant imports */
import { FORM_ERROR_MESSAGES } from '../../shared/constants/form-error-messages';

/* Component imports */
import { FormErrorComponent } from './form-error.component';


describe('FormErrorComponent', (): void => {
  let fixture: ComponentFixture<FormErrorComponent>;
  let formErrorCmp: FormErrorComponent;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ FormErrorComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(FormErrorComponent);
    formErrorCmp = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(formErrorCmp).toBeDefined();
  });

  test('should assemble errors on input changes', (): void => {
    expect(formErrorCmp.errors.length).toEqual(0);

    formErrorCmp.controlErrors = {
      required: true,
      min: true
    };
    formErrorCmp.controlName = 'quantity';
    formErrorCmp.formName = 'ingredient';

    formErrorCmp.ngOnChanges();

    fixture.detectChanges();
    const ingredientErrors: NodeList = fixture.nativeElement.querySelectorAll('.form-error');
    const requiredText: string = FORM_ERROR_MESSAGES['ingredient']['quantity']['required'];
    const minText: string = FORM_ERROR_MESSAGES['ingredient']['quantity']['min'];

    expect(ingredientErrors.item(0).textContent).toMatch(requiredText);
    expect(ingredientErrors.item(1).textContent).toMatch(minText);
    expect(formErrorCmp.errors).toStrictEqual([ requiredText, minText ]);

    formErrorCmp.controlErrors = {
      required: true,
      passwordInvalid: true
    };
    formErrorCmp.controlName = 'password';
    formErrorCmp.formName = 'signup';

    formErrorCmp.ngOnChanges();

    fixture.detectChanges();
    const signupErrors: NodeList = fixture.nativeElement.querySelectorAll('.form-error');
    const requiredPasswordText: string = FORM_ERROR_MESSAGES['signup']['password']['required'];
    const passwordInvalidText: string = FORM_ERROR_MESSAGES['signup']['password']['passwordInvalid'];

    expect(signupErrors.item(0).textContent).toMatch(requiredPasswordText);
    expect(signupErrors.item(1).textContent).toMatch(passwordInvalidText);
    expect(formErrorCmp.errors).toStrictEqual([ requiredPasswordText, passwordInvalidText ]);
  });

});
