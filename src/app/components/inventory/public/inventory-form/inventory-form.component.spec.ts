/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule, LoadingController, ModalController } from '@ionic/angular';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { forkJoin, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockAuthor, mockBatch, mockInventoryItem, mockImage, mockStyles } from '../../../../../../test-config/mock-models';
import { ErrorReportingServiceStub, IdServiceStub, LibraryServiceStub, RecipeServiceStub } from '../../../../../../test-config/service-stubs';
import { LoadingControllerStub, ModalControllerStub } from '../../../../../../test-config/ionic-stubs';

/* Default imports */
import { defaultImage } from '../../../../shared/defaults';

/* Interface imports */
import { Author, Batch, Image, InventoryItem, Style } from '../../../../shared/interfaces';

/* Service imports */
import { ErrorReportingService, IdService, LibraryService, RecipeService } from '../../../../services/services';

/* Page imports */
import { InventoryFormComponent } from './inventory-form.component';


describe('InventoryFormComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<InventoryFormComponent>;
  let component: InventoryFormComponent;
  let originalOnInit: any;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        InventoryFormComponent
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
    fixture = TestBed.createComponent(InventoryFormComponent);
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    component.ngOnInit = jest.fn();
    component.loadingCtrl.dismiss = jest.fn();
    component.modalCtrl.dismiss = jest.fn();
    component.idService.hasId = jest.fn()
      .mockImplementation((style: Style, id: string): boolean => style._id === id);
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  describe('Lifecycle', (): void => {

    test('should init the component', (done: jest.DoneCallback): void => {
      const _mockAuthor: Author = mockAuthor();
      const _mockStyles: Style[] = mockStyles();
      const _mockBatch: Batch = mockBatch();
      component.ngOnInit = originalOnInit;
      component.options = { batch: _mockBatch };
      component.isRequired = true;
      component.libraryService.getStyleLibrary = jest.fn()
        .mockReturnValue(of(_mockStyles));
      component.getAuthor = jest.fn()
        .mockReturnValue(of(_mockAuthor));
      component.initForm = jest.fn();
      let hasDismissBeenCalled: boolean = false;
      component.dismissLoadingIfHasOverlayFn = jest.fn()
        .mockReturnValue((): void => { hasDismissBeenCalled = true; });
      const getSpy: jest.SpyInstance = jest.spyOn(component, 'getAuthor');
      const initSpy: jest.SpyInstance = jest.spyOn(component, 'initForm');

      fixture.detectChanges();

      setTimeout((): void => {
        expect(getSpy).toHaveBeenCalledWith(_mockBatch.recipeMasterId);
        expect(initSpy).toHaveBeenCalled();
        expect(component.styles).toStrictEqual(_mockStyles);
        expect(component.author).toStrictEqual(_mockAuthor);
        expect(component.onBackClick).toBeUndefined();
        expect(hasDismissBeenCalled).toBe(true);
        done();
      }, 10);
    });

    test('should get error on component init', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      const _mockAuthor: Author = mockAuthor();
      component.options = {};
      component.ngOnInit = originalOnInit;
      component.libraryService.getStyleLibrary = jest.fn()
        .mockReturnValue(throwError(_mockError));
      component.getAuthor = jest.fn()
        .mockReturnValue(of(_mockAuthor));
      component.dismiss = jest.fn();
      component.dismiss.bind = jest.fn()
        .mockImplementation((component: InventoryFormComponent): () => void => component.dismiss);
      let hasDismissBeenCalled: boolean = false;
      component.dismissLoadingIfHasOverlayFn = jest.fn()
        .mockReturnValue((): void => { hasDismissBeenCalled = true; });
      component.errorReporter.handleUnhandledError = jest.fn();
      const errorSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');

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
      component.inventoryForm = formGroup;
      const testControls: { [key: string]: FormControl } = {
        itemName: new FormControl(),
        description: new FormControl()
      };

      fixture.detectChanges();

      component.addFormControls(testControls);
      expect(component.inventoryForm.controls.itemName).toBeTruthy();
      expect(component.inventoryForm.controls.description).toBeTruthy();
    });

    test('should add form controls to the inventory form with values from given item', (): void => {
      const formGroup: FormGroup = new FormGroup({});
      component.inventoryForm = formGroup;
      const testControls: { [key: string]: FormControl } = {
        itemName: new FormControl(),
        description: new FormControl()
      };
      const _mockInventoryItem: InventoryItem = mockInventoryItem();

      fixture.detectChanges();

      component.addFormControls(testControls, _mockInventoryItem);
      expect(component.inventoryForm.controls.itemName).toBeTruthy();
      expect(component.inventoryForm.controls.description).toBeTruthy();
      expect(component.inventoryForm.value.itemName).toMatch(_mockInventoryItem.itemName);
      expect(component.inventoryForm.value.description).toMatch(_mockInventoryItem.description);
    });

    test('should build form select options', (): void => {
      fixture.detectChanges();

      component.buildFormSelectOptions();
      expect(component.styleOptions).toStrictEqual([]);
      const _mockStyles: Style[] = mockStyles();
      component.styles = _mockStyles;

      fixture.detectChanges();

      expect(component.styleOptions).toStrictEqual([]);
      component.buildFormSelectOptions();
      const optionsLength: number = component.styleOptions.length;
      const stylesLength: number = component.styles.length;
      expect(optionsLength).toEqual(stylesLength);
      const testStyle: Style = _mockStyles[stylesLength / 2];
      expect(component.styleOptions[optionsLength / 2]).toStrictEqual({
        label: testStyle.name,
        value: testStyle
      });
    });

    test('should init the base form', (): void => {
      component.options = {};
      component.buildFormSelectOptions = jest.fn();
      component.initStockDetailControls = jest.fn();
      component.initItemDetailControls = jest.fn();
      component.initSupplierDetailControls = jest.fn();
      const _mockStyles: Style[] = mockStyles();
      component.styles = _mockStyles;
      const _mockBatch: Batch = mockBatch();
      _mockBatch._id = _mockStyles[1]._id;
      const buildSpy: jest.SpyInstance = jest.spyOn(component, 'buildFormSelectOptions');
      const itemSpy: jest.SpyInstance = jest.spyOn(component, 'initItemDetailControls');
      const stockSpy: jest.SpyInstance = jest.spyOn(component, 'initStockDetailControls');
      const supplierSpy: jest.SpyInstance = jest.spyOn(component, 'initSupplierDetailControls');

      fixture.detectChanges();

      // default with no given batch or item
      component.initForm();
      expect(buildSpy).toHaveBeenCalled();
      expect(component.inventoryForm).toBeTruthy();
      expect(itemSpy).toHaveBeenCalledWith(undefined);
      expect(stockSpy).toHaveBeenCalledWith(undefined);
      expect(supplierSpy).toHaveBeenCalledWith(undefined);
      // with item
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      _mockInventoryItem.itemStyleId = _mockStyles[1]._id;
      component.options = { item: _mockInventoryItem };
      component.initForm();
      expect(component.selectedStyle).toStrictEqual(_mockStyles[1]);
      expect(itemSpy).toHaveBeenNthCalledWith(2, _mockInventoryItem);
      expect(stockSpy).toHaveBeenNthCalledWith(2, _mockInventoryItem);
      expect(supplierSpy).toHaveBeenNthCalledWith(2, _mockInventoryItem);
      // with batch
      component.options = { batch: _mockBatch };
      component.initForm();
      expect(stockSpy).toHaveBeenCalledTimes(3);
      expect(itemSpy).toHaveBeenCalledTimes(2);
      expect(supplierSpy).toHaveBeenCalledTimes(2);
    });

    test('should init item details form controls', (): void => {
      component.addFormControls = jest.fn();
      const addSpy: jest.SpyInstance = jest.spyOn(component, 'addFormControls');

      fixture.detectChanges();

      component.initItemDetailControls();
      expect(addSpy).toHaveBeenCalledWith(component.itemDetailControls, undefined);
      expect(component.itemDetailControls).not.toBeNull();
      expect(component.itemDetailControls.itemName).toBeTruthy();
      expect(component.itemDetailControls.itemName.value.length).toEqual(0);
      expect(component.itemDetailControls.itemSubname).toBeTruthy();
      expect(component.itemDetailControls.itemSubname.value.length).toEqual(0);
      expect(component.itemDetailControls.description).toBeTruthy();
      expect(component.itemDetailControls.description.value.length).toEqual(0);
      expect(component.itemDetailControls.itemStyleId).toBeTruthy();
      expect(component.itemDetailControls.itemStyleId.value.length).toEqual(0);
      expect(component.itemDetailControls.itemABV).toBeTruthy();
      expect(component.itemDetailControls.itemABV.value).toBeNull();
      expect(component.itemDetailControls.itemIBU).toBeTruthy();
      expect(component.itemDetailControls.itemIBU.value).toBeNull();
      expect(component.itemDetailControls.itemSRM).toBeTruthy();
      expect(component.itemDetailControls.itemSRM.value).toBeNull();
    });

    test('should init stock details form controls', (): void => {
      component.addFormControls = jest.fn();
      const addSpy: jest.SpyInstance = jest.spyOn(component, 'addFormControls');

      fixture.detectChanges();

      component.initStockDetailControls();
      expect(addSpy).toHaveBeenCalledWith(component.stockDetailControls, undefined);
      expect(component.stockDetailControls).not.toBeNull();
      expect(component.stockDetailControls.stockType).toBeTruthy();
      expect(component.stockDetailControls.stockType.value.length).toEqual(0);
      expect(component.stockDetailControls.initialQuantity).toBeTruthy();
      expect(component.stockDetailControls.initialQuantity.value).toBeNull();
      expect(component.stockDetailControls.currentQuantity).toBeTruthy();
      expect(component.stockDetailControls.currentQuantity.value).toBeNull();
    });

    test('should init supplier details form controls', (): void => {
      component.addFormControls = jest.fn();
      const addSpy: jest.SpyInstance = jest.spyOn(component, 'addFormControls');

      fixture.detectChanges();

      component.initSupplierDetailControls();
      expect(addSpy).toHaveBeenCalledWith(component.supplierDetailControls, undefined);
      expect(component.supplierDetailControls).not.toBeNull();
      expect(component.supplierDetailControls.supplierName).toBeTruthy();
      expect(component.supplierDetailControls.supplierName.value.length).toEqual(0);
      expect(component.supplierDetailControls.supplierURL).toBeTruthy();
      expect(component.supplierDetailControls.supplierURL.value.length).toEqual(0);
      expect(component.supplierDetailControls.sourceType).toBeTruthy();
      expect(component.supplierDetailControls.sourceType.value.length).toEqual(0);
    });

    test('should submit the form', (): void => {
      const _mockStyles: Style[] = mockStyles();
      component.styles = _mockStyles;
      const styleIndex: number = _mockStyles.length / 2;
      const formGroup: FormGroup = new FormGroup({
        itemStyleId: new FormControl(_mockStyles[styleIndex]),
        itemStyleName: new FormControl(_mockStyles[styleIndex])
      });
      component.inventoryForm = formGroup;
      const _mockImage1: Image = mockImage();
      _mockImage1.url = 'test-url-1';
      component.itemLabelImage = _mockImage1;
      const _mockImage2: Image = mockImage();
      _mockImage2.url = 'test-url-2';
      component.supplierLabelImage = _mockImage2;
      const dismissSpy: jest.SpyInstance = jest.spyOn(component.modalCtrl, 'dismiss');

      fixture.detectChanges();
      component.onSubmit();
      expect(dismissSpy).toHaveBeenCalledWith({
        itemStyleId: _mockStyles[styleIndex]._id,
        itemStyleName: _mockStyles[styleIndex].name,
        itemLabelImage: _mockImage1,
        supplierLabelImage: _mockImage2
      });
    });

    test('should submit the form using a batch to find the style', (): void => {
      const _mockStyles: Style[] = mockStyles();
      component.styles = _mockStyles;
      const styleIndex: number = _mockStyles.length / 2;
      const _mockBatch: Batch = mockBatch();
      _mockBatch.annotations.styleId = _mockStyles[styleIndex]._id;
      component.batch = _mockBatch;
      const formGroup: FormGroup = new FormGroup({});
      component.inventoryForm = formGroup;
      const _mockImage1: Image = mockImage();
      _mockImage1.url = 'test-url-1';
      component.itemLabelImage = _mockImage1;
      const _mockImage2: Image = mockImage();
      _mockImage2.url = 'test-url-2';
      component.supplierLabelImage = _mockImage2;
      const dismissSpy: jest.SpyInstance = jest.spyOn(component.modalCtrl, 'dismiss');

      fixture.detectChanges();
      component.onSubmit();
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
      const dismissSpy: jest.SpyInstance = jest.spyOn(component.modalCtrl, 'dismiss');

      fixture.detectChanges();

      component.dismiss();
      expect(dismissSpy).toHaveBeenCalled();
    });

    test('should get loading dismiss handler function', (done: jest.DoneCallback): void => {
      component.loadingCtrl.getTop = jest.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      const getSpy: jest.SpyInstance = jest.spyOn(component.loadingCtrl, 'getTop');
      const dismissSpy: jest.SpyInstance = jest.spyOn(component.loadingCtrl, 'dismiss');

      fixture.detectChanges();

      const dismissFn1: () => Promise<void> = component.dismissLoadingIfHasOverlayFn();
      const dismissFn2: () => Promise<void> = component.dismissLoadingIfHasOverlayFn();
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
      component.recipeService.getPublicAuthorByRecipeId = jest.fn()
        .mockReturnValue(of(_mockAuthor));

      fixture.detectChanges();

      forkJoin([component.getAuthor(''), component.getAuthor('test')])
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

      expect(component.itemLabelImage).toStrictEqual(_defaultImage);
      expect(component.supplierLabelImage).toStrictEqual(_defaultImage);
      // invalid image type - no changes
      component.onImageSelection({ imageType: 'invalid', image: null });
      expect(component.itemLabelImage).toStrictEqual(_defaultImage);
      expect(component.supplierLabelImage).toStrictEqual(_defaultImage);
      // item update
      component.onImageSelection({ imageType: 'itemLabelImage', image: _mockImage1 });
      expect(component.itemLabelImage).toStrictEqual(_mockImage1);
      expect(component.supplierLabelImage).toStrictEqual(_defaultImage);
      // supplier update
      component.onImageSelection({ imageType: 'supplierLabelImage', image: _mockImage2 });
      expect(component.itemLabelImage).toStrictEqual(_mockImage1);
      expect(component.supplierLabelImage).toStrictEqual(_mockImage2);
    });

  });


  describe('Template', (): void => {
    const _mockStyles: Style[] = mockStyles();

    beforeEach((): void => {
      component.ngOnInit = originalOnInit;
      component.libraryService.getStyleLibrary = jest.fn()
        .mockReturnValue(of(_mockStyles));
      component.getAuthor = jest.fn()
        .mockReturnValue(of(null));
      component.dismissLoadingIfHasOverlayFn = jest.fn()
        .mockReturnValue(() => {});
      component.inventoryForm = new FormGroup({});
    });

    test('should render the template for a generic form (expect all fields)', (): void => {
      component.options = {};

      fixture.detectChanges();

      const itemForm: HTMLElement = fixture.nativeElement.querySelector('app-inventory-item-details-form');
      expect(itemForm).toBeTruthy();
      const supplierForm: HTMLElement = fixture.nativeElement.querySelector('app-inventory-supplier-details-form');
      expect(supplierForm).toBeTruthy();
      const stockForm: HTMLElement = fixture.nativeElement.querySelector('app-inventory-stock-details-form');
      expect(stockForm).toBeTruthy();
    });

    test('should render the template for a batch form (stock only)', (): void => {
      component.options = { batch: mockBatch() };

      fixture.detectChanges();

      const itemForm: HTMLElement = fixture.nativeElement.querySelector('app-inventory-item-details-form');
      expect(itemForm).toBeNull();
      const supplierForm: HTMLElement = fixture.nativeElement.querySelector('app-inventory-supplier-details-form');
      expect(supplierForm).toBeNull();
      const stockForm: HTMLElement = fixture.nativeElement.querySelector('app-inventory-stock-details-form');
      expect(stockForm).toBeTruthy();
    });

    test('should render the template for an item form (expect all fields with selections)', (): void => {
      component.styles = _mockStyles;
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      _mockInventoryItem.itemStyleId = _mockStyles[0]._id;
      component.options = { item: _mockInventoryItem };

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
