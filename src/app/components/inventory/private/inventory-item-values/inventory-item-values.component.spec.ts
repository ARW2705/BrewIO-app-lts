/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockInventoryItem } from '@test/mock-models';
import { FormatStockPipeStub, RoundPipeStub, TruncatePipeStub } from '@test/pipe-stubs';

/* Interface imports */
import { InventoryItem } from '@shared/interfaces';

/* Component imports */
import { InventoryItemValuesComponent } from './inventory-item-values.component';


describe('InventoryItemValuesComponent', (): void => {
  let fixture: ComponentFixture<InventoryItemValuesComponent>;
  let component: InventoryItemValuesComponent;
  const _mockInventoryItem: InventoryItem = mockInventoryItem();
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        InventoryItemValuesComponent,
        FormatStockPipeStub,
        RoundPipeStub,
        TruncatePipeStub
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(InventoryItemValuesComponent);
    component = fixture.componentInstance;
    component.item = _mockInventoryItem;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should render the template with row titles', (): void => {
    fixture.detectChanges();

    const container: Element = global.document.querySelector('ion-grid');
    const titles: HTMLCollection = container.children[0].children[0].children;
    expect(titles.length).toEqual(6);
    expect(titles.item(0).textContent).toMatch('Stock');
    expect(titles.item(1).textContent).toMatch('Type');
    expect(titles.item(2).textContent).toMatch('ABV');
    expect(titles.item(3).textContent).toMatch('IBU');
    expect(titles.item(4).textContent).toMatch('SRM');
    expect(titles.item(5).textContent).toMatch('Added');
  });

  test('should render the template with row values', (): void => {
    FormatStockPipeStub._returnValue = (q: any): string => q.currentQuantity.toString();
    RoundPipeStub._returnValue = (value: number): number => value;
    TruncatePipeStub._returnValue = (value: any): string => value.toString();
    _mockInventoryItem.createdAt = (new Date('2020-01-01T12:00:00')).toISOString();
    fixture.detectChanges();

    const container: Element = global.document.querySelector('ion-grid');
    const values: HTMLCollection = container.children[0].children[1].children;
    expect(values.length).toEqual(6);
    expect(values.item(0).textContent).toMatch(_mockInventoryItem.currentQuantity.toString());
    expect(values.item(1).textContent).toMatch(_mockInventoryItem.currentQuantity.toString());
    expect(values.item(2).textContent).toMatch(`${_mockInventoryItem.itemABV}%`);
    expect(values.item(3).textContent).toMatch(_mockInventoryItem.optionalItemData.itemIBU.toString());
    expect(values.item(4).textContent).toMatch(_mockInventoryItem.optionalItemData.itemSRM.toString());
    expect(values.item(5).textContent).toMatch('Jan/20');
  });

});
