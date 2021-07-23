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
  let inventoryCmp: InventoryComponent;
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
    inventoryCmp = fixture.componentInstance;
    originalOnInit = inventoryCmp.ngOnInit;
    originalAfterInit = inventoryCmp.ngAfterViewInit;
    originalOnDestroy = inventoryCmp.ngOnDestroy;
    inventoryCmp.ngOnInit = jest
      .fn();
    inventoryCmp.ngAfterViewInit = jest
      .fn();
    inventoryCmp.ngOnDestroy = jest
      .fn();
    inventoryCmp.toastService.presentToast = jest
      .fn();
    inventoryCmp.toastService.presentErrorToast = jest
      .fn();
    inventoryCmp.errorReporter.setErrorReport = jest
      .fn();
    inventoryCmp.errorReporter.handleUnhandledError = jest
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

    test('should handle after view init', (): void => {
      inventoryCmp.ngAfterViewInit = originalAfterInit;

      inventoryCmp.animationService.shouldShowHint = jest
        .fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      inventoryCmp.runSlidingHints = jest
        .fn();

      const hintSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.animationService, 'shouldShowHint');
      const runSpy: jest.SpyInstance = jest.spyOn(inventoryCmp, 'runSlidingHints');

      fixture.detectChanges();

      inventoryCmp.ngAfterViewInit();

      expect(runSpy).toHaveBeenCalled();

      expect(runSpy).toHaveBeenCalledTimes(1);
      expect(hintSpy).toHaveBeenCalledTimes(2);
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
      Object.defineProperty(mockElement, 'offsetTop', { writable: false, value: 100 });

      global.document.querySelector = jest
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
      const _mockErrorReport: ErrorReport = mockErrorReport();

      inventoryCmp.inventoryService.createItem = jest
        .fn()
        .mockReturnValue(throwError('test-error'));

      inventoryCmp.errorReporter.getCustomReportFromError = jest
        .fn()
        .mockReturnValue(_mockErrorReport);

      const createSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.inventoryService, 'createItem');
      const reportSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.errorReporter, 'setErrorReport');

      fixture.detectChanges();

      inventoryCmp.createItem({ test: true });

      setTimeout((): void => {
        expect(createSpy).toHaveBeenCalledWith({ test: true });
        expect(reportSpy).toHaveBeenCalledWith(_mockErrorReport);
        done();
      }, 10);
    });

    test('should handle item decrement count routing', (): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();

      inventoryCmp.inventoryService.isCapacityBased = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      inventoryCmp.openQuantityHelper = jest
        .fn();

      inventoryCmp.handleItemCountDecrement = jest
        .fn();

      const openSpy: jest.SpyInstance = jest.spyOn(inventoryCmp, 'openQuantityHelper');
      const handleSpy: jest.SpyInstance = jest.spyOn(inventoryCmp, 'handleItemCountDecrement');

      fixture.detectChanges();

      inventoryCmp.decrementCount(_mockInventoryItem);

      expect(openSpy).toHaveBeenCalledWith(_mockInventoryItem);

      inventoryCmp.decrementCount(_mockInventoryItem);

      expect(handleSpy).toHaveBeenCalledWith(_mockInventoryItem, 1);
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
      const _mockError: Error = new Error('test-error');

      inventoryCmp.inventoryService.createItemFromBatch = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      inventoryCmp.optionalData = _mockBatch;

      const errorSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      inventoryCmp.createItemFromBatch(_mockBatch, {});

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

    test('should format a count decrement toast message', (): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      _mockInventoryItem.currentQuantity = 2;

      inventoryCmp.inventoryService.isCapacityBased = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      fixture.detectChanges();

      expect(inventoryCmp.formatDecrementMessage(_mockInventoryItem)).toMatch('2 Pints remaining');
      _mockInventoryItem.currentQuantity--;
      expect(inventoryCmp.formatDecrementMessage(_mockInventoryItem)).toMatch(`1 ${_mockInventoryItem.stockType} remaining`);
      expect(inventoryCmp.formatDecrementMessage(null)).toMatch('Out of Stock!');
    });

    test('should handle decrement the inventory item count', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      _mockInventoryItem.currentQuantity = 2;

      inventoryCmp.inventoryService.updateItem = jest
        .fn()
        .mockReturnValueOnce(of(_mockInventoryItem))
        .mockReturnValueOnce(of(null));

      inventoryCmp.formatDecrementMessage = jest
        .fn()
        .mockReturnValue('test-message');

      const toastSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.toastService, 'presentToast');

      fixture.detectChanges();

      inventoryCmp.handleItemCountDecrement(_mockInventoryItem, 1);
      inventoryCmp.handleItemCountDecrement(_mockInventoryItem, 1);

      setTimeout((): void => {
        expect(toastSpy.mock.calls[0][0]).toMatch('test-message');
        expect(toastSpy.mock.calls[0][3].length).toEqual(0);
        expect(toastSpy.mock.calls[1][0]).toMatch('test-message');
        expect(toastSpy.mock.calls[1][3]).toMatch('toast-warn');
        done();
      }, 10);
    });

    test('should get an error decrementing item count', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const _mockError: Error = new Error('test-error');

      inventoryCmp.inventoryService.updateItem = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      const errorSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      inventoryCmp.handleItemCountDecrement(_mockInventoryItem, 1);

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
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
      const _mockError: Error = new Error('test-error');

      inventoryCmp.inventoryService.getInventoryList = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      const errorSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      inventoryCmp.loadInventoryList();

      setTimeout((): void => {
        expect(inventoryCmp.displayList).toBeNull();
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
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
      const _mockError: Error = new Error('test-error');

      inventoryCmp.inventoryService.updateItem = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      const errorSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      inventoryCmp.updateItem(_mockInventoryItem, {});

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
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
      const _mockError: Error = new Error('test-error');

      inventoryCmp.inventoryService.removeItem = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      const errorSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      inventoryCmp.removeItem(_mockInventoryItem.cid);

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        done();
      }, 10);
    });

  });


  describe('Modals', (): void => {

    test('should handle quantity helper modal error', (): void => {
      const toastSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.toastService, 'presentErrorToast');

      fixture.detectChanges();

      const errorHandler: (error: string) => void = inventoryCmp.onQuantityHelperModalError();

      errorHandler('test-error');

      expect(toastSpy).toHaveBeenCalledWith('Error selecting quantity');
    });

    test('should handle quantity helper modal success', (): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();

      inventoryCmp.handleItemCountDecrement = jest
        .fn();

      const handleSpy: jest.SpyInstance = jest.spyOn(inventoryCmp, 'handleItemCountDecrement');

      fixture.detectChanges();

      const successHandler: (data: object) => void = inventoryCmp.onQuantityHelperModalSuccess(_mockInventoryItem);
      successHandler({ data: 1 });

      expect(handleSpy).toHaveBeenCalledWith(_mockInventoryItem, 1);
    });

    test('should open quantity helper modal with success', (done: jest.DoneCallback): void => {
      const _stubModal: ModalStub = new ModalStub();
      const _mockInventoryItem: InventoryItem = mockInventoryItem();

      inventoryCmp.modalCtrl.create = jest
        .fn()
        .mockReturnValue(Promise.resolve(_stubModal));

      _stubModal.onDidDismiss = jest
        .fn()
        .mockReturnValue(Promise.resolve({ data: {} }));

      inventoryCmp.onQuantityHelperModalSuccess = jest
        .fn()
        .mockReturnValue(() => {});

      const successSpy: jest.SpyInstance = jest.spyOn(inventoryCmp, 'onQuantityHelperModalSuccess');

      fixture.detectChanges();

      inventoryCmp.openQuantityHelper(_mockInventoryItem);

      _stubModal.onDidDismiss();

      setTimeout((): void => {
        expect(successSpy).toHaveBeenCalledWith(_mockInventoryItem);
        done();
      });
    });

    test('should handle error response from modal', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const _stubModal: ModalStub = new ModalStub();

      inventoryCmp.modalCtrl.create = jest
        .fn()
        .mockReturnValue(Promise.resolve(_stubModal));

      inventoryCmp.onQuantityHelperModalError = jest
        .fn()
        .mockReturnValue(() => {});

      _stubModal.onDidDismiss = jest
        .fn()
        .mockReturnValue(Promise.reject('test-error'));

      const errorSpy: jest.SpyInstance = jest.spyOn(inventoryCmp, 'onQuantityHelperModalError');

      fixture.detectChanges();

      inventoryCmp.openQuantityHelper(_mockInventoryItem);

      _stubModal.onDidDismiss();

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should handle inventory form modal error', (): void => {
      const toastSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.toastService, 'presentErrorToast');

      fixture.detectChanges();

      const errorHandler: (error: string) => void = inventoryCmp.onInventoryFormModalError();

      errorHandler('test-error');

      expect(toastSpy).toHaveBeenCalledWith('An error occurred on inventory form exit');
    });

    test('should handle inventory form modal success with batch', (): void => {
      const _stubModal: ModalStub = new ModalStub();
      const _mockBatch: Batch = mockBatch();

      inventoryCmp.modalCtrl.create = jest
        .fn()
        .mockReturnValue(Promise.resolve(_stubModal));

      _stubModal.onDidDismiss = jest
        .fn()
        .mockReturnValue(Promise.resolve({ data: {} }));

      inventoryCmp.createItemFromBatch = jest
        .fn();

      const createSpy: jest.SpyInstance = jest.spyOn(inventoryCmp, 'createItemFromBatch');

      fixture.detectChanges();

      const successHandler: (data: object) => void = inventoryCmp.onInventoryFormModalSuccess({ batch: _mockBatch });
      successHandler({ data: { test: true } });

      expect(createSpy).toHaveBeenCalledWith(_mockBatch, { test: true });
    });

    test('should handle inventory form modal success with item', (): void => {
      const _stubModal: ModalStub = new ModalStub();
      const _mockInventoryItem: InventoryItem = mockInventoryItem();

      inventoryCmp.modalCtrl.create = jest
        .fn()
        .mockReturnValue(Promise.resolve(_stubModal));

      _stubModal.onDidDismiss = jest
        .fn()
        .mockReturnValue(Promise.resolve({ data: {} }));

      inventoryCmp.updateItem = jest
        .fn();

      const updateSpy: jest.SpyInstance = jest.spyOn(inventoryCmp, 'updateItem');

      fixture.detectChanges();

      const successHandler: (data: object) => void = inventoryCmp.onInventoryFormModalSuccess({ item: _mockInventoryItem });
      successHandler({ data: { test: true } });

      expect(updateSpy).toHaveBeenCalledWith(_mockInventoryItem, { test: true });
    });

    test('should open the inventory form modal with no options', (): void => {
      const _stubModal: ModalStub = new ModalStub();

      inventoryCmp.modalCtrl.create = jest
        .fn()
        .mockReturnValue(Promise.resolve(_stubModal));

      _stubModal.onDidDismiss = jest
        .fn()
        .mockReturnValue(Promise.resolve({ data: { test: true } }));

      inventoryCmp.createItem = jest
        .fn();

      const createSpy: jest.SpyInstance = jest.spyOn(inventoryCmp, 'createItem');

      fixture.detectChanges();

      const successHandler: (data: object) => void = inventoryCmp.onInventoryFormModalSuccess({});
      successHandler({ data: { test: true } });

      expect(createSpy).toHaveBeenCalledWith({ test: true });
    });

    test('should open the inventory form modal with success', (done: jest.DoneCallback): void => {
      const _stubModal: ModalStub = new ModalStub();
      const _mockBatch: Batch = mockBatch();

      inventoryCmp.modalCtrl.create = jest
        .fn()
        .mockReturnValue(Promise.resolve(_stubModal));

      _stubModal.onDidDismiss = jest
        .fn()
        .mockReturnValue(Promise.resolve({ data: {} }));

      inventoryCmp.onInventoryFormModalSuccess = jest
        .fn()
        .mockReturnValue(() => {});

      const successSpy: jest.SpyInstance = jest.spyOn(inventoryCmp, 'onInventoryFormModalSuccess');

      fixture.detectChanges();

      inventoryCmp.openInventoryFormModal({ batch: _mockBatch });

      _stubModal.onDidDismiss();

      setTimeout((): void => {
        expect(successSpy).toHaveBeenCalledWith({ batch: _mockBatch });
        done();
      });
    });

    test('should handle error response from modal', (done: jest.DoneCallback): void => {
      const _stubModal: ModalStub = new ModalStub();

      inventoryCmp.modalCtrl.create = jest
        .fn()
        .mockReturnValue(Promise.resolve(_stubModal));

      inventoryCmp.onInventoryFormModalError = jest
        .fn()
        .mockReturnValue(() => {});

      _stubModal.onDidDismiss = jest
        .fn()
        .mockReturnValue(Promise.reject('test-error'));

      const errorSpy: jest.SpyInstance = jest.spyOn(inventoryCmp, 'onInventoryFormModalError');

      fixture.detectChanges();

      inventoryCmp.openInventoryFormModal({});

      _stubModal.onDidDismiss();

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalled();
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


  describe('Animations', (): void => {

    test('should get the ion-content element', (): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      inventoryCmp.displayList = [_mockInventoryItem];

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

      inventoryCmp.slidingItemsListRef = <any>ref;

      const elem: HTMLElement = inventoryCmp.getTopLevelContainer();

      expect(elem).toStrictEqual(ionContent);
    });

    test('should get null top level container if slidingItemsListRef is undefined', (): void => {
      fixture.detectChanges();

      inventoryCmp.slidingItemsListRef = undefined;

      expect(inventoryCmp.getTopLevelContainer()).toBeNull();
    });

    test('should run sliding hints', (done: jest.DoneCallback): void => {
      const _mockElem: HTMLElement = global.document.createElement('div');

      inventoryCmp.getTopLevelContainer = jest
        .fn()
        .mockReturnValue(_mockElem);

      inventoryCmp.toggleSlidingItemClass = jest
        .fn();

      inventoryCmp.animationService.playCombinedSlidingHintAnimations = jest
        .fn()
        .mockReturnValue(of([]));

      inventoryCmp.animationService.setHintShownFlag = jest
        .fn();

      const toggleSpy: jest.SpyInstance = jest.spyOn(inventoryCmp, 'toggleSlidingItemClass');
      const setSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.animationService, 'setHintShownFlag');

      fixture.detectChanges();

      inventoryCmp.slidingItemsListRef = <any>_mockElem;

      inventoryCmp.runSlidingHints();

      setTimeout((): void => {
        expect(toggleSpy).toHaveBeenCalledTimes(2);
        expect(setSpy).toHaveBeenCalledWith('sliding', 'inventory');
        done();
      }, 10);
    });

    test('should get an error running sliding hints with missing content element', (): void => {
      inventoryCmp.getTopLevelContainer = jest
        .fn()
        .mockReturnValue(null);

      const _mockErrorReport: ErrorReport = mockErrorReport();

      inventoryCmp.errorReporter.setErrorReport = jest.fn();
      inventoryCmp.errorReporter.getCustomReportFromError = jest
        .fn()
        .mockReturnValue(_mockErrorReport);

      const setSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.errorReporter, 'setErrorReport');
      const getSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.errorReporter, 'getCustomReportFromError');

      fixture.detectChanges();

      inventoryCmp.runSlidingHints();

      expect(setSpy).toHaveBeenCalledWith(_mockErrorReport);
      expect(getSpy.mock.calls[0][0]['name']).toMatch('AnimationError');
    });

    test('should get an error running sliding hints with animation error', (done: jest.DoneCallback): void => {
      const _mockElem: HTMLElement = global.document.createElement('div');
      const _mockError: Error = new Error('test-error');

      inventoryCmp.getTopLevelContainer = jest
        .fn()
        .mockReturnValue(_mockElem);

      inventoryCmp.toggleSlidingItemClass = jest
        .fn();

      inventoryCmp.animationService.playCombinedSlidingHintAnimations = jest
        .fn()
        .mockReturnValue(throwError(_mockError));

      inventoryCmp.animationService.setHintShownFlag = jest
        .fn();

      const errorSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.errorReporter, 'handleUnhandledError');
      const toggleSpy: jest.SpyInstance = jest.spyOn(inventoryCmp, 'toggleSlidingItemClass');
      const setSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.animationService, 'setHintShownFlag');

      fixture.detectChanges();

      inventoryCmp.slidingItemsListRef = <any>_mockElem;

      inventoryCmp.runSlidingHints();

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        expect(toggleSpy).toHaveBeenCalledTimes(2);
        expect(setSpy).not.toHaveBeenCalled();
        done();
      }, 10);
    });

    test('should toggle sliding item class', (): void => {
      const _mockElem: HTMLElement = global.document.createElement('div');

      inventoryCmp.animationService.toggleSlidingItemClass = jest
        .fn();

      const toggleSpy: jest.SpyInstance = jest.spyOn(inventoryCmp.animationService, 'toggleSlidingItemClass');

      fixture.detectChanges();

      inventoryCmp.slidingItemsListRef = <any>_mockElem;

      inventoryCmp.toggleSlidingItemClass(true);

      expect(toggleSpy).toHaveBeenCalledWith(
        inventoryCmp.slidingItemsListRef.nativeElement,
        true,
        inventoryCmp.renderer
      );

      inventoryCmp.toggleSlidingItemClass(false);

      expect(toggleSpy).toHaveBeenCalledWith(
        inventoryCmp.slidingItemsListRef.nativeElement,
        false,
        inventoryCmp.renderer
      );
    });

  });

});
