/* Module imports */
import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/* Constant imports */
import { FLOZ_TO_PINT } from '../../../../shared/constants';

/* Interface imports */
import { FormSelectOption, GrainBill, SelectedUnits } from '../../../../shared/interfaces';

/* Component imports */
import { FormInputComponent } from '../../../form-elements/public';

/* Service imports */
import { CalculationsService, FormValidationService, UtilityService } from '../../../../services/services';


@Component({
  selector: 'app-grain-form',
  templateUrl: './grain-form.component.html',
  styleUrls: ['./grain-form.component.scss'],
})
export class GrainFormComponent implements AfterViewInit, OnDestroy, OnInit {
  @Input() grainFormOptions: FormSelectOption[];
  @Input() units: SelectedUnits;
  @Input() update: GrainBill;
  @Output() formStatusEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild('quantityField') quantityField: FormInputComponent;
  @ViewChild('subQuantityField') subQuantityField: FormInputComponent;
  destroy$: Subject<boolean> = new Subject<boolean>();
  compareWithFn: (o1: any, o2: any) => boolean;
  grainForm: FormGroup;
  quantityRoundToPlaces: number = 2;
  requiresConversionLarge: boolean = false;
  requiresConversionSmall: boolean = false;

  constructor(
    public calculator: CalculationsService,
    public formBuilder: FormBuilder,
    public formValidator: FormValidationService,
    public utilService: UtilityService
  ) {
    this.compareWithFn = this.utilService.compareWith.bind(this);
  }

  /***** Lifecycle Hooks *****/

  ngOnInit(): void {
    this.requiresConversionLarge = this.calculator.requiresConversion('weightLarge', this.units);
    this.requiresConversionSmall = this.calculator.requiresConversion('weightSmall', this.units);
    this.initForm();
  }

  ngAfterViewInit(): void {
    this.grainForm.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((status: string): void => this.formStatusEvent.emit(status === 'VALID'));
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  /***** End Lifecycle Hooks *****/

  /**
   * Fill in grains specific form controls
   *
   * @params: none
   * @return: none
   */
  assignFormValues(): void {
    let quantity: number = this.update.quantity;
    let subQuantity: number = null;

    if (this.requiresConversionLarge) {
      quantity = this.calculator.convertWeight(quantity, true, false);
    } else {
      subQuantity = quantity % 1;
      if (this.calculator.requiresConversion('weightSmall', this.units)) {
        subQuantity = this.calculator.convertWeight(subQuantity, false, false);
      } else {
        subQuantity /= FLOZ_TO_PINT;
      }
      quantity = Math.floor(quantity);
      this.grainForm.controls.subQuantity.setValue(
        this.utilService.roundToDecimalPlace(subQuantity, this.quantityRoundToPlaces)
      );
    }

    this.grainForm.controls.quantity.setValue(
      this.utilService.roundToDecimalPlace(quantity, this.quantityRoundToPlaces)
    );
    this.grainForm.controls.type.setValue((this.update).grainType);
    this.grainForm.controls.mill.setValue((this.update).mill);
  }

  /**
   * Check quantity and subquantity form validity when either of them changes
   *
   * @param: none
   * @return: none
   */
  checkCompanionInput(): void {
    this.validateQuantity();
    this.validateSubQuantity();
  }

  /**
   * Format a form values for grains ingredient
   *
   * @params: none
   * @return: formatted form values object
   */
  getFormResult(): object {
    const formValues: object = this.grainForm.value;
    return {
      grainType: formValues['type'],
      quantity : this.getCombinedQuantity(formValues),
      mill     : formValues['mill'] || 0
    };
  }

  /**
   * Get converted and combined quantity and sub quantity into a single value
   *
   * @params: formValues - submitted form values
   * @return: combined quantity value
   */
  getCombinedQuantity(formValues: object): number {
    return this.getQuantity(formValues['quantity']) + this.getSubQuantity(formValues['subQuantity']);
  }

  /**
   * Get quantity that has been unit converted if necessary
   *
   * @params: formQuantity - quantity form field value
   * @return: converted ingredient quantity or 0 if quantity not defined
   */
  getQuantity(formQuantity: number): number {
    if (!formQuantity) {
      return 0;
    } else if (this.requiresConversionLarge) {
      return this.calculator.convertWeight(formQuantity, true, true);
    }

    return formQuantity;
  }

  /**
   * Get sub quantity and convert to quantity unit
   *
   * @params: formQuantity - subQuantity form field value
   * @return: converted ingredient subQuantity or 0 if subQuantity not defined
   */
  getSubQuantity(formQuantity: number): number {
    if (!formQuantity) {
      return 0;
    } else if (this.requiresConversionSmall) {
      return this.calculator.convertWeight(formQuantity, false, true);
    }

    return formQuantity * FLOZ_TO_PINT;
  }

  /**
   * Initialize the form
   *
   * @params: none
   * @return: none
   */
  initForm(): void {
    this.grainForm = this.formBuilder.group({
      mill       : null,
      quantity   : null,
      subQuantity: null,
      type       : ['', [Validators.required]]
    }, {
      validator: this.formValidator.eitherOr(['quantity', 'subQuantity'], { min: 0 })
    });

    if (this.update) {
      this.assignFormValues();
    }
  }

  /**
   * Check subquantity form field validity
   *
   * @param: none
   * @return: none
   */
  validateSubQuantity(): void {
    const subQuantityControl: AbstractControl = this.grainForm.controls.subQuantity;
    subQuantityControl.markAsTouched();
    subQuantityControl.updateValueAndValidity();
    this.subQuantityField.checkForErrors();
  }

  /**
   * Check quantity form field validity
   *
   * @param: none
   * @return: none
   */
  validateQuantity(): void {
    const quantityControl: AbstractControl = this.grainForm.controls.quantity;
    quantityControl.markAsTouched();
    quantityControl.updateValueAndValidity();
    this.quantityField.checkForErrors();
  }

}
