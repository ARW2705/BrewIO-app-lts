/* Module imports */
import { Component, Input, ViewChild } from '@angular/core';

/* Interface imports */
import { FormSelectOption, GrainBill, HopsSchedule, Ingredient, OtherIngredients, SelectedUnits, YeastBatch } from '../../src/app/shared/interfaces';

/* Component imports */
import { IngredientFormComponent } from '../../src/app/components/ingredient/public/ingredient-form/ingredient-form.component';
import { GrainFormComponentStub as GrainFormComponent } from './grain-form-stub.component';
import { HopsFormComponentStub as HopsFormComponent } from './hops-form-stub.component';
import { OtherIngredientsFormComponentStub as OtherIngredientsFormComponent } from './other-ingredients-form-stub.component';
import { YeastFormComponentStub as YeastFormComponent } from './yeast-form-stub.component';


@Component({
  selector: 'app-ingredient-form',
  template: '',
  providers: [
    { provide: IngredientFormComponent, useClass: IngredientFormComponentStub }
  ]
})
export class IngredientFormComponentStub {
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
}
