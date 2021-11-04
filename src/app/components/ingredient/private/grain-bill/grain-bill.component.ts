/* Module imports */
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

/* Interface imports */
import { GrainBill } from '../../../../shared/interfaces';


@Component({
  selector: 'app-grain-bill',
  templateUrl: './grain-bill.component.html',
  styleUrls: ['./grain-bill.component.scss'],
})
export class GrainBillComponent implements OnChanges {
  @Input() grainBill: GrainBill[];
  @Input() refresh: boolean;
  @Output() openIngredientFormEvent: EventEmitter<GrainBill> = new EventEmitter<GrainBill>();
  ratios: string[] = [];
  totalGristQuantity: number = 0;

  ngOnChanges(): void {
    this.setRatios();
  }

  /**
   * Check if an item is fermentable; true if item has a grain type and non-zero
   * gravity rating
   *
   * @params: item - the item to check
   *
   * @return: true if item can be counted towards fermentation
   */
  contributesFermentable(grainBill: GrainBill): boolean {
    return grainBill.grainType.gravity > 0;
  }

  /**
   * Get the total amount of a given object quantity by a given key
   *
   * @param: none
   *
   * @return: total of grain quantities
   */
  getTotalGristQuantity(): number {
    return this.grainBill.reduce(
      (acc: number, curr: GrainBill): number => {
        if (!this.contributesFermentable(curr)) {
          return acc;
        }
        return acc + (curr.quantity !== undefined ? curr.quantity : 0);
      },
      0
    );
  }

  /**
   * Open ingredient form modal to update a grains instance
   *
   * @params: grains - the grains instance to update
   *
   * @return: none
   */
  openIngredientFormModal(grains: GrainBill): void {
    this.openIngredientFormEvent.emit(grains);
  }

  /**
   * Set fermentable contribution ratios
   *
   * @param: none
   * @return: none
   */
  setRatios(): void {
    this.totalGristQuantity = this.getTotalGristQuantity();
    this.ratios = this.grainBill.map((grainBill: GrainBill): string => {
      if (this.contributesFermentable(grainBill)) {
        return `${(grainBill.quantity / this.totalGristQuantity * 100).toFixed(1)}%`;
      }
      return '0%';
    });
  }

}
