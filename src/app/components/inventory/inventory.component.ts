/* Module imports */
import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { from, Subject } from 'rxjs';
import { finalize, take, takeUntil } from 'rxjs/operators';

/* Interface imports */
import { Batch, ErrorReport, FormSelectOption, Image, InventoryItem } from '../../shared/interfaces';

/* Type imports */
import { CustomError } from '../../shared/types';

/* Default imports */
import { defaultImage } from '../../shared/defaults';

/* Page imports */
import { InventoryFormPage, QuantityHelperPage } from '../../pages/pages';

/* Service imports */
import { AnimationsService, ErrorReportingService, EventService, ImageService, InventoryService, ProcessService, ToastService } from '../../services/services';


@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() enterDuration: number = 0;
  @Input() optionalData: Batch;
  @ViewChild('slidingItemsList', { read: ElementRef }) slidingItemsListRef: ElementRef;
  _defaultImage: Image = defaultImage();
  destroy$: Subject<boolean> = new Subject<boolean>();
  displayList: InventoryItem[] = null;
  filterBy: string[] = [];
  inventoryList: InventoryItem[] = null;
  isAscending: boolean = true;
  itemIndex: number = -1;
  refreshPipes: boolean = false;
  sortBy: string = 'alphabetical';
  onDirectionChangeEvent: (event: any) => void = this.onDirectionChange.bind(this);
  oneAndAHalfSeconds: number = 1500;
  onSortChangeEvent: (event: any) => void = this.onSortChange.bind(this);
  sortOptions: FormSelectOption[] = [
    { label: 'alphabetical', value: 'alphabetical' },
    { label: 'remaining', value: 'remaining' },
    { label: 'source', value: 'source' }
  ];
  orderOptions: FormSelectOption[] = [
    { label: 'ascending', value: true },
    { label: 'descending', value: false }
  ];

  constructor(
    public renderer: Renderer2,
    public animationService: AnimationsService,
    public errorReporter: ErrorReportingService,
    public event: EventService,
    public imageService: ImageService,
    public inventoryService: InventoryService,
    public modalCtrl: ModalController,
    public processService: ProcessService,
    public toastService: ToastService
  ) { }

  /***** Lifecycle hooks *****/

  ngOnInit(): void {
    console.log('inventory component init');
    this.loadInventoryList();
  }

  ngOnChanges(): void {
    console.log('inventory component changes');
    if (this.optionalData) {
      this.openInventoryFormModal({ batch: this.optionalData });
    }
  }

  ngAfterViewInit() {
    if (this.animationService.shouldShowHint('sliding', 'inventory')) {
      this.runSlidingHints();
    }
  }

  ngOnDestroy(): void {
    console.log('inventory component destroy');
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  /***** End Lifecycle Hooks *****/


  /***** Display *****/

  /**
   * Set expanded item index, or -1 if selecting expanded items.
   * Scroll to top of item if expanding
   *
   * @param: index - list index to expand or collapse
   *
   * @return: none
   */
  expandItem(index: number): void {
    if (this.itemIndex === index) {
      this.itemIndex = -1;
    } else {
      this.itemIndex = index;
      const elementSelector: string = `app-accordion[data-scroll-landmark="${index}"]`;
      const accordionElement: HTMLElement = document.querySelector(elementSelector);
      const eventName: string = 'scroll-in-sub-component';
      const eventPayload: object = {
        subComponent: 'inventory',
        offset: accordionElement.offsetTop
      };
      this.event.emit(eventName, eventPayload);
    }
  }

  /**
   * On image error, change url to either backup image,
   * or not found image if the backup has also errored
   *
   * @param: item - item that owns the image
   * @param: event - contains data from event origin: imageType (such as 'itemLabelImage'),
   *   event is the originally triggered event
   *
   * @return: none
   */
  onImageError(item: InventoryItem, event: { imageType: string, event: CustomEvent }): void {
    this.imageService.handleImageError(item.optionalItemData[event.imageType]);
  }

  /**
   * Reset the display inventory list based on chosen sorting
   *
   * @param: none
   * @return: none
   */
  resetDisplayList(): void {
    if (this.sortBy === 'source') {
      this.sortBySource();
    } else if (this.sortBy === 'remaining') {
      this.sortByRemaining();
    } else {
      this.sortByAlphabetical();
    }
    this.refreshPipes = !this.refreshPipes;
  }

  /***** End Display *****/


  /***** Inventory Actions *****/

  /**
   * Create a new item from form values
   *
   * @param: itemFormValues - form results
   *
   * @return: none
   */
  createItem(itemFormValues: object): void {
    this.inventoryService.createItem(itemFormValues)
      .pipe(take(1))
      .subscribe(
        (): void => {
          this.toastService.presentToast('Added new item to inventory!', this.oneAndAHalfSeconds);
        },
        (error: any): void => {
          const overrides: object = {
            name: 'InventoryItemError',
            userMessage: `Inventory Item Error: ${error.message}`
          };
          const report: ErrorReport = this.errorReporter.getCustomReportFromError(error, overrides);
          this.errorReporter.setErrorReport(report);
        }
      );
  }

  /**
   * Decrement the item count by 1; display confirmation message with new remaining total
   *
   * @param: item - the item instance to lower its count
   *
   * @return: none
   */
  decrementCount(item: InventoryItem): void {
    if (this.inventoryService.isCapacityBased(item)) {
      this.openQuantityHelper(item);
    } else {
      this.handleItemCountDecrement(item, 1);
    }
  }

  /**
   * Generate a new inventory item based on a finished batch
   *
   * @param: batch - the batch on which to base the item
   * @param: itemFormValues - additional item data from form to create item
   *
   * @return: none
   */
  createItemFromBatch(batch: Batch, itemFormValues: object): void {
    this.inventoryService.createItemFromBatch(batch, itemFormValues)
      .pipe(take(1))
      .subscribe(
        (): void => {
          this.toastService.presentToast('Added new item to inventory!', this.oneAndAHalfSeconds);
          this.optionalData = null;
        },
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Format the toast message to display after count decrement
   *
   * @param: item - inventory item that was updated or null if out of stock
   *
   * @return: the toast message to display
   */
  formatDecrementMessage(item: InventoryItem): string {
    if (item === null) {
      return 'Out of Stock!';
    } else {
      const count: number = item.currentQuantity;
      const name: string = this.inventoryService.isCapacityBased(item) ? 'Pint' : item.stockType;
      return `${count} ${name}${count > 1 ? 's' : ''} remaining`;
    }
  }

  /**
   * Decrement the item count by 1; display confirmation message with new remaining total
   *
   * @param: item - the item instance to lower its count
   * @param: decrementBy - number to decrease count by
   *
   * @return: none
   */
  handleItemCountDecrement(item: InventoryItem, decrementBy: number): void {
    let newCount: number = item.currentQuantity - decrementBy;
    newCount = newCount < 0 ? 0 : newCount;
    this.inventoryService.updateItem(item.cid, { currentQuantity: newCount })
      .pipe(take(1))
      .subscribe(
        (updatedItem: InventoryItem): void => {
          const message: string = this.formatDecrementMessage(updatedItem);
          const cssClass: string = updatedItem === null ? 'toast-warn' : '';
          this.toastService.presentToast(message, this.oneAndAHalfSeconds, 'bottom', cssClass);
        },
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Load the inventory list
   *
   * @param: none
   * @return: none
   */
  loadInventoryList(): void {
    this.inventoryService.getInventoryList()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (inventoryList: InventoryItem[]): void => {
          console.log('inventory list', inventoryList);
          this.displayList = inventoryList;
          this.displayList.forEach((item: InventoryItem): void => {
            this.imageService.setInitialURL(item.optionalItemData.itemLabelImage);
            this.imageService.setInitialURL(item.optionalItemData.supplierLabelImage);
          });
          this.resetDisplayList();
        },
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Update an item with form values
   *
   * @param: item - the item to update
   * @param: itemFormValues - values to apply to update
   *
   * @return: none
   */
  updateItem(item: InventoryItem, itemFormValues: object): void {
    this.inventoryService.updateItem(item.cid, itemFormValues)
      .pipe(take(1))
      .subscribe(
        (): void => {
          this.toastService.presentToast('Updated item', this.oneAndAHalfSeconds);
        },
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Remove an item from list
   *
   * @param: itemId - item instance id
   *
   * @return: none
   */
  removeItem(itemId: string): void {
    this.inventoryService.removeItem(itemId)
      .pipe(take(1))
      .subscribe(
        (): void => {}, // no further action required
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /***** End Inventory Actions *****/


  /***** Modals *****/

  /**
   * Get quantity helper modal error handler
   *
   * @param: none
   *
   * @return: modal error handling function
   */
  onQuantityHelperModalError(): (error: string) => void {
    return (error: string): void => {
      console.log('modal dismiss error', error);
      this.toastService.presentErrorToast('Error selecting quantity');
    };
  }

  /**
   * Get quantity helper modal success handler
   *
   * @param: none
   *
   * @return: modal success handling function
   */
  onQuantityHelperModalSuccess(item: InventoryItem): (data: object) => void {
    return (data: object): void => {
      const _data: number = data['data'];
      if (!isNaN(_data)) {
        this.handleItemCountDecrement(item, _data);
      }
    };
  }

  /**
   * Open the quatity helper modal
   *
   * @param: item - inventory item with quantity data
   *
   * @return: none
   */
  async openQuantityHelper(item: InventoryItem): Promise<void> {
    const modal: HTMLIonModalElement = await this.modalCtrl.create({
      component: QuantityHelperPage,
      componentProps: {
        headerText: 'reduce quantity by',
        quantity: 1
      }
    });

    from(modal.onDidDismiss())
      .subscribe(
        this.onQuantityHelperModalSuccess(item),
        this.onQuantityHelperModalError()
      );

    await modal.present();
  }

  /**
   * Get inventory form modal error handler
   *
   * @param: none
   *
   * @return: modal error handling function
   */
  onInventoryFormModalError(): (error: string) => void {
    return (error: string): void => {
      console.log('modal dismiss error', error);
      this.toastService.presentErrorToast('An error occurred on inventory form exit');
    };
  }

  /**
   * Get quantity helper modal success handler
   *
   * @param: none
   *
   * @return: modal success handling function
   */
  onInventoryFormModalSuccess(
    options: { item?: InventoryItem, batch?: Batch }
  ): (data: object) => void {
    return (data: object): void => {
      const itemFormValues: object = data['data'];
      if (itemFormValues) {
        if (options.batch !== undefined) {
          this.createItemFromBatch(options.batch, itemFormValues);
        } else if (options.item !== undefined) {
          this.updateItem(options.item, itemFormValues);
        } else {
          this.createItem(itemFormValues);
        }
      }
    };
  }

  /**
   * Open the inventory form modal
   *
   * @param: options - may contain an item to update, a batch to base a new
   * item on, or an empty object to set form to default values instead
   *
   * @return: none
   */
  async openInventoryFormModal(
    options: { item?: InventoryItem, batch?: Batch }
  ): Promise<void> {
    const modal: HTMLIonModalElement = await this.modalCtrl.create({
      component: InventoryFormPage,
      componentProps: {
        options,
        isRequired: options.batch !== undefined
      }
    });

    from(modal.onDidDismiss())
      .subscribe(
        this.onInventoryFormModalSuccess(options),
        this.onInventoryFormModalError()
      );

    await modal.present();
  }

  /***** End Modals *****/


  /***** Sorting *****/

  /**
   * Collect items into an array of array of items by its source
   *
   * @param: none
   *
   * @return: array of sub arrays of inventory items in the following order:
   *   item source is 'self', 'other', then 'third'
   */
  collateInventoryBySource(): InventoryItem[][] {
    const self: InventoryItem[] = [];
    const other: InventoryItem[] = [];
    const third: InventoryItem[] = [];

    this.displayList.forEach((item: InventoryItem): void => {
      if (item.sourceType === 'self') {
        self.push(item);
      } else if (item.sourceType === 'other') {
        other.push(item);
      } else {
        third.push(item);
      }
    });

    return [self, other, third];
  }

  /**
   * Handle sorting direction change
   *
   * @param: isAscending - true if should be in ascending order
   *
   * @return: none
   */
  onDirectionChange(isAscending: CustomEvent): void {
    this.isAscending = isAscending.detail.value;
    this.resetDisplayList();
  }

  /**
   * Handle sorting category
   *
   * @param: sortBy - string of sorting category
   *
   * @return: none
   */
  onSortChange(sortBy: CustomEvent): void {
    this.sortBy = sortBy.detail.value;
    this.resetDisplayList();
  }

  /**
   * Sort display inventory list alphabetically
   *
   * @param: none
   * @return: none
   */
  sortByAlphabetical(): void {
    this.displayList.sort((item1: InventoryItem, item2: InventoryItem): number => {
      if (item1.itemName.toLowerCase() < item2.itemName.toLowerCase()) {
        return this.isAscending ? -1 : 1;
      }
      return this.isAscending ? 1 : -1;
    });
  }

  /**
   * Sort display inventory list by count remaining
   *
   * @param: none
   * @return: none
   */
  sortByRemaining(): void {
    this.displayList.sort((item1: InventoryItem, item2: InventoryItem): number => {
      if (item1.currentQuantity < item2.currentQuantity) {
        return this.isAscending ? -1 : 1;
      }
      return this.isAscending ? 1 : -1;
    });
  }

  /**
   * Sort display inventory list by source type
   *
   * @param: none
   * @return: none
   */
  sortBySource(): void {
    console.log('sorting by source');
    const [self, other, third] = this.collateInventoryBySource();
    if (this.isAscending) {
      this.displayList = self.concat(other).concat(third);
    } else {
      this.displayList = third.concat(other).concat(self);
    }
  }

  /***** End Sorting *****/


  /***** Animation *****/

  /**
   * Get the IonContent HTMLElement of the current view
   *
   * @param: none
   *
   * @return: IonContent element
   */
  getTopLevelContainer(): HTMLElement {
    if (!this.slidingItemsListRef) {
      return null;
    }

    let currentElem: HTMLElement = this.slidingItemsListRef.nativeElement;
    while (currentElem && currentElem.tagName !== 'ION-CONTENT') {
      currentElem = currentElem.parentElement;
    }
    return currentElem;
  }

  /**
   * Report an animation error when containing element is not found
   *
   * @param: none
   * @return: none
   */
  reportSlidingHintError(): void {
    const message: string = 'Cannot find content container';
    const severity: number = 4;
    this.errorReporter.setErrorReport(
      this.errorReporter.getCustomReportFromError(
        new CustomError('AnimationError', message, severity, message)
      )
    );
  }

  /**
   * Trigger horizontally sliding gesture hint animations
   *
   * @param: none
   * @return: none
   */
  runSlidingHints(): void {
    const topLevelContent: HTMLElement = this.getTopLevelContainer();
    if (!topLevelContent) {
      this.reportSlidingHintError();
      return;
    }

    this.toggleSlidingItemClass(true);
    this.animationService.playCombinedSlidingHintAnimations(
      topLevelContent,
      this.slidingItemsListRef.nativeElement,
      this.enterDuration
    )
    .pipe(finalize((): void => this.toggleSlidingItemClass(false)))
    .subscribe(
      (): void => this.animationService.setHintShownFlag('sliding', 'inventory'),
      (error: any): void => this.errorReporter.handleUnhandledError(error)
    );
  }

  /**
   * Toggle classes on IonItemSliding for hint animations;
   * This will show the IonOptions underneath the IonItem
   *
   * @param: show - true if classes should be added prior to animation; false to remove classes
   *  after animations have completed
   *
   * @return: none
   */
  toggleSlidingItemClass(show: boolean): void {
    const listRef: HTMLElement = this.slidingItemsListRef.nativeElement;
    this.animationService.toggleSlidingItemClass(listRef, show, this.renderer);
  }

  /***** End Animation *****/

}
