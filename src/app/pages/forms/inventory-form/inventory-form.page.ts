/* Module imports */
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ModalController } from '@ionic/angular';
import { forkJoin, Observable, of } from 'rxjs';
import { finalize } from 'rxjs/operators';

/* Contants imports */
import { DESCRIPTION_MAX_LENGTH, NAME_MAX_LENGTH, NAME_MIN_LENGTH, URL_MAX_LENGTH } from '../../../shared/constants';

/* Default imports */
import { defaultImage } from '../../../shared/defaults';

/* Interface imports */
import { Author, Batch, FormSelectOption, Image, InventoryItem, Style } from '../../../shared/interfaces';

/* Service imports */
import { ErrorReportingService, IdService, LibraryService, RecipeService } from '../../../services/services';


@Component({
  selector: 'app-page-inventory-form',
  templateUrl: './inventory-form.page.html',
  styleUrls: ['./inventory-form.page.scss']
})
export class InventoryFormPage implements OnInit {
  @Input() isRequired: boolean = false;
  @Input() options: { item?: InventoryItem, batch?: Batch };
  _defaultImage: Image = defaultImage();
  author: Author = null;
  batch: Batch = null;
  inventoryForm: FormGroup = null;
  isFormValid: boolean = false;
  itemDetailControls: { [key: string]: FormControl } = null;
  itemLabelImage: Image = this._defaultImage;
  onBackClick: () => void;
  selectedSource: string = null;
  selectedStockTypeName: string = null;
  selectedStyle: Style = null;
  stockDetailControls: { [key: string]: FormControl } = null;
  styleOptions: FormSelectOption[] = [];
  styles: Style[] = null;
  supplierDetailControls: { [key: string]: FormControl } = null;
  supplierLabelImage: Image = this._defaultImage;
  title: string = '';

  constructor(
    public errorReporter: ErrorReportingService,
    public formBuilder: FormBuilder,
    public idService: IdService,
    public libraryService: LibraryService,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public recipeService: RecipeService
  ) {}

  /***** Lifecycle Hooks *****/

  ngOnInit(): void {
    let searchId: string = '';
    if (this.options.batch) {
      searchId = this.options.batch.recipeMasterId;
    }

    forkJoin(this.libraryService.getStyleLibrary(), this.getAuthor(searchId))
      .pipe(finalize(this.dismissLoadingIfHasOverlayFn()))
      .subscribe(
        ([styles, author]): void => {
          this.onBackClick = this.isRequired ? undefined : this.dismiss.bind(this);
          this.styles = styles;
          this.author = author;
          this.initForm();
        },
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /***** End Lifecycle Hooks *****/


  /***** Form Methods *****/

  /**
   * Add given from controls to inventory form
   *
   * @param: controls - object containing form controls
   * @param: [item] - optional given inventory item to use as default form values
   * @return: none
   */
  addFormControls(controls: { [key: string]: FormControl }, item?: InventoryItem): void {
    if (this.inventoryForm) {
      for (const key in controls) {
        if (controls.hasOwnProperty(key)) {
          this.inventoryForm.addControl(key, controls[key]);
          if (item && item.hasOwnProperty(key)) {
            this.inventoryForm.controls[key].setValue(item[key]);
          }
        }
      }
    }
  }

  /**
   * Build form select options
   *
   * @param: none
   * @return: none
   */
  buildFormSelectOptions(): void {
    if (this.styles) {
      this.styleOptions = this.styles.map((style: Style): FormSelectOption => {
        return { label: style.name, value: style };
      });
    }
  }

  /**
   * Initialize the form
   *
   * @param: none
   * @return: none
   */
  initForm(): void {
    this.inventoryForm = new FormGroup({});
    this.buildFormSelectOptions();
    const item: InventoryItem = this.options.item;
    const batch: Batch = this.options.batch;
    this.title = 'New Item';

    if (batch) {
      this.batch = batch;
      this.initStockDetailControls();
    } else {
      if (item) {
        this.selectedStyle = this.styles.find((style: Style): boolean => {
          return this.idService.hasId(style, item.itemStyleId);
        });
        this.selectedSource = item.sourceType;
        this.selectedStockTypeName = item.stockType;
        this.title = 'Update Item';
      }
      this.initItemDetailControls(item);
      this.initStockDetailControls(item);
      this.initSupplierDetailControls(item);
    }
  }

  /**
   * Create item details form section controls
   *
   * @param: [item] - optional given inventory item to use as default form values
   * @return: none
   */
  initItemDetailControls(item?: InventoryItem): void {
    const itemDetailControls: { [key: string]: FormControl } = {
      itemName:    new FormControl(''  , [Validators.required, Validators.minLength(NAME_MIN_LENGTH), Validators.maxLength(NAME_MAX_LENGTH)]),
      itemSubname: new FormControl(''  , [Validators.minLength(NAME_MIN_LENGTH), Validators.maxLength(NAME_MAX_LENGTH)]                     ),
      description: new FormControl(''  , [Validators.maxLength(DESCRIPTION_MAX_LENGTH)]                                                     ),
      itemStyleId: new FormControl(''  , [Validators.required]                                                                              ),
      itemABV:     new FormControl(null, [Validators.required, Validators.min(0)]                                                           ),
      itemIBU:     new FormControl(null, [Validators.min(0)]                                                                                ),
      itemSRM:     new FormControl(null, [Validators.min(0)]                                                                                )
    };
    this.itemDetailControls = itemDetailControls;
    this.addFormControls(itemDetailControls, item);
  }

  /**
   * Create stock details form seciton controls
   *
   * @param: [item] - optional given inventory item to use as default form values
   * @return: none
   */
  initStockDetailControls(item?: InventoryItem): void {
    const stockDetailControls: { [key: string]: FormControl } = {
      stockType:       new FormControl(''  , [Validators.required]                   ),
      initialQuantity: new FormControl(null, [Validators.min(1), Validators.required]),
      currentQuantity: new FormControl(null, [Validators.min(0), Validators.required])
    };
    this.stockDetailControls = stockDetailControls;
    this.addFormControls(stockDetailControls, item);
  }

  /**
   * Create supplier details form section controls
   *
   * @param: [item] - optional given inventory item to use as default form values
   * @return: none
   */
  initSupplierDetailControls(item?: InventoryItem): void {
    const supplierDetailControls: { [key: string]: FormControl } = {
      supplierName: new FormControl('', [Validators.required, Validators.minLength(NAME_MIN_LENGTH), Validators.maxLength(NAME_MAX_LENGTH)]),
      supplierURL:  new FormControl('', [Validators.maxLength(URL_MAX_LENGTH)]                                                             ),
      sourceType:   new FormControl('', [Validators.required]                                                                              )
    };
    this.supplierDetailControls = supplierDetailControls;
    this.addFormControls(supplierDetailControls, item);
  }

  /**
   * Format the form values and call ViewController dismiss with those values
   *
   * @param: none
   * @return: none
   */
  onSubmit(): void {
    const formValues: object = this.inventoryForm.value;
    let style: Style = formValues['itemStyleId'];
    if (!style) {
      style = this.styles.find((_style: Style): boolean => {
        return this.idService.hasId(_style, this.batch.annotations.styleId);
      });
    }
    formValues['itemStyleId'] = style._id;
    formValues['itemStyleName'] = style.name;
    formValues['itemLabelImage'] = this.itemLabelImage;
    formValues['supplierLabelImage'] = this.supplierLabelImage;
    this.modalCtrl.dismiss(formValues);
  }

  /***** End Form Methods *****/


  /***** Other Methods *****/

  /**
   * Call ModalController dismiss method with no return data
   *
   * @param: none
   * @return: none
   */
  dismiss(): void {
    this.modalCtrl.dismiss();
  }

  /**
   * Get a loading controller dismiss handler that dismisses only if an overlay is present
   * avoids throwing error on dismiss if there is no overlay
   *
   * @param: none
   * @return: Loading dismiss handling function
   */
  dismissLoadingIfHasOverlayFn(): () => Promise<void> {
    return async (): Promise<void> => {
      const hasOverlay: boolean = !!await this.loadingCtrl.getTop();
      if (hasOverlay) {
        await this.loadingCtrl.dismiss();
      }
    };
  }

  /**
   * Get recipe author prior to form generation
   *
   * @param: searchId - recipe master id to use in search
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
   * Set given image according to its image type (i.e. 'itemLabelImage' or 'supplierLabelImage')
   *
   * @param: imageData - object containing image type and the image to set
   * @return: none
   */
  onImageSelection(imageData: { imageType: string, image: Image }): void {
    if (imageData.imageType === 'itemLabelImage') {
      this.itemLabelImage = imageData.image;
    } else if (imageData.imageType === 'supplierLabelImage') {
      this.supplierLabelImage = imageData.image;
    }
  }

  /***** End Other Methods *****/

}
