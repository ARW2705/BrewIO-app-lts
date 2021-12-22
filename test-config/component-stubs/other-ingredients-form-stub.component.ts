/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';

/* Interface imports */
import { OtherIngredients, SelectedUnits } from '../../src/app/shared/interfaces';

/* Component imports */
import { OtherIngredientsFormComponent } from '../../src/app/components/ingredient/private/other-ingredients-form/other-ingredients-form.component';

@Component({
  selector: 'app-other-ingredients-form',
  template: '',
  providers: [
    { provide: OtherIngredientsFormComponent, useClass: OtherIngredientsFormComponentStub }
  ]
})
export class OtherIngredientsFormComponentStub {
  @Input() units: SelectedUnits;
  @Input() update: OtherIngredients;
  @Output() formStatusEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  destroy$: Subject<boolean> = new Subject<boolean>();
  otherIngredientsForm: FormGroup;
}
