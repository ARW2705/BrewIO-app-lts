/* Module imports */
import { Component, Input, OnInit, HostListener } from '@angular/core';
import { ModalController } from '@ionic/angular';

/* Constants imports */
import { COMMON_CONTAINERS } from '../../shared/constants/common-containers';
import { FLOZ_TO_PINT, CL_TO_FLOZ } from '../../shared/constants/factors';

/* Interface imports */
import { Container } from '../../shared/interfaces/container';

/* Utility imports */
import { roundToDecimalPlace, toTitleCase } from '../../shared/utility-functions/utilities';


@Component({
  selector: 'quantity-helper',
  templateUrl: './quantity-helper.component.html',
  styleUrls: ['./quantity-helper.component.scss']
})
export class QuantityHelperComponent implements OnInit {
  @Input() headerText: string;
  @Input() quantity: number;
  commonContainers: Container[] = COMMON_CONTAINERS;
  focusElement: string = '';
  quantityPints: number;
  quantityOunces: number;
  quantityCentiliters: number;
  onBackClick: () => void;
  selectOptions: object = { cssClass: 'select-popover' };


  constructor(public modalCtrl: ModalController) {
    this.onBackClick = this.dismiss.bind(this);
  }

  ngOnInit() {
    this.changeQuantities('pints', this.quantity);
  }

  /**
   * Listen for key press on quantity inputs; prevent event continuation if new value would be invalid
   *
   * @params: event - the triggering keyboard event
   *
   * @return: none
   */
  @HostListener('keypress', ['$event'])
  onInput(event: KeyboardEvent): void {
    const source: string = event.target['parentNode']['parentNode']['id'];
    const preQuantity: string = event.target['value'];
    const enteredQuantity: string = preQuantity
      + String.fromCharCode(event.which ? event.which : event.keyCode);
    if (!this.isValidQuantity(source, enteredQuantity)) {
      event.preventDefault();
    }
  }

  /**
   * Ion-Select comparison function
   *
   * @params: o1 - first comparison value
   * @params: o2 - second comparison value
   *
   * @return: true if o1 and o2 are objects and have the same name property
   */
  compareWithFn(o1: any, o2: any): boolean {
    if (o1 && o2 && typeof o1 === 'object' && typeof o2 === 'object') {
      return o1.name === o2.name;
    }
    return o1 === o2;
  }

  /**
   * Update quantities with based on given value in their respective units
   *
   * @params: source - quantity name to use as source
   * @params: value - the quantity to base calculations on
   *
   * @return: none
   */
  changeQuantities(source: string, value: number): void {
    if (isNaN(value)) {
      this[`quantity${toTitleCase(source)}`] = null;
      return;
    }

    if (source === 'pints') {
      this.quantityPints = roundToDecimalPlace(value, 1);
      this.quantityOunces = roundToDecimalPlace(value * FLOZ_TO_PINT, 1);
      this.quantityCentiliters = roundToDecimalPlace(value * FLOZ_TO_PINT / CL_TO_FLOZ, 0);
    } else if (source === 'ounces') {
      this.quantityPints = roundToDecimalPlace(value / FLOZ_TO_PINT, 1);
      this.quantityOunces = roundToDecimalPlace(value, 1);
      this.quantityCentiliters = roundToDecimalPlace(value / CL_TO_FLOZ, 0);
    } else if (source === 'centiliters') {
      this.quantityPints = roundToDecimalPlace(value * CL_TO_FLOZ / FLOZ_TO_PINT, 1);
      this.quantityOunces = roundToDecimalPlace(value * CL_TO_FLOZ, 1);
      this.quantityCentiliters = roundToDecimalPlace(value, 0);
    } else {
      console.log('changeQuantities invalid source', source);
    }
  }

  /**
   * Fill any empty quantity on ion-input blur event based on another current quantity
   *
   * @params: event - the triggering blur event
   *
   * @return: none
   */
  checkQuantities(event: CustomEvent): void {
    const checkQuantity: number = parseFloat(event.target['value']);
    const checkSource: string = event.target['parentNode']['id'];
    if (isNaN(checkQuantity)) {
      if (checkSource === 'pints') {
        this.changeQuantities('ounces', this.quantityOunces);
      } else if (checkSource === 'ounces') {
        this.changeQuantities('pints', this.quantityPints);
      } else if (checkSource === 'centiliters') {
        this.changeQuantities('pints', this.quantityPints);
      }
    }
  }

  /**
   * Dismiss the ion-modal with no return data
   *
   * @params: none
   * @return: none
   */
  dismiss(): void {
    this.modalCtrl.dismiss();
  }

  /**
   * Check if a given quantity is valid
   * Quantity Rules:
   *  - pints: max value of 1000 and max one decimal place
   *  - ounces: max value of 16000 and max one decimal place
   *  - centiliters: max value of 47318 and no decimal places
   *
   * @params: source - the selected quantity type
   * @params: enteredQuantity - the entered input quantity
   *
   * @return: true if quantity is valid
   */
  isValidQuantity(source: string, enteredQuantity: string): boolean {
    const parsedQuantity: number = parseFloat(enteredQuantity);
    const rules: boolean [] = [ parsedQuantity >= 0 ];
    if (source === 'pints') {
      rules.push(!RegExp(/\.[0-9]{2,}/g).test(enteredQuantity));
      rules.push(parsedQuantity <= 1000);
    } else if (source === 'ounces') {
      rules.push(!RegExp(/\.[0-9]{2,}/g).test(enteredQuantity));
      rules.push(parsedQuantity <= 16000);
    } else if (source === 'centiliters') {
      rules.push(!RegExp(/\./g).test(enteredQuantity));
      rules.push(parsedQuantity <= 47318);
    } else {
      return false;
    }

    return rules.every((rule: boolean): boolean => rule);
  }

  /**
   * Update quantities based on stored common container capacity
   *
   * @params: event - ion-select change event with selection data
   *
   * @return: none
   */
  onCommonSelect(event: CustomEvent): void {
    this.changeQuantities('pints', event.detail.value.capacity);
  }

  /**
   * Handle a change in one of the ion-input quantities
   *
   * @params: event - the ion-input event (common parent element for all quantities)
   *
   * @return: none
   */
  onQuantityChange(event: CustomEvent): void {
    try {
      const source: string = event.target['parentNode']['id'];
      const enteredQuantity: string = event.target['value'];
      const newQuantity: number = parseFloat(enteredQuantity);
      this.changeQuantities(source, newQuantity);
    } catch (error) {
      console.log('quantity change error', error);
    }
  }

  /**
   * Dismiss the modal and return the current pints quantity
   *
   * @params: none
   * @return: none
   */
  submit(): void {
    this.modalCtrl.dismiss(this.quantityPints);
  }

}
