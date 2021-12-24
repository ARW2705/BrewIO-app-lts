/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Component imports */
import { DeleteButtonComponent } from './delete-button.component';


describe('DeleteButtonComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<DeleteButtonComponent>;
  let component: DeleteButtonComponent;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ DeleteButtonComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(DeleteButtonComponent);
    component = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should handle delete button click', (): void => {
    component.deleteEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.deleteEvent, 'emit');

    fixture.detectChanges();

    component.onDeletion();
    expect(emitSpy).toHaveBeenCalled();
  });

  test('should render the template', (): void => {
    fixture.detectChanges();

    const button: HTMLElement = fixture.nativeElement.querySelector('ion-button');
    expect(button.textContent).toMatch('Delete');
  });

});
