/* Module imorts */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockBatch } from '../../../../../../test-config/mock-models';

/* Interface imports */
import { Batch } from '../../../../shared/interfaces';

/* Component imports */
import { ActiveBatchComponent } from './active-batch.component';


describe('ActiveBatchComponent', () => {
  configureTestBed();
  let component: ActiveBatchComponent;
  let fixture: ComponentFixture<ActiveBatchComponent>;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ ActiveBatchComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ActiveBatchComponent);
    component = fixture.componentInstance;
    component.batch = mockBatch();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should handle a click event', (): void => {
    component.continueButtonEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.continueButtonEvent, 'emit');

    fixture.detectChanges();

    component.onContinueClick();
    expect(emitSpy).toHaveBeenCalled();
  });

  test('should render an active batch list item', (): void => {
    const _mockBatch: Batch = mockBatch();

    fixture.detectChanges();

    const summaryContainer: HTMLElement = fixture.nativeElement.querySelector('.summary-text-container');
    expect(summaryContainer.children[0].textContent.toLowerCase())
      .toMatch(`${_mockBatch.contextInfo.recipeMasterName} • ${_mockBatch.contextInfo.recipeVariantName}`);
    expect(summaryContainer.children[1].textContent.toLowerCase())
      .toMatch(`next step: ${ _mockBatch.process.schedule[_mockBatch.process.currentStep].name.toLowerCase()}`);
    expect(summaryContainer.children[2].textContent).toMatch('Started on Wed, Jan 1');
    const slidingButton: HTMLElement = fixture.nativeElement.querySelector('.sliding-button-container');
    expect(slidingButton.children[1].textContent).toMatch('Continue');
  });

});
