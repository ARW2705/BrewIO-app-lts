/* Module imports */
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';

/* Interface imports */
import { FormSelectOption, GrainBill, SelectedUnits } from '../../src/app/shared/interfaces';

/* Stub imports */
import { FormInputComponentStub as FormInputComponent } from './form-input-stub.component';

/* Component imports */
import { GrainFormComponent } from '../../src/app/components/ingredient/private/grain-form/grain-form.component';

@Component({
  selector: 'app-grain-form',
  template: '',
  providers: [
    { provide: GrainFormComponent, useClass: GrainFormComponentStub }
  ]
})
export class GrainFormComponentStub {
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
}
