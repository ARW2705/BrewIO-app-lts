/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ComponentFixture, TestBed } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { UnitConversionPipeStub } from '@test/pipe-stubs';

/* Component imports */
import { ProcessDescriptionComponent } from './process-description.component';


describe('ProcessDescriptionComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<ProcessDescriptionComponent>;
  let component: ProcessDescriptionComponent;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        ProcessDescriptionComponent,
        UnitConversionPipeStub
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ProcessDescriptionComponent);
    component = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  test('should set a default message if no description', (): void => {
    component.description = undefined;

    fixture.detectChanges();

    component.ngOnChanges();
    expect(component.description).toMatch('Description not available');
  });

  test('should render the template', (): void => {
    const testDescription: string = 'test description';
    component.description = testDescription;
    component.isDropDown = true;
    UnitConversionPipeStub._returnValue = (value: any): any => value;
    const pipeSpy: jest.SpyInstance = jest.spyOn(UnitConversionPipeStub, '_returnValue');

    fixture.detectChanges();

    component.ngOnChanges();
    const container: HTMLElement = fixture.debugElement.query(By.css('.drop-down')).nativeElement;
    expect(container.classList).toContain('drop-down');
    const description: HTMLElement = fixture.nativeElement.querySelector('p');
    expect(description.textContent).toMatch(testDescription);
    expect(pipeSpy).toHaveBeenCalled();
  });

});
