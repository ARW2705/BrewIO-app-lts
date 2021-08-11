/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormControl } from '@angular/forms';
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
    component.ionChangeEvent = (): void => {};
    component.options = mockPreferencesSelectOptions();
    component.control = new FormControl();
    component.label = 'test-name';
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should render the template', (): void => {
    fixture.detectChanges();

    const label: HTMLElement = global.document.querySelector('ion-label');
    expect(label.textContent).toMatch('test-name');
    const options: NodeList = global.document.querySelectorAll('ion-select-option');
    expect(options.item(0).textContent).toMatch('label1');
    expect(options.item(1).textContent).toMatch('label2');
    expect(options.item(2).textContent).toMatch('label3');
  });

});
