/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Constant imports */
import { FORM_ERROR_MESSAGES } from '../../shared/constants';

/* Component imports */
import { FormErrorComponent } from './form-error.component';


describe('FormErrorComponent', (): void => {
  let fixture: ComponentFixture<FormErrorComponent>;
  let component: FormErrorComponent;
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
    component = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should assemble errors on input changes', (): void => {
    expect(component.errors.length).toEqual(0);
    component.controlErrors = {
      required: true,
      min: true
    };
    component.controlName = 'quantity';
    component.formName = 'ingredient';
    component.ngOnChanges();

    fixture.detectChanges();

    const ingredientErrors: NodeList = fixture.nativeElement.querySelectorAll('.form-error');
    const requiredText: string = FORM_ERROR_MESSAGES['ingredient']['quantity']['required'];
    const minText: string = FORM_ERROR_MESSAGES['ingredient']['quantity']['min'];
    expect(ingredientErrors.item(0).textContent).toMatch(requiredText);
    expect(ingredientErrors.item(1).textContent).toMatch(minText);
    expect(component.errors).toStrictEqual([ requiredText, minText ]);
    component.controlErrors = {
      required: true,
      passwordInvalid: true
    };
    component.controlName = 'password';
    component.formName = 'signup';
    component.ngOnChanges();

    fixture.detectChanges();

    const signupErrors: NodeList = fixture.nativeElement.querySelectorAll('.form-error');
    const requiredPasswordText: string = FORM_ERROR_MESSAGES['signup']['password']['required'];
    const passwordInvalidText: string = FORM_ERROR_MESSAGES['signup']['password']['passwordInvalid'];
    expect(signupErrors.item(0).textContent).toMatch(requiredPasswordText);
    expect(signupErrors.item(1).textContent).toMatch(passwordInvalidText);
    expect(component.errors).toStrictEqual([ requiredPasswordText, passwordInvalidText ]);
  });

});
