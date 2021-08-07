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
import { PreferencesToggleComponent } from './preferences-toggle.component';


describe('PreferencesToggleComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<PreferencesToggleComponent>;
  let component: PreferencesToggleComponent;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ PreferencesToggleComponent ],
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
    fixture = TestBed.createComponent(PreferencesToggleComponent);
    component = fixture.componentInstance;
    component.control = new FormControl();
    component.preferenceName = 'test-name';
    component.preferenceUnit = 'test-unit';
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should handle toggle event', (): void => {
    component.toggleEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.toggleEvent, 'emit');

    fixture.detectChanges();

    component.onToggle(null);
    expect(emitSpy).toHaveBeenCalled();
  });

  test('should render the component', (): void => {
    component.onToggle = jest.fn();
    const toggleSpy: jest.SpyInstance = jest.spyOn(component, 'onToggle');

    fixture.detectChanges();

    const labels: NodeList = global.document.querySelectorAll('span');
    expect(labels.item(0).textContent).toMatch('test-name');
    expect(labels.item(1).textContent).toMatch('Test-unit');
    const toggle: HTMLElement = global.document.querySelector('ion-toggle');
    toggle.dispatchEvent(new Event('ionChange'));
    expect(toggleSpy).toHaveBeenCalled();
  });

});
