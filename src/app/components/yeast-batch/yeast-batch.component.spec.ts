/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockYeastBatch } from '../../../../test-config/mock-models';

/* Interface imports */
import { YeastBatch } from '../../shared/interfaces/yeast-batch';

/* Component imports */
import { YeastBatchComponent } from './yeast-batch.component';


describe('YeastBatchComponent', (): void => {
  let fixture: ComponentFixture<YeastBatchComponent>;
  let ybCmp: YeastBatchComponent;
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
    ybCmp = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(ybCmp).toBeDefined();
  });

  test('should handle ingredient form modal open', (): void => {
    const _mockYeastBatch: YeastBatch = mockYeastBatch()[0];

    ybCmp.onRecipeAction = jest
      .fn();

    const actionSpy: jest.SpyInstance = jest.spyOn(ybCmp, 'onRecipeAction');

    fixture.detectChanges();

    ybCmp.openIngredientFormModal(_mockYeastBatch);

    expect(actionSpy).toHaveBeenCalledWith('openIngredientFormModal', ['yeast', _mockYeastBatch]);
  });

  test('should render the template', (): void => {
    const _mockYeastBatch: YeastBatch[] = mockYeastBatch();

    ybCmp.yeastBatch = _mockYeastBatch;

    fixture.detectChanges();

    const yeastBatchElements: NodeList = fixture.nativeElement.querySelectorAll('.ingredient-text-container');

    expect(yeastBatchElements.length).toEqual(2);

    const yeastBatchElem: HTMLElement = <HTMLElement>yeastBatchElements.item(0);

    const yeastBatchElemTopRowTopCol: Element = yeastBatchElem.children[0].children[0];
    expect(yeastBatchElemTopRowTopCol.textContent).toMatch(_mockYeastBatch[0].yeastType.name);
    const yeastBatchElemTopRowBottomCol: Element = yeastBatchElem.children[0].children[1];
    expect(yeastBatchElemTopRowBottomCol.textContent).toMatch(_mockYeastBatch[0].quantity.toString());

    const yeastBatchElemBottomRowTopCol: Element = yeastBatchElem.children[1].children[0];
    expect(yeastBatchElemBottomRowTopCol.textContent).toMatch('Liquid');
    const yeastBatchElemBottomRowBottomCol: Element = yeastBatchElem.children[1].children[1];
    expect(yeastBatchElemBottomRowBottomCol.textContent).toMatch('Starter Not Required');
  });

});
