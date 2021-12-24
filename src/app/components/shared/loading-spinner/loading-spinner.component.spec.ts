/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test bed configuration import */
import { configureTestBed } from '@test/configure-test-bed';

/* Component imports */
import { LoadingSpinnerComponent } from './loading-spinner.component';


describe('LoadingSpinnerComponent', () => {
  configureTestBed();
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ LoadingSpinnerComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    component.loadingMessage = 'loading';
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should render the template', (): void => {
    fixture.detectChanges();

    const label: HTMLElement = global.document.querySelector('span');
    expect(label.textContent).toMatch('Loading');
    const spinner: HTMLElement = global.document.querySelector('ion-spinner');
    expect(spinner.getAttribute('name')).toMatch('circular');
  });

});
