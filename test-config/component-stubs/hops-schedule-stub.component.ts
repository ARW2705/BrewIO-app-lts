/* Module imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { HopsSchedule } from '../../src/app/shared/interfaces/hops-schedule';
import { RecipeVariant } from '../../src/app/shared/interfaces/recipe-variant';
/* Component imports */
import { HopsScheduleComponent } from '../../src/app/components/hops-schedule/hops-schedule.component';

@Component({
  selector: 'hops-schedule',
  template: '',
  providers: [
    { provide: HopsScheduleComponent, useClass: HopsScheduleComponentStub }
  ]
})
export class HopsScheduleComponentStub {
  @Input() onRecipeAction: (actionName: string, options?: any[]) => void;
  @Input() refreshPipes: boolean;
  @Input() variant: RecipeVariant;
  hopsSchedule: HopsSchedule[] = [];
}
