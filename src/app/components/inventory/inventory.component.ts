/* Module imports */
import { Component, Input, OnInit, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { IonList, ModalController } from '@ionic/angular';
import { Subject, from } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

/* Constant imports */
import { BASE_URL } from '../../shared/constants/base-url';
import { API_VERSION } from '../../shared/constants/api-version';
import { MISSING_IMAGE_URL } from '../../shared/constants/missing-image-url';
import { SELECT_OPTIONS } from '../../shared/constants/select-options';

/* Utility imports */
import { toTitleCase } from '../../shared/utility-functions/utilities';

/* Interface imports */
import { Batch } from '../../shared/interfaces/batch';
import { Image } from '../../shared/interfaces/image';
import { InventoryItem } from '../../shared/interfaces/inventory-item';

/* Default imports */
import { defaultImage } from '../../shared/defaults/default-image';

/* Page imports */
import { InventoryFormPage } from '../../pages/forms/inventory-form/inventory-form.page';

/* Service imports */
import { EventService } from '../../services/event/event.service';
import { ImageService } from '../../services/image/image.service';
import { InventoryService } from '../../services/inventory/inventory.service';
import { ProcessService } from '../../services/process/process.service';
import { ToastService } from '../../services/toast/toast.service';


@Component({
  selector: 'inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit, OnChanges, OnDestroy {
  @Input() optionalData: Batch;
  @ViewChild('slidingItemsList') slidingItemsList: IonList;
  _defaultImage: Image = defaultImage();
  baseImageURL: string = `${BASE_URL}/${API_VERSION}/assets/`; // TODO implement image asset handling
  destroy$: Subject<boolean> = new Subject<boolean>();
  displayList: InventoryItem[] = null;
  filterBy: string[] = [];
  inventoryList: InventoryItem[] = null;
  isAscending: boolean = true;
  itemIndex: number = -1;
  missingImageURL: string = MISSING_IMAGE_URL;
  refreshPipes: boolean = false;
  selectOptions: object = SELECT_OPTIONS;
  sortBy: string = 'alphabetical';

  constructor(
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
   * @params: index - list index to expand or collapse
   *
   * @return: none
   */
  expandItem(index: number): void {
    if (this.itemIndex === index) {
      this.itemIndex = -1;
    } else {
      this.itemIndex = index;

      const accordionElement: HTMLElement
        = document.getElementById(`scroll-landmark-${index}`);

      this.event.emit(
        'scroll-in-sub-component',
        {
          subComponent: 'inventory',
          offset: accordionElement.offsetTop
        }
      );
    }
  }

  /**
   * On image error, change url to either backup image, or not found
   * image if the backup has also errored
   *
   * @params: imageType - property name for image type
   * @params: item - item that owns the image
   *
   * @return: none
   */
  onImageError(imageType: string, item: InventoryItem, event?: any): void {
    console.log('image error', imageType, item, event);
    this.imageService.handleImageError(item.optionalItemData[imageType]);
  }

  /**
   * Reset the display inventory list based on chosen sorting
   *
   * @params: none
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
   * @params: itemFormValues - form results
   *
   * @return: none
   */
  createItem(itemFormValues: object): void {
    this.inventoryService.createItem(itemFormValues)
      .pipe(take(1))
      .subscribe(
        (): void => {
          this.toastService.presentToast('Added new item to inventory!', 1500);
        },
        (error: string): void => {
          console.log('Inventory error', error);
          this.toastService.presentErrorToast('Failed to add inventory item');
        }
      );
  }

  /**
   * Decrement the item count by 1; display confirmation message
   * with new remaining total
   *
   * @params: item - the item instance to lower its count
   *
   * @return: none
   */
  decrementCount(item: InventoryItem): void {
    // TODO open dec type form if not a bottle/can type
    this.inventoryService.updateItem(
      item.cid,
      { currentQuantity: item.currentQuantity - 1 }
    )
    .pipe(take(1))
    .subscribe(
      (updatedItem: InventoryItem): void => {
        let message: string = '';
        let customClass: string = '';
        if (updatedItem === null) {
          message = `${toTitleCase(item.itemName)} Out of Stock!`;
          customClass = 'toast-warn';
        } else {
          const count: number = updatedItem.currentQuantity;
          message = `${count} ${updatedItem.stockType}${count > 1 ? 's' : ''} remaining`;
        }
        this.toastService.presentToast(message, 1500, 'bottom', customClass);
      },
      (error: string): void => {
        console.log('Item decrement error', error);
        this.toastService.presentErrorToast('Failed to decrement item count');
      }
    );
  }

  /**
   * Generate a new inventory item based on a finished batch
   *
   * @params: batch - the batch on which to base the item
   * @params: itemFormValues - additional item data from form to create item
   *
   * @return: none
   */
  createItemFromBatch(batch: Batch, itemFormValues: object): void {
    this.inventoryService.createItemFromBatch(batch, itemFormValues)
      .pipe(take(1))
      .subscribe(
        (): void => {
          this.toastService.presentToast('Added new item to inventory!', 1500);
          this.optionalData = null;
        },
        (error: string): void => {
          console.log('Inventory error', error);
          this.toastService.presentErrorToast('Failed to create item from batch');
        }
      );
  }

  /**
   * Load the inventory list
   *
   * @params: none
   * @return: none
   */
  loadInventoryList(): void {
    this.inventoryService.getInventoryList()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (inventoryList: InventoryItem[]): void => {
          console.log('inventory list', inventoryList);
          this.displayList = inventoryList;
          this.displayList
            .forEach((item: InventoryItem): void => {
              this.imageService.setInitialURL(item.optionalItemData.itemLabelImage);
              this.imageService.setInitialURL(item.optionalItemData.supplierLabelImage);
            });
          this.resetDisplayList();
        },
        (error: string): void => {
          console.log('Error loading inventory', error);
          this.toastService.presentErrorToast('Error loading inventory');
        }
      );
  }

  /**
   * Update an item with form values
   *
   * @params: item - the item to update
   * @params: itemFormValues - values to apply to update
   *
   * @return: none
   */
  updateItem(item: InventoryItem, itemFormValues: object): void {
    this.inventoryService.updateItem(item.cid, itemFormValues)
      .pipe(take(1))
      .subscribe(
        (): void => {
          this.toastService.presentToast('Updated item', 2000);
        },
        (error: string): void => {
          console.log('Inventory error', error);
          this.toastService.presentErrorToast('Failed to update item');
        }
      );
  }

  /**
   * Remove an item from list
   *
   * @params: itemId - item instance id
   *
   * @return: none
   */
  removeItem(itemId: string): void {
    this.inventoryService.removeItem(itemId)
      .pipe(take(1))
      .subscribe(
        (): void => {},
        (error: string): void => {
          console.log('Error removing item', error);
          this.toastService.presentErrorToast('Failed to remove item');
        }
      );
  }

  /***** End Inventory Actions *****/


  /***** Modals *****/

  /**
   * Open the inventory form modal
   *
   * @params: options - may contain an item to update, a batch to base a new
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
        options: options,
        isRequired: options.batch !== undefined
      }
    });

    from(modal.onDidDismiss())
      .subscribe(
        (data: object): void => {
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
        },
        (error: string): void => {
          console.log('modal dismiss error', error);
          this.toastService.presentErrorToast('An error occurred on inventory form exit');
        }
      );

    await modal.present();
  }

  /***** End Modals *****/


  /***** Sorting *****/

  /**
   * Handle sorting direction change
   *
   * @params: isAscending - true if should be in ascending order
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
   * @params: sortBy - string of sorting category
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
   * @params: none
   * @return: none
   */
  sortByAlphabetical(): void {
    this.displayList
      .sort((item1: InventoryItem, item2: InventoryItem): number => {
        if (item1.itemName.toLowerCase() < item2.itemName.toLowerCase()) {
          return this.isAscending ? -1 : 1;
        }
        return this.isAscending ? 1 : -1;
      });
  }

  /**
   * Sort display inventory list by count remaining
   *
   * @params: none
   * @return: none
   */
  sortByRemaining(): void {
    this.displayList
      .sort((item1: InventoryItem, item2: InventoryItem): number => {
        if (item1.currentQuantity < item2.currentQuantity) {
          return this.isAscending ? -1 : 1;
        }
        return this.isAscending ? 1 : -1;
      });
  }

  /**
   * Sort display inventory list by source type
   *
   * @params: none
   * @return: none
   */
  sortBySource(): void {
    const self: InventoryItem[] = [];
    const other: InventoryItem[] = [];
    const third: InventoryItem[] = [];

    this.displayList
      .forEach((item: InventoryItem): void => {
        if (item.sourceType === 'self') {
          self.push(item);
        } else if (item.sourceType === 'other') {
          other.push(item);
        } else {
          third.push(item);
        }
      });

    if (this.isAscending) {
      this.displayList = self.concat(other).concat(third);
    } else {
      this.displayList = third.concat(other).concat(self);
    }
  }

  /***** End Sorting *****/

}
