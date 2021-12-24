/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockYeastBatch } from '@test/mock-models';

/* Interface imports */
import { YeastBatch } from '@shared/interfaces';

/* Component imports */
import { YeastBatchComponent } from './yeast-batch.component';


describe('YeastBatchComponent', (): void => {
  let fixture: ComponentFixture<YeastBatchComponent>;
  let component: YeastBatchComponent;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ YeastBatchComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(YeastBatchComponent);
    component = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  test('should handle ingredient form modal open', (): void => {
    const _mockYeastBatch: YeastBatch = mockYeastBatch()[0];
    component.openIngredientFormEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.openIngredientFormEvent, 'emit');

    fixture.detectChanges();

    component.openIngredientFormModal(_mockYeastBatch);
    expect(emitSpy).toHaveBeenCalledWith(_mockYeastBatch);
  });

  test('should render the template', (): void => {
    const _mockYeastBatch: YeastBatch[] = mockYeastBatch();
    component.yeastBatch = _mockYeastBatch;

    fixture.detectChanges();

    const yeastBatchElements: NodeList = fixture.nativeElement.querySelectorAll('app-yeast-batch-item');
    expect(yeastBatchElements.length).toEqual(2);
    expect(yeastBatchElements.item(0)['yeast']).toStrictEqual(_mockYeastBatch[0]);
    expect(yeastBatchElements.item(0)['isLast']).toBe(false);
    expect(yeastBatchElements.item(1)['yeast']).toStrictEqual(_mockYeastBatch[1]);
    expect(yeastBatchElements.item(1)['isLast']).toBe(true);
  });

});
