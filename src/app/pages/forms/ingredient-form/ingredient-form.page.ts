/* Module imports */
import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

/* Utility imports */
import { compareWith, roundToDecimalPlace, toTitleCase } from '../../../shared/utility-functions/utilities';

/* Interface imports */
import {
  GrainBill,
  Grains,
  HopsSchedule,
  Hops,
  OtherIngredients,
  SelectedUnits,
  YeastBatch,
  Yeast
} from '../../../shared/interfaces';

/* Service imports */
import { CalculationsService } from '../../../services/calculations/calculations.service';
import { FormValidationService } from '../../../services/form-validation/form-validation.service';
import { PreferencesService } from '../../../services/preferences/preferences.service';


@Component({
  selector: 'page-ingredient-form',
  templateUrl: './ingredient-form.page.html',
  styleUrls: ['./ingredient-form.page.scss']
})
export class IngredientFormPage implements OnInit {
  @Input() boilTime: number;
  @Input() ingredientType: string;
  @Input() ingredientLibrary: Grains[] | Hops[] | Yeast[];
  @Input() update: GrainBill | HopsSchedule | YeastBatch | OtherIngredients;
  compareWithFn: (o1: any, o2: any) => boolean = compareWith;
  formType: string;
  hasSubQuantity: boolean = false;
  ingredientForm: FormGroup = null;
  onBackClick: () => void;
  requiresConversionLarge: boolean = false;
  requiresConversionSmall: boolean = false;
  selection: any = null;
  selectOptions: object = { cssClass: 'select-popover' };
  selectTouched: boolean = false;
  showTextArea: boolean = false;
  title: string = '';
  units: SelectedUnits = null;

  constructor(
    public calculator: CalculationsService,
    public formBuilder: FormBuilder,
    public formValidator: FormValidationService,
    public modalCtrl: ModalController,
    public preferenceService: PreferencesService
  ) {
    this.onBackClick = this.dismiss.bind(this);
  }

  /***** Lifecycle Hooks *****/

  ngOnInit() {
    if (!this.ingredientType) {
      this.dismissOnError('Missing ingredient type');
      return;
    }

    this.title = toTitleCase(this.ingredientType);
    this.units = this.preferenceService.getSelectedUnits();
    this.requiresConversionLarge = this.calculator.requiresConversion('weightLarge', this.units);
    this.requiresConversionSmall = this.calculator.requiresConversion('weightSmall', this.units);

    this.initForm();
  }

  /***** End Lifecycle Hooks *****/


  /***** Form Methods *****/

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
   *
   * @return: none
   */
  dismissOnError(error: any): void {
    this.modalCtrl.dismiss({error: error});
  }

  /**
   * Convert and combine quantity and sub quantity into a single value
   *
   * @params: formValues - submitted form values
   *
   * @return: combined quantity value
   */
  getCombinedQuantity(formValues: object): number {
    let quantity: number = parseFloat(formValues['quantity']) || 0;
    quantity = this.requiresConversionLarge
      ? this.calculator.convertWeight(quantity, true, true)
      : quantity;

    let subQuantity: number = parseFloat(formValues['subQuantity']) || 0;
    if (subQuantity) {
      subQuantity = this.requiresConversionSmall
        ? this.calculator.convertWeight(subQuantity, false, true)
        : subQuantity;
      quantity += subQuantity / 16;
    }

    return quantity;
  }

  /**
   * Format a form response for grains ingredient
   *
   * @params: none
   *
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
   *
   * @return: formatted response object
   */
  formatHopsResponse(): object {
    const formValues: object = this.ingredientForm.value;

    let quantity: number = parseFloat(formValues['subQuantity']) || 0;
    quantity = this.requiresConversionSmall
      ? this.calculator.convertWeight(quantity, false, true)
      : quantity;

    return {
      hopsType: formValues['type'],
      quantity: quantity,
      duration: parseFloat(formValues['duration']) || 0,
      dryHop: formValues['dryHop']
    };
  }

  /**
   * Format a form response for other ingredients
   *
   * @params: none
   *
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
   *
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
          subQuantity *= 16;
        }
        quantity = Math.floor(quantity);
        this.ingredientForm.controls.subQuantity.setValue(roundToDecimalPlace(subQuantity, 2));
      }

      this.ingredientForm.controls.quantity.setValue(roundToDecimalPlace(quantity, 2));
      this.ingredientForm.controls.type.setValue((<GrainBill>this.update).grainType);
      this.ingredientForm.controls.mill.setValue((<GrainBill>this.update).mill);
    }
  }

  /**
   * Fill in hops specific form controls
   *
   * @params: none
   * @return: none
   */
  initHopsFields(): void {
    this.ingredientForm.addControl(
      'duration',
      new FormControl(
        null,
        [
          Validators.required,
          Validators.min(0),
          Validators.max(this.boilTime || 60)
        ]
      )
    );
    this.ingredientForm.addControl('dryHop', new FormControl(false));

    if (this.update) {
      let quantity: number = this.update.quantity;
      if (this.calculator.requiresConversion('weightSmall', this.units)) {
        quantity = this.calculator.convertWeight(quantity, false, false);
      }

      this.ingredientForm.controls.subQuantity.setValue(roundToDecimalPlace(quantity, 2));
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
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.required
        ]
      )
    );
    this.ingredientForm.addControl(
      'description',
      new FormControl(
        '',
        [
          Validators.minLength(2),
          Validators.maxLength(500),
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
          Validators.maxLength(20),
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
   *
   * @return: none
   */
  onDryHopChange(dryHop: CustomEvent): void {
    if (dryHop.detail.checked) {
      this.ingredientForm.get('duration').clearValidators();
    } else {
      this.ingredientForm.get('duration')
        .setValidators(
          [
            Validators.required,
            Validators.min(0),
            Validators.max(this.boilTime)
          ]
        );
    }
    this.ingredientForm.get('duration').updateValueAndValidity();
  }

  /**
   * Set ingredient ion-select touched property based on whether it has a value
   *
   * @params: none
   * @return: none
   */
  onIngredientSelect(): void {
    this.selectTouched = !this.ingredientForm.controls.type.value;
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
