/* Module imports */
import { Component, ElementRef, Input, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';

/* Interface imports */
import { Batch, FormSelectOption, Image, InventoryItem } from '../../src/app/shared/interfaces';

/* Default imports */
import { defaultImage } from '../../src/app/shared/defaults';

/* Component imports */
import { AccordionComponentStub as AccordionComponent } from './accordion-stub.component';

/* Page imports */
import { InventoryComponent } from '../../src/app/components/inventory/public/inventory/inventory.component';


@Component({
  selector: 'app-inventory',
  template: '',
  providers: [
    { provide: InventoryComponent, useClass: InventoryComponentStub }
  ]
})
export class InventoryComponentStub {
  @Input() enterDuration: number = 0;
  @Input() optionalData: Batch;
  @ViewChild('slidingItemsList', { read: ElementRef }) slidingItemsListRef: ElementRef;
  @ViewChildren(AccordionComponent, { read: ViewContainerRef }) accordionComponent: QueryList<ViewContainerRef>;
  _defaultImage: Image = defaultImage();
  destroy$: Subject<boolean> = new Subject<boolean>();
  displayList: InventoryItem[] = null;
  filterBy: string[] = [];
  inventoryList: InventoryItem[] = null;
  isAscending: boolean = true;
  itemIndex: number = -1;
  refreshPipes: boolean = false;
  sortBy: string = 'alphabetical';
  oneAndAHalfSeconds: number = 1500;
  sortOptions: FormSelectOption[] = [
    { label: 'alphabetical', value: 'alphabetical' },
    { label: 'remaining', value: 'remaining' },
    { label: 'source', value: 'source' }
  ];
  orderOptions: FormSelectOption[] = [
    { label: 'ascending', value: true },
    { label: 'descending', value: false }
  ];
}
