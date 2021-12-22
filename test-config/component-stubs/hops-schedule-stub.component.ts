/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Interface imports */
import { HopsSchedule, RecipeVariant } from '../../src/app/shared/interfaces';

/* Component imports */
import { HopsScheduleComponent } from '../../src/app/components/ingredient/private/hops-schedule/hops-schedule.component';

@Component({
  selector: 'app-hops-schedule',
  template: '',
  providers: [
    { provide: HopsScheduleComponent, useClass: HopsScheduleComponentStub }
  ]
})
export class HopsScheduleComponentStub {
  @Input() refresh: boolean;
  @Input() variant: RecipeVariant;
  @Output() openIngredientFormEvent: EventEmitter<HopsSchedule> = new EventEmitter<HopsSchedule>();
  hopsSchedule: HopsSchedule[] = [];
  ibus: string[] = [];
}
