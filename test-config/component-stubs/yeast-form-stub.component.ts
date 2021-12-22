/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';

/* Interface imports */
import { FormSelectOption, SelectedUnits, YeastBatch } from '../../src/app/shared/interfaces';

/* Component imports */
import { YeastFormComponent } from '../../src/app/components/ingredient/private/yeast-form/yeast-form.component';

@Component({
  selector: 'app-yeast-form',
  template: '',
  providers: [
    { provide: YeastFormComponent, useClass: YeastFormComponentStub }
  ]
})
export class YeastFormComponentStub {
  @Input() yeastFormOptions: FormSelectOption[];
  @Input() units: SelectedUnits;
  @Input() update: YeastBatch;
  @Output() formStatusEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  destroy$: Subject<boolean> = new Subject<boolean>();
  compareWithFn: (o1: any, o2: any) => boolean;
  yeastForm: FormGroup;
}
