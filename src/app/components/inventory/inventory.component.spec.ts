/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockBatch, mockErrorReport, mockInventoryItem } from '../../../../test-config/mock-models';
import { AccordionComponentStub } from '../../../../test-config/component-stubs';
import { AnimationsServiceStub, ErrorReportingServiceStub, EventServiceStub, ImageServiceStub, InventoryServiceStub, ProcessServiceStub, ToastServiceStub } from '../../../../test-config/service-stubs';
import { FormatStockPipeStub, RoundPipeStub, TruncatePipeStub } from '../../../../test-config/pipe-stubs';
import { ModalControllerStub, ModalStub } from '../../../../test-config/ionic-stubs';

/* Interface imports */
import { Batch, ErrorReport, InventoryItem } from '../../shared/interfaces';

/* Service imports */
import { AnimationsService, ErrorReportingService, EventService, ImageService, InventoryService, ProcessService, ToastService } from '../../services/services';

/* Component imports */
import { InventoryComponent } from './inventory.component';


describe('InventoryComponent', (): void => {
  let fixture: ComponentFixture<InventoryComponent>;
  let component: InventoryComponent;
  let originalOnInit: any;
  let originalAfterInit: any;
  let originalOnDestroy: any;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        InventoryComponent,
        FormatStockPipeStub,
        RoundPipeStub,
        TruncatePipeStub,
        AccordionComponentStub
      ],
      providers: [
        { provide: AnimationsService, useClass: AnimationsServiceStub },
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: EventService, useClass: EventServiceStub },
        { provide: ImageService, useClass: ImageServiceStub },
        { provide: InventoryService, useClass: InventoryServiceStub },
        { provide: ModalController, useClass: ModalControllerStub },
        { provide: ProcessService, useClass: ProcessServiceStub },
        { provide: ToastService, useClass: ToastServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(InventoryComponent);
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    originalAfterInit = component.ngAfterViewInit;
    originalOnDestroy = component.ngOnDestroy;
    component.ngOnInit = jest.fn();
    component.ngAfterViewInit = jest.fn();
    component.ngOnDestroy = jest.fn();
    component.toastService.presentToast = jest.fn();
    component.toastService.presentErrorToast = jest.fn();
    component.errorReporter.setErrorReport = jest.fn();
    component.errorReporter.handleUnhandledError = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  describe('Lifecycle', (): void => {

    test('should init the component', (): void => {
      component.ngOnInit = originalOnInit;
      component.loadInventoryList = jest.fn();
      const loadSpy: jest.SpyInstance = jest.spyOn(component, 'loadInventoryList');

      fixture.detectChanges();

      component.ngOnInit();
      expect(loadSpy).toHaveBeenCalled();
    });

    test('should handle input changes', (): void => {
      const _mockBatch: Batch = mockBatch();
      component.optionalData = _mockBatch;
      component.openInventoryFormModal = jest.fn();
      const openSpy: jest.SpyInstance = jest.spyOn(component, 'openInventoryFormModal');

      fixture.detectChanges();

      component.ngOnChanges();
      expect(openSpy).toHaveBeenCalledWith({ batch: _mockBatch });
    });

    test('should handle after view init', (): void => {
      component.ngAfterViewInit = originalAfterInit;
      component.animationService.shouldShowHint = jest.fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      component.runSlidingHints = jest.fn();
      const hintSpy: jest.SpyInstance = jest.spyOn(component.animationService, 'shouldShowHint');
      const runSpy: jest.SpyInstance = jest.spyOn(component, 'runSlidingHints');

      fixture.detectChanges();

      component.ngAfterViewInit();
      expect(runSpy).toHaveBeenCalled();
      expect(runSpy).toHaveBeenCalledTimes(1);
      expect(hintSpy).toHaveBeenCalledTimes(2);
    });

    test('should handle component destroy', (): void => {
      const nextSpy: jest.SpyInstance = jest.spyOn(component.destroy$, 'next');
      const completeSpy: jest.SpyInstance = jest.spyOn(component.destroy$, 'complete');
      component.ngOnDestroy = originalOnDestroy;

      fixture.detectChanges();

      component.ngOnDestroy();
      expect(nextSpy).toHaveBeenCalledWith(true);
      expect(completeSpy).toHaveBeenCalled();
    });

  });


  describe('Display Methods', (): void => {

    test('should expand an item', (): void => {
      const mockElement: HTMLElement = global.document.createElement('div');
      Object.defineProperty(mockElement, 'offsetTop', { writable: false, value: 100 });
      global.document.querySelector = jest.fn()
        .mockReturnValue(mockElement);
      component.event.emit = jest.fn();
      const emitSpy: jest.SpyInstance = jest.spyOn(component.event, 'emit');

      fixture.detectChanges();

      component.expandItem(1);
      expect(emitSpy).toHaveBeenCalled();
      expect(component.itemIndex).toEqual(1);
      component.expandItem(1);
      expect(emitSpy).toHaveBeenCalledTimes(1);
      expect(component.itemIndex).toEqual(-1);
    });

    test('should handle image error event', (): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const _mockImageErrorEvent: { imageType: string, event: CustomEvent } = {
        imageType: 'itemLabelImage',
        event: new CustomEvent('ionError')
      };
      component.imageService.handleImageError = jest.fn();
      const imageSpy: jest.SpyInstance = jest.spyOn(component.imageService, 'handleImageError');

      fixture.detectChanges();

      component.onImageError(_mockInventoryItem, _mockImageErrorEvent);
      expect(imageSpy).toHaveBeenCalledWith(_mockInventoryItem.optionalItemData.itemLabelImage);
    });

    test('should reset the displayed list', (): void => {
      component.sortBySource = jest.fn();
      component.sortByRemaining = jest.fn();
      component.sortByAlphabetical = jest.fn();
      const sbsSpy: jest.SpyInstance = jest.spyOn(component, 'sortBySource');
      const sbrSpy: jest.SpyInstance = jest.spyOn(component, 'sortByRemaining');
      const sbaSpy: jest.SpyInstance = jest.spyOn(component, 'sortByAlphabetical');

      fixture.detectChanges();

      component.resetDisplayList();
      expect(sbsSpy).not.toHaveBeenCalled();
      expect(sbrSpy).not.toHaveBeenCalled();
      expect(sbaSpy).toHaveBeenCalled();
      expect(component.refreshPipes).toBe(true);
      component.sortBy = 'source';
      component.resetDisplayList();
      expect(sbsSpy).toHaveBeenCalled();
      expect(sbrSpy).not.toHaveBeenCalled();
      expect(sbaSpy).toHaveBeenCalledTimes(1);
      expect(component.refreshPipes).toBe(false);
      component.sortBy = 'remaining';
      component.resetDisplayList();
      expect(sbsSpy).toHaveBeenCalledTimes(1);
      expect(sbrSpy).toHaveBeenCalled();
      expect(sbaSpy).toHaveBeenCalledTimes(1);
      expect(component.refreshPipes).toBe(true);
    });

  });


  describe('Inventory Actions', (): void => {

    test('should handle creating an item', (done: jest.DoneCallback): void => {
      component.inventoryService.createItem = jest.fn()
        .mockReturnValue(of({}));
      const createSpy: jest.SpyInstance = jest.spyOn(component.inventoryService, 'createItem');
      const toastSpy: jest.SpyInstance = jest.spyOn(component.toastService, 'presentToast');

      fixture.detectChanges();

      component.createItem({ test: true });
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
      const _mockErrorReport: ErrorReport = mockErrorReport();
      component.inventoryService.createItem = jest.fn()
        .mockReturnValue(throwError('test-error'));
      component.errorReporter.getCustomReportFromError = jest.fn()
        .mockReturnValue(_mockErrorReport);
      const createSpy: jest.SpyInstance = jest.spyOn(component.inventoryService, 'createItem');
      const reportSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'setErrorReport');

      fixture.detectChanges();

      component.createItem({ test: true });
      setTimeout((): void => {
        expect(createSpy).toHaveBeenCalledWith({ test: true });
        expect(reportSpy).toHaveBeenCalledWith(_mockErrorReport);
        done();
      }, 10);
    });

    test('should handle item decrement count routing', (): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      component.inventoryService.isCapacityBased = jest.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      component.openQuantityHelper = jest.fn();
      component.handleItemCountDecrement = jest.fn();
      const openSpy: jest.SpyInstance = jest.spyOn(component, 'openQuantityHelper');
      const handleSpy: jest.SpyInstance = jest.spyOn(component, 'handleItemCountDecrement');

      fixture.detectChanges();

      component.decrementCount(_mockInventoryItem);
      expect(openSpy).toHaveBeenCalledWith(_mockInventoryItem);
      component.decrementCount(_mockInventoryItem);
      expect(handleSpy).toHaveBeenCalledWith(_mockInventoryItem, 1);
    });

    test('should create an item based on given batch', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      component.inventoryService.createItemFromBatch = jest.fn()
        .mockReturnValue(of({}));
      component.optionalData = _mockBatch;
      const toastSpy: jest.SpyInstance = jest.spyOn(component.toastService, 'presentToast');

      fixture.detectChanges();

      component.createItemFromBatch(_mockBatch, {});
      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith(
          'Added new item to inventory!',
          1500
        );
        expect(component.optionalData).toBeNull();
        done();
      }, 10);
    });

    test('should get an error creating an item based on given batch', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockError: Error = new Error('test-error');
      component.inventoryService.createItemFromBatch = jest.fn()
        .mockReturnValue(throwError(_mockError));
      component.optionalData = _mockBatch;
      const errorSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      component.createItemFromBatch(_mockBatch, {});
      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should format a count decrement toast message', (): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      _mockInventoryItem.currentQuantity = 2;
      component.inventoryService.isCapacityBased = jest.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      fixture.detectChanges();

      expect(component.formatDecrementMessage(_mockInventoryItem)).toMatch('2 Pints remaining');
      _mockInventoryItem.currentQuantity--;
      expect(component.formatDecrementMessage(_mockInventoryItem)).toMatch(`1 ${_mockInventoryItem.stockType} remaining`);
      expect(component.formatDecrementMessage(null)).toMatch('Out of Stock!');
    });

    test('should handle decrement the inventory item count', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      _mockInventoryItem.currentQuantity = 2;
      component.inventoryService.updateItem = jest.fn()
        .mockReturnValueOnce(of(_mockInventoryItem))
        .mockReturnValueOnce(of(null))
        .mockReturnValueOnce(of(null));
      component.formatDecrementMessage = jest.fn()
        .mockReturnValue('test-message');
      const toastSpy: jest.SpyInstance = jest.spyOn(component.toastService, 'presentToast');
      const updateSpy: jest.SpyInstance = jest.spyOn(component.inventoryService, 'updateItem');

      fixture.detectChanges();

      component.handleItemCountDecrement(_mockInventoryItem, 1);
      component.handleItemCountDecrement(_mockInventoryItem, 1);
      component.handleItemCountDecrement(_mockInventoryItem, 10);
      setTimeout((): void => {
        expect(toastSpy.mock.calls[0][0]).toMatch('test-message');
        expect(toastSpy.mock.calls[0][3].length).toEqual(0);
        expect(toastSpy.mock.calls[1][0]).toMatch('test-message');
        expect(toastSpy.mock.calls[1][3]).toMatch('toast-warn');
        expect(updateSpy).toHaveBeenNthCalledWith(3, _mockInventoryItem.cid, { currentQuantity: 0 });
        done();
      }, 10);
    });

    test('should get an error decrementing item count', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const _mockError: Error = new Error('test-error');
      component.inventoryService.updateItem = jest.fn()
        .mockReturnValue(throwError(_mockError));
      const errorSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      component.handleItemCountDecrement(_mockInventoryItem, 1);
      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should load the inventory list', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      component.inventoryService.getInventoryList = jest.fn()
        .mockReturnValue(new BehaviorSubject<InventoryItem[]>([_mockInventoryItem]));
      component.imageService.setInitialURL = jest.fn();
      component.resetDisplayList = jest.fn();
      const imageSpy: jest.SpyInstance = jest.spyOn(component.imageService, 'setInitialURL');
      const resetSpy: jest.SpyInstance = jest.spyOn(component, 'resetDisplayList');

      fixture.detectChanges();

      expect(component.displayList).toBeNull();
      component.loadInventoryList();
      setTimeout((): void => {
        expect(component.displayList).toStrictEqual([_mockInventoryItem]);
        expect(imageSpy).toHaveBeenCalledTimes(2);
        expect(resetSpy).toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should get an error loading inventory list', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      component.inventoryService.getInventoryList = jest.fn()
        .mockReturnValue(throwError(_mockError));
      const errorSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      component.loadInventoryList();
      setTimeout((): void => {
        expect(component.displayList).toBeNull();
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should handle updating an item', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      component.inventoryService.updateItem = jest.fn()
        .mockReturnValue(of({}));
      const toastSpy: jest.SpyInstance = jest.spyOn(component.toastService, 'presentToast');

      fixture.detectChanges();

      component.updateItem(_mockInventoryItem, {});
      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith('Updated item', 1500);
        done();
      }, 10);
    });

    test('should get an error handling an item update', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const _mockError: Error = new Error('test-error');
      component.inventoryService.updateItem = jest.fn()
        .mockReturnValue(throwError(_mockError));
      const errorSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      component.updateItem(_mockInventoryItem, {});
      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should handle removing an item', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      component.inventoryService.removeItem = jest.fn()
        .mockReturnValue(of({}));
      const toastSpy: jest.SpyInstance = jest.spyOn(component.toastService, 'presentErrorToast');

      fixture.detectChanges();

      component.removeItem(_mockInventoryItem.cid);
      setTimeout((): void => {
        expect(toastSpy).not.toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should get an error handling an item removal', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const _mockError: Error = new Error('test-error');
      component.inventoryService.removeItem = jest.fn()
        .mockReturnValue(throwError(_mockError));
      const errorSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      component.removeItem(_mockInventoryItem.cid);
      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

  });


  describe('Modals', (): void => {

    test('should handle quantity helper modal error', (): void => {
      const toastSpy: jest.SpyInstance = jest.spyOn(component.toastService, 'presentErrorToast');

      fixture.detectChanges();

      const errorHandler: (error: string) => void = component.onQuantityHelperModalError();
      errorHandler('test-error');
      expect(toastSpy).toHaveBeenCalledWith('Error selecting quantity');
    });

    test('should handle quantity helper modal success', (): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      component.handleItemCountDecrement = jest.fn();
      const handleSpy: jest.SpyInstance = jest.spyOn(component, 'handleItemCountDecrement');

      fixture.detectChanges();

      const successHandler: (data: object) => void = component.onQuantityHelperModalSuccess(_mockInventoryItem);
      successHandler({ data: 1 });
      expect(handleSpy).toHaveBeenCalledWith(_mockInventoryItem, 1);
    });

    test('should open quantity helper modal with success', (done: jest.DoneCallback): void => {
      const _stubModal: ModalStub = new ModalStub();
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      component.modalCtrl.create = jest.fn()
        .mockReturnValue(Promise.resolve(_stubModal));
      _stubModal.onDidDismiss = jest.fn()
        .mockReturnValue(Promise.resolve({ data: {} }));
      component.onQuantityHelperModalSuccess = jest.fn()
        .mockReturnValue(() => {});
      const successSpy: jest.SpyInstance = jest.spyOn(component, 'onQuantityHelperModalSuccess');

      fixture.detectChanges();

      component.openQuantityHelper(_mockInventoryItem);
      _stubModal.onDidDismiss();
      setTimeout((): void => {
        expect(successSpy).toHaveBeenCalledWith(_mockInventoryItem);
        done();
      });
    });

    test('should handle error response from modal', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const _stubModal: ModalStub = new ModalStub();
      component.modalCtrl.create = jest.fn()
        .mockReturnValue(Promise.resolve(_stubModal));
      component.onQuantityHelperModalError = jest.fn()
        .mockReturnValue(() => {});
      _stubModal.onDidDismiss = jest.fn()
        .mockReturnValue(Promise.reject('test-error'));
      const errorSpy: jest.SpyInstance = jest.spyOn(component, 'onQuantityHelperModalError');

      fixture.detectChanges();

      component.openQuantityHelper(_mockInventoryItem);
      _stubModal.onDidDismiss();
      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should handle inventory form modal error', (): void => {
      const toastSpy: jest.SpyInstance = jest.spyOn(component.toastService, 'presentErrorToast');

      fixture.detectChanges();

      const errorHandler: (error: string) => void = component.onInventoryFormModalError();
      errorHandler('test-error');
      expect(toastSpy).toHaveBeenCalledWith('An error occurred on inventory form exit');
    });

    test('should handle inventory form modal success with batch', (): void => {
      const _stubModal: ModalStub = new ModalStub();
      const _mockBatch: Batch = mockBatch();
      component.modalCtrl.create = jest.fn()
        .mockReturnValue(Promise.resolve(_stubModal));
      _stubModal.onDidDismiss = jest.fn()
        .mockReturnValue(Promise.resolve({ data: {} }));
      component.createItemFromBatch = jest.fn();
      const createSpy: jest.SpyInstance = jest.spyOn(component, 'createItemFromBatch');

      fixture.detectChanges();

      const successHandler: (data: object) => void = component.onInventoryFormModalSuccess({ batch: _mockBatch });
      successHandler({ data: { test: true } });
      expect(createSpy).toHaveBeenCalledWith(_mockBatch, { test: true });
    });

    test('should handle inventory form modal success with item', (): void => {
      const _stubModal: ModalStub = new ModalStub();
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      component.modalCtrl.create = jest.fn()
        .mockReturnValue(Promise.resolve(_stubModal));
      _stubModal.onDidDismiss = jest.fn()
        .mockReturnValue(Promise.resolve({ data: {} }));
      component.updateItem = jest.fn();
      const updateSpy: jest.SpyInstance = jest.spyOn(component, 'updateItem');

      fixture.detectChanges();

      const successHandler: (data: object) => void = component.onInventoryFormModalSuccess({ item: _mockInventoryItem });
      successHandler({ data: { test: true } });
      expect(updateSpy).toHaveBeenCalledWith(_mockInventoryItem, { test: true });
    });

    test('should open the inventory form modal with no options', (): void => {
      const _stubModal: ModalStub = new ModalStub();
      component.modalCtrl.create = jest.fn()
        .mockReturnValue(Promise.resolve(_stubModal));
      _stubModal.onDidDismiss = jest.fn()
        .mockReturnValue(Promise.resolve({ data: { test: true } }));
      component.createItem = jest.fn();
      const createSpy: jest.SpyInstance = jest.spyOn(component, 'createItem');

      fixture.detectChanges();

      const successHandler: (data: object) => void = component.onInventoryFormModalSuccess({});
      successHandler({ data: { test: true } });
      expect(createSpy).toHaveBeenCalledWith({ test: true });
    });

    test('should open the inventory form modal with success', (done: jest.DoneCallback): void => {
      const _stubModal: ModalStub = new ModalStub();
      const _mockBatch: Batch = mockBatch();
      component.modalCtrl.create = jest.fn()
        .mockReturnValue(Promise.resolve(_stubModal));
      _stubModal.onDidDismiss = jest.fn()
        .mockReturnValue(Promise.resolve({ data: {} }));
      component.onInventoryFormModalSuccess = jest.fn()
        .mockReturnValue(() => {});
      const successSpy: jest.SpyInstance = jest.spyOn(component, 'onInventoryFormModalSuccess');

      fixture.detectChanges();

      component.openInventoryFormModal({ batch: _mockBatch });
      _stubModal.onDidDismiss();
      setTimeout((): void => {
        expect(successSpy).toHaveBeenCalledWith({ batch: _mockBatch });
        done();
      });
    });

    test('should handle error response from modal', (done: jest.DoneCallback): void => {
      const _stubModal: ModalStub = new ModalStub();
      component.modalCtrl.create = jest.fn()
        .mockReturnValue(Promise.resolve(_stubModal));
      component.onInventoryFormModalError = jest.fn()
        .mockReturnValue(() => {});
      _stubModal.onDidDismiss = jest.fn()
        .mockReturnValue(Promise.reject('test-error'));
      const errorSpy: jest.SpyInstance = jest.spyOn(component, 'onInventoryFormModalError');

      fixture.detectChanges();

      component.openInventoryFormModal({});
      _stubModal.onDidDismiss();
      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalled();
        done();
      }, 10);
    });

  });


  describe('Sorting', (): void => {

    test('should collect inventory items into groups based on source', (): void => {
      const _mockInventoryItemSelf: InventoryItem = mockInventoryItem();
      _mockInventoryItemSelf.sourceType = 'self';
      const _mockInventoryItemOther: InventoryItem = mockInventoryItem();
      _mockInventoryItemOther.sourceType = 'other';
      const _mockInventoryItemThird: InventoryItem = mockInventoryItem();
      _mockInventoryItemThird.sourceType = 'third';
      component.displayList = [ _mockInventoryItemOther, _mockInventoryItemThird, _mockInventoryItemSelf ];

      fixture.detectChanges();

      const [self, other, third] = component.collateInventoryBySource();
      expect(self).toStrictEqual([_mockInventoryItemSelf]);
      expect(other).toStrictEqual([_mockInventoryItemOther]);
      expect(third).toStrictEqual([_mockInventoryItemThird]);
    });

    test('should handle sort direction change', (): void => {
      const _mockEvent: CustomEvent = new CustomEvent('test-event', { detail: { value: false } });
      component.resetDisplayList = jest.fn();

      fixture.detectChanges();

      expect(component.isAscending).toBe(true);
      component.onDirectionChange(_mockEvent);
      expect(component.isAscending).toBe(false);
    });

    test('should handle sort on change', (): void => {
      const _mockEvent: CustomEvent = new CustomEvent('test-event', { detail: { value: 'source' } });
      component.resetDisplayList = jest.fn();

      fixture.detectChanges();

      expect(component.sortBy).toMatch('alphabetical');
      component.onSortChange(_mockEvent);
      expect(component.sortBy).toMatch('source');
    });

    test('should sort items alphabetically by name', (): void => {
      const _mockInventoryItem1: InventoryItem = mockInventoryItem();
      _mockInventoryItem1.itemName = 'abc';
      const _mockInventoryItem2: InventoryItem = mockInventoryItem();
      _mockInventoryItem2.itemName = 'def';
      const _mockInventoryItem3: InventoryItem = mockInventoryItem();
      _mockInventoryItem3.itemName = 'ghi';

      fixture.detectChanges();

      component.displayList = [ _mockInventoryItem1, _mockInventoryItem3, _mockInventoryItem2 ];
      component.isAscending = false;
      component.sortByAlphabetical();
      expect(component.displayList).toStrictEqual([ _mockInventoryItem3, _mockInventoryItem2, _mockInventoryItem1]);
      component.isAscending = true;
      component.sortByAlphabetical();
      expect(component.displayList).toStrictEqual([ _mockInventoryItem1, _mockInventoryItem2, _mockInventoryItem3]);
    });

    test('should sort items by current quantity', (): void => {
      const _mockInventoryItem1: InventoryItem = mockInventoryItem();
      _mockInventoryItem1.currentQuantity = 1;
      const _mockInventoryItem2: InventoryItem = mockInventoryItem();
      _mockInventoryItem2.currentQuantity = 2;
      const _mockInventoryItem3: InventoryItem = mockInventoryItem();
      _mockInventoryItem3.currentQuantity = 3;

      fixture.detectChanges();

      component.displayList = [ _mockInventoryItem1, _mockInventoryItem3, _mockInventoryItem2 ];
      component.isAscending = false;
      component.sortByRemaining();
      expect(component.displayList).toStrictEqual([ _mockInventoryItem3, _mockInventoryItem2, _mockInventoryItem1]);
      component.isAscending = true;
      component.sortByRemaining();
      expect(component.displayList).toStrictEqual([ _mockInventoryItem1, _mockInventoryItem2, _mockInventoryItem3]);
    });

    test('should sort items by source (ascending: self -> other -> third)', (): void => {
      const _mockInventoryItem1: InventoryItem = mockInventoryItem();
      _mockInventoryItem1.sourceType = 'self';
      const _mockInventoryItem2: InventoryItem = mockInventoryItem();
      _mockInventoryItem2.sourceType = 'other';
      const _mockInventoryItem3: InventoryItem = mockInventoryItem();
      _mockInventoryItem3.sourceType = 'third';
      component.collateInventoryBySource = jest.fn()
        .mockReturnValue([[_mockInventoryItem1], [_mockInventoryItem2], [_mockInventoryItem3]]);

      fixture.detectChanges();

      component.displayList = [ _mockInventoryItem1, _mockInventoryItem3, _mockInventoryItem2 ];
      component.isAscending = false;
      component.sortBySource();
      expect(component.displayList).toStrictEqual([ _mockInventoryItem3, _mockInventoryItem2, _mockInventoryItem1]);
      component.isAscending = true;
      component.sortBySource();
      expect(component.displayList).toStrictEqual([ _mockInventoryItem1, _mockInventoryItem2, _mockInventoryItem3]);
    });

  });


  describe('Render Template', (): void => {

    test('should show a spinner if displayList is null', (): void => {
      component.displayList = null;

      fixture.detectChanges();

      const spinner: HTMLElement = fixture.nativeElement.querySelector('app-loading-spinner');
      expect(spinner).toBeTruthy();
      const list: HTMLElement = fixture.nativeElement.querySelector('#inventory-list');
      expect(list).toBeNull();
    });

    test('should show add button and no-item message with an empty inventory list', (): void => {
      component.displayList = [];

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

    test('should show add button and inventory list', (): void => {
      const _mockInventoryItem1: InventoryItem = mockInventoryItem();
      const _mockInventoryItem2: InventoryItem = mockInventoryItem();
      _mockInventoryItem2.itemName = 'Other Name';
      component.displayList = [ _mockInventoryItem1, _mockInventoryItem2 ];
      component.itemIndex = 1;

      fixture.detectChanges();

      const formButton: HTMLElement = fixture.nativeElement.querySelector('.form-button');
      expect(formButton.textContent).toMatch('ADD CUSTOM ITEM');
      const listOptions: HTMLElement = fixture.nativeElement.querySelector('#search-option-list');
      expect(listOptions).not.toBeNull();
      const list: HTMLElement = fixture.nativeElement.querySelector('#inventory-list');
      expect(list).not.toBeNull();
      expect(list.childNodes.length).toEqual(component.displayList.length * 4 - 1);
      const sliders: NodeList = fixture.nativeElement.querySelectorAll('app-inventory-slider');
      expect(sliders.length).toEqual(2);
    });

  });


  describe('Animations', (): void => {

    test('should get the ion-content element', (): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      component.displayList = [_mockInventoryItem];
      const container: HTMLElement = global.document.createElement('body');
      const ionContent: HTMLElement = global.document.createElement('ion-content');
      const child1: HTMLElement = global.document.createElement('div');
      const child2: HTMLElement = global.document.createElement('p');
      const ref: HTMLElement = global.document.createElement('div');
      Object.defineProperty(ref, 'nativeElement', { writable: false, value: child2 });
      Object.defineProperty(child2, 'parentElement', { writable: false, value: child1 });
      Object.defineProperty(child1, 'parentElement', { writable: false, value: ionContent });
      Object.defineProperty(ionContent, 'parentElement', { writable: false, value: container });
      Object.defineProperty(container, 'parentElement', { writable: false, value: null });

      fixture.detectChanges();

      component.slidingItemsListRef = <any>ref;
      const elem: HTMLElement = component.getTopLevelContainer();
      expect(elem).toStrictEqual(ionContent);
    });

    test('should get null top level container if slidingItemsListRef is undefined', (): void => {
      fixture.detectChanges();

      component.slidingItemsListRef = undefined;
      expect(component.getTopLevelContainer()).toBeNull();
    });

    test('should run sliding hints', (done: jest.DoneCallback): void => {
      const _mockElem: HTMLElement = global.document.createElement('div');
      component.getTopLevelContainer = jest.fn()
        .mockReturnValue(_mockElem);
      component.toggleSlidingItemClass = jest.fn();
      component.animationService.playCombinedSlidingHintAnimations = jest.fn()
        .mockReturnValue(of([]));
      component.animationService.setHintShownFlag = jest.fn();
      const toggleSpy: jest.SpyInstance = jest.spyOn(component, 'toggleSlidingItemClass');
      const setSpy: jest.SpyInstance = jest.spyOn(component.animationService, 'setHintShownFlag');

      fixture.detectChanges();

      component.slidingItemsListRef = <any>_mockElem;
      component.runSlidingHints();
      setTimeout((): void => {
        expect(toggleSpy).toHaveBeenCalledTimes(2);
        expect(setSpy).toHaveBeenCalledWith('sliding', 'inventory');
        done();
      }, 10);
    });

    test('should get an error running sliding hints with missing content element', (): void => {
      component.getTopLevelContainer = jest.fn()
        .mockReturnValue(null);
      component.reportSlidingHintError = jest.fn();
      const reportSpy: jest.SpyInstance = jest.spyOn(component, 'reportSlidingHintError');
      const toggleSpy: jest.SpyInstance = jest.spyOn(component, 'toggleSlidingItemClass');

      fixture.detectChanges();

      component.runSlidingHints();
      expect(reportSpy).toHaveBeenCalled();
      expect(toggleSpy).not.toHaveBeenCalled();
    });

    test('should handle error playing hint animations', (done: jest.DoneCallback): void => {
      const _mockContainer: Element = global.document.createElement('div');
      Object.defineProperty(_mockContainer, 'nativeElement', { writable: false, value: {} });
      const _mockElem: HTMLElement = global.document.createElement('div');
      const _mockError: Error = new Error('test-error');
      component.getTopLevelContainer = jest.fn()
        .mockReturnValue(_mockElem);
      component.toggleSlidingItemClass = jest.fn();
      component.animationService.playCombinedSlidingHintAnimations = jest.fn()
        .mockReturnValue(throwError(_mockError));
      component.errorReporter.handleUnhandledError = jest.fn();
      const reportSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      component.slidingItemsListRef = <any>_mockContainer;
      component.runSlidingHints();
      setTimeout((): void => {
        expect(reportSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should report an animation error', (): void => {
      const _mockErrorReport: ErrorReport = mockErrorReport();
      component.errorReporter.setErrorReport = jest.fn();
      component.errorReporter.getCustomReportFromError = jest.fn()
        .mockReturnValue(_mockErrorReport);
      const setSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'setErrorReport');
      const getSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'getCustomReportFromError');

      fixture.detectChanges();

      component.reportSlidingHintError();
      expect(setSpy).toHaveBeenCalledWith(_mockErrorReport);
      expect(getSpy.mock.calls[0][0].name).toMatch('AnimationError');
    });

    test('should toggle sliding item class', (): void => {
      const _mockElem: HTMLElement = global.document.createElement('div');
      component.animationService.toggleSlidingItemClass = jest.fn();
      const toggleSpy: jest.SpyInstance = jest.spyOn(component.animationService, 'toggleSlidingItemClass');

      fixture.detectChanges();

      component.slidingItemsListRef = <any>_mockElem;
      component.toggleSlidingItemClass(true);
      expect(toggleSpy).toHaveBeenCalledWith(
        component.slidingItemsListRef.nativeElement,
        true,
        component.renderer
      );
      component.toggleSlidingItemClass(false);
      expect(toggleSpy).toHaveBeenCalledWith(
        component.slidingItemsListRef.nativeElement,
        false,
        component.renderer
      );
    });

  });

});
