/* Module imports */
import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/* Constant imports */
import { DESCRIPTION_MAX_LENGTH, NAME_MAX_LENGTH, NAME_MIN_LENGTH, UNIT_NAME_MAX_LENGTH } from '../../../../shared/constants';

/* Interface imports */
import { OtherIngredients, SelectedUnits } from '../../../../shared/interfaces';


@Component({
  selector: 'app-other-ingredients-form',
  templateUrl: './other-ingredients-form.component.html',
  styleUrls: ['./other-ingredients-form.component.scss'],
})
export class OtherIngredientsFormComponent implements AfterViewInit, OnDestroy, OnInit {
  @Input() units: SelectedUnits;
  @Input() update: OtherIngredients;
  @Output() formStatusEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  destroy$: Subject<boolean> = new Subject<boolean>();
  otherIngredientsForm: FormGroup;

  constructor(public formBuilder: FormBuilder) { }

  /***** Lifecycle Hooks *****/

  ngOnInit(): void {
    this.initForm();
  }

  ngAfterViewInit(): void {
    this.otherIngredientsForm.statusChanges
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
    for (const key in this.update) {
      if (this.otherIngredientsForm.controls[key]) {
        this.otherIngredientsForm.controls[key].setValue(this.update[key]);
      }
    }
  }

  /**
   * Format a form values for other ingredients
   *
   * @params: none
   * @return: formatted form values object
   */
  getFormResult(): object {
    const formValues: object = this.otherIngredientsForm.value;
    return {
      description: formValues['description'],
      name       : formValues['name'],
      quantity   : formValues['quantity'] || 0,
      type       : formValues['type'],
      units      : formValues['units']
    };
  }

  /**
   * Initialize the form
   *
   * @params: none
   * @return: none
   */
  initForm(): void {
    this.otherIngredientsForm = this.formBuilder.group({
      description: [''  , [Validators.maxLength(DESCRIPTION_MAX_LENGTH), Validators.required]                                ],
      name       : [''  , [Validators.minLength(NAME_MIN_LENGTH), Validators.maxLength(NAME_MAX_LENGTH), Validators.required]],
      quantity   : [null, [Validators.required, Validators.min(0)]                                                                              ],
      type       : [''  , [Validators.maxLength(NAME_MAX_LENGTH), Validators.required]                                       ],
      units      : [''  , [Validators.maxLength(UNIT_NAME_MAX_LENGTH), Validators.required]                                  ]
    });

    if (this.update) {
      this.assignFormValues();
    }
  }

}
