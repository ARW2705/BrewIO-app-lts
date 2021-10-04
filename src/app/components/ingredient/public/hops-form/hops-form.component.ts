/* Module imports */
import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/* Interface imports */
import { FormSelectOption, HopsSchedule, SelectedUnits } from '../../../../shared/interfaces';

/* Service imports */
import { CalculationsService, FormValidationService, UtilityService } from '../../../../services/services';


@Component({
  selector: 'app-hops-form',
  templateUrl: './hops-form.component.html',
  styleUrls: ['./hops-form.component.scss'],
})
export class HopsFormComponent implements AfterViewInit, OnDestroy, OnInit {
  @Input() boilTime: number;
  @Input() hopsFormOptions: FormSelectOption[];
  @Input() units: SelectedUnits;
  @Input() update: HopsSchedule;
  @Output() formStatusEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  destroy$: Subject<boolean> = new Subject<boolean>();
  compareWithFn: (o1: any, o2: any) => boolean;
  hopsForm: FormGroup;
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
    this.hopsForm.statusChanges
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
    if (this.calculator.requiresConversion('weightSmall', this.units)) {
      quantity = this.calculator.convertWeight(quantity, false, false);
    }

    this.hopsForm.controls.quantity.setValue(
      this.utilService.roundToDecimalPlace(quantity, this.quantityRoundToPlaces)
    );
    this.hopsForm.controls.type.setValue((<HopsSchedule>this.update).hopsType);
    this.hopsForm.controls.duration.setValue((<HopsSchedule>this.update).duration);
    this.hopsForm.controls.dryHop.setValue((<HopsSchedule>this.update).dryHop);
  }

  /**
   * Format a form values for hops ingredient
   *
   * @params: none
   * @return: formatted form values object
   */
  getFormResult(): object {
    const formValues: object = this.hopsForm.value;
    let quantity: number = formValues['quantity'] || 0;
    if (this.requiresConversionSmall) {
      quantity = this.calculator.convertWeight(quantity, false, true);
    }

    return {
      quantity,
      dryHop  : formValues['dryHop'],
      duration: formValues['duration'] || 0,
      hopsType: formValues['type']
    };
  }

  /**
   * Initialize the form
   *
   * @params: none
   * @return: none
   */
  initForm(): void {
    const sixtyMinutes: number = 60;
    const maxDuration: number = this.boilTime || sixtyMinutes;
    this.hopsForm = this.formBuilder.group({
      dryHop  : false,
      duration: [null, [Validators.required, Validators.min(0), Validators.max(maxDuration)]],
      quantity: [null, [Validators.required, Validators.min(0)]                             ],
      type    : [''  , [Validators.required]                                                ]
    });

    if (this.update) {
      this.assignFormValues();
    }
  }

  /**
   * Set duration validators based on whether the hops instance is marked as dry hop or not
   *
   * @params: dryHop - ion-toggle event
   * @return: none
   */
  onDryHopChange(dryHop: CustomEvent): void {
    if (dryHop.detail.checked) {
      this.hopsForm.get('duration').clearValidators();
    } else {
      this.hopsForm.get('duration').setValidators(
        [ Validators.required, Validators.min(0), Validators.max(this.boilTime) ]
      );
    }
    this.hopsForm.get('duration').updateValueAndValidity();
  }

}
