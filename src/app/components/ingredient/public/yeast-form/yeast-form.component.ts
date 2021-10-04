/* Module imports */
import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/* Interface imports */
import { FormSelectOption, SelectedUnits, YeastBatch } from '../../../../shared/interfaces';

/* Service imports */
import { UtilityService } from '../../../../services/services';


@Component({
  selector: 'app-yeast-form',
  templateUrl: './yeast-form.component.html',
  styleUrls: ['./yeast-form.component.scss'],
})
export class YeastFormComponent implements AfterViewInit, OnDestroy, OnInit {
  @Input() yeastFormOptions: FormSelectOption[];
  @Input() units: SelectedUnits;
  @Input() update: YeastBatch;
  @Output() formStatusEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  destroy$: Subject<boolean> = new Subject<boolean>();
  compareWithFn: (o1: any, o2: any) => boolean;
  // formType: string;
  yeastForm: FormGroup;

  constructor(
    public formBuilder: FormBuilder,
    public utilService: UtilityService
  ) {
    this.compareWithFn = this.utilService.compareWith.bind(this);
  }

  /***** Lifecycle Hooks *****/

  ngOnInit(): void {
    // this.formType = this.update ? 'update' : 'create';
    this.initForm();
  }

  ngAfterViewInit(): void {
    this.yeastForm.statusChanges
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
    this.yeastForm.controls.quantity.setValue((<YeastBatch>this.update).quantity);
    this.yeastForm.controls.requiresStarter.setValue((<YeastBatch>this.update).requiresStarter);
    this.yeastForm.controls.type.setValue((<YeastBatch>this.update).yeastType);
  }

  /**
   * Format a form values for yeast ingredient
   *
   * @params: none
   * @return: formatted form values object
   */
  getFormResult(): object {
    const formValues: object = this.yeastForm.value;
    return {
      quantity       : formValues['quantity'] || 0,
      requiresStarter: formValues['requiresStarter'],
      yeastType      : formValues['type']
    };
  }

  /**
   * Initialize the form
   *
   * @params: none
   * @return: none
   */
  initForm(): void {
    this.yeastForm = this.formBuilder.group({
      quantity       : [null, [Validators.min(1), Validators.required]],
      requiresStarter: false,
      type           : [''  , [Validators.required]                   ]
    });

    if (this.update) {
      this.assignFormValues();
    }
  }

}
