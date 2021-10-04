/* Module imports */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

/* Interface imports */
import { FormSelectOption, Image } from '../../../../shared/interfaces';

/* Service imports */
import { UtilityService } from '../../../../services/services';


@Component({
  selector: 'app-inventory-supplier-details-form',
  templateUrl: './inventory-supplier-details-form.component.html',
  styleUrls: ['./inventory-supplier-details-form.component.scss'],
})
export class InventorySupplierDetailsFormComponent implements OnInit {
  @Input() controls: { [key: string]: FormControl };
  @Input() image: Image;
  @Input() selectedSource: string;
  @Output() imageSelectionEvent: EventEmitter<{ imageType: string, image: Image }> = new EventEmitter<{ imageType: string, image: Image }>();
  compareWithFn: (o1: any, o2: any) => boolean;
  sourceOptions: FormSelectOption[] = [
    { label: 'My Recipe'        , value: 'self'  },
    { label: 'Other User Recipe', value: 'other' },
    { label: 'Third Party'      , value: 'third' }
  ];

  constructor(public utilService: UtilityService) {
    this.compareWithFn = this.utilService.compareWith.bind(this);
  }

  ngOnInit(): void {
    this.controls.sourceType.setValue(this.selectedSource);
  }

  onImageModalEvent(image: Image): void {
    this.imageSelectionEvent.emit({ imageType: 'supplierLabelImage', image });
  }
}
