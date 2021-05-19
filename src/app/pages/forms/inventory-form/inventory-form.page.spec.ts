/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule, LoadingController, ModalController } from '@ionic/angular';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockAuthor, mockBatch, mockInventoryItem, mockImage, mockStyles } from '../../../../../test-config/mock-models';
import { CalculationsServiceStub, ImageServiceStub, LibraryServiceStub, PreferencesServiceStub, RecipeServiceStub, ToastServiceStub, UserServiceStub } from '../../../../../test-config/service-stubs';
import { HeaderComponentStub, QuantityHelperComponentStub } from '../../../../../test-config/component-stubs';
import { LoadingControllerStub, ModalControllerStub, ModalStub } from '../../../../../test-config/ionic-stubs';

/* Interface imports */
import { Author } from '../../../shared/interfaces/author';
import { Batch } from '../../../shared/interfaces/batch';
import { Image } from '../../../shared/interfaces/image';
import { InventoryItem } from '../../../shared/interfaces/inventory-item';
import { Style } from '../../../shared/interfaces/library';

/* Service imports */
import { CalculationsService } from '../../../services/calculations/calculations.service';
import { ImageService } from '../../../services/image/image.service';
import { LibraryService } from '../../../services/library/library.service';
import { PreferencesService } from '../../../services/preferences/preferences.service';
import { RecipeService } from '../../../services/recipe/recipe.service';
import { ToastService } from '../../../services/toast/toast.service';
import { UserService } from '../../../services/user/user.service';

/* Page imports */
import { InventoryFormPage } from './inventory-form.page';


describe('InventoryFormPage', (): void => {
  let fixture: ComponentFixture<InventoryFormPage>;
  let invFormPage: InventoryFormPage;
  let originalOnInit: any;
  const formBuilder: FormBuilder = new FormBuilder();
  const initDefaultForm = (): FormGroup => {
    return formBuilder.group({
      currentQuantity: '',
      description: '',
      initialQuantity: '',
      itemABV: '',
      itemIBU: '',
      itemName: ['', [Validators.required]],
      itemSRM: '',
      itemStyleId: '',
      itemSubname: '',
      sourceType: '',
      stockType: '',
      supplierName: '',
      supplierURL: ''
    });
  };
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        InventoryFormPage,
        HeaderComponentStub,
        QuantityHelperComponentStub
      ],
      imports: [
        IonicModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: CalculationsService, useClass: CalculationsServiceStub },
        { provide: ImageService, useClass: ImageServiceStub },
        { provide: LibraryService, useClass: LibraryServiceStub },
        { provide: LoadingController, useClass: LoadingControllerStub },
        { provide: ModalController, useClass: ModalControllerStub },
        { provide: PreferencesService, useClass: PreferencesServiceStub },
        { provide: RecipeService, useClass: RecipeServiceStub },
        { provide: ToastService, useClass: ToastServiceStub },
        { provide: UserService, useClass: UserServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(InventoryFormPage);
    invFormPage = fixture.componentInstance;
    originalOnInit = invFormPage.ngOnInit;
    invFormPage.ngOnInit = jest
      .fn();
    invFormPage.toastService.presentToast = jest
      .fn();
    invFormPage.toastService.presentErrorToast = jest
      .fn();
    invFormPage.modalCtrl.dismiss = jest
      .fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(invFormPage).toBeDefined();
  });

  describe('Lifecycle', (): void => {

    test('should init the component', (done: jest.DoneCallback): void => {
      const _mockAuthor: Author = mockAuthor();
      const _mockStyles: Style[] = mockStyles();
      const _mockBatch: Batch = mockBatch();

      invFormPage.ngOnInit = originalOnInit;
      invFormPage.options = { batch: _mockBatch };
      invFormPage.isRequired = true;

      invFormPage.getStyleLibrary = jest
        .fn()
        .mockReturnValue(of(_mockStyles));

      invFormPage.getAuthor = jest
        .fn()
        .mockReturnValue(of(_mockAuthor));

      invFormPage.initForm = jest
        .fn();

      invFormPage.loadingCtrl.dismiss = jest
        .fn()
        .mockReturnValue(Promise.resolve());

      const getSpy: jest.SpyInstance = jest.spyOn(invFormPage, 'getAuthor');
      const initSpy: jest.SpyInstance = jest.spyOn(invFormPage, 'initForm');

      fixture.detectChanges();

      setTimeout((): void => {
        expect(getSpy).toHaveBeenCalledWith(_mockBatch.recipeMasterId);
        expect(initSpy).toHaveBeenCalled();
        expect(invFormPage.styles).toStrictEqual(_mockStyles);
        expect(invFormPage.author).toStrictEqual(_mockAuthor);
        expect(invFormPage.onBackClick).toBeUndefined();
        done();
      }, 10);
    });

    test('should get error on component init', (done: jest.DoneCallback): void => {
      const _mockAuthor: Author = mockAuthor();
      invFormPage.options = {};
      invFormPage.ngOnInit = originalOnInit;

      invFormPage.getStyleLibrary = jest
        .fn()
        .mockReturnValue(throwError('test-error'));

      invFormPage.getAuthor = jest
        .fn()
        .mockReturnValue(of(_mockAuthor));

      invFormPage.dismiss = jest
        .fn();

      invFormPage.dismiss.bind = jest
        .fn()
        .mockImplementation((page: InventoryFormPage): () => void => page.dismiss);

      const toastSpy: jest.SpyInstance = jest.spyOn(invFormPage.toastService, 'presentErrorToast');

      fixture.detectChanges();

      setTimeout((): void => {
        expect(toastSpy).toHaveBeenCalledWith(
          'Error loading inventory form',
          invFormPage.dismiss
        );
        done();
      }, 10);
    });

  });


  describe('Initializations', (): void => {

    test('should get a public author', (done: jest.DoneCallback): void => {
      const _mockAuthor: Author = mockAuthor();

      invFormPage.recipeService.getPublicAuthorByRecipeId = jest
        .fn()
        .mockReturnValue(of(_mockAuthor));

      fixture.detectChanges();

      invFormPage.getAuthor('test-id')
        .subscribe(
          (author: Author): void => {
            expect(author).toStrictEqual(_mockAuthor);
            done();
          },
          (error: any): void => {
            console.log('Error in should get a public author', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get null trying to get a public author without a search id', (done: jest.DoneCallback): void => {
      fixture.detectChanges();

      invFormPage.getAuthor('')
        .subscribe(
          (author: Author): void => {
            expect(author).toBeNull();
            done();
          },
          (error: any): void => {
            console.log('Error in \'should get a public author\'', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get style library', (done: jest.DoneCallback): void => {
      const _mockStyles: Style[] = mockStyles();

      invFormPage.libraryService.getStyleLibrary = jest
        .fn()
        .mockReturnValue(of(_mockStyles));

      fixture.detectChanges();

      invFormPage.getStyleLibrary()
        .subscribe(
          (styles: Style[]): void => {
            expect(styles).toStrictEqual(_mockStyles);
            done();
          },
          (error: any): void => {
            console.log('Error in \'should get style library\'', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should initialize the form', (): void => {
      const _mockAuthor: Author = mockAuthor();
      const _mockBatch: Batch = mockBatch();
      const _mockInventoryItem: InventoryItem = mockInventoryItem();

      invFormPage.initFormWithItem = jest
        .fn();

      invFormPage.initFormWithBatch = jest
        .fn();

      invFormPage.initFormGeneric = jest
        .fn();

      invFormPage.author = _mockAuthor;
      invFormPage.options = {};

      const itemSpy: jest.SpyInstance = jest.spyOn(invFormPage, 'initFormWithItem');
      const batchSpy: jest.SpyInstance = jest.spyOn(invFormPage, 'initFormWithBatch');
      const genSpy: jest.SpyInstance = jest.spyOn(invFormPage, 'initFormGeneric');

      // generic init
      fixture.detectChanges();
      invFormPage.initForm();
      expect(genSpy).toHaveBeenCalled();
      expect(invFormPage.title).toMatch('New Item');

      // item init
      invFormPage.options = { item: _mockInventoryItem };
      fixture.detectChanges();
      invFormPage.initForm();
      expect(itemSpy).toHaveBeenCalled();
      expect(genSpy).toHaveBeenCalledTimes(1);
      expect(invFormPage.title).toMatch('Update Item');

      // batch init
      invFormPage.options = { batch: _mockBatch };
      fixture.detectChanges();
      invFormPage.initForm();
      expect(batchSpy).toHaveBeenCalled();
      expect(itemSpy).toHaveBeenCalledTimes(1);
      expect(genSpy).toHaveBeenCalledTimes(1);
      expect(invFormPage.title).toMatch('New Item');
    });

  });


  describe('IonSelect Functions', (): void => {

    test('should set source selection touched flag', (): void => {
      invFormPage.inventoryForm = initDefaultForm();

      fixture.detectChanges();

      invFormPage.onSourceSelect();
      expect(invFormPage.sourceTouched).toBe(true);

      invFormPage.inventoryForm.controls.sourceType.setValue('self');

      invFormPage.onSourceSelect();
      expect(invFormPage.sourceTouched).toBe(false);
    });

    test('should set style selection touched flag', (): void => {
      invFormPage.inventoryForm = initDefaultForm();

      fixture.detectChanges();

      invFormPage.onStyleSelect();
      expect(invFormPage.styleTouched).toBe(true);

      invFormPage.inventoryForm.controls.itemStyleId.setValue('test-id');

      invFormPage.onStyleSelect();
      expect(invFormPage.styleTouched).toBe(false);
    });

    test('should set stock selection touched flag', (): void => {
      invFormPage.inventoryForm = initDefaultForm();
      invFormPage.updateQuantityHint = jest
        .fn();

      fixture.detectChanges();

      invFormPage.onStockSelect();
      expect(invFormPage.stockTouched).toBe(true);

      invFormPage.inventoryForm.controls.stockType.setValue(invFormPage.stockTypes[0]);

      invFormPage.onStockSelect();
      expect(invFormPage.stockTouched).toBe(false);
    });

  });


  describe('Form Handling', (): void => {

    test('should convert form values to numbers', (): void => {
      invFormPage.inventoryForm = formBuilder.group({
        description: 'test description',
        initialQuantity: ['', [Validators.required]],
        itemABV: 5,
        itemIBU: 10,
        itemName: 'test name',
        itemSRM: 15,
        itemStyleId: 'test id',
        itemSubname: 'test subname',
        sourceType: 'self',
        stockType: invFormPage.stockTypes[0],
        supplierName: 'supplier name',
        supplierURL: 'supplier url'
      });

      fixture.detectChanges();

      const converted: object = invFormPage.convertFormValuesToNumbers();
      for (const key in converted) {
        if (converted.hasOwnProperty(key) && invFormPage.numericFieldKeys.includes(key)) {
          expect(typeof converted[key]).toMatch('number');
        }
      }
    });

    test('should init the form from a batch', (): void => {
      const _mockBatch: Batch = mockBatch();

      invFormPage.options = { batch: _mockBatch };

      fixture.detectChanges();

      invFormPage.initFormWithBatch();

      expect(invFormPage.inventoryForm.value).toStrictEqual({
        description: '',
        initialQuantity: '',
        stockType: ''
      });
    });

    test('should init a generic form', (): void => {
      fixture.detectChanges();

      invFormPage.initFormGeneric();

      expect(invFormPage.inventoryForm.value).toStrictEqual({
        description: '',
        initialQuantity: null,
        itemABV: null,
        itemIBU: null,
        itemName: '',
        itemSRM: null,
        itemStyleId: null,
        itemSubname: '',
        sourceType: '',
        stockType: '',
        supplierName: '',
        supplierURL: ''
      });
    });

    test('should init the form from an item', (): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();

      invFormPage.item = _mockInventoryItem;

      invFormPage.initSelectionControl = jest
        .fn();
      invFormPage.initOptionalFieldControls = jest
        .fn();
      invFormPage.updateQuantityHint = jest
        .fn();

      fixture.detectChanges();

      invFormPage.initFormWithItem();

      expect(invFormPage.inventoryForm.value).toStrictEqual({
        currentQuantity: _mockInventoryItem.currentQuantity,
        description: _mockInventoryItem.description,
        initialQuantity: _mockInventoryItem.initialQuantity,
        itemABV: _mockInventoryItem.itemABV,
        itemName: _mockInventoryItem.itemName,
        itemStyleId: null,
        sourceType: _mockInventoryItem.sourceType,
        stockType: _mockInventoryItem.stockType,
        supplierName: _mockInventoryItem.supplierName
      });
    });

    test('should initialize optional fields', (): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();

      invFormPage.item = _mockInventoryItem;
      invFormPage.inventoryForm = formBuilder.group({
        currentQuantity: ['', [Validators.required]],
        description: '',
        initialQuantity: '',
        stockType: '',
        itemName: '',
        itemABV: '',
        itemStyleId: '',
        sourceType: '',
        supplierName: ''
      });

      invFormPage.requiresOptionalFieldControl = jest
        .fn()
        .mockImplementation((key: string) => {
          return key !== 'batchId' && _mockInventoryItem.optionalItemData.hasOwnProperty(key);
        });

      fixture.detectChanges();

      invFormPage.initOptionalFieldControls();

      expect(invFormPage.inventoryForm.value).toStrictEqual({
        currentQuantity: '',
        description: '',
        initialQuantity: '',
        stockType: '',
        itemName: '',
        itemABV: '',
        itemStyleId: '',
        sourceType: '',
        supplierName: '',
        supplierURL: _mockInventoryItem.optionalItemData.supplierURL,
        supplierLabelImage: _mockInventoryItem.optionalItemData.supplierLabelImage,
        itemIBU: _mockInventoryItem.optionalItemData.itemIBU,
        itemSRM: _mockInventoryItem.optionalItemData.itemSRM,
        itemLabelImage: _mockInventoryItem.optionalItemData.itemLabelImage,
        itemSubname: _mockInventoryItem.optionalItemData.itemSubname,
        packagingDate: _mockInventoryItem.optionalItemData.packagingDate,
        originalRecipe: _mockInventoryItem.optionalItemData.originalRecipe,
        srmColor: _mockInventoryItem.optionalItemData.srmColor,
        remainingColor: _mockInventoryItem.optionalItemData.remainingColor
      });
    });

    test('should init the style selection control', (): void => {
      const _mockStyles: Style[] = mockStyles();
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      _mockInventoryItem.itemStyleId = _mockStyles[0]._id;

      invFormPage.styles = _mockStyles;
      invFormPage.item = _mockInventoryItem;
      invFormPage.inventoryForm = formBuilder.group({
        currentQuantity: ['', [Validators.required]],
        description: '',
        initialQuantity: '',
        stockType: '',
        itemName: '',
        itemABV: '',
        itemStyleId: '',
        sourceType: '',
        supplierName: ''
      });

      fixture.detectChanges();

      invFormPage.initSelectionControl();

      expect(invFormPage.styleSelection).toStrictEqual(_mockStyles[0]);
      expect(invFormPage.inventoryForm.controls.itemStyleId.value).toStrictEqual(_mockStyles[0]);
    });

    test('should submit the form', (): void => {
      const _mockStyles: Style[] = mockStyles();
      const _mockStyle: Style = _mockStyles[0];
      const _mockLabelImage: Image = mockImage();
      _mockLabelImage.url = 'label';
      const _mockSupplierImage: Image = mockImage();
      _mockSupplierImage.url = 'supplier';
      const _mockBatch: Batch = mockBatch();
      _mockBatch.annotations.styleId = _mockStyle._id;

      invFormPage.batch = _mockBatch;
      invFormPage.styles = _mockStyles;
      invFormPage.itemLabelImage = _mockLabelImage;
      invFormPage.supplierLabelImage = _mockSupplierImage;

      invFormPage.convertFormValuesToNumbers = jest
        .fn()
        .mockReturnValueOnce({})
        .mockReturnValueOnce({
          itemStyleId: _mockStyle
        });

      const dismissSpy: jest.SpyInstance = jest.spyOn(invFormPage.modalCtrl, 'dismiss');
      const expectedValues: object = {
        itemStyleId: _mockStyle._id,
        itemStyleName: _mockStyle.name,
        itemLabelImage: _mockLabelImage,
        supplierLabelImage: _mockSupplierImage,
      };

      fixture.detectChanges();

      invFormPage.onSubmit();
      expect(dismissSpy).toHaveBeenCalledWith(expectedValues);

      invFormPage.onSubmit();
      expect(dismissSpy).toHaveBeenNthCalledWith(2, expectedValues);
    });

    test('should check if optional object key/value should be mapped', (): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();

      invFormPage.item = _mockInventoryItem;

      fixture.detectChanges();

      expect(invFormPage.requiresOptionalFieldControl('batchId')).toBe(false);
      expect(invFormPage.requiresOptionalFieldControl('itemIBU')).toBe(true);
      expect(invFormPage.requiresOptionalFieldControl('none')).toBe(false);
    });

  });


  describe('Modals', (): void => {

    test('should dismiss the modal with no data', (): void => {
      const dismissSpy: jest.SpyInstance = jest.spyOn(invFormPage.modalCtrl, 'dismiss');

      fixture.detectChanges();

      invFormPage.dismiss();

      expect(dismissSpy).toHaveBeenCalled();
    });

    test('should get quantity helper modal options', (): void => {
      fixture.detectChanges();

      expect(invFormPage.getQuanityHelperModalOptions('initialQuantity', 10)).toStrictEqual({
        headerText: 'select initial quantity',
        quantity: 10
      });
    });

    test('should handle quantity helper modal error', (): void => {
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
      const toastSpy: jest.SpyInstance = jest.spyOn(invFormPage.toastService, 'presentErrorToast');

      fixture.detectChanges();

      const handler: (error: string) => void = invFormPage.onQuantityHelperModalError();
      handler('test-error');

      const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
      expect(consoleCalls[0]).toMatch('modal dismiss error');
      expect(consoleCalls[1]).toMatch('test-error');
      expect(toastSpy).toHaveBeenCalledWith('Error selecting quantity');
    });

    test('should handle quantity helper modal success', (): void => {
      const control: FormControl = new FormControl(1);

      const handlerNoUpdate: (data: object) => void = invFormPage.onQuantityHelperModalSuccess(control);
      handlerNoUpdate({ data: 'a' });
      expect(control.value).toEqual(1);

      const handlerUpdate: (data: object) => void = invFormPage.onQuantityHelperModalSuccess(control);
      handlerUpdate({ data: 10 });
      expect(control.value).toEqual(10);
    });

    test('should open quantity helper modal', (done: jest.DoneCallback): void => {
      invFormPage.inventoryForm = initDefaultForm();
      const control = invFormPage.inventoryForm.controls.initialQuantity;
      control.setValue(10);

      const _stubModal: ModalStub = new ModalStub();

      invFormPage.modalCtrl.create = jest
        .fn()
        .mockReturnValue(Promise.resolve(_stubModal));

      invFormPage.getQuanityHelperModalOptions = jest
        .fn()
        .mockReturnValue({});

      _stubModal.onDidDismiss = jest
        .fn()
        .mockReturnValue(Promise.resolve());

      invFormPage.onQuantityHelperModalSuccess = jest
        .fn();

      const successSpy: jest.SpyInstance = jest.spyOn(invFormPage, 'onQuantityHelperModalSuccess');

      fixture.detectChanges();

      invFormPage.openQuantityHelperModal('initialQuantity');

      _stubModal.onDidDismiss();

      setTimeout((): void => {
        expect(successSpy).toHaveBeenCalledWith(control);
        done();
      }, 10);
    });

    test('should get error message opening quantity helper modal on invalid quantity type', (): void => {
      const toastSpy: jest.SpyInstance = jest.spyOn(invFormPage.toastService, 'presentErrorToast');

      invFormPage.inventoryForm = initDefaultForm();

      fixture.detectChanges();

      invFormPage.openQuantityHelperModal('invalid');

      expect(toastSpy).toHaveBeenCalledWith('Error: invalid quantity type');
    });

    test('get image modal options', (): void => {
      const _mockLabelImage: Image = mockImage();
      _mockLabelImage.url = 'item';
      const _mockSupplierImage: Image = mockImage();
      _mockSupplierImage.url = 'supplier';

      invFormPage.itemLabelImage = _mockLabelImage;
      invFormPage.supplierLabelImage = _mockSupplierImage;
      invFormPage.imageService.hasDefaultImage = jest
        .fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      fixture.detectChanges();

      expect(invFormPage.getImageModalOptions('item')).toStrictEqual({ image: _mockLabelImage });
      expect(invFormPage.getImageModalOptions('supplier')).toStrictEqual({ image: _mockSupplierImage });
      expect(invFormPage.getImageModalOptions('item')).toBeNull();
      expect(invFormPage.getImageModalOptions('invalid')).toBeNull();
    });

    test('should handle image modal error', (): void => {
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
      const toastSpy: jest.SpyInstance = jest.spyOn(invFormPage.toastService, 'presentErrorToast');

      fixture.detectChanges();

      const handler: (error: string) => void = invFormPage.onImageModalError();
      handler('test-error');

      const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
      expect(consoleCalls[0]).toMatch('modal dismiss error');
      expect(consoleCalls[1]).toMatch('test-error');
      expect(toastSpy).toHaveBeenCalledWith('Error selecting image');
    });

    test('should handle image modal success', (): void => {
      const _mockImage: Image = mockImage();

      fixture.detectChanges();

      expect(invFormPage.itemLabelImage).not.toStrictEqual(_mockImage);
      expect(invFormPage.supplierLabelImage).not.toStrictEqual(_mockImage);

      const noneHandler: (data: object) => void = invFormPage.onImageModalSuccess('item');
      noneHandler({});
      expect(invFormPage.itemLabelImage).not.toStrictEqual(_mockImage);
      expect(invFormPage.supplierLabelImage).not.toStrictEqual(_mockImage);

      const itemHandler: (data: object) => void = invFormPage.onImageModalSuccess('item');
      itemHandler({ data: _mockImage });
      expect(invFormPage.itemLabelImage).toStrictEqual(_mockImage);
      expect(invFormPage.supplierLabelImage).not.toStrictEqual(_mockImage);

      const supplierHandler: (data: object) => void = invFormPage.onImageModalSuccess('supplier');
      supplierHandler({ data: _mockImage });
      expect(invFormPage.itemLabelImage).toStrictEqual(_mockImage);
      expect(invFormPage.supplierLabelImage).toStrictEqual(_mockImage);
    });

    test('should open image modal', (done: jest.DoneCallback): void => {
      invFormPage.inventoryForm = initDefaultForm();

      const _stubModal: ModalStub = new ModalStub();

      invFormPage.modalCtrl.create = jest
        .fn()
        .mockReturnValue(Promise.resolve(_stubModal));

      invFormPage.getImageModalOptions = jest
        .fn()
        .mockReturnValue({});

      _stubModal.onDidDismiss = jest
        .fn()
        .mockReturnValue(Promise.resolve());

      invFormPage.onImageModalSuccess = jest
        .fn();

      const successSpy: jest.SpyInstance = jest.spyOn(invFormPage, 'onImageModalSuccess');

      fixture.detectChanges();

      invFormPage.openImageModal('item');

      _stubModal.onDidDismiss();

      setTimeout((): void => {
        expect(successSpy).toHaveBeenCalledWith('item');
        done();
      }, 10);
    });

  });


  describe('Other', (): void => {

    test('should update quantity helper button and hint', (): void => {
      invFormPage.inventoryForm = initDefaultForm();

      fixture.detectChanges();

      expect(invFormPage.allowHelper).toBe(false);
      expect(invFormPage.quantityHint.length).toEqual(0);

      invFormPage.updateQuantityHint();

      invFormPage.inventoryForm.controls.stockType.setValue('Keg');

      invFormPage.updateQuantityHint();

      expect(invFormPage.allowHelper).toBe(true);
      expect(invFormPage.quantityHint).toMatch('(pints)');

      invFormPage.inventoryForm.controls.stockType.setValue('Standard Can');

      invFormPage.updateQuantityHint();

      expect(invFormPage.allowHelper).toBe(false);
      expect(invFormPage.quantityHint.length).toEqual(0);
    });

  });

  describe('Render Template', (): void => {

    test('should render generic form', (): void => {
      const _mockAuthor: Author = mockAuthor();
      const _mockStyles: Style[] = mockStyles();
      const _mockLabelImage: Image = mockImage();
      _mockLabelImage.url = 'label';
      const _mockSupplierImage: Image = mockImage();
      _mockSupplierImage.url = 'supplier';

      invFormPage.itemLabelImage = _mockLabelImage;
      invFormPage.supplierLabelImage = _mockSupplierImage;
      invFormPage.author = _mockAuthor;
      invFormPage.styles = _mockStyles;
      invFormPage.options = {};

      invFormPage.initFormGeneric();

      fixture.detectChanges();

      const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');

      const nameElem: HTMLElement = <HTMLElement>items.item(0);
      expect(nameElem.children[0].textContent).toMatch('Item Name');
      expect(nameElem.children[1]['value'].length).toEqual(0);

      const subNameElem: HTMLElement = <HTMLElement>items.item(1);
      expect(subNameElem.children[0].textContent).toMatch('Item Additional Name');
      expect(subNameElem.children[1]['value'].length).toEqual(0);

      const itemImageElem: HTMLElement = <HTMLElement>items.item(2);
      expect(itemImageElem.children[0].textContent).toMatch('Item Label Image');
      const itemImg: HTMLElement = itemImageElem.querySelector('img');
      expect(itemImg.getAttribute('src')).toMatch(_mockLabelImage.url);

      const descriptionElem: HTMLElement = <HTMLElement>items.item(3);
      expect(descriptionElem.children[0].textContent).toMatch('Description');
      expect(descriptionElem.children[1]['value'].length).toEqual(0);

      const styleSelectElem: HTMLElement = <HTMLElement>items.item(4);
      expect(styleSelectElem.children[0].textContent).toMatch('Select Style');
      const styleOptions: NodeList = styleSelectElem.querySelectorAll('ion-select-option');
      styleOptions.forEach((option: Node, index: number): void => {
        expect(option['value']).toStrictEqual(invFormPage.styles[index]);
      });

      const abvElem: HTMLElement = <HTMLElement>items.item(5);
      expect(abvElem.children[0].textContent).toMatch('ABV');
      expect(abvElem.children[1]['value'].length).toEqual(0);

      const ibuElem: HTMLElement = <HTMLElement>items.item(6);
      expect(ibuElem.children[0].textContent).toMatch('IBU');
      expect(ibuElem.children[1]['value'].length).toEqual(0);

      const srmElem: HTMLElement = <HTMLElement>items.item(7);
      expect(srmElem.children[0].textContent).toMatch('SRM');
      expect(srmElem.children[1]['value'].length).toEqual(0);

      const supplierNameElem: HTMLElement = <HTMLElement>items.item(8);
      expect(supplierNameElem.children[0].textContent).toMatch('Supplier Name');
      expect(supplierNameElem.children[1]['value'].length).toEqual(0);

      const supplierURLElem: HTMLElement = <HTMLElement>items.item(9);
      expect(supplierURLElem.children[0].textContent).toMatch('Supplier Website URL');
      expect(supplierURLElem.children[1]['value'].length).toEqual(0);

      const supplierImageElem: HTMLElement = <HTMLElement>items.item(10);
      expect(supplierImageElem.children[0].textContent).toMatch('Supplier Label Image');
      const supplierImg: HTMLElement = supplierImageElem.querySelector('img');
      expect(supplierImg.getAttribute('src')).toMatch(_mockSupplierImage.url);

      const sourceSelectElem: HTMLElement = <HTMLElement>items.item(11);
      expect(sourceSelectElem.children[0].textContent).toMatch('Item Source');
      const sourceOptions: NodeList = sourceSelectElem.querySelectorAll('ion-select-option');
      expect(sourceOptions.item(0)['value']).toMatch('self');
      expect(sourceOptions.item(1)['value']).toMatch('other');
      expect(sourceOptions.item(2)['value']).toMatch('third');

      const stockSelectElem: HTMLElement = <HTMLElement>items.item(12);
      expect(stockSelectElem.children[0].textContent).toMatch('Stock Type');
      const stockOptions: NodeList = stockSelectElem.querySelectorAll('ion-select-option');
      stockOptions.forEach((option: Node, index: number): void => {
        expect(option['value']).toStrictEqual(invFormPage.stockTypes[index].name);
      });

      const initQElem: HTMLElement = <HTMLElement>items.item(13);
      expect(initQElem.children[0].textContent).toMatch('Initial Quantity');
      expect(initQElem.children[1]['value'].length).toEqual(0);
    });

    test('should render template that has a batch', (): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockLabelImage: Image = mockImage();
      _mockLabelImage.url = 'label';
      const _mockSupplierImage: Image = mockImage();
      _mockSupplierImage.url = 'supplier';

      invFormPage.batch = _mockBatch;
      invFormPage.itemLabelImage = _mockLabelImage;
      invFormPage.supplierLabelImage = _mockSupplierImage;

      invFormPage.initFormWithBatch();

      fixture.detectChanges();

      const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');

      const itemImageElem: HTMLElement = <HTMLElement>items.item(0);
      expect(itemImageElem.children[0].textContent).toMatch('Item Label Image');
      const itemImg: HTMLElement = itemImageElem.querySelector('img');
      expect(itemImg.getAttribute('src')).toMatch(_mockLabelImage.url);

      const descriptionElem: HTMLElement = <HTMLElement>items.item(1);
      expect(descriptionElem.children[0].textContent).toMatch('Description');
      expect(descriptionElem.children[1]['value'].length).toEqual(0);

      const supplierImageElem: HTMLElement = <HTMLElement>items.item(2);
      expect(supplierImageElem.children[0].textContent).toMatch('Supplier Label Image');
      const supplierImg: HTMLElement = supplierImageElem.querySelector('img');
      expect(supplierImg.getAttribute('src')).toMatch(_mockSupplierImage.url);

      const stockSelectElem: HTMLElement = <HTMLElement>items.item(3);
      expect(stockSelectElem.children[0].textContent).toMatch('Stock Type');
      const stockOptions: NodeList = stockSelectElem.querySelectorAll('ion-select-option');
      stockOptions.forEach((option: Node, index: number): void => {
        expect(option['value']).toStrictEqual(invFormPage.stockTypes[index].name);
      });
    });

    test('should render template that has an item', (): void => {
      const _mockStyles: Style[] = mockStyles();
      const _mockStyle: Style = _mockStyles[0];
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      _mockInventoryItem.stockType = 'Keg';

      const _mockLabelImage: Image = mockImage();
      _mockLabelImage.url = 'label';
      const _mockSupplierImage: Image = mockImage();
      _mockSupplierImage.url = 'supplier';

      invFormPage.styles = _mockStyles;
      invFormPage.itemLabelImage = _mockLabelImage;
      invFormPage.supplierLabelImage = _mockSupplierImage;
      invFormPage.item = _mockInventoryItem;
      invFormPage.quantityHint = '(pints)';
      invFormPage.allowHelper = true;

      invFormPage.initSelectionControl = jest
        .fn();

      invFormPage.initOptionalFieldControls = jest
        .fn();

      invFormPage.updateQuantityHint = jest
        .fn();

      invFormPage.initFormWithItem();

      invFormPage.inventoryForm.controls.itemStyleId.setValue(_mockStyle);

      fixture.detectChanges();

      const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');

      const nameElem: HTMLElement = <HTMLElement>items.item(0);
      expect(nameElem.children[0].textContent).toMatch('Item Name');
      expect(nameElem.children[1]['value']).toMatch(_mockInventoryItem.itemName);

      const itemImageElem: HTMLElement = <HTMLElement>items.item(1);
      expect(itemImageElem.children[0].textContent).toMatch('Item Label Image');
      const itemImg: HTMLElement = itemImageElem.querySelector('img');
      expect(itemImg.getAttribute('src')).toMatch(_mockLabelImage.url);

      const descriptionElem: HTMLElement = <HTMLElement>items.item(2);
      expect(descriptionElem.children[0].textContent).toMatch('Description');
      expect(descriptionElem.children[1]['value']).toMatch(_mockInventoryItem.description);

      const styleSelectElem: HTMLElement = <HTMLElement>items.item(3);
      expect(styleSelectElem.children[0].textContent).toMatch('Select Style');
      expect(styleSelectElem.children[1]['value']).toStrictEqual(_mockStyle);

      const abvElem: HTMLElement = <HTMLElement>items.item(4);
      expect(abvElem.children[0].textContent).toMatch('ABV');
      expect(abvElem.children[1]['value']).toEqual(_mockInventoryItem.itemABV);

      const supplierNameElem: HTMLElement = <HTMLElement>items.item(5);
      expect(supplierNameElem.children[0].textContent).toMatch('Supplier Name');
      expect(supplierNameElem.children[1]['value']).toMatch(_mockInventoryItem.supplierName);

      const supplierImageElem: HTMLElement = <HTMLElement>items.item(6);
      expect(supplierImageElem.children[0].textContent).toMatch('Supplier Label Image');
      const supplierImg: HTMLElement = supplierImageElem.querySelector('img');
      expect(supplierImg.getAttribute('src')).toMatch(_mockSupplierImage.url);

      const sourceSelectElem: HTMLElement = <HTMLElement>items.item(7);
      expect(sourceSelectElem.children[0].textContent).toMatch('Item Source');
      expect(sourceSelectElem.children[1]['value']).toMatch(_mockInventoryItem.sourceType);

      const stockSelectElem: HTMLElement = <HTMLElement>items.item(8);
      expect(stockSelectElem.children[0].textContent).toMatch('Stock Type');
      expect(stockSelectElem.children[1]['value']).toMatch(_mockInventoryItem.stockType);

      const initQElem: HTMLElement = <HTMLElement>items.item(9);
      expect(initQElem.children[0].textContent).toMatch('Initial Quantity (Pints)');
      expect(initQElem.children[1]['value']).toEqual(_mockInventoryItem.initialQuantity);
      const initQButton: HTMLElement = <HTMLElement>initQElem.children[2];
      expect(initQButton).not.toBeNull();
      expect(initQButton.children[0].getAttribute('name')).toMatch('open-outline');

      const currentQElem: HTMLElement = <HTMLElement>items.item(10);
      expect(currentQElem.children[0].textContent).toMatch('Current Quantity (Pints)');
      expect(currentQElem.children[1]['value']).toEqual(_mockInventoryItem.currentQuantity);
      const currentQButton: HTMLElement = <HTMLElement>currentQElem.children[2];
      expect(currentQButton).not.toBeNull();
      expect(currentQButton.children[0].getAttribute('name')).toMatch('open-outline');
    });

    test('should render generic form errors', (): void => {
      const _mockStyles: Style[] = mockStyles();

      invFormPage.styles = _mockStyles;
      invFormPage.options = {};
      invFormPage.sourceTouched = true;
      invFormPage.stockTouched = true;
      invFormPage.styleTouched = true;

      invFormPage.initFormGeneric();

      const controls: { [key: string]: AbstractControl } = invFormPage.inventoryForm.controls;

      controls.description.setValue(Array(501).fill('a').join(''));
      controls.itemIBU.setValue(-1);
      controls.itemSRM.setValue(-1);
      controls.itemSubname.setValue('a');
      controls.supplierURL.setValue(Array(2001).fill('a').join(''));

      for (const key in controls) {
        if (controls.hasOwnProperty(key)) {
          controls[key].markAsTouched();
        }
      }
      invFormPage.inventoryForm.updateValueAndValidity();

      fixture.detectChanges();

      const errors: NodeList = fixture.nativeElement.querySelectorAll('form-error');

      expect((<HTMLElement>errors.item(0)).getAttribute('controlName')).toMatch('itemName');
      expect((<HTMLElement>errors.item(1)).getAttribute('controlName')).toMatch('itemSubname');
      expect((<HTMLElement>errors.item(2)).getAttribute('controlName')).toMatch('description');
      expect((<HTMLElement>errors.item(3)).getAttribute('controlName')).toMatch('itemStyleId');
      expect((<HTMLElement>errors.item(4)).getAttribute('controlName')).toMatch('itemABV');
      expect((<HTMLElement>errors.item(5)).getAttribute('controlName')).toMatch('itemIBU');
      expect((<HTMLElement>errors.item(6)).getAttribute('controlName')).toMatch('itemSRM');
      expect((<HTMLElement>errors.item(7)).getAttribute('controlName')).toMatch('supplierName');
      expect((<HTMLElement>errors.item(8)).getAttribute('controlName')).toMatch('supplierURL');
      expect((<HTMLElement>errors.item(9)).getAttribute('controlName')).toMatch('sourceType');
      expect((<HTMLElement>errors.item(10)).getAttribute('controlName')).toMatch('stockType');
      expect((<HTMLElement>errors.item(11)).getAttribute('controlName')).toMatch('initialQuantity');
    });

    test('should render template with form buttons', (): void => {
      invFormPage.isRequired = false;

      fixture.detectChanges();

      const buttons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');

      expect(buttons.item(0).textContent).toMatch('Cancel');
      expect(buttons.item(1).textContent).toMatch('Submit');
    });

  });

});
