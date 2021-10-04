/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockInventoryItem } from '../../../../../../test-config/mock-models';
import { FormatStockPipeStub, RoundPipeStub, TruncatePipeStub } from '../../../../../../test-config/pipe-stubs';

/* Interface imports */
import { InventoryItem } from '../../../../shared/interfaces';

/* Component imports */
import { InventorySliderComponent } from './inventory-slider.component';


describe('InventorySliderComponent', (): void => {
  let fixture: ComponentFixture<InventorySliderComponent>;
  let component: InventorySliderComponent;
  const _mockInventoryItem: InventoryItem = mockInventoryItem();
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        InventorySliderComponent,
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
    fixture = TestBed.createComponent(InventorySliderComponent);
    component = fixture.componentInstance;
    component.item = _mockInventoryItem;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should emit open inventory form modal event', (): void => {
    component.inventoryFormEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.inventoryFormEvent, 'emit');

    fixture.detectChanges();

    component.openInventoryFormModal();
    expect(emitSpy).toHaveBeenCalled();
  });

  test('should emit open expand item event', (): void => {
    component.expandItemEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.expandItemEvent, 'emit');

    fixture.detectChanges();

    component.expandItem();
    expect(emitSpy).toHaveBeenCalled();
  });

  test('should emit open decrement count event', (): void => {
    component.decrementCountEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.decrementCountEvent, 'emit');

    fixture.detectChanges();

    component.decrementCount();
    expect(emitSpy).toHaveBeenCalled();
  });

  test('should render the template', (): void => {
    fixture.detectChanges();

    const leftOption: HTMLElement = global.document.querySelector('ion-item-options');
    expect(leftOption.children[0].textContent).toMatch('Edit');
    expect(leftOption.children[0].children[0].getAttribute('name')).toMatch('menu');
    const rightOption: HTMLElement = <HTMLElement>global.document.querySelectorAll('ion-item-options')[1];
    expect(rightOption.children[0].textContent).toMatch('Enjoy');
    expect(rightOption.children[0].children[0].getAttribute('name')).toMatch('beer');
    const mainItem: HTMLElement = global.document.querySelector('ion-item');
    expect(mainItem.children[0].textContent.toLowerCase()).toMatch(`${_mockInventoryItem.itemName.toLowerCase()} | ${_mockInventoryItem.optionalItemData.itemSubname.toLowerCase()}`);
  });

});
