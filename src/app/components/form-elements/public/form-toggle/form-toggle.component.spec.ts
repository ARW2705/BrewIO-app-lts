/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Component imports */
import { FormToggleComponent } from './form-toggle.component';


describe('FormToggleComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<FormToggleComponent>;
  let component: FormToggleComponent;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ FormToggleComponent ],
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
    fixture = TestBed.createComponent(FormToggleComponent);
    component = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should handle toggle click', (): void => {
    component.toggleEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.toggleEvent, 'emit');

    fixture.detectChanges();

    const event: CustomEvent = new CustomEvent('test');
    component.onToggle(event);
    expect(emitSpy).toHaveBeenCalledWith(event);
  });

  test('should render the component', (): void => {
    component.toggleName = 'toggle';
    component.toggleAdditionalName = 'additional';
    component.control = new FormControl();

    fixture.detectChanges();

    const spans: NodeList = fixture.nativeElement.querySelectorAll('span');
    expect(spans.item(0).textContent).toMatch('Toggle');
    expect(spans.item(1).textContent).toMatch('Additional');
    const toggle: HTMLElement = fixture.nativeElement.querySelector('ion-toggle');
    expect(toggle['color']).toMatch('primary');
  });

});
