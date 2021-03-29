/* Module imports */
import { Component, OnInit, Input } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Observable, forkJoin, from, of } from 'rxjs';

/* Contants imports */
import { OPTIONAL_INVENTORY_DATA_KEYS } from '../../../shared/constants/optional-inventory-data-keys';
import { STOCK_TYPES } from '../../../shared/constants/stock-types';

/* Default imports */
import { defaultImage } from '../../../shared/defaults/default-image';

/* Utility functions imports */
import { hasId } from '../../../shared/utility-functions/id-helpers';
import { compareWith } from '../../../shared/utility-functions/utilities';

/* Interface imports */
import { Author } from '../../../shared/interfaces/author';
import { Batch } from '../../../shared/interfaces/batch';
import { Image } from '../../../shared/interfaces/image';
import { InventoryItem } from '../../../shared/interfaces/inventory-item';
import { StockType } from '../../../shared/interfaces/stocktype';
import { Style } from '../../../shared/interfaces/library';

/* Page imports */
import { ImageFormPage } from '../image-form/image-form.page';

/* Service imports */
import { ImageService } from '../../../services/image/image.service';
import { LibraryService } from '../../../services/library/library.service';
import { RecipeService } from '../../../services/recipe/recipe.service';
import { ToastService } from '../../../services/toast/toast.service';
import { UserService } from '../../../services/user/user.service';


@Component({
  selector: 'page-inventory-form',
  templateUrl: './inventory-form.page.html',
  styleUrls: ['./inventory-form.page.scss']
})
export class InventoryFormPage implements OnInit {
  @Input() isRequired: boolean = false;
  @Input() options: { item?: InventoryItem, batch?: Batch };
  _defaultImage: Image = defaultImage();
  author: Author = null;
  batch: Batch = null;
  compareWithFn: (o1: any, o2: any) => boolean = compareWith;
  inventoryForm: FormGroup = null;
  item: InventoryItem = null;
  itemLabelImage: Image = this._defaultImage;
  numericFieldKeys: string[] = [
    'initialQuantity',
    'currentQuantity',
    'itemABV',
    'itemIBU',
    'itemSRM'
  ];
  onBackClick: () => void;
  selectOptions: object = { cssClass: 'select-popover' };
  sourceTouched: boolean = false;
  stockTouched: boolean = false;
  stockTypes: StockType[] = STOCK_TYPES;
  styles: Style[] = null;
  styleSelection: Style;
  styleTouched: boolean = false;
  supplierLabelImage: Image = this._defaultImage;
  title: string = '';

  constructor(
    public formBuilder: FormBuilder,
    public imageService: ImageService,
    public libraryService: LibraryService,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public recipeService: RecipeService,
    public toastService: ToastService,
    public userService: UserService
  ) { }

  /***** Lifecycle Hooks *****/

  ngOnInit() {
    console.log('inventory form init');

    let searchId: string = '';
    if (this.options.batch) {
      searchId = this.options.batch.recipeMasterId;
    }

    forkJoin(
      this.getStyleLibrary(),
      this.getAuthor(searchId)
    )
    .subscribe(
      ([styles, author]): void => {
        this.onBackClick = this.isRequired
          ? undefined
          : this.dismiss.bind(this);
        this.styles = styles;
        this.author = author;
        this.initForm();
        this.loadingCtrl.dismiss().then(() => {});
      },
      (error: string): void => {
        console.log('Inventory form error', error);
        this.toastService.presentErrorToast(
          'Error loading inventory form',
          this.dismiss.bind(this)
        );
      }
    );
  }

  /***** End Lifecycle Hooks *****/


  /***** Initializations *****/

  /**
   * Get recipe author prior to form generation
   *
   * @params: searchId - recipe master id to use in search
   *
   * @return: observable of style library
   */
  getAuthor(searchId: string): Observable<Author> {
    if (!searchId) {
      return of(null);
    }
    return this.recipeService.getPublicAuthorByRecipeId(searchId);
  }

  /**
   * Get styles library prior to form generation
   *
   * @params: none
   *
   * @return: observable of style library
   */
  getStyleLibrary(): Observable<Style[]> {
    return this.libraryService.getStyleLibrary();
  }

  /**
   * Initialize the form depending on whether an item, batch, or nothing was
   * passed to component as an option
   *
   * @params: none
   * @return: none
   */
  initForm(): void {
    const item: InventoryItem = this.options.item;
    const batch: Batch = this.options.batch;
    let title = 'New Item';

    if (item) {
      // Populate form with given item values as an update
      this.item = item;
      title = 'Update Item';
      this.itemLabelImage = item.optionalItemData.itemLabelImage || this._defaultImage;
      this.supplierLabelImage = item.optionalItemData.supplierLabelImage || this._defaultImage;
      this.initFormWithItem();
    } else if (batch) {
      // Populate form fields for initial new item with a batch as a base
      this.batch = batch;
      this.supplierLabelImage = this.author.breweryLabelImage || this._defaultImage;
      this.itemLabelImage = this.batch.contextInfo.recipeImage || this._defaultImage;
      this.initFormWithBatch();
    } else {
      // Populate form fields for new item with no previous references
      this.initFormGeneric();
    }

    this.title = title;
  }

  /***** End Initializations *****/


  /***** IonSelect Functions *****/

  /**
   * Set source ion-select touched property based on whether it has a value
   *
   * @params: none
   * @return: none
   */
  onSourceSelect(): void {
    this.sourceTouched = !this.inventoryForm.controls.sourceType.value;
  }

  /**
   * Set style ion-select touched property based on whether it has a value
   *
   * @params: none
   * @return: none
   */
  onStyleSelect(): void {
    this.styleTouched = !this.inventoryForm.controls.itemStyleId.value;
  }

  /**
   * Set stock ion-select touched property based on whether it has a value
   *
   * @params: none
   * @return: none
   */
  onStockSelect(): void {
    this.stockTouched = !this.inventoryForm.controls.stockType.value;
  }

  /***** End IonSelect Functions *****/


  /***** Form Handler methods *****/

  /**
   * Convert ion-input numeric strings to numbers
   *
   * @params: none
   *
   * @return: converted form values
   */
  convertFormValuesToNumbers(): object {
    const formValues: object = this.inventoryForm.value;
    this.numericFieldKeys.forEach((key: string): void => {
      if (formValues.hasOwnProperty(key)) {
        formValues[key] = parseFloat(formValues[key]);
      }
    });
    return formValues;
  }

  /**
   * Initialize the form using given batch values as form values
   *
   * @params: none
   * @return: none
   */
  initFormWithBatch(): void {
    this.inventoryForm = this.formBuilder.group({
      description: ['', [Validators.maxLength(500)]],
      initialQuantity: ['', [Validators.required]],
      stockType: ['', [Validators.required]]
    });
  }

  /**
   * Initialize the form with default values
   *
   * @params: none
   * @return: none
   */
  initFormGeneric(): void {
    this.inventoryForm = this.formBuilder.group({
      description: ['', [Validators.maxLength(500)]],
      initialQuantity: [null, [Validators.required, Validators.min(1)]],
      itemABV: [null, [Validators.required, Validators.min(0)]],
      itemIBU: null,
      itemName: [
        '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(50)]
      ],
      itemSRM: null,
      itemStyleId: [null, [Validators.required]],
      itemSubname: ['', [Validators.minLength(2), Validators.maxLength(50)]],
      sourceType: ['', [Validators.required]],
      stockType: ['', [Validators.required]],
      supplierName: [
        '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(50)]
      ],
      supplierURL: ''
    });
  }

  /**
   * Initialize the form using given item values as form values
   *
   * @params: none
   * @return: none
   */
  initFormWithItem(): void {
    this.inventoryForm = this.formBuilder.group({
      currentQuantity: [this.item.currentQuantity, [Validators.required]],
      description: [this.item.description, [Validators.maxLength(500)]],
      initialQuantity: [
        this.item.initialQuantity,
        [Validators.required, Validators.min(1)]
      ],
      itemABV: [this.item.itemABV, [Validators.required, Validators.min(0)]],
      itemName: [
        this.item.itemName,
        [Validators.required, Validators.minLength(2), Validators.maxLength(50)]
      ],
      itemStyleId: [null, [Validators.required]],
      sourceType: [this.item.sourceType, [Validators.required]],
      stockType: [this.item.stockType, [Validators.required]],
      supplierName: [
        this.item.supplierName,
        [Validators.required, Validators.minLength(2), Validators.maxLength(50)]
      ]
    });
    this.initSelectionControl();
    this.initOptionalFieldControls();
  }

  /**
   * Create controls for any optional fields present
   *
   * @params: none
   * @return: none
   */
  initOptionalFieldControls(): void {
    OPTIONAL_INVENTORY_DATA_KEYS.forEach((optionalKey: string): void => {
      if (this.requiresOptionalFieldControl(optionalKey)) {
        const addValue: any = this.item.optionalItemData[optionalKey];
        this.inventoryForm.addControl(
          optionalKey,
          new FormControl(addValue !== undefined ? addValue : '')
        );
      }
    });
  }

  /**
   * Populate ion-selects with currently chosen option
   *
   * @params: none
   * @return: none
   */
  initSelectionControl(): void {
    this.styleSelection = this.styles.find((style: Style): boolean => {
      return hasId(style, this.item.itemStyleId);
    });

    this.inventoryForm.controls.itemStyleId.setValue(this.styleSelection);
  }

  /**
   * Format the form values and call ViewController dismiss with those values
   *
   * @params: none
   * @return: none
   */
  onSubmit(): void {
    const formValues: object = this.convertFormValuesToNumbers();
    const style: Style = formValues['itemStyleId'] !== undefined
      ? formValues['itemStyleId']
      : this.styles.find((_style: Style): boolean => {
          return hasId(_style, this.batch.annotations.styleId);
        });
    formValues['itemStyleId'] = style._id;
    formValues['itemStyleName'] = style.name;
    formValues['itemLabelImage'] = this.itemLabelImage;
    formValues['supplierLabelImage'] = this.supplierLabelImage;
    this.modalCtrl.dismiss(formValues);
  }

  /**
   * Check if optional item data has given key
   *
   * @params: optionalKey - object property to check for
   *
   * @return: true if key exists in optionalItemData and is not 'batchId'
   */
  requiresOptionalFieldControl(optionalKey: string): boolean {
    return optionalKey !== 'batchId' && this.item.optionalItemData.hasOwnProperty(optionalKey);
  }

  /***** End Form Handler Methods *****/


  /***** Modal Methods *****/

  /**
   * Call ModalController dismiss method with no return data
   *
   * @params: none
   * @return: none
   */
  dismiss(): void {
    this.modalCtrl.dismiss();
  }

  /**
   * Open image selection modal
   *
   * @params: imageType - assign image to this item property
   *
   * @return: none
   */
  async openImageModal(imageType: string): Promise<void> {
    let options: { image: Image } = null;
    if (imageType === 'item' && !this.imageService.hasDefaultImage(this.itemLabelImage)) {
      options = { image: this.itemLabelImage };
    } else if (imageType === 'supplier' && !this.imageService.hasDefaultImage(this.supplierLabelImage)) {
      options = { image: this.supplierLabelImage };
    }

    const modal: HTMLIonModalElement = await this.modalCtrl.create({
      component: ImageFormPage,
      componentProps: options
    });

    from(modal.onDidDismiss())
      .subscribe(
        (data: object): void => {
          const _data: Image = data['data'];
          if (imageType === 'item' && _data) {
            this.itemLabelImage = _data;
          } else if (imageType === 'supplier' && _data) {
            this.supplierLabelImage = _data;
          }
        },
        (error: string): void => {
          console.log('modal dismiss error', error);
          this.toastService.presentErrorToast('Error selecting image');
        }
      );

    await modal.present();
  }

  /***** End Modal Methods *****/

}
