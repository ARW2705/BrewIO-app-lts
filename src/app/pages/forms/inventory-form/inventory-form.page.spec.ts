/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule, LoadingController, ModalController } from '@ionic/angular';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { forkJoin, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockAuthor, mockBatch, mockInventoryItem, mockImage, mockStyles } from '../../../../../test-config/mock-models';
import { ErrorReportingServiceStub, IdServiceStub, LibraryServiceStub, RecipeServiceStub } from '../../../../../test-config/service-stubs';
import { LoadingControllerStub, ModalControllerStub } from '../../../../../test-config/ionic-stubs';

/* Default imports */
import { defaultImage } from '../../../shared/defaults';

/* Interface imports */
import { Author, Batch, Image, InventoryItem, Style } from '../../../shared/interfaces';

/* Service imports */
import { ErrorReportingService, IdService, LibraryService, RecipeService } from '../../../services/services';

/* Page imports */
import { InventoryFormPage } from './inventory-form.page';


describe('InventoryFormPage', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<InventoryFormPage>;
  let page: InventoryFormPage;
  let originalOnInit: any;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        InventoryFormPage
      ],
      imports: [
        IonicModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: IdService            , useClass: IdServiceStub             },
        { provide: LibraryService       , useClass: LibraryServiceStub        },
        { provide: LoadingController    , useClass: LoadingControllerStub     },
        { provide: ModalController      , useClass: ModalControllerStub       },
        { provide: RecipeService        , useClass: RecipeServiceStub         }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(InventoryFormPage);
    page = fixture.componentInstance;
    originalOnInit = page.ngOnInit;
    page.ngOnInit = jest.fn();
    page.loadingCtrl.dismiss = jest.fn();
    page.modalCtrl.dismiss = jest.fn();
    page.idService.hasId = jest.fn()
      .mockImplementation((style: Style, id: string): boolean => style._id === id);
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(page).toBeDefined();
  });

  describe('Lifecycle', (): void => {

    test('should init the component', (done: jest.DoneCallback): void => {
      const _mockAuthor: Author = mockAuthor();
      const _mockStyles: Style[] = mockStyles();
      const _mockBatch: Batch = mockBatch();
      page.ngOnInit = originalOnInit;
      page.options = { batch: _mockBatch };
      page.isRequired = true;
      page.libraryService.getStyleLibrary = jest.fn()
        .mockReturnValue(of(_mockStyles));
      page.getAuthor = jest.fn()
        .mockReturnValue(of(_mockAuthor));
      page.initForm = jest.fn();
      let hasDismissBeenCalled: boolean = false;
      page.dismissLoadingIfHasOverlayFn = jest.fn()
        .mockReturnValue((): void => { hasDismissBeenCalled = true; });
      const getSpy: jest.SpyInstance = jest.spyOn(page, 'getAuthor');
      const initSpy: jest.SpyInstance = jest.spyOn(page, 'initForm');

      fixture.detectChanges();

      setTimeout((): void => {
        expect(getSpy).toHaveBeenCalledWith(_mockBatch.recipeMasterId);
        expect(initSpy).toHaveBeenCalled();
        expect(page.styles).toStrictEqual(_mockStyles);
        expect(page.author).toStrictEqual(_mockAuthor);
        expect(page.onBackClick).toBeUndefined();
        expect(hasDismissBeenCalled).toBe(true);
        done();
      }, 10);
    });

    test('should get error on component init', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      const _mockAuthor: Author = mockAuthor();
      page.options = {};
      page.ngOnInit = originalOnInit;
      page.libraryService.getStyleLibrary = jest.fn()
        .mockReturnValue(throwError(_mockError));
      page.getAuthor = jest.fn()
        .mockReturnValue(of(_mockAuthor));
      page.dismiss = jest.fn();
      page.dismiss.bind = jest.fn()
        .mockImplementation((page: InventoryFormPage): () => void => page.dismiss);
      let hasDismissBeenCalled: boolean = false;
      page.dismissLoadingIfHasOverlayFn = jest.fn()
        .mockReturnValue((): void => { hasDismissBeenCalled = true; });
      page.errorReporter.handleUnhandledError = jest.fn();
      const errorSpy: jest.SpyInstance = jest.spyOn(page.errorReporter, 'handleUnhandledError');

      fixture.detectChanges();

      setTimeout((): void => {
        expect(errorSpy).toHaveBeenCalledWith(_mockError);
        expect(hasDismissBeenCalled).toBe(true);
        done();
      }, 10);
    });

  });


  describe('Form Methods', (): void => {

    test('should add form controls to the inventory form with default values', (): void => {
      const formGroup: FormGroup = new FormGroup({});
      page.inventoryForm = formGroup;
      const testControls: { [key: string]: FormControl } = {
        itemName: new FormControl(),
        description: new FormControl()
      };

      fixture.detectChanges();

      page.addFormControls(testControls);
      expect(page.inventoryForm.controls.itemName).toBeTruthy();
      expect(page.inventoryForm.controls.description).toBeTruthy();
    });

    test('should add form controls to the inventory form with values from given item', (): void => {
      const formGroup: FormGroup = new FormGroup({});
      page.inventoryForm = formGroup;
      const testControls: { [key: string]: FormControl } = {
        itemName: new FormControl(),
        description: new FormControl()
      };
      const _mockInventoryItem: InventoryItem = mockInventoryItem();

      fixture.detectChanges();

      page.addFormControls(testControls, _mockInventoryItem);
      expect(page.inventoryForm.controls.itemName).toBeTruthy();
      expect(page.inventoryForm.controls.description).toBeTruthy();
      expect(page.inventoryForm.value.itemName).toMatch(_mockInventoryItem.itemName);
      expect(page.inventoryForm.value.description).toMatch(_mockInventoryItem.description);
    });

    test('should build form select options', (): void => {
      fixture.detectChanges();

      page.buildFormSelectOptions();
      expect(page.styleOptions).toStrictEqual([]);
      const _mockStyles: Style[] = mockStyles();
      page.styles = _mockStyles;

      fixture.detectChanges();

      expect(page.styleOptions).toStrictEqual([]);
      page.buildFormSelectOptions();
      const optionsLength: number = page.styleOptions.length;
      const stylesLength: number = page.styles.length;
      expect(optionsLength).toEqual(stylesLength);
      const testStyle: Style = _mockStyles[stylesLength / 2];
      expect(page.styleOptions[optionsLength / 2]).toStrictEqual({
        label: testStyle.name,
        value: testStyle
      });
    });

    test('should init the base form', (): void => {
      page.options = {};
      page.buildFormSelectOptions = jest.fn();
      page.initStockDetailControls = jest.fn();
      page.initItemDetailControls = jest.fn();
      page.initSupplierDetailControls = jest.fn();
      const _mockStyles: Style[] = mockStyles();
      page.styles = _mockStyles;
      const _mockBatch: Batch = mockBatch();
      _mockBatch._id = _mockStyles[1]._id;
      const buildSpy: jest.SpyInstance = jest.spyOn(page, 'buildFormSelectOptions');
      const itemSpy: jest.SpyInstance = jest.spyOn(page, 'initItemDetailControls');
      const stockSpy: jest.SpyInstance = jest.spyOn(page, 'initStockDetailControls');
      const supplierSpy: jest.SpyInstance = jest.spyOn(page, 'initSupplierDetailControls');

      fixture.detectChanges();

      // default with no given batch or item
      page.initForm();
      expect(buildSpy).toHaveBeenCalled();
      expect(page.inventoryForm).toBeTruthy();
      expect(itemSpy).toHaveBeenCalledWith(undefined);
      expect(stockSpy).toHaveBeenCalledWith(undefined);
      expect(supplierSpy).toHaveBeenCalledWith(undefined);
      // with item
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      _mockInventoryItem.itemStyleId = _mockStyles[1]._id;
      page.options = { item: _mockInventoryItem };
      page.initForm();
      expect(page.selectedStyle).toStrictEqual(_mockStyles[1]);
      expect(itemSpy).toHaveBeenNthCalledWith(2, _mockInventoryItem);
      expect(stockSpy).toHaveBeenNthCalledWith(2, _mockInventoryItem);
      expect(supplierSpy).toHaveBeenNthCalledWith(2, _mockInventoryItem);
      // with batch
      page.options = { batch: _mockBatch };
      page.initForm();
      expect(stockSpy).toHaveBeenCalledTimes(3);
      expect(itemSpy).toHaveBeenCalledTimes(2);
      expect(supplierSpy).toHaveBeenCalledTimes(2);
    });

    test('should init item details form controls', (): void => {
      page.addFormControls = jest.fn();
      const addSpy: jest.SpyInstance = jest.spyOn(page, 'addFormControls');

      fixture.detectChanges();

      page.initItemDetailControls();
      expect(addSpy).toHaveBeenCalledWith(page.itemDetailControls, undefined);
      expect(page.itemDetailControls).not.toBeNull();
      expect(page.itemDetailControls.itemName).toBeTruthy();
      expect(page.itemDetailControls.itemName.value.length).toEqual(0);
      expect(page.itemDetailControls.itemSubname).toBeTruthy();
      expect(page.itemDetailControls.itemSubname.value.length).toEqual(0);
      expect(page.itemDetailControls.description).toBeTruthy();
      expect(page.itemDetailControls.description.value.length).toEqual(0);
      expect(page.itemDetailControls.itemStyleId).toBeTruthy();
      expect(page.itemDetailControls.itemStyleId.value.length).toEqual(0);
      expect(page.itemDetailControls.itemABV).toBeTruthy();
      expect(page.itemDetailControls.itemABV.value).toBeNull();
      expect(page.itemDetailControls.itemIBU).toBeTruthy();
      expect(page.itemDetailControls.itemIBU.value).toBeNull();
      expect(page.itemDetailControls.itemSRM).toBeTruthy();
      expect(page.itemDetailControls.itemSRM.value).toBeNull();
    });

    test('should init stock details form controls', (): void => {
      page.addFormControls = jest.fn();
      const addSpy: jest.SpyInstance = jest.spyOn(page, 'addFormControls');

      fixture.detectChanges();

      page.initStockDetailControls();
      expect(addSpy).toHaveBeenCalledWith(page.stockDetailControls, undefined);
      expect(page.stockDetailControls).not.toBeNull();
      expect(page.stockDetailControls.stockType).toBeTruthy();
      expect(page.stockDetailControls.stockType.value.length).toEqual(0);
      expect(page.stockDetailControls.initialQuantity).toBeTruthy();
      expect(page.stockDetailControls.initialQuantity.value).toBeNull();
      expect(page.stockDetailControls.currentQuantity).toBeTruthy();
      expect(page.stockDetailControls.currentQuantity.value).toBeNull();
    });

    test('should init supplier details form controls', (): void => {
      page.addFormControls = jest.fn();
      const addSpy: jest.SpyInstance = jest.spyOn(page, 'addFormControls');

      fixture.detectChanges();

      page.initSupplierDetailControls();
      expect(addSpy).toHaveBeenCalledWith(page.supplierDetailControls, undefined);
      expect(page.supplierDetailControls).not.toBeNull();
      expect(page.supplierDetailControls.supplierName).toBeTruthy();
      expect(page.supplierDetailControls.supplierName.value.length).toEqual(0);
      expect(page.supplierDetailControls.supplierURL).toBeTruthy();
      expect(page.supplierDetailControls.supplierURL.value.length).toEqual(0);
      expect(page.supplierDetailControls.sourceType).toBeTruthy();
      expect(page.supplierDetailControls.sourceType.value.length).toEqual(0);
    });

    test('should submit the form', (): void => {
      const _mockStyles: Style[] = mockStyles();
      page.styles = _mockStyles;
      const styleIndex: number = _mockStyles.length / 2;
      const formGroup: FormGroup = new FormGroup({
        itemStyleId: new FormControl(_mockStyles[styleIndex]),
        itemStyleName: new FormControl(_mockStyles[styleIndex])
      });
      page.inventoryForm = formGroup;
      const _mockImage1: Image = mockImage();
      _mockImage1.url = 'test-url-1';
      page.itemLabelImage = _mockImage1;
      const _mockImage2: Image = mockImage();
      _mockImage2.url = 'test-url-2';
      page.supplierLabelImage = _mockImage2;
      const dismissSpy: jest.SpyInstance = jest.spyOn(page.modalCtrl, 'dismiss');

      fixture.detectChanges();
      page.onSubmit();
      expect(dismissSpy).toHaveBeenCalledWith({
        itemStyleId: _mockStyles[styleIndex]._id,
        itemStyleName: _mockStyles[styleIndex].name,
        itemLabelImage: _mockImage1,
        supplierLabelImage: _mockImage2
      });
    });

    test('should submit the form using a batch to find the style', (): void => {
      const _mockStyles: Style[] = mockStyles();
      page.styles = _mockStyles;
      const styleIndex: number = _mockStyles.length / 2;
      const _mockBatch: Batch = mockBatch();
      _mockBatch.annotations.styleId = _mockStyles[styleIndex]._id;
      page.batch = _mockBatch;
      const formGroup: FormGroup = new FormGroup({});
      page.inventoryForm = formGroup;
      const _mockImage1: Image = mockImage();
      _mockImage1.url = 'test-url-1';
      page.itemLabelImage = _mockImage1;
      const _mockImage2: Image = mockImage();
      _mockImage2.url = 'test-url-2';
      page.supplierLabelImage = _mockImage2;
      const dismissSpy: jest.SpyInstance = jest.spyOn(page.modalCtrl, 'dismiss');

      fixture.detectChanges();
      page.onSubmit();
      expect(dismissSpy).toHaveBeenCalledWith({
        itemStyleId: _mockStyles[styleIndex]._id,
        itemStyleName: _mockStyles[styleIndex].name,
        itemLabelImage: _mockImage1,
        supplierLabelImage: _mockImage2
      });
    });

  });


  describe('Other Methods', (): void => {

    test('should dismiss the modal with no data', (): void => {
      const dismissSpy: jest.SpyInstance = jest.spyOn(page.modalCtrl, 'dismiss');

      fixture.detectChanges();

      page.dismiss();
      expect(dismissSpy).toHaveBeenCalled();
    });

    test('should get loading dismiss handler function', (done: jest.DoneCallback): void => {
      page.loadingCtrl.getTop = jest.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      const getSpy: jest.SpyInstance = jest.spyOn(page.loadingCtrl, 'getTop');
      const dismissSpy: jest.SpyInstance = jest.spyOn(page.loadingCtrl, 'dismiss');

      fixture.detectChanges();

      const dismissFn1: () => Promise<void> = page.dismissLoadingIfHasOverlayFn();
      const dismissFn2: () => Promise<void> = page.dismissLoadingIfHasOverlayFn();
      Promise.all([dismissFn1(), dismissFn2()])
        .then((): void => {
          expect(getSpy).toHaveBeenCalledTimes(2);
          expect(dismissSpy).toHaveBeenCalledTimes(1);
          done();
        })
        .catch((error: any): void => {
          console.log(error);
          expect(true).toBe(false);
          done();
        });
    });

    test('should get author', (done: jest.DoneCallback): void => {
      const _mockAuthor: Author = mockAuthor();
      page.recipeService.getPublicAuthorByRecipeId = jest.fn()
        .mockReturnValue(of(_mockAuthor));

      fixture.detectChanges();

      forkJoin([page.getAuthor(''), page.getAuthor('test')])
        .subscribe(
          (results: Author[]): void => {
            expect(results[0]).toBeNull();
            expect(results[1]).toStrictEqual(_mockAuthor);
            done();
          },
          (error: Error): void => {
            console.log('Unexpected error', error);
            expect(true).toBe(false);
            done();
          }
        );
    });

    test('should handle image selection event', (): void => {
      const _mockImage1: Image = mockImage();
      _mockImage1.url = 'test-1';
      const _mockImage2: Image = mockImage();
      _mockImage2.url = 'test-2';
      const _defaultImage: Image = defaultImage();

      fixture.detectChanges();

      expect(page.itemLabelImage).toStrictEqual(_defaultImage);
      expect(page.supplierLabelImage).toStrictEqual(_defaultImage);
      // invalid image type - no changes
      page.onImageSelection({ imageType: 'invalid', image: null });
      expect(page.itemLabelImage).toStrictEqual(_defaultImage);
      expect(page.supplierLabelImage).toStrictEqual(_defaultImage);
      // item update
      page.onImageSelection({ imageType: 'itemLabelImage', image: _mockImage1 });
      expect(page.itemLabelImage).toStrictEqual(_mockImage1);
      expect(page.supplierLabelImage).toStrictEqual(_defaultImage);
      // supplier update
      page.onImageSelection({ imageType: 'supplierLabelImage', image: _mockImage2 });
      expect(page.itemLabelImage).toStrictEqual(_mockImage1);
      expect(page.supplierLabelImage).toStrictEqual(_mockImage2);
    });

  });


  describe('Template', (): void => {
    const _mockStyles: Style[] = mockStyles();

    beforeEach((): void => {
      page.ngOnInit = originalOnInit;
      page.libraryService.getStyleLibrary = jest.fn()
        .mockReturnValue(of(_mockStyles));
      page.getAuthor = jest.fn()
        .mockReturnValue(of(null));
      page.dismissLoadingIfHasOverlayFn = jest.fn()
        .mockReturnValue(() => {});
      page.inventoryForm = new FormGroup({});
    });

    test('should render the template for a generic form (expect all fields)', (): void => {
      page.options = {};

      fixture.detectChanges();

      const itemForm: HTMLElement = fixture.nativeElement.querySelector('app-inventory-item-details-form');
      expect(itemForm).toBeTruthy();
      const supplierForm: HTMLElement = fixture.nativeElement.querySelector('app-inventory-supplier-details-form');
      expect(supplierForm).toBeTruthy();
      const stockForm: HTMLElement = fixture.nativeElement.querySelector('app-inventory-stock-details-form');
      expect(stockForm).toBeTruthy();
    });

    test('should render the template for a batch form (stock only)', (): void => {
      page.options = { batch: mockBatch() };

      fixture.detectChanges();

      const itemForm: HTMLElement = fixture.nativeElement.querySelector('app-inventory-item-details-form');
      expect(itemForm).toBeNull();
      const supplierForm: HTMLElement = fixture.nativeElement.querySelector('app-inventory-supplier-details-form');
      expect(supplierForm).toBeNull();
      const stockForm: HTMLElement = fixture.nativeElement.querySelector('app-inventory-stock-details-form');
      expect(stockForm).toBeTruthy();
    });

    test('should render the template for an item form (expect all fields with selections)', (): void => {
      page.styles = _mockStyles;
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      _mockInventoryItem.itemStyleId = _mockStyles[0]._id;
      page.options = { item: _mockInventoryItem };

      fixture.detectChanges();

      const itemForm: HTMLElement = fixture.nativeElement.querySelector('app-inventory-item-details-form');
      expect(itemForm).toBeTruthy();
      expect(itemForm['selectedStyle']).toStrictEqual(_mockStyles[0]);
      expect(itemForm['styleOptions'].length).toEqual(_mockStyles.length);
      const supplierForm: HTMLElement = fixture.nativeElement.querySelector('app-inventory-supplier-details-form');
      expect(supplierForm).toBeTruthy();
      expect(supplierForm['selectedSource']).toMatch(_mockInventoryItem.sourceType);
      const stockForm: HTMLElement = fixture.nativeElement.querySelector('app-inventory-stock-details-form');
      expect(stockForm).toBeTruthy();
      expect(stockForm['selectedStockTypeName']).toMatch(_mockInventoryItem.stockType);
    });

  });

});
