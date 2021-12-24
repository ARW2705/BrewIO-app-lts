/* Module imports */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

/* Interface imports */
import { FormSelectOption, Image, Style } from '@shared/interfaces';

/* Service imports */
import { UtilityService } from '@services/public';


@Component({
  selector: 'app-inventory-item-details-form',
  templateUrl: './inventory-item-details-form.component.html',
  styleUrls: ['./inventory-item-details-form.component.scss'],
})
export class InventoryItemDetailsFormComponent implements OnInit {
  @Input() controls: { [key: string]: FormControl };
  @Input() compareWithFn: (o1: any, o2: any) => boolean;
  @Input() image: Image;
  @Input() selectedStyle: Style;
  @Input() styleOptions: FormSelectOption[];
  @Output() imageSelectionEvent: EventEmitter<{ imageType: string, image: Image }> = new EventEmitter<{ imageType: string, image: Image }>();

  constructor(public utilService: UtilityService) {
    this.compareWithFn = this.utilService.compareWith.bind(this);
  }

  ngOnInit(): void {
    this.controls.itemStyleId.setValue(this.selectedStyle);
  }

  /**
   * Emit image selection event
   *
   * @param: image - the item label image
   * @return: none
   */
  onImageSelection(image: Image): void {
    this.imageSelectionEvent.emit({ imageType: 'itemLabelImage', image });
  }
}
