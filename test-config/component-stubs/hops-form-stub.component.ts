/* Module imports */
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';

/* Interface imports */
import { FormSelectOption, HopsSchedule, SelectedUnits } from '../../src/app/shared/interfaces';

/* Component imports */
import { HopsFormComponent } from '../../src/app/components/ingredient/private/hops-form/hops-form.component';

@Component({
  selector: 'app-hops-form',
  template: '',
  providers: [
    { provide: HopsFormComponent, useClass: HopsFormComponentStub }
  ]
})
export class HopsFormComponentStub {
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
}
