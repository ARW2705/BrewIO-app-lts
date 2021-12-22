/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Interface imports */
import { HopsSchedule } from '../../src/app/shared/interfaces';

/* Component imports */
import { HopsScheduleItemComponent } from '../../src/app/components/ingredient/private/hops-schedule-item/hops-schedule-item.component';

@Component({
  selector: 'app-hops-schedule-item',
  template: '',
  providers: [
    { provide: HopsScheduleItemComponent, useClass: HopsScheduleItemComponentStub }
  ]
})
export class HopsScheduleItemComponentStub {
  @Input() hops: HopsSchedule;
  @Input() ibu: string;
  @Input() isLast: boolean;
  @Output() openIngredientFormButtonEvent: EventEmitter<null> = new EventEmitter<null>();
}
