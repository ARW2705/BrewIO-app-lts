/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockInventoryItem } from '@test/mock-models';

/* Interface imports */
import { InventoryItem } from '@shared/interfaces';

/* Component imports */
import { InventoryItemComponent } from './inventory-item.component';


describe('InventoryItemComponent', (): void => {
  let fixture: ComponentFixture<InventoryItemComponent>;
  let component: InventoryItemComponent;
  const _mockInventoryItem: InventoryItem = mockInventoryItem();
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        InventoryItemComponent
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(InventoryItemComponent);
    component = fixture.componentInstance;
    component.item = _mockInventoryItem;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should emit image error event', (): void => {
    component.imageErrorEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.imageErrorEvent, 'emit');

    fixture.detectChanges();

    component.onImageError(null);
    expect(emitSpy).toHaveBeenCalled();
  });

  test('should render the template', (): void => {
    fixture.detectChanges();

    const values: HTMLElement = global.document.querySelector('app-inventory-item-values');
    expect(values).toBeTruthy();
    expect(values['item']).toStrictEqual(_mockInventoryItem);
    const images: HTMLElement = global.document.querySelector('app-inventory-item-images');
    expect(images).toBeTruthy();
    expect(values['item']).toStrictEqual(_mockInventoryItem);
    const description: HTMLElement = global.document.querySelector('app-inventory-item-description');
    expect(description).toBeTruthy();
    expect(values['item']).toStrictEqual(_mockInventoryItem);
  });

});
