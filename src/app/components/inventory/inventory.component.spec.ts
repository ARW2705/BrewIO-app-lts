/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockBatch } from '../../../../test-config/mock-models/mock-batch';
import { mockInventoryItem } from '../../../../test-config/mock-models/mock-inventory';
import { AccordionComponentStub } from '../../../../test-config/component-stubs/accordion-stub.component';
import { EventServiceMock, ImageServiceMock, InventoryServiceMock, ProcessServiceMock, ToastServiceMock } from '../../../../test-config/mocks-app';
import { ModalControllerMock, ModalMock } from '../../../../test-config/mocks-ionic';
import { FormatStockPipeMock } from '../../../../test-config/mock-pipes/mock-format-pipe';
import { RoundPipeMock } from '../../../../test-config/mock-pipes/mock-round-pipe';
import { TruncatePipeMock } from '../../../../test-config/mock-pipes/mock-truncate-pipe';

/* Interface imports */
import { Batch } from '../../shared/interfaces/batch';
import { InventoryItem } from '../../shared/interfaces/inventory-item';

/* Service imports */
import { EventService } from '../../services/event/event.service';
import { ImageService } from '../../services/image/image.service';
import { InventoryService } from '../../services/inventory/inventory.service';
import { ProcessService } from '../../services/process/process.service';
import { ToastService } from '../../services/toast/toast.service';

/* Component imports */
import { InventoryComponent } from './inventory.component';


describe('IngredientListComponent', (): void => {
  let fixture: ComponentFixture<InventoryComponent>;
  let inventoryCmp: InventoryComponent;
  let originalOnInit: any;
  let originalOnDestroy: any;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        InventoryComponent,
        FormatStockPipeMock,
        RoundPipeMock,
        TruncatePipeMock,
        AccordionComponentStub
      ],
      providers: [
        { provide: EventService, useClass: EventServiceMock },
        { provide: ImageService, useClass: ImageServiceMock },
        { provide: InventoryService, useClass: InventoryServiceMock },
        { provide: ModalController, useClass: ModalControllerMock },
        { provide: ProcessService, useClass: ProcessServiceMock },
        { provide: ToastService, useClass: ToastServiceMock }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(InventoryComponent);
    inventoryCmp = fixture.componentInstance;
    originalOnInit = inventoryCmp.ngOnInit;
    originalOnDestroy = inventoryCmp.ngOnDestroy;
    inventoryCmp.ngOnInit = jest
      .fn();
    inventoryCmp.ngOnDestroy = jest
      .fn();
    inventoryCmp.toastService.presentToast = jest
      .fn();
    inventoryCmp.toastService.presentErrorToast = jest
      .fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(inventoryCmp).toBeDefined();
  });

  describe('Lifecycle', (): void => {

    test('should init the component', (): void => {
      inventoryCmp.ngOnInit = originalOnInit;

      inventoryCmp.loadInventoryList = jest
        .fn();

      const loadSpy: jest.SpyInstance = jest.spyOn(inventoryCmp, 'loadInventoryList');

      fixture.detectChanges();

      inventoryCmp.ngOnInit();

      expect(loadSpy).toHaveBeenCalled();
    });

    test('should handle input changes', (): void => {
      const _mockBatch: Batch = mockBatch();

      inventoryCmp.optionalData = _mockBatch;

      inventoryCmp.openInventoryFormModal = jest
        .fn();

      const openSpy: jest.SpyInstance = jest.spyOn(inventoryCmp, 'openInventoryFormModal');

      fixture.detectChanges();

      inventoryCmp.ngOnChanges();

      expect(openSpy).toHaveBeenCalledWith({ batch: _mockBatch });
    });

    test('should handle component destroy', (): void => {
      const nextSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.destroy$, 'next');
      const completeSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.destroy$, 'complete');

      inventoryCmp.ngOnDestroy = originalOnDestroy;

      fixture.detectChanges();

      inventoryCmp.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalledWith(true);
      expect(completeSpy).toHaveBeenCalled();
    });

  });


  describe('Display Methods', (): void => {

    test('should expand an item', (): void => {
      const mockElement: HTMLElement = global.document.createElement('div');

      global.document.getElementById = jest
        .fn()
        .mockReturnValue(mockElement);

      inventoryCmp.event.emit = jest
        .fn();

      const emitSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.event, 'emit');

      fixture.detectChanges();

      inventoryCmp.expandItem(1);
      expect(emitSpy).toHaveBeenCalled();
      expect(inventoryCmp.itemIndex).toEqual(1);

      inventoryCmp.expandItem(1);
      expect(emitSpy).toHaveBeenCalledTimes(1);
      expect(inventoryCmp.itemIndex).toEqual(-1);
    });

    test('should handle image error event', (): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();

      inventoryCmp.imageService.handleImageError = jest
        .fn();

      const imageSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.imageService, 'handleImageError');

      fixture.detectChanges();

      inventoryCmp.onImageError('itemLabelImage', _mockInventoryItem);

      expect(imageSpy).toHaveBeenCalledWith(_mockInventoryItem.optionalItemData.itemLabelImage);
    });

    test('should reset the displayed list', (): void => {
      inventoryCmp.sortBySource = jest
        .fn();

      inventoryCmp.sortByRemaining = jest
        .fn();

      inventoryCmp.sortByAlphabetical = jest
        .fn();

      const sbsSpy: jest.SpyInstance = jest.spyOn(inventoryCmp, 'sortBySource');
      const sbrSpy: jest.SpyInstance = jest.spyOn(inventoryCmp, 'sortByRemaining');
      const sbaSpy: jest.SpyInstance = jest.spyOn(inventoryCmp, 'sortByAlphabetical');

      fixture.detectChanges();

      inventoryCmp.resetDisplayList();

      expect(sbsSpy).not.toHaveBeenCalled();
      expect(sbrSpy).not.toHaveBeenCalled();
      expect(sbaSpy).toHaveBeenCalled();
      expect(inventoryCmp.refreshPipes).toBe(true);

      inventoryCmp.sortBy = 'source';

      inventoryCmp.resetDisplayList();

      expect(sbsSpy).toHaveBeenCalled();
      expect(sbrSpy).not.toHaveBeenCalled();
      expect(sbaSpy).toHaveBeenCalledTimes(1);
      expect(inventoryCmp.refreshPipes).toBe(false);

      inventoryCmp.sortBy = 'remaining';

      inventoryCmp.resetDisplayList();

      expect(sbsSpy).toHaveBeenCalledTimes(1);
      expect(sbrSpy).toHaveBeenCalled();
      expect(sbaSpy).toHaveBeenCalledTimes(1);
      expect(inventoryCmp.refreshPipes).toBe(true);
    });

  });


  describe('Inventory Actions', (): void => {

    test('should handle creating an item', (done: jest.DoneCallback): void => {
      inventoryCmp.inventoryService.createItem = jest
        .fn()
        .mockReturnValue(of({}));

      const createSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.inventoryService, 'createItem');
      const toastSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.toastService, 'presentToast');

      fixture.detectChanges();

      inventoryCmp.createItem({ test: true });

      setTimeout((): void => {
        expect(createSpy).toHaveBeenCalledWith({ test: true });
        expect(toastSpy).toHaveBeenCalledWith(
          'Added new item to inventory!',
          1500
        );
        done();
      }, 10);
    });

    test('should get an error handling creating an item', (done: jest.DoneCallback): void => {
      inventoryCmp.inventoryService.createItem = jest
        .fn()
        .mockReturnValue(throwError('test-error'));

      const createSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.inventoryService, 'createItem');
      const toastSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.toastService, 'presentErrorToast');

      fixture.detectChanges();

      inventoryCmp.createItem({ test: true });

      setTimeout((): void => {
        expect(createSpy).toHaveBeenCalledWith({ test: true });
        expect(toastSpy).toHaveBeenCalledWith('Failed to add inventory item');
        done();
      }, 10);
    });

    test('should decrement the inventory item count', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      _mockInventoryItem.currentQuantity = 2;

      inventoryCmp.inventoryService.updateItem = jest
        .fn()
        .mockReturnValueOnce(of(_mockInventoryItem))
        .mockReturnValueOnce(of(null));

      const toastSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.toastService, 'presentToast');

      fixture.detectChanges();

      inventoryCmp.decrementCount(_mockInventoryItem);
      inventoryCmp.decrementCount(_mockInventoryItem);

      setTimeout((): void => {
        expect(toastSpy.mock.calls[0][0]).toMatch(`${_mockInventoryItem.currentQuantity} ${_mockInventoryItem.stockType}s`);
        expect(toastSpy.mock.calls[0][3].length).toEqual(0);
        expect(toastSpy.mock.calls[1][0]).toMatch(`${_mockInventoryItem.itemName} Out of Stock!`);
        expect(toastSpy.mock.calls[1][3]).toMatch('toast-warn');
        done();
      }, 10);
    });

    test('should get an error decrementing item count', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();

      inventoryCmp.inventoryService.updateItem = jest
        .fn()
        .mockReturnValue(throwError('test-error'));

      const toastSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.toastService, 'presentErrorToast');

      fixture.detectChanges();

      inventoryCmp.decrementCount(_mockInventoryItem);

      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith('Failed to decrement item count');
        done();
      }, 10);
    });

    test('should create an item based on given batch', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();

      inventoryCmp.inventoryService.createItemFromBatch = jest
        .fn()
        .mockReturnValue(of({}));

      inventoryCmp.optionalData = _mockBatch;

      const toastSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.toastService, 'presentToast');

      fixture.detectChanges();

      inventoryCmp.createItemFromBatch(_mockBatch, {});

      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith(
          'Added new item to inventory!',
          1500
        );
        expect(inventoryCmp.optionalData).toBeNull();
        done();
      }, 10);
    });

    test('should get an error creating an item based on given batch', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();

      inventoryCmp.inventoryService.createItemFromBatch = jest
        .fn()
        .mockReturnValue(throwError('test-error'));

      inventoryCmp.optionalData = _mockBatch;

      const toastSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.toastService, 'presentErrorToast');

      fixture.detectChanges();

      inventoryCmp.createItemFromBatch(_mockBatch, {});

      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith('Failed to create item from batch');
        done();
      }, 10);
    });

    test('should load the inventory list', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();

      inventoryCmp.inventoryService.getInventoryList = jest
        .fn()
        .mockReturnValue(new BehaviorSubject<InventoryItem[]>([_mockInventoryItem]));

      inventoryCmp.imageService.setInitialURL = jest
        .fn();

      inventoryCmp.resetDisplayList = jest
        .fn();

      const imageSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.imageService, 'setInitialURL');
      const resetSpy: jest.SpyInstance = jest.spyOn(inventoryCmp, 'resetDisplayList');

      fixture.detectChanges();

      expect(inventoryCmp.displayList).toBeNull();

      inventoryCmp.loadInventoryList();

      setTimeout((): void => {
        expect(inventoryCmp.displayList).toStrictEqual([_mockInventoryItem]);
        expect(imageSpy).toHaveBeenCalledTimes(2);
        expect(resetSpy).toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should get an error loading inventory list', (done: jest.DoneCallback): void => {
      inventoryCmp.inventoryService.getInventoryList = jest
        .fn()
        .mockReturnValue(throwError('test-error'));

      const toastSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.toastService, 'presentErrorToast');

      fixture.detectChanges();

      inventoryCmp.loadInventoryList();

      setTimeout((): void => {
        expect(inventoryCmp.displayList).toBeNull();
        expect(toastSpy).toHaveBeenCalledWith('Error loading inventory');
        done();
      }, 10);
    });

    test('should handle updating an item', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();

      inventoryCmp.inventoryService.updateItem = jest
        .fn()
        .mockReturnValue(of({}));

      const toastSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.toastService, 'presentToast');

      fixture.detectChanges();

      inventoryCmp.updateItem(_mockInventoryItem, {});

      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith('Updated item', 2000);
        done();
      }, 10);
    });

    test('should get an error handling an item update', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();

      inventoryCmp.inventoryService.updateItem = jest
        .fn()
        .mockReturnValue(throwError('test-error'));

      const toastSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.toastService, 'presentErrorToast');

      fixture.detectChanges();

      inventoryCmp.updateItem(_mockInventoryItem, {});

      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith('Failed to update item');
        done();
      }, 10);
    });

    test('should handle removing an item', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();

      inventoryCmp.inventoryService.removeItem = jest
        .fn()
        .mockReturnValue(of({}));

      const toastSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.toastService, 'presentErrorToast');

      fixture.detectChanges();

      inventoryCmp.removeItem(_mockInventoryItem.cid);

      setTimeout((): void => {
        expect(toastSpy).not.toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should get an error handling an item removal', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();

      inventoryCmp.inventoryService.removeItem = jest
        .fn()
        .mockReturnValue(throwError('test-error'));

      const toastSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.toastService, 'presentErrorToast');

      fixture.detectChanges();

      inventoryCmp.removeItem(_mockInventoryItem.cid);

      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith('Failed to remove item');
        done();
      }, 10);
    });

  });


  describe('Modals', (): void => {

    test('should open the inventory form modal with batch', (done: jest.DoneCallback): void => {
      const _mockModal: ModalMock = new ModalMock();
      const _mockBatch: Batch = mockBatch();

      inventoryCmp.modalCtrl.create = jest
        .fn()
        .mockReturnValue(Promise.resolve(_mockModal));

      _mockModal.onDidDismiss = jest
        .fn()
        .mockReturnValue(Promise.resolve({ data: {} }));

      inventoryCmp.createItemFromBatch = jest
        .fn();

      const createSpy: jest.SpyInstance = jest.spyOn(inventoryCmp, 'createItemFromBatch');

      fixture.detectChanges();

      inventoryCmp.openInventoryFormModal({ batch: _mockBatch });

      _mockModal.onDidDismiss();

      setTimeout((): void => {
        expect(createSpy).toHaveBeenCalledWith(_mockBatch, {});
        done();
      });
    });

    test('should open the inventory form modal with item', (done: jest.DoneCallback): void => {
      const _mockModal: ModalMock = new ModalMock();
      const _mockInventoryItem: InventoryItem = mockInventoryItem();

      inventoryCmp.modalCtrl.create = jest
        .fn()
        .mockReturnValue(Promise.resolve(_mockModal));

      _mockModal.onDidDismiss = jest
        .fn()
        .mockReturnValue(Promise.resolve({ data: {} }));

      inventoryCmp.updateItem = jest
        .fn();

      const updateSpy: jest.SpyInstance = jest.spyOn(inventoryCmp, 'updateItem');

      fixture.detectChanges();

      inventoryCmp.openInventoryFormModal({ item: _mockInventoryItem });

      _mockModal.onDidDismiss();

      setTimeout((): void => {
        expect(updateSpy).toHaveBeenCalledWith(_mockInventoryItem, {});
        done();
      });
    });

    test('should open the inventory form modal with no options', (done: jest.DoneCallback): void => {
      const _mockModal: any = new ModalMock();

      inventoryCmp.modalCtrl.create = jest
        .fn()
        .mockReturnValue(Promise.resolve(_mockModal));

      _mockModal.onDidDismiss = jest
        .fn()
        .mockReturnValue(Promise.resolve({ data: { test: true } }));

      inventoryCmp.createItem = jest
        .fn();

      const createSpy: jest.SpyInstance = jest.spyOn(inventoryCmp, 'createItem');

      fixture.detectChanges();

      inventoryCmp.openInventoryFormModal({});

      _mockModal.onDidDismiss();

      setTimeout((): void => {
        expect(createSpy).toHaveBeenCalledWith({ test: true });
        done();
      });
    });

    test('should handle error response from modal', (done: jest.DoneCallback): void => {
      const _mockModal: any = new ModalMock();

      inventoryCmp.modalCtrl.create = jest
        .fn()
        .mockReturnValue(Promise.resolve(_mockModal));

      _mockModal.onDidDismiss = jest
        .fn()
        .mockReturnValue(Promise.reject('test-error'));

      const toastSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.toastService, 'presentErrorToast');

      fixture.detectChanges();

      inventoryCmp.openInventoryFormModal({});

      _mockModal.onDidDismiss();

      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith('An error occurred on inventory form exit');
        done();
      }, 10);
    });

  });


  describe('Sorting', (): void => {

    test('should handle sort direction change', (): void => {
      const _mockEvent: CustomEvent = new CustomEvent('test-event', { detail: { value: false } });

      inventoryCmp.resetDisplayList = jest
        .fn();

      fixture.detectChanges();

      expect(inventoryCmp.isAscending).toBe(true);

      inventoryCmp.onDirectionChange(_mockEvent);

      expect(inventoryCmp.isAscending).toBe(false);
    });

    test('should handle sort on change', (): void => {
      const _mockEvent: CustomEvent = new CustomEvent('test-event', { detail: { value: 'source' } });

      inventoryCmp.resetDisplayList = jest
        .fn();

      fixture.detectChanges();

      expect(inventoryCmp.sortBy).toMatch('alphabetical');

      inventoryCmp.onSortChange(_mockEvent);

      expect(inventoryCmp.sortBy).toMatch('source');
    });

    test('should sort items alphabetically by name', (): void => {
      const _mockInventoryItem1: InventoryItem = mockInventoryItem();
      _mockInventoryItem1.itemName = 'abc';
      const _mockInventoryItem2: InventoryItem = mockInventoryItem();
      _mockInventoryItem2.itemName = 'def';
      const _mockInventoryItem3: InventoryItem = mockInventoryItem();
      _mockInventoryItem3.itemName = 'ghi';

      fixture.detectChanges();

      inventoryCmp.displayList = [ _mockInventoryItem1, _mockInventoryItem3, _mockInventoryItem2 ];
      inventoryCmp.isAscending = false;

      inventoryCmp.sortByAlphabetical();

      expect(inventoryCmp.displayList).toStrictEqual([ _mockInventoryItem3, _mockInventoryItem2, _mockInventoryItem1]);

      inventoryCmp.isAscending = true;

      inventoryCmp.sortByAlphabetical();

      expect(inventoryCmp.displayList).toStrictEqual([ _mockInventoryItem1, _mockInventoryItem2, _mockInventoryItem3]);
    });

    test('should sort items by current quantity', (): void => {
      const _mockInventoryItem1: InventoryItem = mockInventoryItem();
      _mockInventoryItem1.currentQuantity = 1;
      const _mockInventoryItem2: InventoryItem = mockInventoryItem();
      _mockInventoryItem2.currentQuantity = 2;
      const _mockInventoryItem3: InventoryItem = mockInventoryItem();
      _mockInventoryItem3.currentQuantity = 3;

      fixture.detectChanges();

      inventoryCmp.displayList = [ _mockInventoryItem1, _mockInventoryItem3, _mockInventoryItem2 ];
      inventoryCmp.isAscending = false;

      inventoryCmp.sortByRemaining();

      expect(inventoryCmp.displayList).toStrictEqual([ _mockInventoryItem3, _mockInventoryItem2, _mockInventoryItem1]);

      inventoryCmp.isAscending = true;

      inventoryCmp.sortByRemaining();

      expect(inventoryCmp.displayList).toStrictEqual([ _mockInventoryItem1, _mockInventoryItem2, _mockInventoryItem3]);
    });

    test('should sort items by source (ascending: self -> other -> third)', (): void => {
      const _mockInventoryItem1: InventoryItem = mockInventoryItem();
      _mockInventoryItem1.sourceType = 'self';
      const _mockInventoryItem2: InventoryItem = mockInventoryItem();
      _mockInventoryItem2.sourceType = 'other';
      const _mockInventoryItem3: InventoryItem = mockInventoryItem();
      _mockInventoryItem3.sourceType = 'third';

      fixture.detectChanges();

      inventoryCmp.displayList = [ _mockInventoryItem1, _mockInventoryItem3, _mockInventoryItem2 ];
      inventoryCmp.isAscending = false;

      inventoryCmp.sortBySource();

      expect(inventoryCmp.displayList).toStrictEqual([ _mockInventoryItem3, _mockInventoryItem2, _mockInventoryItem1]);

      inventoryCmp.isAscending = true;

      inventoryCmp.sortBySource();

      expect(inventoryCmp.displayList).toStrictEqual([ _mockInventoryItem1, _mockInventoryItem2, _mockInventoryItem3]);
    });

  });


  describe('Template Display', (): void => {

    test('should show a spinner if displayList is null', (): void => {
      inventoryCmp.displayList = null;

      fixture.detectChanges();

      const spinner: HTMLElement = fixture.nativeElement.querySelector('.no-items');
      expect(spinner.childNodes.item(0).textContent).toMatch('Loading Inventory');

      const formButton: HTMLElement = fixture.nativeElement.querySelector('.form-button');
      expect(formButton).toBeNull();

      const listOptions: HTMLElement = fixture.nativeElement.querySelector('#search-options-list');
      expect(listOptions).toBeNull();

      const list: HTMLElement = fixture.nativeElement.querySelector('#inventory-list');
      expect(list).toBeNull();
    });

    test('should show add button and no-item message with an empty inventory list', (): void => {
      inventoryCmp.displayList = [];

      fixture.detectChanges();

      const noItemsMessage: HTMLElement = fixture.nativeElement.querySelector('.no-items');
      expect(noItemsMessage.textContent).toMatch('No Items in Inventory');

      const formButton: HTMLElement = fixture.nativeElement.querySelector('.form-button');
      expect(formButton.textContent).toMatch('ADD CUSTOM ITEM');

      const listOptions: HTMLElement = fixture.nativeElement.querySelector('#search-option-list');
      expect(listOptions).toBeNull();

      const list: HTMLElement = fixture.nativeElement.querySelector('#inventory-list');
      expect(list).toBeNull();
    });

    test('should show add button and no-item message with an empty inventory list', (): void => {
      const _mockInventoryItem1: InventoryItem = mockInventoryItem();
      const _mockInventoryItem2: InventoryItem = mockInventoryItem();
      _mockInventoryItem2.itemName = 'Other Name';

      inventoryCmp.displayList = [ _mockInventoryItem1, _mockInventoryItem2 ];

      inventoryCmp.itemIndex = 1;

      fixture.detectChanges();

      const formButton: HTMLElement = fixture.nativeElement.querySelector('.form-button');
      expect(formButton.textContent).toMatch('ADD CUSTOM ITEM');

      const listOptions: HTMLElement = fixture.nativeElement.querySelector('#search-option-list');
      expect(listOptions).not.toBeNull();

      const list: HTMLElement = fixture.nativeElement.querySelector('#inventory-list');
      expect(list).not.toBeNull();
      expect(list.childNodes.length).toEqual(inventoryCmp.displayList.length * 4 - 1);

      const firstSlidingItem: HTMLElement = fixture.nativeElement.querySelectorAll('.inventory-item').item(0);
      const firstNameLabel: HTMLElement = firstSlidingItem.querySelector('.expand-button');
      expect(firstNameLabel.childNodes.item(0).textContent).toMatch(`${_mockInventoryItem1.itemName} | ${_mockInventoryItem1.optionalItemData.itemSubname}`);
      const secondSlidingItem: HTMLElement = fixture.nativeElement.querySelectorAll('.inventory-item').item(1);
      const secondNameLabel: HTMLElement = secondSlidingItem.querySelector('.expand-button');
      expect(secondNameLabel.childNodes.item(0).textContent).toMatch(`${_mockInventoryItem2.itemName} | ${_mockInventoryItem2.optionalItemData.itemSubname}`);
    });

  });

});
