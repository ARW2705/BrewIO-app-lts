/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockInventoryItem } from '../../../../../../test-config/mock-models';

/* Interface imports */
import { InventoryItem } from '../../../../shared/interfaces';

/* Component imports */
import { InventoryItemDescriptionComponent } from './inventory-item-description.component';


describe('InventoryItemDescriptionComponent', (): void => {
  let fixture: ComponentFixture<InventoryItemDescriptionComponent>;
  let component: InventoryItemDescriptionComponent;
  const _mockInventoryItem: InventoryItem = mockInventoryItem();
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        InventoryItemDescriptionComponent
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(InventoryItemDescriptionComponent);
    component = fixture.componentInstance;
    component.item = _mockInventoryItem;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should render the template', (): void => {
    fixture.detectChanges();

    const label: HTMLElement = global.document.querySelector('ion-label');
    expect(label.textContent).toMatch('Description');
    const description: HTMLElement = global.document.querySelector('p');
    expect(description.textContent).toMatch(_mockInventoryItem.description);
  });

});
