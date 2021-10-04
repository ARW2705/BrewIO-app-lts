/* Module imports */
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';

/* Constant imports */
import { PINT, STOCK_TYPES } from '../../../../shared/constants';

/* Interface imports */
import { FormSelectOption, StockType } from '../../../../shared/interfaces';

/* Page imports */
import { QuantityHelperPage } from '../../../../pages/quantity-helper/quantity-helper.page';

/* Service imports */
import { ErrorReportingService, ModalService, UtilityService } from '../../../../services/services';


@Component({
  selector: 'app-inventory-stock-details-form',
  templateUrl: './inventory-stock-details-form.component.html',
  styleUrls: ['./inventory-stock-details-form.component.scss'],
})
export class InventoryStockDetailsFormComponent implements OnInit {
  @Input() controls: { [key: string]: FormControl };
  @Input() selectedStockTypeName: string;
  allowHelper: boolean = false;
  compareWithFn: (o1: any, o2: any) => boolean;
  quantityHint: string = '';
  stockTypeOptions: FormSelectOption[] = [];

  constructor(
    public errorReporter: ErrorReportingService,
    public modalService: ModalService,
    public utilService: UtilityService
  ) {
    this.compareWithFn = this.utilService.compareWith.bind(this);
  }

  ngOnInit(): void {
    this.buildFormSelectOptions();
    const selectedType: StockType = STOCK_TYPES.find((stockType: StockType): boolean => {
      return stockType.name === this.selectedStockTypeName;
    });
    this.controls.stockType.setValue(selectedType);
  }

  /**
   * Build form select options
   *
   * @param: none
   * @return: none
   */
  buildFormSelectOptions(): void {
    this.stockTypeOptions = STOCK_TYPES.map((stockType: StockType): FormSelectOption => {
      return { label: stockType.name, value: stockType.name };
    });
  }

  /**
   * Set quantity helper modal button display and hint based on stock type;
   * Quantity helper button and hint should be visible if stock type is capacity based (eg 'keg')
   *
   * @param: none
   * @return: none
   */
  updateQuantityHint(): void {
    const stockTypeFormValue: string = (<string>this.controls.stockType.value).toLowerCase();
    if (stockTypeFormValue === 'keg' || stockTypeFormValue === 'growler') {
      this.allowHelper = true;
      this.quantityHint = `(${PINT.longName}s)`;
    } else {
      this.allowHelper = false;
      this.quantityHint = '';
    }
  }

  /**
   * Open quantity helper modal
   *
   * @param: quantityType - name of the  type of quantity; either 'initialQuantity' or 'currentQuantity'
   *
   * @return: none
   */
  openQuantityHelperModal(quantityType: string): void {
    const quantityControl: AbstractControl = this.controls[quantityType];
    this.modalService.openModal<number>(
      QuantityHelperPage,
      { headerText: `select ${quantityType.split('Q')[0]} quantity`, quantity: quantityControl.value }
    )
    .subscribe(
      (newQuantity: number): void => {
        if (!isNaN(newQuantity)) {
          quantityControl.setValue(newQuantity);
        }
      },
      (error: Error): void => this.errorReporter.handleUnhandledError(error)
    );
  }

  /**
   * Handle stock form-select update
   *
   * @param: none
   * @return: none
   */
  updateStockSelect(): void {
    this.updateQuantityHint();
  }
}
