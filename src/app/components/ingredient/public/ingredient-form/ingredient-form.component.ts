/* Module imports */
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';

/* Interface imports */
import { FormSelectOption, GrainBill, HopsSchedule, Ingredient, OtherIngredients, SelectedUnits, YeastBatch } from '../../../../shared/interfaces';

/* Component imports */
import { GrainFormComponent } from '../../private/grain-form/grain-form.component';
import { HopsFormComponent } from '../../private/hops-form/hops-form.component';
import { OtherIngredientsFormComponent } from '../../private/other-ingredients-form/other-ingredients-form.component';
import { YeastFormComponent } from '../../private/yeast-form/yeast-form.component';

/* Service imports */
import { PreferencesService, UtilityService } from '../../../../services/services';


@Component({
  selector: 'app-ingredient-form',
  templateUrl: './ingredient-form.component.html',
  styleUrls: ['./ingredient-form.component.scss']
})
export class IngredientFormComponent implements OnInit {
  @Input() boilTime: number;
  @Input() ingredientType: string;
  @Input() ingredientLibrary: Ingredient[];
  @Input() update: GrainBill | HopsSchedule | YeastBatch | OtherIngredients;
  @ViewChild('form') formRef: GrainFormComponent | HopsFormComponent | OtherIngredientsFormComponent | YeastFormComponent;
  formType: string;
  onBackClick: () => void;
  ouncesPerPound: number = 16;
  ingredientOptions: FormSelectOption[] = [];
  isFormValid: boolean = false;
  title: string = '';
  units: SelectedUnits = null;

  constructor(
    public modalCtrl: ModalController,
    public preferenceService: PreferencesService,
    public utilService: UtilityService
  ) {
    this.onBackClick = this.dismiss.bind(this);
  }

  /***** Lifecycle Hooks *****/

  ngOnInit(): void {
    this.title = this.utilService.toTitleCase(this.ingredientType);
    this.units = this.preferenceService.getSelectedUnits();
    this.buildFormSelectOptions();
    this.formType = this.update ? 'update' : 'create';
    if (this.update) {
      this.setFormValidity(true);
    }
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
   * Call modal controller dismiss method
   *
   * @param: none
   * @return: none
   */
  dismiss(): void {
    this.modalCtrl.dismiss();
  }

  /**
   * Dismiss with flag to delete the ingredient
   *
   * @param: none
   * @return: none
   */
  onDeletion(): void {
    this.modalCtrl.dismiss({ delete: true });
  }

  /**
   * Format form data for result and dismiss with data
   *
   * @param: none
   * @return: none
   */
  onSubmit(): void {
    this.modalCtrl.dismiss(this.formRef.getFormResult());
  }

  /**
   * Update form valid flag
   *
   * @param: isValid - true if form is currently valid
   * @return: none
   */
  setFormValidity(isValid: boolean): void {
    this.isFormValid = isValid;
  }

  /***** End Form Methods *****/

}
