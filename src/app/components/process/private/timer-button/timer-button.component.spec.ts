/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Component imports */
import { TimerButtonComponent } from './timer-button.component';


describe('TimerButtonComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<TimerButtonComponent>;
  let component: TimerButtonComponent;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        TimerButtonComponent
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(TimerButtonComponent);
    component = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  test('should handle button click', (): void => {
    component.timerClickEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.timerClickEvent, 'emit');

    fixture.detectChanges();

    component.onClick();
    expect(emitSpy).toHaveBeenCalled();
  });

  test('should render the template', (): void => {
    component.buttonText = 'test text';
    component.buttonColor = 'primary';

    fixture.detectChanges();

    const button: HTMLElement = global.document.querySelector('ion-button');
    expect(button.textContent).toMatch('test text');
    expect(button['color']).toMatch('primary');
  });

});
