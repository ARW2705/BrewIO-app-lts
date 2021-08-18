/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockInventoryItem } from '../../../../test-config/mock-models';

/* Constant imports */
import { MISSING_IMAGE_URL } from '../../shared/constants';

/* Interface imports */
import { InventoryItem } from '../../shared/interfaces';

/* Component imports */
import { InventoryItemImagesComponent } from './inventory-item-images.component';


describe('InventoryItemImagesComponent', (): void => {
  let fixture: ComponentFixture<InventoryItemImagesComponent>;
  let component: InventoryItemImagesComponent;
  const _mockInventoryItem: InventoryItem = mockInventoryItem();
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        InventoryItemImagesComponent
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(InventoryItemImagesComponent);
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
    const event: CustomEvent = new CustomEvent('image-error');

    fixture.detectChanges();

    component.onImageError('itemLabelImage', event);
    expect(emitSpy).toHaveBeenCalledWith({ imageType: 'itemLabelImage', event });
  });

  test('should render the template with images', (): void => {
    fixture.detectChanges();

    const images: NodeList = global.document.querySelectorAll('ion-img');
    expect(images.length).toEqual(2);
    expect(images.item(0)['src']).toMatch(_mockInventoryItem.optionalItemData.itemLabelImage.url);
    expect(images.item(1)['src']).toMatch(_mockInventoryItem.optionalItemData.supplierLabelImage.url);
  });

  test('should render the template with item that does not have images', (): void => {
    const _mockInventoryItemNoImages: InventoryItem = mockInventoryItem();
    delete _mockInventoryItemNoImages.optionalItemData.itemLabelImage;
    delete _mockInventoryItemNoImages.optionalItemData.supplierLabelImage;
    component.item = _mockInventoryItemNoImages;

    fixture.detectChanges();

    const images: NodeList = global.document.querySelectorAll('ion-img');
    expect(images.length).toEqual(2);
    expect(images.item(0)['src']).toMatch(MISSING_IMAGE_URL);
    expect(images.item(1)['src']).toMatch(MISSING_IMAGE_URL);
  });

});
