/* Module imports */
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';

/* Constant imports */
import { DESCRIPTION_MAX_LENGTH, NAME_MAX_LENGTH, NAME_MIN_LENGTH, UNIT_NAME_MAX_LENGTH } from '../../../shared/constants';

/* Interface imports */
import { FormSelectOption, GrainBill, HopsSchedule, Ingredient, OtherIngredients, SelectedUnits, YeastBatch } from '../../../shared/interfaces';

/* Component imports */
import { FormInputComponent } from '../../../components/form-input/form-input.component';

/* Service imports */
import { CalculationsService, FormValidationService, PreferencesService, UtilityService } from '../../../services/services';


@Component({
  selector: 'app-page-ingredient-form',
  templateUrl: './ingredient-form.page.html',
  styleUrls: ['./ingredient-form.page.scss']
})
export class IngredientFormPage implements OnInit {
  @Input() boilTime: number;
  @Input() ingredientType: string;
  @Input() ingredientLibrary: Ingredient[];
  @Input() update: GrainBill | HopsSchedule | YeastBatch | OtherIngredients;
  @ViewChild('quantityField') quantityField: FormInputComponent;
  @ViewChild('subQuantityField') subQuantityField: FormInputComponent;
  compareWithFn: (o1: any, o2: any) => boolean;
  formType: string;
  hasSubQuantity: boolean = false;
  ingredientForm: FormGroup = null;
  onBackClick: () => void;
  ouncesPerPound: number = 16;
  ingredientOptions: FormSelectOption[] = [];
  quantityRoundToPlaces: number = 2;
  requiresConversionLarge: boolean = false;
  requiresConversionSmall: boolean = false;
  selection: any = null;
  selectTouched: boolean = false;
  showTextArea: boolean = false;
  title: string = '';
  units: SelectedUnits = null;

  constructor(
    public calculator: CalculationsService,
    public formBuilder: FormBuilder,
    public formValidator: FormValidationService,
    public modalCtrl: ModalController,
    public preferenceService: PreferencesService,
    public utilService: UtilityService
  ) {
    this.compareWithFn = this.utilService.compareWith.bind(this);
    this.onBackClick = this.dismiss.bind(this);
  }

  /***** Lifecycle Hooks *****/

  ngOnInit(): void {
    if (!this.ingredientType) {
      this.dismissOnError('Missing ingredient type');
      return;
    }

    this.title = this.utilService.toTitleCase(this.ingredientType);
    this.units = this.preferenceService.getSelectedUnits();
    this.requiresConversionLarge = this.calculator.requiresConversion('weightLarge', this.units);
    this.requiresConversionSmall = this.calculator.requiresConversion('weightSmall', this.units);
    this.buildFormSelectOptions();
    this.initForm();
  }

  /***** End Lifecycle Hooks *****/


  /***** Form Methods *****/

  /**
   * Build ingredient select options
   *
   * @param: none
   * @return: none
   */
  buildFormSelectOptions(): void {
    if (this.ingredientLibrary) {
      this.ingredientOptions = this.ingredientLibrary
        .map((ingredient: Ingredient): FormSelectOption => {
          return { label: ingredient.name, value: ingredient };
        });
    }
  }

  /**
   * Check quantity and subquantity form validity when either of them changes
   *
   * @param: none
   * @return: none
   */
  checkCompanionInput(): void {
    const quantityControl: AbstractControl = this.ingredientForm.controls.quantity;
    quantityControl.markAsTouched();
    quantityControl.updateValueAndValidity();
    const subQuantityControl: AbstractControl = this.ingredientForm.controls.subQuantity;
    subQuantityControl.markAsTouched();
    subQuantityControl.updateValueAndValidity();
    this.quantityField.checkForErrors();
    this.subQuantityField.checkForErrors();
  }

  /**
   * Call modal controller dismiss method
   *
   * @params: none
   * @return: none
   */
  dismiss(): void {
    this.modalCtrl.dismiss();
  }

  /**
   * Dismiss form with error message
   *
   * @params: error - error message
   * @return: none
   */
  dismissOnError(error: any): void {
    this.modalCtrl.dismiss({ error });
  }

  /**
   * Format a form response for grains ingredient
   *
   * @params: none
   * @return: formatted response object
   */
  formatGrainsResponse(): object {
    const formValues: object = this.ingredientForm.value;
    return {
      grainType: formValues['type'],
      quantity: this.getCombinedQuantity(formValues),
      mill: parseFloat(formValues['mill']) || 0
    };
  }

  /**
   * Format a form response for hops ingredient
   *
   * @params: none
   * @return: formatted response object
   */
  formatHopsResponse(): object {
    const formValues: object = this.ingredientForm.value;
    let quantity: number = parseFloat(formValues['subQuantity']) || 0;
    if (this.requiresConversionSmall) {
      quantity = this.calculator.convertWeight(quantity, false, true);
    }

    return {
      quantity,
      hopsType: formValues['type'],
      duration: parseFloat(formValues['duration']) || 0,
      dryHop: formValues['dryHop']
    };
  }

  /**
   * Format a form response for other ingredients
   *
   * @params: none
   * @return: formatted response object
   */
  formatOtherIngredientsResponse(): object {
    const formValues: object = this.ingredientForm.value;

    return {
      quantity: parseFloat(formValues['quantity']) || 0,
      name: formValues['name'],
      description: formValues['description'],
      units: formValues['units'],
      type: formValues['type']
    };
  }

  /**
   * Format a form response for yeast ingredient
   *
   * @params: none
   * @return: formatted response
   */
  formatYeastResponse(): object {
    const formValues: object = this.ingredientForm.value;

    return {
      yeastType: formValues['type'],
      quantity: parseFloat(formValues['quantity']) || 0,
      requiresStarter: formValues['requiresStarter']
    };
  }

  /**
   * Convert and combine quantity and sub quantity into a single value
   *
   * @params: formValues - submitted form values
   * @return: combined quantity value
   */
  getCombinedQuantity(formValues: object): number {
    return (
      this.getQuantity(parseFloat(formValues['quantity']) || 0)
      + this.getSubQuantity(parseFloat(formValues['subQuantity']) || 0)
    );
  }

  /**
   * Get quantity that has been unit converted if necessary
   *
   * @params: formQuantity - quantity form field value
   * @return: converted ingredient quantity
   */
  getQuantity(formQuantity: number): number {
    if (this.requiresConversionLarge) {
      return this.calculator.convertWeight(formQuantity, true, true);
    }
    return formQuantity;
  }

  /**
   * Get sub quantity and convert to quantity unit
   *
   * @params: formQuantity - subQuantity form field value
   * @return: converted ingredient subQuantity
   */
  getSubQuantity(formQuantity: number): number {
    if (this.requiresConversionSmall) {
      return this.calculator.convertWeight(formQuantity, false, true);
    }

    return formQuantity / this.ouncesPerPound;
  }

  /**
   * Initialize form based on ingredient type
   * If form data is passed to page, map data to form
   *
   * @params: none
   * @return: none
   */
  initForm(): void {
    this.ingredientForm = this.formBuilder.group({
      quantity: null,
      subQuantity: null,
      type: ['', [Validators.required]]
    }, {
      validator: this.formValidator
        .eitherOr(
          ['quantity', 'subQuantity'],
          { min: 0 }
        )
    });

    this.formType = this.update ? 'update' : 'create';

    if (this.ingredientType === 'grains') {
      this.initGrainsFields();
    } else if (this.ingredientType === 'hops') {
      this.initHopsFields();
    } else if (this.ingredientType === 'yeast') {
      this.initYeastFields();
    } else if (this.ingredientType === 'otherIngredients') {
      this.initOtherIngredientsFields();
    }
  }

  /**
   * Fill in grains specific form controls
   *
   * @params: none
   * @return: none
   */
  initGrainsFields(): void {
    const requiresConversion: boolean = this.calculator.requiresConversion('weightLarge', this.units);
    this.hasSubQuantity = !requiresConversion;
    this.ingredientForm.addControl('mill', new FormControl(null));
    if (this.update) {
      let quantity: number = this.update.quantity;
      let subQuantity: number = null;

      if (requiresConversion) {
        quantity = this.calculator.convertWeight(quantity, true, false);
      } else {
        subQuantity = quantity % 1;
        if (this.calculator.requiresConversion('weightSmall', this.units)) {
          subQuantity = this.calculator.convertWeight(subQuantity, false, false);
        } else {
          subQuantity *= this.ouncesPerPound;
        }
        quantity = Math.floor(quantity);
        this.ingredientForm.controls.subQuantity.setValue(
          this.utilService.roundToDecimalPlace(subQuantity, this.quantityRoundToPlaces)
        );
      }

      this.ingredientForm.controls.quantity.setValue(
        this.utilService.roundToDecimalPlace(quantity, this.quantityRoundToPlaces)
      );
      this.ingredientForm.controls.type.setValue((this.update as GrainBill).grainType);
      this.ingredientForm.controls.mill.setValue((this.update as GrainBill).mill);
    }
  }

  /**
   * Fill in hops specific form controls
   *
   * @params: none
   * @return: none
   */
  initHopsFields(): void {
    const sixtyMinutes: number = 60;
    this.ingredientForm.addControl(
      'duration',
      new FormControl(
        null,
        [
          Validators.required,
          Validators.min(0),
          Validators.max(this.boilTime || sixtyMinutes)
        ]
      )
    );
    this.ingredientForm.addControl('dryHop', new FormControl(false));
    if (this.update) {
      let quantity: number = this.update.quantity;
      if (this.calculator.requiresConversion('weightSmall', this.units)) {
        quantity = this.calculator.convertWeight(quantity, false, false);
      }

      this.ingredientForm.controls.subQuantity.setValue(
        this.utilService.roundToDecimalPlace(quantity, this.quantityRoundToPlaces)
      );
      this.ingredientForm.controls.type.setValue((<HopsSchedule>this.update).hopsType);
      this.ingredientForm.controls.duration.setValue((<HopsSchedule>this.update).duration);
      this.ingredientForm.controls.dryHop.setValue((<HopsSchedule>this.update).dryHop);
    }
  }

  /**
   * Fill in yeast specific form controls
   *
   * @params: none
   * @return: none
   */
  initYeastFields(): void {
    this.ingredientForm.addControl('requiresStarter', new FormControl(false));
    if (this.update) {
      this.ingredientForm.controls.type.setValue((<YeastBatch>this.update).yeastType);
      this.ingredientForm.controls.quantity.setValue((<YeastBatch>this.update).quantity);
      this.ingredientForm.controls.requiresStarter.setValue((<YeastBatch>this.update).requiresStarter);
    }
  }

  /**
   * Fill in other ingredient specific form controls
   *
   * @params: none
   * @return: none
   */
  initOtherIngredientsFields(): void {
    this.ingredientForm.addControl(
      'name',
      new FormControl(
        '',
        [
          Validators.minLength(NAME_MIN_LENGTH),
          Validators.maxLength(NAME_MAX_LENGTH),
          Validators.required
        ]
      )
    );
    this.ingredientForm.addControl(
      'description',
      new FormControl(
        '',
        [
          Validators.minLength(1),
          Validators.maxLength(DESCRIPTION_MAX_LENGTH),
          Validators.required
        ]
      )
    );
    this.ingredientForm.addControl(
      'units',
      new FormControl(
        '',
        [
          Validators.minLength(1),
          Validators.maxLength(UNIT_NAME_MAX_LENGTH),
          Validators.required
        ]
      )
    );

    if (this.update) {
      this.ingredientForm.controls.type.setValue((<OtherIngredients>this.update).type);
      this.ingredientForm.controls.name.setValue((<OtherIngredients>this.update).name);
      this.ingredientForm.controls.description.setValue((<OtherIngredients>this.update).description);
      this.ingredientForm.controls.quantity.setValue((<OtherIngredients>this.update).quantity);
      this.ingredientForm.controls.units.setValue((<OtherIngredients>this.update).units);
    }
  }

  /**
   * Dismiss with flag to delete the ingredient
   *
   * @params: none
   * @return: none
   */
  onDeletion(): void {
    this.modalCtrl.dismiss({ delete: true });
  }

  /**
   * Set duration validators based on whether the hops instance is marked as
   * dry hop or not
   *
   * @params: dryHop - ion-toggle event
   * @return: none
   */
  onDryHopChange(dryHop: CustomEvent): void {
    if (dryHop.detail.checked) {
      this.ingredientForm.get('duration').clearValidators();
    } else {
      this.ingredientForm.get('duration').setValidators(
        [ Validators.required, Validators.min(0), Validators.max(this.boilTime) ]
      );
    }
    this.ingredientForm.get('duration').updateValueAndValidity();
  }

  /**
   * Format form data for result and dismiss with data
   *
   * @params: none
   * @return: none
   */
  onSubmit(): void {
    let result: object = {};
    if (this.ingredientType === 'grains') {
      result = this.formatGrainsResponse();
    } else if (this.ingredientType === 'hops') {
      result = this.formatHopsResponse();
    } else if (this.ingredientType === 'yeast') {
      result = this.formatYeastResponse();
    } else if (this.ingredientType === 'otherIngredients') {
      result = this.formatOtherIngredientsResponse();
    }

    this.modalCtrl.dismiss(result);
  }

  /***** End Form Methods *****/

}
